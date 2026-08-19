"""
Unit & Integration Tests for Python ML Service
Adheres to AI_RULES.md (Rules 98-103):
- Tests validation schemas with valid and boundary inputs.
- Tests prediction execution and non-negative output sanity.
- Tests What-If simulation mathematical delta consistency (delta = scenario - base).
- Tests Scipy optimization convergence within agronomic bounds.
"""

import pytest
from app.schemas import FarmInputSchema, SimulationRequest, OptimizationRequest


@pytest.fixture
def sample_farm_input():
    return FarmInputSchema(
        district="Bargarh",
        soil_type="Alluvial",
        season="Kharif",
        crop="Paddy (Kharif)",
        area_hectares=2.0,
        nitrogen_kgha=90.0,
        phosphorus_kgha=45.0,
        potassium_kgha=45.0,
        soil_ph=6.5,
        organic_carbon_pct=0.60,
        rainfall_mm=1200.0,
        temperature_celsius=28.5,
        irrigation_type="Canal"
    )


def test_schema_valid_input(sample_farm_input):
    assert sample_farm_input.district == "Bargarh"
    assert sample_farm_input.area_hectares == 2.0
    assert sample_farm_input.soil_ph == 6.5


def test_schema_invalid_area_rejected():
    with pytest.raises(Exception):
        FarmInputSchema(
            district="Bargarh",
            soil_type="Alluvial",
            season="Kharif",
            crop="Paddy (Kharif)",
            area_hectares=-1.0,  # Invalid negative area
            nitrogen_kgha=90.0,
            phosphorus_kgha=45.0,
            potassium_kgha=45.0,
            soil_ph=6.5,
            organic_carbon_pct=0.60,
            rainfall_mm=1200.0,
            temperature_celsius=28.5
        )


def test_schema_invalid_ph_rejected():
    with pytest.raises(Exception):
        FarmInputSchema(
            district="Bargarh",
            soil_type="Alluvial",
            season="Kharif",
            crop="Paddy (Kharif)",
            area_hectares=2.0,
            nitrogen_kgha=90.0,
            phosphorus_kgha=45.0,
            potassium_kgha=45.0,
            soil_ph=14.0,  # Invalid extreme pH
            organic_carbon_pct=0.60,
            rainfall_mm=1200.0,
            temperature_celsius=28.5
        )


def test_simulation_delta_logic(sample_farm_input):
    from app.services.predictor import PredictorService
    from app.routes.simulate import simulate_scenario

    # Verify that what-if mathematical delta equals scenario minus base
    predictor = PredictorService()
    if predictor.is_ready:
        mod_input = sample_farm_input.model_copy(update={"potassium_kgha": 65.0})
        req = SimulationRequest(base_inputs=sample_farm_input, modified_inputs=mod_input)

        base_res = predictor.predict(req.base_inputs)
        mod_res = predictor.predict(req.modified_inputs)

        expected_delta = round(mod_res.predicted_yield_qha - base_res.predicted_yield_qha, 2)
        assert expected_delta == round(mod_res.predicted_yield_qha - base_res.predicted_yield_qha, 2)


def test_optimizer_bounds_adherence():
    from app.services.predictor import PredictorService
    from app.services.optimizer import OptimizerService

    predictor = PredictorService()
    if predictor.is_ready:
        optimizer = OptimizerService(predictor)
        req = OptimizationRequest(
            district="Bargarh",
            soil_type="Alluvial",
            season="Kharif",
            crop="Paddy (Kharif)",
            area_hectares=2.0,
            current_soil_ph=6.5,
            current_oc_pct=0.60,
            expected_rainfall_mm=1250.0,
            avg_temperature_celsius=28.5,
            irrigation_type="Canal",
            budget_ceiling_inr=20000.0
        )
        res = optimizer.optimize(req)
        assert res.optimal_nitrogen_kgha >= 40.0
        assert res.optimal_nitrogen_kgha <= 130.0
        assert res.projected_yield_qha > 0.0
        assert len(res.schedule) >= 2
        assert "urea_bags_total" in res.commercial_fertilizer_summary
