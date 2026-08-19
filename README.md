# KrushiDoot AI — Crop Yield Prediction & Prescriptive Optimization Platform

> **Target Domain:** Agriculture, FoodTech & Rural Development  
> **Target Entity:** Government of Odisha (Department of Agriculture & Farmers' Empowerment)  
> **System Architecture:** React (Vite) Frontend + Node.js (Express) API + Python (FastAPI) ML Service + PostgreSQL / Structured Persistence

---

## 1. Overview

**KrushiDoot AI** is an enterprise-grade, end-to-end agricultural decision support system designed to empower smallholder farmers and agricultural officers across Odisha's 10 agro-climatic zones.

### Core Capabilities:
1. **Traceable Crop Yield Prediction:** Predicts crop yield (in Quintals/Hectare) from soil chemistry (N, P, K, pH, OC), meteorology (rainfall, temperature), and farm characteristics using empirically benchmarked machine learning models.
2. **Explainable AI (SHAP):** Transparently reveals the top positive and negative agronomic drivers behind every prediction.
3. **Interactive "What-If" Scenario Simulator:** Evaluates dual model inferences to calculate real mathematical yield deltas ($\Delta \text{ Yield}$) and net economic gain/loss in INR (calibrated against MSP and fertilizer costs).
4. **Prescriptive Nutrient Optimization:** Solves constrained mathematical optimization (`scipy.optimize.minimize` SLSQP) to find profit-maximizing N-P-K doses and converts them into commercial fertilizer quantities (Urea 45kg, DAP 50kg, MOP 50kg bags) with split application schedules.
5. **Prediction Audit & History:** Persists prediction records with timestamping and filtering.

---

## 2. Machine Learning Empirical Evaluation

Per `AI_RULES.md`, candidate regressors were evaluated on an identical test split ($n = 900$) of Odisha agricultural records:

| Model Candidate | $R^2$ Score | Test RMSE ($\text{q/ha}$) | Test MAE ($\text{q/ha}$) | Test MAPE ($\%$) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ridge Regression (Baseline)** | $0.8359$ | $3.337$ | $2.542$ | $36.41\%$ | Baseline |
| **Random Forest Regressor** | $0.8828$ | $2.821$ | $2.046$ | $23.68\%$ | Candidate |
| **Hist Gradient Boosting Regressor** | **$0.8843$** | **$2.803$** | **$2.056$** | **$23.48\%$** | **Selected & Deployed** |

*Artifact Serialized:* `ml_service/saved_models/crop_yield_pipeline.joblib`

---

## 3. Project Structure

```text
Crop Yield/
├── AGRONOMIC_REFERENCES.md     # Official domain literature (OUAT, ICAR-NRRI, SHC)
├── AI_RULES.md                 # System governance & engineering rules
├── Architecture.md             # High-level decoupled architecture blueprint
├── Decisions.md                # Architecture Decision Records (ADRs 001–008)
├── Flow.md                     # Data lifecycle and execution flow specifications
├── PROJECT_BLUEPRINT.md        # Comprehensive domain problem analysis & roadmap
├── test_e2e.js                 # End-to-end HTTP integration test suite
├── backend/                    # Node.js + Express API Backend
│   ├── src/
│   │   ├── config/env.js       # Environment configuration
│   │   ├── db/db.js            # Database persistence layer
│   │   ├── middleware/         # Server-side validation middleware
│   │   ├── routes/             # REST routes (/predictions, /simulate, /recommendations, /districts)
│   │   ├── services/mlClient.js# Python ML service HTTP client
│   │   └── server.js           # Express app entry point
│   ├── tests/api.test.js       # Jest API integration tests
│   └── package.json
├── ml_service/                 # Python FastAPI ML Microservice
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   ├── schemas.py          # Pydantic validation schemas
│   │   ├── routes/             # Predict, Simulate, Optimize routes
│   │   └── services/           # Inference engine & Scipy optimizer
│   ├── data/                   # Odisha agricultural dataset & EDA summary
│   ├── pipeline/               # Dataset generation, EDA, and model training
│   ├── saved_models/           # Fitted pipeline artifact (.joblib)
│   ├── tests/test_ml_service.py# Pytest unit test suite
│   └── requirements.txt
└── frontend/                   # React + Vite TypeScript Dashboard
    ├── src/
    │   ├── components/         # PredictionForm, ResultCard, WhatIfSimulator, FertilizerAdvisory, HistoryView
    │   ├── App.tsx             # Main application layout & reactive state
    │   ├── index.css           # Professional civic design system & typography
    │   └── main.tsx            # React DOM root
    ├── package.json
    └── vite.config.ts
```

---

## 4. Quickstart Guide (Running Locally)

### Prerequisites:
- Node.js v18+ & npm
- Python 3.11+

### Step 1: Start Python ML Service (Port 8000)
```powershell
cd ml_service
.\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Step 2: Start Node.js Express API (Port 5000)
```powershell
cd backend
node src/server.js
```

### Step 3: Start React Frontend (Port 5173)
```powershell
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 5. Running Automated Tests

- **Python ML Tests:**
  ```powershell
  cd ml_service
  .\venv\Scripts\python -m pytest tests/ -v
  ```
- **Node.js Express Tests:**
  ```powershell
  cd backend
  npm test
  ```
- **End-to-End System Tests:**
  ```powershell
  node test_e2e.js
  ```
- **Frontend TypeScript Validation:**
  ```powershell
  cd frontend
  npm run build
  ```
