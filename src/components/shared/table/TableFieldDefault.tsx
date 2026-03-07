import { forwardRef } from 'react';
import { TableComponentProps } from '@/src/types/remoteFlows';
import { $TSFixMe } from '@/src/types/remoteFlows';

export const TableFieldDefault = forwardRef<
  HTMLTableElement,
  TableComponentProps<$TSFixMe>
>(({ data = [], columns, className = '' }, ref) => (
  <table ref={ref} className={`RemoteFlows__Table ${className}`.trim()}>
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={String(col.id)} className={col.className}>
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, rowIndex) => (
        <tr key={rowIndex}>
          {columns.map((col) => (
            <td
              key={String(col.id)}
              className={[col.className, col.cellClassName]
                .filter(Boolean)
                .join(' ')}
            >
              {col.render
                ? col.render(row[col.id], row, rowIndex)
                : row[col.id]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
));

TableFieldDefault.displayName = 'TableFieldDefault';
