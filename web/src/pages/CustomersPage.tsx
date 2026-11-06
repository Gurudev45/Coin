import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../services/services';
import type { Customer, Pagination } from '../types';
import { FIXED_OPTIONS, REGULAR_OPTIONS, COMBO_OPTIONS } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Search, Plus, Eye, Pencil, Trash2, KeyRound, ChevronLeft,
  ChevronRight, Filter, X, RefreshCw, ArrowUpDown,
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import ResetPasswordModal from '../components/ResetPasswordModal';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterFixed, setFilterFixed] = useState('');
  const [filterRegular, setFilterRegular] = useState('');
  const [filterCombo, setFilterCombo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetPwdCustomer, setResetPwdCustomer] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll({
        page,
        limit: 20,
        search,
        sortBy,
        sortOrder,
        ...(filterFixed && { fixedValue: Number(filterFixed) }),
        ...(filterRegular && { regularValue: Number(filterRegular) }),
        ...(filterCombo && { comboValue: Number(filterCombo) }),
      });
      setCustomers(res.data.customers);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder, filterFixed, filterRegular, filterCombo]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await customerService.delete(deleteId);
      toast.success('Customer deleted');
      setDeleteId(null);
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterFixed('');
    setFilterRegular('');
    setFilterCombo('');
    setPage(1);
  };

  const hasFilters = search || filterFixed || filterRegular || filterCombo;

  const SortBtn = ({ field }: { field: string }) => (
    <button onClick={() => handleSort(field)} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
      <ArrowUpDown size={12} className={sortBy === field ? 'text-indigo-400' : ''} />
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">IDs</h1>
          <p className="text-slate-400 text-sm mt-0.5">{pagination.total} total IDs</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchCustomers()} className="btn-secondary">
            <RefreshCw size={15} />
          </button>
          <button
            id="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${hasFilters ? 'border-indigo-500/50 text-indigo-300' : ''}`}
          >
            <Filter size={15} />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-indigo-400 rounded-full" />}
          </button>
          <button
            id="add-customer-btn"
            onClick={() => navigate('/customers/add')}
            className="btn-primary"
          >
            <Plus size={15} />
            Add ID
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="customer-search"
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ID Name or Mail ID..."
            className="input-field pl-11"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="label text-xs">Fixed</label>
              <select
                id="filter-fixed"
                value={filterFixed}
                onChange={(e) => { setFilterFixed(e.target.value); setPage(1); }}
                className="select-field"
              >
                <option value="">All</option>
                {FIXED_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Regular</label>
              <select
                id="filter-regular"
                value={filterRegular}
                onChange={(e) => { setFilterRegular(e.target.value); setPage(1); }}
                className="select-field"
              >
                <option value="">All</option>
                {REGULAR_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Combo</label>
              <select
                id="filter-combo"
                value={filterCombo}
                onChange={(e) => { setFilterCombo(e.target.value); setPage(1); }}
                className="select-field"
              >
                <option value="">All</option>
                {COMBO_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters} className="btn-secondary w-full justify-center">
                <X size={14} /> Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="table-header text-left cursor-pointer" onClick={() => handleSort('idName')}>
                  ID Name <SortBtn field="idName" />
                </th>
                <th className="table-header text-left">Date</th>
                <th className="table-header text-left">Mail ID</th>
                <th className="table-header text-left">M.Date</th>
                <th className="table-header text-center">Fixed</th>
                <th className="table-header text-center">Regular</th>
                <th className="table-header text-center">Combo</th>
                <th className="table-header text-right">ARP</th>
                <th className="table-header text-right cursor-pointer" onClick={() => handleSort('balanceCoin')}>
                  Balance <SortBtn field="balanceCoin" />
                </th>
                <th className="table-header text-right">Withdraw</th>
                <th className="table-header text-right">Fee</th>
                <th className="table-header text-right">Net Coin</th>
                <th className="table-header text-right cursor-pointer" onClick={() => handleSort('remainingCoin')}>
                  Remaining <SortBtn field="remainingCoin" />
                </th>
                <th className="table-header text-right">Total</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={15} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      Loading IDs...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-12 text-slate-500">
                    No IDs found
                  </td>
                </tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="table-cell font-mono font-semibold text-indigo-300">{c.idName}</td>
                  <td className="table-cell text-slate-400 text-xs">{c.date ? format(new Date(c.date), 'MMM d, yy') : '—'}</td>
                  <td className="table-cell text-slate-400 text-xs">{c.mailId || '—'}</td>
                  <td className="table-cell text-slate-400 text-xs">{c.mDate ? format(new Date(c.mDate), 'MMM d, yy') : '—'}</td>
                  <td className="table-cell text-center">
                    {c.fixedValue != null ? <span className="badge-indigo">{c.fixedValue}</span> : '—'}
                  </td>
                  <td className="table-cell text-center">
                    {c.regularValue != null ? <span className="badge-emerald">{c.regularValue}</span> : '—'}
                  </td>
                  <td className="table-cell text-center">
                    {c.comboValue != null ? <span className="badge-amber">{c.comboValue}</span> : '—'}
                  </td>
                  <td className="table-cell text-right font-mono text-sm">{c.arp ?? '—'}</td>
                  <td className="table-cell text-right font-mono">{(c.balanceCoin ?? 0).toLocaleString()}</td>
                  <td className="table-cell text-right font-mono text-amber-400">{(c.withdrawCoin ?? 0).toLocaleString()}</td>
                  <td className="table-cell text-right font-mono text-rose-400">{(c.withdrawFee ?? 0).toLocaleString()}</td>
                  <td className="table-cell text-right font-mono text-teal-400">{(c.netCoin ?? 0).toLocaleString()}</td>
                  <td className="table-cell text-right font-mono text-emerald-400 font-semibold">{(c.remainingCoin ?? 0).toLocaleString()}</td>
                  <td className="table-cell text-right font-mono">{(c.totalCoin ?? 0).toLocaleString()}</td>
                  <td className="table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="View"
                        onClick={() => navigate(`/customers/${c.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => navigate(`/customers/${c.id}/edit`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        title="Reset Password"
                        onClick={() => setResetPwdCustomer(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setDeleteId(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-2 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-300 px-2">
                {page} / {pagination.totalPages}
              </span>
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

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        danger
      />

      {/* Reset Password Modal */}
      {resetPwdCustomer && (
        <ResetPasswordModal
          customer={resetPwdCustomer}
          onClose={() => setResetPwdCustomer(null)}
          onSuccess={() => { setResetPwdCustomer(null); toast.success('Password reset successfully'); }}
        />
      )}
    </div>
  );
}
