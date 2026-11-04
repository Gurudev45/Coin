import { useEffect, useState, useCallback } from 'react';
import { auditLogService } from '../services/services';
import type { AuditLog } from '../types';
import { format } from 'date-fns';
import { ScrollText, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'badge-emerald',
  LOGOUT: 'badge-amber',
  CUSTOMER_CREATED: 'badge-indigo',
  CUSTOMER_UPDATED: 'bg-sky-600/20 text-sky-300 border-sky-600/30',
  CUSTOMER_DELETED: 'badge-rose',
  PASSWORD_RESET: 'bg-violet-600/20 text-violet-300 border-violet-600/30',
  EXCEL_EXPORT: 'bg-teal-600/20 text-teal-300 border-teal-600/30',
  CSV_EXPORT: 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '50' };
      if (action) params.action = action;
      const res = await auditLogService.get(params);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, action]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actions = [
    'LOGIN','LOGOUT','CUSTOMER_CREATED','CUSTOMER_UPDATED','CUSTOMER_DELETED',
    'PASSWORD_RESET','EXCEL_EXPORT','CSV_EXPORT',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScrollText size={22} className="text-violet-400" />
            Audit Logs
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{pagination.total} total events tracked</p>
        </div>
        <div className="form-group min-w-[200px]">
          <select
            id="audit-action-filter"
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="select-field"
          >
            <option value="">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="table-header text-left">Timestamp</th>
                <th className="table-header text-left">Admin</th>
                <th className="table-header text-left">Action</th>
                <th className="table-header text-left">Customer</th>
                <th className="table-header text-left">IP Address</th>
                <th className="table-header text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      Loading audit logs...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <Shield size={32} className="mx-auto mb-3 opacity-30" />
                    No audit logs yet
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="table-cell text-xs text-slate-400">
                    {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                  </td>
                  <td className="table-cell text-indigo-300 font-mono text-xs">
                    {log.admin?.username || '—'}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${ACTION_COLORS[log.action] || 'badge-indigo'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-xs text-slate-400">
                    {log.customer?.idName || '—'}
                  </td>
                  <td className="table-cell font-mono text-xs text-slate-500">
                    {log.ipAddress || '—'}
                  </td>
                  <td className="table-cell text-xs text-slate-500 max-w-xs truncate">
                    {log.details ? (() => {
                      try { return JSON.stringify(JSON.parse(log.details)); }
                      catch { return log.details; }
                    })() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Page {page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-2 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn-secondary px-3 py-2 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
