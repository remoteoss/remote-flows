const { getToken } = require('./get_token.js');
const { getCompanyManagerToken } = require('./jwt_auth.js');
const { createProxyMiddleware } = require('./proxy.js');

function setupRoutes(app) {
  // API routes
  app.get('/api/fetch-refresh-token', getToken);
  app.get('/api/fetch-company-manager', getCompanyManagerToken);
  
  // Proxy all versioned API routes (v1, v2, etc.)
  app.use(/^\/v\d+/, createProxyMiddleware());
}

module.exports = { setupRoutes };
