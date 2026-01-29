import { useMutation} from '@tanstack/react-query';
import { useClient } from '@/src/context';
import { Client } from '@/src/client/client';

import {
  CreateCompanyParams,
  postCreateCompany,
} from '@/src/client';


export const useCreateCompanyRequest = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: CreateCompanyParams) => {
      console.log("FIRING REQUEST", payload)
      return postCreateCompany({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
      });
    },
  });
};


