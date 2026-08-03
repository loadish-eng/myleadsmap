import { Router } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../db.js';
import { hashPassword } from '../lib/password.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { toPublicUser } from '../lib/serialize.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(users.map(toPublicUser));
});

router.post('/users', async (req, res) => {
  const { email, password, full_name, role, subscription_plan, subscription_status } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ error: 'A user with that email already exists' });
  }
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      fullName: full_name || null,
      role: role === 'admin' ? 'admin' : 'user',
      subscriptionPlan: subscription_plan === 'standard' ? 'standard' : 'premium',
      subscriptionStatus: subscription_status === 'inactive' ? 'inactive' : 'active',
    },
  });
  res.status(201).json(toPublicUser(user));
});

router.patch('/users/:id', async (req, res) => {
  const { role, subscription_plan, subscription_status, google_api_key, full_name } = req.body || {};
  const data = {};
  if (role !== undefined) data.role = role === 'admin' ? 'admin' : 'user';
  if (subscription_plan !== undefined) data.subscriptionPlan = subscription_plan === 'standard' ? 'standard' : 'premium';
  if (subscription_status !== undefined) data.subscriptionStatus = subscription_status === 'inactive' ? 'inactive' : 'active';
  if (google_api_key !== undefined) data.googleApiKey = google_api_key;
  if (full_name !== undefined) data.fullName = full_name;

  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json(toPublicUser(user));
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/users/:id/reset-password', async (req, res) => {
  const { newPassword } = req.body || {};
  const useProvided = typeof newPassword === 'string' && newPassword.length >= 8;
  const password = useProvided ? newPassword : crypto.randomBytes(9).toString('base64url');

  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash: hashPassword(password) } });
    res.json({ success: true, temporaryPassword: useProvided ? undefined : password });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router;
