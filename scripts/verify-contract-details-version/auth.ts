import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');

dotenv.config({ path: path.join(repoRoot, '.env.sandbox') });

const { buildGatewayURL } = require(
  path.join(repoRoot, 'example/api/utils.js'),
);
const { fetchAccessToken, fetchClientCredentialsAccessToken } = require(
  path.join(repoRoot, 'example/api/get_token.js'),
);
const { getTokenType } = require(path.join(repoRoot, 'example/api/proxy.js'));

export type SandboxAuthResponse = {
  accessToken: string;
  expiresIn: number;
};

export function getSandboxGatewayUrl(): string {
  const url = buildGatewayURL();
  if (!url) {
    throw new Error(
      'Could not resolve a gateway URL. Set VITE_REMOTE_GATEWAY=sandbox in .env.sandbox at the repo root.',
    );
  }
  return url;
}

export async function fetchSandboxAuth(): Promise<SandboxAuthResponse> {
  return fetchAccessToken();
}

export async function fetchSandboxAuthHeaders(
  method: string,
  urlPath: string,
): Promise<Record<string, string>> {
  const { accessToken } =
    getTokenType(method, urlPath) === 'client-credentials'
      ? await fetchClientCredentialsAccessToken()
      : await fetchAccessToken();
  return { Authorization: `Bearer ${accessToken}` };
}

export function requiredSandboxCompanyId(): string {
  const companyId = process.env.VITE_COMPANY_ID;
  if (!companyId) {
    throw new Error(
      'VITE_COMPANY_ID is not set. Add it to .env.sandbox at the repo root.',
    );
  }
  return companyId;
}
