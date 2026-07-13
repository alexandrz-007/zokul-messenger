import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/app';
import { AuthResponse } from '../types';
import * as UserModel from '../models/User';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 10;

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserModel.create(email, passwordHash, name);
  const token = generateToken(user.id);
  logger(`User registered: ${user.email}`);
  return { token, user };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }
  const token = generateToken(user.id, user.tokenVersion);
  logger(`User logged in: ${user.email}`);
  const { passwordHash: _, tokenVersion: __, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export function generateToken(userId: string, tokenVersion: number = 0): string {
  return jwt.sign({ userId, tokenVersion }, config.jwtSecret, { expiresIn: '24h' });
}

export function verifyToken(token: string): { userId: string; tokenVersion: number } {
  return jwt.verify(token, config.jwtSecret) as { userId: string; tokenVersion: number };
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  const row = await UserModel.findByIdWithPassword(userId);
  if (!row) throw new Error('User not found');
  const valid = await bcrypt.compare(oldPassword, row.passwordHash);
  if (!valid) throw new Error('Current password is incorrect');
  if (newPassword.length < 6) throw new Error('New password must be at least 6 characters');
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await UserModel.updatePassword(userId, hash);
  logger(`Password changed for user ${userId}`);
}
