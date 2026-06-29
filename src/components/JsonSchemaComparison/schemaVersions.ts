export type SchemaVersion = number | 'latest';

export interface VersionOption {
  value: SchemaVersion;
  label: string;
}

export const BASIC_INFO_VERSIONS: VersionOption[] = [
  { value: 1, label: 'v1 (Legacy)' },
  { value: 3, label: 'v3 (Recommended)' },
];

// AI generated from tiger
// Last updated: 2026-06-29
const COUNTRY_CONTRACT_VERSIONS: Record<string, VersionOption[]> = {
  ALB: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  ARE: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  ARG: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  ARM: [{ value: 1, label: 'v1' }],
  AUS: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  AUT: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
    { value: 5, label: 'v5' },
    { value: 6, label: 'v6' },
  ],
  BEL: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  BGD: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  BGR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  BIH: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  BLR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  BOL: [{ value: 1, label: 'v1' }],
  BRA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  CAN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  CHE: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  CHL: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  CHN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
    { value: 5, label: 'v5' },
  ],
  COL: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  CRI: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  CYP: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  CZE: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  DEU: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  DNK: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  DOM: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  ECU: [{ value: 1, label: 'v1' }],
  EGY: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  ESP: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  EST: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  FIN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  FRA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  FRA_SAS: [{ value: 1, label: 'v1' }],
  GBR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  GEO: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  GRC: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  GTM: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  HKG: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  HND: [{ value: 1, label: 'v1' }],
  HRV: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  HUN: [{ value: 1, label: 'v1' }],
  IDN: [{ value: 1, label: 'v1' }],
  IND: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  IRL: [{ value: 1, label: 'v1' }],
  ISL: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  ISR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  ITA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  ITA_APL: [{ value: 1, label: 'v1' }],
  JAM: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  JPN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  KEN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  KGZ: [{ value: 1, label: 'v1' }],
  KHM: [{ value: 1, label: 'v1' }],
  KOR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  LBN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  LKA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  LTU: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  LUX: [{ value: 1, label: 'v1' }],
  LVA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  MAR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  MDA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  MEX: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  MKD: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  MLT: [{ value: 1, label: 'v1' }],
  MNG: [{ value: 1, label: 'v1' }],
  MUS: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  MYS: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  NGA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  NIC: [{ value: 1, label: 'v1' }],
  NLD: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  NOR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  NZL: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  PAK: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  PAN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  PER: [{ value: 1, label: 'v1' }],
  PHL: [{ value: 1, label: 'v1' }],
  POL: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  PRI: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  PRT: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  PRY: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  ROU: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  SAU: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  SGP: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  SLV: [{ value: 1, label: 'v1' }],
  SRB: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  SVK: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  SVN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  SWE: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  THA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  TUN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  TUR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
    { value: 4, label: 'v4' },
  ],
  TWN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  UGA: [{ value: 1, label: 'v1' }],
  UKR: [{ value: 1, label: 'v1' }],
  URY: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  USA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
  ],
  VNM: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 3, label: 'v3' },
  ],
  XKX: [{ value: 1, label: 'v1' }],
  ZAF: [{ value: 1, label: 'v1' }],
  ZWE: [{ value: 1, label: 'v1' }],
};

export const COUNTRY_CONTRACT_VERSIONS_WITH_MULTIPLE_VERSIONS =
  Object.fromEntries(
    Object.entries(COUNTRY_CONTRACT_VERSIONS).filter(
      ([, versions]) => versions.length > 1,
    ),
  ) as Record<string, VersionOption[]>;

export const FORM_TYPES = [
  { value: 'employment_basic_information', label: 'Basic Information' },
  { value: 'contract_details', label: 'Contract Details' },
] as const;

export type FormType = (typeof FORM_TYPES)[number]['value'];
