import { ThemeProviderProps } from '@/src/types/theme';
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from 'react-hook-form';
import { AnySchema } from 'yup';
import { SupportedTypes } from '../components/form/fields/types';

type AuthResponse = {
  accessToken: string;
  expiresIn: number;
};

export type JSFField = {
  computedAttributes: Record<string, unknown>;
  defaultValue: string | number;
  description: string;
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
};

export type Components = {
  [K in SupportedTypes]?: React.ComponentType<{
    /**
     * Field prop from React Hook Form's Controller component.
     * Contains field state and methods for registration.
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
    fieldData: JSFField;
  }>;
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
   * Flag to indicate if the SDK is in testing mode and use the testing environment.
   * If true, the SDK will use the testing environment for all API calls.
   */
  isTestingMode?: boolean;
};
