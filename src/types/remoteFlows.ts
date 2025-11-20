import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from 'react-hook-form';
import { ReactNode } from 'react';
import { AnySchema } from 'yup';
import { ThemeProviderProps } from '@/src/types/theme';
import { HelpCenterArticle } from '@/src/client';
import { SupportedTypes } from '../components/form/fields/types';
import { StatementProps } from '../components/form/Statement';
import { ENVIRONMENTS } from '../environments';
import { ColumnDef } from '@/src/components/shared/table/Table';
import { FieldFileDataProps } from '@/src/components/form/fields/FileUploadField';
import { FieldDataProps } from '@/src/types/field';

type AuthResponse = {
  accessToken: string;
  expiresIn: number;
};

export type JSFFieldset = {
  [x: string]: {
    propertiesByName: string[];
    title: string;
  };
};

export type JSFField = {
  computedAttributes: Record<string, unknown>;
  description: ReactNode;
  errorMessage: Record<string, string>;
  inputType: SupportedTypes;
  isVisible: boolean;
  jsonType: string;
  label: string;
  name: string;
  required: boolean;
  schema: AnySchema;
  scopedJsonSchema: Record<string, unknown>;
  type: string;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  defaultValue?: string | number;
  minDate?: string;
  maxDate?: string;
  maxLength?: number;
  multiple?: boolean;
  meta?: Record<string, unknown>;
};

export type TableComponentProps<T = $TSFixMe> = {
  data: T[] | undefined;
  columns: ColumnDef<T>[];
  className?: string;
  headerRowClassName?: string;
  bodyRowClassName?: string | ((row: T, index: number) => string);
};

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
 * Props for custom button components.
 */
export type ButtonComponentProps = {
  /**
   * The form ID that the button should be associated with.
   */
  form?: string;
  /**
   * The children content of the button.
   */
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  Record<string, unknown>;

export type ZendeskDrawerComponentProps = {
  open: boolean;
  onClose: () => void;
  data?: HelpCenterArticle;
  isLoading: boolean;
  error: Error | null;
  zendeskURL: string;
  Trigger: React.ReactElement;
};

/**
 * Props for custom statement components.
 */
export type StatementComponentProps = {
  data: StatementProps;
};

export type DrawerComponentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  trigger: React.ReactElement;
  children?: React.ReactNode;
  direction?: 'left' | 'right';
};

export type FieldSetToggleComponentProps = {
  isExpanded: boolean;
  onToggle: () => void;
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-label': string;
  className?: string;
  children?: React.ReactNode;
};

// We exclude the file type as we're extending the fieldData property in the FileUploadField component
type TypesWithoutFile = Exclude<SupportedTypes, 'file'>;

export type FileComponentProps = FieldComponentProps & {
  fieldData: FieldFileDataProps;
};

export type Components = {
  [K in TypesWithoutFile]?: React.ComponentType<FieldComponentProps>;
} & {
  file?: React.ComponentType<FileComponentProps>;
  statement?: React.ComponentType<StatementComponentProps>;
  button?: React.ComponentType<ButtonComponentProps>;
  fieldsetToggle?: React.ComponentType<FieldSetToggleComponentProps>;
  zendeskDrawer?: React.ComponentType<ZendeskDrawerComponentProps>;
  drawer?: React.ComponentType<DrawerComponentProps>;
  table?: React.ComponentType<TableComponentProps>;
};

export type RemoteFlowsSDKProps = Omit<ThemeProviderProps, 'children'> & {
  /**
   * Function to authenticate the user and obtain an access token.
   * @returns A promise that resolves to an object containing the access token and its expiration time.
   */
  auth: () => Promise<AuthResponse>;
  /**
   * Components to override the default field components used in the SDK.
   */
  components?: Components;
  /**
   * Environment to use for API calls.
   * If not provided, the SDK will use production environment.
   */
  environment?: keyof typeof ENVIRONMENTS;
  proxy?: {
    /**
     * URL of the proxy server to use for API calls.
     */
    url: string;
    /**
     * Headers to include in the API requests.
     */
    headers?: {
      [key: string]: string;
    };
  };
  /**
   * ID to use for the auth query.
   * If we navigate from one page to another with a different authentication method,
   * we need to use a different authId.
   */
  authId?: 'default' | 'client';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type $TSFixMe = any;

// Extend the global Window interface to include RemoteFlowsSDK
declare global {
  interface Window {
    RemoteFlowsSDK?: {
      version: string;
    };
  }
}

type MetaValues = {
  label?: string;
  prettyValue?: string | boolean;
  inputType?: string;
  desiredCurrency?: string;
};

export type Meta = Record<string, MetaValues>;
