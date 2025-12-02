import { Client } from '@/src/client/client';
import {
  ErrorContextData,
  ErrorPayload,
} from '@/src/components/error-handling/types';
import {
  categorizeError,
  determineErrorSeverity,
  parseComponentStack,
} from '@/src/components/error-handling/utils';
import { Environment } from '@/src/environments';
import { postReportErrorsTelemetry } from '@/src/client/sdk.gen';

const recentlyReported = new Map<string, number>();
const DEDUPE_WINDOW_MS = 100; // 100ms should catch Strict Mode double-invokes

function getErrorSignature(error: Error): string {
  return `${error.name}:${error.message}:${error.stack?.substring(0, 100) || ''}`;
}

function wasRecentlyReported(error: Error): boolean {
  const signature = getErrorSignature(error);
  const lastReported = recentlyReported.get(signature);
  const now = Date.now();

  if (lastReported && now - lastReported < DEDUPE_WINDOW_MS) {
    return true;
  }

  recentlyReported.set(signature, now);

  // Cleanup old entries periodically
  if (recentlyReported.size > 100) {
    for (const [sig, timestamp] of recentlyReported.entries()) {
      if (now - timestamp > DEDUPE_WINDOW_MS) {
        recentlyReported.delete(sig);
      }
    }
  }

  return false;
}

/**
 * Logs error payload to console in debug mode
 * Shows what would be sent to telemetry API
 */
export const logDebugPayload = (
  payload: ErrorPayload,
  debugMode: boolean,
): void => {
  if (!debugMode) return;

  const severityEmoji = {
    critical: '🔴',
    error: '🟠',
    warning: '🟡',
    info: '🔵',
  };

  console.group('📮 [RemoteFlows] Error Report (Debug Mode)');
  console.log('─────────────────────────────────────────');
  console.log('❌ Error:', payload.error.message);
  console.log('📛 Name:', payload.error.name);
  console.log(
    `${severityEmoji[payload.error.severity]} Severity:`,
    payload.error.severity.toUpperCase(),
  );
  console.log('🏷️  Category:', payload.error.category);

  if (
    payload.error.component_stack &&
    payload.error.component_stack.length > 0
  ) {
    console.log(
      '🧩 Component Stack:',
      payload.error.component_stack.join(' → '),
    );
  }

  if (payload.context?.flow) {
    console.log('🔄 Flow:', payload.context.flow);
  }

  if (payload.context?.step !== undefined) {
    console.log('📍 Step:', payload.context.step);
  }

  if (payload.context?.metadata) {
    console.log('📝 Context Metadata:', payload.context.metadata);
  }

  console.log('⏰ Timestamp:', payload.metadata.timestamp);
  console.log('🌐 URL:', payload.metadata.url);
  console.log('📦 SDK Version:', payload.metadata.sdk_version);

  if (payload.error.stack) {
    console.log('\n📚 Stack Trace:');
    console.log(payload.error.stack);
  }

  console.log('\n📋 Full Payload (would be sent to telemetry):');
  console.log(JSON.stringify(payload, null, 2));
  console.log('─────────────────────────────────────────');
  console.groupEnd();
};

const getSafeUrl = () => {
  let url = 'unknown';
  if (typeof window !== 'undefined') {
    const href = window.location.href;
    // Replace localhost URLs with a dummy URL to avoid WAF issues
    if (href.includes('localhost') || href.includes('127.0.0.1')) {
      url = 'https://telemetry.local/report';
    } else {
      url = href;
    }
  }
  return url;
};

const encodeStack = (stack?: string) => {
  return stack ? btoa(stack) : '';
};

export function buildErrorPayload(
  error: Error,
  sdkVersion: string,
  environment: Environment,
  context?: ErrorContextData,
): ErrorPayload {
  const category = categorizeError(error);
  const severity = determineErrorSeverity(error, category);
  const componentStack = parseComponentStack(error, error.stack);
  const url = getSafeUrl();
  const encodedStack = encodeStack(error.stack);

  const payload: ErrorPayload = {
    error: {
      message: error.message,
      stack: encodedStack,
      name: error.name,
      category,
      severity,
      component_stack: componentStack,
    },
    context,
    metadata: {
      sdk_version: sdkVersion,
      timestamp: new Date().toISOString(),
      url,
      user_agent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      environment: environment,
    },
  };

  return payload;
}

/**
 * Determines if an error should be reported to telemetry
 * - All non-network errors are reported
 * - For network errors, only report server errors (500, 403, etc.)
 * - Skip client errors like 404
 */
export function shouldReportError(
  error: Error,
  payload: ErrorPayload,
): boolean {
  // Report all non-network errors
  if (payload.error.category !== 'NETWORK_ERROR') {
    return true;
  }

  // For network errors, check if it's a reportable HTTP status
  const message = error.message.toLowerCase();

  // Skip 404 errors
  if (message.includes('404') || message.includes('not found')) {
    return false;
  }

  // Report server errors (5xx) and forbidden/unauthorized (403, 401)
  const reportableStatusPatterns = [
    /\b5\d{2}\b/, // 5xx server errors
    /\b403\b/, // Forbidden
    /\b401\b/, // Unauthorized
    /\b429\b/, // Too Many Requests
    /timeout/i, // Timeout errors
  ];

  // If it matches any reportable pattern, report it
  // Otherwise, skip it (e.g., 400, 404, etc.)
  return reportableStatusPatterns.some((pattern) => pattern.test(message));
}

export function reportTelemetryError(
  error: Error,
  sdkVersion: string,
  client: Client,
  environment?: Environment,
  context?: ErrorContextData,
  options: {
    debugMode?: boolean;
  } = {
    debugMode: false,
  },
): void {
  if (wasRecentlyReported(error)) {
    if (options.debugMode) {
      console.log('[RemoteFlows] Skipping duplicate error report');
    }
    return;
  }

  const payload: ErrorPayload = buildErrorPayload(
    error,
    sdkVersion,
    environment ?? 'production',
    context,
  );

  // Check if this error should be reported to telemetry
  if (shouldReportError(error, payload)) {
    // Log to console in debug mode
    if (options.debugMode) {
      logDebugPayload(payload, Boolean(options.debugMode));
    }

    try {
      postReportErrorsTelemetry({
        client,
        body: payload,
      }).catch((err) => {
        // Silently fail - don't crash if telemetry reporting fails
        if (options.debugMode) {
          console.warn('[RemoteFlows] Failed to report error telemetry:', err);
        }
      });
    } catch (err) {
      // Silently fail - don't crash if telemetry reporting fails
      if (options.debugMode) {
        console.warn('[RemoteFlows] Error telemetry setup failed:', err);
      }
    }
  }
}
