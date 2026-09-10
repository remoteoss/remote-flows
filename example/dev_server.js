const axios = require('axios');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const { setupRoutes } = require('./api/routes.js');
const { createServer: createViteServer } = require('vite');

dotenv.config();

const startServer = async () => {
  const app = express();
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  const httpServer = http.createServer(app);

  // Create Vite server in middleware mode, reusing the Express HTTP server
  // for HMR's WebSocket instead of letting Vite open its own on the default
  // port — otherwise every worktree's example app collides on that port.
  const vite = await createViteServer({
    server: { middlewareMode: true, ws: { server: httpServer } },
  });

  app.use(express.json({ limit: '50mb' }));

  // API route example
  setupRoutes(app);

  app.use(vite.middlewares);

  // Serve index.html (SSR or SPA fallback)
  app.use(async (req, res, next) => {
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

  httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

startServer();
