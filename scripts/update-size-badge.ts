#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import { filesize } from 'filesize';
import type { BundleAnalysis } from './types.js';

interface SizeLimitConfig {
  limits: {
    total: number;
    totalGzip: number;
    css: number;
    cssGzip: number;
    maxChunkSize: number;
    maxChunkSizeGzip: number;
  };
  exclude: string[];
  warningThreshold: number;
}

interface BadgeData {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
}


/**
 * Get badge color based on gzipped size and limits from .sizelimit.json
 * @param gzipSize - Size in bytes
 * @param limit - Maximum allowed size in bytes
 * @param warningThreshold - Threshold for warning color (0-1)
 * @returns Color name for shields.io badge
 */
function getBadgeColor(gzipSize: number, limit: number, warningThreshold: number): string {
  const warningSize = limit * warningThreshold;

  if (gzipSize < warningSize) {
    return 'brightgreen';
  } else if (gzipSize <= limit) {
    return 'yellow';
  } else {
    return 'red';
  }
}

/**
 * Format size for badge display
 * @param size - Size in bytes
 * @returns Formatted string (e.g., "142 KB")
 */
function formatBadgeSize(size: number): string {
  return filesize(size, { standard: 'jedec' }) as string;
}

/**
 * Update size badge and history data
 */
function updateSizeBadge() {
  // Read the bundle analysis
  const analysisPath = process.argv[2] || join(process.cwd(), 'out', 'bundle-analysis.json');
  const analysis: BundleAnalysis = JSON.parse(readFileSync(analysisPath, 'utf-8'));

  // Read size limits configuration
  const sizeLimitPath = join(process.cwd(), '.sizelimit.json');
  const sizeLimitConfig: SizeLimitConfig = JSON.parse(readFileSync(sizeLimitPath, 'utf-8'));

  // Create badge data using limits from .sizelimit.json
  const badgeData: BadgeData = {
    schemaVersion: 1,
    label: 'bundle size',
    message: formatBadgeSize(analysis.total.gzip),
    color: getBadgeColor(
      analysis.total.gzip,
      sizeLimitConfig.limits.totalGzip,
      sizeLimitConfig.warningThreshold
    ),
  };

  // Output the badge data (shields.io endpoint format)
  console.log(JSON.stringify(badgeData, null, 2));
}

// Run the update
try {
  updateSizeBadge();
} catch (error) {
  console.error('Error updating size badge:', error);
  process.exit(1);
}
