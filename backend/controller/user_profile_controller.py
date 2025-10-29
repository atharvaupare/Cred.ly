# controller/user_profile_controller.py
import os
import jwt
from fastapi import HTTPException
from db import get_collection

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "supersecretkey123456")
JWT_ALGO = os.getenv("JWT_ALGORITHM", "HS256")

def decode_jwt_token(token: str) -> str:
    """
    Decodes a JWT and returns the mobile_number.
    Raises HTTPException if invalid or expired.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_user_profile_and_scenarios(token: str):
    """
    1️⃣ Decode JWT to get mobile_number
    2️⃣ Fetch user's main credit record from cred.ly
    3️⃣ Fetch user's scenarios array from scenarios collection
    4️⃣ Return combined JSON
    """
    # Decode the token
    mobile_number = decode_jwt_token(token)
    if not mobile_number:
        raise HTTPException(status_code=400, detail="Invalid token: no mobile number found")

    # Fetch user data
    main_coll = get_collection("cred.ly")
    user_doc = main_coll.find_one({"mobile_number": mobile_number}, {"_id": 0})

    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch scenarios
    scenarios_coll = get_collection("scenarios")
    scenarios_doc = scenarios_coll.find_one({"mobile_number": mobile_number}, {"_id": 0})

    scenarios = []
    if scenarios_doc and "scenarios" in scenarios_doc:
        scenarios = scenarios_doc["scenarios"]

    # Construct response
    return {
        "mobile_number": mobile_number,
        "user_profile": user_doc,
        "scenarios": scenarios
    }
