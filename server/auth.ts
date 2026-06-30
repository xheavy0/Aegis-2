import { Request, Response, NextFunction } from 'express';
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto';
import { AuthUser } from '../src/types.js';

// ─── Password hashing (scrypt — no native deps) ─────────────────────────────────
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// ─── Stateless signed tokens (HMAC — minimal JWT-style, no native deps) ──────────
const SECRET = process.env.AUTH_SECRET || 'aegis-dev-secret-change-me';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

export function signToken(userId: string): string {
  const payload = b64url(JSON.stringify({ sub: userId, exp: Date.now() + TOKEN_TTL_MS }));
  const sig = b64url(createHmac('sha256', SECRET).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): { sub: string } | null {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = b64url(createHmac('sha256', SECRET).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sub: string; exp: number };
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return { sub: data.sub };
  } catch {
    return null;
  }
}

// ─── Middleware ─────────────────────────────────────────────────────────────────
export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(resolveUser: (id: string) => AuthUser | null) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' });
    const user = resolveUser(decoded.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    req.user = user;
    next();
  };
}
