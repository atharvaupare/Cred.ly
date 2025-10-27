# routes/scenario.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from controller.scenario_controller import simulate_scenario

router = APIRouter(prefix="/scenario", tags=["scenario"])

class ScenarioRequest(BaseModel):
    mobile_number: str
    current_limit: float
    new_limit: float
    current_balance: float
    new_balance: float
    new_cc_util: Optional[float] = None
    missed_payment: Optional[bool] = False
    add_enquiry: Optional[bool] = False

@router.post("")
def run_scenario(req: ScenarioRequest):
    return simulate_scenario(
        mobile_number=req.mobile_number,
        current_limit=req.current_limit,
        new_limit=req.new_limit,
        current_balance=req.current_balance,
        new_balance=req.new_balance,
        missed_payment=req.missed_payment,
        add_enquiry=req.add_enquiry
    )
