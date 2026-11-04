import { useState } from 'react';
import { exportService, downloadBlob } from '../services/services';
import toast from 'react-hot-toast';
import { FileSpreadsheet, FileText, Download, Filter } from 'lucide-react';
import { FIXED_OPTIONS, REGULAR_OPTIONS, COMBO_OPTIONS } from '../types';

export default function ExportPage() {
  const [loading, setLoading] = useState<'excel' | 'csv' | null>(null);
  const [search, setSearch] = useState('');
  const [filterFixed, setFilterFixed] = useState('');
  const [filterRegular, setFilterRegular] = useState('');
  const [filterCombo, setFilterCombo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const getFilters = () => {
    const f: Record<string, string> = {};
    if (search) f.search = search;
    if (filterFixed) f.fixedValue = filterFixed;
    if (filterRegular) f.regularValue = filterRegular;
    if (filterCombo) f.comboValue = filterCombo;
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;
    return f;
  };

  const handleExcelExport = async () => {
    setLoading('excel');
    try {
      const res = await exportService.excel(getFilters());
      downloadBlob(res.data, `customers_${Date.now()}.xlsx`);
      toast.success('Excel file downloaded');
    } catch {
      toast.error('Excel export failed');
    } finally {
      setLoading(null);
    }
  };

  const handleCsvExport = async () => {
    setLoading('csv');
    try {
      const res = await exportService.csv(getFilters());
      downloadBlob(res.data, `customers_${Date.now()}.csv`);
      toast.success('CSV file downloaded');
    } catch {
      toast.error('CSV export failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileSpreadsheet size={22} className="text-emerald-400" />
          Export
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Download ID data as Excel or CSV</p>
      </div>

      {/* Filters */}
      <div className="card space-y-5">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          Export Filters
        </h2>

        <div className="form-group">
          <label className="label">Search (ID Name / Mail ID)</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            placeholder="Leave blank to export all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="label">Fixed</label>
            <select value={filterFixed} onChange={(e) => setFilterFixed(e.target.value)} className="select-field">
              <option value="">All</option>
              {FIXED_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Regular</label>
            <select value={filterRegular} onChange={(e) => setFilterRegular(e.target.value)} className="select-field">
              <option value="">All</option>
              {REGULAR_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Combo</label>
            <select value={filterCombo} onChange={(e) => setFilterCombo(e.target.value)} className="select-field">
              <option value="">All</option>
              {COMBO_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field" />
          </div>
          <div className="form-group">
            <label className="label">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card hover:border-emerald-600/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
              <FileSpreadsheet size={22} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Excel (.xlsx)</h3>
              <p className="text-slate-400 text-xs">With formatting, filters & frozen header</p>
            </div>
          </div>
          <ul className="text-xs text-slate-500 space-y-1 mb-5">
            <li>✓ Styled header row</li>
            <li>✓ Auto-filter enabled</li>
            <li>✓ Frozen header row</li>
            <li>✓ Numeric formatting</li>
            <li>✓ Password status (Set/Not Set)</li>
          </ul>
          <button
            id="export-excel-btn"
            onClick={handleExcelExport}
            disabled={loading !== null}
            className="btn-success w-full justify-center"
          >
            {loading === 'excel' ? (
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : <Download size={16} />}
            Export as Excel
          </button>
        </div>

        <div className="card hover:border-sky-600/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-sky-600/20 rounded-xl flex items-center justify-center">
              <FileText size={22} className="text-sky-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">CSV (.csv)</h3>
              <p className="text-slate-400 text-xs">Plain text, compatible with all tools</p>
            </div>
          </div>
          <ul className="text-xs text-slate-500 space-y-1 mb-5">
            <li>✓ All customer fields</li>
            <li>✓ Password status (Set/Not Set)</li>
            <li>✓ No password hashes</li>
            <li>✓ UTF-8 encoded</li>
            <li>✓ RFC 4180 compliant</li>
          </ul>
          <button
            id="export-csv-btn"
            onClick={handleCsvExport}
            disabled={loading !== null}
            className="btn-secondary w-full justify-center border-sky-600/30 text-sky-300 hover:bg-sky-600/20"
          >
            {loading === 'csv' ? (
              <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            ) : <Download size={16} />}
            Export as CSV
          </button>
        </div>
      </div>

      {/* Exported columns info */}
      <div className="card bg-slate-800/30">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Exported Columns</h3>
        <div className="flex flex-wrap gap-2">
          {['ID Name','Date','Mail ID','M.Date','Password Status','Fixed','Regular','Combo','ARP','Balance Coin','Withdraw Coin','Withdraw Fee','Remaining Coin','Total Coin'].map(col => (
            <span key={col} className="badge bg-slate-700/50 text-slate-300 border-slate-600/50">{col}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
