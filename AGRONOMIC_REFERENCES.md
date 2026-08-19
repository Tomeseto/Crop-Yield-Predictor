# Agronomic References & Domain Standards

This document records the official agricultural references, standard fertilizer conversion formulas, and verified agronomic guidelines for major crops in Odisha.

All validation ranges, optimization constraints, and recommendation formulas in this project are grounded in the sources cited below.

---

## 1. Primary Domain Literature & Government Sources

1. **OUAT (Odisha University of Agriculture and Technology):**
   - *Package of Practices for Kharif Crops* (Bhubaneswar, Odisha).
   - *Package of Practices for Rabi Crops* (Bhubaneswar, Odisha).
   - *OUAT Recommendations on Soil Health Management and Balanced Fertilizer Application in Acidic Soils of Odisha.*
2. **ICAR (Indian Council of Agricultural Research) & NRRI (National Rice Research Institute, Cuttack):**
   - *Rice Knowledge Management Portal (RKMP) — Nutrient Management for Eastern India.*
   - *ICAR-NRRI Good Agricultural Practices (GAP) for Rainfed and Irrigated Rice Ecology in Odisha.*
3. **Department of Agriculture & Farmers' Empowerment, Government of Odisha:**
   - *Odisha Soil Health Card (SHC) Scheme — State Level Soil Nutrient Critical Limits & Ratings.*
   - *Odisha Millets Mission (OMM) — Recommended Agronomic Practices for Ragi/Mandia Cultivation.*
4. **Directorate of Economics & Statistics (DES), Government of Odisha:**
   - *Odisha Agricultural Statistics Reports (Historical Yields & Acreage by District).*

---

## 2. Chemical to Commercial Fertilizer Conversions

Farmers do not apply pure elemental Nitrogen (N), Phosphorus (P₂O₅), or Potassium (K₂O). They purchase commercial fertilizers. Standard conversion formulas:

### A. Commercial Fertilizer Nutrient Compositions
- **Urea:** Contains $46\% \text{ Nitrogen (N)}$.
  $$\text{Urea required (kg)} = \frac{\text{Nitrogen requirement (kg)}}{0.46} \approx \text{Nitrogen (kg)} \times 2.174$$
  *Standard bag size in India:* $45\text{ kg}$ (or $50\text{ kg}$).

- **DAP (Di-Ammonium Phosphate):** Contains $18\% \text{ Nitrogen (N)}$ and $46\% \text{ Phosphorus (P}_2\text{O}_5)$.
  $$\text{DAP required (kg)} = \frac{\text{Phosphorus requirement (P}_2\text{O}_5\text{ in kg)}}{0.46} \approx \text{P}_2\text{O}_5\text{ (kg)} \times 2.174$$
  *Nitrogen supplied by DAP:* $\text{N}_{\text{from DAP}} = \text{DAP (kg)} \times 0.18$
  *Remaining Nitrogen to be supplied by Urea:* $\text{N}_{\text{remaining}} = \max(0, \text{Target N} - \text{N}_{\text{from DAP}})$

- **MOP (Muriate of Potash / Potassium Chloride):** Contains $60\% \text{ Potassium (K}_2\text{O})$.
  $$\text{MOP required (kg)} = \frac{\text{Potassium requirement (K}_2\text{O in kg)}}{0.60} \approx \text{K}_2\text{O (kg)} \times 1.667$$
  *Standard bag size in India:* $50\text{ kg}$.

---

## 3. Recommended N-P-K Ranges by Crop (Odisha Conditions)

According to OUAT & ICAR-NRRI guidelines:

| Crop Category | Dominant Odisha Crops | Recommended N:P:K (kg/ha) Range | Sowing Window | Split Application Schedule |
| :--- | :--- | :--- | :--- | :--- |
| **High-Yielding Paddy (Kharif, Irrigated/Favorable Rainfed)** | Swarna, Pooja, Lalat, MTU 1010 | $80 - 100 : 40 - 50 : 40 - 50$ | June 15 – July 15 | • Basal: 25% N + 100% P + 50% K<br>• Tillering (21 DAT): 50% N<br>• Panicle Initiation (45 DAT): 25% N + 50% K |
| **Rainfed Upland Paddy** | Vandana, Sahbhagi Dhan | $40 - 60 : 20 - 30 : 20 - 30$ | June 10 – June 30 | • Basal: 50% N + 100% P + 100% K<br>• Tillering: 50% N |
| **Finger Millet (Ragi / Mandia)** | GPU-28, Bhairabi, Chilika | $40 - 60 : 20 - 30 : 20 - 30$ | July 1 – July 25 | • Basal: 50% N + 100% P + 100% K<br>• 25-30 Days After Sowing: 50% N |
| **Groundnut (Kharif / Rabi)** | TMV-2, AK 12-24, Smruti | $20 - 30 : 40 - 60 : 40 - 60$ | July (Kharif) / Nov (Rabi) | • Basal: 100% N + 100% P + 100% K + Gypsum at flowering |
| **Pulses (Moong / Biri / Arhar)** | TARM-1, PU-31, UPAS-120 | $20 - 25 : 40 - 50 : 20 - 25$ | June–July / Oct–Nov | • Basal: 100% N + 100% P + 100% K (Rhizobium biofertilizer) |

---

## 4. Soil pH Management & Critical Thresholds (Odisha Soils)

Over 70% of Odisha's cultivable soils are acidic (pH < 6.5), particularly in the North Western Plateau (Sundargarh) and North Eastern Ghat (Kandhamal/Koraput):

- **Strongly Acidic (pH < 5.0):** High Aluminum/Iron toxicity, extreme Phosphorus fixation. Agricultural lime application recommended.
- **Moderately Acidic (pH 5.0 – 6.5):** Common in Odisha uplands. Phosphorus availability is reduced.
- **Neutral (pH 6.5 – 7.5):** Optimal nutrient availability for cereals and pulses.
- **Moderately Alkaline / Coastal Saline (pH > 7.5):** Coastal belts (Puri, Jagatsinghpur, Balasore). Salinity management required.

---

## 5. Economic & MSP Reference Parameters (Base Calibration)

- **Paddy (Common) MSP:** $\approx ₹2,300 - ₹2,320\text{ per Quintal}$ (Govt of India / OSAMB 2024-25 baseline).
- **Ragi (Mandia) MSP:** $\approx ₹4,290\text{ per Quintal}$ (Odisha Millets Mission procurement baseline).
- **Subsidized Fertilizer Retail Price Baseline (Approx. Govt MRP):**
  - Urea: $\approx ₹268\text{ per 45 kg bag } (\approx ₹5.95/\text{kg})$
  - DAP: $\approx ₹1,350\text{ per 50 kg bag } (\approx ₹27.00/\text{kg})$
  - MOP: $\approx ₹1,650\text{ per 50 kg bag } (\approx ₹33.00/\text{kg})$
