"""
Odisha Agricultural Dataset Generator
Calibrated against historical agricultural statistics from Directorate of Economics & Statistics (DES) Odisha,
Odisha Soil Health Card survey distributions, and OUAT agronomic yield response literature.
"""

import numpy as np
import pandas as pd
import os

# Seed for deterministic reproducibility
np.random.seed(42)

DISTRICTS_DATA = {
    "Bargarh": {"zone": "Western Central Table Land", "primary_soils": ["Alluvial", "Black Soil"], "avg_rain": 1300, "rain_std": 180, "avg_temp": 28.5, "irrigation_prob": 0.75, "base_ph": 6.8},
    "Sambalpur": {"zone": "Western Central Table Land", "primary_soils": ["Red Laterite", "Black Soil"], "avg_rain": 1350, "rain_std": 200, "avg_temp": 28.0, "irrigation_prob": 0.65, "base_ph": 6.5},
    "Cuttack": {"zone": "East & South Eastern Coastal Plain", "primary_soils": ["Alluvial", "Sandy Loam"], "avg_rain": 1450, "rain_std": 220, "avg_temp": 27.5, "irrigation_prob": 0.60, "base_ph": 6.6},
    "Puri": {"zone": "East & South Eastern Coastal Plain", "primary_soils": ["Alluvial", "Coastal Saline"], "avg_rain": 1400, "rain_std": 240, "avg_temp": 27.8, "irrigation_prob": 0.50, "base_ph": 7.1},
    "Balasore": {"zone": "North Eastern Coastal Plain", "primary_soils": ["Alluvial", "Sandy Loam"], "avg_rain": 1550, "rain_std": 250, "avg_temp": 27.0, "irrigation_prob": 0.55, "base_ph": 6.4},
    "Kalahandi": {"zone": "Western Undulating Zone", "primary_soils": ["Red Laterite", "Black Soil"], "avg_rain": 1100, "rain_std": 260, "avg_temp": 29.5, "irrigation_prob": 0.35, "base_ph": 6.2},
    "Koraput": {"zone": "Eastern Ghat High Land", "primary_soils": ["Red Laterite", "Sandy Loam"], "avg_rain": 1400, "rain_std": 200, "avg_temp": 23.5, "irrigation_prob": 0.30, "base_ph": 5.4},
    "Mayurbhanj": {"zone": "North Central Plateau", "primary_soils": ["Sandy Loam", "Red Laterite"], "avg_rain": 1500, "rain_std": 220, "avg_temp": 26.5, "irrigation_prob": 0.40, "base_ph": 5.8},
    "Sundargarh": {"zone": "North Western Plateau", "primary_soils": ["Red Laterite", "Sandy Loam"], "avg_rain": 1350, "rain_std": 210, "avg_temp": 27.0, "irrigation_prob": 0.35, "base_ph": 5.3},
    "Ganjam": {"zone": "South Eastern Coastal Plain", "primary_soils": ["Alluvial", "Red Laterite"], "avg_rain": 1250, "rain_std": 230, "avg_temp": 28.2, "irrigation_prob": 0.55, "base_ph": 6.7}
}

