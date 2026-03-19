import os
import requests
from typing import Dict, Any

from fastapi import HTTPException
from ollama import chat
from pydantic import BaseModel, Field

from schema.advisor import TargetScoreAdviceResponse


PROFILE_URL = "http://localhost:8000/api/user/profile"
OLLAMA_MODEL = "llama3.1:8b"


class AdvisorLLMResponse(BaseModel):
    achievable: bool
    time_horizon: str
    summary: str
    key_actions: list[str]
    habits_to_avoid: list[str]
    utilization_target: str


def fetch_user_profile_from_api(bearer_token: str) -> Dict[str, Any]:
    headers = {
        "Authorization": bearer_token
    }

    response = requests.get(PROFILE_URL, headers=headers)

    print("\n📡 PROFILE API STATUS:", response.status_code)

    if response.status_code != 200:
        print("\n❌ PROFILE API ERROR:", response.text)
        raise HTTPException(status_code=response.status_code, detail="Unable to fetch user profile")

    data = response.json()

    print("\n✅ PROFILE API RESPONSE:")
    print(data)

    return data


def generate_target_score_advice(profile_data: Dict[str, Any], target_score: float) -> Dict[str, Any]:
    user_profile = profile_data["user_profile"]
    current_score = float(user_profile.get("score", 0))
    features = user_profile.get("features", {})
    income_monthly = user_profile.get("income_monthly", 0)
    credit_limit = user_profile.get("credit_limit", 0)
    credit_balance = user_profile.get("credit_balance", 0)

    prompt = f"""
You are an Indian credit advisor.

A user wants to improve their credit score.
Give practical, realistic steps in simple Indian English.

Current profile:
- Current score: {current_score}
- Target score: {target_score}
- Monthly income: ₹{income_monthly}
- Credit limit: {credit_limit}
- Credit balance: {credit_balance}

Credit features and meanings:
- time_since_recent_deliquency: days since last delinquency (higher = better)
- num_times_delinquent: number of past delinquencies (lower = better)
- max_delinquency_level: severity of worst delinquency (0 = best)
- num_times_30p_dpd: number of 30+ days past due
- num_times_60p_dpd: number of 60+ days past due
- enq_L3m, enq_L6m, enq_L12m: number of credit enquiries (lower = better)
- time_since_recent_enq: time since last enquiry (higher = better)
- CC_utilization: credit card utilization ratio (lower is better, ideally under 0.30)
- PL_utilization: personal loan utilization (lower = better)
- pct_currentBal_all_TL: total current balance ratio (lower = better)
- max_unsec_exposure_inPct: unsecured exposure ratio (lower = safer)
- CC_Flag: has credit card
- PL_Flag: has personal loan

Actual feature values:
{features}

Instructions:
- Be realistic.
- If target score is already achieved or nearly achieved, say so.
- Suggest concrete steps like lowering utilization, avoiding enquiries, paying on time, reducing unsecured exposure.
- Do not suggest illegal or misleading tricks.
- Keep summary short.
- key_actions should be specific and actionable.
- habits_to_avoid should be simple and clear.
- avoid words like cc_utilization in the advice - use "credit card utilization" instead. same for pl_utilization, use "personal loan utilization".

Return ONLY valid JSON with exactly:
- achievable (boolean)
- time_horizon (string)
- summary (string)
- key_actions (array of strings) (3 points max)
- habits_to_avoid (array of strings) (3 points max)
- utilization_target (string)
"""

    response = chat(
        model=OLLAMA_MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        format=AdvisorLLMResponse.model_json_schema(),
        options={"temperature": 0}
    )

    raw = response.message.content

    print("\n🔥 RAW TARGET SCORE ADVICE OUTPUT:")
    print(raw)

    parsed = AdvisorLLMResponse.model_validate_json(raw)

    print("\n✅ PARSED TARGET SCORE ADVICE:")
    print(parsed)

    return {
        "current_score": current_score,
        "target_score": target_score,
        "achievable": parsed.achievable,
        "time_horizon": parsed.time_horizon,
        "summary": parsed.summary,
        "key_actions": parsed.key_actions,
        "habits_to_avoid": parsed.habits_to_avoid,
        "utilization_target": parsed.utilization_target,
    }


def get_target_score_plan(bearer_token: str, target_score: float) -> TargetScoreAdviceResponse:
    profile_data = fetch_user_profile_from_api(bearer_token)
    advice = generate_target_score_advice(profile_data, target_score)
    return TargetScoreAdviceResponse(**advice)