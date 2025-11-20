from fastapi import HTTPException
from typing import Any, Dict
import requests, bcrypt, jwt, os
from datetime import datetime
from db import get_collection

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "supersecretkey123456")
JWT_ALGO = os.getenv("JWT_ALGORITHM", "HS256")

# ---- Credit Limit Policy ----
def recommend_limit(features: Dict[str, Any], income_monthly: float, predicted_score: float) -> int:
    s = predicted_score
    if s < 600:
        multiple, cap = 1.0, 50_000
    elif s < 650:
        multiple, cap = 1.5, 100_000
    elif s < 700:
        multiple, cap = 2.0, 200_000
    elif s < 750:
        multiple, cap = 3.0, 300_000
    elif s < 800:
        multiple, cap = 4.0, 400_000
    else:
        multiple, cap = 5.0, 600_000
    base = min(multiple * income_monthly, cap)

    f = 1.0
    if features.get("num_times_60p_dpd", 0) > 0:
        f *= 0.6
    elif features.get("num_times_30p_dpd", 0) > 0:
        f *= 0.75
    elif features.get("num_times_delinquent", 0) > 0:
        f *= 0.85
    if features.get("enq_L3m", 0) >= 2:
        f *= 0.8
    elif features.get("enq_L6m", 0) >= 3 or features.get("enq_L12m", 0) >= 5:
        f *= 0.85
    if features.get("max_unsec_exposure_inPct", 0) > 0.50:
        f *= 0.8
    elif features.get("max_unsec_exposure_inPct", 0) > 0.35:
        f *= 0.9
    if features.get("pct_currentBal_all_TL", 0) > 0.60:
        f *= 0.85
    elif features.get("pct_currentBal_all_TL", 0) > 0.40:
        f *= 0.9
    f = max(0.5, min(f, 1.2))
    candidate = base * f
    return int(round(candidate / 1000.0) * 1000)

# ---- JWT helper ----
def create_jwt_token(mobile_number: str) -> str:
    payload = {
        "sub": mobile_number,
        "iat": datetime.utcnow()
        # "exp": datetime.utcnow() + timedelta(days=1)  # expires in 24h
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

# ---- Main onboarding logic ----
def onboard_user_logic(mobile_number: str, income_monthly: float, password: str) -> Dict[str, Any]:
    coll = get_collection()

    # 1️⃣ Fetch record
    doc = coll.find_one({"mobile_number": mobile_number})
    if not doc:
        raise HTTPException(status_code=404, detail="Mobile not found")

    features = doc.get("features") or {}
    if not features:
        raise HTTPException(status_code=422, detail="No features present for this user")

    # 2️⃣ Call local scoring API
    try:
        resp = requests.post(
            "http://localhost:8000/api/credit/score",
            json=features,
            timeout=10,
        )
        resp.raise_for_status()
        score_payload = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Scoring service error: {e}")

    score = score_payload.get("score")
    if score is None:
        raise HTTPException(status_code=502, detail="Scoring response missing 'score'")

    # 3️⃣ Compute limit & balance
    limit = recommend_limit(features, income_monthly, float(score))
    cc_util = float(features.get("CC_utilization", 0.0))
    balance = round(limit * cc_util, 2)

    # 4️⃣ Secure password with bcrypt
    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # 5️⃣ Update Mongo record
    update_fields = {
        "score": float(score),
        "credit_limit": limit,
        "credit_balance": balance,
        "income_monthly": income_monthly,
        "password": hashed_pw
    }
    coll.update_one({"_id": doc["_id"]}, {"$set": update_fields})

    # 6️⃣ Generate JWT token
    token = create_jwt_token(mobile_number)

    # 7️⃣ Response
    return {
        "mobile_number": mobile_number,
        "score": score,
        "credit_limit": limit,
        "credit_balance": balance,
        "cc_utilization": cc_util,
        "token": token,
        "message": "User onboarded successfully. Password secured and JWT issued."
    }
