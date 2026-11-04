import { useState } from 'react';
import { customerService } from '../services/services';
import type { Customer } from '../types';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound, X } from 'lucide-react';

interface ResetPasswordModalProps {
  customer: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordModal({ customer, onClose, onSuccess }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await customerService.resetPassword(customer.id, newPassword);
      toast.success('Password reset successfully');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <KeyRound size={18} className="text-amber-400" />
            Reset Password
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={16} />
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-5">
          Reset password for <span className="text-indigo-300 font-mono font-medium">{customer.idName}</span>
        </p>

        <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="new-password-field" className="label">New Password</label>
            <div className="relative">
              <input
                id="new-password-field"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                className="input-field pr-11"
                placeholder="Minimum 6 characters"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              id="reset-password-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
