const ENVIRONMENTS = {
  local: 'http://localhost:4000/api/eor',
  partners: 'https://gateway.partners.remote-sandbox.com',
  production: 'https://gateway.remote.com',
  sandbox: 'https://gateway.remote-sandbox.com',
  staging: 'https://gateway.niceremote.com',
};

function buildGatewayURL() {
  const {
    VITE_CLIENT_ID,
    VITE_CLIENT_SECRET,
    VITE_REMOTE_GATEWAY,
    VITE_REFRESH_TOKEN,
  } = process.env;

  return ENVIRONMENTS[VITE_REMOTE_GATEWAY];
}

async function fetchAccessToken() {
  const {
    VITE_CLIENT_ID,
    VITE_CLIENT_SECRET,
    VITE_REMOTE_GATEWAY,
    VITE_REFRESH_TOKEN,
  } = process.env;

  // for local development, we don't need a client secret
  if (
    !VITE_CLIENT_ID ||
    (!VITE_CLIENT_SECRET && VITE_REMOTE_GATEWAY !== 'local') ||
    !VITE_REMOTE_GATEWAY ||
    !VITE_REFRESH_TOKEN
  ) {
    throw new Error(
      'Missing VITE_CLIENT_ID, VITE_CLIENT_SECRET, VITE_REMOTE_GATEWAY, or VITE_REFRESH_TOKEN',
    );
  }

  const gatewayUrl = buildGatewayURL();

  const encodedCredentials = Buffer.from(
    `${VITE_CLIENT_ID}:${VITE_CLIENT_SECRET}`,
  ).toString('base64');

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
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

// Express route handler
async function getToken(req, res) {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is not available in production mode',
    });
  }

  try {
    const { accessToken, expiresIn } = await fetchAccessToken();

    return res.status(200).json({
      access_token: accessToken,
      expires_in: expiresIn,
    });
  } catch (error) {
    console.error('Error fetching access token:', error);
    return res.status(500).json({ error: 'Failed to retrieve access token' });
  }
}

module.exports = { getToken, buildGatewayURL, fetchAccessToken };
