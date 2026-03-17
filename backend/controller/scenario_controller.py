# import os
# import json
# from typing import Dict, Any
# from datetime import datetime
# from pathlib import Path


# from fastapi import HTTPException
# from openai import OpenAI
# from pydantic import BaseModel

# from controller.credit_controller import score_one
# from schema.credit import CreditRequest
# from db import get_collection

# # -------------------------------------------------------
# # Load environment variables
# # -------------------------------------------------------
# from dotenv import load_dotenv

# env_path = Path(__file__).resolve().parent.parent / ".env"
# load_dotenv(env_path)

# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# if not OPENAI_API_KEY:
#     raise RuntimeError("OPENAI_API_KEY is missing in .env")

# client = OpenAI(api_key=OPENAI_API_KEY)


# # -------------------------------------------------------
# # Scenario Toggle Function
# # -------------------------------------------------------
# def apply_scenario_toggles(
#     features: Dict[str, Any],
#     missed_payment: bool = False,
#     add_enquiry: bool = False
# ):
#     """
#     Adjusts numeric behavioural parameters in-memory depending on 
#     user-selected scenario toggles (missed payment or additional enquiry).
#     """
#     f = features.copy()

#     if missed_payment:
#         f["num_times_delinquent"] = f.get("num_times_delinquent", 0) + 1
#         f["num_times_30p_dpd"] = f.get("num_times_30p_dpd", 0) + 1
#         f["max_delinquency_level"] = max(f.get("max_delinquency_level", 0), 1)
#         f["time_since_recent_deliquency"] = 0
#         f["pct_currentBal_all_TL"] = min(f.get("pct_currentBal_all_TL", 0) + 0.05, 1.0)

#     if add_enquiry:
#         f["enq_L3m"] = f.get("enq_L3m", 0) + 1
#         f["enq_L6m"] = f.get("enq_L6m", 0) + 1
#         f["enq_L12m"] = f.get("enq_L12m", 0) + 1
#         f["time_since_recent_enq"] = 0

#     return f


# # -------------------------------------------------------
# # Pydantic Response Schema for Advice
# # -------------------------------------------------------
# class AdviceResponse(BaseModel):
#     why_change: str
#     do_dont: str
#     affordability: str


# # -------------------------------------------------------
# # OpenAI Advice Generator
# # -------------------------------------------------------
# def generate_advice(payload: Dict[str, Any]) -> Dict[str, str]:
#     """
#     Generates 3 educational, India-specific advice points:
#     - why the score changed
#     - good/bad habits
#     - affordability assessment
#     """

#     try:
#         response = client.responses.parse(
#             model="gpt-4o-mini",
#             input=[
#                 {
#                     "role": "system",
#                     "content": (
#                         "You are an Indian financial literacy advisor. Explain credit behaviour "
#                         "in simple Indian English for young professionals. Avoid jargon. "
#                         "Output JSON with keys: 'why_change', 'do_dont', 'affordability'. "
#                         "Each must be under 30 words."
#                     ),
#                 },
#                 {
#                     "role": "user",
#                     "content": (
#                         f"Old score: {payload['old_score']}, New score: {payload['new_score']}. "
#                         f"Old utilisation: {payload['old_util']:.2f}, New utilisation: {payload['new_util']:.2f}. "
#                         f"Monthly income: ₹{payload.get('income_monthly')}. "
#                         "Explain why the score changed, suggest habits, and comment on affordability."
#                     ),
#                 },
#             ],
#             text_format=AdviceResponse,
#         )

#         parsed = response.output_parsed

#         return {
#             "why_change": parsed.why_change,
#             "do_dont": parsed.do_dont,
#             "affordability": parsed.affordability,
#         }

#     except Exception as e:
#         print("GPT advice error:", e)
#         return {
#             "why_change": "Unable to explain score change.",
#             "do_dont": "Make repayments on time and avoid frequent loan applications.",
#             "affordability": "Spend within income to maintain financial stability."
#         }


# # -------------------------------------------------------
# # Scenario Simulation Core
# # -------------------------------------------------------
# def simulate_scenario(
#     mobile_number: str,
#     current_limit: float,
#     new_limit: float,
#     current_balance: float,
#     new_balance: float,
#     missed_payment: bool = False,
#     add_enquiry: bool = False
# ) -> Dict[str, Any]:

#     # fetch user bureau record
#     coll = get_collection()
#     doc = coll.find_one({"mobile_number": mobile_number})
#     if not doc:
#         raise HTTPException(status_code=404, detail="Mobile number not found")

#     features = doc.get("features", {})
#     income = doc.get("income_monthly", 0)
#     old_score = doc.get("score", 0)
#     old_util = float(features.get("CC_utilization", 0))

#     # new utilisation ratio
#     new_util = round(new_balance / new_limit, 4) if new_limit else old_util

#     # apply toggles
#     modified = features.copy()
#     modified["CC_utilization"] = new_util
#     modified = apply_scenario_toggles(modified, missed_payment, add_enquiry)

#     # score prediction (ML + GPT)
#     req = CreditRequest(**modified)
#     credit_resp = score_one(req)
#     new_score = credit_resp.score

