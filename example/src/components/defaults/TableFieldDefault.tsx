import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import { cn } from '@remoteoss/remote-flows/internals';
import { TableComponentProps } from '@remoteoss/remote-flows';

export const TableFieldDefault = ({
  data,
  columns,
  className,
  ref,
}: TableComponentProps) => {
  return (
    <Table ref={ref} className={cn('RemoteFlows__Table', className)}>
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
          <TableRow key={String(row.id ?? rowIndex)}>
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
    </Table>
  );
};
