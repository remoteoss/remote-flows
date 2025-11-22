#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { filesize } from 'filesize';
import type { BundleAnalysis, SizeLimitConfig, ChangeInfo } from './types.js';

function loadBundleData(filePath: string): BundleAnalysis {
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8')) as BundleAnalysis;
    return data;
  } catch (error) {
    console.error(
      `Failed to load bundle data from ${filePath}:`,
      (error as Error).message,
    );
    process.exit(1);
  }
}

function loadConfig(): SizeLimitConfig {
  try {
    const config = JSON.parse(
      readFileSync('.sizelimit.json', 'utf-8'),
    ) as SizeLimitConfig;
    return config;
  } catch (error) {
    console.error('Failed to load .sizelimit.json:', (error as Error).message);
    process.exit(1);
  }
}

function formatChange(current: number, previous: number): ChangeInfo {
  const diff = current - previous;
  const percentage = previous === 0 ? 0 : (diff / previous) * 100;

  if (diff === 0) {
    return { text: '0 B (0%)', icon: '🟢', color: 'green' };
  } else if (diff > 0) {
    return {
      text: `+${filesize(diff)} (+${percentage.toFixed(1)}%)`,
      icon: '🔴',
      color: 'red',
    };
  } else {
    return {
      text: `${filesize(diff)} (${percentage.toFixed(1)}%)`,
      icon: '🟢',
      color: 'green',
    };
  }
}

function getStatusIcon(current: number, limit?: number): string {
  if (!limit) return '🟢';
  const percentage = (current / limit) * 100;
  if (percentage > 100) return '❌';
  if (percentage > 90) return '🟡';
  return '🟢';
}

