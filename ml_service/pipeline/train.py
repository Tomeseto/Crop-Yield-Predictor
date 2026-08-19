"""
Empirical Model Training, Benchmarking & Serialization Pipeline
Adheres to AI_RULES.md (Rules 47-57):
- Evaluates candidate models on an identical test split.
- Records genuine, un-fabricated metrics (R², RMSE, MAE, MAPE).
- Selects the best model strictly based on test performance.
- Saves the full reproducible pipeline (preprocessor + model + SHAP explainer).
"""

import os
import joblib
import pandas as pd
import numpy as np
import shap

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error, mean_absolute_percentage_error


def train_and_benchmark(csv_path: str = "data/odisha_crop_data.csv", output_dir: str = "saved_models") -> dict:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}. Run generate_dataset.py first.")

    df = pd.read_csv(csv_path)

    # Define feature groups
    categorical_features = ["district", "soil_type", "season", "crop", "irrigation_type"]
    numerical_features = [
        "area_hectares", "nitrogen_kgha", "phosphorus_kgha", "potassium_kgha",
        "soil_ph", "organic_carbon_pct", "rainfall_mm", "temperature_celsius"
    ]
    target_col = "yield_qha"

    X = df[categorical_features + numerical_features]
    y = df[target_col]

    # Strict 80-20 Train/Test Split (Rule #54: No leakage)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"--- DATASET SPLIT ---")
    print(f"Total: {len(df)} | Train: {len(X_train)} | Test: {len(X_test)}")

    # Preprocessor definition
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            ("num", StandardScaler(), numerical_features)
        ]
    )

    # Candidate Models to benchmark empirically
    candidate_models = {
        "Ridge_Regression (Baseline)": Ridge(alpha=1.0),
        "Random_Forest_Regressor": RandomForestRegressor(n_estimators=120, max_depth=14, min_samples_split=4, random_state=42, n_jobs=-1),
        "Hist_Gradient_Boosting_Regressor": HistGradientBoostingRegressor(max_iter=150, max_depth=8, learning_rate=0.08, min_samples_leaf=10, random_state=42)
    }

    results = {}
    fitted_pipelines = {}

    print("\n--- MODEL BENCHMARKING (MEASURED ON TEST SET) ---")
    for name, model in candidate_models.items():
        pipe = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", model)
        ])

        # Fit on training data only
        pipe.fit(X_train, y_train)

        # Predict on test set
        y_pred = pipe.predict(X_test)

        # Compute genuine evaluation metrics
        r2 = float(r2_score(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        mae = float(mean_absolute_error(y_test, y_pred))
        mape = float(mean_absolute_percentage_error(y_test, y_pred) * 100)

        results[name] = {
            "r2_score": round(r2, 4),
            "rmse_qha": round(rmse, 3),
            "mae_qha": round(mae, 3),
            "mape_pct": round(mape, 2)
        }
        fitted_pipelines[name] = pipe

        print(f"[{name}]")
        print(f"   R² Score:  {r2:.4f}")
        print(f"   RMSE:      {rmse:.3f} q/ha")
        print(f"   MAE:       {mae:.3f} q/ha")
        print(f"   MAPE:      {mape:.2f}%")

    # Select winning model strictly on lowest test RMSE
    best_model_name = min(results, key=lambda k: results[k]["rmse_qha"])
    best_pipeline = fitted_pipelines[best_model_name]
    best_metrics = results[best_model_name]

    print(f"\n========================================================")
    print(f"WINNING MODEL SELECTED: {best_model_name}")
    print(f"Test RMSE: {best_metrics['rmse_qha']} q/ha | R²: {best_metrics['r2_score']}")
    print(f"========================================================")

    # Fit SHAP Explainer on preprocessed training sample
    print("\nFitting SHAP explainer for explainability...")
    preprocessor_fitted = best_pipeline.named_steps["preprocessor"]
    regressor_fitted = best_pipeline.named_steps["regressor"]

    # Transform a background sample for SHAP
    X_train_transformed = preprocessor_fitted.transform(X_train.sample(min(300, len(X_train)), random_state=42))

    # Feature names after One-Hot Encoding
    cat_encoder = preprocessor_fitted.named_transformers_["cat"]
    encoded_cat_names = list(cat_encoder.get_feature_names_out(categorical_features))
    all_feature_names = encoded_cat_names + numerical_features

    # Create TreeExplainer or generic Explainer
    if hasattr(regressor_fitted, "predict"):
        try:
            explainer = shap.TreeExplainer(regressor_fitted, data=X_train_transformed)
        except Exception:
            explainer = shap.Explainer(regressor_fitted.predict, X_train_transformed)
    else:
        explainer = shap.Explainer(regressor_fitted.predict, X_train_transformed)

    # Save artifacts
    os.makedirs(output_dir, exist_ok=True)
    artifact_payload = {
        "pipeline": best_pipeline,
        "selected_model_name": best_model_name,
        "metrics": best_metrics,
        "all_benchmark_results": results,
        "explainer": explainer,
        "categorical_features": categorical_features,
        "numerical_features": numerical_features,
        "all_feature_names": all_feature_names,
        "train_columns": list(X.columns)
    }

    artifact_path = os.path.join(output_dir, "crop_yield_pipeline.joblib")
    joblib.dump(artifact_payload, artifact_path)
    print(f"Artifact serialized successfully to: {artifact_path}")

    return artifact_payload


if __name__ == "__main__":
    train_and_benchmark()
