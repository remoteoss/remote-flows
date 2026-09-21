#!/usr/bin/env tsx
/**
 * Regenerates COUNTRY_CONTRACT_VERSIONS in
 * src/components/JsonSchemaComparison/schemaVersions.ts from the tiger repo,
 * and reports the gap between the latest version available per country and
 * the version example/ actually pins in ONBOARDING_OPTIONS.jsonSchemaVersionByCountry.
 *
 * This replaces the manual "run promptTiger.txt against an LLM in tiger,
 * paste the result back" step: counting snapshot files is fully mechanical.
 *
 * Usage:
 *   npm run sync:contract-versions -- [--tiger-path=../tiger] [--write] [--report-file=path.md]
 *
 * By default this only prints a report (dry run). Pass --write to update
 * schemaVersions.ts on disk, and --report-file to also write the gap report
 * as a markdown table (used by CI to fill in a PR body).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { countryLabel } from './country-names';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCHEMA_VERSIONS_PATH = path.join(
  __dirname,
  '../src/components/JsonSchemaComparison/schemaVersions.ts',
);
const ONBOARDING_CONSTANTS_PATH = path.join(
  __dirname,
  '../example/src/flows/Onboarding/constants.ts',
);

interface VersionOption {
  value: number;
  label: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const tigerPathArg = args.find((a) => a.startsWith('--tiger-path='));
  const reportFileArg = args.find((a) => a.startsWith('--report-file='));
  return {
    tigerPath: tigerPathArg
      ? tigerPathArg.split('=')[1]
      : path.join(__dirname, '../../tiger'),
    write: args.includes('--write'),
    reportFile: reportFileArg ? reportFileArg.split('=')[1] : undefined,
  };
}

/**
 * Count total contract_details versions per country: number of files in
 * snapshots/{COUNTRY}/ (historical versions) + 1 (the current root file).
 */
function computeCountryContractVersions(
  tigerPath: string,
): Record<string, VersionOption[]> {
  const contractDetailsDir = path.join(
    tigerPath,
    'apps/tiger/priv/json_schemas/contract_details',
  );
  if (!fs.existsSync(contractDetailsDir)) {
    throw new Error(
      `Could not find ${contractDetailsDir}. Pass --tiger-path=<path to tiger checkout>.`,
    );
  }

  const countries = fs
    .readdirSync(contractDetailsDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith('.json') &&
        entry.name !== 'base.json',
    )
    .map((entry) => entry.name.replace(/\.json$/, ''))
    .sort((a, b) => a.localeCompare(b));

  const result: Record<string, VersionOption[]> = {};
  for (const country of countries) {
    const snapshotsDir = path.join(contractDetailsDir, 'snapshots', country);
    const snapshotCount = fs.existsSync(snapshotsDir)
      ? fs.readdirSync(snapshotsDir).filter((f) => f.endsWith('.json')).length
      : 0;
    const totalVersions = snapshotCount + 1;
    result[country] = Array.from({ length: totalVersions }, (_, i) => ({
      value: i + 1,
      label: `v${i + 1}`,
    }));
  }
  return result;
}

function formatVersionOption(v: VersionOption): string {
  return `    { value: ${v.value}, label: '${v.label}' },`;
}

function generateSchemaVersionsFile(
  currentContent: string,
  versions: Record<string, VersionOption[]>,
): string {
  const today = new Date().toISOString().slice(0, 10);

  const entries = Object.entries(versions)
    .map(([country, opts]) => {
      if (opts.length === 1) {
        return `  ${country}: [{ value: 1, label: 'v1' }],`;
      }
      return `  ${country}: [\n${opts.map(formatVersionOption).join('\n')}\n  ],`;
    })
    .join('\n');

  const newBlock = [
    '// AI generated from tiger',
    `// Last updated: ${today}`,
    'export const COUNTRY_CONTRACT_VERSIONS: Record<string, VersionOption[]> = {',
    entries,
    '};',
  ].join('\n');

  return currentContent.replace(
    /\/\/ AI generated from tiger\n\/\/ Last updated: \d{4}-\d{2}-\d{2}\nexport const COUNTRY_CONTRACT_VERSIONS: Record<string, VersionOption\[\]> = \{[\s\S]*?\n\};/,
    newBlock,
  );
}

