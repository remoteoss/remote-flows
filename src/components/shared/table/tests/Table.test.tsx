import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Table, ColumnDef } from '@/src/components/shared/table/Table';
import * as FormFieldsContext from '@/src/context';
import { $TSFixMe } from '@/src/types/remoteFlows';

// Mock the context
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(() => ({
    components: {},
  })),
}));

describe('Table Component', () => {
  it('should render table with headers and data', () => {
    type TestData = {
      id: string;
      name: string;
      status: string;
    };

    const columns: ColumnDef<TestData>[] = [
      { id: 'name', label: 'Name' },
      { id: 'status', label: 'Status' },
    ];

    const data: TestData[] = [
      { id: '1', name: 'John', status: 'Active' },
      { id: '2', name: 'Jane', status: 'Inactive' },
    ];

    render(<Table columns={columns} data={data} />);

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check data
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getAllByText('Active')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Inactive')[0]).toBeInTheDocument();
  });

  it('should apply className to table', () => {
    type TestData = { id: string; name: string };

    const columns: ColumnDef<TestData>[] = [{ id: 'name', label: 'Name' }];

    const { container } = render(
      <Table columns={columns} data={[]} className='custom-table-class' />,
    );

    const table = container.querySelector(
      '.RemoteFlows__Table.custom-table-class',
    );
    expect(table).toBeInTheDocument();
  });

  it('should apply column className to header and cell', () => {
    type TestData = { id: string; name: string };

    const columns: ColumnDef<TestData>[] = [
      { id: 'name', label: 'Name', className: 'w-[250px]' },
    ];

    const data: TestData[] = [{ id: '1', name: 'John' }];

    const { container } = render(<Table columns={columns} data={data} />);

    const header = container.querySelector('th.w-\\[250px\\]');
    const cell = container.querySelector('td.w-\\[250px\\]');

    expect(header).toBeInTheDocument();
    expect(cell).toBeInTheDocument();
  });

  it('should apply cellClassName to cells only', () => {
    type TestData = { id: string; name: string };

    const columns: ColumnDef<TestData>[] = [
      { id: 'name', label: 'Name', cellClassName: 'cell-class' },
    ];

    const data: TestData[] = [{ id: '1', name: 'John' }];

    const { container } = render(<Table columns={columns} data={data} />);

    const header = container.querySelector('th.cell-class');
    const cell = container.querySelector('td.cell-class');

    expect(header).not.toBeInTheDocument();
    expect(cell).toBeInTheDocument();
  });

  it('should render custom content using render function', () => {
    type TestData = { id: string; count: number };

    const columns: ColumnDef<TestData>[] = [
      {
        id: 'count',
        label: 'Count',
        render: (value) => `Total: ${value}`,
      },
    ];

    const data: TestData[] = [{ id: '1', count: 5 }];

    render(<Table columns={columns} data={data} />);

    expect(screen.getByText('Total: 5')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    type TestData = { id: string; name: string };

    const columns: ColumnDef<TestData>[] = [{ id: 'name', label: 'Name' }];

    const { container } = render(<Table columns={columns} data={[]} />);

    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(0);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should render render function with row context', () => {
    type TestData = { id: string; name: string; status: string };

    const renderFn = vi.fn((value, row) => `${row.status}: ${value}`);

    const columns: ColumnDef<TestData>[] = [
      {
        id: 'name',
        label: 'Name',
        render: renderFn,
      },
    ];

    const data: TestData[] = [{ id: '1', name: 'John', status: 'Active' }];

    render(<Table columns={columns} data={data} />);

    expect(renderFn).toHaveBeenCalledWith(
      'John',
      expect.objectContaining({
        id: '1',
        name: 'John',
        status: 'Active',
      }),
      0,
    );

    expect(screen.getByText('Active: John')).toBeInTheDocument();
  });

  describe('Custom Table Component', () => {
    it('should render custom table component when provided', () => {
      type TestData = { id: string; name: string };

      const columns: ColumnDef<TestData>[] = [{ id: 'name', label: 'Name' }];

      const data: TestData[] = [{ id: '1', name: 'John' }];

      const CustomTable = vi.fn(() => (
        <div data-testid='custom-table'>Custom</div>
      ));

      vi.mocked(FormFieldsContext.useFormFields).mockReturnValue({
        components: { table: CustomTable },
      } as $TSFixMe);

      render(<Table columns={columns} data={data} />);

      expect(screen.getByTestId('custom-table')).toBeInTheDocument();
      expect(CustomTable).toHaveBeenCalledWith(
        expect.objectContaining({
          data,
          columns,
          className: '',
        }),
        expect.anything(),
      );
    });
  });
});
