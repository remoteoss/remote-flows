const ENVIRONMENTS = {
  local: 'http://localhost:4000/api/eor',
  partners: 'https://gateway.partners.remote-sandbox.com',
  production: 'https://gateway.remote.com',
  sandbox: 'https://gateway.remote-sandbox.com',
  staging: 'https://gateway.niceremote.com',
};

function buildGatewayURL() {
  const { VITE_REMOTE_GATEWAY } = process.env;
  return ENVIRONMENTS[VITE_REMOTE_GATEWAY];
}

module.exports = { ENVIRONMENTS, buildGatewayURL };
