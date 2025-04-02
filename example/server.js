import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const getToken = async (req, res) => {
  const { CLIENT_ID, CLIENT_SECRET, REMOTE_GATEWAY, REFRESH_TOKEN } =
    process.env;

  if (!CLIENT_ID || !CLIENT_SECRET || !REMOTE_GATEWAY || !REFRESH_TOKEN) {
    return res
      .status(400)
      .json({ error: 'Missing clientId or clientSecret or RemoteGateway' });
  }

  const encodedCredentials = Buffer.from(
    `${CLIENT_ID}:${CLIENT_SECRET}`,
  ).toString('base64');

  try {
    // to get a refresh token, you need to create a company first
    const response = await axios.post(
      `${REMOTE_GATEWAY}/auth/oauth2/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedCredentials}`,
        },
      },
    );
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching access token:', error);
    return res.status(500).json({ error: 'Failed to retrieve access token' });
  }
};

const startServer = async () => {
  const app = express();
  const port = 3001;

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
  });

  // API route example
  app.get('/api/token', getToken);

  app.use(vite.middlewares); // Use Vite as middleware

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
