/**
 * Integration Tests for Express Backend API
 * Adheres to AI_RULES.md (Rules 98-103)
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/server');

describe('Express Backend API Tests', () => {
  test('GET /api/districts should return Odisha reference data', async () => {
    const res = await request(app).get('/api/districts');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('districts');
    expect(Array.isArray(res.body.districts)).toBe(true);
    expect(res.body.districts.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('crops');
    expect(res.body).toHaveProperty('soil_types');
  });

  test('POST /api/predictions with invalid input should return 400 Bad Request', async () => {
    const invalidPayload = {
      district: 'Bargarh',
      // missing mandatory crop, soil_type, etc.
      area_hectares: -5.0 // invalid negative
    };

    const res = await request(app)
      .post('/api/predictions')
      .send(invalidPayload);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body).toHaveProperty('details');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  test('GET /api/predictions/history should return array of records', async () => {
    const res = await request(app).get('/api/predictions/history');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('records');
    expect(Array.isArray(res.body.records)).toBe(true);
  });

  test('GET /api/health should return health status object', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('backend', 'express-api');
  });
});
