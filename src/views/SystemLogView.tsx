import React, { useState } from 'react';
import { FileText, Search, ShieldCheck, Download, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SystemLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    if (roleFilter !== 'all' && log.user_role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.log_number.toLowerCase().includes(q) ||
        log.user_name.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.timestamp.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-teal-400" />
            <span>Audit Trail Log Sistem (Append-Only)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Riwayat log sistem resmi yang mencatat setiap perubahan status, pengunggahan dokumen, dan persetujuan lengkap dengan jam detik & nomor LOG.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nomor Log (e.g. LOG-0001), Nama Pengguna, Aksi..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-semibold">Filter Peran:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">Semua Peran</option>
            <option value="karyawan">Karyawan</option>
            <option value="manager">Manager</option>
            <option value="reviewer">Reviewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-3.5">Nomor Log</th>
                <th className="p-3.5">Waktu Lengkap (Detik)</th>
                <th className="p-3.5">Pengguna & Peran</th>
                <th className="p-3.5">Aksi Sistem</th>
                <th className="p-3.5">Entitas Target</th>
                <th className="p-3.5">Detail Catatan Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    Tidak ada catatan log sistem yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-teal-400">{log.log_number}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{log.user_name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{log.user_role}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {log.entity} #{log.entity_id}
                    </td>
                    <td className="p-3.5 text-slate-300 leading-relaxed">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
