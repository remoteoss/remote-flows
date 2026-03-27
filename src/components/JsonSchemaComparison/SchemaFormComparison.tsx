import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import type { JSFField, JSFFieldset } from '@/src/types/remoteFlows';
import { compareFormFields, getDiffStyles } from './formDiffDetector';
import { useMemo, useRef, useEffect } from 'react';

interface SchemaFormComparisonProps {
  topVersion: string | number;
  bottomVersion: string | number;
  topFields: JSFField[];
  bottomFields: JSFField[];
  topFieldsets?: JSFFieldset | null;
  bottomFieldsets?: JSFFieldset | null;
  isLoading?: boolean;
}

const FieldWrapper = ({
  children,
  diffType,
  orderChanged,
  changes,
}: {
  children: React.ReactNode;
  diffType: 'added' | 'removed' | 'modified' | 'unchanged';
  fieldName: string;
  orderChanged?: { oldIndex: number; newIndex: number };
  changes?: {
    label?: { old: string; new: string };
    required?: { old: boolean; new: boolean };
    type?: { old: string; new: string };
    inputType?: { old: string; new: string };
    jsonType?: { old: string; new: string };
    defaultValue?: { old: unknown; new: unknown };
    minDate?: { old: string; new: string };
    maxDate?: { old: string; new: string };
    maxLength?: { old: number; new: number };
    multiple?: { old: boolean; new: boolean };
    isVisible?: { old: boolean; new: boolean };
    options?: {
      added: Array<{ value: string; label: string }>;
      removed: Array<{ value: string; label: string }>;
      modified: Array<{
        value: string;
        changes: { label?: { old: string; new: string } };
      }>;
    };
    nestedFields?: unknown[];
  };
}) => {
  const styles = getDiffStyles(diffType, !!orderChanged);

  if (diffType === 'unchanged' && !orderChanged) {
    return <div>{children}</div>;
  }

  const badges = {
    added: (
      <span className='text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded'>
        NEW
      </span>
    ),
    removed: (
      <span className='text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded'>
        REMOVED
      </span>
    ),
    modified: (
      <span className='text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded'>
        MODIFIED
      </span>
    ),
  };

  const reorderedBadge = orderChanged && diffType === 'unchanged' && (
    <span className='text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded'>
      MOVED
    </span>
  );

  const badge =
    reorderedBadge || (diffType !== 'unchanged' && badges[diffType]);

  const renderChanges = () => {
    if (!changes || diffType !== 'modified') return null;

    const changesList: React.ReactNode[] = [];

    if (changes.label) {
      changesList.push(
        <div key='label' className='text-xs'>
          <span className='font-semibold'>Label:</span>{' '}
          <span className='line-through text-red-600'>{changes.label.old}</span>{' '}
          → <span className='text-green-600'>{changes.label.new}</span>
        </div>,
      );
    }

    if (changes.required) {
      changesList.push(
        <div key='required' className='text-xs'>
          <span className='font-semibold'>Required:</span>{' '}
          <span className='line-through text-red-600'>
            {changes.required.old ? 'Yes' : 'No'}
          </span>{' '}
          →{' '}
          <span className='text-green-600'>
            {changes.required.new ? 'Yes' : 'No'}
          </span>
        </div>,
      );
    }

    if (changes.type) {
      changesList.push(
        <div key='type' className='text-xs'>
          <span className='font-semibold'>Type:</span>{' '}
          <span className='line-through text-red-600'>{changes.type.old}</span>{' '}
          → <span className='text-green-600'>{changes.type.new}</span>
        </div>,
      );
    }

    if (changes.inputType) {
      changesList.push(
        <div key='inputType' className='text-xs'>
          <span className='font-semibold'>Input Type:</span>{' '}
          <span className='line-through text-red-600'>
            {changes.inputType.old}
          </span>{' '}
          → <span className='text-green-600'>{changes.inputType.new}</span>
        </div>,
      );
    }

    if (changes.jsonType) {
      const oldJsonType = Array.isArray(changes.jsonType.old)
        ? changes.jsonType.old.join(' | ')
        : changes.jsonType.old;
      const newJsonType = Array.isArray(changes.jsonType.new)
        ? changes.jsonType.new.join(' | ')
        : changes.jsonType.new;

      changesList.push(
        <div key='jsonType' className='text-xs'>
          <span className='font-semibold'>JSON Type:</span>{' '}
          <span className='line-through text-red-600'>{oldJsonType}</span> →{' '}
          <span className='text-green-600'>{newJsonType}</span>
        </div>,
      );
    }

    if (changes.defaultValue !== undefined) {
      changesList.push(
        <div key='defaultValue' className='text-xs'>
          <span className='font-semibold'>Default Value:</span>{' '}
          <span className='line-through text-red-600'>
            {JSON.stringify(changes.defaultValue.old)}
          </span>{' '}
          →{' '}
          <span className='text-green-600'>
            {JSON.stringify(changes.defaultValue.new)}
          </span>
        </div>,
      );
    }

    if (changes.options) {
      if (changes.options.added.length > 0) {
        changesList.push(
          <div key='options-added' className='text-xs'>
            <span className='font-semibold text-green-700'>Options Added:</span>{' '}
            {changes.options.added.map((opt) => opt.label).join(', ')}
          </div>,
        );
      }
      if (changes.options.removed.length > 0) {
        changesList.push(
          <div key='options-removed' className='text-xs'>
            <span className='font-semibold text-red-700'>Options Removed:</span>{' '}
            {changes.options.removed.map((opt) => opt.label).join(', ')}
          </div>,
        );
      }
      if (changes.options.modified.length > 0) {
        changesList.push(
          <div key='options-modified' className='text-xs'>
            <span className='font-semibold'>Options Modified:</span>{' '}
            {changes.options.modified.length} option(s)
          </div>,
        );
      }
    }

    if (changes.nestedFields && changes.nestedFields.length > 0) {
      changesList.push(
        <div key='nestedFields' className='text-xs'>
          <span className='font-semibold'>Nested Fields:</span>{' '}
          {changes.nestedFields.length} field(s) changed
        </div>,
      );
    }

    if (changesList.length === 0) return null;

    return (
      <div className='mt-2 p-2 bg-yellow-50 rounded border border-yellow-200 space-y-1'>
        <div className='text-xs font-semibold text-yellow-800 mb-1'>
          Changes:
        </div>
        {changesList}
      </div>
    );
  };

  return (
    <div className={`p-3 mb-2 rounded ${styles} relative`}>
      <div className='absolute top-2 right-2'>
        {badge}
        {orderChanged && diffType !== 'unchanged' && (
          <span className='ml-2 text-xs text-gray-600'>(position changed)</span>
        )}
      </div>
      {children}
      {renderChanges()}
    </div>
  );
};

