const axios = require('axios');
const {
  fetchClientCredentialsAccessToken,
  fetchAccessToken,
} = require('./get_token.js');
const { buildGatewayURL } = require('./utils.js');

/**
 * Determines which token type to use based on HTTP method and path
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, etc.)
 * @param {string} path - The API path (e.g., '/v1/countries' or '/v2/countries?foo=bar')
 * @returns {'client-credentials' | 'user-token'} The token type to use
 */
function getTokenType(method, path) {
  const normalizedMethod = method.toUpperCase();
  // Extract pathname without query parameters
  const pathname = path.split('?')[0].toLowerCase();

  // GET /v1/countries or /v2/countries — user token works and is required when
  // client_credentials isn't available (e.g. local dev without client secret)
  if (normalizedMethod === 'GET' && /^\/v[12]\/countries/.test(pathname)) {
    return 'user-token';
  }

  // GET /v1/company-currencies or /v2/company-currencies
  if (
    normalizedMethod === 'GET' &&
    /^\/v[12]\/company-currencies$/.test(pathname)
  ) {
    return 'client-credentials';
  }

  // POST /v1/companies or /v2/companies
  if (normalizedMethod === 'POST' && /^\/v[12]\/companies$/.test(pathname)) {
    return 'client-credentials';
  }

  // PUT/PATCH /v1/companies/{company_id} or /v2/companies/{company_id}
  if (
    (normalizedMethod === 'PUT' || normalizedMethod === 'PATCH') &&
    /^\/v[12]\/companies\/[^/]+$/.test(pathname)
  ) {
    return 'client-credentials';
  }

  // /v1/employee/* endpoints require an employee-scoped assertion token.
  // The SDK already sends the correct Bearer token — pass it through unchanged.
  if (/^\/v1\/employee\//.test(pathname)) {
    return 'pass-through';
  }

  // All other requests use user token
  return 'user-token';
}

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
    const tokenType = getTokenType(method, path);
    if (tokenType === 'pass-through') {
      // Employee endpoints: the SDK already set the correct Bearer token in the
      // incoming request — forward it unchanged instead of overwriting with a
      // company manager token.
      // headers already contains the incoming Authorization from ...headers above.
    } else {
      const { accessToken } =
        tokenType === 'client-credentials'
          ? await fetchClientCredentialsAccessToken()
          : await fetchAccessToken();
      requestConfig.headers.Authorization = `Bearer ${accessToken}`;
    }
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
  getTokenType,
};
