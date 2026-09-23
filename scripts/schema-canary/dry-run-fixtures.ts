import { contractDetailsSchemaV1Germany } from '@/src/flows/Onboarding/tests/fixtures/contractDetails/v1-germany';
import { contractDetailsSchemaV1France } from '@/src/flows/Onboarding/tests/fixtures/contractDetails/v1-france';
import { contractDetailsSchemaV1Italy } from '@/src/flows/Onboarding/tests/fixtures/contractDetails/v1-italy-apl';

export type DryRunFixture = {
  country: string;
  version: number | 'latest';
  schema: Record<string, unknown> | null;
};

export const DRY_RUN_FIXTURES: DryRunFixture[] = [
  {
    country: 'DEU',
    version: 7,
    schema: contractDetailsSchemaV1Germany.data,
  },
  {
    country: 'FRA',
    version: 'latest',
    schema: contractDetailsSchemaV1France.data,
  },
  {
    country: 'ITA',
    version: 2,
    schema: contractDetailsSchemaV1Italy.data,
  },
  {
    country: 'ZZZ',
    version: 'latest',
    schema: null,
  },
];
