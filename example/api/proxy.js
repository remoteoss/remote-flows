const axios = require('axios');
const { fetchAccessToken } = require('./get_token.js');
const { buildGatewayURL } = require('./utils.js');

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
  const { body, params, headers = {}, requiresAuth = true, stream } = options;

  const gatewayUrl = buildGatewayURL();
  const targetUrl = `${gatewayUrl}${path}`;

  const requestConfig = {
    method,
    url: targetUrl,
    data: stream || body,
    params,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      host: new URL(gatewayUrl).host,
    },
    maxBodyLength: 100 * 1024 * 1024, // 100MB
    maxContentLength: 100 * 1024 * 1024, // 100MB
    timeout: 60000, // 60 seconds for file uploads
  };

  // Remove Content-Type for streaming (let axios handle it)
  if (stream) {
    delete requestConfig.headers['Content-Type'];
  }

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
    const isMultipart = req.headers['content-type']?.includes(
      'multipart/form-data',
    );

    try {
      const response = await createProxyRequest(req.originalUrl, req.method, {
        body: !isMultipart && req.method !== 'GET' ? req.body : undefined,
        stream: isMultipart ? req : undefined, // Stream raw request for multipart
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

module.exports = {
  createProxyMiddleware,
};
