import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { server } from '@/src/tests/server';
import { ZendeskTriggerButton } from '../ZendeskTriggerButton';

describe('ZendeskTriggerButton', () => {
  let queryClient: QueryClient;

  const mockArticle = {
    help_center_article: {
      title: 'Test Article',
      body: '<p>Test content</p>',
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.clearAllMocks();

    server.use(
      http.get('*/v1/help-center-articles/*', () => {
        return HttpResponse.json({ data: mockArticle });
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
    </QueryClientProvider>
  );

  describe('when external is false (default)', () => {
    it('renders as a button', () => {
      render(
        <ZendeskTriggerButton zendeskId={123456}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: 'Open Article' });
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('opens drawer on click', async () => {
      render(
        <ZendeskTriggerButton zendeskId={123456}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: 'Open Article' });
      await userEvent.click(button);

      // Wait for drawer to load and display content
      const title = await screen.findByText('Test Article');
      expect(title).toBeInTheDocument();
    });

    it('calls onClick callback when clicked', async () => {
      const onClick = vi.fn();

      render(
        <ZendeskTriggerButton zendeskId={123456} onClick={onClick}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Open Article' }),
      );
      expect(onClick).toHaveBeenCalledWith(123456);
    });

    it('applies custom className', () => {
      render(
        <ZendeskTriggerButton zendeskId={123456} className='custom-class'>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: 'Open Article' });
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('RemoteFlows__ZendeskTriggerButton');
    });
  });

  describe('when external is true', () => {
    it('renders as an anchor tag', () => {
      render(
        <ZendeskTriggerButton zendeskId={123456} external={true}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      const link = screen.getByRole('link', { name: 'Open Article' });
      expect(link).toBeInTheDocument();
    });

    it('has correct href attribute', () => {
      render(
        <ZendeskTriggerButton zendeskId={123456} external={true}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      const link = screen.getByRole('link', { name: 'Open Article' });
      expect(link).toHaveAttribute(
        'href',
        'https://support.remote.com/hc/en-us/articles/123456',
      );
    });

    it('opens link in new tab', () => {
      render(
        <ZendeskTriggerButton zendeskId={123456} external={true}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      const link = screen.getByRole('link', { name: 'Open Article' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('calls onClick callback when clicked', async () => {
      const onClick = vi.fn();

      render(
        <ZendeskTriggerButton
          zendeskId={123456}
          external={true}
          onClick={onClick}
        >
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      await userEvent.click(screen.getByRole('link', { name: 'Open Article' }));
      expect(onClick).toHaveBeenCalledWith(123456);
    });

    it('applies custom className', () => {
      render(
        <ZendeskTriggerButton
          zendeskId={123456}
          external={true}
          className='custom-class'
        >
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      const link = screen.getByRole('link', { name: 'Open Article' });
      expect(link).toHaveClass('custom-class');
      expect(link).toHaveClass('RemoteFlows__ZendeskTriggerButton');
    });

    it('does not open drawer when external is true', async () => {
      render(
        <ZendeskTriggerButton zendeskId={123456} external={true}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper },
      );

      // Click the link
      await userEvent.click(screen.getByRole('link'));

      // Drawer should not appear (only the link in the document)
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
    });
  });
});
