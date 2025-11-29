import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { render, screen, waitFor } from '@testing-library/react';
import { ZendeskDrawer } from '../ZendeskDrawer';
import userEvent from '@testing-library/user-event';
import { TestProviders, queryClient } from '@/src/tests/testHelpers';
import { defaultComponents as defaultRemoteFlowsComponents } from '@/src/default-components';

describe('ZendeskDrawer', () => {
  const mockArticle = {
    help_center_article: {
      title: 'Test Article',
      body: '<p>Test content</p>',
    },
  };

  const defaultProps = {
    Trigger: <button>Open Drawer</button>,
    zendeskId: 123456,
    open: false,
    onClose: vi.fn(),
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

  it('renders trigger element correctly', () => {
    render(<ZendeskDrawer {...defaultProps} />, { wrapper: TestProviders });
    expect(
      screen.getByRole('button', { name: 'Open Drawer' }),
    ).toBeInTheDocument();
  });

  it('calls onClose when drawer is closed', async () => {
    const onClose = vi.fn();
    render(<ZendeskDrawer {...defaultProps} open={true} onClose={onClose} />, {
      wrapper: TestProviders,
    });

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('displays loading state', async () => {
    // Simulate loading by delaying the response
    server.use(
      http.get('*/v1/help-center-articles/*', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ data: mockArticle });
      }),
    );

    render(<ZendeskDrawer {...defaultProps} open={true} />, {
      wrapper: TestProviders,
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', async () => {
    server.use(
      http.get('*/v1/help-center-articles/*', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(<ZendeskDrawer {...defaultProps} open={true} />, {
      wrapper: TestProviders,
    });

    // Wait for the error message to appear
    const errorMessage = await screen.findByText('Error loading article');
    expect(errorMessage).toBeInTheDocument();
  });

  it('displays article content when loaded', async () => {
    const mockArticle = {
      help_center_article: {
        title: 'Test Article',
        body: '<p>Test content</p>',
      },
    };

    server.use(
      http.get('*/v1/help-center-articles/*', () => {
        return HttpResponse.json({ data: mockArticle });
      }),
    );

    render(<ZendeskDrawer {...defaultProps} open={true} />, {
      wrapper: TestProviders,
    });

    // Wait for the content to load
    const title = await screen.findByText('Test Article');
    expect(title).toBeInTheDocument();

    // Check the help article link
    const link = screen.getByRole('link', { name: /help article/i });
    expect(link).toHaveAttribute(
      'href',
      `https://support.remote.com/hc/en-us/articles/${defaultProps.zendeskId}`,
    );
  });

  it('renders custom zendesk dialog component when provided', () => {
    const CustomComponent = vi.fn(() => null);
    const customWrapper = ({ children }: PropsWithChildren) => (
      <TestProviders
        components={{
          ...defaultRemoteFlowsComponents,
          zendeskDrawer: CustomComponent,
        }}
      >
        {children}
      </TestProviders>
    );

    render(<ZendeskDrawer {...defaultProps} />, { wrapper: customWrapper });

    expect(CustomComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        open: defaultProps.open,
        onClose: expect.any(Function),
        zendeskURL: expect.stringContaining(String(defaultProps.zendeskId)),
        Trigger: defaultProps.Trigger,
      }),
      expect.any(Object),
    );
  });

  it('only fetches article data when drawer is open', async () => {
    const fetchSpy = vi.fn();
    server.use(
      http.get('*/v1/help-center-articles/*', async () => {
        fetchSpy();
        return HttpResponse.json({ data: mockArticle });
      }),
    );

    // First render with drawer closed
    const { rerender } = render(
      <ZendeskDrawer {...defaultProps} open={false} />,
      { wrapper: TestProviders },
    );
    expect(fetchSpy).not.toHaveBeenCalled();

    // Rerender with drawer open
    rerender(<ZendeskDrawer {...defaultProps} open={true} />);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('sanitizes HTML content', async () => {
    const unsafeArticle = {
      help_center_article: {
        title: 'Test Article',
        body: '<p>Safe content</p><script>alert("unsafe")</script>',
      },
    };

    server.use(
      http.get('*/v1/help-center-articles/*', () => {
        return HttpResponse.json({ data: unsafeArticle });
      }),
    );

    render(<ZendeskDrawer {...defaultProps} open={true} />, {
      wrapper: TestProviders,
    });

    // Wait for content to load and check sanitization
    const content = await screen.findByText('Safe content');
    const container = content.parentElement;
    expect(container?.innerHTML).not.toContain('<script>');
  });

  describe('ZendeskDrawer with custom component', () => {
    let queryClient: QueryClient;
    let CustomComponent: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });

      CustomComponent = vi.fn(() => null);
    });

    const customWrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>
        <FormFieldsProvider
          components={{
            ...defaultRemoteFlowsComponents,
            zendeskDrawer: CustomComponent,
          }}
        >
          {children}
        </FormFieldsProvider>
      </QueryClientProvider>
    );

    it('passes all required props to custom component', () => {
      render(<ZendeskDrawer {...defaultProps} />, { wrapper: customWrapper });

      expect(CustomComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          open: defaultProps.open,
          onClose: expect.any(Function),
          zendeskURL: expect.stringContaining(String(defaultProps.zendeskId)),
          Trigger: defaultProps.Trigger,
          data: undefined,
          isLoading: false,
          error: null,
        }),
        expect.any(Object),
      );
    });

    it('passes loading state to custom component', () => {
      server.use(
        http.get('*/v1/help-center-articles/*', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ data: mockArticle });
        }),
      );

      render(<ZendeskDrawer {...defaultProps} open={true} />, {
        wrapper: customWrapper,
      });

      expect(CustomComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          isLoading: true,
        }),
        expect.any(Object),
      );
    });

    it('passes error state to custom component', async () => {
      server.use(
        http.get('*/v1/help-center-articles/*', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      render(<ZendeskDrawer {...defaultProps} open={true} />, {
        wrapper: customWrapper,
      });

      await waitFor(() => {
        expect(CustomComponent).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.any(Error),
          }),
          expect.any(Object),
        );
      });
    });

    it('passes article data to custom component when loaded', async () => {
      server.use(
        http.get('*/v1/help-center-articles/*', () => {
          return HttpResponse.json({ data: mockArticle });
        }),
      );

      render(<ZendeskDrawer {...defaultProps} open={true} />, {
        wrapper: customWrapper,
      });

      await waitFor(() => {
        expect(CustomComponent).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              title: mockArticle.help_center_article.title,
              body: mockArticle.help_center_article.body,
            }),
          }),
          expect.any(Object),
        );
      });
    });

    it('does not render default drawer when custom component is provided', () => {
      render(<ZendeskDrawer {...defaultProps} open={true} />, {
        wrapper: customWrapper,
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls onClose through custom component', async () => {
      const onClose = vi.fn();

      CustomComponent.mockImplementation(
        ({ onClose }: { onClose: () => void }) => (
          <button onClick={onClose}>Close</button>
        ),
      );

      render(
        <ZendeskDrawer {...defaultProps} open={true} onClose={onClose} />,
        { wrapper: customWrapper },
      );

      // Click the close button
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
