import { convertFilesToBase64 } from '@/src/lib/files';
import { parseJSFToValidate as parseJSFToValidateCore } from '@remoteoss/remote-flows-core';
import type { $TSFixMe, JSFFields } from '@remoteoss/remote-flows-core';

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
  isFieldSkipped,
  isForceValue,
  resolveFieldDynamicProperties,
  round,
} from '@remoteoss/remote-flows-core';
