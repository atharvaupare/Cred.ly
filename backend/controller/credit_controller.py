from schema.credit import CreditRequest, CreditResponse
from model.cibil_model import get_model
import os
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ----- Pydantic model for OpenAI structured output -----
class ScoreResponse(BaseModel):
    score: float  # numeric score between 300–900

# ----- Get score from OpenAI -----
def get_openai_score(features: dict) -> float:
    """
    Sends the feature dictionary to GPT-4o-mini and returns a numeric credit score (300–900).
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or "gpt-3.5-turbo" if you prefer
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a credit risk evaluator in India. Its a CIBIL score model. "
                        "Given the numeric borrower features, output only one JSON field: "
                        "'score' (float between 300 and 900). "
                        "Higher = lower risk. No explanations."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Features: {features}",
                },
            ],
            response_format={ "type": "json_object" }
        )

        parsed = response.choices[0].message.content
        # Parse the JSON string into a Python dictionary
        import json
        result = json.loads(parsed)
        score = float(result['score'])
        # clamp to safe range
        score = max(300, min(900, score))
        return score

    except Exception as e:
        print("OpenAI scoring error:", e)
        return None


# ----- API health check -----
def health():
    m = get_model()
    return {"status": "ok", "features": len(m.feature_cols)}


# ----- Core scoring function -----
def score_one(req: CreditRequest) -> CreditResponse:
    m = get_model()

    # Step 1 – ML model prediction
    ml_score = m.predict(req.model_dump(exclude_none=False))
    print(f"ML model score: {ml_score}")

    # Step 2 – GPT-4o-mini prediction
    ai_score = get_openai_score(req.model_dump(exclude_none=False))
    print(f"AI model score: {ai_score}")

    # Step 3 – Blend results (weighted average; lean toward GPT)
    if ai_score is not None:
        combined_score = round((0.40 * ai_score) + (0.60 * ml_score), 2)
    else:
        combined_score = ml_score  # fallback if GPT fails

    # Step 4 – Return combined score
    return CreditResponse(
        score=combined_score,
        clip=tuple(m.score_clip),
        features_used=m.feature_cols
    )