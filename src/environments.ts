export type Environment =
  | 'local'
  | 'partners'
  | 'production'
  | 'sandbox'
  | 'staging';

export const ENVIRONMENTS: Record<Environment, string> = {
  local: 'http://localhost:4000', // when using openapi-ts locally remove /api/eor from the url
  partners: 'https://gateway.partners.remote-sandbox.com',
  production: 'https://gateway.remote.com',
  sandbox: 'https://gateway.remote-sandbox.com',
  staging: 'https://gateway.niceremote.com',
};

export const defaultEnvironment: Environment = 'production';
