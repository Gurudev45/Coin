import api from './api';
import type { CustomerFormData, CustomerFilters } from '../types';

export const customerService = {
  getAll: (filters: CustomerFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    return api.get(`/customers?${params.toString()}`);
  },

  getById: (id: string) => api.get(`/customers/${id}`),

  create: (data: CustomerFormData) => api.post('/customers', data),

  update: (id: string, data: Partial<CustomerFormData>) => api.put(`/customers/${id}`, data),

  delete: (id: string) => api.delete(`/customers/${id}`),

  resetPassword: (id: string, newPassword: string) =>
    api.post(`/customers/${id}/reset-password`, { new_password: newPassword }),
};

export const dashboardService = {
  get: () => api.get('/dashboard'),
};

export const reportService = {
  get: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/reports?${params.toString()}`);
  },
};

export const exportService = {
  excel: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/export/excel?${params.toString()}`, { responseType: 'blob' });
  },

  csv: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/export/csv?${params.toString()}`, { responseType: 'blob' });
  },
};

export const auditLogService = {
  get: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params);
    return api.get(`/audit-logs?${query.toString()}`);
  },
};

export const authService = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 1000);
}
