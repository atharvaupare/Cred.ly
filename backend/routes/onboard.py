# routes/onboard.py
from fastapi import APIRouter
from pydantic import BaseModel, Field
from controller.onboard_controller import onboard_user_logic

router = APIRouter(prefix="/onboard", tags=["onboard"])

class OnboardReq(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15)
    income_monthly: float = Field(..., gt=0)

@router.post("", summary="Bootstrap a user: predict score, compute limit & balance, update Mongo")
def onboard_user(req: OnboardReq):
    return onboard_user_logic(req.mobile_number, req.income_monthly)