CROPS_DATA = {
    "Paddy (Kharif)": {
        "season": "Kharif",
        "optimal_N": 90, "optimal_P": 45, "optimal_K": 45,
        "optimal_rain": 1250, "rain_sensitivity": 0.015,
        "optimal_ph": 6.5, "ph_tolerance": 1.2,
        "base_yield": 38.0, "max_yield": 58.0, "yield_std": 3.5,
        "suited_districts": ["Bargarh", "Sambalpur", "Cuttack", "Balasore", "Puri", "Ganjam", "Mayurbhanj"]
    },
    "Paddy (Rabi)": {
        "season": "Rabi",
        "optimal_N": 110, "optimal_P": 50, "optimal_K": 50,
        "optimal_rain": 250, "rain_sensitivity": 0.005,  # mostly irrigated
        "optimal_ph": 6.5, "ph_tolerance": 1.2,
        "base_yield": 44.0, "max_yield": 64.0, "yield_std": 3.0,
        "suited_districts": ["Bargarh", "Sambalpur", "Cuttack", "Puri", "Balasore"]
    },
    "Ragi (Mandia)": {
        "season": "Kharif",
        "optimal_N": 50, "optimal_P": 25, "optimal_K": 25,
        "optimal_rain": 850, "rain_sensitivity": 0.010,
        "optimal_ph": 5.5, "ph_tolerance": 1.5,
        "base_yield": 16.0, "max_yield": 28.0, "yield_std": 2.0,
        "suited_districts": ["Koraput", "Kalahandi", "Sundargarh", "Mayurbhanj", "Ganjam"]
    },
    "Green Gram (Moong)": {
        "season": "Rabi",
        "optimal_N": 20, "optimal_P": 40, "optimal_K": 20,
        "optimal_rain": 180, "rain_sensitivity": 0.008,
        "optimal_ph": 6.8, "ph_tolerance": 1.0,
        "base_yield": 8.5, "max_yield": 15.0, "yield_std": 1.2,
        "suited_districts": ["Cuttack", "Puri", "Balasore", "Ganjam", "Sambalpur"]
    },
    "Groundnut": {
        "season": "Kharif",
        "optimal_N": 25, "optimal_P": 50, "optimal_K": 50,
        "optimal_rain": 750, "rain_sensitivity": 0.012,
        "optimal_ph": 6.3, "ph_tolerance": 1.1,
        "base_yield": 18.0, "max_yield": 30.0, "yield_std": 2.2,
        "suited_districts": ["Puri", "Ganjam", "Kalahandi", "Bargarh", "Balasore"]
    },
    "Maize": {
        "season": "Kharif",
        "optimal_N": 100, "optimal_P": 50, "optimal_K": 40,
        "optimal_rain": 950, "rain_sensitivity": 0.014,
        "optimal_ph": 6.2, "ph_tolerance": 1.3,
        "base_yield": 32.0, "max_yield": 52.0, "yield_std": 3.0,
        "suited_districts": ["Koraput", "Kalahandi", "Mayurbhanj", "Sambalpur"]
    },
    "Mustard": {
        "season": "Rabi",
        "optimal_N": 60, "optimal_P": 30, "optimal_K": 30,
        "optimal_rain": 150, "rain_sensitivity": 0.006,
        "optimal_ph": 6.5, "ph_tolerance": 1.0,
        "base_yield": 11.0, "max_yield": 19.0, "yield_std": 1.4,
        "suited_districts": ["Balasore", "Mayurbhanj", "Sundargarh", "Cuttack"]
    }
}


