import { authMiddleware } from '../src/middleware/authMiddleware';
import * as authService from '../src/services/authService';
import * as UserModel from '../src/models/User';

jest.mock('../src/services/authService');
jest.mock('../src/models/User');
jest.mock('../src/utils/logger', () => ({ logger: jest.fn() }));

function mockReqRes(cookieToken?: string, bearerToken?: string) {
  const req: any = {
    cookies: cookieToken ? { token: cookieToken } : {},
    headers: bearerToken ? { authorization: `Bearer ${bearerToken}` } : {},
  };
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('authMiddleware cookie support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (UserModel.getTokenVersion as jest.Mock).mockResolvedValue(0);
  });

  it('should accept token from cookie', async () => {
    (authService.verifyToken as jest.Mock).mockReturnValue({ userId: 'user1', tokenVersion: 0 });

    const { req, res, next } = mockReqRes('cookie-jwt');
    await authMiddleware(req, res, next);

    expect(req.userId).toBe('user1');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should accept token from Bearer header as fallback', async () => {
    (authService.verifyToken as jest.Mock).mockReturnValue({ userId: 'user2', tokenVersion: 0 });

    const { req, res, next } = mockReqRes(undefined, 'header-jwt');
    await authMiddleware(req, res, next);

    expect(req.userId).toBe('user2');
    expect(next).toHaveBeenCalled();
  });

  it('should reject revoked token', async () => {
    (authService.verifyToken as jest.Mock).mockReturnValue({ userId: 'user1', tokenVersion: 0 });
    (UserModel.getTokenVersion as jest.Mock).mockResolvedValue(1);

    const { req, res, next } = mockReqRes('old-token');
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token revoked' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request without token', async () => {
    const { req, res, next } = mockReqRes();
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    (authService.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const { req, res, next } = mockReqRes('bad-token');
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });
});

describe('authController', () => {
  it('should return user without token on login', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: 'user1' }, 'test-secret');

    const controller = require('../src/controllers/authController');
    const req: any = { body: { email: 'a@b.com', password: 'pass' }, headers: {} };
    const res: any = {
      cookie: jest.fn(),
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    (authService.login as jest.Mock).mockResolvedValue({
      token,
      user: { id: 'user1', email: 'a@b.com', name: 'Test' },
    });

    await controller.login(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith('token', token, expect.objectContaining({ httpOnly: true }));
    expect(res.json).toHaveBeenCalledWith({ user: expect.objectContaining({ id: 'user1' }) });
    expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ token: expect.anything() }));
  });
});
