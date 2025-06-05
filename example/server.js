import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';

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
    return res.status(200).json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
    });
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

  app.use(express.json());

  // API route example
  app.get('/api/token', getToken);

  // Proxy middleware for all other API requests
  app.use('/v1', async (req, res) => {
    try {
      const targetUrl = `${process.env.REMOTE_GATEWAY}${req.originalUrl}`;

      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.method !== 'GET' ? req.body : undefined,
        params: req.query,
        headers: {
          ...req.headers,
          host: new URL(process.env.REMOTE_GATEWAY).host,
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
