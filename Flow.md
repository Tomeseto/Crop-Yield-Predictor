# System Flow & Data Lifecycle

This document defines the exact execution flows, data lifecycles, and cross-layer contracts for the AI-Powered Crop Yield Prediction and Optimization platform, implementing the architecture specified in `Architecture.md`.

---

## 1. High-Level Architecture Flow

```text
React Frontend (Vite)
       │
       │ HTTP REST (JSON)
       ▼
Node.js + Express API Backend
   ├── Validates Request & Handles Auth / Sessions
   ├── Reads / Writes Application State to Database (PostgreSQL)
   └── Forwards ML Payloads via internal REST
       │
       ▼ HTTP POST (Internal)
Python ML Service (FastAPI)
   ├── Loads Saved Preprocessor & Selected Model Pipeline (.joblib)
   ├── Preprocesses Features (matching training phase)
   ├── Executes Model Inference (Yield estimate in q/ha)
   ├── Computes SHAP Feature Contributions (relative factor impacts)
   ├── Evaluates What-If Differential Inferences (real delta calculation)
   └── Executes Scipy Constrained Optimization (with documented agronomic guardrails)
       │
       ▼ Returns Prediction & Explanation Payload
Node.js Backend Persists Log to Database
       │
       ▼ Returns Enriched JSON Response
React Frontend Renders Dashboard / Cards / Charts (Loading -> Success/Error/Empty)
```

---

## 2. Core Operational Flows

### 2.1 Traceable Yield Prediction Flow

```
[ Farmer / Officer enters plot data in React UI ]
  (District, Soil Type, N, P, K, pH, Rainfall, Season, Crop)
         │
         ▼
[ Client Form Validation & Unit Tagging ]
  (Ensures no negative values, tags units: kg/ha, mm, °C, ha)
         │
         ▼
[ POST /api/predictions ]  -> (Node.js / Express API)
         │
         ▼
[ Express Server-Side Validation Middleware ]
  - Checks required fields & data types
  - Validates inputs against verified ranges established during dataset EDA
  - Returns 400 Bad Request if invalid
         │
         ▼
[ Forward to Python ML Service: POST http://localhost:8000/predict ]
         │
         ▼
[ FastAPI ML Service (Python) ]
  - Ingests Pydantic schema
  - Transforms raw input through fitted Preprocessor pipeline
  - Runs model inference: `predicted_yield = model.predict(X_preprocessed)`
  - Computes SHAP attribution vector: `shap_values = explainer(X_preprocessed)`
  - Returns structured ML result and model evaluation context (e.g. Model Test RMSE)
         │
         ▼
[ Node.js Persists Prediction Record in Database ]
  - Stores input features, predicted yield, SHAP summary, timestamp, and user/farm ID
         │
         ▼
[ Node.js Returns 200 OK to React Frontend ]
         │
         ▼
[ React UI Renders Yield Estimate Card, Influencing Factors, and Model Context ]
```

---

### 2.2 Real What-If Scenario Simulation Flow

Per `AI_RULES.md` (Rules 70–75), the What-If Simulator **never hardcodes fake percentage improvements**. It performs dual real model inferences.

```
[ User adjusts scenario slider in React UI ]
  (e.g., Modify Potassium application rate)
         │
         ▼
[ Debounced POST /api/simulate/what-if ] -> (Node.js API)
         │
         ▼
[ Forward to Python ML Service: POST http://localhost:8000/simulate ]
         │
         ▼
[ Python ML Service Executes Dual Inference ]
  1. Base Inference: y_base = model.predict(preprocess(base_inputs))
  2. Scenario Inference: y_scenario = model.predict(preprocess(modified_inputs))
  3. Mathematical Delta: delta_yield = y_scenario - y_base
  4. Percentage Delta: pct_change = (delta_yield / y_base) * 100
  5. Economic Impact: delta_revenue = delta_yield * msp_price; delta_cost = cost(mod) - cost(base); net_gain = delta_revenue - delta_cost
         │
         ▼
[ Returns Computed Mathematical Comparison to Node.js -> React UI ]
         │
         ▼
[ React UI Displays Real Differential Yield & Economic Net Gain ]
```

