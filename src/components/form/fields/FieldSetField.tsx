/* eslint-disable @typescript-eslint/no-explicit-any */
import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { cn } from '@/src/lib/utils';
import { SupportedTypes } from './types';
import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { Statement, StatementProps } from '@/src/components/form/Statement';
import { useFormContext } from 'react-hook-form';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useFormFields } from '@/src/context';
import { Button } from '@/src/components/ui/button';

type FieldBase = {
  label: string;
  name: string;
  description: string;
  Component?: React.ComponentType<any>;
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
  statement?: StatementProps;
  isFlatFieldset: boolean;
  extra?: React.ReactNode;
  variant: 'outset' | 'inset';
};

const DefaultToggleButton = ({
  onClick,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button
    className={cn(
      'RemoteFlows__Button RemoteFlows__FieldSetField__ToggleButton',
      className,
    )}
    variant='default'
    onClick={onClick}
    {...props}
  >
    {children}
  </Button>
);

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
}: FieldSetProps) {
  const [isExpanded, setIsExpanded] = useState(
    features?.toggle?.defaultExpanded ?? true,
  );
  const { components: formComponents } = useFormFields();
  const { watch, trigger, formState } = useFormContext();
  const fieldNames = fields.map(
    ({ name: fieldName }) => `${name}.${fieldName}`,
  );
  const watchedValues = watch(fieldNames);
  const prevValuesRef = useRef<string[]>(watchedValues);
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const ToggleButton = formComponents?.button || DefaultToggleButton;
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
      {variant === 'inset' && (
        <div
          className='RemoteFlows__FieldSetField__Header'
          id={headerId}
          data-state={isExpanded ? 'expanded' : 'collapsed'}
          aria-expanded={isExpanded}
        >
          <h3 className={cn('RemoteFlows__FieldSetField__Title')}>{label}</h3>
          {features?.toggle?.enabled && (
            <ToggleButton
              aria-expanded={isExpanded}
              aria-controls={contentId}
              aria-label={`${isExpanded ? 'Hide' : 'Show'} ${label}`}
              type='button'
              className={cn(
                'RemoteFlows__Button RemoteFlows__FieldSetField__ToggleButton',
                features.toggle?.className,
              )}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded
                ? (features.toggle.labels?.collapse ?? 'Remove')
                : (features.toggle.labels?.expand ?? 'Define')}
            </ToggleButton>
          )}
        </div>
      )}
      {isExpanded && (
        <div
          id={contentId}
          aria-labelledby={headerId}
          role='region'
          className={cn(!isExpanded && 'hidden')}
        >
          {description ? (
            <div
              className='mb-5 RemoteFlows__FieldSetField__Description'
              dangerouslySetInnerHTML={{ __html: description }}
            />
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
              let FieldComponent = fieldsMap[field.type as SupportedTypes];

              if (field.isVisible === false || field.deprecated) {
                return null; // Skip hidden or deprecated fields
              }

              if (field.Component) {
                const { Component } = field as {
                  Component: React.ComponentType<any>;
                };
                return <Component key={field.name} {...field} />;
              }

              if (field.type === 'select' && field.multiple) {
                FieldComponent = fieldsMap['multi-select'];
              }

              return (
                <Fragment
                  key={`${isFlatFieldset ? field.name : `${name}.${field.name}`}`}
                >
                  <FieldComponent
                    {...field}
                    name={`${isFlatFieldset ? field.name : `${name}.${field.name}`}`}
                    component={components?.[field.type as SupportedTypes]}
                  />
                  {field.extra ? field.extra : null}
                </Fragment>
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
