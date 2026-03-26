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
}: {
  children: React.ReactNode;
  diffType: 'added' | 'removed' | 'modified' | 'unchanged';
  fieldName: string;
}) => {
  const styles = getDiffStyles(diffType);

  if (diffType === 'unchanged') {
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

  return (
    <div className={`p-3 mb-2 rounded ${styles} relative`}>
      <div className='absolute top-2 right-2'>{badges[diffType]}</div>
      {children}
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
    { diffType: 'added' | 'removed' | 'modified' | 'unchanged' }
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

      return {
        ...field,
        WrapperComponent: ({ children }: { children: React.ReactNode }) => (
          <FieldWrapper diffType={diffType} fieldName={field.name}>
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
    diff.modified.length === 0;

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
