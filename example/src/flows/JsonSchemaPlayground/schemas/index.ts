import { FRANCE_WAGE_PORTAGE_SCHEMA } from './franceWagePortage';
import { GERMANY_CONTRACT_DETAILS_SCHEMA } from './germanyContractDetails';
import { ITALY_APL_SCHEMA } from './italyAplSchema';
import { SIMPLE_USER_PROFILE_SCHEMA } from './simpleUserProfile';
import { SampleSchema } from '@remoteoss/remote-flows/internals';

export const SCHEMAS: Record<string, SampleSchema> = {
  'italy-apl': ITALY_APL_SCHEMA,
  'france-wage-portage': FRANCE_WAGE_PORTAGE_SCHEMA,
  'simple-user-profile': SIMPLE_USER_PROFILE_SCHEMA,
  'germany-contract-details': GERMANY_CONTRACT_DETAILS_SCHEMA,
};
