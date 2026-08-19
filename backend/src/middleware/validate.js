/**
 * Server-Side Input Validation Middleware
 * Adheres to AI_RULES.md (Rules 31, 32, 58-64):
 * Never trust client validation alone.
 * Validates data types, required fields, and empirical domain boundaries.
 */

function validateFarmInput(req, res, next) {
  const data = req.body;
  const errors = [];

  // Required String fields
  if (!data.district || typeof data.district !== 'string' || data.district.trim() === '') {
    errors.push({ field: 'district', message: 'District is required and must be a valid text name.' });
  }
  if (!data.soil_type || typeof data.soil_type !== 'string') {
    errors.push({ field: 'soil_type', message: 'Soil type is required.' });
  }
  if (!data.season || typeof data.season !== 'string') {
    errors.push({ field: 'season', message: 'Season is required (Kharif or Rabi).' });
  }
  if (!data.crop || typeof data.crop !== 'string') {
    errors.push({ field: 'crop', message: 'Crop is required.' });
  }

  // Required Numerical fields with domain boundaries
  const numFields = [
    { key: 'area_hectares', name: 'Farm Area (ha)', min: 0.05, max: 50.0 },
    { key: 'nitrogen_kgha', name: 'Nitrogen (kg/ha)', min: 0.0, max: 350.0 },
    { key: 'phosphorus_kgha', name: 'Phosphorus (kg/ha)', min: 0.0, max: 200.0 },
    { key: 'potassium_kgha', name: 'Potassium (kg/ha)', min: 0.0, max: 200.0 },
    { key: 'soil_ph', name: 'Soil pH', min: 3.5, max: 9.5 },
    { key: 'organic_carbon_pct', name: 'Organic Carbon (%)', min: 0.05, max: 3.0 },
    { key: 'rainfall_mm', name: 'Seasonal Rainfall (mm)', min: 0.0, max: 5000.0 },
    { key: 'temperature_celsius', name: 'Average Temperature (°C)', min: 10.0, max: 50.0 },
  ];

  for (const { key, name, min, max } of numFields) {
    const val = parseFloat(data[key]);
    if (isNaN(val)) {
      errors.push({ field: key, message: `${name} is required and must be a valid number.` });
    } else if (val < min || val > max) {
      errors.push({ field: key, message: `${name} must be between ${min} and ${max}. Received: ${val}` });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

function validateSimulationInput(req, res, next) {
  const { base_inputs, modified_inputs } = req.body;

  if (!base_inputs || !modified_inputs) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{ message: 'Both base_inputs and modified_inputs are required for simulation.' }]
    });
  }

  next();
}

function validateOptimizationInput(req, res, next) {
  const data = req.body;
  const errors = [];

  if (!data.district || !data.crop || !data.season || !data.soil_type) {
    errors.push({ message: 'district, crop, season, and soil_type are mandatory fields.' });
  }

  const area = parseFloat(data.area_hectares);
  if (isNaN(area) || area <= 0 || area > 50.0) {
    errors.push({ field: 'area_hectares', message: 'Area must be between 0.05 and 50.0 hectares.' });
  }

  const ph = parseFloat(data.current_soil_ph);
  if (isNaN(ph) || ph < 3.5 || ph > 9.5) {
    errors.push({ field: 'current_soil_ph', message: 'Soil pH must be between 3.5 and 9.5.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

module.exports = {
  validateFarmInput,
  validateSimulationInput,
  validateOptimizationInput
};
