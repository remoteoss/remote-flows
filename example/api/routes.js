const { getToken } = require('./get_token.js');
const { getJWTToken } = require('./jwt_auth.js');
const { createProxyMiddleware } = require('./proxy.js');

function setupRoutes(app) {
  // API routes
  app.get('/api/token', getToken);
  app.get('/api/jwt-token', getJWTToken);
  app.use('/v1', createProxyMiddleware());
}

module.exports = { setupRoutes };
