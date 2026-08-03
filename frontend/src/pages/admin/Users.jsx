import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { ArrowLeft, Loader2, AlertCircle, Plus, KeyRound, X, Check, Mail, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const emptyForm = { email: '', password: '', full_name: '', role: 'user', subscription_plan: 'premium', subscription_status: 'active' };

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [fromRequestId, setFromRequestId] = useState(null);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await api.admin.listUsers();
      setUsers(result);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const result = await api.admin.listSignupRequests();
      setRequests(result);
    } catch (err) {
      setError(err.message || 'Failed to load signup requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => { loadUsers(); loadRequests(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await api.admin.createUser(form);
      if (fromRequestId) {
        await api.admin.updateSignupRequest(fromRequestId, 'created');
        setRequests((prev) => prev.map((r) => (r.id === fromRequestId ? { ...r, status: 'created' } : r)));
      }
      setForm(emptyForm);
      setFromRequestId(null);
      setShowCreate(false);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id, data) => {
    setError('');
    try {
      const updated = await api.admin.updateUser(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleResetPassword = async (id) => {
    setError('');
    try {
      const result = await api.admin.resetPassword(id, '');
      setResetResult({ id, password: result.temporaryPassword });
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleRequestStatus = async (id, status) => {
    setError('');
    try {
      const updated = await api.admin.updateSignupRequest(id, status);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err.message || 'Failed to update request');
    }
  };

  const handleCreateFromRequest = (request) => {
    setForm({ ...emptyForm, email: request.email, full_name: request.name });
    setFromRequestId(request.id);
    setShowCreate(true);
  };

  const pendingRequests = requests.filter((r) => r.status === 'new');

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Manage Users</h1>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setFromRequestId(null); setShowCreate((v) => !v); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90"
        >
          <Plus className="w-4 h-4" />
          New User
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-destructive/10 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="mx-6 mt-4 p-4 rounded-xl border border-border bg-card grid grid-cols-2 gap-3">
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
          />
          <input
            required
            type="text"
            placeholder="Temporary password (min 8 chars)"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
          />
          <input
            type="text"
            placeholder="Full name (optional)"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
          />
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.subscription_plan} onValueChange={(v) => setForm({ ...form, subscription_plan: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.subscription_status} onValueChange={(v) => setForm({ ...form, subscription_status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="col-span-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowCreate(false); setFromRequestId(null); }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create
            </button>
          </div>
        </form>
      )}

      <div className="px-6 pt-6">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4" />
          Signup Requests
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-foreground text-background text-xs">{pendingRequests.length} new</span>
          )}
        </h2>
        {loadingRequests ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground pb-4">No one has requested access yet.</p>
        ) : (
          <div className="space-y-2 pb-4">
            {requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{r.name}</span>
                    <span className="text-sm text-muted-foreground">{r.email}</span>
                    {r.company && <span className="text-xs text-muted-foreground">· {r.company}</span>}
                  </div>
                  {r.message && <p className="text-sm text-muted-foreground mt-1">{r.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_date).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={r.status} onValueChange={(v) => handleRequestStatus(r.id, v)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => handleCreateFromRequest(r)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:bg-foreground/90 whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Create Account
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 px-6 py-4">
        <h2 className="text-sm font-semibold mb-3">Users</h2>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Role</th>
                <th className="py-3 pr-4 font-medium">Plan</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Password</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border">
                  <td className="py-3 pr-4 font-medium">{u.email}</td>
                  <td className="py-3 pr-4">
                    <Select value={u.role} onValueChange={(v) => handleUpdate(u.id, { role: v })}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 pr-4">
                    <Select value={u.subscription_plan} onValueChange={(v) => handleUpdate(u.id, { subscription_plan: v })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 pr-4">
                    <Select value={u.subscription_status} onValueChange={(v) => handleUpdate(u.id, { subscription_status: v })}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 pr-4">
                    {resetResult?.id === u.id ? (
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-secondary rounded text-xs">{resetResult.password}</code>
                        <button onClick={() => setResetResult(null)} className="p-1 rounded hover:bg-secondary">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleResetPassword(u.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Reset Password
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
