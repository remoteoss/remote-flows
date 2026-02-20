import { ReactNode } from 'react';
import { AnySchema } from 'yup';
import { ThemeProviderProps } from '@/src/types/theme';
import { HelpCenterArticle } from '@/src/client';
import { BaseTypes } from '../components/form/fields/types';
import { ENVIRONMENTS } from '../environments';
import { ColumnDef } from '@/src/components/shared/table/Table';
import {
  CountryComponentProps,
  DatePickerComponentProps,
  FieldComponentProps,
  FileComponentProps,
  StatementComponentProps,
  TextFieldComponentProps,
  WorkScheduleComponentProps,
} from '@/src/types/fields';

type AuthResponse = {
  accessToken: string;
  expiresIn: number;
};

export type JSFFields = Record<string, unknown>[];

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
  inputType: BaseTypes;
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
    meta?: Record<string, unknown>;
  }>;
  defaultValue?: string | number;
  minDate?: string;
  maxDate?: string;
  maxLength?: number;
  multiple?: boolean;
  meta?: Record<string, unknown>;
};

/**
 * Props passed to custom Component when using jsfModify with x-jsf-presentation.
 * Used when overriding field rendering via the Component prop in jsfModify options.
 */
export type JSFCustomComponentProps = JSFField & {
  setValue: (value: unknown) => void;
};

export type TableComponentProps<T = $TSFixMe> = {
  ref: React.ForwardedRef<HTMLTableElement>;
  data: T[] | undefined;
  columns: ColumnDef<T>[];
  className?: string;
  headerRowClassName?: string;
  bodyRowClassName?: string | ((row: T, index: number) => string);
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

export type DrawerComponentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  trigger: React.ReactElement;
  children?: React.ReactNode;
  direction?: 'left' | 'right' | 'bottom' | 'top';
  className?: string;
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

export type PDFPreviewComponentProps = {
  base64Data: string;
  fileName?: string;
};

// We exclude some of the types that we are overriding
type FieldComponentTypes = Exclude<
  BaseTypes,
  'file' | 'countries' | 'text' | 'work-schedule' | 'hidden' | 'money' | 'date'
>;

export type Components = {
  [K in FieldComponentTypes]?: React.ComponentType<FieldComponentProps>;
} & {
  text?: React.ComponentType<TextFieldComponentProps>;
  file?: React.ComponentType<FileComponentProps>;
  date?: React.ComponentType<DatePickerComponentProps>;
  countries?: React.ComponentType<CountryComponentProps>;
  statement?: React.ComponentType<StatementComponentProps>;
  button?: React.ComponentType<ButtonComponentProps>;
  fieldsetToggle?: React.ComponentType<FieldSetToggleComponentProps>;
  zendeskDrawer?: React.ComponentType<ZendeskDrawerComponentProps>;
  drawer?: React.ComponentType<DrawerComponentProps>;
  table?: React.ComponentType<TableComponentProps>;
  'work-schedule'?: React.ComponentType<WorkScheduleComponentProps>;
  pdfViewer?: React.ComponentType<PDFPreviewComponentProps>;
};

export type RemoteFlowsSDKProps = Omit<ThemeProviderProps, 'children'> & {
  /**
   * Function to authenticate the user and obtain an access token.
   * Optional when using cookie-based authentication (via the `credentials` prop).
   * When provided, bearer token authentication will be used.
   * @returns A promise that resolves to an object containing the access token and its expiration time.
   */
  auth?: () => Promise<AuthResponse>;
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
   * Error boundary configuration.
   */
  errorBoundary?: {
    /**
     * If true, re-throws errors to parent error boundary.
     * If false, shows fallback UI to prevent crashes.
     * @default false
     */
    useParentErrorBoundary?: boolean;
    /**
     * Custom fallback UI to show when an error occurs.
     * fallback only works when rethrow is false.
     * If not provided, shows default error message.
     */
    fallback?: ReactNode | ((error: Error) => ReactNode);
  };
  /**
   * Debug mode to enable logging of telemetry errors to the console.
   * @default false
   */
  debug?: boolean;
  /**
   * Credentials mode for fetch requests.
   * If not provided, credentials will not be included in requests.
   * Set to 'include' to include credentials (cookies, authorization headers) in cross-origin requests.
   * Set to 'same-origin' to only include credentials for same-origin requests.
   * @default undefined (credentials not included)
   */
  credentials?: RequestCredentials;
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
