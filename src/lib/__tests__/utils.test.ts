import { sanitizeHtml } from '../utils';

describe('sanitizeHtml', () => {
  it('should sanitize dangerous scripts', () => {
    const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>';
    const result = sanitizeHtml(maliciousHtml);

    expect(result).toBe('<p>Safe content</p>');
    expect(result).not.toContain('<script>');
  });

  it('should preserve target attribute', () => {
    const htmlWithTarget = '<a href="#" target="_blank">Link</a>';
    const result = sanitizeHtml(htmlWithTarget);

    expect(result).toContain('target="_blank"');
  });
});
