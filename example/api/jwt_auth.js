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
    VITE_USER_ID,
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
  const exp = now + 5 * 60;

  const aud =
    VITE_REMOTE_GATEWAY === 'local'
      ? `${gatewayUrl}/oauth`
      : `${gatewayUrl}/auth`;

  const payload = {
    iss: VITE_CLIENT_ID,
    sub: `urn:remote-api:company-manager:user:${VITE_USER_ID}`,
    aud,
    exp: exp,
    scope: DEFAULT_SCOPES,
    iat: now,
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

async function fetchCompanyManagerToken() {
  const { VITE_REMOTE_GATEWAY, VITE_CLIENT_ID, VITE_CLIENT_SECRET } =
    process.env;
  const gatewayUrl = buildGatewayURL();

  try {
    const jwtToken = await generateJWTToken();
    const encodedCredentials = btoa(`${VITE_CLIENT_ID}:${VITE_CLIENT_SECRET}`);

    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtToken,
      scope: DEFAULT_SCOPES,
    });

    const response = await fetch(`${gatewayUrl}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedCredentials}`,
      },
      body,
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
async function getCompanyManagerToken(req, res) {
  try {
    const { accessToken, expiresIn } = await fetchCompanyManagerToken();

    return res.status(200).json({
      access_token: accessToken,
      expires_in: expiresIn,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Failed to retrieve JWT access token' });
  }
}

module.exports = {
  getCompanyManagerToken,
  generateJWTToken,
  fetchCompanyManagerToken,
};
