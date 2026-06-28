import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Check, Loader2, MapPin, AlertCircle, Star } from 'lucide-react';

const PLANS = [
  {
    id: 'standard',
    name: 'Standard',
    price: '$9.99',
    features: [
      'Use your own Google API key for searches(Free from Google-> https://mapsplatform.google.com/maps-demo-key/)',
      '50 lead storage max',
      'Condensed Open/Closed lead pipeline',
      'Contact logging & action history',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99',
    popular: true,
    features: [
      'Unlimited business searches via Google Places',
      '1,000 lead storage max',
      'Full interactive lead pipeline tracking (Prospect → Closed)',
      'Map with custom category markers',
      'Contact logging & action history',
    ],
  },
];

export default function Subscribe() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status !== 'success') return;
    setProcessing(true);
    let attempts = 0;
    let cancelled = false;

    const checkSub = async () => {
      attempts++;
      try {
        const currentUser = await base44.auth.me();
        if (currentUser?.subscription_status === 'active' || currentUser?.role === 'admin') {
          if (!cancelled) window.location.href = '/';
          return;
        }
      } catch (e) {
        // ignore
      }
      if (attempts < 8 && !cancelled) {
        setTimeout(checkSub, 2000);
      } else if (!cancelled) {
        setProcessing(false);
      }
    };

    checkSub();
    return () => { cancelled = true; };
  }, [status]);

  const handleSubscribe = async (plan) => {
    if (window.self !== window.top) {
      setError('Checkout only works from a published app. Please open the app in a new tab to subscribe.');
      return;
    }
    setLoadingPlan(plan);
    setError('');
    try {
      const res = await base44.functions.invoke('create-checkout-session', {
        origin: window.location.origin,
        plan,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError('Failed to start checkout. Please try again.');
      }
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-foreground" />
          <h2 className="text-lg font-heading font-semibold">Processing your subscription...</h2>
          <p className="text-sm text-muted-foreground mt-1">You'll be redirected shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <MapPin className="w-6 h-6 text-foreground" />
            <span className="font-heading font-bold text-xl">MyLeadsMap</span>
          </div>
          <h1 className="text-2xl font-heading font-bold">Choose your plan</h1>
          <p className="text-sm text-muted-foreground mt-1">Start finding and closing local business leads.</p>
        </div>

        {status === 'canceled' && (
          <div className="mb-4 p-3 rounded-lg bg-secondary text-sm text-muted-foreground text-center max-w-md mx-auto">
            Checkout was canceled. You can try again anytime.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-sm text-destructive flex items-start gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-card p-6 shadow-sm flex flex-col ${
                plan.popular ? 'border-foreground' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-foreground text-background text-xs font-medium">
                  <Star className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <h2 className="font-heading font-semibold text-lg">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mt-2 mb-5">
                <span className="text-4xl font-heading font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan !== null}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  plan.popular
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'border border-border hover:bg-secondary'
                }`}
              >
                {loadingPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loadingPlan === plan.id ? 'Redirecting...' : `Subscribe to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Secure checkout powered by Stripe. Cancel anytime. By subscribing, you agree to our{' '}
          <Link to="/legal" className="underline hover:text-foreground">Terms &amp; Subscription Agreement</Link>.
        </p>
      </div>
    </div>
  );
}