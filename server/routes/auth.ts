import { Router, Request, Response } from 'express';
import { findUserByEmail, findUserById } from '../db.js';
import { verifyPassword, signToken, requireAuth, AuthedRequest } from '../auth.js';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const record = findUserByEmail(email);
  if (!record || !verifyPassword(password, record.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const { passwordHash: _omit, ...user } = record;
  res.json({ token: signToken(user.id), user });
});

router.get('/me', requireAuth(findUserById), (req: AuthedRequest, res: Response) => {
  res.json(req.user);
});

export default router;
