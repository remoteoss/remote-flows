const axios = require('axios');
const { buildGatewayURL, fetchAccessToken } = require('./get_token.js');

/**
 * Create a proxy request to the gateway with authentication
 * @param {string} path - The API path (e.g., '/v1/currency-converter')
 * @param {string} method - HTTP method
 * @param {object} options - Request options
 * @param {object} options.body - Request body
 * @param {object} options.params - Query parameters
 * @param {object} options.headers - Additional headers
 * @param {boolean} options.requiresAuth - Whether authentication is required (default: true)
 * @returns {Promise<object>} - Axios response
 */
async function createProxyRequest(path, method = 'GET', options = {}) {
  const { body, params, headers = {}, requiresAuth = true } = options;

  const gatewayUrl = buildGatewayURL();
  const targetUrl = `${gatewayUrl}${path}`;

  const requestConfig = {
    method,
    url: targetUrl,
    data: body,
    params,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      host: new URL(gatewayUrl).host,
    },
  };

  // Add authentication if required
  if (requiresAuth) {
    const { accessToken } = await fetchAccessToken();
    requestConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return axios(requestConfig);
}

/**
 * Express middleware to proxy requests to the gateway
 * @param {boolean} requiresAuth - Whether authentication is required (default: true)
 * @returns {Function} Express middleware function
 */
function createProxyMiddleware(requiresAuth = true) {
  return async (req, res) => {
    try {
      const response = await createProxyRequest(req.originalUrl, req.method, {
        body: req.method !== 'GET' ? req.body : undefined,
        params: req.query,
        headers: req.headers,
        requiresAuth,
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: error.response?.data || 'Proxy request failed',
      });
    }
  };
}

/**
 * Helper function for specific API endpoints
 * @param {string} path - The API path
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {boolean} requiresAuth - Whether authentication is required (default: true)
 */
async function proxyRequest(path, req, res, requiresAuth = true) {
  try {
    const response = await createProxyRequest(path, req.method, {
      body: req.method !== 'GET' ? req.body : undefined,
      params: req.query,
      headers: req.headers,
      requiresAuth,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Proxy request failed',
    });
  }
}

module.exports = {
  createProxyRequest,
  createProxyMiddleware,
  proxyRequest,
};
