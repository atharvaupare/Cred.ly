# routes/onboard.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any, Dict
import requests
from db import get_collection

router = APIRouter(prefix="/onboard", tags=["onboard"])

class OnboardReq(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15)  # e.g., "9991112222"
    income_monthly: float = Field(..., gt=0)

# ---- limit policy (compact version) ----
def recommend_limit(features: Dict[str, Any], income_monthly: float, predicted_score: float) -> int:
    s = predicted_score

    # Base multiplier by score band (more generous)
    if s < 600:
        multiple, cap = 1.0,  50_000      # risk-very high → low base
    elif s < 650:
        multiple, cap = 1.5, 100_000
    elif s < 700:
        multiple, cap = 2.0, 200_000
    elif s < 750:
        multiple, cap = 3.0, 300_000
    elif s < 800:
        multiple, cap = 4.0, 400_000
    else:
        multiple, cap = 5.0, 600_000      # exceptional profile

    base = min(multiple * income_monthly, cap)

    # Risk adjustments (same as you had)
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

    # Round to nearest ₹1,000
    return int(round(candidate / 1000.0) * 1000)


@router.post("", summary="Bootstrap a user: predict score, compute limit & balance, update Mongo")
def onboard_user(req: OnboardReq):
    coll = get_collection()

    # 1) fetch bureau doc by mobile_number
    doc = coll.find_one({"mobile_number": req.mobile_number})
    if not doc:
        raise HTTPException(status_code=404, detail="Mobile not found")

    features = doc.get("features") or {}
    if not features:
        raise HTTPException(status_code=422, detail="No features present for this user")

    # 2) call local scoring API with features
    try:
        resp = requests.post(
            "http://localhost:8000/api/credit/score",
            json=features,
            timeout=5,
        )
        resp.raise_for_status()
        score_payload = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Scoring service error: {e}")

    score = score_payload.get("score")
    if score is None:
        raise HTTPException(status_code=502, detail="Scoring response missing 'score'")

    # 3) compute credit limit & balance
    limit = recommend_limit(features, req.income_monthly, float(score))
    cc_util = float(features.get("CC_utilization", 0.0))
    balance = round(limit * cc_util, 2)

    # 4) update Mongo record (score, limit, balance, and store income)
    update_fields = {
        "score": float(score),
        "credit_limit": limit,
        "credit_balance": balance,
        "income_monthly": req.income_monthly
    }
    coll.update_one({"_id": doc["_id"]}, {"$set": update_fields})

    # 5) return a compact summary
    return {
        "mobile_number": req.mobile_number,
        "score": score,
        "credit_limit": limit,
        "credit_balance": balance,
        "cc_utilization": cc_util,
        "message": "Bootstrap complete: score computed and record updated."
    }
