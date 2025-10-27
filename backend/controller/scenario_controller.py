# controller/scenario_controller.py
import os
from typing import Dict, Any
from openai import OpenAI
from fastapi import HTTPException
from db import get_collection
from controller.credit_controller import score_one
from schema.credit import CreditRequest
from pydantic import BaseModel
from datetime import datetime
from pymongo import UpdateOne
from db import get_collection

class AdviceResponse(BaseModel):
    why_change: str
    do_dont: str
    affordability: str

client = OpenAI(api_key="whatsapp se lo")

# --------- Utility: apply toggles (in-memory only) ---------
def apply_scenario_toggles(features: Dict[str, Any],
                           missed_payment: bool = False,
                           add_enquiry: bool = False):
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


from pydantic import BaseModel

class AdviceResponse(BaseModel):
    why_change: str
    do_dont: str
    affordability: str

def generate_advice(payload: Dict[str, Any]) -> Dict[str, str]:
    """
    Uses GPT-4o-mini to produce 3 concise, India-specific and educational advice points:
    - why_change: explain why the score changed
    - do_dont: suggest good or bad credit habits
    - affordability: explain the user's ability to handle the scenario responsibly
    """
    try:
        response = client.responses.parse(
            model="gpt-4o-mini",
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are an Indian financial literacy assistant helping people understand their credit behaviour. "
                        "Your goal is to educate the user on how their credit score is influenced by repayment, enquiries, "
                        "and responsible credit habits — not just credit cards. "
                        "Speak as if explaining to a young professional or first-time borrower. "
                        "Avoid jargon like 'DTI' or 'secured line'; use simple, local terms (like 'loans', 'repayment on time', 'too many enquiries'). "
                        "Output a JSON with exactly three keys: 'why_change', 'do_dont', and 'affordability'. "
                        "Each point must be under 30 words and framed as friendly advice, not warnings."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Old score: {payload['old_score']}, New score: {payload['new_score']}. "
                        f"Old utilisation: {payload['old_util']:.2f}, New utilisation: {payload['new_util']:.2f}. "
                        f"Monthly income: ₹{payload.get('income_monthly')}. "
                        "Explain briefly why the score changed, what good or bad credit habits to follow, "
                        "and if the user's financial behaviour looks affordable or risky for Indian credit standards."
                    ),
                },
            ],
            text_format=AdviceResponse,
        )

        parsed = response.output_parsed
        return {
            "why_change": parsed.why_change,
            "do_dont": parsed.do_dont,
            "affordability": parsed.affordability,
        }

    except Exception as e:
        print("GPT advice error:", e)
        return {
            "why_change": "Could not fetch advice.",
            "do_dont": "Make repayments on time and avoid frequent loan applications.",
            "affordability": "Spending within your income helps maintain a healthy credit profile."
        }


# --------- Core simulation function ---------
from datetime import datetime

def simulate_scenario(mobile_number: str,
                      current_limit: float,
                      new_limit: float,
                      current_balance: float,
                      new_balance: float,
                      missed_payment: bool = False,
                      add_enquiry: bool = False) -> Dict[str, Any]:

    # connect to bureau data collection
    coll = get_collection()
    doc = coll.find_one({"mobile_number": mobile_number})
    if not doc:
        raise HTTPException(status_code=404, detail="Mobile number not found")

    # extract features and baseline info
    features = doc.get("features", {})
    income = doc.get("income_monthly", 0)
    old_score = doc.get("score", 0)
    old_util = float(features.get("CC_utilization", 0))

    # compute new utilization ratio
    new_util = round(new_balance / new_limit, 4) if new_limit else old_util

    # modify features in-memory only
    modified = features.copy()
    modified["CC_utilization"] = new_util
    modified = apply_scenario_toggles(modified, missed_payment, add_enquiry)

    # get predicted score using ML + GPT blended model
    req = CreditRequest(**modified)
    credit_resp = score_one(req)
    new_score = credit_resp.score

    # prepare GPT advice payload
    gpt_payload = {
        "old_score": old_score,
        "new_score": new_score,
        "old_util": old_util,
        "new_util": new_util,
        "income_monthly": income
    }
    advice = generate_advice(gpt_payload)

    # identify modified fields for tracking
    modified_fields = ["CC_utilization"]
    if missed_payment:
        modified_fields.append("num_times_30p_dpd")
    if add_enquiry:
        modified_fields.append("enq_L3m")

    # construct base and scenario snapshots
    base = {
        "score": old_score,
        "cc_utilization": old_util,
        "credit_limit": current_limit,
        "credit_balance": current_balance
    }

    scenario_data = {
        "score": new_score,
        "cc_utilization": new_util,
        "credit_limit": new_limit,
        "credit_balance": new_balance,
        "missed_payment": missed_payment,
        "add_enquiry": add_enquiry
    }

    # ---------- save to 'scenarios' collection ----------
    scenarios_coll = get_collection("scenarios")

    new_entry = {
        "created_at": datetime.utcnow(),
        "base": base,
        "scenario": scenario_data,
        "features_modified": modified_fields,
        "income_monthly": income,
        "advice": advice
    }

    # append to array or create new user doc
    scenarios_coll.update_one(
        {"mobile_number": mobile_number},
        {"$push": {"scenarios": new_entry}},
        upsert=True
    )

    # ---------- return full response ----------
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
        "advice": advice
    }


def save_scenario_to_db(
    mobile_number: str,
    base: dict,
    scenario: dict,
    modified_fields: list,
    income: float,
    advice: dict
):
    """
    Save or update a user's scenario record.
    If user already has a document, append new scenario to 'scenarios' array.
    Else create a new document.
    """
    coll = get_collection("scenarios")  # new collection for scenario history

    new_entry = {
        "created_at": datetime.utcnow(),
        "base": base,
        "scenario": scenario,
        "features_modified": modified_fields,
        "income_monthly": income,
        "advice": advice,
    }

    # Append to existing array or create if new
    coll.update_one(
        {"mobile_number": mobile_number},
        {"$push": {"scenarios": new_entry}},
        upsert=True
    )