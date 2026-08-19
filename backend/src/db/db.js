/**
 * MongoDB Persistence Layer with Mongoose
 * Connects to MongoDB (Local or Atlas) with graceful fallback to structured store when offline.
 */

const mongoose = require('mongoose');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');
const PredictionLog = require('../models/PredictionLog');

// Use reliable DNS servers for MongoDB Atlas SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

let isMongoConnected = false;

// Fallback structured storage path
const fallbackDir = path.join(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'prediction_store.json');

// Initialize fallback storage
if (!fs.existsSync(fallbackDir)) {
  fs.mkdirSync(fallbackDir, { recursive: true });
}
if (!fs.existsSync(fallbackFile)) {
  fs.writeFileSync(fallbackFile, JSON.stringify([], null, 2));
}

async function initDb() {
  const uri = config.mongoUri;
  if (!uri) {
    console.log('[Database] MONGODB_URI not configured. Using structured storage engine at data/prediction_store.json');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout for graceful fallback
    });
    isMongoConnected = true;
    console.log(`[Database] Successfully connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    isMongoConnected = false;
    console.log(`[Database] Could not connect to MongoDB (${err.message}). Falling back to local store at data/prediction_store.json`);
  }
}

async function savePrediction(data) {
  if (isMongoConnected && mongoose.connection.readyState === 1) {
    const doc = new PredictionLog({
      district: data.district,
      soil_type: data.soil_type,
      season: data.season,
      crop: data.crop,
      area_hectares: data.area_hectares,
      nitrogen_kgha: data.nitrogen_kgha,
      phosphorus_kgha: data.phosphorus_kgha,
      potassium_kgha: data.potassium_kgha,
      soil_ph: data.soil_ph,
      organic_carbon_pct: data.organic_carbon_pct,
      rainfall_mm: data.rainfall_mm,
      temperature_celsius: data.temperature_celsius,
      irrigation_type: data.irrigation_type || 'Rainfed',
      predicted_yield_qha: data.predicted_yield_qha,
      total_production_q: data.total_production_q,
      selected_model: data.selected_model,
      top_contributing_factors: data.top_contributing_factors || []
    });
    const saved = await doc.save();
    return { id: saved._id, created_at: saved.created_at, ...data };
  } else {
    // Fallback store
    const fileData = fs.readFileSync(fallbackFile, 'utf8');
    const records = JSON.parse(fileData || '[]');
    const record = {
      id: records.length + 1,
      ...data,
      created_at: new Date().toISOString()
    };
    records.unshift(record); // Prepend newest first
    fs.writeFileSync(fallbackFile, JSON.stringify(records, null, 2));
    return record;
  }
}

async function getPredictionHistory(limit = 20) {
  if (isMongoConnected && mongoose.connection.readyState === 1) {
    const docs = await PredictionLog.find().sort({ created_at: -1 }).limit(limit).lean();
    return docs.map(d => ({
      id: d._id,
      ...d
    }));
  } else {
    const fileData = fs.readFileSync(fallbackFile, 'utf8');
    const records = JSON.parse(fileData || '[]');
    return records.slice(0, limit);
  }
}

module.exports = {
  initDb,
  savePrediction,
  getPredictionHistory,
  isMongoConnected: () => isMongoConnected
};
