from fastapi import APIRouter
from schema.credit import CreditRequest, CreditResponse
from controller.credit_controller import score_one, health

router = APIRouter(prefix="/credit", tags=["credit"])

@router.get("/health")
def _health():
    return health()

@router.post("/score", response_model=CreditResponse)
def _score(req: CreditRequest):
    return score_one(req)
