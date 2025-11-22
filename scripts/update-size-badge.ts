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

interface SizeHistory {
  lastUpdated: string;
  currentSize: {
    total: number;
    totalGzip: number;
    css: number;
    cssGzip: number;
  };
  badge: BadgeData;
  history: Array<{
    version: string;
    commit: string;
    date: string;
    size: number;
  }>;
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

  // Get version and commit info from environment or package.json
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));
  const version = process.env.PACKAGE_VERSION || packageJson.version;
  const commit = process.env.GITHUB_SHA?.substring(0, 8) || 'local';

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

  // Load existing history if available
  let existingHistory: SizeHistory | null = null;
  const historyPath = process.argv[3];

  if (historyPath) {
    try {
      existingHistory = JSON.parse(readFileSync(historyPath, 'utf-8'));
    } catch (error) {
      // File doesn't exist yet, will create new history
      console.log('No existing history found, creating new history');
    }
  }

  // Create new history entry
  const newHistoryEntry = {
    version,
    commit,
    date: new Date().toISOString().split('T')[0],
    size: analysis.total.gzip,
  };

  // Build history array (keep last 50 entries)
  const history = existingHistory?.history || [];

  // Only add if it's a different commit
  const lastEntry = history[history.length - 1];
  if (!lastEntry || lastEntry.commit !== commit) {
    history.push(newHistoryEntry);
  }

  // Keep only last 50 entries
  const trimmedHistory = history.slice(-50);

  // Create final data structure
  const sizeData: SizeHistory = {
    lastUpdated: new Date().toISOString(),
    currentSize: {
      total: analysis.total.raw,
      totalGzip: analysis.total.gzip,
      css: analysis.categories.css.raw,
      cssGzip: analysis.categories.css.gzip,
    },
    badge: badgeData,
    history: trimmedHistory,
  };

  // Output the data
  console.log(JSON.stringify(sizeData, null, 2));
}

// Run the update
try {
  updateSizeBadge();
} catch (error) {
  console.error('Error updating size badge:', error);
  process.exit(1);
}
