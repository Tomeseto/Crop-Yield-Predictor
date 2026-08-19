/**
 * Predictions & History Route
 */

const express = require('express');
const router = express.Router();
const { validateFarmInput } = require('../middleware/validate');
const { predictYield } = require('../services/mlClient');
const { savePrediction, getPredictionHistory } = require('../db/db');

// POST /api/predictions - Run prediction, persist to DB, and return enriched response
router.post('/', validateFarmInput, async (req, res, next) => {
  try {
    const farmData = req.body;

    // 1. Call Python ML Service
    const mlResponse = await predictYield(farmData);

    // 2. Persist record in database
    const recordToSave = {
      ...farmData,
      predicted_yield_qha: mlResponse.predicted_yield_qha,
      total_production_q: mlResponse.total_production_q,
      selected_model: mlResponse.selected_model,
      top_contributing_factors: mlResponse.top_contributing_factors
    };
    const savedRecord = await savePrediction(recordToSave);

    // 3. Return full response
    res.json({
      success: true,
      prediction_id: savedRecord.id,
      created_at: savedRecord.created_at,
      ...mlResponse
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/predictions/history - Fetch past predictions
router.get('/history', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const history = await getPredictionHistory(limit);
    res.json({
      success: true,
      count: history.length,
      records: history
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
