import { PropsWithChildren, ReactNode } from 'react';
import { AnySchema } from 'yup';
import { ab as HelpCenterArticle } from './types.gen-C6jD_TP6.js';
import { B as BaseTypes } from './types-ZWIpiFgj.js';
import { ControllerRenderProps, FieldValues, ControllerFieldState } from 'react-hook-form';

type ThemeProviderProps = PropsWithChildren<{
    theme?: Partial<{
        colors: ThemeColors;
        spacing: string;
        borderRadius: string;
        font: ThemeFont;
    }>;
}>;
type ThemeColors = Partial<{
    borderInput: string;
    primaryBackground: string;
    primaryForeground: string;
    accentBackground: string;
    accentForeground: string;
    danger: string;
    warningBackground: string;
    warningBorder: string;
}>;
type ThemeFont = {
    fontSizeBase: string;
};

type Environment = 'local' | 'partners' | 'production' | 'sandbox' | 'staging';
declare const ENVIRONMENTS: Record<Environment, string>;

type ColumnDef<T = $TSFixMe> = {
    id: keyof T;
    label: React.ReactNode;
    className?: string;
    cellClassName?: string;
    render?: (value: $TSFixMe, row: T, index: number) => React.ReactNode;
};

type FieldFileDataProps = FieldDataProps & {
    accept?: string;
    multiple?: boolean;
    maxFileSize?: number;
};

type DailySchedule = {
    day: string;
    start_time: string;
    end_time: string;
    hours: number;
    break_duration_minutes: string;
    checked: boolean;
};

/**
 * Props for custom field components.
 * All custom field components receive these three props from React Hook Form's Controller.
 */
type FieldComponentProps = {
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
type HelpCenterDataProps = {
    /**
     * The call to action text for the help center.
     */
    callToAction: string;
    /**
     * The Zendesk ID of the help center article.
     */
    id: number;
    /**
     * The HTML content of the help center article.
     */
    content: string;
    /**
     * The title of the help center article.
     */
    title: string;
};
/**
 * Base type for field metadata passed to custom field components.
 * Extends JSFField with optional metadata for extensibility.
 */
type FieldDataProps = Partial<JSFField> & {
    metadata?: Record<string, unknown>;
    meta?: {
        helpCenter?: HelpCenterDataProps;
    };
};
type FileComponentProps = FieldComponentProps & {
    fieldData: FieldFileDataProps;
};
type FieldCountryDataProps = Omit<FieldDataProps, 'meta'> & {
    $meta: {
        regions: Record<string, string[]>;
        subregions: Record<string, string[]>;
    };
};
type CountryComponentProps = FieldComponentProps & {
    fieldData: FieldCountryDataProps;
};
type DatePickerDataProps = Omit<FieldDataProps, 'meta'> & {
    minDate?: string;
    maxDate?: string;
};
type DatePickerComponentProps = FieldComponentProps & {
    fieldData: DatePickerDataProps;
};
type TextFieldDataProps = FieldDataProps & {
    includeErrorMessage?: boolean;
};
type TextFieldComponentProps = FieldComponentProps & {
    fieldData: TextFieldDataProps;
};
type WorkScheduleDataProps = FieldDataProps & {
    onSubmit: (data: DailySchedule[]) => void;
    currentSchedule: DailySchedule[];
    defaultFormattedValue: {
        workHoursSummary: string[];
        breakSummary: string[];
        totalWorkHours: number;
    };
};
type WorkScheduleComponentProps = FieldComponentProps & {
    fieldData: WorkScheduleDataProps;
};
/**
 * Props for custom statement components.
 */
type StatementComponentProps = {
    data: {
        title?: string;
        description: string;
        severity: 'warning' | 'error' | 'success' | 'info' | undefined;
    };
};
type PricingPlanDataProps = Omit<Partial<JSFField>, 'options'> & {
    metadata?: Record<string, unknown>;
    meta?: {
        helpCenter?: HelpCenterDataProps;
    };
    options: {
        value: string;
        label: string;
        description: string;
        meta: {
            features: string[];
            price: {
                amount: number;
                currencyCode: string;
            };
        };
        disabled: boolean;
    }[];
};
type PricingPlanComponentProps = Omit<FieldComponentProps, 'fieldData'> & {
    fieldData: PricingPlanDataProps;
};

type AuthResponse = {
    accessToken: string;
    expiresIn: number;
};
type JSFFields = Record<string, unknown>[];
type JSFFieldset = {
    [x: string]: {
        propertiesByName: string[];
        title: string;
    };
};
type JSFField = {
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
type JSFCustomComponentProps = JSFField & {
    setValue: (value: unknown) => void;
};
type TableComponentProps<T = $TSFixMe> = {
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
type ButtonComponentProps = {
    /**
     * The form ID that the button should be associated with.
     */
    form?: string;
    /**
     * The children content of the button.
     */
    children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>;
type ZendeskDrawerComponentProps = {
    open: boolean;
    onClose: () => void;
    data?: HelpCenterArticle;
    isLoading: boolean;
    error: Error | null;
    zendeskURL: string;
    Trigger: React.ReactElement;
};
type DrawerComponentProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    trigger: React.ReactElement;
    children?: React.ReactNode;
    direction?: 'left' | 'right' | 'bottom' | 'top';
    className?: string;
};
type FieldSetToggleComponentProps = {
    isExpanded: boolean;
    onToggle: () => void;
    'aria-expanded': boolean;
    'aria-controls': string;
    'aria-label': string;
    className?: string;
    children?: React.ReactNode;
};
type PDFPreviewComponentProps = {
    base64Data: string;
    fileName?: string;
};
type FieldComponentTypes = Exclude<BaseTypes, 'file' | 'countries' | 'text' | 'work-schedule' | 'hidden' | 'money' | 'date'>;
type Components = {
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
type RemoteFlowsSDKProps = Omit<ThemeProviderProps, 'children'> & {
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
type $TSFixMe = any;
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
type Meta = Record<string, MetaValues>;

export type { $TSFixMe as $, ButtonComponentProps as B, Components as C, DrawerComponentProps as D, FieldSetToggleComponentProps as F, JSFFields as J, Meta as M, PDFPreviewComponentProps as P, RemoteFlowsSDKProps as R, StatementComponentProps as S, TextFieldComponentProps as T, WorkScheduleComponentProps as W, ZendeskDrawerComponentProps as Z, JSFFieldset as a, JSFCustomComponentProps as b, JSFField as c, FieldComponentProps as d, FileComponentProps as e, CountryComponentProps as f, DatePickerComponentProps as g, PricingPlanComponentProps as h, PricingPlanDataProps as i };
