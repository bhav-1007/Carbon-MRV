from pydantic import BaseModel, Field


class HistoryPoint(BaseModel):
    period: str
    tCO2e: float = Field(ge=0)


class ForecastRequest(BaseModel):
    history: list[HistoryPoint]


class RecommendationRequest(BaseModel):
    emissions: list[dict] = []


class Recommendation(BaseModel):
    title: str
    description: str
    estimatedReductionTCO2e: float
    estimatedCost: float
    paybackPeriod: float
    priorityScore: float
