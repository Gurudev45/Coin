import { useEffect, useState } from 'react';
import { reportService } from '../services/services';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { BarChart3, TrendingDown, TrendingUp, Users, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await reportService.get(params);
      setData(res.data);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const { summary, fixedDistribution = [], regularDistribution = [], comboDistribution = [], monthlyCounts = [] } = data || {};

  const summaryCards = [
    { label: 'Total IDs', value: summary?.totalCustomers ?? 0, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-600/20' },
    { label: 'Total Coin', value: (summary?.totalCoin ?? 0).toLocaleString(), icon: Coins, color: 'text-violet-400', bg: 'bg-violet-600/20' },
    { label: 'Balance Coin', value: (summary?.totalBalanceCoin ?? 0).toLocaleString(), icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-600/20' },
    { label: 'Withdraw Coin', value: (summary?.totalWithdrawCoin ?? 0).toLocaleString(), icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-600/20' },
    { label: 'Withdraw Fee', value: (summary?.totalWithdrawFee ?? 0).toLocaleString(), icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-600/20' },
    { label: 'Remaining Coin', value: (summary?.totalRemainingCoin ?? 0).toLocaleString(), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-600/20' },
  ];

  const monthlyData = monthlyCounts.map((m: any) => ({
    month: new Date(m.month).toLocaleString('default', { month: 'short', year: '2-digit' }),
    count: Number(m.count),
  }));

  const fixedPieData = fixedDistribution.map((d: any) => ({
    name: `Fixed ${d.fixedValue}`,
    value: d._count.id,
  }));

  const regularBarData = regularDistribution.map((d: any) => ({
    name: `Regular ${d.regularValue}`,
    count: d._count.id,
    coins: d._sum.totalCoin || 0,
  }));

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '13px',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={22} className="text-indigo-400" />
            Reports
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Analytics and coin distribution insights</p>
        </div>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="label text-xs">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label text-xs">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field" />
          </div>
          <button onClick={fetchReports} className="btn-primary">Apply</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-slate-400 text-xs font-medium">{label}</p>
            <p className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Customer Activity */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-5">Monthly Customer Activity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="IDs" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Fixed Distribution */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-5">Fixed Plan Distribution</h3>
            {fixedPieData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-slate-500">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={fixedPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {fixedPieData.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Regular Distribution */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-5">Regular Plan — ID Count</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regularBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="IDs" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Combo Distribution */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-5">Combo Plan Distribution</h3>
            {comboDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-slate-500">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comboDistribution.map((d: any) => ({
                  name: `Combo ${d.comboValue}`,
                  count: d._count.id,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="IDs" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
