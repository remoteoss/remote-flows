type BaseTypes = 'text' | 'number' | 'email' | 'select' | 'multi-select' | 'radio' | 'date' | 'checkbox' | 'textarea' | 'money' | 'file' | 'countries' | 'hidden' | 'work-schedule';
type SupportedTypes = BaseTypes | 'fieldset' | 'fieldset-flat';

export type { BaseTypes as B, SupportedTypes as S };
