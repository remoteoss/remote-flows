import { createClient } from '@hey-api/client-fetch';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { Mock } from 'vitest';
import { client } from '../client/client.gen';
import { useAuth } from '../useAuth';

type AuthResponse = {
  accessToken: string;
  expiresIn: number;
};

// Mock the createClient function
vi.mock('@hey-api/client-fetch', () => ({
  createClient: vi.fn().mockReturnValue({
    getConfig: () => ({
      auth: vi.fn(),
      baseUrl: '',
      headers: {},
    }),
  }),
}));

// Mock the client.getConfig
vi.mock('../client/client.gen', () => ({
  client: {
    getConfig: () => ({
      headers: {},
    }),
  },
}));

// Mock environment variables
vi.mock('../environments', () => ({
  ENVIRONMENTS: {
    partners: 'https://test-partners.com',
  },
}));

const mockAuthResponse: AuthResponse = {
  accessToken: 'test-token',
  expiresIn: 3600,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should create client with correct baseUrl in testing mode', () => {
    const mockAuth = vi.fn().mockResolvedValue(mockAuthResponse);

    renderHook(
      () => useAuth({ auth: mockAuth, options: { environment: 'partners' } }),
      { wrapper },
    );

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'https://test-partners.com',
      }),
    );
  });

  it('should create client with REMOTE_GATEWAY_URL in production mode', () => {
    const originalEnv = process.env;
    process.env.REMOTE_GATEWAY_URL = 'https://production.com';

    const mockAuth = vi.fn().mockResolvedValue(mockAuthResponse);

    renderHook(() => useAuth({ auth: mockAuth }), { wrapper });

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'https://production.com',
      }),
    );

    process.env = originalEnv;
  });

  it('should fetch new token when session is empty', async () => {
    const mockAuth = vi.fn().mockResolvedValue(mockAuthResponse);
    const mockAuthFn = vi.fn().mockResolvedValue('test-token');

    (createClient as Mock).mockReturnValue({
      getConfig: () => ({
        auth: mockAuthFn,
        baseUrl: '',
        headers: {},
      }),
    });

    const { result } = renderHook(() => useAuth({ auth: mockAuth }), {
      wrapper,
    });

    // Wait for the query to be ready
    await act(async () => {
      await queryClient.prefetchQuery({
        queryKey: ['auth'],
        queryFn: mockAuth,
      });
    });

    let token: string | undefined;
    await act(async () => {
      const authFn = result.current.client.current.getConfig()
        .auth as () => Promise<string>;
      token = await authFn();
    });

    expect(mockAuth).toHaveBeenCalledOnce();
    expect(token).toBe('test-token');
  });

  it('should use existing token if not expired', async () => {
    const mockAuth = vi.fn().mockResolvedValue(mockAuthResponse);
    const mockAuthFn = vi.fn().mockResolvedValue('test-token');

    (createClient as Mock).mockReturnValue({
      getConfig: () => ({
        auth: mockAuthFn,
        baseUrl: '',
        headers: {},
      }),
    });

    const { result } = renderHook(() => useAuth({ auth: mockAuth }), {
      wrapper,
    });

    // Wait for the query to be ready
    await act(async () => {
      await queryClient.prefetchQuery({
        queryKey: ['auth'],
        queryFn: mockAuth,
      });
    });

    // First call to set the token
    await act(async () => {
      const authFn = result.current.client.current.getConfig()
        .auth as () => Promise<string>;
      await authFn();
    });

    // Second call should use existing token
    let token: string | undefined;
    await act(async () => {
      const authFn = result.current.client.current.getConfig()
        .auth as () => Promise<string>;
      token = await authFn();
    });

    expect(mockAuth).toHaveBeenCalledOnce();
    expect(token).toBe('test-token');
  });

  it('should fetch new token when existing token is expired', async () => {
    const mockAuth = vi
      .fn()
      .mockResolvedValueOnce({
        accessToken: 'expired-token',
        expiresIn: -1, // Expired immediately
      })
      .mockResolvedValueOnce({
        accessToken: 'new-token',
        expiresIn: 3600,
      });

    const mockAuthFn = vi
      .fn()
      .mockResolvedValueOnce('expired-token')
      .mockResolvedValueOnce('new-token');

    (createClient as Mock).mockReturnValue({
      getConfig: () => ({
        auth: mockAuthFn,
        baseUrl: '',
        headers: {},
      }),
    });

    const { result } = renderHook(() => useAuth({ auth: mockAuth }), {
      wrapper,
    });

    // Wait for the first query to be ready
    await act(async () => {
      await queryClient.prefetchQuery({
        queryKey: ['auth'],
        queryFn: mockAuth,
      });
    });

    // First call sets expired token
    await act(async () => {
      const authFn = result.current.client.current.getConfig()
        .auth as () => Promise<string>;
      await authFn();
    });

    // Wait for the second query to be ready
    await act(async () => {
      await queryClient.prefetchQuery({
        queryKey: ['auth'],
        queryFn: mockAuth,
      });
    });

    // Second call should fetch new token
    let token: string | undefined;
    await act(async () => {
      const authFn = result.current.client.current.getConfig()
        .auth as () => Promise<string>;
      token = await authFn();
    });

    expect(mockAuth).toHaveBeenCalledTimes(2);
    expect(token).toBe('new-token');
  });

  it('should merge existing client headers with new headers', () => {
    process.env.VERSION = '1.0.0';
    const mockAuth = vi.fn().mockResolvedValue(mockAuthResponse);

    // Mock the client object
    vi.mocked(client).getConfig = vi.fn().mockReturnValue({
      headers: {
        'Existing-Header': 'value',
      },
    });

    renderHook(() => useAuth({ auth: mockAuth }), { wrapper });

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          'Existing-Header': 'value',
          'X-Client-Name': 'remote-flows-sdk',
          'X-Client-Version': '1.0.0',
        },
      }),
    );
  });

  it('should use proxy URL when provided and valid', () => {
    const mockAuth = vi.fn().mockResolvedValue(mockAuthResponse);
    const proxyUrl = 'https://proxy.example.com';

    renderHook(
      () =>
        useAuth({
          auth: mockAuth,
          options: { proxy: { url: proxyUrl } },
        }),
      { wrapper },
    );

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: proxyUrl,
      }),
    );
  });

  it('should use default baseUrl when proxy URL is invalid', () => {
    const mockAuth = vi.fn().mockResolvedValue(mockAuthResponse);
    const invalidProxyUrl = 'not-a-valid-url';

    renderHook(
      () =>
        useAuth({
          auth: mockAuth,
          options: { environment: 'partners', proxy: { url: invalidProxyUrl } },
        }),
      { wrapper },
    );

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'https://test-partners.com',
      }),
    );
  });

  it('should merge proxy headers with existing headers', () => {
    process.env.VERSION = '1.0.0';
    const mockAuth = vi.fn().mockResolvedValue(mockAuthResponse);
    const proxyUrl = 'https://proxy.example.com';
    const proxyHeaders = {
      'Proxy-Header': 'proxy-value',
      'Custom-Header': 'custom-value',
    };

    // Mock the client object
    vi.mocked(client).getConfig = vi.fn().mockReturnValue({
      headers: {
        'Existing-Header': 'value',
      },
    });

    renderHook(
      () =>
        useAuth({
          auth: mockAuth,
          options: {
            proxy: { url: proxyUrl, headers: proxyHeaders },
          },
        }),
      { wrapper },
    );

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          'Existing-Header': 'value',
          'Proxy-Header': 'proxy-value',
          'Custom-Header': 'custom-value',
          'X-Client-Name': 'remote-flows-sdk',
          'X-Client-Version': '1.0.0',
        },
        baseUrl: proxyUrl,
      }),
    );
  });

  it('should not share cached tokens between different authId values', async () => {
    const clientAuthResponse = {
      accessToken: 'client-token',
      expiresIn: 3600,
    };

    const serverAuthResponse = {
      accessToken: 'server-token',
      expiresIn: 3600,
    };

    const mockClientAuth = vi.fn().mockResolvedValue(clientAuthResponse);
    const mockServerAuth = vi.fn().mockResolvedValue(serverAuthResponse);

    const mockClientAuthFn = vi.fn().mockResolvedValue('client-token');
    const mockServerAuthFn = vi.fn().mockResolvedValue('server-token');

    // Mock createClient to return different auth functions for different calls
    (createClient as Mock)
      .mockReturnValueOnce({
        getConfig: () => ({
          auth: mockClientAuthFn,
          baseUrl: '',
          headers: {},
        }),
      })
      .mockReturnValueOnce({
        getConfig: () => ({
          auth: mockServerAuthFn,
          baseUrl: '',
          headers: {},
        }),
      });

    // Render first hook with 'client' authId
    const { result: clientResult } = renderHook(
      () => useAuth({ auth: mockClientAuth, authId: 'client' }),
      { wrapper },
    );

    // Render second hook with 'default' authId (server auth)
    const { result: serverResult } = renderHook(
      () => useAuth({ auth: mockServerAuth, authId: 'default' }),
      { wrapper },
    );

    // Prefetch queries for both auth types with their respective query keys
    await act(async () => {
      await queryClient.prefetchQuery({
        queryKey: ['auth', 'client'],
        queryFn: mockClientAuth,
      });
      await queryClient.prefetchQuery({
        queryKey: ['auth', 'default'],
        queryFn: mockServerAuth,
      });
    });

    // Get token from client auth
    let clientToken: string | undefined;
    await act(async () => {
      const authFn = clientResult.current.client.current.getConfig()
        .auth as () => Promise<string>;
      clientToken = await authFn();
    });

    // Get token from server auth
    let serverToken: string | undefined;
    await act(async () => {
      const authFn = serverResult.current.client.current.getConfig()
        .auth as () => Promise<string>;
      serverToken = await authFn();
    });

    // Verify both auth functions were called (no cache sharing)
    expect(mockClientAuth).toHaveBeenCalledOnce();
    expect(mockServerAuth).toHaveBeenCalledOnce();

    // Verify different tokens are returned
    expect(clientToken).toBe('client-token');
    expect(serverToken).toBe('server-token');

    // Verify tokens are different (not sharing cache)
    expect(clientToken).not.toBe(serverToken);
  });

  it('should share cached tokens within the same authId', async () => {
    const authResponse = {
      accessToken: 'shared-token',
      expiresIn: 3600,
    };

    const mockAuth = vi.fn().mockResolvedValue(authResponse);
    const mockAuthFn = vi.fn().mockResolvedValue('shared-token');

    (createClient as Mock).mockReturnValue({
      getConfig: () => ({
        auth: mockAuthFn,
        baseUrl: '',
        headers: {},
      }),
    });

    // Render two hooks with the same authId
    const { result: firstResult } = renderHook(
      () => useAuth({ auth: mockAuth, authId: 'client' }),
      { wrapper },
    );

    const { result: secondResult } = renderHook(
      () => useAuth({ auth: mockAuth, authId: 'client' }),
      { wrapper },
    );

    // Prefetch query once
    await act(async () => {
      await queryClient.prefetchQuery({
        queryKey: ['auth', 'client'],
        queryFn: mockAuth,
      });
    });

    // Get token from first hook
    await act(async () => {
      const authFn = firstResult.current.client.current.getConfig()
        .auth as () => Promise<string>;
      await authFn();
    });

    // Get token from second hook (should use cache)
    let secondToken: string | undefined;
    await act(async () => {
      const authFn = secondResult.current.client.current.getConfig()
        .auth as () => Promise<string>;
      secondToken = await authFn();
    });

    // Auth function should only be called once (cache sharing within same authId)
    expect(mockAuth).toHaveBeenCalledOnce();
    expect(secondToken).toBe('shared-token');
  });

  it('should set ownerId when auth response includes it', async () => {
    const authResponseWithOwnerId = {
      accessToken: 'test-token',
      expiresIn: 3600,
      ownerId: 'owner-123',
    };

    const mockAuth = vi.fn().mockResolvedValue(authResponseWithOwnerId);

    // Capture the config when useAuth calls createClient
    (createClient as Mock).mockImplementationOnce((config) => ({
      getConfig: () => config,
    }));

    const { result } = renderHook(() => useAuth({ auth: mockAuth }), {
      wrapper,
    });

    expect(result.current.ownerId).toBeUndefined();

    await act(async () => {
      const clientConfig = result.current.client.current.getConfig();
      const authFn = clientConfig.auth as () => Promise<string>;
      await authFn();
    });

    await waitFor(() => {
      expect(result.current.ownerId).toBe('owner-123');
    });

    expect(mockAuth).toHaveBeenCalledOnce();
  });
});
