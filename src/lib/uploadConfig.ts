/**
 * As we aren't exposing the api/v1/upload-config to the Remote API this is a temporary solution to get the upload config.
 */

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const FILE_TYPES = {
  document: '.pdf, .doc, .docx, .xls, .xlsx, .csv',
};
