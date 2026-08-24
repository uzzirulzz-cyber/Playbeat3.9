/**
 * Authentication helpers — password hashing, token generation, role checks.
 *
 * SECURITY:
 *  - Passwords are hashed with bcrypt (10 rounds) before storage.
 *  - Plaintext passwords NEVER touch the database, logs, or API responses.
 *  - Tokens are simple opaque strings for this demo. In production, use
 *    signed JWTs (jsonwebtoken) with proper secret rotation.
 *  - The JWT_SECRET from .env is used to make tokens unpredictable.
 */

import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import type { Role, User } from '../types.js';

const BCRYPT_ROUNDS = 10;

/**
 * Hash a plaintext password. Returns a bcrypt hash string.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored bcrypt hash.
 * Returns true if they match.
 */
export async function comparePassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Generate an opaque session token. Not a real JWT, but unpredictable enough
 * for the demo. In production, replace with jsonwebtoken.sign().
 */
export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'playbeat-digital-dev-secret';
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(24).toString('hex')}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `pb_session_${Buffer.from(payload).toString('base64url')}.${signature}`;
}

/**
 * Roles that can access the admin panel.
 */
export const ADMIN_ROLES: Role[] = [
  'super_admin',
  'admin',
  'product_manager',
  'order_manager',
  'finance_manager',
  'support_agent',
  'content_manager',
  'marketing_manager',
];

/**
 * Check if a role can access /admin.
 */
export function isAdminRole(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Strip sensitive fields (passwordHash) from a user object before sending
 * it to the client. Never expose the hash.
 */
export function sanitizeUser(user: User): Omit<User, 'passwordHash' | 'resetToken' | 'resetTokenExpires'> {
  const { passwordHash, resetToken, resetTokenExpires, ...safe } = user;
  return safe;
}

/**
 * Validate an email address format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength.
 * Minimum 8 characters, at least one letter and one number.
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must be 128 characters or fewer.' };
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase, lowercase, and numeric characters.' };
  }
  return { valid: true };
}
