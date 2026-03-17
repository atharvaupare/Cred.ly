# import os
# import json
# from pathlib import Path
# from pydantic import BaseModel
# from openai import OpenAI

# from schema.credit import CreditRequest, CreditResponse
# from model.cibil_model import get_model

# # -------------------------------------------------------
# # Load environment variables
# # -------------------------------------------------------
# from dotenv import load_dotenv
# env_path = Path(__file__).resolve().parent.parent / ".env"
# load_dotenv(env_path)

# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# if not OPENAI_API_KEY:
#     raise RuntimeError("OPENAI_API_KEY is missing from .env")

# client = OpenAI(api_key=OPENAI_API_KEY)

# # -------------------------------------------------------
# # Pydantic model for OpenAI structured output
# # -------------------------------------------------------
# class ScoreResponse(BaseModel):
#     score: float  # numeric score between 300–900

# # -------------------------------------------------------
# # Get score from OpenAI
# # -------------------------------------------------------
# def get_openai_score(features: dict) -> float:
#     """
#     Sends borrower feature dictionary to GPT-4o-mini 
#     and returns a numeric credit score (300–900).
#     """

#     try:
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {
#                     "role": "system",
#                     "content": (
#                         "You are a credit risk evaluator in India for a CIBIL model. "
#                         "Given numeric borrower features, output exactly one JSON field: "
#                         "\"score\" (float between 300 and 900). "
#                         "Higher = lower risk. No explanation."
#                     )
#                 },
#                 {
#                     "role": "user",
#                     "content": f"Features: {features}"
#                 }
#             ],
#             response_format={"type": "json_object"}
#         )

#         raw = response.choices[0].message.content
#         parsed = json.loads(raw)

#         score = float(parsed["score"])
#         score = max(300, min(900, score))  # clamp
#         return score

#     except Exception as e:
#         print("OpenAI scoring error:", e)
#         return None

# # -------------------------------------------------------
# # API Health Check
# # -------------------------------------------------------
# def health():
#     """
#     Returns ML model health & number of features loaded.
#     """
#     m = get_model()
#     return {
#         "status": "ok",
#         "features": len(m.feature_cols)
#     }

# # -------------------------------------------------------
# # Core Scoring Function
# # -------------------------------------------------------
# def score_one(req: CreditRequest) -> CreditResponse:
#     """
#     1. Run ML model score
#     2. Run GPT score
#     3. Blend results
#     4. Return combined score
#     """

#     m = get_model()

#     # ML prediction
#     features = req.model_dump(exclude_none=False)
#     ml_score = m.predict(features)
#     print(f"ML model score: {ml_score}")

#     # GPT prediction
#     ai_score = get_openai_score(features)
#     print(f"AI model score: {ai_score}")

#     # Blend scores (your original weights preserved)
#     if ai_score is not None:
#         combined_score = round((0.60 * ml_score) + (0.40 * ai_score), 2)
#     else:
#         combined_score = ml_score

#     # Response
#     return CreditResponse(
#         score=combined_score,
#         clip=tuple(m.score_clip),
#         features_used=m.feature_cols
#     )


import json
from pydantic import BaseModel, Field

from ollama import chat

from schema.credit import CreditRequest, CreditResponse
from model.cibil_model import get_model


# -------------------------------------------------------
# Structured Output Schema
# -------------------------------------------------------
class ScoreResponse(BaseModel):
    score: float = Field(ge=300, le=900)


# -------------------------------------------------------
# Get score from Ollama (WITH FEATURE MEANINGS)
# -------------------------------------------------------
def get_ollama_score(features: dict) -> float:
    """
    Sends borrower features to Ollama and returns score (300–900)
    """

    prompt = f"""
    You are a credit risk evaluator for India (CIBIL-style scoring).

    Understand the meaning of features:

    - time_since_recent_deliquency: days since last delinquency (higher = better)
    - num_times_delinquent: number of past delinquencies (lower = better)
    - max_delinquency_level: severity of worst delinquency (0 = best)
    - num_times_30p_dpd: number of 30+ days past due
    - num_times_60p_dpd: number of 60+ days past due
    - enq_L3m, enq_L6m, enq_L12m: number of credit enquiries (lower = better)
    - time_since_recent_enq: time since last enquiry (higher = better)
    - CC_utilization: credit card usage ratio (lower < 0.3 is good)
    - PL_utilization: personal loan utilization (lower = better)
    - pct_currentBal_all_TL: total credit usage (lower = better)
    - max_unsec_exposure_inPct: unsecured exposure ratio (lower = safer)
    - CC_Flag: has credit card (1 = yes, good)
    - PL_Flag: has personal loan (1 = riskier)

    Scoring logic:
    - No delinquency = strong positive
    - Low utilization = positive
    - Fewer enquiries = positive
    - Any delinquency = strong negative

    Return ONLY JSON:
    {{
        "score": number between 300 and 900
    }}

    Features:
    {features}
    """

    try:
        response = chat(
            model="llama3.1:8b",
            messages=[
                {"role": "user", "content": prompt}
            ],
            format=ScoreResponse.model_json_schema(),
            options={"temperature": 0}
        )

        raw = response.message.content

        print("\n🔥 RAW LLM OUTPUT:")
        print(raw)

        parsed = ScoreResponse.model_validate_json(raw)

        score = float(parsed.score)

        print("\n✅ VALIDATED SCORE:", score)

        return score

    except Exception as e:
        print("❌ Ollama scoring error:", e)
        return None


# -------------------------------------------------------
# API Health Check
# -------------------------------------------------------
def health():
    m = get_model()
    return {
        "status": "ok",
        "features": len(m.feature_cols)
    }


# -------------------------------------------------------
# Core Scoring Function (UNCHANGED LOGIC)
# -------------------------------------------------------
def score_one(req: CreditRequest) -> CreditResponse:

    m = get_model()

    # ML prediction
    features = req.model_dump(exclude_none=False)
    ml_score = m.predict(features)
    print(f"📊 ML model score: {ml_score}")

    # Ollama prediction
    ai_score = get_ollama_score(features)
    print(f"🤖 AI model score: {ai_score}")

    # SAME LOGIC (unchanged)
    if ai_score is not None:
        combined_score = round((0.60 * ml_score) + (0.40 * ai_score), 2)
    else:
        combined_score = ml_score

    print(f"🎯 Final blended score: {combined_score}")

    return CreditResponse(
        score=combined_score,
        clip=tuple(m.score_clip),
        features_used=m.feature_cols
    )