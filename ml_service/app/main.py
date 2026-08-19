"""
FastAPI Python ML Service Entry Point
Hosts Yield Prediction, What-If Simulation, and Prescriptive Optimization endpoints.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.services.predictor import PredictorService
from app.services.optimizer import OptimizerService
from app.routes import predict, simulate, optimize

load_dotenv()

# Global service singletons
model_path = os.getenv("MODEL_PATH", "saved_models/crop_yield_pipeline.joblib")
predictor_service = PredictorService(model_path=model_path)
optimizer_service = OptimizerService(predictor=predictor_service)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[FastAPI ML Service] Starting up. Checking model status at '{model_path}'...")
    if not predictor_service.is_ready:
        predictor_service._load_artifact()
    yield
    print("[FastAPI ML Service] Shutting down.")


app = FastAPI(
    title="KrushiDoot ML Inference Service",
    description="Python FastAPI ML Service for Crop Yield Prediction & Optimization (Govt. of Odisha)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach routes
app.include_router(predict.router)
app.include_router(simulate.router)
app.include_router(optimize.router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "krushidoot-ml-service",
        "model_loaded": predictor_service.is_ready,
        "selected_model": predictor_service.selected_model_name,
        "test_metrics": predictor_service.metrics
    }
