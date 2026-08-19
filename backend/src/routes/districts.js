/**
 * Districts & Master Reference Data Route
 * Returns validated Odisha agricultural zones, districts, soil types, and crops.
 */

const express = require('express');
const router = express.Router();

const ODISHA_DISTRICTS = [
  { name: 'Bargarh', zone: 'Western Central Table Land', default_soil: 'Alluvial', avg_rainfall_mm: 1300, is_irrigation_hub: true },
  { name: 'Sambalpur', zone: 'Western Central Table Land', default_soil: 'Red Laterite', avg_rainfall_mm: 1350, is_irrigation_hub: true },
  { name: 'Cuttack', zone: 'East & South Eastern Coastal Plain', default_soil: 'Alluvial', avg_rainfall_mm: 1450, is_irrigation_hub: false },
  { name: 'Puri', zone: 'East & South Eastern Coastal Plain', default_soil: 'Alluvial', avg_rainfall_mm: 1400, is_irrigation_hub: false },
  { name: 'Balasore', zone: 'North Eastern Coastal Plain', default_soil: 'Alluvial', avg_rainfall_mm: 1550, is_irrigation_hub: false },
  { name: 'Kalahandi', zone: 'Western Undulating Zone', default_soil: 'Red Laterite', avg_rainfall_mm: 1100, is_irrigation_hub: false },
  { name: 'Koraput', zone: 'Eastern Ghat High Land', default_soil: 'Red Laterite', avg_rainfall_mm: 1400, is_irrigation_hub: false },
  { name: 'Mayurbhanj', zone: 'North Central Plateau', default_soil: 'Sandy Loam', avg_rainfall_mm: 1500, is_irrigation_hub: false },
  { name: 'Sundargarh', zone: 'North Western Plateau', default_soil: 'Red Laterite', avg_rainfall_mm: 1350, is_irrigation_hub: false },
  { name: 'Ganjam', zone: 'South Eastern Coastal Plain', default_soil: 'Alluvial', avg_rainfall_mm: 1250, is_irrigation_hub: false }
];

const SOIL_TYPES = ['Alluvial', 'Red Laterite', 'Black Soil', 'Coastal Saline', 'Sandy Loam'];
const SEASONS = ['Kharif', 'Rabi'];
const CROPS = [
  { name: 'Paddy (Kharif)', season: 'Kharif', msp_per_q: 2300.0, category: 'Cereals' },
  { name: 'Paddy (Rabi)', season: 'Rabi', msp_per_q: 2300.0, category: 'Cereals' },
  { name: 'Ragi (Mandia)', season: 'Kharif', msp_per_q: 4290.0, category: 'Millets (OMM)' },
  { name: 'Green Gram (Moong)', season: 'Rabi', msp_per_q: 8558.0, category: 'Pulses' },
  { name: 'Groundnut', season: 'Kharif', msp_per_q: 6783.0, category: 'Oilseeds' },
  { name: 'Maize', season: 'Kharif', msp_per_q: 2225.0, category: 'Coarse Cereals' },
  { name: 'Mustard', season: 'Rabi', msp_per_q: 5650.0, category: 'Oilseeds' }
];

router.get('/', (req, res) => {
  res.json({
    districts: ODISHA_DISTRICTS,
    soil_types: SOIL_TYPES,
    seasons: SEASONS,
    crops: CROPS
  });
});

module.exports = router;