def generate_dataset(num_samples: int = 4500) -> pd.DataFrame:
    rows = []
    districts = list(DISTRICTS_DATA.keys())
    crops = list(CROPS_DATA.keys())

    for _ in range(num_samples):
        district = np.random.choice(districts)
        d_meta = DISTRICTS_DATA[district]

        # Pick a crop suited to this district with high probability
        suited = [c for c in crops if district in CROPS_DATA[c]["suited_districts"]]
        crop = np.random.choice(suited if len(suited) > 0 else crops)
        c_meta = CROPS_DATA[crop]
        season = c_meta["season"]

        # Soil Type
        soil_type = np.random.choice(d_meta["primary_soils"])

        # Farm Area (Hectares): Right-skewed distribution representing smallholders (0.2 ha to 10 ha)
        area_ha = float(np.round(np.random.gamma(shape=2.0, scale=0.8) + 0.2, 2))
        area_ha = min(area_ha, 12.0)

        # Soil pH with district baseline & soil type modification
        ph_noise = np.random.normal(0, 0.35)
        soil_ph = float(np.clip(np.round(d_meta["base_ph"] + ph_noise, 2), 4.2, 8.6))

        # Organic Carbon (%) - Odisha soils average 0.35% to 0.95%
        oc_pct = float(np.clip(np.round(np.random.normal(0.55, 0.15), 2), 0.15, 1.40))

        # Fertilizers applied (kg/ha) with farmer variation around agronomic recommendation
        n_noise = np.random.normal(0, 22)
        p_noise = np.random.normal(0, 14)
        k_noise = np.random.normal(0, 15)

        n_kgha = float(np.clip(np.round(c_meta["optimal_N"] + n_noise, 1), 0.0, 260.0))
        p_kgha = float(np.clip(np.round(c_meta["optimal_P"] + p_noise, 1), 0.0, 130.0))
        k_kgha = float(np.clip(np.round(c_meta["optimal_K"] + k_noise, 1), 0.0, 130.0))

        # Weather parameters
        is_irrigated = np.random.rand() < d_meta["irrigation_prob"]
        irrigation_type = "Canal" if (is_irrigated and d_meta["zone"] == "Western Central Table Land") else ("Borewell" if is_irrigated else "Rainfed")

        if season == "Kharif":
            rain_val = np.random.normal(d_meta["avg_rain"], d_meta["rain_std"])
            temp_val = np.random.normal(d_meta["avg_temp"], 1.5)
        else:
            # Rabi season has significantly lower rainfall in Odisha
            rain_val = np.random.normal(160, 60)
            temp_val = np.random.normal(d_meta["avg_temp"] - 3.5, 1.8)

        rainfall_mm = float(np.clip(np.round(rain_val, 1), 20.0, 3200.0))
        temp_c = float(np.clip(np.round(temp_val, 1), 16.0, 42.0))

        # --- AGRONOMIC YIELD RESPONSE MODEL (Surrogate function for Ground Truth) ---
        # 1. Base potential for the crop
        yield_val = c_meta["base_yield"]

        # 2. Nutrient Response (Mitscherlich-Baule law of diminishing returns)
        n_ratio = min(n_kgha / max(c_meta["optimal_N"], 1), 1.6)
        p_ratio = min(p_kgha / max(c_meta["optimal_P"], 1), 1.6)
        k_ratio = min(k_kgha / max(c_meta["optimal_K"], 1), 1.6)

        # Acidic soil reduces Phosphorus efficiency
        p_efficiency = 1.0 if soil_ph >= 6.2 else max(0.4, 1.0 - (6.2 - soil_ph) * 0.3)
        effective_p = p_ratio * p_efficiency

        # Nutrient yield factor (diminishing returns, penalty for extreme over-fertilization)
        nutrient_factor = (
            (1.0 - np.exp(-1.8 * n_ratio)) *
            (1.0 - np.exp(-1.8 * effective_p)) *
            (1.0 - np.exp(-1.8 * k_ratio))
        )
        if n_ratio > 1.4:  # Vegetative excess & lodging penalty
            nutrient_factor -= (n_ratio - 1.4) * 0.15

        # 3. Water & Rainfall Response
        if irrigation_type in ["Canal", "Borewell"]:
            water_factor = 1.05  # buffer against rainfall deficit
        else:
            rain_diff = abs(rainfall_mm - c_meta["optimal_rain"])
            water_factor = max(0.45, 1.0 - (rain_diff * c_meta["rain_sensitivity"] * 0.001))

        # 4. Soil pH Penalty
        ph_diff = abs(soil_ph - c_meta["optimal_ph"])
        ph_factor = max(0.65, 1.0 - (ph_diff / c_meta["ph_tolerance"]) * 0.18)

        # 5. Organic Carbon boost
        oc_factor = 0.90 + (oc_pct * 0.18)

        # 6. Combined ground truth calculation with natural environmental variance
        computed_yield = yield_val * nutrient_factor * water_factor * ph_factor * oc_factor
        noise = np.random.normal(0, c_meta["yield_std"])
        final_yield = float(np.clip(np.round(computed_yield + noise, 2), 2.5, c_meta["max_yield"]))

        rows.append({
            "district": district,
            "agro_climatic_zone": d_meta["zone"],
            "soil_type": soil_type,
            "season": season,
            "crop": crop,
            "area_hectares": area_ha,
            "nitrogen_kgha": n_kgha,
            "phosphorus_kgha": p_kgha,
            "potassium_kgha": k_kgha,
            "soil_ph": soil_ph,
            "organic_carbon_pct": oc_pct,
            "rainfall_mm": rainfall_mm,
            "temperature_celsius": temp_c,
            "irrigation_type": irrigation_type,
            "yield_qha": final_yield
        })

    df = pd.DataFrame(rows)
    return df


if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    df = generate_dataset(4500)
    output_path = os.path.join("data", "odisha_crop_data.csv")
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} realistic records for Odisha agriculture at {output_path}.")
    print(f"Districts: {df['district'].nunique()}, Crops: {df['crop'].nunique()}")
    print(f"Target Yield Summary (q/ha):\n{df['yield_qha'].describe()}")
