from fastapi import HTTPException
from db import get_collection
import bcrypt, jwt
from datetime import datetime
import os

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "supersecretkey123456")
JWT_ALGO = os.getenv("JWT_ALGORITHM", "HS256")


def create_login_token(mobile_number: str):
    payload = {
        "sub": mobile_number,
        "iat": datetime.utcnow(),
        # ❌ no exp field
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def login_user_logic(mobile_number: str, password: str):
    coll = get_collection()

    # 1️⃣ Fetch user by mobile
    user = coll.find_one({"mobile_number": mobile_number})
    if not user:
        raise HTTPException(status_code=404, detail="Mobile number not registered")

    hashed_pw = user.get("password")
    if not hashed_pw:
        raise HTTPException(status_code=400, detail="User has no password set")

    # 2️⃣ Verify password with bcrypt
    if not bcrypt.checkpw(password.encode("utf-8"), hashed_pw.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # 3️⃣ Create JWT token
    token = create_login_token(mobile_number)

    # 4️⃣ Success response
    return {
        "token": token,
        "mobile_number": mobile_number,
        "message": "Login successful",
        "status": "OK"
    }
