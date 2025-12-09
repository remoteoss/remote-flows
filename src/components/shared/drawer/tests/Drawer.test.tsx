import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from '@/src/components/shared/drawer/Drawer';
import { FormFieldsContext } from '@/src/context';
import { ReactNode } from 'react';

const mockComponents = { components: {} };

const FormFieldsProvider = ({ children }: { children: ReactNode }) => (
  <FormFieldsContext.Provider value={mockComponents}>
    {children}
  </FormFieldsContext.Provider>
);

describe('Drawer', () => {
  it('should render trigger button', () => {
    render(
      <FormFieldsProvider>
        <Drawer
          open={false}
          onOpenChange={() => {}}
          title='Test Drawer'
          trigger={<button>Open Drawer</button>}
        >
          Content
        </Drawer>
      </FormFieldsProvider>,
    );

    expect(screen.getByText('Open Drawer')).toBeInTheDocument();
  });

  it('should render title when open', () => {
    render(
      <FormFieldsProvider>
        <Drawer
          open={true}
          onOpenChange={() => {}}
          title='Test Drawer Title'
          trigger={<button>Open</button>}
        >
          Content
        </Drawer>
      </FormFieldsProvider>,
    );

    expect(screen.getByText('Test Drawer Title')).toBeInTheDocument();
  });

  it('should render children when open', () => {
    render(
      <FormFieldsProvider>
        <Drawer
          open={true}
          onOpenChange={() => {}}
          title='Test Drawer'
          trigger={<button>Open</button>}
        >
          <div>Drawer Content</div>
        </Drawer>
      </FormFieldsProvider>,
    );

    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('should call onOpenChange when drawer state changes', async () => {
    const mockOnOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FormFieldsProvider>
        <Drawer
          open={false}
          onOpenChange={mockOnOpenChange}
          title='Test Drawer'
          trigger={<button>Open</button>}
        >
          Content
        </Drawer>
      </FormFieldsProvider>,
    );

    // Trigger is rendered as part of Drawer, closing would call onOpenChange
    const trigger = screen.getByText('Open');
    await user.click(trigger);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalled();
    });
  });

  it('should use custom drawer component from components prop', () => {
    const CustomDrawer = vi.fn(() => <div>Custom Drawer</div>);
    const customComponents = { components: { drawer: CustomDrawer } };

    render(
      <FormFieldsContext.Provider value={customComponents}>
        <Drawer
          open={true}
          onOpenChange={() => {}}
          title='Test Drawer'
          trigger={<button>Open</button>}
        >
          Content
        </Drawer>
      </FormFieldsContext.Provider>,
    );

    expect(screen.getByText('Custom Drawer')).toBeInTheDocument();
    expect(CustomDrawer).toHaveBeenCalledWith(
      {
        open: true,
        onOpenChange: expect.any(Function),
        title: 'Test Drawer',
        trigger: expect.any(Object),
        children: 'Content',
        direction: 'right',
        className: '',
      },
      expect.any(Object),
    );
  });
});
