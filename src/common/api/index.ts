import { useMutation } from '@tanstack/react-query';
import { createMagicLinkMutation } from '@remoteoss/remote-flows-core';
import { withClient } from '@/src/lib/withClient';

const useMagicLinkOptions = withClient(createMagicLinkMutation);

export const useMagicLink = () => useMutation(useMagicLinkOptions());
