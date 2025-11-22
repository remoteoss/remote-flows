import {
  ErrorContextData,
  ErrorPayload,
} from '@/src/components/error-handling/types';
import {
  categorizeError,
  determineErrorSeverity,
  parseComponentStack,
} from '@/src/components/error-handling/utils';

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

  if (payload.error.componentStack && payload.error.componentStack.length > 0) {
    console.log(
      '🧩 Component Stack:',
      payload.error.componentStack.join(' → '),
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
  console.log('📦 SDK Version:', payload.metadata.sdkVersion);

  if (payload.error.stack) {
    console.log('\n📚 Stack Trace:');
    console.log(payload.error.stack);
  }

  console.log('\n📋 Full Payload (would be sent to telemetry):');
  console.log(JSON.stringify(payload, null, 2));
  console.log('─────────────────────────────────────────');
  console.groupEnd();
};

export function buildErrorPayload(
  error: Error,
  sdkVersion: string,
  context?: ErrorContextData,
): ErrorPayload {
  const category = categorizeError(error);
  const severity = determineErrorSeverity(error, category);
  const componentStack = parseComponentStack(error, error.stack);

  const payload: ErrorPayload = {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      category,
      severity,
      componentStack,
    },
    context,
    metadata: {
      sdkVersion,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    },
  };

  return payload;
}

export function reportTelemetryError(
  error: Error,
  sdkVersion: string,
  context?: ErrorContextData,
  options: {
    debugMode?: boolean;
  } = {
    debugMode: false,
  },
): void {
  const payload: ErrorPayload = buildErrorPayload(error, sdkVersion, context);

  // Log to console in debug mode
  logDebugPayload(payload, Boolean(options.debugMode));

  // Send to telemetry API
  // TODO: Implement actual telemetry API call
}
