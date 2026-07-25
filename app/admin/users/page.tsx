'use client';

import { useEffect, useState, useCallback } from 'react';

interface Session {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  loginAt: string;
  logoutAt: string | null;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const [sessions,   setSessions]   = useState<Session[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<'all' | 'active'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchSessions = useCallback(async () => {
    const res  = await fetch('/api/sessions');
    const data = await res.json();
    if (data.success) { setSessions(data.data); setLastUpdate(new Date()); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
    const i = setInterval(fetchSessions, 20_000);
    return () => clearInterval(i);
  }, [fetchSessions]);

  const displayed = filter === 'active'
    ? sessions.filter(s => s.isActive)
    : sessions;

  const activeCount = sessions.filter(s => s.isActive).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pengguna</h1>
          <p className="text-xs text-gray-600 mt-1">
            {activeCount} sesi aktif · Auto-refresh setiap 20 detik · {lastUpdate.toLocaleTimeString('id-ID')}
          </p>
        </div>
        <button onClick={fetchSessions}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl border border-gray-700 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Sesi', value: sessions.length, color: 'text-gray-300' },
          { label: 'Sesi Aktif', value: activeCount, color: 'text-emerald-400' },
          { label: 'Sesi Berakhir', value: sessions.filter(s => !s.isActive).length, color: 'text-gray-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}>
            {f === 'all' ? 'Semua Sesi' : 'Aktif Saja'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-600 uppercase tracking-wider border-b border-gray-800">
              {['Pengguna','Email','Login','Logout','Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-600">Memuat...</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-600">Belum ada sesi.</td></tr>
            ) : displayed.map(s => (
              <tr key={s.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {s.userName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-gray-200 font-medium">{s.userName}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">{s.userEmail}</td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {new Date(s.loginAt).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </td>
                <td className="px-5 py-4 text-gray-600 text-xs">
                  {s.logoutAt
                    ? new Date(s.logoutAt).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
                    : '—'}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    s.isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-800 text-gray-600'
                  }`}>
                    {s.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/>}
                    {s.isActive ? 'Aktif' : 'Berakhir'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
