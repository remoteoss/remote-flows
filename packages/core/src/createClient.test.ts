import { createClient } from './createClient';

describe('createClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the base URL and version it is given', () => {
    const config = createClient(undefined, {
      baseUrl: 'https://gateway.example.com',
      version: '9.9.9',
    }).getConfig();

    const headers = config.headers as Headers;

    expect(config.baseUrl).toBe('https://gateway.example.com');
    expect(headers.get('X-Client-Name')).toBe('remote-flows-sdk');
    expect(headers.get('X-Client-Version')).toBe('9.9.9');
  });

  it('sends requests to a valid proxy with its headers', () => {
    const config = createClient(undefined, {
      baseUrl: 'https://gateway.example.com',
      proxy: { url: 'https://proxy.example.com', headers: { 'X-Team': 'a' } },
      version: '1.0.0',
    }).getConfig();

    expect(config.baseUrl).toBe('https://proxy.example.com');
    expect((config.headers as Headers).get('X-Team')).toBe('a');
  });

  it('falls back to the base URL and logs when the proxy URL is invalid', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const config = createClient(undefined, {
      baseUrl: 'https://gateway.example.com',
      proxy: { url: 'not a url', headers: { 'X-Team': 'a' } },
      version: '1.0.0',
    }).getConfig();

    expect(error).toHaveBeenCalledWith(
      'Invalid proxy URL provided. Using default base URL.',
    );
    expect(config.baseUrl).toBe('https://gateway.example.com');
    expect((config.headers as Headers).get('X-Team')).toBeNull();
  });
});
