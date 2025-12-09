// Base types are the types that are supported by the SDK to be overridden with the components prop
export type BaseTypes =
  | 'text'
  | 'number'
  | 'email'
  | 'select'
  | 'multi-select'
  | 'radio'
  | 'date'
  | 'checkbox'
  | 'textarea'
  | 'file'
  | 'countries'
  | 'work-schedule';

export type SupportedTypes =
  | BaseTypes
  | 'hidden'
  | 'money'
  | 'fieldset'
  | 'fieldset-flat';