#     # GPT explanation payload
#     advice_payload = {
#         "old_score": old_score,
#         "new_score": new_score,
#         "old_util": old_util,
#         "new_util": new_util,
#         "income_monthly": income,
#     }

#     advice = generate_advice(advice_payload)

#     # track modified fields
#     modified_fields = ["CC_utilization"]
#     if missed_payment:
#         modified_fields.append("num_times_30p_dpd")
#     if add_enquiry:
#         modified_fields.append("enq_L3m")

#     # base & scenario snapshots
#     base = {
#         "score": old_score,
#         "cc_utilization": old_util,
#         "credit_limit": current_limit,
#         "credit_balance": current_balance,
#     }

#     scenario_data = {
#         "score": new_score,
#         "cc_utilization": new_util,
#         "credit_limit": new_limit,
#         "credit_balance": new_balance,
#         "missed_payment": missed_payment,
#         "add_enquiry": add_enquiry,
#     }

#     # save to db
#     scenarios_coll = get_collection("scenarios")

#     new_entry = {
#         "created_at": datetime.utcnow(),
#         "base": base,
#         "scenario": scenario_data,
#         "features_modified": modified_fields,
#         "income_monthly": income,
#         "advice": advice,
#     }

#     scenarios_coll.update_one(
#         {"mobile_number": mobile_number},
#         {"$push": {"scenarios": new_entry}},
#         upsert=True
#     )

#     # full response
#     return {
#         "mobile_number": mobile_number,
#         "old_score": old_score,
#         "new_score": new_score,
#         "old_util": old_util,
#         "new_util": new_util,
#         "credit_limit": new_limit,
#         "credit_balance": new_balance,
#         "missed_payment": missed_payment,
#         "add_enquiry": add_enquiry,
#         "advice": advice,
#     }


# # -------------------------------------------------------
# # Save Scenario to DB (separate method if needed)
# # -------------------------------------------------------
# def save_scenario_to_db(
#     mobile_number: str,
#     base: dict,
#     scenario: dict,
#     modified_fields: list,
#     income: float,
#     advice: dict
# ):
#     """
#     Saves scenario history into 'scenarios' collection.
#     Used by simulate_scenario() internally but also available separately.
#     """
#     coll = get_collection("scenarios")

#     new_entry = {
#         "created_at": datetime.utcnow(),
#         "base": base,
#         "scenario": scenario,
#         "features_modified": modified_fields,
#         "income_monthly": income,
#         "advice": advice,
#     }

#     coll.update_one(
#         {"mobile_number": mobile_number},
#         {"$push": {"scenarios": new_entry}},
#         upsert=True
#     )


import json
from typing import Dict, Any
from datetime import datetime

from fastapi import HTTPException
from pydantic import BaseModel

from ollama import chat

from controller.credit_controller import score_one
from schema.credit import CreditRequest
from db import get_collection


# -------------------------------------------------------
# Scenario Toggle Function
# -------------------------------------------------------
def apply_scenario_toggles(
    features: Dict[str, Any],
    missed_payment: bool = False,
    add_enquiry: bool = False
):
    """
    Adjusts numeric behavioural parameters in-memory depending on
    user-selected scenario toggles (missed payment or additional enquiry).
    """
    f = features.copy()

    if missed_payment:
        f["num_times_delinquent"] = f.get("num_times_delinquent", 0) + 1
        f["num_times_30p_dpd"] = f.get("num_times_30p_dpd", 0) + 1
        f["max_delinquency_level"] = max(f.get("max_delinquency_level", 0), 1)
        f["time_since_recent_deliquency"] = 0
        f["pct_currentBal_all_TL"] = min(f.get("pct_currentBal_all_TL", 0) + 0.05, 1.0)

    if add_enquiry:
        f["enq_L3m"] = f.get("enq_L3m", 0) + 1
        f["enq_L6m"] = f.get("enq_L6m", 0) + 1
        f["enq_L12m"] = f.get("enq_L12m", 0) + 1
        f["time_since_recent_enq"] = 0

    return f


# -------------------------------------------------------
# Pydantic Response Schema for Advice
# -------------------------------------------------------
class AdviceResponse(BaseModel):
    why_change: str
    do_dont: str
    affordability: str


# -------------------------------------------------------
# Ollama Advice Generator
# -------------------------------------------------------
def generate_advice(payload: Dict[str, Any]) -> Dict[str, str]:
    """
    Generates 3 educational, India-specific advice points:
    - why the score changed
    - good/bad habits
    - affordability assessment
    """

    prompt = f"""
You are an Indian financial literacy advisor.

Explain credit behaviour in simple Indian English for young professionals.
Avoid jargon.
Keep each field under 30 words.

Return ONLY valid JSON with exactly these keys:
- why_change
- do_dont
- affordability

Context:
- Old score: {payload['old_score']}
- New score: {payload['new_score']}
- Old utilisation: {payload['old_util']:.2f}
- New utilisation: {payload['new_util']:.2f}
- Monthly income: ₹{payload.get('income_monthly', 0)}

Instructions:
- why_change: explain why score changed
- do_dont: suggest good/bad habits
- affordability: comment on affordability simply
"""

    try:
        response = chat(
            model="llama3.1:8b",
            messages=[
                {"role": "user", "content": prompt}
            ],
            format=AdviceResponse.model_json_schema(),
            options={"temperature": 0}
        )

        raw = response.message.content

        print("\n🔥 RAW OLLAMA ADVICE OUTPUT:")
        print(raw)

        parsed = AdviceResponse.model_validate_json(raw)

        print("\n✅ PARSED OLLAMA ADVICE:")
        print(parsed)

        return {
            "why_change": parsed.why_change,
            "do_dont": parsed.do_dont,
            "affordability": parsed.affordability,
        }

    except Exception as e:
        print("❌ Ollama advice error:", e)
        return {
            "why_change": "Unable to explain score change.",
            "do_dont": "Make repayments on time and avoid frequent loan applications.",
            "affordability": "Spend within income to maintain financial stability."
        }


