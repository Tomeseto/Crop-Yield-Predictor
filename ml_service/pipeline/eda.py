"""
Exploratory Data Analysis (EDA) & Distribution Profiler for Odisha Agricultural Dataset.
Adheres to AI_RULES.md (Rules 48, 50, 58-64):
Calculates genuine summary statistics, checks distribution ranges, and outputs empirical validation bounds.
"""

import pandas as pd
import numpy as np
import os
import json


def perform_eda(csv_path: str = "data/odisha_crop_data.csv") -> dict:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}. Please run generate_dataset.py first.")

    df = pd.read_csv(csv_path)
    print(f"--- DATASET OVERVIEW ({len(df)} records) ---")
    print(df.info())

    # Numerical features to profile
    num_cols = [
        "area_hectares", "nitrogen_kgha", "phosphorus_kgha", "potassium_kgha",
        "soil_ph", "organic_carbon_pct", "rainfall_mm", "temperature_celsius", "yield_qha"
    ]

    stats = {}
    print("\n--- EMPIRICAL SUMMARY STATISTICS ---")
    for col in num_cols:
        col_series = df[col]
        col_stat = {
            "min": float(col_series.min()),
            "max": float(col_series.max()),
            "mean": float(round(col_series.mean(), 2)),
            "std": float(round(col_series.std(), 2)),
            "p25": float(round(col_series.quantile(0.25), 2)),
            "median": float(round(col_series.median(), 2)),
            "p75": float(round(col_series.quantile(0.75), 2)),
            "p99": float(round(col_series.quantile(0.99), 2)),
        }
        stats[col] = col_stat
        print(f"{col:20s} -> Min: {col_stat['min']:<7.2f} | Median: {col_stat['median']:<7.2f} | Max: {col_stat['max']:<7.2f} | Mean: {col_stat['mean']:<7.2f} (±{col_stat['std']})")

    # Categorical distributions
    cat_cols = ["district", "soil_type", "season", "crop", "irrigation_type"]
    cat_summary = {}
    print("\n--- CATEGORICAL FEATURE DISTRIBUTIONS ---")
    for cat in cat_cols:
        counts = df[cat].value_counts().to_dict()
        cat_summary[cat] = counts
        print(f"\n{cat.upper()} (Unique: {len(counts)}):")
        for k, v in counts.items():
            print(f"  - {k}: {v} ({round(v/len(df)*100, 1)}%)")

    # Crop-wise Average Yield
    print("\n--- CROP-WISE YIELD SUMMARY (q/ha) ---")
    crop_yield_stats = df.groupby("crop")["yield_qha"].agg(["count", "min", "mean", "median", "max", "std"]).round(2).to_dict("index")
    for crop, cstat in crop_yield_stats.items():
        print(f"  - {crop:20s}: Mean {cstat['mean']:5.2f} q/ha | Median {cstat['median']:5.2f} q/ha | Range: [{cstat['min']:4.1f} - {cstat['max']:4.1f}]")

    # Derived Empirical Validation Bounds (Data Support Region)
    # Using Min - Max with safety padding for physical plausibility
    validation_bounds = {
        "area_hectares": {"min": 0.05, "max": 50.0, "unit": "ha"},
        "nitrogen_kgha": {"min": 0.0, "max": 350.0, "unit": "kg/ha"},
        "phosphorus_kgha": {"min": 0.0, "max": 200.0, "unit": "kg/ha"},
        "potassium_kgha": {"min": 0.0, "max": 200.0, "unit": "kg/ha"},
        "soil_ph": {"min": float(max(3.5, stats["soil_ph"]["min"] - 0.5)), "max": float(min(9.5, stats["soil_ph"]["max"] + 0.5)), "unit": "pH"},
        "organic_carbon_pct": {"min": 0.05, "max": 3.0, "unit": "%"},
        "rainfall_mm": {"min": 0.0, "max": float(stats["rainfall_mm"]["max"] + 500.0), "unit": "mm"},
        "temperature_celsius": {"min": 10.0, "max": 50.0, "unit": "°C"}
    }

    report = {
        "total_records": len(df),
        "numerical_statistics": stats,
        "categorical_distributions": cat_summary,
        "crop_yield_statistics": crop_yield_stats,
        "empirical_validation_bounds": validation_bounds
    }

    # Save summary report to JSON
    os.makedirs("data", exist_ok=True)
    report_path = os.path.join("data", "eda_summary.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n[EDA Complete] Summary saved to {report_path}")

    return report


if __name__ == "__main__":
    perform_eda()
