import { ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY } from '@/example/src/flows/Onboarding/jsonSchemaVersions';
import { EorHiringModel } from '@/src/client/types.gen';
import { getContractDetailsSchemaVersion } from '@/src/flows/Onboarding/utils';

export function resolvePinnedVersion(
  country: string,
  defaultVersion: number,
  hiringModel?: EorHiringModel | null,
): number {
  if (!(country in ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY)) {
    return defaultVersion;
  }
  const version = getContractDetailsSchemaVersion(
    { jsonSchemaVersionByCountry: ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY },
    country,
    hiringModel,
  );
  return typeof version === 'number' ? version : defaultVersion;
}
