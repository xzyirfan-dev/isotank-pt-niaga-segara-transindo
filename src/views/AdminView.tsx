import React, { useState } from 'react';
import { Settings, Users, Truck, Shield, AlertCircle, Edit, Plus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Asset, User } from '../types';

export const AdminView: React.FC = () => {
  const { assets, users, updateAssetStatus, currentUser } = useApp();
  const [adminTab, setAdminTab] = useState<'assets' | 'users' | 'sla'>('assets');

  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<Asset | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <Settings className="w-6 h-6 text-teal-400" />
            <span>Manajemen Pengguna, Hak Akses & Armada Isotank</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi parameter SLA, hak akses pengguna (RBAC), dan pemeliharaan aset isotank PT Niaga Segara Trasindo.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 text-xs">
        <button
          onClick={() => setAdminTab('assets')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            adminTab === 'assets' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Kelola Armada Isotank ({assets.length})
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            adminTab === 'users' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Hak Akses Pengguna RBAC ({users.length})
        </button>
        <button
          onClick={() => setAdminTab('sla')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            adminTab === 'sla' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Parameter SLA & Retensi Data
        </button>
      </div>

      {/* TAB 1: ASSETS MANAGEMENT */}
      {adminTab === 'assets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm">Daftar Unit Isotank Resmi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((ast) => (
              <div key={ast.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-300 font-mono text-sm">{ast.code}</span>
                  <select
                    value={ast.status}
                    onChange={(e) => updateAssetStatus(ast.id, e.target.value as any)}
                    className={`px-2 py-1 rounded text-[11px] font-bold border ${
                      ast.status === 'Tersedia' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      ast.status === 'Beroperasi' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' :
                      ast.status === 'Perawatan' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Beroperasi">Beroperasi</option>
                    <option value="Perawatan">Perawatan</option>
                    <option value="Inspeksi">Inspeksi</option>
                  </select>
                </div>

                <div className="text-slate-300">
                  <div>Tipe: <strong className="text-slate-100">{ast.type}</strong></div>
                  <div>Kapasitas: <span className="text-slate-400">{ast.capacity}</span></div>
                  <div>Lokasi Depo: <span className="text-slate-400">{ast.location}</span></div>
                  <div>Inspeksi Terakhir: <span className="text-slate-400 font-mono">{ast.lastInspectionDate}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USERS RBAC */}
      {adminTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-sm">Matriks Akses & Peran Karyawan (RBAC)</h3>
          
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border border-slate-600 object-cover" />
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{u.name}</div>
                    <div className="text-slate-400">{u.email} · {u.department}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 uppercase font-bold">
                    {u.role}
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aktif</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SLA */}
      {adminTab === 'sla' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 text-xs text-slate-300">
          <h3 className="font-bold text-slate-100 text-sm">Konfigurasi Target SLA Operasional</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700">
              <label className="block font-bold text-slate-200 mb-1">Standard SLA Pengiriman Jawa-Bali:</label>
              <input type="number" defaultValue={48} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 w-full" />
              <span className="text-[11px] text-slate-400">Target waktu ketibaan default (Jam).</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700">
              <label className="block font-bold text-slate-200 mb-1">Standard SLA Pengiriman Sumatra & Kalimantan:</label>
              <input type="number" defaultValue={120} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 w-full" />
              <span className="text-[11px] text-slate-400">Target waktu ketibaan antar-pulau (Jam).</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
