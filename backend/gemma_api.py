from fastapi import FastAPI, Request, Response, Cookie, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth
import os
import httpx
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import NearestNeighbors
import numpy as np
import logging
import re
from langchain.agents import initialize_agent, Tool
from langchain_community.llms import OpenAI
from langchain_ollama.llms import OllamaLLM
from langchain.agents import AgentType
import datetime

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_COOKIE_NAME = "session"
SESSION_EXPIRE_SECONDS = 60 * 60 * 24 * 5  # 5 days
DEV_MODE = os.getenv("DEV", "true").lower() == "true"
SECURE_COOKIE = not DEV_MODE

if os.path.exists("edupoint-b1bf5-b530d165b8dd.json"):
    cred = credentials.Certificate("edupoint-b1bf5-b530d165b8dd.json")
    firebase_admin.initialize_app(cred)
else:
    firebase_admin.initialize_app()

GEMINI_API_URL = os.getenv("GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("edupoint")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/gemini")
async def gemini_infer(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    prompt = "\n".join(
        c["text"] for m in messages for c in m.get("content", []) if c["type"] == "text"
    )
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {"Content-Type": "application/json"}
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers)
            result = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            return {"result": result}
    except Exception as e:
        return {"result": f"Gemini error: {str(e)}"}


# --- RAG Vector Store (in-memory, for demo) ---
RAG_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
RAG_CHUNKS = []  # List of (text, embedding)
RAG_TEXTS = []   # List of text chunks
RAG_EMBEDDINGS = None  # np.array of embeddings
RAG_NN = None    # NearestNeighbors index

# Helper: chunk text (simple, can be improved)
def chunk_texts(texts, chunk_size=300):
    chunks = []
    for t in texts:
        for i in range(0, len(t), chunk_size):
            chunks.append(t[i:i+chunk_size])
    return chunks

@app.post("/api/rag/upload")
async def rag_upload(request: Request):
    logger.info("Received request to /api/rag/upload")
    try:
        data = await request.json()
        logger.debug(f"Request JSON: {data}")
    except Exception as e:
        logger.error(f"Failed to parse JSON body: {e}")
        return {"status": "error", "message": "Invalid JSON"}
    texts = data.get("texts", [])
    logger.info(f"Uploading {len(texts)} texts to RAG vector store.")
    if not isinstance(texts, list):
        logger.error(f"'texts' is not a list: {type(texts)}")
        return {"status": "error", "message": "'texts' must be a list of strings."}
    if not all(isinstance(t, str) for t in texts):
        logger.error("Not all items in 'texts' are strings.")
        return {"status": "error", "message": "All items in 'texts' must be strings."}
    global RAG_CHUNKS, RAG_TEXTS, RAG_EMBEDDINGS, RAG_NN
    try:
        RAG_TEXTS = chunk_texts(texts)
        logger.info(f"Chunked texts into {len(RAG_TEXTS)} chunks.")
        RAG_EMBEDDINGS = RAG_MODEL.encode(RAG_TEXTS)
        logger.info(f"Generated embeddings for {len(RAG_TEXTS)} chunks.")
        RAG_NN = NearestNeighbors(n_neighbors=5, metric='cosine').fit(RAG_EMBEDDINGS)
        logger.info("NearestNeighbors index built successfully.")
        return {"status": "ok", "chunks": len(RAG_TEXTS)}
    except Exception as e:
        logger.error(f"Error during RAG upload processing: {e}")
        return {"status": "error", "message": str(e)}

# Helper: retrieve top-k relevant chunks
def retrieve_context(query, k=5):
    if RAG_EMBEDDINGS is None or RAG_NN is None or not RAG_TEXTS:
        return ""
    q_emb = RAG_MODEL.encode([query])
    dists, idxs = RAG_NN.kneighbors(q_emb, n_neighbors=min(k, len(RAG_TEXTS)))
    return "\n".join([RAG_TEXTS[i] for i in idxs[0]])


@app.post("/api/ollama")
async def ollama_infer(request: Request):
    logger.info("Received request to /api/ollama")
    data = await request.json()
    messages = data.get("messages", [])
    prompt = "\n".join(
        c["text"] for m in messages for c in m.get("content", []) if c["type"] == "text"
    )
    logger.debug(f"Prompt before RAG: {prompt}")
    logger.debug(f"RAG_TEXTS length: {len(RAG_TEXTS) if RAG_TEXTS else 0}")
    # --- RAG: retrieve relevant context ---
    rag_context = retrieve_context(prompt, k=len(RAG_TEXTS) if RAG_TEXTS else 5)
    logger.debug(f"RAG context retrieved: {rag_context[:100]}... (length: {len(rag_context)})")
    if rag_context:
        logger.info("RAG context found for prompt. Including in Ollama request.")
        prompt = f"Relevant info:\n{rag_context}\n\nUser: {prompt}"
    else:
        logger.info("No RAG context found for prompt.")
    logger.debug(f"Final prompt sent to Ollama: {prompt}")
    
    # --- LangChain agent tool-use ---
    try:
        agent_result = agent.run(prompt)
        return {"result": agent_result}
    except Exception as e:
        logger.error(f"LangChain agent error: {str(e)}")
        # fallback to Ollama if agent fails
        pass
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }
    logger.debug(f"Payload to Ollama: {payload}")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(OLLAMA_URL, json=payload)
            logger.debug(f"Ollama raw response: {resp.text}")
            ollama_json = resp.json()
            result = ollama_json.get("response") or ollama_json.get("result") or str(ollama_json)
            logger.info("Ollama response received successfully.")
            return {"result": result}
    except Exception as e:
        logger.error(f"Ollama error: {str(e)}")
        return {"result": f"Ollama error: {str(e)}"}


