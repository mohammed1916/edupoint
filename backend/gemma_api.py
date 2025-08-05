from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Response, Cookie, status
from auth_utils import verify_google_id_token
import os
import requests
import json
import firebase_admin
from firebase_admin import credentials, auth

GEMINI_API_URL = os.environ.get("GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma3n-e4b-q4")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_COOKIE_NAME = "session"
cred = credentials.Certificate("edupoint-b1bf5-b530d165b8dd.json")
firebase_admin.initialize_app(cred)
SESSION_EXPIRE_SECONDS = 60 * 60 * 24 * 5  # 5 days

# Gemini API endpoint
@app.post("/api/gemini")
async def gemini_infer(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    prompt = "\n".join(
        c["text"] for m in messages for c in m.get("content", []) if c["type"] == "text"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    resp = requests.post(url, json=payload, headers=headers)
    try:
        result = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        result = resp.text
    return {"result": result}

# Ollama API endpoint
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
        resp = requests.post(OLLAMA_URL, json=payload)
        resp.raise_for_status()
        return {"result": resp.json()["response"]}
    except Exception as e:
        return {"result": f"Ollama error: {str(e)}"}

# --- External API Endpoints ---

@app.get("/api/hotels")
async def get_hotels(location: str, checkin: str, checkout: str, guests: int = 1):
    # Example: Booking.com API via RapidAPI
    api_key = os.environ.get("BOOKING_API_KEY", "")
    url = "https://booking-com.p.rapidapi.com/v1/hotels/search"
    headers = {
        "X-RapidAPI-Key": api_key,
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
        resp = requests.get(url, headers=headers, params=params)
        return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/flights")
async def get_flights(origin: str, destination: str, date: str):
    # Example: Skyscanner API via RapidAPI
    api_key = os.environ.get("SKYSCANNER_API_KEY", "")
    url = "https://skyscanner44.p.rapidapi.com/search"
    headers = {
        "X-RapidAPI-Key": api_key,
        "X-RapidAPI-Host": "skyscanner44.p.rapidapi.com"
    }
    params = {
        "origin": origin,
        "destination": destination,
        "date": date
    }
    try:
        resp = requests.get(url, headers=headers, params=params)
        return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/weather")
async def get_weather(city: str):
    api_key = os.environ.get("OPENWEATHERMAP_API_KEY", "")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    try:
        resp = requests.get(url)
        return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/currency")
async def get_currency(base: str = "USD", symbols: str = "INR"):  # e.g. base=USD&symbols=INR,EUR
    url = f"https://api.exchangerate.host/latest?base={base}&symbols={symbols}"
    try:
        resp = requests.get(url)
        return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/events")
async def get_events(city: str):
    api_key = os.environ.get("EVENTBRITE_API_KEY", "")
    url = f"https://www.eventbriteapi.com/v3/events/search/?location.address={city}"
    headers = {"Authorization": f"Bearer {api_key}"}
    try:
        resp = requests.get(url, headers=headers)
        return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/attractions")
async def get_attractions(location: str):
    api_key = os.environ.get("TRIPADVISOR_API_KEY", "")
    url = "https://tripadvisor16.p.rapidapi.com/api/v1/attractions/searchAttractions"
    headers = {
        "X-RapidAPI-Key": api_key,
        "X-RapidAPI-Host": "tripadvisor16.p.rapidapi.com"
    }
    params = {"query": location}
    try:
        resp = requests.get(url, headers=headers, params=params)
        return JSONResponse(content=resp.json())
    except Exception as e:
        return {"error": str(e)}

# Authentication endpoints

@app.post("/auth/google")
async def google_auth(request: Request, response: Response):
    data = await request.json()
    id_token = data.get("idToken")
    print(f"[BACKEND] /auth/google called. idToken received: {bool(id_token)}")
    if not id_token:
        print("[BACKEND] /auth/google error: Missing idToken")
        return JSONResponse(status_code=400, content={"error": "Missing idToken"})
    try:
        decoded_token = auth.verify_id_token(id_token)
        print(f"[BACKEND] /auth/google: User signed in: {decoded_token.get('email')}")
        session_cookie = auth.create_session_cookie(id_token, expires_in=SESSION_EXPIRE_SECONDS)
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_cookie,
            max_age=SESSION_EXPIRE_SECONDS,
            httponly=True,
            secure=True,
            samesite="lax"
        )
        return {"name": decoded_token.get("name"), "picture": decoded_token.get("picture")}
    except Exception as e:
        print(f"[BACKEND] /auth/google error: {str(e)}")
        return JSONResponse(status_code=401, content={"error": str(e)})

@app.get("/auth/profile")
async def get_profile(session: str = Cookie(default=None, alias=SESSION_COOKIE_NAME)):
    print(f"[BACKEND] /auth/profile called. Session cookie present: {bool(session)}")
    if not session:
        print("[BACKEND] /auth/profile error: Not authenticated")
        return JSONResponse(status_code=401, content={"error": "Not authenticated"})
    try:
        decoded_claims = auth.verify_session_cookie(session, check_revoked=True)
        print(f"[BACKEND] /auth/profile: User profile accessed: {decoded_claims.get('email')}")
        return {"name": decoded_claims.get("name"), "picture": decoded_claims.get("picture")}
    except Exception as e:
        print(f"[BACKEND] /auth/profile error: {str(e)}")
        return JSONResponse(status_code=400, content={"error": "Invalid session"})

@app.post("/auth/signout")
async def signout(response: Response):
    print("[BACKEND] /auth/signout called. User signed out.")
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/", samesite="lax")
    return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "Signed out"})