# -------------------------------------------------------
# Scenario Simulation Core
# -------------------------------------------------------
def simulate_scenario(
    mobile_number: str,
    current_limit: float,
    new_limit: float,
    current_balance: float,
    new_balance: float,
    missed_payment: bool = False,
    add_enquiry: bool = False
) -> Dict[str, Any]:

    # fetch user bureau record
    coll = get_collection()
    doc = coll.find_one({"mobile_number": mobile_number})
    if not doc:
        raise HTTPException(status_code=404, detail="Mobile number not found")

    features = doc.get("features", {})
    income = doc.get("income_monthly", 0)
    old_score = doc.get("score", 0)
    old_util = float(features.get("CC_utilization", 0))

    print("\n📥 INPUT FEATURES FROM DB:")
    print(features)

    # new utilisation ratio
    new_util = round(new_balance / new_limit, 4) if new_limit else old_util
    print(f"\n📊 Old util: {old_util}, New util: {new_util}")

    # apply toggles
    modified = features.copy()
    modified["CC_utilization"] = new_util
    modified = apply_scenario_toggles(modified, missed_payment, add_enquiry)

    print("\n🛠️ MODIFIED FEATURES FOR SCENARIO:")
    print(modified)

    # score prediction (ML + Ollama, via credit_controller)
    req = CreditRequest(**modified)
    credit_resp = score_one(req)
    new_score = credit_resp.score

    print(f"\n🎯 Old score: {old_score}")
    print(f"🎯 New score: {new_score}")

    # advice payload
    advice_payload = {
        "old_score": old_score,
        "new_score": new_score,
        "old_util": old_util,
        "new_util": new_util,
        "income_monthly": income,
    }

    advice = generate_advice(advice_payload)

    # track modified fields
    modified_fields = ["CC_utilization"]
    if missed_payment:
        modified_fields.append("num_times_30p_dpd")
    if add_enquiry:
        modified_fields.append("enq_L3m")

    # base & scenario snapshots
    base = {
        "score": old_score,
        "cc_utilization": old_util,
        "credit_limit": current_limit,
        "credit_balance": current_balance,
    }

    scenario_data = {
        "score": new_score,
        "cc_utilization": new_util,
        "credit_limit": new_limit,
        "credit_balance": new_balance,
        "missed_payment": missed_payment,
        "add_enquiry": add_enquiry,
    }

    print("\n📦 BASE SNAPSHOT:")
    print(base)

    print("\n📦 SCENARIO SNAPSHOT:")
    print(scenario_data)

    print("\n💡 GENERATED ADVICE:")
    print(advice)

    # save to db
    scenarios_coll = get_collection("scenarios")

    new_entry = {
        "created_at": datetime.utcnow(),
        "base": base,
        "scenario": scenario_data,
        "features_modified": modified_fields,
        "income_monthly": income,
        "advice": advice,
    }

    scenarios_coll.update_one(
        {"mobile_number": mobile_number},
        {"$push": {"scenarios": new_entry}},
        upsert=True
    )

    print("\n✅ Scenario saved to DB")

    # full response
    return {
        "mobile_number": mobile_number,
        "old_score": old_score,
        "new_score": new_score,
        "old_util": old_util,
        "new_util": new_util,
        "credit_limit": new_limit,
        "credit_balance": new_balance,
        "missed_payment": missed_payment,
        "add_enquiry": add_enquiry,
        "advice": advice,
    }


# -------------------------------------------------------
# Save Scenario to DB (separate method if needed)
# -------------------------------------------------------
def save_scenario_to_db(
    mobile_number: str,
    base: dict,
    scenario: dict,
    modified_fields: list,
    income: float,
    advice: dict
):
    """
    Saves scenario history into 'scenarios' collection.
    Used by simulate_scenario() internally but also available separately.
    """
    coll = get_collection("scenarios")

    new_entry = {
        "created_at": datetime.utcnow(),
        "base": base,
        "scenario": scenario,
        "features_modified": modified_fields,
        "income_monthly": income,
        "advice": advice,
    }

    coll.update_one(
        {"mobile_number": mobile_number},
        {"$push": {"scenarios": new_entry}},
        upsert=True
    )

    print("\n✅ save_scenario_to_db: scenario saved")