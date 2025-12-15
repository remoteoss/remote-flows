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
  | 'money'
  | 'file'
  | 'countries'
  | 'hidden'
  | 'work-schedule';

export type SupportedTypes = BaseTypes | 'fieldset' | 'fieldset-flat';
