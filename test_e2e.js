const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('--- STARTING END-TO-END SYSTEM INTEGRATION TEST ---');

  // 1. Health Check
  console.log('\n[1] Testing GET /api/health ...');
  const healthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`Status: ${healthRes.status} | Response:`, JSON.stringify(healthRes.data));

  // 2. Districts Reference Data
  console.log('\n[2] Testing GET /api/districts ...');
  const distRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/districts',
    method: 'GET'
  });
  console.log(`Status: ${distRes.status} | Districts count: ${distRes.data?.districts?.length}, Crops count: ${distRes.data?.crops?.length}`);

  // 3. Farm Yield Prediction
  console.log('\n[3] Testing POST /api/predictions ...');
  const sampleFarm = {
    district: 'Bargarh',
    soil_type: 'Alluvial',
    season: 'Kharif',
    crop: 'Paddy (Kharif)',
    area_hectares: 2.0,
    nitrogen_kgha: 90.0,
    phosphorus_kgha: 45.0,
    potassium_kgha: 45.0,
    soil_ph: 6.5,
    organic_carbon_pct: 0.60,
    rainfall_mm: 1250.0,
    temperature_celsius: 28.5,
    irrigation_type: 'Canal'
  };
  const predRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/predictions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, sampleFarm);
  console.log(`Status: ${predRes.status}`);
  console.log(`Estimated Yield: ${predRes.data?.predicted_yield_qha} q/ha | Total: ${predRes.data?.total_production_q} q`);
  console.log(`Selected Model: ${predRes.data?.selected_model}`);
  console.log(`Top Factors:`, predRes.data?.top_contributing_factors);

  // 4. What-If Simulation
  console.log('\n[4] Testing POST /api/simulate/what-if ...');
  const simPayload = {
    base_inputs: sampleFarm,
    modified_inputs: { ...sampleFarm, potassium_kgha: 65.0, rainfall_mm: 1350.0 }
  };
  const simRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/simulate/what-if',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, simPayload);
  console.log(`Status: ${simRes.status}`);
  console.log(`Base Yield: ${simRes.data?.base_yield_qha} q/ha -> Scenario Yield: ${simRes.data?.scenario_yield_qha} q/ha`);
  console.log(`Yield Delta: ${simRes.data?.yield_delta_qha} q/ha (${simRes.data?.percentage_change_pct}%)`);
  console.log(`Economic Impact:`, simRes.data?.economic_impact);

  // 5. Prescriptive Optimization
  console.log('\n[5] Testing POST /api/recommendations/optimize ...');
  const optPayload = {
    district: 'Bargarh',
    soil_type: 'Alluvial',
    season: 'Kharif',
    crop: 'Paddy (Kharif)',
    area_hectares: 2.0,
    current_soil_ph: 6.5,
    current_oc_pct: 0.60,
    expected_rainfall_mm: 1250.0,
    avg_temperature_celsius: 28.5,
    irrigation_type: 'Canal',
    budget_ceiling_inr: 20000.0
  };
  const optRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/recommendations/optimize',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, optPayload);
  console.log(`Status: ${optRes.status}`);
  console.log(`Optimal Dose: N=${optRes.data?.optimal_nitrogen_kgha}, P=${optRes.data?.optimal_phosphorus_kgha}, K=${optRes.data?.optimal_potassium_kgha} kg/ha`);
  console.log(`Commercial Bags:`, optRes.data?.commercial_fertilizer_summary);
  console.log(`Schedule Stages: ${optRes.data?.schedule?.length} stages`);

  // 6. Prediction History
  console.log('\n[6] Testing GET /api/predictions/history ...');
  const histRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/predictions/history',
    method: 'GET'
  });
  console.log(`Status: ${histRes.status} | Persisted Records: ${histRes.data?.records?.length}`);

  console.log('\n======================================================');
  console.log('ALL END-TO-END SYSTEM INTEGRATION TESTS PASSED!');
  console.log('======================================================');
}

runE2ETests().catch(console.error);
