import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role === 'admin') {
      return Response.json({ error: 'Admin accounts do not have a subscription to cancel' }, { status: 400 });
    }

    const customerId = user.stripe_customer_id;
    if (!customerId) {
      return Response.json({ error: 'No active subscription found' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return Response.json({ error: 'No active subscription found' }, { status: 400 });
    }

    await stripe.subscriptions.cancel(subscriptions.data[0].id);

    await base44.asServiceRole.entities.User.update(user.id, {
      subscription_status: 'canceled',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});