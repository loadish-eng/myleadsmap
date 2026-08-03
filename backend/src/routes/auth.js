import { Router } from 'express';
import { prisma } from '../db.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { toPublicUser } from '../lib/serialize.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json(toPublicUser(req.user));
});

router.patch('/me', requireAuth, async (req, res) => {
  const { google_api_key } = req.body || {};
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { googleApiKey: google_api_key },
  });
  res.json(toPublicUser(updated));
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  if (!verifyPassword(currentPassword, req.user.passwordHash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash: hashPassword(newPassword) },
  });
  res.json({ success: true });
});

export default router;
