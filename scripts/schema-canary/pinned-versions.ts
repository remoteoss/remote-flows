import { ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY } from '@/example/src/flows/Onboarding/jsonSchemaVersions';
import { EorHiringModel } from '@/src/client/types.gen';
import { getDefaultHiringModel } from '@/src/flows/Onboarding/hiringModels';
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

function modelKeyedPin(country: string): Record<string, number> | undefined {
  const countryPins = ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY as Record<
    string,
    { contract_details?: unknown } | undefined
  >;
  const pin = countryPins[country]?.contract_details;
  return typeof pin === 'object' && pin !== null
    ? (pin as Record<string, number>)
    : undefined;
}

/** The hiring model that keeps a baseline apart from the country's others, or undefined when the baseline is the country's default one. */
export function baselineModel(
  country: string,
  hiringModel?: EorHiringModel | null,
): EorHiringModel | undefined {
  if (!modelKeyedPin(country) || !hiringModel) {
    return undefined;
  }
  return hiringModel === getDefaultHiringModel(country)
    ? undefined
    : hiringModel;
}

/** The pinned hiring models of a country other than `hiringModel`, whose schemas a run that seeded `hiringModel` does not check. */
export function uncoveredHiringModels(
  country: string,
  hiringModel?: EorHiringModel | null,
): EorHiringModel[] {
  const pin = modelKeyedPin(country);
  if (!pin) {
    return [];
  }
  const seeded = hiringModel ?? getDefaultHiringModel(country);
  return (Object.keys(pin) as EorHiringModel[]).filter(
    (model) => model !== seeded,
  );
}

/** Every baseline a country's pin expects: one per hiring model for a model-keyed pin, otherwise one. */
export function expectedBaselines(
  country: string,
  defaultVersion: number,
): { model?: EorHiringModel; version: number }[] {
  const pin = modelKeyedPin(country);
  if (!pin) {
    return [{ version: resolvePinnedVersion(country, defaultVersion) }];
  }
  return (Object.keys(pin) as EorHiringModel[]).map((model) => ({
    model: baselineModel(country, model),
    version: resolvePinnedVersion(country, defaultVersion, model),
  }));
}
