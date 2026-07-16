import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authService from '../src/services/authService';
import * as UserModel from '../src/models/User';

jest.mock('../src/models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (UserModel.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
      });
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await authService.register('test@test.com', 'Pass123!', 'Test');
      expect(result.token).toBe('token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw if email already exists', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue({ id: '1' });
      await expect(authService.register('test@test.com', 'Pass123!', 'Test'))
        .rejects.toThrow('Email already registered');
    });
  });

  describe('register password validation', () => {
    it('should reject short password during registration', async () => {
      await expect(authService.register('test@test.com', '12345', 'Test'))
        .rejects.toThrow('Password must be at least 6 characters');
    });

    it('should reject empty password during registration', async () => {
      await expect(authService.register('test@test.com', '', 'Test'))
        .rejects.toThrow('Password must be at least 6 characters');
    });

    it('should generate token with expected payload for register', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (UserModel.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
      });
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await authService.register('test@test.com', 'Pass123!', 'Test');

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ userId: '1', tokenVersion: 0 }),
        expect.any(String),
        expect.any(Object)
      );
      expect(result.token).toBe('token');
    });
  });

  describe('changePassword', () => {
    it('should reject short new password', async () => {
      await expect(authService.changePassword('user1', 'oldPass', 'short'))
        .rejects.toThrow('Password must be at least 6 characters');
    });

    it('should reject empty new password', async () => {
      await expect(authService.changePassword('user1', 'oldPass', ''))
        .rejects.toThrow('Password must be at least 6 characters');
    });
  });

  describe('login', () => {
    it('should login and return token', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        password_hash: 'hashed',
        avatar_url: null,
        created_at: new Date().toISOString(),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await authService.login('test@test.com', 'Pass123!');
      expect(result.token).toBe('token');
    });

    it('should throw on wrong password', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue({
        id: '1',
        password_hash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(authService.login('test@test.com', 'wrong'))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
