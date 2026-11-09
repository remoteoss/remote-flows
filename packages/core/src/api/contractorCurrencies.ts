import { getV1ContractorsEmploymentsEmploymentIdContractorCurrencies } from '../client/sdk.gen';
import type { Client } from '../client/client';

export const contractorCurrenciesOptions = (
  client: Client,
  employmentId: string,
) => ({
  queryKey: ['contractor-currencies', employmentId] as const,
  queryFn: () =>
    getV1ContractorsEmploymentsEmploymentIdContractorCurrencies({
      client,
      path: { employment_id: employmentId },
      query: {
        restrict_to_guaranteed_pay_out_currencies: false,
      },
    }),
});

type ContractorCurrenciesResponse = Awaited<
  ReturnType<ReturnType<typeof contractorCurrenciesOptions>['queryFn']>
>;

export const selectContractorCurrencies = ({
  data,
}: ContractorCurrenciesResponse) => data?.data;

export const selectContractorCurrencyCodes = (
  response: ContractorCurrenciesResponse,
) => selectContractorCurrencies(response)?.map((currency) => currency.code);
