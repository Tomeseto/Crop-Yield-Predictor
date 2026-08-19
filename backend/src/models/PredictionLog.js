/**
 * Mongoose Schema for PredictionLog
 * Adheres to AI_RULES.md (Rules 41-46, 58-64):
 * Represents the complete domain entity with strict types and units.
 */

const mongoose = require('mongoose');

const FeatureImpactSchema = new mongoose.Schema({
  feature: { type: String, required: true },
  display_name: { type: String, required: true },
  impact_direction: { type: String, enum: ['positive', 'negative'], required: true },
  importance_score: { type: Number, required: true }
}, { _id: false });

const PredictionLogSchema = new mongoose.Schema({
  district: { type: String, required: true, trim: true },
  soil_type: { type: String, required: true },
  season: { type: String, enum: ['Kharif', 'Rabi'], required: true },
  crop: { type: String, required: true },
  area_hectares: { type: Number, required: true, min: 0.05, max: 50.0 },
  nitrogen_kgha: { type: Number, required: true, min: 0, max: 350 },
  phosphorus_kgha: { type: Number, required: true, min: 0, max: 200 },
  potassium_kgha: { type: Number, required: true, min: 0, max: 200 },
  soil_ph: { type: Number, required: true, min: 3.5, max: 9.5 },
  organic_carbon_pct: { type: Number, required: true, min: 0.05, max: 3.0 },
  rainfall_mm: { type: Number, required: true, min: 0, max: 5000 },
  temperature_celsius: { type: Number, required: true, min: 10, max: 50 },
  irrigation_type: { type: String, default: 'Rainfed' },
  predicted_yield_qha: { type: Number, required: true, min: 0 },
  total_production_q: { type: Number, required: true, min: 0 },
  selected_model: { type: String },
  top_contributing_factors: [FeatureImpactSchema],
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('PredictionLog', PredictionLogSchema);
