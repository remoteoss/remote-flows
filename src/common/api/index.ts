import { useMutation } from '@tanstack/react-query';
import {
  MagicLinkParams,
  postV1MagicLink,
  postV1SandboxEmploymentsEmploymentIdRiskReserveProofOfPaymentsApprove,
} from '@/src/client';
import { useClient } from '@/src/context';

import { Client } from '@/src/client/client';

export const useMagicLink = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (params: MagicLinkParams) => {
      return postV1MagicLink({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: params,
      });
    },
  });
};

export const useSandboxApproveRiskReservePayment = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (employmentId: string) => {
      return postV1SandboxEmploymentsEmploymentIdRiskReserveProofOfPaymentsApprove(
        {
          client: client as Client,
          headers: {
            Authorization: ``,
          },
          path: {
            employment_id: employmentId,
          },
        },
      );
    },
  });
};
