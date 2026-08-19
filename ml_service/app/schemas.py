"""
Pydantic Validation Schemas for Python ML Service
Adheres to AI_RULES.md (Rules 31, 33, 58-64):
- Explicit units on all parameters.
- Validates realistic domain boundaries established during EDA.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FarmInputSchema(BaseModel):
    district: str = Field(..., description="District in Odisha (e.g., Bargarh, Cuttack, Kalahandi)")
    soil_type: str = Field(..., description="Soil type (Alluvial, Red Laterite, Black Soil, Coastal Saline, Sandy Loam)")
    season: str = Field(..., description="Cropping season (Kharif, Rabi)")
    crop: str = Field(..., description="Target crop (Paddy (Kharif), Paddy (Rabi), Ragi (Mandia), etc.)")
    area_hectares: float = Field(..., gt=0.0, le=50.0, description="Cultivated land area in hectares (ha)")
    nitrogen_kgha: float = Field(..., ge=0.0, le=350.0, description="Nitrogen fertilizer rate in kg/ha (N)")
    phosphorus_kgha: float = Field(..., ge=0.0, le=200.0, description="Phosphorus fertilizer rate in kg/ha (P2O5)")
    potassium_kgha: float = Field(..., ge=0.0, le=200.0, description="Potassium fertilizer rate in kg/ha (K2O)")
    soil_ph: float = Field(..., ge=3.5, le=9.5, description="Soil pH value (3.5 - 9.5)")
    organic_carbon_pct: float = Field(..., ge=0.05, le=3.0, description="Soil Organic Carbon percentage (%)")
    rainfall_mm: float = Field(..., ge=0.0, le=5000.0, description="Cumulative seasonal rainfall in mm")
    temperature_celsius: float = Field(..., ge=10.0, le=50.0, description="Average seasonal temperature in °C")
    irrigation_type: str = Field(default="Rainfed", description="Irrigation source (Canal, Borewell, Rainfed)")


class FeatureImpact(BaseModel):
    feature: str
    display_name: str
    impact_direction: str  # "positive" or "negative"
    importance_score: float


class PredictionResponse(BaseModel):
    predicted_yield_qha: float = Field(..., description="Model-estimated crop yield in Quintals per Hectare (q/ha)")
    total_production_q: float = Field(..., description="Total estimated production in Quintals (q) = yield * area")
    unit: str = "quintals/hectare"
    selected_model: str
    model_test_metrics: Dict[str, Any]
    top_contributing_factors: List[FeatureImpact]
    disclaimer: str = "Model-based estimate calibrated on empirical historical data. Actual yield depends on local micro-climate."


class SimulationRequest(BaseModel):
    base_inputs: FarmInputSchema
    modified_inputs: FarmInputSchema
    crop_price_per_q: Optional[float] = Field(default=2300.0, description="Minimum Support Price (MSP) per quintal in INR")


class SimulationResponse(BaseModel):
    base_yield_qha: float
    scenario_yield_qha: float
    yield_delta_qha: float
    percentage_change_pct: float
    economic_impact: Dict[str, float]
    unit: str = "quintals/hectare"


class FertilizerScheduleStage(BaseModel):
    stage_name: str
    timing: str
    urea_bags: float
    dap_bags: float
    mop_bags: float
    notes: str


class OptimizationRequest(BaseModel):
    district: str
    soil_type: str
    season: str
    crop: str
    area_hectares: float = Field(..., gt=0.0, le=50.0)
    current_soil_ph: float = Field(..., ge=3.5, le=9.5)
    current_oc_pct: float = Field(default=0.55, ge=0.05, le=3.0)
    expected_rainfall_mm: float = Field(..., ge=0.0, le=5000.0)
    avg_temperature_celsius: float = Field(..., ge=10.0, le=50.0)
    irrigation_type: str = Field(default="Rainfed")
    budget_ceiling_inr: Optional[float] = Field(default=25000.0, description="Maximum fertilizer budget in INR per hectare")


class OptimizationResponse(BaseModel):
    crop: str
    optimal_nitrogen_kgha: float
    optimal_phosphorus_kgha: float
    optimal_potassium_kgha: float
    projected_yield_qha: float
    commercial_fertilizer_summary: Dict[str, Any]
    schedule: List[FertilizerScheduleStage]
    agronomic_reference_note: str
