export type PinnedContractDetailsVersion = {
  country: string;
  version: number;
};

export const PINNED_CONTRACT_DETAILS_VERSIONS: PinnedContractDetailsVersion[] =
  [
    { country: 'ARE', version: 3 },
    { country: 'BLR', version: 2 },
    { country: 'CHN', version: 3 },
    { country: 'CHE', version: 2 },
    { country: 'CZE', version: 2 },
    { country: 'DEU', version: 7 },
    { country: 'ESP', version: 7 },
    { country: 'GBR', version: 3 },
    { country: 'HKG', version: 2 },
    { country: 'IND', version: 2 },
    { country: 'ISL', version: 2 },
    { country: 'ITA', version: 2 },
    { country: 'JAM', version: 2 },
    { country: 'KEN', version: 2 },
    { country: 'LBN', version: 2 },
    { country: 'MEX', version: 2 },
    { country: 'MUS', version: 2 },
    { country: 'MYS', version: 2 },
    { country: 'NGA', version: 2 },
    { country: 'NLD', version: 2 },
    { country: 'NOR', version: 2 },
    { country: 'NZL', version: 2 },
    { country: 'PAK', version: 2 },
    { country: 'PRT', version: 3 },
    { country: 'SAU', version: 2 },
    { country: 'SGP', version: 2 },
    { country: 'SRB', version: 2 },
    { country: 'SWE', version: 2 },
    { country: 'USA', version: 3 },
  ];

export function resolvePinnedVersion(
  country: string,
  defaultVersion: number,
): number {
  const entry = PINNED_CONTRACT_DETAILS_VERSIONS.find(
    (pinned) => pinned.country === country,
  );
  return entry?.version ?? defaultVersion;
}
