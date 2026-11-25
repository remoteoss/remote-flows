import {
  type AuthResponse,
  createClient as createClientCore,
  ENVIRONMENTS,
  type Environment,
} from '@remoteoss/remote-flows-core';
import { npmPackageVersion } from './version';

declare global {
  interface Window {
    RemoteFlowsSDK?: {
      version: string;
    };
  }
}

type Options = {
  auth?: () => Promise<AuthResponse>;
  environment?: Environment;
  proxy?: { url: string; headers?: Record<string, string> };
};

function debug(version: string) {
  if (typeof window !== 'undefined') {
    window.RemoteFlowsSDK = { version };
  }
}

export function createClient(options: Options) {
  if (options.environment && options.environment !== 'production') {
    debug(npmPackageVersion);
  }

  return createClientCore(options.auth, {
    baseUrl: options.environment
      ? ENVIRONMENTS[options.environment]
      : undefined,
    proxy: options.proxy,
    version: npmPackageVersion,
  });
}
