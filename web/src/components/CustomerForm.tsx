import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { customerService } from '../services/services';
import type { Customer, CustomerFormData } from '../types';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Calculator } from 'lucide-react';

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
  isEdit?: boolean;
}



export default function CustomerForm({ customer, onSuccess, isEdit = false }: CustomerFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData & { password?: string }>({
    defaultValues: {
      id_name: customer?.idName ?? '',
      date: customer?.date ? customer.date.split('T')[0] : '',
      mail_id: customer?.mailId ?? '',
      m_date: customer?.mDate ? customer.mDate.split('T')[0] : '',
      fixed_value: customer?.fixedValue ?? undefined,
      regular_value: customer?.regularValue ?? undefined,
      combo_value: customer?.comboValue ?? undefined,
      arp: customer?.arp ?? undefined,
      balance_coin: customer?.balanceCoin ?? undefined,
      withdraw_coin: customer?.withdrawCoin ?? undefined,
      withdraw_fee: customer?.withdrawFee ?? undefined,
      net_coin: (customer as any)?.netCoin ?? undefined,
    },
  });

  const balanceCoin = watch('balance_coin') ? parseFloat(String(watch('balance_coin'))) : 0;
  const withdrawCoin = watch('withdraw_coin') ? parseFloat(String(watch('withdraw_coin'))) : 0;
  const withdrawFee = watch('withdraw_fee') ? parseFloat(String(watch('withdraw_fee'))) : 0;
  const rawRemaining = balanceCoin - withdrawCoin - withdrawFee;
  const remainingCoin = Math.round(rawRemaining * 100) / 100;
  const totalCoin = Math.round(balanceCoin * 100) / 100;

  const onSubmit = async (data: CustomerFormData & { password?: string }) => {
    setLoading(true);
    try {
      const payload = {
        id_name: data.id_name,
        date: data.date || undefined,
        mail_id: data.mail_id || undefined,
        m_date: data.m_date || undefined,
        fixed_value: data.fixed_value != null && data.fixed_value !== '' ? parseInt(String(data.fixed_value), 10) : null,
        regular_value: data.regular_value != null && data.regular_value !== '' ? parseInt(String(data.regular_value), 10) : null,
        combo_value: data.combo_value != null && data.combo_value !== '' ? parseInt(String(data.combo_value), 10) : null,
        arp: data.arp != null && data.arp !== '' ? parseFloat(String(data.arp)) : null,
        balance_coin: data.balance_coin != null && data.balance_coin !== '' ? parseFloat(String(data.balance_coin)) : 0,
        withdraw_coin: data.withdraw_coin != null && data.withdraw_coin !== '' ? parseFloat(String(data.withdraw_coin)) : 0,
        withdraw_fee: data.withdraw_fee != null && data.withdraw_fee !== '' ? parseFloat(String(data.withdraw_fee)) : 0,
        net_coin: data.net_coin != null && data.net_coin !== '' ? parseFloat(String(data.net_coin)) : 0,
        ...(!isEdit && data.password ? { password: data.password } : {}),
      };

      if (isEdit && customer) {
        await customerService.update(customer.id, payload);
        toast.success('Customer updated successfully');
      } else {
        await customerService.create(payload);
        toast.success('Customer created successfully');
      }
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0]?.msg
        || err.response?.data?.error
        || 'Operation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-indigo-500 rounded-full" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="field-id-name" className="label">ID Name *</label>
            <input
              id="field-id-name"
              {...register('id_name', { required: 'ID Name is required' })}
              className="input-field font-mono"
              placeholder="e.g. GURU001"
            />
            {errors.id_name && <p className="text-rose-400 text-xs mt-1">{errors.id_name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="field-mail-id" className="label">Mail ID</label>
            <input
              id="field-mail-id"
              type="email"
              {...register('mail_id', {
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
              })}
              className="input-field"
              placeholder="user@example.com"
            />
            {errors.mail_id && <p className="text-rose-400 text-xs mt-1">{errors.mail_id.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="field-date" className="label">Date</label>
            <input
              id="field-date"
              type="date"
              {...register('date')}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="field-m-date" className="label">M.Date</label>
            <input
              id="field-m-date"
              type="date"
              {...register('m_date')}
              className="input-field"
            />
          </div>

          {!isEdit && (
            <div className="form-group sm:col-span-2">
              <label htmlFor="field-password" className="label">Password</label>
              <div className="relative">
                <input
                  id="field-password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="input-field pr-11"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Selections */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-indigo-500 rounded-full" />
          Plan Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="field-fixed" className="label">Fixed</label>
            <select
              id="field-fixed"
              {...register('fixed_value')}
              className="select-field"
            >
              <option value="">— Select —</option>
              <option value="3">3</option>
              <option value="5">5</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="field-regular" className="label">Regular</label>
            <select
              id="field-regular"
              {...register('regular_value')}
              className="select-field"
            >
              <option value="">— Select —</option>
              <option value="60">60</option>
              <option value="55">55</option>
              <option value="50">50</option>
              <option value="45">45</option>
              <option value="40">40</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="field-combo" className="label">Combo</label>
            <select
              id="field-combo"
              {...register('combo_value')}
              className="select-field"
            >
              <option value="">— Select —</option>
              <option value="5">5</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>

        {/* ARP */}
        <div className="mt-4 max-w-xs">
          <div className="form-group">
            <label htmlFor="field-arp" className="label">ARP</label>
            <input
              id="field-arp"
              type="number"
              step="any"
              {...register('arp')}
              className="input-field"
              placeholder=""
            />
            {errors.arp && <p className="text-rose-400 text-xs mt-1">{errors.arp.message}</p>}
          </div>
        </div>
      </div>

      {/* Coin Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
          Coin Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="field-balance-coin" className="label">Balance Coin</label>
            <input
              id="field-balance-coin"
              type="number"
              step="any"
              {...register('balance_coin')}
              className="input-field font-mono"
              placeholder=""
            />
          </div>
          <div className="form-group">
            <label htmlFor="field-withdraw-coin" className="label">Withdraw Coin</label>
            <input
              id="field-withdraw-coin"
              type="number"
              step="any"
              {...register('withdraw_coin')}
              className="input-field font-mono"
              placeholder=""
            />
          </div>
          <div className="form-group">
            <label htmlFor="field-withdraw-fee" className="label">Withdraw Fee</label>
            <input
              id="field-withdraw-fee"
              type="number"
              step="any"
              {...register('withdraw_fee')}
              className="input-field font-mono"
              placeholder=""
            />
          </div>
          <div className="form-group">
            <label htmlFor="field-net-coin" className="label">Net Coin</label>
            <input
              id="field-net-coin"
              type="number"
              step="any"
              {...register('net_coin')}
              className="input-field font-mono"
              placeholder=""
            />
          </div>

          {/* Calculated fields */}
          <div className="form-group">
            <label className="label flex items-center gap-2">
              Remaining Coin
              <Calculator size={14} className="text-emerald-400" />
              <span className="text-xs text-slate-500">(auto)</span>
            </label>
            <div className="input-field font-mono bg-slate-700/30 text-emerald-400 cursor-not-allowed">
              {Number.isInteger(remainingCoin) ? remainingCoin : remainingCoin.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">= Balance − Withdraw − Fee</p>
          </div>

          <div className="form-group">
            <label className="label flex items-center gap-2">
              Total Coin
              <Calculator size={14} className="text-sky-400" />
              <span className="text-xs text-slate-500">(auto)</span>
            </label>
            <div className="input-field font-mono bg-slate-700/30 text-sky-400 cursor-not-allowed">
              {Number.isInteger(totalCoin) ? totalCoin : totalCoin.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">= Balance Coin</p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          id="customer-submit"
          type="submit"
          disabled={loading}
          className="btn-primary px-8"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : null}
          {isEdit ? 'Update ID' : 'Create ID'}
        </button>
      </div>
    </form>
  );
}
