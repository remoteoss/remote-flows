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

const rootDir = path.resolve(__dirname, '..');
const ENV_NAME_PATTERN = /^[\w-]+$/;
let loadedKeys = [];

const listEnvs = () =>
  fs
    .readdirSync(rootDir)
    .map((file) => file.match(/^\.env\.([\w-]+)$/)?.[1])
    .filter(Boolean)
    .sort();

const applyEnv = (name) => {
  const envFile = path.resolve(rootDir, `.env.${name}`);
  const values = dotenv.parse(fs.readFileSync(envFile));
  loadedKeys.forEach((key) => delete process.env[key]);
  Object.assign(process.env, values);
  loadedKeys = Object.keys(values);
  console.log(`Loaded ${envFile}; example/.env is ignored.`);
};

let currentEnv = envName ?? null;

if (envName) {
  if (!fs.existsSync(path.resolve(rootDir, `.env.${envName}`))) {
    console.error(
      `--env=${envName}: .env.${envName} does not exist in ${rootDir}.`,
    );
    process.exit(1);
  }
  applyEnv(envName);
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
  const createVite = () =>
    createViteServer({
      envDir: currentEnv ? false : undefined,
      server: { middlewareMode: true, ws: { server: httpServer } },
    });
  let vite = await createVite();

  app.use(express.json({ limit: '50mb' }));

  app.get('/__env', (req, res) => {
    res.json({
      current: currentEnv,
      gateway: process.env.VITE_REMOTE_GATEWAY ?? null,
      available: listEnvs(),
    });
  });

  app.post('/__env', async (req, res) => {
    const name = req.body?.name;
    if (
      typeof name !== 'string' ||
      !ENV_NAME_PATTERN.test(name) ||
      !listEnvs().includes(name)
    ) {
      return res.status(400).json({ error: `Unknown env: ${name}` });
    }
    try {
      applyEnv(name);
      currentEnv = name;
      const previous = vite;
      vite = await createVite();
      await previous.close();
      res.json({ current: currentEnv });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: String(e.message ?? e) });
    }
  });

  // API route example
  setupRoutes(app);

  app.use((req, res, next) => vite.middlewares(req, res, next));

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
