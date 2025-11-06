import { useFormFields } from '@/src/context';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  Table as TablePrimitive,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { cn } from '@/src/lib/utils';
import React from 'react';

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

export const Table = React.forwardRef<
  HTMLTableElement,
  TableDataProps<$TSFixMe>
>(({ data = [], columns, className = '' }, ref) => {
  const { components } = useFormFields();
  const CustomTable = components?.table as
    | React.ComponentType<TableDataProps<$TSFixMe>>
    | undefined;

  // Pass the same structured data to custom components
  if (CustomTable) {
    return <CustomTable data={data} columns={columns} className={className} />;
  }

  return (
    <TablePrimitive ref={ref} className={cn('RemoteFlows__Table', className)}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={String(column.id)}
              className={cn('RemoteFlows__TableHead', column.className)}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((row, rowIndex) => (
          <TableRow key={getRowKey(row, rowIndex)}>
            {columns.map((column) => (
              <TableCell
                key={String(column.id)}
                className={cn(
                  'RemoteFlows__TableCell',
                  column.className,
                  column.cellClassName,
                )}
              >
                {column.render
                  ? column.render(
                      row[column.id as keyof typeof row],
                      row,
                      rowIndex,
                    )
                  : row[column.id as keyof typeof row]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TablePrimitive>
  );
});

Table.displayName = 'Table';

function getRowKey(row: $TSFixMe, index: number): string {
  return String(row.id ?? index);
}
