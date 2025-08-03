import requests
from fastapi import HTTPException

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"

def verify_google_id_token(id_token: str):
    resp = requests.get(GOOGLE_TOKEN_INFO_URL, params={"id_token": id_token})
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")
    return resp.json()
