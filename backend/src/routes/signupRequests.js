import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, company, message } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return res.status(409).json({ error: 'An account with that email already exists. Please log in instead.' });
  }

  const existingRequest = await prisma.signupRequest.findFirst({ where: { email: normalizedEmail, status: 'new' } });
  if (existingRequest) {
    return res.status(409).json({ error: "You've already requested access with that email. We'll be in touch soon." });
  }

  await prisma.signupRequest.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      company: company ? String(company).trim() : null,
      message: message ? String(message).trim() : null,
    },
  });
  res.status(201).json({ success: true });
});

export default router;