const FormPanel = ({
  version,
  fields,
  fieldsets,
  diffMap,
  title,
  scrollRef,
}: {
  version: string | number;
  fields: JSFField[];
  fieldsets?: JSFFieldset | null;
  diffMap: Map<
    string,
    {
      diffType: 'added' | 'removed' | 'modified' | 'unchanged';
      orderChanged?: { oldIndex: number; newIndex: number };
      changes?: unknown;
    }
  >;
  title: string;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const form = useForm({
    mode: 'onBlur',
  });

  const fieldsWithWrappers = useMemo(() => {
    return fields.map((field) => {
      const diff = diffMap.get(field.name);
      const diffType = diff?.diffType || 'unchanged';
      const orderChanged = diff?.orderChanged;
      const changes = diff?.changes;

      return {
        ...field,
        WrapperComponent: ({ children }: { children: React.ReactNode }) => (
          <FieldWrapper
            diffType={diffType}
            fieldName={field.name}
            orderChanged={orderChanged}
            changes={changes as never}
          >
            {children}
          </FieldWrapper>
        ),
      };
    });
  }, [fields, diffMap]);

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>
          {title} - Version {version}
        </CardTitle>
      </CardHeader>
      <CardContent ref={scrollRef} className='overflow-y-auto max-h-[600px]'>
        <Form {...form}>
          <form className='space-y-4'>
            <JSONSchemaFormFields
              fields={fieldsWithWrappers}
              fieldsets={fieldsets}
              fieldValues={{}}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export const SchemaFormComparison = ({
  topVersion,
  bottomVersion,
  topFields,
  bottomFields,
  topFieldsets,
  bottomFieldsets,
  isLoading,
}: SchemaFormComparisonProps) => {
  const diff = useMemo(
    () => compareFormFields(topFields, bottomFields),
    [topFields, bottomFields],
  );

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  useEffect(() => {
    const leftEl = leftScrollRef.current;
    const rightEl = rightScrollRef.current;

    if (!leftEl || !rightEl) return;

    const handleLeftScroll = () => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      rightEl.scrollTop = leftEl.scrollTop;
      requestAnimationFrame(() => {
        isSyncing.current = false;
      });
    };

    const handleRightScroll = () => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      leftEl.scrollTop = rightEl.scrollTop;
      requestAnimationFrame(() => {
        isSyncing.current = false;
      });
    };

    leftEl.addEventListener('scroll', handleLeftScroll);
    rightEl.addEventListener('scroll', handleRightScroll);

    return () => {
      leftEl.removeEventListener('scroll', handleLeftScroll);
      rightEl.removeEventListener('scroll', handleRightScroll);
    };
  }, [topFields, bottomFields]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading schemas...</p>
        </div>
      </div>
    );
  }

  const hasNoDifferences =
    diff.added.length === 0 &&
    diff.removed.length === 0 &&
    diff.modified.length === 0 &&
    diff.reordered.length === 0;

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='pt-6'>
          {hasNoDifferences ? (
            <p className='text-center text-gray-600'>
              No differences detected between the two versions
            </p>
          ) : (
            <div className='flex gap-6 justify-center'>
              {diff.added.length > 0 && (
                <div className='flex items-center gap-2'>
                  <span className='w-4 h-4 bg-green-500 rounded'></span>
                  <span className='text-sm'>
                    {diff.added.length} field{diff.added.length > 1 ? 's' : ''}{' '}
                    added
                  </span>
                </div>
              )}
              {diff.removed.length > 0 && (
                <div className='flex items-center gap-2'>
                  <span className='w-4 h-4 bg-red-500 rounded'></span>
                  <span className='text-sm'>
                    {diff.removed.length} field
                    {diff.removed.length > 1 ? 's' : ''} removed
                  </span>
                </div>
              )}
              {diff.modified.length > 0 && (
                <div className='flex items-center gap-2'>
                  <span className='w-4 h-4 bg-yellow-500 rounded'></span>
                  <span className='text-sm'>
                    {diff.modified.length} field
                    {diff.modified.length > 1 ? 's' : ''} modified
                  </span>
                </div>
              )}
              {diff.reordered.length > 0 && (
                <div className='flex items-center gap-2'>
                  <span className='w-4 h-4 bg-blue-500 rounded'></span>
                  <span className='text-sm'>
                    {diff.reordered.length} field
                    {diff.reordered.length > 1 ? 's' : ''} reordered
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className='grid grid-cols-2 gap-6'>
        <FormPanel
          version={topVersion}
          fields={topFields}
          fieldsets={topFieldsets}
          diffMap={diff.fieldDiffs}
          title='Left'
          scrollRef={leftScrollRef}
        />
        <FormPanel
          version={bottomVersion}
          fields={bottomFields}
          fieldsets={bottomFieldsets}
          diffMap={diff.fieldDiffs}
          title='Right'
          scrollRef={rightScrollRef}
        />
      </div>
    </div>
  );
};
