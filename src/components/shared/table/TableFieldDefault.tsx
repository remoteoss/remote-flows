import {
  Table as TablePrimitive,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { cn } from '@/src/lib/utils';
import { $TSFixMe, TableComponentProps } from '@/src/types/remoteFlows';

export const TableFieldDefault = ({
  data,
  columns,
  className,
  ref,
}: TableComponentProps) => {
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
};

function getRowKey(row: $TSFixMe, index: number): string {
  return String(row.id ?? index);
}
