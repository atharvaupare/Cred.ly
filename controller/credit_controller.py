from schema.credit import CreditRequest, CreditResponse
from model.cibil_model import get_model

def health():
    m = get_model()
    return {"status": "ok", "features": len(m.feature_cols)}

def score_one(req: CreditRequest) -> CreditResponse:
    m = get_model()
    score = m.predict(req.model_dump(exclude_none=False))
    return CreditResponse(
        score=score,
        clip=tuple(m.score_clip),
        features_used=m.feature_cols
    )