function generateMarkdownReport(
  baseData: BundleAnalysis,
  currentData: BundleAnalysis,
  config: SizeLimitConfig,
): string {
  const limits = config.limits;

  // Calculate changes
  const totalGzipChange = formatChange(
    currentData.total.gzip,
    baseData.total.gzip,
  );
  const totalRawChange = formatChange(
    currentData.total.raw,
    baseData.total.raw,
  );
  const cssGzipChange = formatChange(
    currentData.categories.css.gzip,
    baseData.categories.css.gzip,
  );
  const cssRawChange = formatChange(
    currentData.categories.css.raw,
    baseData.categories.css.raw,
  );

  // Status for limits
  const totalGzipStatus = getStatusIcon(
    currentData.total.gzip,
    limits.totalGzip,
  );
  const totalRawStatus = getStatusIcon(currentData.total.raw, limits.total);
  const cssGzipStatus = getStatusIcon(
    currentData.categories.css.gzip,
    limits.cssGzip,
  );

  let report = `## 📦 Bundle Size Report\n\n`;

  // Summary table
  report += `| Metric | Current | Previous | Change | Status |\n`;
  report += `|--------|---------|----------|--------|--------|\n`;
  report += `| Total (gzip) | ${filesize(currentData.total.gzip)} | ${filesize(baseData.total.gzip)} | ${totalGzipChange.text} | ${totalGzipChange.icon} |\n`;
  report += `| Total (raw) | ${filesize(currentData.total.raw)} | ${filesize(baseData.total.raw)} | ${totalRawChange.text} | ${totalRawChange.icon} |\n`;
  report += `| CSS (gzip) | ${filesize(currentData.categories.css.gzip)} | ${filesize(baseData.categories.css.gzip)} | ${cssGzipChange.text} | ${cssGzipChange.icon} |\n`;
  report += `| CSS (raw) | ${filesize(currentData.categories.css.raw)} | ${filesize(baseData.categories.css.raw)} | ${cssRawChange.text} | ${cssRawChange.icon} |\n`;

  report += `\n### Size Limits\n\n`;

  const totalGzipPercentage = (
    (currentData.total.gzip / limits.totalGzip) *
    100
  ).toFixed(1);
  const totalRawPercentage = (
    (currentData.total.raw / limits.total) *
    100
  ).toFixed(1);
  const cssGzipPercentage = (
    (currentData.categories.css.gzip / limits.cssGzip) *
    100
  ).toFixed(1);

  const totalGzipExceeded = currentData.total.gzip > limits.totalGzip;
  const totalRawExceeded = currentData.total.raw > limits.total;
  const cssGzipExceeded = currentData.categories.css.gzip > limits.cssGzip;

  report += `- ${totalGzipExceeded ? '❌' : '✅'} Total gzipped: ${filesize(currentData.total.gzip)} / ${filesize(limits.totalGzip)} (${totalGzipPercentage}%)\n`;
  report += `- ${totalRawExceeded ? '❌' : '✅'} Total raw: ${filesize(currentData.total.raw)} / ${filesize(limits.total)} (${totalRawPercentage}%)\n`;
  report += `- ${cssGzipExceeded ? '❌' : '✅'} CSS gzipped: ${filesize(currentData.categories.css.gzip)} / ${filesize(limits.cssGzip)} (${cssGzipPercentage}%)\n`;

  // Check for violations
  const violations: string[] = [];
  if (totalGzipExceeded) violations.push(`Total gzipped size exceeds limit`);
  if (totalRawExceeded) violations.push(`Total raw size exceeds limit`);
  if (cssGzipExceeded) violations.push(`CSS gzipped size exceeds limit`);

  // Check for large chunks
  const largeChunks = currentData.largestFiles
    .filter((f) => f.gzip > limits.maxChunkSizeGzip)
    .map((f) => `${f.path} (${filesize(f.gzip)} gzipped)`);

  if (largeChunks.length > 0) {
    violations.push(`${largeChunks.length} chunk(s) exceed max chunk size`);
  }

  if (violations.length > 0) {
    report += `\n### ⚠️ Violations\n\n`;
    violations.forEach((v) => {
      report += `- ${v}\n`;
    });
  }

  // Largest files
  report += `\n### Largest Files (Top 5)\n\n`;
  currentData.largestFiles.slice(0, 5).forEach((file, index) => {
    const baseFile = baseData.largestFiles.find((f) => f.path === file.path);
    const change = baseFile
      ? formatChange(file.gzip, baseFile.gzip)
      : { text: 'new', icon: '🆕', color: 'blue' };
    report += `${index + 1}. \`${file.path}\` - ${filesize(file.gzip)} (${change.text})\n`;
  });

  // Full details in collapsible section
  report += `\n<details>\n<summary>View All Files (${currentData.total.fileCount} total)</summary>\n\n`;
  report += `| File | Size (gzip) | Change |\n`;
  report += `|------|-------------|--------|\n`;

  currentData.largestFiles.forEach((file) => {
    const baseFile = baseData.largestFiles.find((f) => f.path === file.path);
    const change = baseFile
      ? formatChange(file.gzip, baseFile.gzip)
      : { text: 'new', icon: '🆕', color: 'blue' };
    report += `| \`${file.path}\` | ${filesize(file.gzip)} | ${change.text} |\n`;
  });

  report += `\n</details>\n`;

  return report;
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      'Usage: compare-sizes.ts <base-bundle.json> <current-bundle.json>',
    );
    process.exit(1);
  }

  const [baseFile, currentFile] = args;

  const baseData = loadBundleData(baseFile);
  const currentData = loadBundleData(currentFile);
  const config = loadConfig();

  const report = generateMarkdownReport(baseData, currentData, config);

  // Output the report
  console.log(report);

  // Check if there are any limit violations
  const limits = config.limits;
  let hasViolations = false;

  if (currentData.total.gzip > limits.totalGzip) hasViolations = true;
  if (currentData.total.raw > limits.total) hasViolations = true;
  if (currentData.categories.css.gzip > limits.cssGzip) hasViolations = true;

  // Check for large chunks
  const largeChunks = currentData.largestFiles.filter(
    (f) => f.gzip > limits.maxChunkSizeGzip,
  );
  if (largeChunks.length > 0) hasViolations = true;

  if (hasViolations) {
    console.error('\n❌ Bundle size check failed due to limit violations');
    process.exit(1);
  }

  console.log('\n✅ Bundle size check passed');
}

main();
