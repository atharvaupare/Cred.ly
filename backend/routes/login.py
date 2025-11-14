from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_collection
import bcrypt, jwt
from datetime import datetime

# --- Hardcoded JWT for now ---
JWT_SECRET = "supersecretkey123456"
JWT_ALGO = "HS256"

router = APIRouter(tags=["Login"])


class LoginRequest(BaseModel):
    mobile_number: str
    password: str


def create_login_token(mobile_number: str):
    payload = {
        "sub": mobile_number,
        "iat": datetime.utcnow(),
        # no expiry
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


@router.post("/auth/login")
def login_user(payload: LoginRequest):

    coll = get_collection()
    user = coll.find_one({"mobile_number": payload.mobile_number})

    # 404 — user does not exist
    if not user:
        raise HTTPException(status_code=404, detail="Mobile number not registered")

    hashed_pw = user.get("password")

    # 400 — password not set
    if not hashed_pw:
        raise HTTPException(status_code=400, detail="User has no password set")

    # 401 — wrong password
    if not bcrypt.checkpw(payload.password.encode(), hashed_pw.encode()):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_login_token(payload.mobile_number)

    return {
        "status": "OK",
        "message": "Login successful",
        "mobile_number": payload.mobile_number,
        "token": token,
    }
