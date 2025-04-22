import { createClient } from '@hey-api/client-fetch';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
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
      () => useAuth({ auth: mockAuth, options: { isTestingMode: true } }),
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

    renderHook(
      () => useAuth({ auth: mockAuth, options: { isTestingMode: false } }),
      { wrapper },
    );

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

    const { result } = renderHook(
      () => useAuth({ auth: mockAuth, options: { isTestingMode: true } }),
      { wrapper },
    );

    // Wait for the query to be ready
    await act(async () => {
      await queryClient.prefetchQuery({
        queryKey: ['auth'],
        queryFn: mockAuth,
      });
    });

    let token: string | undefined;
    await act(async () => {
      const authFn = result.current.current.getConfig()
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

    const { result } = renderHook(
      () => useAuth({ auth: mockAuth, options: { isTestingMode: true } }),
      { wrapper },
    );

    // Wait for the query to be ready
    await act(async () => {
      await queryClient.prefetchQuery({
        queryKey: ['auth'],
        queryFn: mockAuth,
      });
    });

    // First call to set the token
    await act(async () => {
      const authFn = result.current.current.getConfig()
        .auth as () => Promise<string>;
      await authFn();
    });

    // Second call should use existing token
    let token: string | undefined;
    await act(async () => {
      const authFn = result.current.current.getConfig()
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

    const { result } = renderHook(
      () => useAuth({ auth: mockAuth, options: { isTestingMode: true } }),
      { wrapper },
    );

    // Wait for the first query to be ready
    await act(async () => {
      await queryClient.prefetchQuery({
        queryKey: ['auth'],
        queryFn: mockAuth,
      });
    });

    // First call sets expired token
    await act(async () => {
      const authFn = result.current.current.getConfig()
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
      const authFn = result.current.current.getConfig()
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

    renderHook(
      () => useAuth({ auth: mockAuth, options: { isTestingMode: true } }),
      { wrapper },
    );

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
});
