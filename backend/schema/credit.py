from pydantic import BaseModel, Field
from typing import Optional, List, Tuple

class CreditRequest(BaseModel):
    # Tier A fields (add Tier B later if you train with them)
    time_since_recent_deliquency: Optional[float] = Field(None, ge=0)
    num_times_delinquent: Optional[float] = Field(None, ge=0)
    max_delinquency_level: Optional[float] = Field(None, ge=0)
    num_times_30p_dpd: Optional[float] = Field(None, ge=0)
    num_times_60p_dpd: Optional[float] = Field(None, ge=0)
    enq_L3m: Optional[float] = Field(None, ge=0)
    enq_L6m: Optional[float] = Field(None, ge=0)
    enq_L12m: Optional[float] = Field(None, ge=0)
    time_since_recent_enq: Optional[float] = Field(None, ge=0)
    CC_utilization: Optional[float] = Field(None, ge=0)
    PL_utilization: Optional[float] = Field(None, ge=0)
    pct_currentBal_all_TL: Optional[float] = Field(None, ge=0)
    max_unsec_exposure_inPct: Optional[float] = Field(None, ge=0)
    CC_Flag: Optional[int] = Field(None, ge=0, le=1)
    PL_Flag: Optional[int] = Field(None, ge=0, le=1)

class CreditResponse(BaseModel):
    score: float
    clip: Tuple[float, float]
    features_used: List[str]
