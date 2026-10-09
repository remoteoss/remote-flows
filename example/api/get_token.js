const { buildGatewayURL } = require('./utils.js');
const { fetchCompanyManagerToken } = require('./jwt_auth.js');

async function requestAccessToken() {
  const {
    VITE_CLIENT_ID,
    VITE_CLIENT_SECRET,
    VITE_REMOTE_GATEWAY,
    VITE_REFRESH_TOKEN,
    VITE_USER_ID,
  } = process.env;

  // Local dev has no interactively-obtained refresh token; fall back to the
  // JWT-bearer assertion flow (same as fetchCompanyManagerToken) using
  // VITE_USER_ID instead.
  if (VITE_REMOTE_GATEWAY === 'local' && !VITE_REFRESH_TOKEN && VITE_USER_ID) {
    return fetchCompanyManagerToken();
  }

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

async function requestClientCredentialsAccessToken() {
  const { VITE_CLIENT_ID, VITE_CLIENT_SECRET, VITE_REMOTE_GATEWAY } =
    process.env;

  // for local development, we don't need a client secret
  if (
    !VITE_CLIENT_ID ||
    (!VITE_CLIENT_SECRET && VITE_REMOTE_GATEWAY !== 'local') ||
    !VITE_REMOTE_GATEWAY
  ) {
    throw new Error(
      'Missing VITE_CLIENT_ID, VITE_CLIENT_SECRET, or VITE_REMOTE_GATEWAY',
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
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

const EXPIRY_MARGIN_SECONDS = 60;

function cacheUntilExpiry(requestToken) {
  let cached;
  return async () => {
    if (cached && Date.now() < cached.refreshAt) {
      const { accessToken } = await cached.token;
      return {
        accessToken,
        expiresIn: Math.floor((cached.expiresAt - Date.now()) / 1000),
      };
    }
    const token = requestToken();
    cached = { token, refreshAt: Infinity, expiresAt: Infinity };
    try {
      const { accessToken, expiresIn } = await token;
      const expiresAt = Date.now() + expiresIn * 1000;
      cached.expiresAt = expiresAt;
      cached.refreshAt = expiresAt - EXPIRY_MARGIN_SECONDS * 1000;
      return { accessToken, expiresIn };
    } catch (error) {
      cached = undefined;
      throw error;
    }
  };
}

const fetchAccessToken = cacheUntilExpiry(requestAccessToken);
const fetchClientCredentialsAccessToken = cacheUntilExpiry(
  requestClientCredentialsAccessToken,
);

// Express route handler
async function getToken(req, res) {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'production') {
    return res.status(403).json({
      error: `This endpoint is not available in production mode`,
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

module.exports = {
  cacheUntilExpiry,
  getToken,
  fetchAccessToken,
  fetchClientCredentialsAccessToken,
};
