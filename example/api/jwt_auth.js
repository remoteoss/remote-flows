// example/api/jwt_auth.js
const jwt = require('jsonwebtoken');

const { buildGatewayURL } = require('./utils.js');

const DEFAULT_SCOPES =
  'company_admin employments invoices time_and_attendance employment_documents employment_payments payroll';

async function generateJWTToken() {
  const {
    VITE_CLIENT_ID,
    VITE_CLIENT_SECRET,
    VITE_REMOTE_GATEWAY,
    VITE_USER_ID, // New environment variable for user ID
  } = process.env;

  if (
    !VITE_CLIENT_ID ||
    (!VITE_CLIENT_SECRET && VITE_REMOTE_GATEWAY !== 'local') ||
    !VITE_REMOTE_GATEWAY ||
    !VITE_USER_ID
  ) {
    throw new Error(
      'Missing VITE_CLIENT_ID, VITE_CLIENT_SECRET, VITE_REMOTE_GATEWAY, or VITE_USER_ID',
    );
  }

  const gatewayUrl = buildGatewayURL();
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: VITE_CLIENT_ID, // Partner client ID
    sub: `urn:remote-api:company-manager:user:${VITE_USER_ID}`, // User ID
    aud: `${gatewayUrl}/auth`, // Audience
    exp: now + 60 * 60, // 60 minutes from now
    scope: DEFAULT_SCOPES, // Scopes
  };

  try {
    const jwtToken = jwt.sign(payload, VITE_CLIENT_SECRET, {
      algorithm: 'HS256',
    });
    return jwtToken;
  } catch (error) {
    throw new Error(`Error generating JWT: ${error.message}`);
  }
}

async function fetchAccessTokenWithJWT() {
  const { VITE_REMOTE_GATEWAY } = process.env;
  const gatewayUrl = buildGatewayURL();

  try {
    const jwtToken = await generateJWTToken();

    const response = await fetch(`${gatewayUrl}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
        scope: DEFAULT_SCOPES,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { accessToken: data.access_token, expiresIn: data.expires_in };
  } catch (error) {
    throw new Error(`Failed to fetch access token with JWT: ${error.message}`);
  }
}

// Express route handler
async function getJWTToken(req, res) {
  try {
    const { accessToken, expiresIn } = await fetchAccessTokenWithJWT();

    return res.status(200).json({
      access_token: accessToken,
      expires_in: expiresIn,
    });
  } catch (error) {
    console.error('Error fetching JWT access token:', error);
    return res
      .status(500)
      .json({ error: 'Failed to retrieve JWT access token' });
  }
}

module.exports = { getJWTToken, generateJWTToken, fetchAccessTokenWithJWT };
