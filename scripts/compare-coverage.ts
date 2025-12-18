#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import type { CoverageData, CoverageChange } from './types';

// Coverage thresholds (should match vitest.config.ts)
export const COVERAGE_THRESHOLDS = {
  lines: 75,
  statements: 75,
  functions: 75,
  branches: 75,
};

function formatChange(current: number, previous: number): CoverageChange {
  const delta = current - previous;

  if (Math.abs(delta) < 0.01) {
    return { text: '0%', icon: '⚪', color: 'gray', delta: 0 };
  } else if (delta > 0) {
    return {
      text: `+${delta.toFixed(2)}%`,
      icon: '🟢',
      color: 'green',
      delta,
    };
  } else {
    return {
      text: `${delta.toFixed(2)}%`,
      icon: '🔴',
      color: 'red',
      delta,
    };
  }
}

function generateMarkdownReport(
  baseData: CoverageData,
  currentData: CoverageData,
): string {
  // Calculate changes
  const linesChange = formatChange(currentData.lines.pct, baseData.lines.pct);
  const statementsChange = formatChange(
    currentData.statements.pct,
    baseData.statements.pct,
  );
  const functionsChange = formatChange(
    currentData.functions.pct,
    baseData.functions.pct,
  );
  const branchesChange = formatChange(
    currentData.branches.pct,
    baseData.branches.pct,
  );

  let report = `## 📊 Coverage Report\n\n`;

  // Overall status
  const overallChange =
    linesChange.delta +
    statementsChange.delta +
    functionsChange.delta +
    branchesChange.delta;
  if (overallChange > 0) {
    report += `### ✅ Coverage increased! 🎉\n\n`;
  } else if (overallChange < 0) {
    report += `### ⚠️ Coverage decreased\n\n`;
  } else {
    report += `### ⚪ Coverage unchanged\n\n`;
  }

  // Summary table
  report += `| Metric | Current | Previous | Change | Status |\n`;
  report += `|--------|---------|----------|--------|--------|\n`;
  report += `| Lines | ${currentData.lines.pct.toFixed(2)}% | ${baseData.lines.pct.toFixed(2)}% | ${linesChange.text} | ${linesChange.icon} |\n`;
  report += `| Statements | ${currentData.statements.pct.toFixed(2)}% | ${baseData.statements.pct.toFixed(2)}% | ${statementsChange.text} | ${statementsChange.icon} |\n`;
  report += `| Functions | ${currentData.functions.pct.toFixed(2)}% | ${baseData.functions.pct.toFixed(2)}% | ${functionsChange.text} | ${functionsChange.icon} |\n`;
  report += `| Branches | ${currentData.branches.pct.toFixed(2)}% | ${baseData.branches.pct.toFixed(2)}% | ${branchesChange.text} | ${branchesChange.icon} |\n`;

  // Detailed breakdown
  report += `\n### Detailed Breakdown\n\n`;
  report += `<details>\n<summary>Lines Coverage</summary>\n\n`;
  report += `- **Covered:** ${currentData.lines.covered} / ${currentData.lines.total}\n`;
  report += `- **Coverage:** ${currentData.lines.pct.toFixed(2)}%\n`;
  report += `- **Change:** ${linesChange.text} (${currentData.lines.covered - baseData.lines.covered} lines)\n`;
  report += `\n</details>\n\n`;

  report += `<details>\n<summary>Statements Coverage</summary>\n\n`;
  report += `- **Covered:** ${currentData.statements.covered} / ${currentData.statements.total}\n`;
  report += `- **Coverage:** ${currentData.statements.pct.toFixed(2)}%\n`;
  report += `- **Change:** ${statementsChange.text} (${currentData.statements.covered - baseData.statements.covered} statements)\n`;
  report += `\n</details>\n\n`;

  report += `<details>\n<summary>Functions Coverage</summary>\n\n`;
  report += `- **Covered:** ${currentData.functions.covered} / ${currentData.functions.total}\n`;
  report += `- **Coverage:** ${currentData.functions.pct.toFixed(2)}%\n`;
  report += `- **Change:** ${functionsChange.text} (${currentData.functions.covered - baseData.functions.covered} functions)\n`;
  report += `\n</details>\n\n`;

  report += `<details>\n<summary>Branches Coverage</summary>\n\n`;
  report += `- **Covered:** ${currentData.branches.covered} / ${currentData.branches.total}\n`;
  report += `- **Coverage:** ${currentData.branches.pct.toFixed(2)}%\n`;
  report += `- **Change:** ${branchesChange.text} (${currentData.branches.covered - baseData.branches.covered} branches)\n`;
  report += `\n</details>\n`;

  // Check thresholds
  const thresholdViolations: string[] = [];
  if (currentData.lines.pct < COVERAGE_THRESHOLDS.lines) {
    thresholdViolations.push(
      `Lines coverage (${currentData.lines.pct.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLDS.lines}%)`,
    );
  }
  if (currentData.statements.pct < COVERAGE_THRESHOLDS.statements) {
    thresholdViolations.push(
      `Statements coverage (${currentData.statements.pct.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLDS.statements}%)`,
    );
  }
  if (currentData.functions.pct < COVERAGE_THRESHOLDS.functions) {
    thresholdViolations.push(
      `Functions coverage (${currentData.functions.pct.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLDS.functions}%)`,
    );
  }
  if (currentData.branches.pct < COVERAGE_THRESHOLDS.branches) {
    thresholdViolations.push(
      `Branches coverage (${currentData.branches.pct.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLDS.branches}%)`,
    );
  }

  if (thresholdViolations.length > 0) {
    report += `\n### ❌ Coverage Threshold Violations\n\n`;
    thresholdViolations.forEach((violation) => {
      report += `- ${violation}\n`;
    });
  }

  return report;
}

