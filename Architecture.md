# Architecture

## Current Status

Architecture finalized for the MVP.

The architecture is designed around a complete end-to-end flow:

React Frontend
↓
Node.js / Express API
↓
Database
↓
Python ML Service
↓
Prediction
↓
Recommendation / Optimization
↓
React Dashboard

The system should remain modular but lightweight enough for a hackathon project.

---

# 1. Architecture Goals

The architecture is designed to prioritize:

- End-to-end functionality
- Clear separation of responsibilities
- Fast development
- Easy debugging
- Explainable ML predictions
- Reproducibility
- Simple deployment
- Maintainability
- Minimal unnecessary infrastructure

The project must not be over-engineered.

---

# 2. High-Level Architecture

The application uses a decoupled frontend, application backend, database, and ML inference service.

```text
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │      + Vite          │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │    Backend API       │
                    └──────┬─────────┬─────┘
                           │         │
                           │         │ ML Requests
                           │         ▼
                           │  ┌──────────────────┐
                           │  │ Python ML Service│
                           │  │     FastAPI      │
                           │  └────────┬─────────┘
                           │           │
                           │           ▼
                           │  ┌──────────────────┐
                           │  │ Saved ML Model   │
                           │  └──────────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │       Database       │
                    │ MongoDB / PostgreSQL │
                    └──────────────────────┘