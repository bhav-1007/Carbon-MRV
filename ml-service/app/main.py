from fastapi import FastAPI
from .schemas import ForecastRequest, RecommendationRequest
from .services.forecast import forecast_next
from .services.recommend import roi_ranked_recommendations

app = FastAPI(title="Carbon MRV AI Service", version="0.1.0")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/forecast")
def forecast(request: ForecastRequest):
    return forecast_next(request.history)


@app.post("/recommend")
def recommend(request: RecommendationRequest):
    return {"recommendations": roi_ranked_recommendations(request)}
