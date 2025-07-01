const ENVIRONMENTS = {
  partners: 'https://gateway.partners.remote-sandbox.com',
  production: 'https://gateway.remote.com',
  sandbox: 'https://gateway.remote-sandbox.com',
  staging: 'https://gateway.niceremote.com',
};

async function getToken(req, res) {
  const { CLIENT_ID, CLIENT_SECRET, VITE_REMOTE_GATEWAY, REFRESH_TOKEN } =
    process.env;

  if (!CLIENT_ID || !CLIENT_SECRET || !VITE_REMOTE_GATEWAY || !REFRESH_TOKEN) {
    return res.status(400).json({
      error:
        'Missing CLIENT_ID, CLIENT_SECRET, VITE_REMOTE_GATEWAY, or REFRESH_TOKEN',
    });
  }

  const gatewayUrl = ENVIRONMENTS[VITE_REMOTE_GATEWAY];

  const encodedCredentials = Buffer.from(
    `${CLIENT_ID}:${CLIENT_SECRET}`,
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
        refresh_token: REFRESH_TOKEN,
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
