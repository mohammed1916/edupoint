from fastapi import FastAPI, Request, Response, Cookie, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth
import os
import httpx

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

cred = credentials.Certificate("edupoint-b1bf5-b530d165b8dd.json")
firebase_admin.initialize_app(cred)

GEMINI_API_URL = os.getenv("GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3")


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


@app.post("/api/ollama")
async def ollama_infer(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    prompt = "\n".join(
        c["text"] for m in messages for c in m.get("content", []) if c["type"] == "text"
    )
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(OLLAMA_URL, json=payload)
            ollama_json = resp.json()
            # Try common keys, fallback to full response
            result = ollama_json.get("response") or ollama_json.get("result") or str(ollama_json)
            return {"result": result}
    except Exception as e:
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
