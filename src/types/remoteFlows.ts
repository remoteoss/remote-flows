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
  maxLength?: number;
  multiple?: boolean;
  meta?: Record<string, unknown>;
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
  fieldData: Partial<JSFField> & { metadata?: Record<string, unknown> };
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

export type Components = {
  [K in SupportedTypes]?: React.ComponentType<FieldComponentProps>;
} & {
  statement?: React.ComponentType<StatementComponentProps>;
  button?: React.ComponentType<ButtonComponentProps>;
  zendeskDrawer?: React.ComponentType<ZendeskDrawerComponentProps>;
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
