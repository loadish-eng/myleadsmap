import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const results = {};

    // Invite standard user
    try {
      await base44.users.inviteUser('standard@test.com', 'user');
      results.standardInvited = true;
    } catch (e) {
      results.standardError = e.message;
    }

    // Invite premium user
    try {
      await base44.users.inviteUser('premium@test.com', 'user');
      results.premiumInvited = true;
    } catch (e) {
      results.premiumError = e.message;
    }

    // Update subscription tiers
    const users = await base44.asServiceRole.entities.User.list();
    const standardRecord = users.find(u => u.email === 'standard@test.com');
    const premiumRecord = users.find(u => u.email === 'premium@test.com');

    if (standardRecord) {
      await base44.asServiceRole.entities.User.update(standardRecord.id, {
        subscription_status: 'active',
        subscription_plan: 'standard',
      });
      results.standardTierSet = true;
    }

    if (premiumRecord) {
      await base44.asServiceRole.entities.User.update(premiumRecord.id, {
        subscription_status: 'active',
        subscription_plan: 'premium',
      });
      results.premiumTierSet = true;
    }

    return Response.json(results);
  } catch (error) {
    console.error('Setup test users error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});