import { useMutation } from '@tanstack/react-query';
import { magicLinkMutation } from '@remoteoss/remote-flows-core';
import { withClient } from '@/src/lib/withClient';

const useMagicLinkOptions = withClient(magicLinkMutation);

export const useMagicLink = () => useMutation(useMagicLinkOptions());
