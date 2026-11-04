import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerService } from '../services/services';
import type { Customer } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Pencil, KeyRound, Trash2, CheckCircle, XCircle,
  Coins, Mail, Calendar, Hash,
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import ResetPasswordModal from '../components/ResetPasswordModal';

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-800/50 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-slate-100 text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function CoinCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${color}`}>{value.toLocaleString()}</p>
    </div>
  );
}

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showResetPwd, setShowResetPwd] = useState(false);

  useEffect(() => {
    if (!id) return;
    customerService.getById(id)
      .then(res => setCustomer(res.data))
      .catch(() => { toast.error('Customer not found'); navigate('/customers'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await customerService.delete(id);
      toast.success('Customer deleted');
      navigate('/customers');
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/customers')} className="btn-secondary px-3 py-2">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white font-mono">{customer.idName}</h1>
            <p className="text-slate-400 text-sm mt-0.5">ID Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            id="customer-edit-btn"
            onClick={() => navigate(`/customers/${id}/edit`)}
            className="btn-secondary"
          >
            <Pencil size={15} />
            Edit
          </button>
          <button
            id="customer-reset-pwd-btn"
            onClick={() => setShowResetPwd(true)}
            className="btn-secondary"
          >
            <KeyRound size={15} />
            Reset Password
          </button>
          <button
            id="customer-delete-btn"
            onClick={() => setShowDelete(true)}
            className="btn-danger"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Hash size={14} className="text-indigo-400" />
            Basic Information
          </h2>
          <div>
            <InfoRow label="ID Name" value={<span className="font-mono text-indigo-300">{customer.idName}</span>} />
            <InfoRow label="Date" value={customer.date ? format(new Date(customer.date), 'MMM d, yyyy') : '—'} />
            <InfoRow label="Mail ID" value={
              customer.mailId ? (
                <a href={`mailto:${customer.mailId}`} className="text-indigo-300 hover:underline flex items-center gap-1">
                  <Mail size={13} />
                  {customer.mailId}
                </a>
              ) : '—'
            } />
            <InfoRow label="M.Date" value={customer.mDate ? format(new Date(customer.mDate), 'MMM d, yyyy') : '—'} />
            <InfoRow label="Password" value={
              customer.passwordStatus === 'Set' ? (
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={14} /> Set</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400"><XCircle size={14} /> Not Set</span>
              )
            } />
          </div>
        </div>

        {/* Plan Settings */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar size={14} className="text-violet-400" />
            Plan Settings
          </h2>
          <div>
            <InfoRow label="Fixed" value={
              customer.fixedValue != null ? (
                <span className="badge-indigo">{customer.fixedValue}</span>
              ) : '—'
            } />
            <InfoRow label="Regular" value={
              customer.regularValue != null ? (
                <span className="badge-emerald">{customer.regularValue}</span>
              ) : '—'
            } />
            <InfoRow label="Combo" value={
              customer.comboValue != null ? (
                <span className="badge-amber">{customer.comboValue}</span>
              ) : '—'
            } />
            <InfoRow label="ARP" value={customer.arp != null ? customer.arp : '—'} mono />
            <InfoRow label="Created" value={format(new Date(customer.createdAt), 'MMM d, yyyy HH:mm')} />
          </div>
        </div>
      </div>

      {/* Coin Information */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Coins size={14} className="text-emerald-400" />
          Coin Information
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <CoinCard label="Balance Coin" value={customer.balanceCoin ?? 0} color="text-sky-400" />
          <CoinCard label="Withdraw Coin" value={customer.withdrawCoin ?? 0} color="text-amber-400" />
          <CoinCard label="Withdraw Fee" value={customer.withdrawFee ?? 0} color="text-rose-400" />
          <CoinCard label="Remaining Coin" value={customer.remainingCoin ?? 0} color="text-emerald-400" />
          <CoinCard label="Total Coin" value={customer.totalCoin ?? 0} color="text-violet-400" />
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customer.idName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        danger
      />

      {showResetPwd && (
        <ResetPasswordModal
          customer={customer}
          onClose={() => setShowResetPwd(false)}
          onSuccess={() => setShowResetPwd(false)}
        />
      )}
    </div>
  );
}
