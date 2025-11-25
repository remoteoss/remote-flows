/**
 * SDK version constant
 * Retrieved from package.json at build time
 * Falls back to 'unknown' if VERSION env var is not set
 */
export const npmPackageVersion = process.env.VERSION || 'unknown';
