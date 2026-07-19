import { loginLimiter, registerLimiter, changePasswordLimiter } from '../src/middleware/rateLimitMiddleware';
import { uploadLimiter } from '../src/middleware/rateLimit';

function mockReqRes(ip?: string) {
  const req: any = {
    ip: ip ?? '127.0.0.1',
    headers: {},
    app: { get: () => false },
  };
  const res: any = { status: jest.fn().mockReturnThis(), setHeader: jest.fn(), send: jest.fn(), writableEnded: false };
  const next = jest.fn();
  return { req, res, next };
}

describe('limiter isolation', () => {
  const ip = '127.0.0.10';

  it('login limiter and register limiter have independent counters', async () => {
    for (let i = 0; i < 5; i++) {
      const { req, res, next } = mockReqRes(ip);
      await loginLimiter(req, res, next);
    }
    const { req: r1, res: res1, next: n1 } = mockReqRes(ip);
    await loginLimiter(r1, res1, n1);
    expect(res1.status).toHaveBeenCalledWith(429);

    for (let i = 0; i < 3; i++) {
      const { req, res, next } = mockReqRes(ip);
      await registerLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
    }
    const { req: r2, res: res2, next: n2 } = mockReqRes(ip);
    await registerLimiter(r2, res2, n2);
    expect(res2.status).toHaveBeenCalledWith(429);
  });
});

describe('loginLimiter', () => {
  const ip = '127.0.0.11';

  it('allows 5 attempts then blocks the 6th', async () => {
    for (let i = 0; i < 5; i++) {
      const { req, res, next } = mockReqRes(ip);
      await loginLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    }
    const { req, res, next } = mockReqRes(ip);
    await loginLimiter(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('login') }));
    expect(next).not.toHaveBeenCalled();
  });
});

describe('registerLimiter', () => {
  const ip = '127.0.0.12';

  it('allows 3 attempts then blocks the 4th', async () => {
    for (let i = 0; i < 3; i++) {
      const { req, res, next } = mockReqRes(ip);
      await registerLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    }
    const { req, res, next } = mockReqRes(ip);
    await registerLimiter(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('registration') }));
    expect(next).not.toHaveBeenCalled();
  });
});

describe('changePasswordLimiter', () => {
  const ip = '127.0.0.13';

  it('allows 5 attempts then blocks the 6th', async () => {
    for (let i = 0; i < 5; i++) {
      const { req, res, next } = mockReqRes(ip);
      await changePasswordLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    }
    const { req, res, next } = mockReqRes(ip);
    await changePasswordLimiter(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('password') }));
    expect(next).not.toHaveBeenCalled();
  });
});

describe('uploadLimiter', () => {
  it('should export upload limiter', () => {
    expect(uploadLimiter).toBeDefined();
    expect(typeof uploadLimiter).toBe('function');
  });
});
