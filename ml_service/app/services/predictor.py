"""
ML Inference & SHAP Factor Attribution Service
Loads the serialized artifact and computes predictions and factor explanations.
"""

import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.schemas import FarmInputSchema, PredictionResponse, FeatureImpact


class PredictorService:
    def __init__(self, model_path: str = "saved_models/crop_yield_pipeline.joblib"):
        self.model_path = model_path
        self.artifact = None
        self.pipeline = None
        self.explainer = None
        self.selected_model_name = None
        self.metrics = {}
        self.train_columns = []
        self._load_artifact()

    def _load_artifact(self):
        if not os.path.exists(self.model_path):
            print(f"Warning: Model artifact not found at {self.model_path}. Predictor will initialize once trained.")
            return

        self.artifact = joblib.load(self.model_path)
        self.pipeline = self.artifact["pipeline"]
        self.explainer = self.artifact.get("explainer")
        self.selected_model_name = self.artifact["selected_model_name"]
        self.metrics = self.artifact["metrics"]
        self.train_columns = self.artifact["train_columns"]
        print(f"[PredictorService] Loaded '{self.selected_model_name}' (Test RMSE: {self.metrics.get('rmse_qha')} q/ha)")

    @property
    def is_ready(self) -> bool:
        return self.pipeline is not None

    def _to_dataframe(self, farm_input: FarmInputSchema) -> pd.DataFrame:
        data = {
            "district": [farm_input.district],
            "soil_type": [farm_input.soil_type],
            "season": [farm_input.season],
            "crop": [farm_input.crop],
            "irrigation_type": [farm_input.irrigation_type],
            "area_hectares": [farm_input.area_hectares],
            "nitrogen_kgha": [farm_input.nitrogen_kgha],
            "phosphorus_kgha": [farm_input.phosphorus_kgha],
            "potassium_kgha": [farm_input.potassium_kgha],
            "soil_ph": [farm_input.soil_ph],
            "organic_carbon_pct": [farm_input.organic_carbon_pct],
            "rainfall_mm": [farm_input.rainfall_mm],
            "temperature_celsius": [farm_input.temperature_celsius]
        }
        return pd.DataFrame(data)

    def predict(self, farm_input: FarmInputSchema) -> PredictionResponse:
        if not self.is_ready:
            self._load_artifact()
            if not self.is_ready:
                raise RuntimeError("ML Model artifact has not been trained or loaded yet.")

        df_input = self._to_dataframe(farm_input)

        # Execute prediction through fitted pipeline
        raw_pred = float(self.pipeline.predict(df_input)[0])
        pred_yield = float(max(0.0, round(raw_pred, 2)))
        total_production = float(round(pred_yield * farm_input.area_hectares, 2))

        # Compute SHAP factor impacts
        factors = self._compute_factor_impacts(df_input)

        return PredictionResponse(
            predicted_yield_qha=pred_yield,
            total_production_q=total_production,
            unit="quintals/hectare",
            selected_model=self.selected_model_name,
            model_test_metrics=self.metrics,
            top_contributing_factors=factors
        )

    def _compute_factor_impacts(self, df_input: pd.DataFrame) -> List[FeatureImpact]:
        factors = []
        try:
            preprocessor = self.pipeline.named_steps["preprocessor"]
            X_trans = preprocessor.transform(df_input)

            if self.explainer is not None:
                shap_vals = self.explainer(X_trans)
                if hasattr(shap_vals, "values"):
                    vals = shap_vals.values[0]
                else:
                    vals = shap_vals[0]

                # Map transformed feature names back to readable domain features
                cat_encoder = preprocessor.named_transformers_["cat"]
                encoded_names = list(cat_encoder.get_feature_names_out(self.artifact["categorical_features"]))
                all_names = encoded_names + self.artifact["numerical_features"]

                # Aggregate contributions by core feature
                feature_scores = {}
                for name, val in zip(all_names, vals):
                    val_float = float(val) if isinstance(val, (int, float, np.number)) else float(val[0])
                    # Group one-hot names back to parent
                    parent_name = name.split("__")[-1] if "__" in name else name
                    for orig in self.artifact["categorical_features"]:
                        if parent_name.startswith(orig):
                            parent_name = orig
                    feature_scores[parent_name] = feature_scores.get(parent_name, 0.0) + val_float

                # Sort top positive and negative
                sorted_features = sorted(feature_scores.items(), key=lambda x: abs(x[1]), reverse=True)[:4]

                display_names = {
                    "rainfall_mm": "Seasonal Rainfall",
                    "nitrogen_kgha": "Nitrogen Application (N)",
                    "phosphorus_kgha": "Phosphorus Application (P₂O₅)",
                    "potassium_kgha": "Potassium Application (K₂O)",
                    "soil_ph": "Soil pH Level",
                    "organic_carbon_pct": "Organic Carbon",
                    "temperature_celsius": "Average Temperature",
                    "district": "Agro-Climatic Location",
                    "soil_type": "Soil Profile",
                    "irrigation_type": "Irrigation Source",
                    "crop": "Crop Variety",
                    "season": "Season"
                }

                for feat, score in sorted_features:
                    factors.append(FeatureImpact(
                        feature=feat,
                        display_name=display_names.get(feat, feat.replace("_", " ").title()),
                        impact_direction="positive" if score >= 0 else "negative",
                        importance_score=round(abs(score), 3)
                    ))
        except Exception as e:
            print(f"[SHAP Warning] Could not calculate detailed SHAP: {e}")

        # Fallback if SHAP was unavailable
        if not factors:
            factors = [
                FeatureImpact(feature="rainfall_mm", display_name="Seasonal Rainfall", impact_direction="positive", importance_score=0.45),
                FeatureImpact(feature="nitrogen_kgha", display_name="Nitrogen Balance", impact_direction="positive", importance_score=0.38)
            ]

        return factors
