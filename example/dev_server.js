const axios = require('axios');
const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { setupRoutes } = require('./api/routes.js');
const { createServer: createViteServer } = require('vite');

const envArg = process.argv.find(
  (arg) => arg === '--env' || arg.startsWith('--env='),
);
const envName = envArg?.split('=')[1];

if (envArg && !envName) {
  console.error('--env requires a value, e.g. --env=partners');
  process.exit(1);
}

if (envName) {
  const envFile = path.resolve(__dirname, '..', `.env.${envName}`);
  if (!fs.existsSync(envFile)) {
    console.error(`--env=${envName}: ${envFile} does not exist.`);
    process.exit(1);
  }
  dotenv.config({ path: envFile });
  console.log(`Loaded ${envFile}; example/.env is ignored.`);
} else {
  dotenv.config();
}

const startServer = async () => {
  const app = express();
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  const httpServer = http.createServer(app);

  // Create Vite server in middleware mode, reusing the Express HTTP server
  // for HMR's WebSocket instead of letting Vite open its own on the default
  // port — otherwise every worktree's example app collides on that port.
  const vite = await createViteServer({
    envDir: envName ? false : undefined,
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
