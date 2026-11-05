// oxlint-disable-next-line typescript/no-explicit-any
export type $TSFixMe = any;

export type JSFFields = Record<string, unknown>[];

export type JSFFieldset = {
  [x: string]: {
    propertiesByName: string[];
    title: string;
  };
};

/**
 * Reference to a file already uploaded, as returned by the API on `GET` for `inputType: file`
 * fields. Sent back unchanged on the next submit to keep the file instead of re-uploading it.
 *
 * A custom `inputType: file` component can receive one of these
 * in place of a real `File` for a field that already had a file attached — it carries no binary
 * content and doesn't implement the `Blob`/`File` interface.
 */
export type UploadedFileReference = {
  name: string;
  id: string;
  sub_type?: string | null;
};

export type Field = {
  name: string;
  label?: string;
  description?: string;
  fields?: Field[];
  type: 'string' | 'integer' | 'number' | 'object' | 'boolean';
  inputType:
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'money'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'hidden';
  required: boolean;
  jsonType?: string;
  isVisible: boolean;
  accept?: string;
  errorMessage?: Record<string, string>;
  computedAttributes?: Record<string, unknown>;
  minDate?: string;
  maxDate?: string;
  maxLength?: number;
  maxFileSize?: number;
  format?: string;
  anyOf?: unknown[];
  options?: unknown[];

  onChange?: (value: string) => void;
  // Allow additional properties from x-jsf-presentation (e.g. meta from oneOf/anyOf)
  [key: string]: unknown;
};
