const axios = require('axios');
const dotenv = require('dotenv');
const express = require('express');
const { getToken } = require('./api/get_token.js');
const { createServer: createViteServer } = require('vite');

dotenv.config();

const startServer = async () => {
  const app = express();
  const port = 3001;

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
  });

  app.use(express.json());

  // API route example
  app.get('/api/token', getToken);

  // Proxy middleware for all other API requests
  app.use('/v1', async (req, res) => {
    try {
      const targetUrl = `${gatewayUrl}${req.originalUrl}`;

      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.method !== 'GET' ? req.body : undefined,
        params: req.query,
        headers: {
          ...req.headers,
          host: new URL(gatewayUrl).host,
        },
      });
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Proxy error:', error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data || 'Proxy request failed',
      });
    }
  });

  app.use(vite.middlewares);

  // Serve index.html (SSR or SPA fallback)
  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const template = await vite.transformIndexHtml(
        url,
        '<!DOCTYPE html><html><body><div id="app"></div></body></html>',
      );

      res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

startServer();