---

### 2.3 Prescriptive Optimization Flow (Input Advisory)

```
[ User Requests Fertilizer / Input Optimization ]
  (Target Crop, Location, Soil Test N-P-K, Budget ceiling)
         │
         ▼
[ POST /api/recommendations/optimize ] -> (Node.js API)
         │
         ▼
[ Forward to Python ML Service: POST http://localhost:8000/optimize ]
         │
         ▼
[ Python Scipy Constrained Optimizer Execution ]
  - Objective: Maximize Net Profit = (Yield(N, P, K) * MSP) - (Cost_N*N + Cost_P*P + Cost_K*K)
  - Subject to:
      * Valid agronomic boundaries documented from official agricultural guidelines
      * Total Cost <= Budget
  - Solves for optimal (N*, P*, K*)
  - Converts chemical N, P, K into commercial fertilizer bags (Urea 46%, DAP 18-46-0, MOP 60%)
  - Generates basal & top-dressing split schedule
         │
         ▼
[ Node.js Receives Structured Advisory & Returns to Frontend ]
         │
         ▼
[ React UI Renders Actionable Schedule Card with Commercial Fertilizer Quantities ]
```

---

### 2.4 Prediction History & Analytics Flow

```
[ User Navigates to History / Dashboard View ]
         │
         ▼
[ GET /api/predictions/history ] -> (Node.js API)
         │
         ▼
[ Node.js Queries Database ]
  - Fetches past prediction records ordered by date descending
         │
         ▼
[ If 0 records found ]
  -> Returns 200 OK with empty list `[]`
  -> React UI renders clean Empty State ("No predictions recorded yet. Create your first prediction.")
         │
         ▼
[ If records found ]
  -> Returns array of past prediction records
  -> React UI renders interactive history table and yield trend chart
```

---

## 3. UI State Lifecycle Matrix (Across All Flows)

| State | Express API & ML Service Behavior | React Frontend UI Representation |
| :--- | :--- | :--- |
| **Loading** | Processing request asynchronously | Skeleton placeholders, disabled buttons with spinner |
| **Success (200)** | Returns validated JSON payload | Data cards, metric badges, charts, and advice |
| **Validation Error (400)**| Returns array of field errors | Inline red validation messages on offending fields |
| **ML Service Down (503)** | Returns `{ error: "ML Service unavailable" }` | Friendly banner: "Prediction engine is starting up. Please retry in a moment." |
| **Empty State (200 [])** | Returns empty collection | Informative empty illustration and CTA button |
| **Server Error (500)** | Logs traceback securely to server log | Generic error toast: "An error occurred. Please try again." |

---

## 4. Cross-Layer Units & Consistency Contract

| Metric | Code Key | Standard Unit | UI Display | Verification Requirement |
| :--- | :--- | :--- | :--- | :--- |
| Farm Area | `area_hectares` | `ha` | `Hectares (ha)` | Validated strictly $> 0$ |
| Nitrogen | `nitrogen_kgha` | `kg/ha` | `kg/ha (N)` | Validated against dataset support |
| Phosphorus | `phosphorus_kgha` | `kg/ha` | `kg/ha (P₂O₅)` | Validated against dataset support |
| Potassium | `potassium_kgha` | `kg/ha` | `kg/ha (K₂O)` | Validated against dataset support |
| Soil pH | `soil_ph` | pH unit | `pH` | Validated against dataset support |
| Rainfall | `rainfall_mm` | `mm` | `mm` | Validated against dataset support |
| Temperature | `temperature_celsius` | `°C` | `°C` | Validated against dataset support |
| Predicted Yield | `predicted_yield_qha` | `q/ha` | `Quintals / Hectare (q/ha)` | Validated non-negative |
