import { Router } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../db.js';
import { hashPassword } from '../lib/password.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { toPublicUser, toPublicSignupRequest, toPublicLead } from '../lib/serialize.js';
import { toCsv } from '../lib/csv.js';

const LEAD_EXPORT_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'place_id', label: 'Place ID' },
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'category', label: 'Category' },
  { key: 'lat', label: 'Latitude' },
  { key: 'lng', label: 'Longitude' },
  { key: 'phone', label: 'Phone' },
  { key: 'website', label: 'Website' },
  { key: 'pipeline_stage', label: 'Stage' },
  { key: 'contact_name', label: 'Contact Name' },
  { key: 'contact_phone', label: 'Contact Phone' },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'notes', label: 'Notes' },
  { key: 'last_action_type', label: 'Last Action Type' },
  { key: 'last_action_date', label: 'Last Action Date' },
  { key: 'created_date', label: 'Created' },
  { key: 'updated_date', label: 'Updated' },
];

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

router.delete('/users/:id', async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot remove your own account' });
  }
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

router.get('/signup-requests', async (req, res) => {
  const requests = await prisma.signupRequest.findMany({
    where: { status: 'new' },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requests.map(toPublicSignupRequest));
});

router.delete('/signup-requests/:id', async (req, res) => {
  try {
    await prisma.signupRequest.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Signup request not found' });
  }
});

router.get('/leads/export', async (req, res) => {
  const { email, stage, category, action_type, date_from, date_to, format } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'email query param is required' });
  }

  const targetUser = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!targetUser) {
    return res.status(404).json({ error: 'No user found with that email' });
  }

  const where = { ownerId: targetUser.id };
  if (stage) where.pipelineStage = String(stage);
  if (category) where.category = String(category);
  if (action_type) where.lastActionType = String(action_type);
  if (date_from || date_to) {
    where.lastActionDate = {};
    if (date_from) where.lastActionDate.gte = String(date_from);
    if (date_to) where.lastActionDate.lte = String(date_to);
  }

  const leads = await prisma.lead.findMany({ where, orderBy: { updatedAt: 'desc' } });
  const rows = leads.map(toPublicLead);

  if (format === 'csv') {
    const csv = toCsv(rows, LEAD_EXPORT_COLUMNS);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${targetUser.email}.csv"`);
    return res.send(csv);
  }

  res.json(rows);
});

export default router;
