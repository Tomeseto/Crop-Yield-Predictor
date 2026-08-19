"""
Prescriptive Optimization Engine
Formulates constrained mathematical optimization using Scipy SLSQP.
Translates optimal elemental N-P-K into commercial fertilizer quantities (Urea, DAP, MOP)
and generates split application schedules grounded in AGRONOMIC_REFERENCES.md.
"""

import numpy as np
from scipy.optimize import minimize
from app.schemas import OptimizationRequest, OptimizationResponse, FertilizerScheduleStage, FarmInputSchema
from app.services.predictor import PredictorService


class OptimizerService:
    def __init__(self, predictor: PredictorService):
        self.predictor = predictor

        # Fertilizer unit economics (Subsidized MRP baseline in INR per kg)
        self.price_n_per_kg = 5.95 / 0.46     # ~12.93 INR/kg elemental N from Urea
        self.price_p_per_kg = 27.00 / 0.46    # ~58.70 INR/kg elemental P2O5 from DAP
        self.price_k_per_kg = 33.00 / 0.60    # ~55.00 INR/kg elemental K2O from MOP

        # Crop Minimum Support Prices (INR per Quintal baseline)
        self.crop_msp = {
            "Paddy (Kharif)": 2300.0,
            "Paddy (Rabi)": 2300.0,
            "Ragi (Mandia)": 4290.0,
            "Green Gram (Moong)": 8558.0,
            "Groundnut": 6783.0,
            "Maize": 2225.0,
            "Mustard": 5650.0
        }

        # Agronomic search bounds (Min NPK, Max NPK in kg/ha) from OUAT Package of Practices
        self.crop_bounds = {
            "Paddy (Kharif)": {"N": (40.0, 130.0), "P": (20.0, 65.0), "K": (20.0, 65.0)},
            "Paddy (Rabi)": {"N": (60.0, 150.0), "P": (25.0, 75.0), "K": (25.0, 75.0)},
            "Ragi (Mandia)": {"N": (20.0, 80.0), "P": (15.0, 45.0), "K": (15.0, 45.0)},
            "Green Gram (Moong)": {"N": (10.0, 35.0), "P": (20.0, 60.0), "K": (10.0, 35.0)},
            "Groundnut": {"N": (15.0, 40.0), "P": (25.0, 70.0), "K": (25.0, 70.0)},
            "Maize": {"N": (50.0, 140.0), "P": (25.0, 70.0), "K": (20.0, 60.0)},
            "Mustard": {"N": (30.0, 90.0), "P": (15.0, 45.0), "K": (15.0, 45.0)}
        }

    def optimize(self, req: OptimizationRequest) -> OptimizationResponse:
        crop_name = req.crop
        bounds_info = self.crop_bounds.get(crop_name, {"N": (30.0, 120.0), "P": (15.0, 60.0), "K": (15.0, 60.0)})
        msp = self.crop_msp.get(crop_name, 2300.0)

        # Soil pH adjustment: Acidic soils need higher P bounds due to fixation
        p_min, p_max = bounds_info["P"]
        if req.current_soil_ph < 6.0:
            p_min *= 1.15
            p_max *= 1.25

        # Objective Function to MINIMIZE: Negative Net Profit = Input Costs - (Predicted Yield * MSP)
        def objective(x):
            n_val, p_val, k_val = x

            test_input = FarmInputSchema(
                district=req.district,
                soil_type=req.soil_type,
                season=req.season,
                crop=req.crop,
                area_hectares=req.area_hectares,
                nitrogen_kgha=float(n_val),
                phosphorus_kgha=float(p_val),
                potassium_kgha=float(k_val),
                soil_ph=req.current_soil_ph,
                organic_carbon_pct=req.current_oc_pct,
                rainfall_mm=req.expected_rainfall_mm,
                temperature_celsius=req.avg_temperature_celsius,
                irrigation_type=req.irrigation_type
            )

            pred_res = self.predictor.predict(test_input)
            predicted_yield = pred_res.predicted_yield_qha

            # Total input cost per hectare
            cost = (n_val * self.price_n_per_kg) + (p_val * self.price_p_per_kg) + (k_val * self.price_k_per_kg)
            revenue = predicted_yield * msp
            net_profit = revenue - cost

            # Return negative profit for minimization
            return -net_profit

        # Initial starting point (midpoint of bounds)
        x0 = [
            (bounds_info["N"][0] + bounds_info["N"][1]) / 2.0,
            (p_min + p_max) / 2.0,
            (bounds_info["K"][0] + bounds_info["K"][1]) / 2.0
        ]

        bounds = [bounds_info["N"], (p_min, p_max), bounds_info["K"]]

        # Budget constraint: Total fertilizer cost <= budget ceiling
        def budget_constraint(x):
            cost = (x[0] * self.price_n_per_kg) + (x[1] * self.price_p_per_kg) + (x[2] * self.price_k_per_kg)
            return req.budget_ceiling_inr - cost

        constraints = [{"type": "ineq", "fun": budget_constraint}]

        # Run Scipy SLSQP optimization
        opt_res = minimize(
            objective,
            x0,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
            options={"maxiter": 60, "ftol": 1e-3}
        )

        opt_n, opt_p, opt_k = opt_res.x
        opt_n = float(round(opt_n, 1))
        opt_p = float(round(opt_p, 1))
        opt_k = float(round(opt_k, 1))

        # Evaluate final projected yield with optimal doses
        final_input = FarmInputSchema(
            district=req.district,
            soil_type=req.soil_type,
            season=req.season,
            crop=req.crop,
            area_hectares=req.area_hectares,
            nitrogen_kgha=opt_n,
            phosphorus_kgha=opt_p,
            potassium_kgha=opt_k,
            soil_ph=req.current_soil_ph,
            organic_carbon_pct=req.current_oc_pct,
            rainfall_mm=req.expected_rainfall_mm,
            temperature_celsius=req.avg_temperature_celsius,
            irrigation_type=req.irrigation_type
        )
        final_pred = self.predictor.predict(final_input).predicted_yield_qha

        # Convert Elemental N-P-K into Commercial Fertilizer Bags (per hectare & total farm area)
        comm_fert = self._calculate_commercial_bags(opt_n, opt_p, opt_k, req.area_hectares)

        # Generate Sowing & Split Application Schedule
        schedule = self._generate_schedule(crop_name, comm_fert["urea_bags_total"], comm_fert["dap_bags_total"], comm_fert["mop_bags_total"], req.current_soil_ph)

        return OptimizationResponse(
            crop=crop_name,
            optimal_nitrogen_kgha=opt_n,
            optimal_phosphorus_kgha=opt_p,
            optimal_potassium_kgha=opt_k,
            projected_yield_qha=final_pred,
            commercial_fertilizer_summary=comm_fert,
            schedule=schedule,
            agronomic_reference_note=f"Optimized against OUAT Package of Practices for {crop_name} in {req.district} district (Soil pH {req.current_soil_ph})."
        )

    def _calculate_commercial_bags(self, n_kgha: float, p_kgha: float, k_kgha: float, area_ha: float) -> dict:
        # Total elemental kg for entire farm area
        total_n = n_kgha * area_ha
        total_p = p_kgha * area_ha
        total_k = k_kgha * area_ha

        # 1. DAP satisfies all Phosphorus: DAP contains 46% P2O5 and 18% N
        dap_kg_total = total_p / 0.46
        dap_bags_50kg = round(dap_kg_total / 50.0, 1)

        # Nitrogen supplied by DAP
        n_from_dap = dap_kg_total * 0.18
        remaining_n = max(0.0, total_n - n_from_dap)

        # 2. Urea satisfies remaining Nitrogen: Urea contains 46% N
        urea_kg_total = remaining_n / 0.46
        urea_bags_45kg = round(urea_kg_total / 45.0, 1)

        # 3. MOP satisfies Potassium: MOP contains 60% K2O
        mop_kg_total = total_k / 0.60
        mop_bags_50kg = round(mop_kg_total / 50.0, 1)

        # Estimated cost in INR
        est_cost_inr = round((urea_bags_45kg * 268.0) + (dap_bags_50kg * 1350.0) + (mop_bags_50kg * 1650.0), 2)

        return {
            "urea_bags_total": urea_bags_45kg,
            "dap_bags_total": dap_bags_50kg,
            "mop_bags_total": mop_bags_50kg,
            "urea_bag_weight_kg": 45,
            "dap_bag_weight_kg": 50,
            "mop_bag_weight_kg": 50,
            "estimated_fertilizer_cost_inr": est_cost_inr,
            "per_hectare_n_p_k": {"N": n_kgha, "P": p_kgha, "K": k_kgha}
        }

    def _generate_schedule(self, crop: str, urea_bags: float, dap_bags: float, mop_bags: float, soil_ph: float) -> list:
        stages = []
        lime_note = "Apply 2 quintals/ha Agricultural Lime 15 days before sowing to reduce soil acidity." if soil_ph < 5.5 else "Soil pH is favorable."

        if "Paddy" in crop:
            stages.append(FertilizerScheduleStage(
                stage_name="Basal Application (At Sowing / Transplanting)",
                timing="Day 0 (During final land puddling)",
                urea_bags=round(urea_bags * 0.25, 1),
                dap_bags=dap_bags,  # 100% P applied basal
                mop_bags=round(mop_bags * 0.50, 1),
                notes=f"Incorporate all DAP and half MOP thoroughly into soil. {lime_note}"
            ))
            stages.append(FertilizerScheduleStage(
                stage_name="First Top Dressing (Active Tillering Stage)",
                timing="21–25 Days After Transplanting (DAT)",
                urea_bags=round(urea_bags * 0.50, 1),
                dap_bags=0.0,
                mop_bags=0.0,
                notes="Broadcast Urea when field has thin layer of standing water. Maintain weed-free condition."
            ))
            stages.append(FertilizerScheduleStage(
                stage_name="Second Top Dressing (Panicle Initiation Stage)",
                timing="45–50 Days After Transplanting (DAT)",
                urea_bags=round(urea_bags * 0.25, 1),
                dap_bags=0.0,
                mop_bags=round(mop_bags * 0.50, 1),
                notes="Apply remaining Urea and Potash to maximize grain filling and prevent spikelet sterility."
            ))
        elif "Ragi" in crop or "Millets" in crop:
            stages.append(FertilizerScheduleStage(
                stage_name="Basal Application",
                timing="At sowing/transplanting (Day 0)",
                urea_bags=round(urea_bags * 0.50, 1),
                dap_bags=dap_bags,
                mop_bags=mop_bags,
                notes="Apply full DAP, full Potash, and half Nitrogen at sowing."
            ))
            stages.append(FertilizerScheduleStage(
                stage_name="Top Dressing",
                timing="25–30 Days After Sowing (DAS)",
                urea_bags=round(urea_bags * 0.50, 1),
                dap_bags=0.0,
                mop_bags=0.0,
                notes="Broadcast remaining Urea after inter-cultivation weeding."
            ))
        else:
            stages.append(FertilizerScheduleStage(
                stage_name="Basal Application",
                timing="At sowing",
                urea_bags=round(urea_bags * 0.50, 1),
                dap_bags=dap_bags,
                mop_bags=mop_bags,
                notes="Apply all DAP, MOP and half Nitrogen as basal dose."
            ))
            stages.append(FertilizerScheduleStage(
                stage_name="Top Dressing",
                timing="30 Days After Sowing",
                urea_bags=round(urea_bags * 0.50, 1),
                dap_bags=0.0,
                mop_bags=0.0,
                notes="Apply remaining Nitrogen following irrigation."
            ))

        return stages
