import { ZendeskTriggerButtonDefault } from '@/src/components/shared/zendesk-drawer/default/ZendeskTriggerButtonDefault';
import { Drawer, DrawerTrigger } from '@/src/components/ui/drawer';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

describe('ZendeskTriggerButtonDefault', () => {
  it('forwards its ref to the button element', () => {
    const ref = createRef<HTMLElement>();

    render(
      <ZendeskTriggerButtonDefault ref={ref} zendeskId={1}>
        Help
      </ZendeskTriggerButtonDefault>,
    );

    expect(ref.current).toBe(screen.getByRole('button', { name: 'Help' }));
  });

  it('forwards its ref to the link element when external', () => {
    const ref = createRef<HTMLElement>();

    render(
      <ZendeskTriggerButtonDefault ref={ref} zendeskId={1} external>
        Help
      </ZendeskTriggerButtonDefault>,
    );

    expect(ref.current).toBe(screen.getByRole('link', { name: 'Help' }));
  });

  it('can be used as an asChild drawer trigger without a ref warning', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(
      <Drawer>
        <DrawerTrigger asChild>
          <ZendeskTriggerButtonDefault zendeskId={1}>
            Help
          </ZendeskTriggerButtonDefault>
        </DrawerTrigger>
      </Drawer>,
    );

    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('Function components cannot be given refs'),
      expect.anything(),
      expect.anything(),
    );
    consoleError.mockRestore();
  });
});
