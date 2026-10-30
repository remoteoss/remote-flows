import { FRANCE_WAGE_PORTAGE_SCHEMA } from './franceWagePortage';
import { GERMANY_CONTRACT_DETAILS_SCHEMA } from './germanyContractDetails';
import { GROUP_ARRAY_SCHEMA } from './groupArray';
import { GROUP_ARRAY_CURRENCY_SCHEMA } from './groupArrayCurrency';
import { GROUP_ARRAY_FIELDSETS_SCHEMA } from './groupArrayFieldsets';
import { ITALY_APL_SCHEMA } from './italyAplSchema';
import { SIMPLE_USER_PROFILE_SCHEMA } from './simpleUserProfile';
import { SampleSchema } from '@remoteoss/remote-flows/internals';

export const SCHEMAS: Record<string, SampleSchema> = {
  'italy-apl': ITALY_APL_SCHEMA,
  'france-wage-portage': FRANCE_WAGE_PORTAGE_SCHEMA,
  'simple-user-profile': SIMPLE_USER_PROFILE_SCHEMA,
  'germany-contract-details': GERMANY_CONTRACT_DETAILS_SCHEMA,
  'group-array': GROUP_ARRAY_SCHEMA,
  'group-array-fieldsets': GROUP_ARRAY_FIELDSETS_SCHEMA,
  'group-array-currency': GROUP_ARRAY_CURRENCY_SCHEMA,
};
