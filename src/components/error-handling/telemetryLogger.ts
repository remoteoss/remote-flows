import {
  ErrorCategory,
  ErrorContextData,
  ErrorPayload,
  ErrorSeverity,
} from '@/src/components/error-handling/types';

/**
 * Parses React component stack from error stack trace or error message
 * Extracts component names from stack trace lines and error messages
 */
const parseComponentStack = (
  error: Error,
  stack?: string,
): string[] | undefined => {
  if (!stack) return undefined;

  const componentStack: string[] = [];
  const lines = stack.split('\n');

  // First, check if the error message mentions a component
  // Example: "Check the render method of `FieldSetField`."
  const messageComponentMatch = error.message.match(/`([A-Z][a-zA-Z0-9_]*)`/);
  if (messageComponentMatch?.[1]) {
    componentStack.push(messageComponentMatch[1]);
  }

  // Then parse stack trace for component names
  for (const line of lines) {
    // Match React component patterns in stack traces
    // Examples:
    // - "at ComponentName (http://..."
    // - "at ComponentName.render (http://..."
    // - "ComponentName@http://..."
    const atMatch = line.match(/at\s+([A-Z][a-zA-Z0-9_]*)/);
    const symbolMatch = line.match(/([A-Z][a-zA-Z0-9_]*)@/);

    const componentName = atMatch?.[1] || symbolMatch?.[1];

    if (componentName && !componentStack.includes(componentName)) {
      // Filter out React internal component names
      const reactInternals = [
        'Fragment',
        'StrictMode',
        'Suspense',
        'ErrorBoundary',
        'Profiler',
      ];

      if (!reactInternals.includes(componentName)) {
        componentStack.push(componentName);
      }
    }
  }

  return componentStack.length > 0 ? componentStack : undefined;
};

/**
 * Categorizes error based on error message and name
 */
const categorizeError = (error: Error): ErrorCategory => {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // React rendering errors
  if (
    message.includes('element type is invalid') ||
    message.includes('render') ||
    message.includes('hydration') ||
    message.includes('component') ||
    name.includes('invariantviolation')
  ) {
    return 'RENDER_ERROR';
  }

  // Network errors
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('http') ||
    message.includes('timeout') ||
    name.includes('networkerror')
  ) {
    return 'NETWORK_ERROR';
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    name.includes('validationerror')
  ) {
    return 'VALIDATION_ERROR';
  }

  // Hook errors
  if (
    message.includes('hook') ||
    message.includes('useeffect') ||
    message.includes('usestate') ||
    message.includes('rendered more hooks') ||
    message.includes('rendered fewer hooks')
  ) {
    return 'HOOK_ERROR';
  }

  // State errors
  if (
    message.includes('state') ||
    message.includes('context') ||
    message.includes('provider')
  ) {
    return 'STATE_ERROR';
  }

  // Runtime errors
  if (
    name.includes('typeerror') ||
    name.includes('referenceerror') ||
    name.includes('rangeerror')
  ) {
    return 'RUNTIME_ERROR';
  }

  return 'UNKNOWN_ERROR';
};

/**
 * Determines error severity based on category and message
 */
const determineErrorSeverity = (
  error: Error,
  category: ErrorCategory,
): ErrorSeverity => {
  const message = error.message.toLowerCase();

  // Critical errors that break the app
  if (
    category === 'RENDER_ERROR' ||
    message.includes('element type is invalid') ||
    message.includes('hydration') ||
    message.includes('cannot read property') ||
    message.includes('is not a function')
  ) {
    return 'critical';
  }

  // Network errors are usually errors but not critical
  if (category === 'NETWORK_ERROR') {
    return 'error';
  }

  // Validation errors are usually just errors
  if (category === 'VALIDATION_ERROR') {
    return 'error';
  }

  // Hook errors are critical
  if (category === 'HOOK_ERROR') {
    return 'critical';
  }

  // State errors can be critical
  if (category === 'STATE_ERROR') {
    return 'error';
  }

  // Default to error
  return 'error';
};

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
    console.log('🧩 Component Stack:', payload.error.componentStack.join(' → '));
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

  // Log to console in debug mode
  logDebugPayload(payload, Boolean(options.debugMode));

  // Send to telemetry API
  // TODO: Implement actual telemetry API call
}
