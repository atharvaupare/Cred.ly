# routes/onboard.py
from fastapi import APIRouter
from pydantic import BaseModel, Field
from controller.onboard_controller import onboard_user_logic

router = APIRouter(prefix="/onboard", tags=["onboard"])

# ---- Request schema ----
class OnboardReq(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15, example="9991112222")
    income_monthly: float = Field(..., gt=0, example=75000)
    password: str = Field(..., min_length=6, max_length=100, example="securePass123")


# ---- POST: Onboard user ----
@router.post(
    "",
    summary="Onboard user → predict score, compute credit limit, store password securely, and issue JWT"
)
def onboard_user(req: OnboardReq):
    """
    1️⃣ Fetches user's bureau data (by mobile_number)
    2️⃣ Calls credit score model (ML + GPT blended)
    3️⃣ Computes credit limit & balance based on score + income
    4️⃣ Hashes password with bcrypt and saves to MongoDB
    5️⃣ Generates a JWT token for session-less authentication
    """
    return onboard_user_logic(
        mobile_number=req.mobile_number,
        income_monthly=req.income_monthly,
        password=req.password
    )
