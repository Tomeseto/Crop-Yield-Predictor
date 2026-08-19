/**
 * What-If Simulation Route
 */

const express = require('express');
const router = express.Router();
const { validateSimulationInput } = require('../middleware/validate');
const { simulateWhatIf } = require('../services/mlClient');

router.post('/what-if', validateSimulationInput, async (req, res, next) => {
  try {
    const simulationResult = await simulateWhatIf(req.body);
    res.json({
      success: true,
      ...simulationResult
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
