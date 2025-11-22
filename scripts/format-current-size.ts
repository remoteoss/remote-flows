#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { filesize } from 'filesize';
import type { BundleAnalysis } from './types.js';
import { loadConfig } from './utils.js';

function formatCurrentSize(currentPath: string): string {
  const current: BundleAnalysis = JSON.parse(
    readFileSync(currentPath, 'utf-8'),
  );
  const config = loadConfig();
  const limits = config.limits;

  let report = '## 📦 Bundle Size Report\n\n';

  // Summary table (without comparison columns)
  report += '| Metric | Current | Status |\n';
  report += '|--------|---------|--------|\n';
  report += `| Total (gzip) | ${filesize(current.total.gzip)} | 📊 |\n`;
  report += `| Total (raw) | ${filesize(current.total.raw)} | 📊 |\n`;
  report += `| CSS (gzip) | ${filesize(current.categories.css.gzip)} | 📊 |\n`;
  report += `| CSS (raw) | ${filesize(current.categories.css.raw)} | 📊 |\n`;

  report += '\n### Size Limits\n\n';

  const totalGzipPercentage = (
    (current.total.gzip / limits.totalGzip) *
    100
  ).toFixed(1);
  const totalRawPercentage = ((current.total.raw / limits.total) * 100).toFixed(
    1,
  );
  const cssGzipPercentage = (
    (current.categories.css.gzip / limits.cssGzip) *
    100
  ).toFixed(1);

  const totalGzipExceeded = current.total.gzip > limits.totalGzip;
  const totalRawExceeded = current.total.raw > limits.total;
  const cssGzipExceeded = current.categories.css.gzip > limits.cssGzip;

  report += `- ${totalGzipExceeded ? '❌' : '✅'} Total gzipped: ${filesize(current.total.gzip)} / ${filesize(limits.totalGzip)} (${totalGzipPercentage}%)\n`;
  report += `- ${totalRawExceeded ? '❌' : '✅'} Total raw: ${filesize(current.total.raw)} / ${filesize(limits.total)} (${totalRawPercentage}%)\n`;
  report += `- ${cssGzipExceeded ? '❌' : '✅'} CSS gzipped: ${filesize(current.categories.css.gzip)} / ${filesize(limits.cssGzip)} (${cssGzipPercentage}%)\n`;

  // Check for violations
  const violations: string[] = [];
  if (totalGzipExceeded) violations.push('Total gzipped size exceeds limit');
  if (totalRawExceeded) violations.push('Total raw size exceeds limit');
  if (cssGzipExceeded) violations.push('CSS gzipped size exceeds limit');

  // Check for large chunks
  const largeChunks = current.largestFiles
    .filter((f) => f.gzip > limits.maxChunkSizeGzip)
    .map((f) => `${f.path} (${filesize(f.gzip)} gzipped)`);

  if (largeChunks.length > 0) {
    violations.push(`${largeChunks.length} chunk(s) exceed max chunk size`);
  }

  if (violations.length > 0) {
    report += '\n### ⚠️ Violations\n\n';
    violations.forEach((v) => {
      report += `- ${v}\n`;
    });
  }

  // Largest files
  report += '\n### Largest Files (Top 5)\n\n';
  current.largestFiles.slice(0, 5).forEach((file, index) => {
    report += `${index + 1}. \`${file.path}\` - ${filesize(file.gzip)}\n`;
  });

  // Full details in collapsible section
  report += `\n<details>\n<summary>View All Files (${current.total.fileCount} total)</summary>\n\n`;
  report += '| File | Size (gzip) |\n';
  report += '|------|-------------|\n';

  current.largestFiles.forEach((file) => {
    report += `| \`${file.path}\` | ${filesize(file.gzip)} |\n`;
  });

  report += '\n</details>\n';

  report += '\n---\n';
  report +=
    '*⚠️ Size comparison not available - comparison script not found in base branch.*\n';

  return report;
}

// Get file paths from command line
const currentPath = process.argv[2];

if (!currentPath) {
  console.error('Usage: format-current-size.ts <current-bundle.json>');
  process.exit(1);
}

try {
  const report = formatCurrentSize(currentPath);
  console.log(report);
} catch (error) {
  console.error('Error formatting size report:', error);
  process.exit(1);
}
