import { useFormContext } from 'react-hook-form';
import { Fragment, useEffect, useRef } from 'react';
import omit from 'lodash.omit';
import { baseFields } from '@/src/components/form/fields/baseFields';
import { cn } from '@/src/lib/utils';
import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { Statement } from '@/src/components/form/Statement';
import { useFormFields } from '@/src/context';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';
import { FieldsetToggleButtonDefault } from '@/src/components/form/fields/default/FieldsetToggleButtonDefault';
import { BaseTypes, SupportedTypes } from './types';
import { StatementComponentProps } from '@/src/types/fields';
import { checkFieldHasForcedValue } from '@/src/components/form/utils';
import { ForcedValueField } from '@/src/components/form/fields/ForcedValueField';
import { BaseFormDescription } from '@/src/components/ui/form';

type FieldBase = {
  label: string;
  name: string;
  description: string;
  Component?: React.ComponentType<$TSFixMe>;
  inputType: SupportedTypes;
  multiple?: boolean;
};

type FieldWithOptions = FieldBase & {
  type: 'select' | 'radio';
  options: Array<{ value: string; label: string }>;
};

type FieldWithoutOptions = FieldBase & {
  type: Exclude<SupportedTypes, 'select' | 'radio'>;
  options?: never;
};

type Field = FieldWithOptions | FieldWithoutOptions;

type FieldSetFeatures = {
  toggle?: {
    enabled: boolean;
    defaultExpanded?: boolean;
    stateField?: string;
    labels?: {
      expand: string;
      collapse: string;
    };
    className?: string;
  };
};

export type FieldSetProps = {
  label: string;
  name: string;
  description: string;
  fields: Field[];
  features?: FieldSetFeatures;
  components: Components;
  statement?: StatementComponentProps['data'];
  isFlatFieldset: boolean;
  extra?: React.ReactNode;
  variant: 'outset' | 'inset';
  meta?: {
    helpCenter?: {
      callToAction: string;
      id: number;
      url: string;
      label: string;
    };
  } & Record<string, $TSFixMe>;
};

