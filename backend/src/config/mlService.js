const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Wrapper with graceful fallback
const callML = async (method, endpoint, data = {}) => {
  try {
    const response = method === 'get'
      ? await mlClient.get(endpoint)
      : await mlClient.post(endpoint, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.warn(`⚠️  ML service unavailable [${endpoint}]: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = { mlClient, callML, ML_SERVICE_URL };
