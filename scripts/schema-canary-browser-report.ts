#!/usr/bin/env tsx
import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {
  browserRows,
  PlaywrightJsonReport,
} from './schema-canary/browser-results';
import { KeptEmployment } from './schema-canary/kept-employments';
import {
  buildReport,
  decideExitCode,
  formatFailures,
  formatSummaryTable,
  SchemaCanaryReport,
} from './schema-canary/lib';
import { SCHEMA_CANARY_REPORT_PATH } from './schema-canary/report-path';

function parseArgs(argv: string[]) {
  const args: Record<string, string | true> = {};
  for (const raw of argv) {
    const match = raw.match(/^--([^=]+)(?:=(.*))?$/);
    if (match) args[match[1]] = match[2] ?? true;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (typeof args.kept !== 'string' || typeof args.results !== 'string') {
  throw new Error(
    'Usage: npm run schema-canary:browser-report -- --kept=<file> --results=<playwright json> [--write] [--failures-out=<file>] [--latest-failures-out=<file>]',
  );
}

const kept = JSON.parse(readFileSync(args.kept, 'utf8')) as KeptEmployment[];
const results = existsSync(args.results)
  ? (JSON.parse(readFileSync(args.results, 'utf8')) as PlaywrightJsonReport)
  : undefined;
const rows = browserRows(kept, results);

const table = formatSummaryTable(rows);
console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `\n## Browser re-submit\n\n${table}\n`,
  );
}

if (args.write === true) {
  const report = JSON.parse(
    readFileSync(SCHEMA_CANARY_REPORT_PATH, 'utf8'),
  ) as SchemaCanaryReport;
  writeFileSync(
    SCHEMA_CANARY_REPORT_PATH,
    `${JSON.stringify(buildReport([...report.checks, ...rows]), null, 2)}\n`,
  );
}

for (const [arg, track] of [
  ['failures-out', 'pinned'],
  ['latest-failures-out', 'latest'],
] as const) {
  const file = args[arg];
  const failures = formatFailures(rows, track);
  if (typeof file !== 'string' || !failures) continue;
  const existing = existsSync(file) ? readFileSync(file, 'utf8') : '';
  appendFileSync(file, `${existing ? '\n\n' : ''}${failures}`);
}

process.exitCode = decideExitCode(rows);
