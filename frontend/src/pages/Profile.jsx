import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { MapPin, Loader2, AlertCircle, User, Mail, CreditCard, LogOut, ArrowLeft, CheckCircle2, Key, ExternalLink } from 'lucide-react';

const PLAN_INFO = {
  standard: { name: 'Standard' },
  premium: { name: 'Premium' },
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    api.auth.me().then(u => {
      setUser(u);
      setGoogleApiKey(u?.google_api_key || '');
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    window.location.href = '/login';
  };

  const handleSaveApiKey = async () => {
    setSavingKey(true);
    setError('');
    try {
      await api.auth.updateMe({ google_api_key: googleApiKey.trim() });
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    } catch (err) {
      setError('Failed to save API key. Please try again.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordChanged(true);
      setTimeout(() => setPasswordChanged(false), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
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
        </div>

        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Change Password</h2>
          {passwordError && (
            <div className="mb-3 p-3 rounded-lg bg-destructive/10 text-sm text-destructive">{passwordError}</div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
              autoComplete="current-password"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="submit"
              disabled={changingPassword}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Update Password
            </button>
            {passwordChanged && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Password updated successfully.
              </p>
            )}
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Subscription</h2>
          {isAdmin ? (
            <p className="text-sm text-muted-foreground">Admin account — full access.</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium">{planInfo.name}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  isActive
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-border bg-secondary text-muted-foreground'
                }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Contact your administrator to change your plan.
              </p>
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

        {isAdmin && (
          <button
            onClick={() => navigate('/admin/users')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors mb-4"
          >
            <User className="w-4 h-4" />
            Manage Users
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}
