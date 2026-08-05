const TOKEN_KEY = 'myleadsmap_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    async loginViaEmailPassword(email, password) {
      const { token, user } = await request('/auth/login', { method: 'POST', body: { email, password } });
      setToken(token);
      return user;
    },
    me: () => request('/auth/me'),
    updateMe: (data) => request('/auth/me', { method: 'PATCH', body: data }),
    changePassword: (currentPassword, newPassword) =>
      request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
    logout: () => {
      setToken(null);
    },
    isAuthenticated: () => Boolean(getToken()),
  },
  entities: {
    Lead: {
      list: (_sort, limit) => request(`/leads?limit=${limit || 200}`),
      create: (data) => request('/leads', { method: 'POST', body: data }),
      update: (id, data) => request(`/leads/${id}`, { method: 'PATCH', body: data }),
      delete: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
      deleteMany: (ids) => request('/leads', { method: 'DELETE', body: { ids } }),
    },
  },
  functions: {
    async invoke(name, payload) {
      if (name === 'googlePlaces') {
        const data = await request('/places', { method: 'POST', body: payload });
        return { data };
      }
      throw new Error(`Unknown function: ${name}`);
    },
  },
  admin: {
    listUsers: () => request('/admin/users'),
    createUser: (data) => request('/admin/users', { method: 'POST', body: data }),
    updateUser: (id, data) => request(`/admin/users/${id}`, { method: 'PATCH', body: data }),
    resetPassword: (id, newPassword) =>
      request(`/admin/users/${id}/reset-password`, { method: 'POST', body: { newPassword } }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    listSignupRequests: () => request('/admin/signup-requests'),
    deleteSignupRequest: (id) => request(`/admin/signup-requests/${id}`, { method: 'DELETE' }),
    async exportLeads(params) {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
      ).toString();
      const token = getToken();
      const res = await fetch(`/api/admin/leads/export?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const data = await res.json();
          message = data?.error || message;
        } catch {
          // no JSON body
        }
        const error = new Error(message);
        error.status = res.status;
        throw error;
      }
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : 'leads-export.json';
      const blob = await res.blob();
      return { blob, filename };
    },
  },
  signupRequests: {
    create: (data) => request('/signup-requests', { method: 'POST', body: data }),
  },
};
