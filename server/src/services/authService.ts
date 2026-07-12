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
  const token = generateToken(user.id);
  logger(`User logged in: ${user.email}`);
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '24h' });
}

export async function registerByInvite(code: string): Promise<AuthResponse> {
  if (code !== config.inviteCode) {
    throw new Error('Invalid invite code');
  }
  const name = `User_${Math.random().toString(36).slice(2, 6)}`;
  const email = `${name}@invite.local`;
  const passwordHash = await bcrypt.hash(code, SALT_ROUNDS);
  const user = await UserModel.create(email, passwordHash, name);
  const token = generateToken(user.id);
  logger(`User joined via invite: ${user.id}`);
  return { token, user };
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, config.jwtSecret) as { userId: string };
}
