import { authLimiter, uploadLimiter } from '../src/middleware/rateLimit';

describe('rateLimit middleware', () => {
  it('should export auth limiter', () => {
    expect(authLimiter).toBeDefined();
    expect(typeof authLimiter).toBe('function');
  });

  it('should export upload limiter', () => {
    expect(uploadLimiter).toBeDefined();
    expect(typeof uploadLimiter).toBe('function');
  });
});
