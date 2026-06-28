import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, AlertCircle, User, Mail, CreditCard, LogOut, X, ArrowLeft, CheckCircle2, Key, ExternalLink } from 'lucide-react';

const PLAN_INFO = {
  standard: { name: 'Standard', price: '$9.99/month' },
  premium: { name: 'Premium', price: '$19.99/month' },
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setGoogleApiKey(u?.google_api_key || '');
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleCancel = async () => {
    setCanceling(true);
    setError('');
    try {
      await base44.functions.invoke('cancel-subscription', {});
      setShowCancelConfirm(false);
      setCanceled(true);
      const updated = await base44.auth.me();
      setUser(updated);
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = '/login';
  };

  const handleSaveApiKey = async () => {
    setSavingKey(true);
    setError('');
    try {
      await base44.auth.updateMe({ google_api_key: googleApiKey.trim() });
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    } catch (err) {
      setError('Failed to save API key. Please try again.');
    } finally {
      setSavingKey(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  const plan = user?.subscription_plan || 'premium';
  const planInfo = PLAN_INFO[plan];
  const isActive = user?.subscription_status === 'active';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-foreground" />
            <span className="font-heading font-bold text-xl">MyLeadsMap</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-2xl font-heading font-bold mb-6">Profile</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-sm text-destructive flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {canceled && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-sm text-green-700 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Your subscription has been canceled. You'll lose access at the end of your billing period.</span>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{user?.full_name || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Key className="w-4 h-4" />
            Change Password
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Subscription</h2>
          {isAdmin ? (
            <p className="text-sm text-muted-foreground">Admin account — full access, no subscription required.</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium">{planInfo.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{planInfo.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  isActive
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-border bg-secondary text-muted-foreground'
                }`}>
                  {isActive ? 'Active' : 'Canceled'}
                </span>
              </div>
              {isActive && !canceled && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full mt-4 px-4 py-2.5 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </>
          )}
        </div>

        {plan === 'standard' && !isAdmin && (
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Google Maps API Key</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Standard plans use your own Google API key for business searches. Get a free key from{' '}
              <a
                href="https://mapsplatform.google.com/maps-demo-key/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline inline-flex items-center gap-0.5"
              >
                Google <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIza..."
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
              />
              <button
                onClick={handleSaveApiKey}
                disabled={savingKey || googleApiKey.trim() === (user?.google_api_key || '').trim()}
                className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {savingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
            {keySaved && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                API key saved successfully.
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowCancelConfirm(false)}>
          <div className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold">Cancel Subscription?</h3>
              <button onClick={() => setShowCancelConfirm(false)} className="p-1 rounded-md hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              You'll lose access to MyLeadsMap at the end of your current billing period. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {canceling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}