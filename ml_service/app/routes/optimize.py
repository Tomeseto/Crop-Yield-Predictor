"""
Prescriptive Optimization Route Handler
"""

from fastapi import APIRouter, HTTPException, Depends
from app.schemas import OptimizationRequest, OptimizationResponse
from app.services.optimizer import OptimizerService

router = APIRouter(prefix="/optimize", tags=["Optimization"])


def get_optimizer_service() -> OptimizerService:
    from app.main import optimizer_service
    return optimizer_service


@router.post("", response_model=OptimizationResponse)
async def optimize_inputs(
    req: OptimizationRequest,
    optimizer: OptimizerService = Depends(get_optimizer_service)
):
    try:
        response = optimizer.optimize(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization solver error: {str(e)}")
