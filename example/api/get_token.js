const ENVIRONMENTS = {
  partners: 'https://gateway.partners.remote-sandbox.com',
  production: 'https://gateway.remote.com',
  sandbox: 'https://gateway.remote-sandbox.com',
  staging: 'https://gateway.niceremote.com',
};

async function getToken(req, res) {
  const {
    VITE_CLIENT_ID,
    VITE_CLIENT_SECRET,
    VITE_REMOTE_GATEWAY,
    VITE_REFRESH_TOKEN,
    NODE_ENV,
  } = process.env;

  if (NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is not available in production mode',
    });
  }

  if (
    !VITE_CLIENT_ID ||
    !VITE_CLIENT_SECRET ||
    !VITE_REMOTE_GATEWAY ||
    !VITE_REFRESH_TOKEN
  ) {
    return res.status(400).json({
      error:
        'Missing VITE_CLIENT_ID, VITE_CLIENT_SECRET, VITE_REMOTE_GATEWAY, or VITE_REFRESH_TOKEN',
    });
  }

  const gatewayUrl = ENVIRONMENTS[VITE_REMOTE_GATEWAY];

  const encodedCredentials = Buffer.from(
    `${VITE_CLIENT_ID}:${VITE_CLIENT_SECRET}`,
  ).toString('base64');

  try {
    const response = await fetch(`${gatewayUrl}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: VITE_REFRESH_TOKEN,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error('Error fetching access token:', error);
    return res.status(500).json({ error: 'Failed to retrieve access token' });
  }
}

module.exports = { getToken };
