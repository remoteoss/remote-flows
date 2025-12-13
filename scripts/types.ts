export interface SizeLimitConfig {
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

export interface FileData {
  path: string;
  raw: number;
  gzip: number;
  category: 'js' | 'css' | 'types' | 'sourcemap' | 'other';
}

export interface CategoryStats {
  raw: number;
  gzip: number;
  count: number;
}

export interface BundleAnalysis {
  timestamp: string;
  total: {
    raw: number;
    gzip: number;
    fileCount: number;
  };
  categories: {
    js: CategoryStats;
    css: CategoryStats;
  };
  largestFiles: Array<{
    path: string;
    raw: number;
    gzip: number;
  }>;
  allFiles?: FileData[];
}

export interface ChangeInfo {
  text: string;
  icon: string;
  color: string;
}

export interface Violation {
  type: string;
  current: number;
  limit: number;
  percentage: number;
}

export interface CoverageData {
  timestamp: string;
  lines: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  statements: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  functions: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  branches: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
}

export interface CoverageChange {
  text: string;
  icon: string;
  color: string;
  delta: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type $TSFixMe = any;
