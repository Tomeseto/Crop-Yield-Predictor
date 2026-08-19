/**
 * Environment Configuration & Validation
 */
const dotenv = require('dotenv');
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushidoot_db'
};

module.exports = config;
