import { useQuery } from '@tanstack/react-query';
import { identityOptions, selectIdentity } from '@remoteoss/remote-flows-core';
import { withClient } from '@/src/lib/withClient';

export const useIdentityOptions = withClient(identityOptions);

/**
 * The entities behind the current token. Which of `company` and `user` are present depends on the
 * token type: a client credentials token has neither.
 */
export const useIdentity = ({ enabled }: { enabled?: boolean } = {}) =>
  useQuery({
    ...useIdentityOptions(),
    enabled,
    select: selectIdentity,
  });
