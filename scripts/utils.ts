import { readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
import { gzipSizeSync } from 'gzip-size';
import type { BundleAnalysis, SizeLimitConfig } from './types.js';

export const DIST_DIR = 'dist';
export const CONFIG_FILE = '.sizelimit.json';

export function getFileSize(filePath: string): number {
  const stats = statSync(filePath);
  return stats.size;
}

export function getGzipSize(filePath: string): number {
  const content = readFileSync(filePath);
  return gzipSizeSync(content);
}

export function categorizeFile(
  filePath: string,
): 'js' | 'css' | 'types' | 'sourcemap' | 'other' {
  const ext = extname(filePath);
  if (ext === '.css') return 'css';
  if (ext === '.js' || ext === '.mjs') return 'js';
  if (ext === '.map') return 'sourcemap';
  if (ext === '.ts' || filePath.endsWith('.d.ts')) return 'types';
  return 'other';
}

export function loadConfig(): SizeLimitConfig {
  try {
    const configPath = join(process.cwd(), CONFIG_FILE);
    const config = JSON.parse(
      readFileSync(configPath, 'utf-8'),
    ) as SizeLimitConfig;
    return config;
  } catch (error) {
    console.error(
      `Failed to load config from ${CONFIG_FILE}:`,
      (error as Error).message,
    );
    process.exit(1);
  }
}

export function loadBundleData(filePath: string): BundleAnalysis {
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
