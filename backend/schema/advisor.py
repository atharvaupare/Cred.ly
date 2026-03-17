from pydantic import BaseModel, Field
from typing import List


class TargetScoreRequest(BaseModel):
    target_score: float = Field(ge=300, le=900)


class TargetScoreAdviceResponse(BaseModel):
    current_score: float
    target_score: float
    achievable: bool
    time_horizon: str
    summary: str
    key_actions: List[str]
    habits_to_avoid: List[str]
    utilization_target: str