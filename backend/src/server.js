/**
 * Express Server Entry Point
 * Implements decoupled API backend with security headers, CORS, and unified error handling.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const { initDb } = require('./db/db');

const districtsRouter = require('./routes/districts');
const predictionsRouter = require('./routes/predictions');
const simulationRouter = require('./routes/simulation');
const recommendationsRouter = require('./routes/recommendations');
const { checkMlHealth } = require('./services/mlClient');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: config.clientOrigin,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/districts', districtsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/simulate', simulationRouter);
app.use('/api/recommendations', recommendationsRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const mlHealth = await checkMlHealth();
  res.json({
    status: 'healthy',
    backend: 'express-api',
    ml_service: mlHealth,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const isProd = config.nodeEnv === 'production';

  // Securely log full error to server stdout
  console.error(`[Express Error] [${req.method} ${req.url}]:`, err.message || err);

  // Return clean, sanitized error to client per AI_RULES.md (Rule #96)
  res.status(status).json({
    error: err.message || 'An unexpected internal server error occurred.',
    status: status,
    timestamp: new Date().toISOString(),
    ...(isProd ? {} : { stack: err.stack })
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`[Express API] Server running on http://localhost:${config.port}`);
    console.log(`[Express API] Proxied ML Service: ${config.mlServiceUrl}`);
    // Connect to database in background
    initDb();
  });
}

module.exports = app;
