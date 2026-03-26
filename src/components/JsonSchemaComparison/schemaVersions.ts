export type SchemaVersion = number | 'latest';

export interface VersionOption {
  value: SchemaVersion;
  label: string;
}

export const BASIC_INFO_VERSIONS: VersionOption[] = [
  { value: 1, label: 'v1 (Legacy)' },
  { value: 3, label: 'v3 (Recommended)' },
  { value: 'latest', label: 'Latest' },
];

// AI generated from tiger
export const COUNTRY_CONTRACT_VERSIONS: Record<string, VersionOption[]> = {
  ALB: [{ value: 'latest', label: 'Latest' }],
  ARE: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  ARG: [{ value: 'latest', label: 'Latest' }],
  ARM: [{ value: 'latest', label: 'Latest' }],
  AUS: [{ value: 'latest', label: 'Latest' }],
  AUT: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  BEL: [{ value: 'latest', label: 'Latest' }],
  BGD: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  BGR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  BIH: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  BLR: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  BOL: [{ value: 'latest', label: 'Latest' }],
  BRA: [{ value: 'latest', label: 'Latest' }],
  CAN: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  CHE: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  CHL: [{ value: 'latest', label: 'Latest' }],
  CHN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  COL: [{ value: 'latest', label: 'Latest' }],
  CRI: [{ value: 'latest', label: 'Latest' }],
  CYP: [{ value: 'latest', label: 'Latest' }],
  CZE: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  DEU: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  DNK: [{ value: 'latest', label: 'Latest' }],
  DOM: [{ value: 'latest', label: 'Latest' }],
  ECU: [{ value: 'latest', label: 'Latest' }],
  EGY: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  ESP: [{ value: 'latest', label: 'Latest' }],
  EST: [{ value: 'latest', label: 'Latest' }],
  FIN: [{ value: 'latest', label: 'Latest' }],
  FRA: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  FRA_SAS: [{ value: 'latest', label: 'Latest' }],
  GBR: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  GEO: [{ value: 'latest', label: 'Latest' }],
  GRC: [{ value: 'latest', label: 'Latest' }],
  GTM: [{ value: 'latest', label: 'Latest' }],
  HKG: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  HND: [{ value: 'latest', label: 'Latest' }],
  HRV: [{ value: 'latest', label: 'Latest' }],
  HUN: [{ value: 'latest', label: 'Latest' }],
  IDN: [{ value: 'latest', label: 'Latest' }],
  IND: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  IRL: [{ value: 'latest', label: 'Latest' }],
  ISL: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  ISR: [{ value: 'latest', label: 'Latest' }],
  ITA: [{ value: 'latest', label: 'Latest' }],
  ITA_APL: [{ value: 'latest', label: 'Latest' }],
  JAM: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  JPN: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  KEN: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  KGZ: [{ value: 'latest', label: 'Latest' }],
  KHM: [{ value: 'latest', label: 'Latest' }],
  KOR: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  LBN: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  LKA: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  LTU: [{ value: 'latest', label: 'Latest' }],
  LUX: [{ value: 'latest', label: 'Latest' }],
  LVA: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  MAR: [{ value: 'latest', label: 'Latest' }],
  MDA: [{ value: 'latest', label: 'Latest' }],
  MEX: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  MKD: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  MLT: [{ value: 'latest', label: 'Latest' }],
  MNG: [{ value: 'latest', label: 'Latest' }],
  MUS: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  MYS: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  NGA: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  NIC: [{ value: 'latest', label: 'Latest' }],
  NLD: [{ value: 'latest', label: 'Latest' }],
  NOR: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  NZL: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  PAK: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  PAN: [{ value: 'latest', label: 'Latest' }],
  PER: [{ value: 'latest', label: 'Latest' }],
  PHL: [{ value: 'latest', label: 'Latest' }],
  POL: [{ value: 'latest', label: 'Latest' }],
  PRI: [{ value: 'latest', label: 'Latest' }],
  PRT: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  PRY: [{ value: 'latest', label: 'Latest' }],
  ROU: [{ value: 'latest', label: 'Latest' }],
  SAU: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  SGP: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  SLV: [{ value: 'latest', label: 'Latest' }],
  SRB: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  SVK: [{ value: 'latest', label: 'Latest' }],
  SVN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  SWE: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  THA: [
    { value: 1, label: 'v1' },
    { value: 'latest', label: 'Latest' },
  ],
  TUN: [
    { value: 1, label: 'v1' },
    { value: 2, label: 'v2' },
    { value: 'latest', label: 'Latest' },
  ],
  TUR: [{ value: 'latest', label: 'Latest' }],
  TWN: [{ value: 'latest', label: 'Latest' }],
  UGA: [{ value: 'latest', label: 'Latest' }],
  UKR: [{ value: 'latest', label: 'Latest' }],
  URY: [{ value: 'latest', label: 'Latest' }],
  USA: [{ value: 'latest', label: 'Latest' }],
  VNM: [{ value: 'latest', label: 'Latest' }],
  XKX: [{ value: 'latest', label: 'Latest' }],
  ZAF: [{ value: 'latest', label: 'Latest' }],
  ZWE: [{ value: 'latest', label: 'Latest' }],
};

export const FORM_TYPES = [
  { value: 'employment_basic_information', label: 'Basic Information' },
  { value: 'contract_details', label: 'Contract Details' },
] as const;

export type FormType = (typeof FORM_TYPES)[number]['value'];
