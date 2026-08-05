import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { toPublicLead } from '../lib/serialize.js';

const router = Router();
router.use(requireAuth);

const PATCHABLE_FIELDS = {
  pipeline_stage: 'pipelineStage',
  contact_name: 'contactName',
  contact_phone: 'contactPhone',
  contact_email: 'contactEmail',
  notes: 'notes',
  last_action_type: 'lastActionType',
  last_action_date: 'lastActionDate',
  actions: 'actions',
  name: 'name',
  address: 'address',
  category: 'category',
  phone: 'phone',
  website: 'website',
};

router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 200, 1000);
  const leads = await prisma.lead.findMany({
    where: { ownerId: req.user.id },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });
  res.json(leads.map(toPublicLead));
});

router.post('/', async (req, res) => {
  const b = req.body || {};
  if (!b.place_id || !b.name || b.lat == null || b.lng == null) {
    return res.status(400).json({ error: 'place_id, name, lat, lng are required' });
  }
  try {
    const lead = await prisma.lead.create({
      data: {
        ownerId: req.user.id,
        placeId: b.place_id,
        name: b.name,
        address: b.address,
        category: b.category,
        lat: b.lat,
        lng: b.lng,
        phone: b.phone,
        website: b.website,
        pipelineStage: b.pipeline_stage || 'prospect',
        contactName: b.contact_name,
        contactPhone: b.contact_phone,
        contactEmail: b.contact_email,
        notes: b.notes,
        lastActionType: b.last_action_type,
        lastActionDate: b.last_action_date,
        actions: b.actions || [],
      },
    });
    res.status(201).json(toPublicLead(lead));
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A lead for this place already exists' });
    }
    throw err;
  }
});

router.patch('/:id', async (req, res) => {
  const b = req.body || {};
  const existing = await prisma.lead.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
  if (!existing) return res.status(404).json({ error: 'Lead not found' });

  const data = {};
  for (const [apiField, dbField] of Object.entries(PATCHABLE_FIELDS)) {
    if (b[apiField] !== undefined) data[dbField] = b[apiField];
  }

  const updated = await prisma.lead.update({ where: { id: req.params.id }, data });
  res.json(toPublicLead(updated));
});

router.delete('/', async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((id) => typeof id === 'string') : [];
  if (ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array of lead ids' });
  }

  const result = await prisma.lead.deleteMany({
    where: { id: { in: ids }, ownerId: req.user.id },
  });
  res.json({ success: true, deletedCount: result.count });
});

router.delete('/:id', async (req, res) => {
  const existing = await prisma.lead.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
  if (!existing) return res.status(404).json({ error: 'Lead not found' });

  await prisma.lead.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
