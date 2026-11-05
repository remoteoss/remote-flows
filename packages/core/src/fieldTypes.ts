const textInputTypes = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  SELECT: 'select',
  COUNTRIES: 'countries',
  TEL: 'tel',
  EMAIL: 'email',
  MONEY: 'money',
  DATE: 'date',
  DATE_RANGE: 'date-range',
  CURRENCIES: 'currencies',
  TIME: 'time',
} as const;

const checkboxTypes = {
  CHECKBOX: 'checkbox',
  ACK_CHECK: 'ack-check',
} as const;

export const supportedTypes = {
  FILE: 'file',
  RADIO: 'radio',
  /** @deprecated */
  RADIO_CARD: 'radio-card',
  GROUP_ARRAY: 'group-array',
  EXTRA: 'extra',
  STATEMENT: 'statement',
  HIDDEN: 'hidden',
  FIELDSET: 'fieldset',
  FIELDSET_FLAT: 'fieldset-flat',
  WORK_SCHEDULE: 'work-schedule',
  WORK_WEEK_SCHEDULE: 'work-week-schedule',
  /** @deprecated we still display benefits in read-only contract details view, but never in any form */
  BENEFITS: 'benefits',
  SIGNATURE: 'signature',
  SELECT_MULTIPLE: 'select-multiple',
  ...textInputTypes,
  ...checkboxTypes,
} as const;
