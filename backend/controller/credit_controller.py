import os
import json
from pathlib import Path
from pydantic import BaseModel
from openai import OpenAI

from schema.credit import CreditRequest, CreditResponse
from model.cibil_model import get_model

# -------------------------------------------------------
# Load environment variables
# -------------------------------------------------------
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing from .env")

client = OpenAI(api_key=OPENAI_API_KEY)

# -------------------------------------------------------
# Pydantic model for OpenAI structured output
# -------------------------------------------------------
class ScoreResponse(BaseModel):
    score: float  # numeric score between 300–900

# -------------------------------------------------------
# Get score from OpenAI
# -------------------------------------------------------
def get_openai_score(features: dict) -> float:
    """
    Sends borrower feature dictionary to GPT-4o-mini 
    and returns a numeric credit score (300–900).
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a credit risk evaluator in India for a CIBIL model. "
                        "Given numeric borrower features, output exactly one JSON field: "
                        "\"score\" (float between 300 and 900). "
                        "Higher = lower risk. No explanation."
                    )
                },
                {
                    "role": "user",
                    "content": f"Features: {features}"
                }
            ],
            response_format={"type": "json_object"}
        )

        raw = response.choices[0].message.content
        parsed = json.loads(raw)

        score = float(parsed["score"])
        score = max(300, min(900, score))  # clamp
        return score

    except Exception as e:
        print("OpenAI scoring error:", e)
        return None

# -------------------------------------------------------
# API Health Check
# -------------------------------------------------------
def health():
    """
    Returns ML model health & number of features loaded.
    """
    m = get_model()
    return {
        "status": "ok",
        "features": len(m.feature_cols)
    }

# -------------------------------------------------------
# Core Scoring Function
# -------------------------------------------------------
def score_one(req: CreditRequest) -> CreditResponse:
    """
    1. Run ML model score
    2. Run GPT score
    3. Blend results
    4. Return combined score
    """

    m = get_model()

    # ML prediction
    features = req.model_dump(exclude_none=False)
    ml_score = m.predict(features)
    print(f"ML model score: {ml_score}")

    # GPT prediction
    ai_score = get_openai_score(features)
    print(f"AI model score: {ai_score}")

    # Blend scores (your original weights preserved)
    if ai_score is not None:
        combined_score = round((0.60 * ml_score) + (0.40 * ai_score), 2)
    else:
        combined_score = ml_score

    # Response
    return CreditResponse(
        score=combined_score,
        clip=tuple(m.score_clip),
        features_used=m.feature_cols
    )
