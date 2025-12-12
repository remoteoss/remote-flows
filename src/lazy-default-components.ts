import { lazy } from 'react';
import type { Components } from './types/remoteFlows';

/**
 * Lazy-loaded default field components for RemoteFlows.
 *
 * These components are loaded on-demand using React.lazy() and code-splitting.
 * Only components that are not provided by the user will be loaded.
 *
 * This reduces the initial bundle size for users who provide custom components.
 */
export const lazyDefaultComponents: Components = {
  button: lazy(() =>
    import('./components/form/fields/default/ButtonDefault').then((m) => ({
      default: m.ButtonDefault,
    })),
  ),
  checkbox: lazy(() =>
    import('./components/form/fields/default/CheckboxFieldDefault').then(
      (m) => ({
        default: m.CheckboxFieldDefault,
      }),
    ),
  ),
  countries: lazy(() =>
    import('./components/form/fields/default/CountryFieldDefault').then(
      (m) => ({
        default: m.CountryFieldDefault,
      }),
    ),
  ),
  date: lazy(() =>
    import('./components/form/fields/default/DatePickerFieldDefault').then(
      (m) => ({
        default: m.DatePickerFieldDefault,
      }),
    ),
  ),
  drawer: lazy(() =>
    import('./components/shared/drawer/DrawerDefault').then((m) => ({
      default: m.DrawerDefault,
    })),
  ),
  email: lazy(() =>
    import('./components/form/fields/default/EmailFieldDefault').then((m) => ({
      default: m.EmailFieldDefault,
    })),
  ),
  fieldsetToggle: lazy(() =>
    import('./components/form/fields/default/FieldsetToggleButtonDefault').then(
      (m) => ({
        default: m.FieldsetToggleButtonDefault,
      }),
    ),
  ),
  file: lazy(() =>
    import('./components/form/fields/default/FileUploadFieldDefault').then(
      (m) => ({
        default: m.FileUploadFieldDefault,
      }),
    ),
  ),
  'multi-select': lazy(() =>
    import('./components/form/fields/default/MultiSelectFieldDefault').then(
      (m) => ({
        default: m.MultiSelectFieldDefault,
      }),
    ),
  ),
  number: lazy(() =>
    import('./components/form/fields/default/NumberFieldDefault').then((m) => ({
      default: m.NumberFieldDefault,
    })),
  ),
  radio: lazy(() =>
    import('./components/form/fields/default/RadioGroupFieldDefault').then(
      (m) => ({
        default: m.RadioGroupFieldDefault,
      }),
    ),
  ),
  select: lazy(() =>
    import('./components/form/fields/default/SelectFieldDefault').then((m) => ({
      default: m.SelectFieldDefault,
    })),
  ),
  statement: lazy(() =>
    import('./components/form/fields/default/StatementDefault').then((m) => ({
      default: m.StatementDefault,
    })),
  ),
  textarea: lazy(() =>
    import('./components/form/fields/default/TextAreaFieldDefault').then(
      (m) => ({
        default: m.TextAreaFieldDefault,
      }),
    ),
  ),
  text: lazy(() =>
    import('./components/form/fields/default/TextFieldDefault').then((m) => ({
      default: m.TextFieldDefault,
    })),
  ),
  zendeskDrawer: lazy(() =>
    import('./components/shared/zendesk-drawer/ZendeskDrawerDefault').then(
      (m) => ({
        default: m.ZendeskDrawerDefault,
      }),
    ),
  ),
  table: lazy(() =>
    import('./components/shared/table/TableFieldDefault').then((m) => ({
      default: m.TableFieldDefault,
    })),
  ),
  'work-schedule': lazy(() =>
    import('./components/form/fields/default/WorkScheduleFieldDefault').then(
      (m) => ({
        default: m.WorkScheduleFieldDefault,
      }),
    ),
  ),
};
