import { createClient } from './createClient';

vi.mock('./client/client', () => ({
  createClient: vi.fn((config) => config),
}));

vi.mock('./client/client.gen', () => ({
  client: { getConfig: vi.fn(() => ({ headers: {} })) },
}));

describe('createClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the base URL and version it is given', () => {
    const config = createClient(undefined, {
      baseUrl: 'https://gateway.example.com',
      version: '9.9.9',
    });

    expect(config).toMatchObject({
      baseUrl: 'https://gateway.example.com',
      headers: {
        'X-Client-Name': 'remote-flows-sdk',
        'X-Client-Version': '9.9.9',
      },
    });
  });

  it('sends requests to a valid proxy with its headers', () => {
    const config = createClient(undefined, {
      baseUrl: 'https://gateway.example.com',
      proxy: { url: 'https://proxy.example.com', headers: { 'X-Team': 'a' } },
      version: '1.0.0',
    });

    expect(config).toMatchObject({
      baseUrl: 'https://proxy.example.com',
      headers: { 'X-Team': 'a' },
    });
  });

  it('falls back to the base URL and logs when the proxy URL is invalid', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const config = createClient(undefined, {
      baseUrl: 'https://gateway.example.com',
      proxy: { url: 'not a url', headers: { 'X-Team': 'a' } },
      version: '1.0.0',
    });

    expect(error).toHaveBeenCalledWith(
      'Invalid proxy URL provided. Using default base URL.',
    );
    expect(config).toMatchObject({ baseUrl: 'https://gateway.example.com' });
    expect(config).not.toMatchObject({ headers: { 'X-Team': 'a' } });
  });
});