function generateCurrentOnlyReport(currentData: CoverageData): string {
  let report = `## 📊 Coverage Report\n\n`;

  // Summary table without comparison
  report += `| Metric | Coverage | Covered/Total | Status |\n`;
  report += `|--------|----------|---------------|--------|\n`;
  report += `| Lines | ${currentData.lines.pct.toFixed(2)}% | ${currentData.lines.covered}/${currentData.lines.total} | ${getStatusIcon(currentData.lines.pct)} |\n`;
  report += `| Statements | ${currentData.statements.pct.toFixed(2)}% | ${currentData.statements.covered}/${currentData.statements.total} | ${getStatusIcon(currentData.statements.pct)} |\n`;
  report += `| Functions | ${currentData.functions.pct.toFixed(2)}% | ${currentData.functions.covered}/${currentData.functions.total} | ${getStatusIcon(currentData.functions.pct)} |\n`;
  report += `| Branches | ${currentData.branches.pct.toFixed(2)}% | ${currentData.branches.covered}/${currentData.branches.total} | ${getStatusIcon(currentData.branches.pct)} |\n`;

  // Check thresholds
  const thresholdViolations: string[] = [];
  if (currentData.lines.pct < COVERAGE_THRESHOLDS.lines) {
    thresholdViolations.push(
      `Lines coverage (${currentData.lines.pct.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLDS.lines}%)`,
    );
  }
  if (currentData.statements.pct < COVERAGE_THRESHOLDS.statements) {
    thresholdViolations.push(
      `Statements coverage (${currentData.statements.pct.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLDS.statements}%)`,
    );
  }
  if (currentData.functions.pct < COVERAGE_THRESHOLDS.functions) {
    thresholdViolations.push(
      `Functions coverage (${currentData.functions.pct.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLDS.functions}%)`,
    );
  }
  if (currentData.branches.pct < COVERAGE_THRESHOLDS.branches) {
    thresholdViolations.push(
      `Branches coverage (${currentData.branches.pct.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLDS.branches}%)`,
    );
  }

  if (thresholdViolations.length > 0) {
    report += `\n### ❌ Coverage Threshold Violations\n\n`;
    thresholdViolations.forEach((violation) => {
      report += `- ${violation}\n`;
    });
  }

  report += `\n---\n`;
  report += `*ℹ️ Base coverage not available for comparison. Showing current coverage only.*\n`;

  return report;
}

function getStatusIcon(percentage: number): string {
  if (percentage >= 80) return '🟢';
  if (percentage >= 60) return '🟡';
  return '🔴';
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(
      'Usage: compare-coverage.ts <current-coverage.json> [base-coverage.json]',
    );
    process.exit(1);
  }

  const currentFile = args[0];
  const baseFile = args[1];

  let currentData: CoverageData;

  try {
    currentData = JSON.parse(readFileSync(currentFile, 'utf-8'));
  } catch (error) {
    console.error(`Error reading current coverage file ${currentFile}:`, error);
    process.exit(1);
  }

  let report: string;

  // If base file is provided and exists, do comparison
  if (baseFile) {
    try {
      const baseData: CoverageData = JSON.parse(
        readFileSync(baseFile, 'utf-8'),
      );
      report = generateMarkdownReport(baseData, currentData);
    } catch {
      // Base file doesn't exist or is invalid, show current only
      // Don't log error details to avoid cluttering PR comments
      report = generateCurrentOnlyReport(currentData);
    }
  } else {
    // No base file provided, show current only
    report = generateCurrentOnlyReport(currentData);
  }

  // Output the report
  console.log(report);

  // Check for threshold violations and exit with error if any
  let hasViolations = false;
  if (currentData.lines.pct < COVERAGE_THRESHOLDS.lines) hasViolations = true;
  if (currentData.statements.pct < COVERAGE_THRESHOLDS.statements)
    hasViolations = true;
  if (currentData.functions.pct < COVERAGE_THRESHOLDS.functions)
    hasViolations = true;
  if (currentData.branches.pct < COVERAGE_THRESHOLDS.branches)
    hasViolations = true;

  if (hasViolations) {
    console.error('\n❌ Coverage check failed due to threshold violations');
    process.exit(1);
  }

  console.log('\n✅ Coverage check passed');
}

main();
