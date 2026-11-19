const { createProxyMiddleware } = require('./proxy.js');

function setupRoutes(app) {
  app.use(/^\/v\d+/, createProxyMiddleware());
}

module.exports = { setupRoutes };
