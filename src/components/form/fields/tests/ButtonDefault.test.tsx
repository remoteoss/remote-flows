import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';
import { DrawerTrigger, Drawer } from '@/src/components/ui/drawer';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

describe('ButtonDefault', () => {
  it('forwards its ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();

    render(<ButtonDefault ref={ref}>Save</ButtonDefault>);

    expect(ref.current).toBe(screen.getByRole('button', { name: 'Save' }));
  });

  it('forwards its ref to the button element for the inline variant', () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <ButtonDefault ref={ref} data-type='inline'>
        Learn more
      </ButtonDefault>,
    );

    expect(ref.current).toBe(
      screen.getByRole('button', { name: 'Learn more' }),
    );
  });

  it('can be used as an asChild drawer trigger without a ref warning', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(
      <Drawer>
        <DrawerTrigger asChild>
          <ButtonDefault>Open</ButtonDefault>
        </DrawerTrigger>
      </Drawer>,
    );

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('Function components cannot be given refs'),
      expect.anything(),
      expect.anything(),
    );
    consoleError.mockRestore();
  });
});
