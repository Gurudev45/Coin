import api from './api';

export const authService = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const customerService = {
  getAll: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
    return api.get(`/customers?${query.toString()}`);
  },
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/customers/${id}/reset-password`, { new_password: newPassword }),
};

export const dashboardService = {
  get: () => api.get('/dashboard'),
};

export const reportService = {
  get: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params);
    return api.get(`/reports?${q.toString()}`);
  },
};