export function FieldSetField({
  label,
  name,
  fields,
  description,
  components,
  statement,
  isFlatFieldset,
  extra,
  variant = 'outset',
  features,
  meta,
}: FieldSetProps) {
  const { helpCenter } = meta || {};
  const { watch, setValue, trigger, formState } = useFormContext();
  const { components: formComponents } = useFormFields();

  // Get expanded state from form state if stateField is provided
  const stateField = features?.toggle?.stateField;
  const isExpanded = stateField
    ? watch(stateField)
    : (features?.toggle?.defaultExpanded ?? true);

  const fieldNames = fields.map(
    ({ name: fieldName }) => `${name}.${fieldName}`,
  );
  const watchedValues = watch(fieldNames);
  const prevValuesRef = useRef<string[]>(watchedValues);
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleExpanded = () => {
    if (stateField) {
      setValue(stateField, !isExpanded);
    }
  };

  useEffect(() => {
    const currentValues = watchedValues;
    const previousValues = prevValuesRef.current;
    const hasBeenSubmitted = formState.isSubmitted || formState.submitCount > 0;

    // Check if any value has changed
    let hasChanged = false;
    for (let i = 0; i < currentValues.length; i++) {
      if (
        currentValues[i] !== undefined &&
        previousValues[i] !== currentValues[i]
      ) {
        hasChanged = true;
        // This is to prevent the form from triggering validation too many times
        break;
      }
    }
    // If changes detected and we haven't triggered yet, run trigger
    if (hasChanged && hasBeenSubmitted) {
      // We need to debounce the validation trigger so that tests don't freeze
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
      triggerTimeoutRef.current = setTimeout(() => {
        trigger();
      }, 50);
    }

    prevValuesRef.current = [...currentValues];

    return () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
    };
  }, [watchedValues, trigger, formState.isSubmitted, formState.submitCount]);

  const ToggleComponent =
    formComponents?.fieldsetToggle || FieldsetToggleButtonDefault;
  const contentId = `${name}-content`;
  const headerId = `${name}-header`;

  return (
    <fieldset
      className={cn(
        'border-1 border-input p-4 rounded-xl',
        `RemoteFlows__FieldSetField`,
        `RemoteFlows__FieldSetField__${name}`,
      )}
    >
      <legend
        className={cn(
          'text-sm font-semibold px-2',
          variant === 'inset' && 'hidden',
        )}
      >
        {label}
      </legend>
      {helpCenter?.callToAction && helpCenter?.id && variant === 'outset' && (
        <ZendeskTriggerButton
          className='RemoteFlows__FieldSetField__HelpCenterLink mb-3'
          zendeskId={helpCenter.id}
        >
          {helpCenter.callToAction}
        </ZendeskTriggerButton>
      )}
      {variant === 'inset' && (
        <>
          <div
            className='RemoteFlows__FieldSetField__Header'
            id={headerId}
            data-state={isExpanded ? 'expanded' : 'collapsed'}
            aria-expanded={isExpanded}
          >
            <h3 className={cn('RemoteFlows__FieldSetField__Title')}>{label}</h3>
            {features?.toggle?.enabled && (
              <ToggleComponent
                isExpanded={isExpanded}
                onToggle={toggleExpanded}
                aria-expanded={isExpanded}
                aria-controls={contentId}
                aria-label={`${isExpanded ? 'Hide' : 'Show'} ${label}`}
                className={cn(
                  'RemoteFlows__FieldSetField__Toggle',
                  features.toggle?.className,
                )}
              >
                {isExpanded
                  ? (features.toggle.labels?.collapse ?? 'Remove')
                  : (features.toggle.labels?.expand ?? 'Define')}
              </ToggleComponent>
            )}
          </div>
          {helpCenter?.callToAction && helpCenter?.id && (
            <ZendeskTriggerButton
              className='RemoteFlows__FieldSetField__HelpCenterLink mb-3'
              zendeskId={helpCenter.id}
            >
              {helpCenter.callToAction}
            </ZendeskTriggerButton>
          )}
        </>
      )}
      {isExpanded && (
        <div id={contentId} aria-labelledby={headerId} role='region'>
          {description ? (
            <BaseFormDescription
              as='div'
              className='mb-5 RemoteFlows__FieldSetField__Description'
            >
              {description}
            </BaseFormDescription>
          ) : null}
          <div className='grid gap-4'>
            {fields.map((field: $TSFixMe) => {
              if (field.calculateDynamicProperties) {
                field = {
                  ...field,
                  ...(field.calculateDynamicProperties(watchedValues, field) ||
                    {}),
                };
              }

              if (field.isVisible === false || field.deprecated) {
                return null; // Skip hidden or deprecated fields
              }

              const fieldType = field.type;
              const fieldKey = `${isFlatFieldset ? field.name : `${name}.${field.name}`}`;

              const isForcedValue = checkFieldHasForcedValue(field);

              // Helper function to wrap content with WrapperComponent if present
              const wrapWithCustomWrapper = (
                content: React.ReactNode,
                key: string,
              ) => {
                if (field.WrapperComponent) {
                  return (
                    <field.WrapperComponent key={key}>
                      {content}
                    </field.WrapperComponent>
                  );
                }
                return <Fragment key={key}>{content}</Fragment>;
              };

              if (isForcedValue) {
                const fieldProps = omit(field, 'WrapperComponent');
                return wrapWithCustomWrapper(
                  <ForcedValueField
                    name={fieldKey}
                    description={fieldProps.description}
                    value={fieldProps.const}
                    statement={fieldProps.statement}
                    label={fieldProps.label}
                    helpCenter={fieldProps.meta?.helpCenter}
                  />,
                  fieldKey,
                );
              }

              // Handle nested fieldsets
              if (fieldType === 'fieldset') {
                const fieldProps = omit(field, 'WrapperComponent');
                return wrapWithCustomWrapper(
                  <FieldSetField
                    {...(fieldProps as $TSFixMe)}
                    name={fieldKey}
                    components={components}
                  />,
                  fieldKey,
                );
              }

              if (fieldType === 'fieldset-flat') {
                const fieldProps = omit(field, 'WrapperComponent');
                return wrapWithCustomWrapper(
                  <FieldSetField
                    {...(fieldProps as $TSFixMe)}
                    name={fieldKey}
                    components={components}
                    isFlatFieldset
                  />,
                  fieldKey,
                );
              }
              // We need to do the check after checking (field.type || field.inputType) === 'fieldset' or (field.type || field.inputType) === 'fieldset-flat'
              // circular dependency most likely
              let FieldComponent = baseFields[fieldType as BaseTypes];

              if (field.Component) {
                const { Component } = field as {
                  Component: React.ComponentType<$TSFixMe>;
                };
                const fieldProps = omit(field, 'WrapperComponent');
                return wrapWithCustomWrapper(
                  <>
                    <Component
                      {...fieldProps}
                      value={watch(fieldKey) as string}
                      setValue={(value: unknown) => {
                        setValue(fieldKey, value);
                      }}
                    />
                    {field.statement ? (
                      <Statement
                        {...(field.statement as StatementComponentProps['data'])}
                      />
                    ) : null}
                    {field.extra ? field.extra : null}
                  </>,
                  fieldKey,
                );
              }

              if (!FieldComponent) {
                return (
                  <p className='error'>Field type {fieldType} not supported</p>
                );
              }

              if (fieldType === 'select' && field.multiple) {
                FieldComponent = baseFields['multi-select'];
              }

              const fieldProps = omit(field, 'WrapperComponent');
              return wrapWithCustomWrapper(
                <>
                  <FieldComponent
                    {...fieldProps}
                    name={fieldKey}
                    component={components?.[fieldType as keyof Components]}
                  />
                  {field.statement ? (
                    <Statement
                      {...(field.statement as StatementComponentProps['data'])}
                    />
                  ) : null}
                  {field.extra ? field.extra : null}
                </>,
                fieldKey,
              );
            })}
            {extra ? extra : null}
            {statement ? <Statement {...statement} /> : null}
          </div>
        </div>
      )}
    </fieldset>
  );
}