# External APIs

@app.get("/api/hotels")
async def get_hotels(location: str, checkin: str, checkout: str, guests: int = 1):
    headers = {
        "X-RapidAPI-Key": os.getenv("BOOKING_API_KEY", ""),
        "X-RapidAPI-Host": "booking-com.p.rapidapi.com"
    }
    params = {
        "dest_id": location,
        "dest_type": "city",
        "checkin_date": checkin,
        "checkout_date": checkout,
        "adults_number": guests,
        "order_by": "popularity"
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://booking-com.p.rapidapi.com/v1/hotels/search", headers=headers, params=params)
            return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/flights")
async def get_flights(origin: str, destination: str, date: str):
    headers = {
        "X-RapidAPI-Key": os.getenv("SKYSCANNER_API_KEY", ""),
        "X-RapidAPI-Host": "skyscanner44.p.rapidapi.com"
    }
    params = {"origin": origin, "destination": destination, "date": date}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://skyscanner44.p.rapidapi.com/search", headers=headers, params=params)
            return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/weather")
async def get_weather(city: str):
    api_key = os.getenv("OPENWEATHERMAP_API_KEY", "")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/currency")
async def get_currency(base: str = "USD", symbols: str = "INR"):
    url = f"https://api.exchangerate.host/latest?base={base}&symbols={symbols}"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/events")
async def get_events(city: str):
    headers = {"Authorization": f"Bearer {os.getenv('EVENTBRITE_API_KEY', '')}"}
    url = f"https://www.eventbriteapi.com/v3/events/search/?location.address={city}"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/attractions")
async def get_attractions(location: str):
    headers = {
        "X-RapidAPI-Key": os.getenv("TRIPADVISOR_API_KEY", ""),
        "X-RapidAPI-Host": "tripadvisor16.p.rapidapi.com"
    }
    params = {"query": location}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://tripadvisor16.p.rapidapi.com/api/v1/attractions/searchAttractions", headers=headers, params=params)
            return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}


# --- Auth Endpoints --- #

@app.post("/auth/google")
async def google_auth(request: Request, response: Response):
    data = await request.json()
    id_token = data.get("idToken")
    if not id_token:
        return JSONResponse(status_code=400, content={"error": "Missing idToken"})
    try:
        decoded_token = auth.verify_id_token(id_token)
        session_cookie = auth.create_session_cookie(id_token, expires_in=SESSION_EXPIRE_SECONDS)
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_cookie,
            max_age=SESSION_EXPIRE_SECONDS,
            httponly=True,
            secure=SECURE_COOKIE,
            samesite="lax" if DEV_MODE else "strict"
        )
        return {"name": decoded_token.get("name"), "picture": decoded_token.get("picture")}
    except Exception as e:
        return JSONResponse(status_code=401, content={"error": str(e)})


@app.get("/auth/profile")
async def get_profile(session: str = Cookie(default=None, alias=SESSION_COOKIE_NAME)):
    if not session:
        return JSONResponse(status_code=401, content={"error": "Not authenticated"})
    try:
        decoded_claims = auth.verify_session_cookie(session, check_revoked=True)
        return {"name": decoded_claims.get("name"), "picture": decoded_claims.get("picture")}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "Invalid session"})


@app.post("/auth/signout")
async def signout(request: Request, response: Response):
    session = request.cookies.get(SESSION_COOKIE_NAME)
    if session:
        try:
            decoded = auth.verify_session_cookie(session)
            auth.revoke_refresh_tokens(decoded["sub"])
        except Exception as e:
            print(f"Session revocation failed: {e}")
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/", samesite="strict")
    return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "Signed out"})



def get_current_date(_=None):
    """Returns today's date as a string."""
    return str(datetime.date.today())

# Register tools for the agent
tools = [
    Tool(
        name="get_current_date",
        func=get_current_date,
        description="Returns today's date as a string."
    ),
]

# Initialize LangChain agent (Gemma3/Ollama LLM)
llm = OllamaLLM(model="gemma3")
agent = initialize_agent(tools, llm, agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)
