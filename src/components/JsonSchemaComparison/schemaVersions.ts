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

export const CONTRACT_DETAILS_VERSIONS: VersionOption[] = [
  { value: 1, label: 'v1' },
  { value: 2, label: 'v2' },
  { value: 'latest', label: 'Latest' },
];

export const FORM_TYPES = [
  { value: 'employment_basic_information', label: 'Basic Information' },
  { value: 'contract_details', label: 'Contract Details' },
] as const;

export type FormType = (typeof FORM_TYPES)[number]['value'];
