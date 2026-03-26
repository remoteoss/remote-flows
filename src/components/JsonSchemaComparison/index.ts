export { JsonSchemaComparison } from './JsonSchemaComparison';
export { SchemaFormComparison } from './SchemaFormComparison';
export { compareFormFields, getDiffStyles } from './formDiffDetector';
export {
  BASIC_INFO_VERSIONS,
  CONTRACT_DETAILS_VERSIONS,
  COUNTRY_CONTRACT_VERSIONS,
  FORM_TYPES,
} from './schemaVersions';
export type { SchemaVersion, VersionOption, FormType } from './schemaVersions';
export type { DiffType, FieldDiff, FormDiff } from './formDiffDetector';
