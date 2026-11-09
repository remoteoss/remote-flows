import { convertFilesToBase64 } from '@/src/lib/files';
import {
  parseFormValuesToAPI as parseFormValuesToAPICore,
  parseJSFToValidate as parseJSFToValidateCore,
  parseSubmitValues as parseSubmitValuesCore,
} from '@remoteoss/remote-flows-core';
import type { $TSFixMe, JSFFields } from '@remoteoss/remote-flows-core';

export async function parseFormValuesToAPI(
  formValues: Record<string, $TSFixMe> = {},
  fields: $TSFixMe[],
) {
  return parseFormValuesToAPICore(formValues, fields, convertFilesToBase64);
}

export async function parseSubmitValues(
  formValues: Record<string, $TSFixMe>,
  fields: $TSFixMe[],
  config?: { keepInvisibleValues?: boolean },
) {
  return parseSubmitValuesCore(formValues, fields, {
    ...config,
    convertFiles: convertFilesToBase64,
  });
}

export async function parseJSFToValidate(
  formValues: Record<string, $TSFixMe>,
  fields: JSFFields,
  config: { isPartialValidation: boolean } = {
    isPartialValidation: false,
  },
) {
  return parseJSFToValidateCore(formValues, fields, {
    ...config,
    convertFiles: convertFilesToBase64,
  });
}

export {
  checkFieldHasForcedValue,
  convertFromCents,
  convertToCents,
  enableAckFields,
  fieldsetHasVisibleContent,
  getBlankRowValues,
  getFieldRenderType,
  getFieldsWithFlatFieldsets,
  getInitialValues,
  getMinStartDate,
  isDateDisabled,
  isFieldLocked,
  isFieldSkipped,
  isForceValue,
  isMultiSelect,
  resolveFieldDynamicProperties,
  round,
} from '@remoteoss/remote-flows-core';
