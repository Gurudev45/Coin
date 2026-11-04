import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/services';
import type { DashboardData } from '../types';
import { format } from 'date-fns';
import {
  Users, Coins, TrendingUp, TrendingDown, Wallet, ArrowRight,
  PiggyBank, Activity, UserPlus, RefreshCw,
} from 'lucide-react';

function StatCard({
  label, value, icon: Icon, color, subtext,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtext?: string;
}) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await dashboardService.get();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, recentCustomers = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Welcome back — here's an overview of your system</p>
        </div>
        <div className="flex gap-3">
          <button
            id="dashboard-refresh"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn-secondary"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            id="add-customer-quick"
            onClick={() => navigate('/customers/add')}
            className="btn-primary"
          >
            <UserPlus size={15} />
            Add ID
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total IDs"
          value={stats?.totalCustomers ?? 0}
          icon={Users}
          color="bg-indigo-600/20 text-indigo-400"
        />
        <StatCard
          label="Total Coin"
          value={stats?.totalCoin ?? 0}
          icon={Coins}
          color="bg-violet-600/20 text-violet-400"
        />
        <StatCard
          label="Balance Coin"
          value={stats?.totalBalanceCoin ?? 0}
          icon={Wallet}
          color="bg-sky-600/20 text-sky-400"
        />
        <StatCard
          label="Withdraw Coin"
          value={stats?.totalWithdrawCoin ?? 0}
          icon={TrendingDown}
          color="bg-amber-600/20 text-amber-400"
        />
        <StatCard
          label="Withdraw Fee"
          value={stats?.totalWithdrawFee ?? 0}
          icon={PiggyBank}
          color="bg-rose-600/20 text-rose-400"
        />
        <StatCard
          label="Remaining Coin"
          value={stats?.totalRemainingCoin ?? 0}
          icon={TrendingUp}
          color="bg-emerald-600/20 text-emerald-400"
        />
      </div>

      {/* Recent Customers */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Recent IDs</h2>
          </div>
          <button
            id="view-all-customers"
            onClick={() => navigate('/customers')}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        {recentCustomers.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p>No IDs yet. Add your first ID!</p>
          </div>
        ) : (
          <div className="table-container -mx-2">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="table-header text-left">ID</th>
                  <th className="table-header text-left">Mail ID</th>
                  <th className="table-header text-right">Fixed</th>
                  <th className="table-header text-right">Regular</th>
                  <th className="table-header text-right">Balance Coin</th>
                  <th className="table-header text-right">Remaining</th>
                  <th className="table-header text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((c: any, i) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >
                    <td className="table-cell font-mono font-medium text-indigo-300">{c.idName}</td>
                    <td className="table-cell text-slate-400">{c.mailId || '—'}</td>
                    <td className="table-cell text-right">
                      {c.fixedValue ? (
                        <span className="badge-indigo">{c.fixedValue}</span>
                      ) : '—'}
                    </td>
                    <td className="table-cell text-right">
                      {c.regularValue ? (
                        <span className="badge-emerald">{c.regularValue}</span>
                      ) : '—'}
                    </td>
                    <td className="table-cell text-right font-mono">{(c.balanceCoin ?? 0).toLocaleString()}</td>
                    <td className="table-cell text-right font-mono text-emerald-400">{(c.remainingCoin ?? 0).toLocaleString()}</td>
                    <td className="table-cell text-slate-400 text-xs">
                      {c.createdAt ? format(new Date(c.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
