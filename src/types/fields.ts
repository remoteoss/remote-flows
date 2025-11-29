import { FieldFileDataProps } from '@/src/components/form/fields/FileUploadField';
import { JSFField } from '@/src/types/remoteFlows';
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from 'react-hook-form';

/**
 * Props for custom field components.
 * All custom field components receive these three props from React Hook Form's Controller.
 */
export type FieldComponentProps = {
  /**
   * Field prop from React Hook Form's Controller component.
   * Contains field state and methods for registration.
   * You must bind these props to your HTML elements to ensure proper form state management.
   * @see https://react-hook-form.com/docs/usecontroller/controller
   */
  field: ControllerRenderProps<FieldValues, string>;
  /**
   * Field state prop from React Hook Form's Controller component.
   * Contains information about the field's state, such as errors, touched status, etc.
   * @see https://react-hook-form.com/docs/usecontroller/controller
   */
  fieldState: ControllerFieldState;
  /**
   * Metadata derived from JSON schema parsing that provides additional context and validation rules for the field.
   * Contains properties defined in the original JSON schema such as type, format, constraints, etc.
   */
  fieldData: FieldDataProps;
};

/**
 * Base type for field metadata passed to custom field components.
 * Extends JSFField with optional metadata for extensibility.
 */
export type FieldDataProps = Partial<JSFField> & {
  metadata?: Record<string, unknown>;
};

export type FileComponentProps = FieldComponentProps & {
  fieldData: FieldFileDataProps;
};

type FieldCountryDataProps = FieldDataProps & {
  $meta: {
    regions: Record<string, string[]>;
    subregions: Record<string, string[]>;
  };
};

export type CountryComponentProps = FieldComponentProps & {
  fieldData: FieldCountryDataProps;
};

type DatePickerDataProps = FieldDataProps & {
  minDate?: string;
  maxDate?: string;
};

export type DatePickerComponentProps = FieldComponentProps & {
  fieldData: DatePickerDataProps;
};

export type TextFieldDataProps = FieldDataProps & {
  includeErrorMessage?: boolean;
};

export type TextFieldComponentProps = FieldComponentProps & {
  fieldData: TextFieldDataProps;
};

/**
 * Props for custom statement components.
 */
export type StatementComponentProps = {
  data: {
    title?: string;
    description: string;
    severity: 'warning' | 'error' | 'success' | 'info' | undefined;
  };
};
