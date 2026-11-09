import { ENVIRONMENTS } from '@/src/environments';
import { npmPackageVersion } from '@/src/lib/version';
import { RemoteFlowsSDKProps } from '@/src/types/remoteFlows';
import { debug } from '@/src/lib/utils';
import {
  createClient as createClientCore,
  type AuthResponse,
} from '@remoteoss/remote-flows-core';

type Options = Partial<{
  environment: keyof typeof ENVIRONMENTS;
  proxy: RemoteFlowsSDKProps['proxy'];
  credentials: RemoteFlowsSDKProps['credentials'];
}>;

export function createClient(
  auth?: () => Promise<AuthResponse>,
  options?: Options,
) {
  const baseUrl = options?.environment
    ? ENVIRONMENTS[options?.environment]
    : process.env.REMOTE_GATEWAY_URL;

  if (options?.environment && options?.environment !== 'production') {
    debug(npmPackageVersion);
  }

  return createClientCore(auth, {
    baseUrl,
    proxy: options?.proxy,
    credentials: options?.credentials,
    version: npmPackageVersion,
  });
}
