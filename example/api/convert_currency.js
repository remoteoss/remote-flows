const axios = require('axios');
const { buildGatewayURL, fetchAccessToken } = require('./get_token.js');

async function convertCurrency(req, res) {
  try {
    // Get a valid access token using the existing utility
    const accessToken = await fetchAccessToken();

    const gatewayUrl = buildGatewayURL();
    const targetUrl = `${gatewayUrl}/v1/currency-converter`;

    const response = await axios({
      method: 'POST',
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        host: new URL(gatewayUrl).host,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Currency conversion failed',
    });
  }
}

module.exports = { convertCurrency };
