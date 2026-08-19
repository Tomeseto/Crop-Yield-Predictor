# Technical Architecture Decisions (ADR)

This file documents all major architectural, technical, and structural decisions for the AI-Powered Crop Yield Prediction and Optimization system.

Each decision follows the standard Architecture Decision Record (ADR) format: **Context, Decision, Consequences, and Alternatives Considered**.

---

## ADR Index
- [ADR-001: Decoupled Multi-Service Architecture for Hackathon MVP](#adr-001-decoupled-multi-service-architecture-for-hackathon-mvp)
- [ADR-002: Backend Services Split — Node.js/Express API + Python/FastAPI ML Service](#adr-002-backend-services-split--nodejs-express-api--python-fastapi-ml-service)
- [ADR-003: Database Engine — PostgreSQL / Structured Persistence](#adr-003-database-engine--postgresql--structured-persistence)
- [ADR-004: Empirical ML Model Selection & Evaluation Strategy](#adr-004-empirical-ml-model-selection--evaluation-strategy)
- [ADR-005: Prescriptive Optimization Strategy & Verified Agronomic Sources](#adr-005-prescriptive-optimization-strategy--verified-agronomic-sources)
- [ADR-006: Frontend Stack & Government Enterprise UI Aesthetics](#adr-006-frontend-stack--government-enterprise-ui-aesthetics)
- [ADR-007: Cross-System Units & Feature Naming Standards](#adr-007-cross-system-units--feature-naming-standards)
- [ADR-008: Security, Secret Management & Data Integrity Policy](#adr-008-security-secret-management--data-integrity-policy)

---

## ADR-001: Decoupled Multi-Service Architecture for Hackathon MVP

### Context
Per `Architecture.md`, the system requires clear separation of responsibilities between client application logic, data persistence, and specialized Python-based scientific/machine learning computations.

### Decision
We adopt a decoupled architecture:
```
React Frontend (Vite)
       │
       ▼ (REST API)
Node.js + Express API
   ├── Database (PostgreSQL)
   └── Python ML Service (FastAPI)
            └── Selected Model Pipeline & Optimization Engine
```
- **Frontend:** Handles user interaction, form inputs, visualization, and localization.
- **Node.js Backend:** Handles application REST endpoints, input validation middleware, user/farm state, prediction history persistence, and business coordination.
- **Python ML Service:** Dedicated microservice hosting candidate model evaluation/inference, explainers, What-If simulation engine, and constrained optimization.

### Consequences
- **Positive:** Clean separation of concerns; enables rapid frontend/backend web iteration in Node.js while keeping heavy data science/ML workflows purely in Python.
- **Negative:** Requires running two backend processes during development (`npm run dev` for Express on port 5000, `uvicorn` for FastAPI on port 8000).

---

## ADR-002: Backend Services Split — Node.js/Express API + Python/FastAPI ML Service

### Context
The application backend needs to provide CRUD endpoints, database persistence, and request routing, while ML inference and optimization require access to Python scientific libraries (`scikit-learn`, `scipy`, `shap`, `pandas`).

### Decision
1. **Application Backend:** Node.js with Express, providing clean JSON REST endpoints and input validation middleware.
2. **ML Service:** FastAPI (Python), exposing internal endpoints (`/predict`, `/simulate`, `/optimize`) called by the Node.js API.
3. Communication between Node.js and Python occurs over internal HTTP REST with structured JSON payloads.

### Consequences
- **Positive:** Type-safe, isolated Python runtime without complex Node-to-Python IPC bindings or spawning child processes.
- **Negative:** Node.js must gracefully handle ML service downtime (circuit breaker / structured 503 error responses).

---

## ADR-003: Database Engine — MongoDB with Mongoose

### Context
Agricultural predictions, What-If simulation outputs, and farmer advisory logs have hierarchical attributes (e.g. variable-length SHAP factor contributions, split-application stages, flexible soil test parameters). We need a flexible, document-based schema with schema validation.

### Decision
We select **MongoDB** with **Mongoose ODM**:
- The backend connects to MongoDB via Mongoose using `MONGODB_URI`.
- The `PredictionLog` schema defines strict types and domain constraints (area, N, P, K, pH, rainfall).
- A local structured persistence fallback is maintained to ensure the application remains operable even during offline development or database maintenance.

### Consequences
- **Positive:** Natural fit for JSON-native predictions, flexible embedding of nested SHAP explanations, zero SQL migration friction, instant cloud deployment with MongoDB Atlas.
- **Negative:** Requires active MongoDB service or Atlas connection string.

---

## ADR-004: Empirical ML Model Selection & Evaluation Strategy

### Context
Per `AI_RULES.md` (Rules 47–57), we must never fabricate metrics ($R^2$, RMSE, MAE) or declare a model as "best" before running actual evaluation. Model selection must be strictly empirical.

### Decision
1. **Candidate Models:** Benchmark multiple standard candidate regressors (e.g. Ridge Regression, Random Forest, Gradient Boosted Trees / LightGBM) on the cleaned dataset.
2. **Evaluation Protocol:** Spatial/temporal train/test split. Report genuine, measured metrics ($R^2$, RMSE in quintals/ha, MAE, MAPE).
3. **Selection Criteria:** Select the best model based on out-of-sample RMSE and generalizability tradeoffs.
4. **Reproducibility:** Save the fitted preprocessor (scaler + encoder) and selected model together in a serialized pipeline artifact (`.joblib`).
5. **Explainability & Uncertainty:**
   - Integrate SHAP (TreeExplainer or LinearExplainer based on selected model) for feature attribution.
   - For uncertainty, report the verified model test-set evaluation metrics (RMSE / MAE) rather than inventing uncalibrated percentage confidence bounds.

### Consequences
- **Positive:** Grounded purely in empirical data; avoids premature commitments to specific algorithms; zero fabricated metrics.
- **Negative:** Requires running full benchmark script before finalizing serialized artifact.

---

## ADR-005: Prescriptive Optimization Strategy & Verified Agronomic Sources

### Context
Per `AI_RULES.md` (Rules 61–64, 76–80), recommendations must not be arbitrary heuristics, nor can domain rules be invented. All agronomic guardrails must cite documented agricultural sources.

### Decision
1. **Source Documentation:** Before implementing optimization rules, record the specific domain sources in a reference document (e.g., OUAT "Package of Practices for Kharif Crops", ICAR Rice Knowledge Management Portal, and Odisha Soil Health Card guidelines).
2. **Mathematical Formulation:** Implement constrained optimization via `scipy.optimize.minimize` (SLSQP):
   - **Objective:** $\max NetProfit = (PredictedYield(N, P, K) \times Price_{MSP}) - InputCosts(N, P, K)$
   - **Constraints:** Boundaries derived directly from the verified domain sources and observed data distributions.
3. **Translation:** Convert chemical nutrients into real commercial fertilizer units (Urea, DAP, MOP) based on standard chemical conversion factors (Urea: 46% N, DAP: 18% N & 46% P₂O₅, MOP: 60% K₂O).

### Consequences
- **Positive:** Grounded in mathematical optimization and verifiable agronomic literature; no invented scientific rules.
- **Negative:** Optimization bounds are constrained to the valid support region of the trained model.

---

## ADR-006: Frontend Stack & Government Enterprise UI Aesthetics

### Context
Per `AI_RULES.md` (Rules 23–26), the UI must look like a serious, professional government/enterprise application (Odisha Department of Agriculture style). It must avoid flashy animations, glassmorphism, 3D gimmicks, and visual clutter, while prioritizing clean hierarchy, readable typography, restrained colors, accessible forms, and clear navigation.

### Decision
- **Framework:** React with Vite (TypeScript) for fast bundling and clean component hierarchy.
- **Design System:** Professional civic / government palette:
  - Deep Navy / Slate header and navigation
  - Agricultural Forest Green accents (restrained, purposeful)
  - Neutral warm grays for card backgrounds and borders
  - High-contrast, accessible typography (Inter / Roboto)
- **UI States:** Mandatory handling of 4 states across all async views: *Loading*, *Success*, *Error*, and *Empty*.

### Consequences
- **Positive:** Fast development, clean and accessible interface.
- **Negative:** Avoids visual gimmicks in favor of usability, clarity, and domain credibility.

---

## ADR-007: Cross-System Units & Feature Naming Standards

### Context
Per `AI_RULES.md` (Rules 58–60), mixing units (e.g., kg/acre vs kg/ha) or inconsistent feature naming leads to critical agronomic calculation errors.

### Decision
Standardize all units and parameter keys across React Frontend, Node.js API, Database, and Python ML Service:

| Concept | Canonical Key | Standard Unit | UI Display String |
| :--- | :--- | :--- | :--- |
| Farm Area | `area_hectares` | Hectares (`ha`) | `Hectares (ha)` |
| Nitrogen Dose | `nitrogen_kgha` | kg / hectare | `kg/ha (N)` |
| Phosphorus Dose | `phosphorus_kgha` | kg / hectare | `kg/ha (P₂O₅)` |
| Potassium Dose | `potassium_kgha` | kg / hectare | `kg/ha (K₂O)` |
| Soil pH | `soil_ph` | pH unit | `pH` |
| Organic Carbon | `organic_carbon_pct` | Percentage (%) | `% Organic Carbon` |
| Seasonal Rainfall | `rainfall_mm` | Millimeters (`mm`) | `mm` |
| Temperature | `temperature_celsius`| Degrees Celsius (`°C`)| `°C` |
| Crop Yield | `predicted_yield_qha`| Quintals / hectare | `Quintals / Hectare (q/ha)` |
| Total Production | `total_production_q` | Quintals (`q`) | `Quintals (q)` |

### Consequences
- **Positive:** Absolute consistency across the entire stack; impossible to misinterpret units.

---

## ADR-008: Security, Secret Management & Data Integrity Policy

### Context
Per `AI_RULES.md` (Rules 36–40, 81–86, 92–97), security and data integrity must be maintained at all times. No fake analytics, no committed secrets, and strict server-side validation.

### Decision
1. **Secret Management:** All configuration parameters and database connection strings load from `.env`. `.env` is strictly git-ignored; `.env.example` provides template variables.
2. **Server-Side Validation:** Backend never relies on client validation; all inputs pass through validators enforcing verified physical and agricultural ranges.
3. **Data Integrity:** Empty datasets return empty responses with explicit empty UI states. No hardcoded fake statistics or fabricated history.
4. **Error Masking:** Stack traces and internal DB schemas are logged to server logs only; clients receive sanitized error payloads with actionable messages.
