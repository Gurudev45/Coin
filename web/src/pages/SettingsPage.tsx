import { useAuth } from '../context/AuthContext';
import { Settings, User, Shield, Info } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings size={22} className="text-slate-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">System configuration and account information</p>
      </div>

      {/* Admin Profile */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <User size={14} className="text-indigo-400" />
          User Profile
        </h2>
        <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
            <span className="text-indigo-400 text-xl font-bold">
              {user?.idName?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold">{user?.idName}</p>
            <p className="text-slate-400 text-sm">{user?.mailId || 'No email set'}</p>
            <span className="badge-indigo mt-1">User</span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield size={14} className="text-emerald-400" />
          Security
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Authentication</span>
            <span className="text-slate-200">JWT + HTTP-only Cookies</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Password Hashing</span>
            <span className="text-slate-200">bcrypt (12 rounds)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Token Expiry</span>
            <span className="text-slate-200">7 days</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Audit Logging</span>
            <span className="text-emerald-400">Enabled</span>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Info size={14} className="text-sky-400" />
          System Information
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Application</span>
            <span className="text-slate-200">Coin Management System v1.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Backend</span>
            <span className="text-slate-200">Node.js + Express</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Database</span>
            <span className="text-slate-200">PostgreSQL + Prisma ORM</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Frontend</span>
            <span className="text-slate-200">React + TypeScript + Tailwind</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Mobile</span>
            <span className="text-slate-200">React Native + Expo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
