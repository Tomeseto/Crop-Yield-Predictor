"""
Prediction Route Handler
"""

from fastapi import APIRouter, HTTPException, Depends
from app.schemas import FarmInputSchema, PredictionResponse
from app.services.predictor import PredictorService

router = APIRouter(prefix="/predict", tags=["Prediction"])


def get_predictor_service() -> PredictorService:
    from app.main import predictor_service
    return predictor_service


@router.post("", response_model=PredictionResponse)
async def predict_yield(
    farm_input: FarmInputSchema,
    predictor: PredictorService = Depends(get_predictor_service)
):
    try:
        response = predictor.predict(farm_input)
        return response
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
