import { forwardRef } from 'react';
import { useFormFields } from '@/src/context';
import { $TSFixMe } from '@/src/types/remoteFlows';

export type ColumnDef<T = $TSFixMe> = {
  id: keyof T;
  label: React.ReactNode;
  className?: string;
  cellClassName?: string;
  render?: (value: $TSFixMe, row: T, index: number) => React.ReactNode;
};

export type TableDataProps<T = $TSFixMe> = {
  data: T[] | undefined;
  columns: ColumnDef<T>[];
  className?: string;
};

export type TableComponentProps<T = $TSFixMe> = TableDataProps<T>;

export const Table = forwardRef<HTMLTableElement, TableDataProps<$TSFixMe>>(
  ({ data = [], columns, className = '' }, ref) => {
    const { components } = useFormFields();

    // Pass the same structured data to custom components
    return (
      <components.table
        ref={ref}
        data={data}
        columns={columns}
        className={className}
      />
    );
  },
);

Table.displayName = 'Table';