/** Extract ONBOARDING_OPTIONS.jsonSchemaVersionByCountry[COUNTRY].contract_details from example/constants.ts */
function extractInUseVersions(source: string): Record<string, number> {
  const blockMatch = source.match(
    /jsonSchemaVersionByCountry:\s*\{([\s\S]*?)\n {2}\},\n {2}jsfModify/,
  );
  if (!blockMatch) {
    throw new Error(
      'Could not find jsonSchemaVersionByCountry block in example/src/flows/Onboarding/constants.ts',
    );
  }
  const block = blockMatch[1];
  const result: Record<string, number> = {};
  const countryRegex = /(\w+):\s*\{[^}]*?contract_details:\s*(\d+)[^}]*?\}/g;
  let m: RegExpExecArray | null;
  while ((m = countryRegex.exec(block))) {
    result[m[1]] = Number(m[2]);
  }
  return result;
}

function buildGapReport(
  latestVersions: Record<string, VersionOption[]>,
  inUseVersions: Record<string, number>,
): { country: string; inUse: number; latest: number; gap: number }[] {
  return Object.entries(latestVersions)
    .map(([country, opts]) => {
      const latest = opts.length;
      const inUse = inUseVersions[country] ?? 1; // undefined => flow uses v1
      return { country, inUse, latest, gap: latest - inUse };
    })
    .filter((row) => row.gap > 0)
    .sort((a, b) => b.gap - a.gap || a.country.localeCompare(b.country));
}

function generateMarkdownGapReport(
  gapReport: { country: string; inUse: number; latest: number; gap: number }[],
  totalCountries: number,
): string {
  const rows = gapReport
    .map(
      (r) =>
        `| ${countryLabel(r.country)} | v${r.inUse} | v${r.latest} | ${r.gap} |`,
    )
    .join('\n');
  return [
    `Contract details schema gap: ${gapReport.length}/${totalCountries} countries in \`example/\` are behind the latest version available in tiger.`,
    '',
    '| Country | In use | Latest | Gap |',
    '| --- | --- | --- | --- |',
    rows,
  ].join('\n');
}

function main() {
  const { tigerPath, write, reportFile } = parseArgs();

  const latestVersions = computeCountryContractVersions(tigerPath);
  const onboardingConstants = fs.readFileSync(
    ONBOARDING_CONSTANTS_PATH,
    'utf-8',
  );
  const inUseVersions = extractInUseVersions(onboardingConstants);

  const gapReport = buildGapReport(latestVersions, inUseVersions);

  console.log(
    `\nContract details schema gap (${Object.keys(latestVersions).length} countries in tiger, ${gapReport.length} behind latest):\n`,
  );
  const countryColumnWidth =
    Math.max(...gapReport.map((r) => countryLabel(r.country).length), 7) + 2;
  console.log(
    'COUNTRY'.padEnd(countryColumnWidth) +
      'IN USE'.padEnd(10) +
      'LATEST'.padEnd(10) +
      'GAP',
  );
  for (const row of gapReport) {
    console.log(
      countryLabel(row.country).padEnd(countryColumnWidth) +
        `v${row.inUse}`.padEnd(10) +
        `v${row.latest}`.padEnd(10) +
        row.gap,
    );
  }

  const currentSchemaVersionsContent = fs.readFileSync(
    SCHEMA_VERSIONS_PATH,
    'utf-8',
  );
  const newSchemaVersionsContent = generateSchemaVersionsFile(
    currentSchemaVersionsContent,
    latestVersions,
  );

  const changed = currentSchemaVersionsContent !== newSchemaVersionsContent;
  console.log(
    changed
      ? '\nschemaVersions.ts is stale relative to tiger.'
      : '\nschemaVersions.ts already matches tiger.',
  );

  if (write && changed) {
    fs.writeFileSync(SCHEMA_VERSIONS_PATH, newSchemaVersionsContent);
    console.log(`Wrote ${SCHEMA_VERSIONS_PATH}`);
  } else if (changed) {
    console.log('Re-run with --write to update schemaVersions.ts.');
  }

  if (reportFile) {
    fs.writeFileSync(
      reportFile,
      generateMarkdownGapReport(gapReport, Object.keys(latestVersions).length),
    );
    console.log(`Wrote gap report to ${reportFile}`);
  }
}

main();
