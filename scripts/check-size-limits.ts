#!/usr/bin/env tsx

import { join } from 'path';
import { globSync } from 'glob';
import { filesize } from 'filesize';
import chalk from 'chalk';
import type { Violation } from './types.js';
import {
  DIST_DIR,
  loadConfig,
  getFileSize,
  getGzipSize,
  categorizeFile,
} from './utils.js';

function categorizeFileSimple(filePath: string): 'js' | 'css' | 'other' {
  if (category === 'js' || category === 'css') return category;
  return 'other';
}

function checkSizeLimits(): void {
  console.log(chalk.blue.bold('\n🔍 Checking bundle size limits...\n'));

  const config = loadConfig();
  const limits = config.limits;
  const warningThreshold = config.warningThreshold || 0.9;

  const distPath = join(process.cwd(), DIST_DIR);
  const files = globSync('**/*', {
    cwd: distPath,
    nodir: true,
    ignore: config.exclude || [],
  });

  let totalRaw = 0;
  let totalGzip = 0;
  let cssRaw = 0;
  let cssGzip = 0;
  const chunks: Array<{ path: string; raw: number; gzip: number }> = [];

  for (const file of files) {
    const filePath = join(distPath, file);
    const raw = getFileSize(filePath);
    const gzip = getGzipSize(filePath);
    const category = categorizeFileSimple(file);

    totalRaw += raw;
    totalGzip += gzip;

    if (category === 'css') {
      cssRaw += raw;
      cssGzip += gzip;
    } else if (category === 'js') {
      chunks.push({ path: file, raw, gzip });
    }
  }

  // Sort chunks by size for reporting
  chunks.sort((a, b) => b.gzip - a.gzip);

  const violations: Violation[] = [];
  const warnings: Violation[] = [];

  // Check total size limits
  if (limits.total && totalRaw > limits.total) {
    violations.push({
      type: 'Total Size (raw)',
      current: totalRaw,
      limit: limits.total,
      percentage: (totalRaw / limits.total) * 100,
    });
  } else if (limits.total && totalRaw > limits.total * warningThreshold) {
    warnings.push({
      type: 'Total Size (raw)',
      current: totalRaw,
      limit: limits.total,
      percentage: (totalRaw / limits.total) * 100,
    });
  }

  if (limits.totalGzip && totalGzip > limits.totalGzip) {
    violations.push({
      type: 'Total Size (gzip)',
      current: totalGzip,
      limit: limits.totalGzip,
      percentage: (totalGzip / limits.totalGzip) * 100,
    });
  } else if (
    limits.totalGzip &&
    totalGzip > limits.totalGzip * warningThreshold
  ) {
    warnings.push({
      type: 'Total Size (gzip)',
      current: totalGzip,
      limit: limits.totalGzip,
      percentage: (totalGzip / limits.totalGzip) * 100,
    });
  }

  // Check CSS size limits
  if (limits.css && cssRaw > limits.css) {
    violations.push({
      type: 'CSS Size (raw)',
      current: cssRaw,
      limit: limits.css,
      percentage: (cssRaw / limits.css) * 100,
    });
  } else if (limits.css && cssRaw > limits.css * warningThreshold) {
    warnings.push({
      type: 'CSS Size (raw)',
      current: cssRaw,
      limit: limits.css,
      percentage: (cssRaw / limits.css) * 100,
    });
  }

  if (limits.cssGzip && cssGzip > limits.cssGzip) {
    violations.push({
      type: 'CSS Size (gzip)',
      current: cssGzip,
      limit: limits.cssGzip,
      percentage: (cssGzip / limits.cssGzip) * 100,
    });
  } else if (limits.cssGzip && cssGzip > limits.cssGzip * warningThreshold) {
    warnings.push({
      type: 'CSS Size (gzip)',
      current: cssGzip,
      limit: limits.cssGzip,
      percentage: (cssGzip / limits.cssGzip) * 100,
    });
  }

  // Check individual chunk size limits
  if (limits.maxChunkSize || limits.maxChunkSizeGzip) {
    for (const chunk of chunks) {
      if (limits.maxChunkSize && chunk.raw > limits.maxChunkSize) {
        violations.push({
          type: `Chunk Size (raw) - ${chunk.path}`,
          current: chunk.raw,
          limit: limits.maxChunkSize,
          percentage: (chunk.raw / limits.maxChunkSize) * 100,
        });
      }

      if (limits.maxChunkSizeGzip && chunk.gzip > limits.maxChunkSizeGzip) {
        violations.push({
          type: `Chunk Size (gzip) - ${chunk.path}`,
          current: chunk.gzip,
          limit: limits.maxChunkSizeGzip,
          percentage: (chunk.gzip / limits.maxChunkSizeGzip) * 100,
        });
      }
    }
  }

  // Print summary
  console.log(chalk.bold('Size Check Summary:'));
  console.log(chalk.gray('─'.repeat(70)));

  const formatSizeCheck = (
    label: string,
    current: number,
    limit: number,
  ): string => {
    const percentage = (current / limit) * 100;
    const icon =
      current > limit
        ? '❌'
        : current > limit * warningThreshold
          ? '⚠️ '
          : '✅';
    const color =
      current > limit
        ? chalk.red
        : current > limit * warningThreshold
          ? chalk.yellow
          : chalk.green;
    return `${icon} ${label}: ${color(filesize(current))} / ${filesize(limit)} (${percentage.toFixed(1)}%)`;
  };

  if (limits.totalGzip) {
    console.log(formatSizeCheck('Total (gzip)', totalGzip, limits.totalGzip));
  }
  if (limits.total) {
    console.log(formatSizeCheck('Total (raw)', totalRaw, limits.total));
  }
  if (limits.cssGzip) {
    console.log(formatSizeCheck('CSS (gzip)', cssGzip, limits.cssGzip));
  }
  if (limits.css) {
    console.log(formatSizeCheck('CSS (raw)', cssRaw, limits.css));
  }

  console.log('');

  // Print warnings
  if (warnings.length > 0) {
    console.log(chalk.yellow.bold('⚠️  Warnings (approaching limits):'));
    console.log(chalk.gray('─'.repeat(70)));
    warnings.forEach((warning) => {
      console.log(
        chalk.yellow(
          `  ${warning.type}: ${filesize(warning.current)} / ${filesize(warning.limit)} (${warning.percentage.toFixed(1)}%)`,
        ),
      );
    });
    console.log('');
  }

  // Print violations
  if (violations.length > 0) {
    console.log(chalk.red.bold('❌ Size Limit Violations:'));
    console.log(chalk.gray('─'.repeat(70)));
    violations.forEach((violation) => {
      console.log(
        chalk.red(
          `  ${violation.type}: ${filesize(violation.current)} / ${filesize(violation.limit)} (${violation.percentage.toFixed(1)}%)`,
        ),
      );
    });
    console.log('');
    console.log(chalk.red.bold('Build failed due to bundle size violations!'));
    console.log(chalk.yellow('\nTo fix this:'));
    console.log(
      chalk.yellow(
        '  1. Optimize your code and remove unnecessary dependencies',
      ),
    );
    console.log(chalk.yellow('  2. Use code splitting to reduce chunk sizes'));
    console.log(
      chalk.yellow(
        '  3. If the increase is justified, update the limits in .sizelimit.json',
      ),
    );
    console.log('');
    process.exit(1);
  }

  console.log(chalk.green.bold('✓ All bundle size checks passed!'));
  console.log('');
}

// Run check
try {
  checkSizeLimits();
} catch (error) {
  console.error(chalk.red('Error checking bundle size:'), error);
  process.exit(1);
}
