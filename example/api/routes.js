const { getToken } = require('./get_token.js');
const { getCompanyManagerToken } = require('./jwt_auth.js');
const { createProxyMiddleware } = require('./proxy.js');

function setupRoutes(app) {
  // API routes
  app.get('/api/fetch-refresh-token', getToken);
  app.get('/api/fetch-company-manager', getCompanyManagerToken);
  app.use('/v1', createProxyMiddleware());

  // To make proxy requests work in local
  app.use('/api/eor/v1', (req, res, next) => {
    req.originalUrl = req.originalUrl.replace('/api/eor', '');
    createProxyMiddleware()(req, res, next);
  });
}

module.exports = { setupRoutes };
