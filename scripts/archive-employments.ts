#!/usr/bin/env tsx
/**
 * Archives every active employment of the company behind a root env file, to
 * clean up a sandbox company after lots of seeding/verification runs.
 *
 * Uses DELETE /v1/sandbox/employments/{id}, which only exists on Sandbox and
 * archives (status `archived`) rather than hard-deleting. Credentials come from
 * .env.<name> at the repo root, same as `seed:onboarding --env=<name>`.
 *
 * Dry run by default: it only lists what it would archive. Pass --apply to do it.
 *
 *   pnpm run archive:employments --env=review
 *   pnpm run archive:employments --env=review --apply
 *
 * Options:
 *   --status=active,invited   statuses to archive (default: active)
 *   --apply                   actually archive (default is a dry run)
 *   --concurrency=3           parallel archive requests (default: 3)
 */
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapWithConcurrency } from './map-with-concurrency';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

interface EmploymentRow {
  id: string;
  full_name: string;
  login_email: string;
  country?: { code?: string } | null;
  employment_model?: string;
  status?: string;
}

interface ListResponse {
  data?: {
    employments?: EmploymentRow[];
    total_pages?: number;
  };
}

class GatewayBlockedError extends Error {}

const PAGE_SIZE = 100;
const RETRY_ATTEMPTS = 8;
const RETRY_WAIT_MS = 120_000;

function parseArgs(argv: string[]): Record<string, string | true> {
  const args: Record<string, string | true> = {};
  for (const raw of argv) {
    const match = raw.match(/^--([^=]+)(?:=(.*))?$/);
    if (match) {
      args[match[1]] = match[2] ?? true;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const ENV = typeof args.env === 'string' ? args.env : undefined;
if (!ENV) {
  throw new Error('--env=<name> is required, e.g. --env=review.');
}
const STATUS = typeof args.status === 'string' ? args.status : 'active';
const APPLY = args.apply === true;
const CONCURRENCY = Number(args.concurrency) || 3;

const envFile = path.resolve(__dirname, '..', `.env.${ENV}`);
if (!existsSync(envFile)) {
  throw new Error(`--env=${ENV}: ${envFile} does not exist.`);
}
dotenv.config({ path: envFile, override: true });

const { buildGatewayURL } = require('../example/api/utils.js') as {
  buildGatewayURL: () => string | undefined;
};
const { fetchAccessToken } = require('../example/api/get_token.js') as {
  fetchAccessToken: () => Promise<{ accessToken: string }>;
};

const BASE_URL = buildGatewayURL();
if (!BASE_URL) {
  throw new Error(`${envFile} doesn't set VITE_REMOTE_GATEWAY.`);
}
if (!new URL(BASE_URL).hostname.includes('sandbox')) {
  throw new Error(
    `Refusing to run: ${BASE_URL} doesn't look like a sandbox gateway.`,
  );
}

async function api<T>(
  method: 'GET' | 'DELETE',
  urlPath: string,
  query: Record<string, string | number> = {},
): Promise<T | undefined> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await apiOnce<T>(method, urlPath, query);
    } catch (error) {
      const blocked = /(?:HTTP|->) (?:403|429)\b/.test(String(error));
      if (!blocked) {
        throw error;
      }
      if (attempt >= RETRY_ATTEMPTS) {
        throw new GatewayBlockedError(String(error));
      }
      console.error(
        `blocked (attempt ${attempt}/${RETRY_ATTEMPTS}), waiting ${RETRY_WAIT_MS / 1000}s`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_WAIT_MS));
    }
  }
}

async function apiOnce<T>(
  method: 'GET' | 'DELETE',
  urlPath: string,
  query: Record<string, string | number>,
): Promise<T | undefined> {
  const url = new URL(BASE_URL + urlPath);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, String(value));
  }
  const { accessToken } = await fetchAccessToken();
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${urlPath} -> ${res.status} ${text}`);
  }
  return text ? (JSON.parse(text) as T) : undefined;
}

async function listEmployments(): Promise<EmploymentRow[]> {
  const all: EmploymentRow[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await api<ListResponse>('GET', '/v1/employments', {
      status: STATUS,
      page,
      page_size: PAGE_SIZE,
    });
    all.push(...(res?.data?.employments ?? []));
    totalPages = res?.data?.total_pages ?? 1;
    page += 1;
  } while (page <= totalPages);
  return all;
}

async function main() {
  console.log(
    `Environment: ${ENV} -> ${BASE_URL}\nStatus filter: ${STATUS}\nMode: ${APPLY ? 'APPLY' : 'dry run'}\n`,
  );

  const employments = await listEmployments();
  if (employments.length === 0) {
    console.log('Nothing to archive.');
    return;
  }

  for (const e of employments) {
    console.log(
      `${e.id}  ${e.country?.code ?? '---'}  ${e.employment_model ?? '-'}  ${e.status ?? STATUS}  ${e.full_name} <${e.login_email}>`,
    );
  }
  console.log(`\n${employments.length} employment(s) matched.`);

  if (!APPLY) {
    console.log('Dry run: re-run with --apply to archive them.');
    return;
  }

  let aborted = false;
  const results = await mapWithConcurrency(
    employments,
    CONCURRENCY,
    async (e) => {
      if (aborted) {
        return { id: e.id, error: 'skipped: gateway kept blocking requests' };
      }
      try {
        await api('DELETE', `/v1/sandbox/employments/${e.id}`);
        console.log(`archived ${e.id}`);
        return { id: e.id, error: undefined };
      } catch (error) {
        aborted = aborted || error instanceof GatewayBlockedError;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`FAILED   ${e.id}: ${message}`);
        return { id: e.id, error: message };
      }
    },
  );

  const failed = results.filter((r) => r.error);
  console.log(
    `\nArchived ${results.length - failed.length}/${results.length}.`,
  );
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
