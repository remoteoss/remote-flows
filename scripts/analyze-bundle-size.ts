#!/usr/bin/env tsx

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';
import { filesize } from 'filesize';
import chalk from 'chalk';
import type { BundleAnalysis, FileData, CategoryStats } from './types.js';
import { DIST_DIR, getFileSize, getGzipSize, categorizeFile } from './utils.js';

function analyzeBundle(): BundleAnalysis {
  console.log(chalk.blue.bold('\n📦 Analyzing bundle size...\n'));

  const distPath = join(process.cwd(), DIST_DIR);
  const files = globSync('**/*', {
    cwd: distPath,
    nodir: true,
    ignore: ['**/*.map', '**/*.d.ts', '**/*.d.ts.map'],
  });

  const allFiles = globSync('**/*', {
    cwd: distPath,
    nodir: true,
  });

  const fileData: FileData[] = [];
  const categories: Record<
    'js' | 'css' | 'types' | 'sourcemap' | 'other',
    CategoryStats
  > = {
    js: { raw: 0, gzip: 0, count: 0 },
    css: { raw: 0, gzip: 0, count: 0 },
    types: { raw: 0, gzip: 0, count: 0 },
    sourcemap: { raw: 0, gzip: 0, count: 0 },
    other: { raw: 0, gzip: 0, count: 0 },
  };

  let totalRaw = 0;
  let totalGzip = 0;

  for (const file of allFiles) {
    const filePath = join(distPath, file);
    const raw = getFileSize(filePath);
    const gzip = getGzipSize(filePath);
    const category = categorizeFile(file);

    categories[category].raw += raw;
    categories[category].gzip += gzip;
    categories[category].count += 1;

    fileData.push({
      path: file,
      raw,
      gzip,
      category,
    });
  }

  // Calculate totals excluding source maps and type definitions
  for (const file of files) {
    const filePath = join(distPath, file);
    totalRaw += getFileSize(filePath);
    totalGzip += getGzipSize(filePath);
  }

  // Sort files by gzipped size descending
  fileData.sort((a, b) => b.gzip - a.gzip);

  // Get top 10 largest files (excluding source maps and types)
  const largestFiles = fileData
    .filter((f) => f.category !== 'sourcemap' && f.category !== 'types')
    .slice(0, 10);

  const result: BundleAnalysis = {
    timestamp: new Date().toISOString(),
    total: {
      raw: totalRaw,
      gzip: totalGzip,
      fileCount: files.length,
    },
    categories: {
      js: {
        raw: categories.js.raw,
        gzip: categories.js.gzip,
        count: categories.js.count,
      },
      css: {
        raw: categories.css.raw,
        gzip: categories.css.gzip,
        count: categories.css.count,
      },
    },
    largestFiles: largestFiles.map((f) => ({
      path: f.path,
      raw: f.raw,
      gzip: f.gzip,
    })),
    allFiles: fileData.map((f) => ({
      path: f.path,
      raw: f.raw,
      gzip: f.gzip,
      category: f.category,
    })),
  };

  // Print summary to console
  console.log(chalk.bold('Bundle Size Summary:'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(
    `${chalk.cyan('Total (raw):')}     ${chalk.white.bold(filesize(totalRaw))} (${files.length} files)`,
  );
  console.log(
    `${chalk.cyan('Total (gzip):')}    ${chalk.white.bold(filesize(totalGzip))}`,
  );
  console.log('');
  console.log(
    `${chalk.cyan('JS (raw):')}        ${chalk.white(filesize(categories.js.raw))} (${categories.js.count} files)`,
  );
  console.log(
    `${chalk.cyan('JS (gzip):')}       ${chalk.white(filesize(categories.js.gzip))}`,
  );
  console.log('');
  console.log(
    `${chalk.cyan('CSS (raw):')}       ${chalk.white(filesize(categories.css.raw))} (${categories.css.count} files)`,
  );
  console.log(
    `${chalk.cyan('CSS (gzip):')}      ${chalk.white(filesize(categories.css.gzip))}`,
  );
  console.log('');

  console.log(chalk.bold('\nLargest Files (top 10):'));
  console.log(chalk.gray('─'.repeat(60)));
  largestFiles.forEach((file, index) => {
    console.log(`${chalk.yellow(`${index + 1}.`)} ${file.path}`);
    console.log(
      `   ${chalk.gray('Raw:')} ${filesize(file.raw)} ${chalk.gray('│ Gzip:')} ${filesize(file.gzip)}`,
    );
  });

  // Write JSON output
  if (process.argv.includes('--json')) {
    console.log('\n' + JSON.stringify(result, null, 2));
  }

  // Write to file if specified, or default to out/bundle-analysis.json
  const outputIndex = process.argv.indexOf('--output');
  let outputPath: string;

  if (outputIndex !== -1 && process.argv[outputIndex + 1]) {
    outputPath = process.argv[outputIndex + 1];
  } else {
    // Default output location
    outputPath = join(process.cwd(), 'out', 'bundle-analysis.json');
  }

  // Ensure the output directory exists
  const outputDir = join(outputPath, '..');
  mkdirSync(outputDir, { recursive: true });

  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(chalk.green(`\n✓ Bundle size data written to ${outputPath}`));

  console.log('');
  return result;
}

// Run analysis
try {
  analyzeBundle();
} catch (error) {
  console.error(chalk.red('Error analyzing bundle:'), error);
  process.exit(1);
}
