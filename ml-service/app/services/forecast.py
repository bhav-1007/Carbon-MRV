import numpy as np
from sklearn.linear_model import LinearRegression


def forecast_next(history):
    if not history:
        return {"nextPeriodTCO2e": 0, "confidence": 0.2, "method": "empty-baseline"}

    values = np.array([point.tCO2e for point in history], dtype=float)
    if len(values) < 3:
        return {
            "nextPeriodTCO2e": round(float(values.mean()), 3),
            "confidence": 0.45,
            "method": "moving-average",
        }

    x = np.arange(len(values)).reshape(-1, 1)
    model = LinearRegression()
    model.fit(x, values)
    prediction = max(float(model.predict([[len(values)]])[0]), 0)
    return {
        "nextPeriodTCO2e": round(prediction, 3),
        "confidence": 0.72,
        "method": "linear-regression",
    }
