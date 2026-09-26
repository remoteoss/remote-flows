import { ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY } from '@/example/src/flows/Onboarding/jsonSchemaVersions';

export function resolvePinnedVersion(
  country: string,
  defaultVersion: number,
): number {
  const entry =
    ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY[
      country as keyof typeof ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY
    ];
  return entry?.contract_details ?? defaultVersion;
}
