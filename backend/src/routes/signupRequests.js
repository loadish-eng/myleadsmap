import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, company, message } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  await prisma.signupRequest.create({
    data: {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      company: company ? String(company).trim() : null,
      message: message ? String(message).trim() : null,
    },
  });
  res.status(201).json({ success: true });
});

export default router;
