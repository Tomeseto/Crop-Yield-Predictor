/**
 * Prescriptive Recommendations Route
 */

const express = require('express');
const router = express.Router();
const { validateOptimizationInput } = require('../middleware/validate');
const { optimizeInputs } = require('../services/mlClient');

router.post('/optimize', validateOptimizationInput, async (req, res, next) => {
  try {
    const optimizationResult = await optimizeInputs(req.body);
    res.json({
      success: true,
      ...optimizationResult
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
