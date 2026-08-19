"""
What-If Scenario Simulation Route Handler
Adheres to AI_RULES.md (Rules 70-75):
Calculates real mathematical difference between two genuine model inferences.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.schemas import SimulationRequest, SimulationResponse
from app.services.predictor import PredictorService

router = APIRouter(prefix="/simulate", tags=["Simulation"])


def get_predictor_service() -> PredictorService:
    from app.main import predictor_service
    return predictor_service


@router.post("", response_model=SimulationResponse)
async def simulate_scenario(
    req: SimulationRequest,
    predictor: PredictorService = Depends(get_predictor_service)
):
    try:
        # 1. Base inference
        base_res = predictor.predict(req.base_inputs)
        base_yield = base_res.predicted_yield_qha

        # 2. Scenario inference
        scenario_res = predictor.predict(req.modified_inputs)
        scenario_yield = scenario_res.predicted_yield_qha

        # 3. Mathematical Delta
        yield_delta = round(scenario_yield - base_yield, 2)
        pct_change = round((yield_delta / max(base_yield, 0.01)) * 100.0, 2)

        # 4. Economic Calculations
        msp = req.crop_price_per_q or 2300.0
        area = req.base_inputs.area_hectares

        # Fertilizer unit costs
        cost_n = 5.95 / 0.46
        cost_p = 27.00 / 0.46
        cost_k = 33.00 / 0.60

        base_fert_cost = (
            (req.base_inputs.nitrogen_kgha * cost_n) +
            (req.base_inputs.phosphorus_kgha * cost_p) +
            (req.base_inputs.potassium_kgha * cost_k)
        ) * area

        mod_fert_cost = (
            (req.modified_inputs.nitrogen_kgha * cost_n) +
            (req.modified_inputs.phosphorus_kgha * cost_p) +
            (req.modified_inputs.potassium_kgha * cost_k)
        ) * area

        delta_fert_cost = round(mod_fert_cost - base_fert_cost, 2)
        delta_revenue = round(yield_delta * area * msp, 2)
        net_gain = round(delta_revenue - delta_fert_cost, 2)

        return SimulationResponse(
            base_yield_qha=base_yield,
            scenario_yield_qha=scenario_yield,
            yield_delta_qha=yield_delta,
            percentage_change_pct=pct_change,
            economic_impact={
                "estimated_revenue_change_inr": delta_revenue,
                "estimated_input_cost_change_inr": delta_fert_cost,
                "estimated_net_gain_inr": net_gain,
                "crop_msp_used_inr_per_q": msp
            },
            unit="quintals/hectare"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation calculation error: {str(e)}")
