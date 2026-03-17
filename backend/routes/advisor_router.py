from fastapi import APIRouter, Header, HTTPException

from controller.advisor_controller import get_target_score_plan
from schema.advisor import TargetScoreRequest, TargetScoreAdviceResponse

router = APIRouter(prefix="/advisor", tags=["advisor"])


@router.post("/target-score", response_model=TargetScoreAdviceResponse)
def target_score_advice(
    body: TargetScoreRequest,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    return get_target_score_plan(authorization, body.target_score)