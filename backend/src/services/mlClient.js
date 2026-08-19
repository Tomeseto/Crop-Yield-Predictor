/**
 * Python ML Service HTTP Client
 * Dispatches requests to the FastAPI Python ML microservice with timeout and error handling.
 */

const axios = require('axios');
const config = require('../config/env');

const mlApi = axios.create({
  baseURL: config.mlServiceUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function predictYield(farmData) {
  try {
    const res = await mlApi.post('/predict', farmData);
    return res.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
      const err = new Error('ML Prediction Service is currently unavailable. Please ensure the Python service is running.');
      err.status = 503;
      throw err;
    }
    const msg = error.response?.data?.detail || error.message || 'Error communicating with ML service';
    const err = new Error(msg);
    err.status = error.response?.status || 500;
    throw err;
  }
}

async function simulateWhatIf(simulationData) {
  try {
    const res = await mlApi.post('/simulate', simulationData);
    return res.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
      const err = new Error('ML Simulation Service is currently unavailable.');
      err.status = 503;
      throw err;
    }
    const msg = error.response?.data?.detail || error.message || 'Error executing What-If simulation';
    const err = new Error(msg);
    err.status = error.response?.status || 500;
    throw err;
  }
}

async function optimizeInputs(optimizationData) {
  try {
    const res = await mlApi.post('/optimize', optimizationData);
    return res.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
      const err = new Error('Optimization Service is currently unavailable.');
      err.status = 503;
      throw err;
    }
    const msg = error.response?.data?.detail || error.message || 'Error executing input optimization';
    const err = new Error(msg);
    err.status = error.response?.status || 500;
    throw err;
  }
}

async function checkMlHealth() {
  try {
    const res = await mlApi.get('/health');
    return res.data;
  } catch (error) {
    return { status: 'unreachable', error: error.message };
  }
}

module.exports = {
  predictYield,
  simulateWhatIf,
  optimizeInputs,
  checkMlHealth,
};
