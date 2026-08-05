import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { ArrowLeft, Loader2, AlertCircle, Plus, KeyRound, X, Check, Mail, UserPlus, UserX, Trash2, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STAGES, ACTION_TYPES } from '@/lib/leadConfig';

const emptyForm = { email: '', password: '', full_name: '', role: 'user', subscription_plan: 'premium', subscription_status: 'active' };
const emptyExportForm = { email: '', stage: 'all', action_type: 'all', category: '', date_from: '', date_to: '', format: 'csv' };

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [fromRequestId, setFromRequestId] = useState(null);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [exportForm, setExportForm] = useState(emptyExportForm);
  const [exporting, setExporting] = useState(false);

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
        await api.admin.deleteSignupRequest(fromRequestId);
        setRequests((prev) => prev.filter((r) => r.id !== fromRequestId));
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
    const draft = passwordDrafts[id] || '';
    if (draft && draft.length < 8) {
      setError('Password must be at least 8 characters (or leave it blank to generate one).');
      return;
    }
    setError('');
    try {
      const result = await api.admin.resetPassword(id, draft);
      setResetResult({ id, password: draft || result.temporaryPassword });
      setPasswordDrafts((prev) => ({ ...prev, [id]: '' }));
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleRemoveUser = async (user) => {
    if (!window.confirm(`Remove ${user.email}? This also permanently deletes all of their leads. This cannot be undone.`)) {
      return;
    }
    setError('');
    try {
      await api.admin.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err.message || 'Failed to remove user');
    }
  };

  const handleCreateFromRequest = (request) => {
    setForm({ ...emptyForm, email: request.email, full_name: request.name });
    setFromRequestId(request.id);
    setShowCreate(true);
  };

  const handleDenyRequest = async (id) => {
    setError('');
    try {
      await api.admin.deleteSignupRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to deny request');
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();
    if (!exportForm.email) return;
    setError('');
    setExporting(true);
    try {
      const { blob, filename } = await api.admin.exportLeads({
        email: exportForm.email,
        stage: exportForm.stage === 'all' ? undefined : exportForm.stage,
        action_type: exportForm.action_type === 'all' ? undefined : exportForm.action_type,
        category: exportForm.category || undefined,
        date_from: exportForm.date_from || undefined,
        date_to: exportForm.date_to || undefined,
        format: exportForm.format,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Failed to export leads');
    } finally {
      setExporting(false);
    }
  };

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
          {requests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-foreground text-background text-xs">{requests.length} new</span>
          )}
        </h2>
        {loadingRequests ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground pb-4">No pending requests.</p>
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
                <div className="flex flex-col items-stretch gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleCreateFromRequest(r)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:bg-foreground/90 whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Create Account
                  </button>
                  <button
                    onClick={() => handleDenyRequest(r.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/5 whitespace-nowrap"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Deny Request
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
                <th className="py-3 pr-4 font-medium"></th>
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
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Set password (blank = random)"
                          value={passwordDrafts[u.id] || ''}
                          onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          className="w-44 px-2 py-1.5 text-xs rounded-lg border border-border bg-background"
                        />
                        <button
                          onClick={() => handleResetPassword(u.id)}
                          title={passwordDrafts[u.id] ? 'Set this password for the user' : 'Generate a random password'}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary whitespace-nowrap"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Set
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => handleRemoveUser(u)}
                      title="Remove user"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/5 whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-6 pb-6">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Download className="w-4 h-4" />
          Export Leads
        </h2>
        <form onSubmit={handleExport} className="p-4 rounded-xl border border-border bg-card grid grid-cols-2 gap-3">
          <select
            required
            value={exportForm.email}
            onChange={(e) => setExportForm({ ...exportForm, email: e.target.value })}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background col-span-2"
          >
            <option value="" disabled>Select a user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.email}>{u.email}</option>
            ))}
          </select>

          <Select value={exportForm.stage} onValueChange={(v) => setExportForm({ ...exportForm, stage: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Stage</SelectItem>
              {Object.entries(STAGES).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={exportForm.action_type} onValueChange={(v) => setExportForm({ ...exportForm, action_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Last Action</SelectItem>
              {Object.entries(ACTION_TYPES).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="text"
            placeholder="Business category (optional, e.g. restaurant)"
            value={exportForm.category}
            onChange={(e) => setExportForm({ ...exportForm, category: e.target.value })}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background col-span-2"
          />

          <div>
            <label className="text-xs text-muted-foreground">Last action from</label>
            <input
              type="date"
              value={exportForm.date_from}
              onChange={(e) => setExportForm({ ...exportForm, date_from: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-background"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Last action to</label>
            <input
              type="date"
              value={exportForm.date_to}
              onChange={(e) => setExportForm({ ...exportForm, date_to: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-background"
            />
          </div>

          <Select value={exportForm.format} onValueChange={(v) => setExportForm({ ...exportForm, format: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={exporting || !exportForm.email}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
