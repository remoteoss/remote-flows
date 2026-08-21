import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/src/tests/server';
import { ZendeskTriggerButton } from '../ZendeskTriggerButton';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import type { ZendeskTriggerButtonComponentProps } from '@/src/types/remoteFlows';

describe('ZendeskTriggerButton', () => {
  const mockArticle = {
    help_center_article: {
      title: 'Test Article',
      body: '<p>Test content</p>',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    server.use(
      http.get('*/v1/help-center-articles/*', () => {
        return HttpResponse.json({ data: mockArticle });
      }),
    );
  });

  describe('when external is false (default)', () => {
    it('renders as a button', () => {
      render(
        <ZendeskTriggerButton zendeskId={123456}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper: TestProviders },
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
        { wrapper: TestProviders },
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
        { wrapper: TestProviders },
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
        { wrapper: TestProviders },
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
        { wrapper: TestProviders },
      );

      const link = screen.getByRole('link', { name: 'Open Article' });
      expect(link).toBeInTheDocument();
    });

    it('has correct href attribute', () => {
      render(
        <ZendeskTriggerButton zendeskId={123456} external={true}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper: TestProviders },
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
        { wrapper: TestProviders },
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
        { wrapper: TestProviders },
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
        { wrapper: TestProviders },
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
        { wrapper: TestProviders },
      );

      // Click the link
      await userEvent.click(screen.getByRole('link'));

      // Drawer should not appear (only the link in the document)
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
    });
  });

  describe('with custom trigger button component', () => {
    const CustomTriggerButton = ({
      zendeskId,
      onClick,
      children,
      className,
    }: ZendeskTriggerButtonComponentProps) => {
      return (
        <button
          onClick={() => onClick?.(zendeskId)}
          className={className}
          data-testid='custom-trigger'
        >
          Custom: {children}
        </button>
      );
    };

    const WrapperWithCustomButton = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <TestProviders components={{ zendeskTriggerButton: CustomTriggerButton }}>
        {children}
      </TestProviders>
    );

    it('renders custom trigger button when provided', () => {
      render(
        <ZendeskTriggerButton zendeskId={123456}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper: WrapperWithCustomButton },
      );

      const customButton = screen.getByTestId('custom-trigger');
      expect(customButton).toBeInTheDocument();
      expect(customButton).toHaveTextContent('Custom: Open Article');
    });

    it('calls onClick when custom trigger button is clicked', async () => {
      const onClick = vi.fn();

      render(
        <ZendeskTriggerButton zendeskId={123456} onClick={onClick}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper: WrapperWithCustomButton },
      );

      await userEvent.click(screen.getByTestId('custom-trigger'));
      expect(onClick).toHaveBeenCalledWith(123456);
    });

    it('opens drawer when custom trigger button is clicked and external is false', async () => {
      render(
        <ZendeskTriggerButton zendeskId={123456}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper: WrapperWithCustomButton },
      );

      await userEvent.click(screen.getByTestId('custom-trigger'));

      // Wait for drawer to load and display content
      const title = await screen.findByText('Test Article');
      expect(title).toBeInTheDocument();
    });

    it('does not open drawer when custom trigger button is clicked and external is true', async () => {
      render(
        <ZendeskTriggerButton zendeskId={123456} external={true}>
          Open Article
        </ZendeskTriggerButton>,
        { wrapper: WrapperWithCustomButton },
      );

      await userEvent.click(screen.getByTestId('custom-trigger'));

      // Drawer should not appear
      const title = screen.queryByText('Test Article');
      expect(title).not.toBeInTheDocument();
    });

    it('passes className to custom trigger button', () => {
      render(
        <ZendeskTriggerButton
          zendeskId={123456}
          className='custom-class-from-parent'
        >
          Open Article
        </ZendeskTriggerButton>,
        { wrapper: WrapperWithCustomButton },
      );

      const customButton = screen.getByTestId('custom-trigger');
      expect(customButton).toHaveClass('custom-class-from-parent');
    });
  });
});
