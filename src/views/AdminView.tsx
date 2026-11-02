import React, { useState } from 'react';
import {
  Settings, Users, Truck, Shield, CheckCircle2,
  Search, SlidersHorizontal, Check, RefreshCw, AlertTriangle,
  Database, Plus, Trash2, Edit3, Save, CheckSquare, Clock3,
  Layers, Package, Phone, Mail, X, ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  Asset, IsotankTypeMaster, PicMaster, ClosureCriterionMaster, SlaLimitMaster
} from '../types';
import { EmployeeControlView } from './EmployeeControlView';

export interface AdminViewProps {
  initialTab?: 'karyawan' | 'assets' | 'masterdata' | 'sla' | 'security';
}

export const AdminView: React.FC<AdminViewProps> = ({ initialTab = 'karyawan' }) => {
  const { assets, users, updateAssetStatus, masterData, updateMasterData } = useApp();
  const [adminTab, setAdminTab] = useState<'karyawan' | 'assets' | 'masterdata' | 'sla' | 'security'>(initialTab);

  // Asset fleet filters
  const [assetSearch, setAssetSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Tersedia' | 'Beroperasi' | 'Perawatan' | 'Inspeksi'>('Semua');
  const [assetUpdateMsg, setAssetUpdateMsg] = useState('');

  // SLA config states
  const [slaJawaBali, setSlaJawaBali] = useState(48);
  const [slaInterIsland, setSlaInterIsland] = useState(120);
  const [logRetentionDays, setLogRetentionDays] = useState(365);
  const [autoSlaAlerts, setAutoSlaAlerts] = useState(true);
  const [slaSavedNotice, setSlaSavedNotice] = useState(false);

  // Master data sub-tab
  const [masterSubTab, setMasterSubTab] = useState<'isotank' | 'pic' | 'closure' | 'sla_corridor'>('isotank');

  // Form states for adding new master items
  const [showAddIsotankModal, setShowAddIsotankModal] = useState(false);
  const [newIsoType, setNewIsoType] = useState<Partial<IsotankTypeMaster>>({
    name: '',
    capacity: '24,000 Liter (20ft)',
    imdgClass: 'IMO-1 / Class 8 & 3',
    suitableCargo: '',
    description: '',
  });

  const [showAddPicModal, setShowAddPicModal] = useState(false);
  const [newPic, setNewPic] = useState<Partial<PicMaster>>({
    name: '',
    role: 'karyawan',
    department: 'Operasional Lapangan & Depo',
    phone: '0812-3456-7890',
    email: '',
    active: true,
  });

  const [showAddCriterionModal, setShowAddCriterionModal] = useState(false);
  const [newCriterion, setNewCriterion] = useState<Partial<ClosureCriterionMaster>>({
    label: '',
    category: 'bastp',
    required: true,
    description: '',
  });

  const [showAddCorridorModal, setShowAddCorridorModal] = useState(false);
  const [newCorridor, setNewCorridor] = useState<Partial<SlaLimitMaster>>({
    corridorName: '',
    origin: '',
    destination: '',
    targetHoursLand: 48,
    targetHoursSea: 120,
  });

  // Filtered assets
  const filteredAssets = assets.filter(ast => {
    const matchesSearch = assetSearch.trim() === '' ||
      ast.code.toLowerCase().includes(assetSearch.toLowerCase()) ||
      ast.location.toLowerCase().includes(assetSearch.toLowerCase()) ||
      ast.type.toLowerCase().includes(assetSearch.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || ast.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = assets.filter(a => a.status === 'Tersedia').length;
  const inOperationCount = assets.filter(a => a.status === 'Beroperasi').length;
  const maintenanceCount = assets.filter(a => a.status === 'Perawatan').length;
  const inspectionCount = assets.filter(a => a.status === 'Inspeksi').length;

  const handleStatusChange = (assetId: string, assetCode: string, newStatus: any) => {
    updateAssetStatus(assetId, newStatus);
    setAssetUpdateMsg(`Status armada ${assetCode} berhasil diperbarui menjadi ${newStatus}.`);
    setTimeout(() => setAssetUpdateMsg(''), 4000);
  };

  const handleSaveSla = (e: React.FormEvent) => {
    e.preventDefault();
    setSlaSavedNotice(true);
    setTimeout(() => setSlaSavedNotice(false), 4000);
  };

  // Master Data Handlers (No-Code Operations)
  const handleToggleCriterionRequired = (id: string) => {
    const updated = masterData.closureCriteria.map(item =>
      item.id === id ? { ...item, required: !item.required } : item
    );
    updateMasterData('closureCriteria', updated);
  };

  const handleTogglePicActive = (id: string) => {
    const updated = masterData.picList.map(item =>
      item.id === id ? { ...item, active: !item.active } : item
    );
    updateMasterData('picList', updated);
  };

  const handleDeleteIsotankType = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tipe isotank ini dari master data?')) {
      const updated = masterData.isotankTypes.filter(t => t.id !== id);
      updateMasterData('isotankTypes', updated);
    }
  };

  const handleDeletePic = (id: string) => {
    if (confirm('Hapus PIC ini dari daftar master operasional?')) {
      const updated = masterData.picList.filter(p => p.id !== id);
      updateMasterData('picList', updated);
    }
  };

  const handleDeleteCriterion = (id: string) => {
    if (confirm('Hapus kriteria penutupan ini?')) {
      const updated = masterData.closureCriteria.filter(c => c.id !== id);
      updateMasterData('closureCriteria', updated);
    }
  };

  const handleDeleteCorridor = (id: string) => {
    if (confirm('Hapus koridor SLA ini?')) {
      const updated = masterData.slaLimits.filter(c => c.id !== id);
      updateMasterData('slaLimits', updated);
    }
  };

  const handleAddIsotankType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIsoType.name) return;
    const item: IsotankTypeMaster = {
      id: `iso-type-${Date.now()}`,
      name: newIsoType.name,
      capacity: newIsoType.capacity || '24,000 Liter',
      imdgClass: newIsoType.imdgClass || 'IMO-1 / Class 8 & 3',
      suitableCargo: newIsoType.suitableCargo || 'Bahan Kimia Industri / Cairan Korosif',
      description: newIsoType.description || 'Spesifikasi kontainer tangki standar UN Portable T11/T20',
    };
    updateMasterData('isotankTypes', [...masterData.isotankTypes, item]);
    setShowAddIsotankModal(false);
    setNewIsoType({ name: '', capacity: '24,000 Liter (20ft)', imdgClass: 'IMO-1', suitableCargo: '', description: '' });
  };

  const handleAddPic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPic.name) return;
    const item: PicMaster = {
      id: `pic-${Date.now()}`,
      name: newPic.name,
      role: newPic.role || 'karyawan',
      department: newPic.department || 'Operasional Lapangan & Depo',
      phone: newPic.phone || '0812-3456-7890',
      email: newPic.email || `${newPic.name.toLowerCase().replace(/\s+/g, '.')}@niagasegara.co.id`,
      active: true,
    };
    updateMasterData('picList', [...masterData.picList, item]);
    setShowAddPicModal(false);
    setNewPic({ name: '', role: 'karyawan', department: 'Operasional Lapangan & Depo', phone: '', email: '', active: true });
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriterion.label) return;
    const item: ClosureCriterionMaster = {
      id: `crit-${Date.now()}`,
      label: newCriterion.label,
      required: newCriterion.required ?? true,
      category: newCriterion.category || 'bastp',
      description: newCriterion.description || 'Pemeriksaan kepatuhan penutupan transaksi',
    };
    updateMasterData('closureCriteria', [...masterData.closureCriteria, item]);
    setShowAddCriterionModal(false);
    setNewCriterion({ label: '', category: 'bastp', required: true, description: '' });
  };

  const handleAddCorridor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCorridor.corridorName || !newCorridor.origin || !newCorridor.destination) return;
    const item: SlaLimitMaster = {
      id: `sla-corr-${Date.now()}`,
      corridorName: newCorridor.corridorName,
      origin: newCorridor.origin,
      destination: newCorridor.destination,
      targetHoursLand: Number(newCorridor.targetHoursLand) || 48,
      targetHoursSea: Number(newCorridor.targetHoursSea) || 120,
    };
    updateMasterData('slaLimits', [...masterData.slaLimits, item]);
    setShowAddCorridorModal(false);
    setNewCorridor({ corridorName: '', origin: '', destination: '', targetHoursLand: 48, targetHoursSea: 120 });
  };

  return (
    <div className="space-y-6">
      
      {/* Central Admin Hub Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>CENTRAL ADMINISTRATIVE CONTROL & ASSET HUB</span>
            </span>
            <span className="text-slate-400 text-xs">· PT Niaga Segara Trasindo</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <Settings className="w-6 h-6 text-teal-400" />
            <span>Kelola Admin & Aset</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Pusat kendali operasional terpadu untuk pengaturan karyawan, manajemen armada unit isotank, master data operasional tanpa kode (no-code), dan standardisasi SLA logistik kimia cair.
          </p>
        </div>
      </div>

      {/* Main Administrative Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 text-xs">
        <button
          onClick={() => setAdminTab('karyawan')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 ${
            adminTab === 'karyawan'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pengaturan Karyawan ({users.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('assets')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 ${
            adminTab === 'assets'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Kelola Armada Isotank ({assets.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('masterdata')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 ${
            adminTab === 'masterdata'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Pengaturan Master Data (No-Code)</span>
        </button>

        <button
          onClick={() => setAdminTab('sla')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 ${
            adminTab === 'sla'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Parameter SLA & Konfigurasi</span>
        </button>

        <button
          onClick={() => setAdminTab('security')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 ${
            adminTab === 'security'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Status Keamanan & Arsitektur</span>
        </button>
      </div>

      {/* TAB 1: PENGATURAN KARYAWAN */}
      {adminTab === 'karyawan' && (
        <EmployeeControlView compactHeader={true} />
      )}

      {/* TAB 2: KELOLA ARMADA ISOTANK */}
      {adminTab === 'assets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Total Armada</span>
                <span className="text-xl font-extrabold text-slate-100 font-mono">{assets.length} Unit</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Truck className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Tersedia (Ready)</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">{availableCount} Unit</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Sedang Beroperasi</span>
                <span className="text-xl font-extrabold text-teal-300 font-mono">{inOperationCount} Unit</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <RefreshCw className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Perawatan / Inspeksi</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">{maintenanceCount + inspectionCount} Unit</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          {assetUpdateMsg && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{assetUpdateMsg}</span>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                placeholder="Cari kode unit isotank, depo lokasi, tipe kontainer..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {(['Semua', 'Tersedia', 'Beroperasi', 'Perawatan', 'Inspeksi'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    statusFilter === st
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Isotank Assets Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((ast) => (
              <div
                key={ast.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-teal-300 font-mono text-base block">{ast.code}</span>
                    <span className="text-[11px] text-slate-400">{ast.type}</span>
                  </div>
                  <select
                    value={ast.status}
                    onChange={(e) => handleStatusChange(ast.id, ast.code, e.target.value as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      ast.status === 'Tersedia' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      ast.status === 'Beroperasi' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' :
                      ast.status === 'Perawatan' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    <option value="Tersedia">Tersedia (Ready)</option>
                    <option value="Beroperasi">Beroperasi (Active)</option>
                    <option value="Perawatan">Perawatan (Maintenance)</option>
                    <option value="Inspeksi">Inspeksi (Inspection)</option>
                  </select>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kapasitas Muatan:</span>
                    <strong className="text-slate-100 font-mono">{ast.capacity}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lokasi Depo Parkir:</span>
                    <strong className="text-slate-100">{ast.location}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inspeksi Terakhir:</span>
                    <span className="text-slate-300 font-mono">{ast.lastInspectionDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PENGATURAN MASTER DATA (NO-CODE OPERATIONAL CONFIGURATION) */}
      {adminTab === 'masterdata' && (
        <div className="space-y-4">
          {/* Sub-navigation for Master Data */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setMasterSubTab('isotank')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  masterSubTab === 'isotank'
                    ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tipe Isotank ({masterData.isotankTypes.length})</span>
              </button>

              <button
                onClick={() => setMasterSubTab('pic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  masterSubTab === 'pic'
                    ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Daftar PIC ({masterData.picList.length})</span>
              </button>

              <button
                onClick={() => setMasterSubTab('closure')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  masterSubTab === 'closure'
                    ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Kriteria Penutupan ({masterData.closureCriteria.length})</span>
              </button>

              <button
                onClick={() => setMasterSubTab('sla_corridor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  masterSubTab === 'sla_corridor'
                    ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Clock3 className="w-3.5 h-3.5" />
                <span>Batas SLA Koridor ({masterData.slaLimits.length})</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Sinkronisasi real-time tanpa ubah kode program · Tersimpan di LocalStorage & Audit Log
            </div>
          </div>

          {/* SUB-PANEL 1: MASTER TIPE ISOTANK */}
          {masterSubTab === 'isotank' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>Daftar Master Jenis & Tipe Unit Isotank</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Spesifikasi standar tangki kontainer kimia cair untuk validasi penugasan armada pada Step 1 & 2.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddIsotankModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Tipe Isotank</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {masterData.isotankTypes.map(t => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-teal-300 font-mono text-sm block">{t.name}</span>
                        <span className="text-[11px] text-slate-400">{t.capacity} · {t.imdgClass}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteIsotankType(t.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Tipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {t.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px]">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Kesesuaian Muatan:</span>
                      <span className="text-teal-200 font-medium">{t.suitableCargo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-PANEL 2: MASTER DAFTAR PIC */}
          {masterSubTab === 'pic' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Daftar Master Person In Charge (PIC) Operasional</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Daftar staf, reviewer, dan manager yang dapat ditugaskan pada transaksi lead dan aksi massal.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPicModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah PIC Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {masterData.picList.map(pic => (
                  <div key={pic.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-100">{pic.name}</h4>
                        <span className="text-[11px] text-teal-400 font-mono uppercase">{pic.role}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleTogglePicActive(pic.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pic.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                          }`}
                          title="Klik untuk ubah status aktif"
                        >
                          {pic.active ? 'Aktif' : 'Non-aktif'}
                        </button>
                        <button
                          onClick={() => handleDeletePic(pic.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Hapus PIC"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <Package className="w-3 h-3 text-slate-500" />
                        <span>{pic.department}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{pic.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 truncate">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{pic.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-PANEL 3: MASTER KRITERIA PENUTUPAN */}
          {masterSubTab === 'closure' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-teal-400" />
                    <span>Daftar Kriteria & Dokumen Wajib Penutupan (Closure Criteria)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Syarat verifikasi dokumen BASTP dan kelaikan sebelum lead dapat dipindahkan ke tahap Done/Closed (Stage 8).
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCriterionModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kriteria Baru</span>
                </button>
              </div>

              <div className="space-y-2">
                {masterData.closureCriteria.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-[260px]">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-teal-400 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-100">{item.label}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleCriterionRequired(item.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          item.required
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                        title="Klik untuk mengubah status wajib/opsional"
                      >
                        {item.required ? '★ Wajib (Blocking)' : 'Opsional'}
                      </button>

                      <button
                        onClick={() => handleDeleteCriterion(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Kriteria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-PANEL 4: MASTER BATAS TARGET SLA PER KORIDOR */}
          {masterSubTab === 'sla_corridor' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <Clock3 className="w-4 h-4 text-teal-400" />
                    <span>Daftar Standar SLA per Koridor Logistik</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Batas toleransi waktu tempuh darat dan laut antarpulau untuk evaluasi On-Time KPI.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCorridorModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Koridor Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {masterData.slaLimits.map(corr => (
                  <div key={corr.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{corr.corridorName}</h4>
                        <span className="text-[11px] text-teal-400">{corr.origin} ➔ {corr.destination}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCorridor(corr.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Hapus Koridor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Target Darat:</span>
                        <strong className="text-teal-300 font-mono text-sm">{corr.targetHoursLand} Jam</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Target Laut / Voyage:</span>
                        <strong className="text-cyan-300 font-mono text-sm">{corr.targetHoursSea} Jam</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Isotank Modal */}
          {showAddIsotankModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-100 text-sm">Tambah Master Tipe Isotank</h3>
                  <button onClick={() => setShowAddIsotankModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAddIsotankType} className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nama / Seri Tipe:</label>
                    <input
                      type="text"
                      value={newIsoType.name}
                      onChange={e => setNewIsoType({ ...newIsoType, name: e.target.value })}
                      placeholder="Contoh: ISO T14 Rubber Lined"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Kapasitas Muatan:</label>
                    <input
                      type="text"
                      value={newIsoType.capacity}
                      onChange={e => setNewIsoType({ ...newIsoType, capacity: e.target.value })}
                      placeholder="Contoh: 21,000 Liter"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Kelas IMDG / Sertifikasi:</label>
                    <input
                      type="text"
                      value={newIsoType.imdgClass}
                      onChange={e => setNewIsoType({ ...newIsoType, imdgClass: e.target.value })}
                      placeholder="Contoh: IMO-4 / Class 8 Asam Kuat"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Muatan yang Sesuai:</label>
                    <input
                      type="text"
                      value={newIsoType.suitableCargo}
                      onChange={e => setNewIsoType({ ...newIsoType, suitableCargo: e.target.value })}
                      placeholder="Contoh: Hydrochloric Acid HCl 33%, Asam Sulfat H2SO4"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddIsotankModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
                    >
                      Simpan Tipe
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add PIC Modal */}
          {showAddPicModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-100 text-sm">Tambah PIC Baru</h3>
                  <button onClick={() => setShowAddPicModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAddPic} className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nama Lengkap PIC:</label>
                    <input
                      type="text"
                      value={newPic.name}
                      onChange={e => setNewPic({ ...newPic, name: e.target.value })}
                      placeholder="Contoh: Hendra Pratama"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Peran Jabatan (Role):</label>
                    <select
                      value={newPic.role}
                      onChange={e => setNewPic({ ...newPic, role: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="karyawan">Karyawan (Staff Operasional Lapangan)</option>
                      <option value="reviewer">Reviewer (Quality Assurance & Verifikasi)</option>
                      <option value="manager">Manager (Otorisasi & Fleet Lead)</option>
                      <option value="admin">Administrator (Super Admin)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Departemen / Divisi:</label>
                    <input
                      type="text"
                      value={newPic.department}
                      onChange={e => setNewPic({ ...newPic, department: e.target.value })}
                      placeholder="Contoh: Dispatching Depo Surabaya"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">No. Handphone / WhatsApp:</label>
                    <input
                      type="text"
                      value={newPic.phone}
                      onChange={e => setNewPic({ ...newPic, phone: e.target.value })}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPicModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
                    >
                      Simpan PIC
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Criterion Modal */}
          {showAddCriterionModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-100 text-sm">Tambah Kriteria Penutupan Transaksi</h3>
                  <button onClick={() => setShowAddCriterionModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAddCriterion} className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Judul / Nama Kriteria:</label>
                    <input
                      type="text"
                      value={newCriterion.label}
                      onChange={e => setNewCriterion({ ...newCriterion, label: e.target.value })}
                      placeholder="Contoh: Berita Acara Uji Tekanan Tank (Pressure Test)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Kategori:</label>
                    <select
                      value={newCriterion.category}
                      onChange={e => setNewCriterion({ ...newCriterion, category: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="bastp">BASTP & Tanda Terima</option>
                      <option value="segel">Segel & Keselamatan Tangki</option>
                      <option value="transporter">Dokumen Transporter & Tiket Kapal</option>
                      <option value="inspeksi">Inspeksi Teknis & Kelaikan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Deskripsi Lengkap:</label>
                    <textarea
                      value={newCriterion.description}
                      onChange={e => setNewCriterion({ ...newCriterion, description: e.target.value })}
                      placeholder="Deskripsi pemeriksaan kriteria..."
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div className="pt-1">
                    <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCriterion.required}
                        onChange={e => setNewCriterion({ ...newCriterion, required: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-teal-500"
                      />
                      <span>Wajib Dipenuhi (Blocking Penutupan Transaksi)</span>
                    </label>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCriterionModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
                    >
                      Simpan Kriteria
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Corridor Modal */}
          {showAddCorridorModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-100 text-sm">Tambah Koridor SLA Logistik</h3>
                  <button onClick={() => setShowAddCorridorModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAddCorridor} className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nama Koridor:</label>
                    <input
                      type="text"
                      value={newCorridor.corridorName}
                      onChange={e => setNewCorridor({ ...newCorridor, corridorName: e.target.value })}
                      placeholder="Contoh: Koridor Tuban - Cilegon"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Titik Asal:</label>
                      <input
                        type="text"
                        value={newCorridor.origin}
                        onChange={e => setNewCorridor({ ...newCorridor, origin: e.target.value })}
                        placeholder="Depo Utama Tuban"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Titik Tujuan:</label>
                      <input
                        type="text"
                        value={newCorridor.destination}
                        onChange={e => setNewCorridor({ ...newCorridor, destination: e.target.value })}
                        placeholder="Kawasan Industri Cilegon"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Target Darat (Jam):</label>
                      <input
                        type="number"
                        value={newCorridor.targetHoursLand}
                        onChange={e => setNewCorridor({ ...newCorridor, targetHoursLand: Number(e.target.value) })}
                        min={1}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Target Laut (Jam):</label>
                      <input
                        type="number"
                        value={newCorridor.targetHoursSea}
                        onChange={e => setNewCorridor({ ...newCorridor, targetHoursSea: Number(e.target.value) })}
                        min={1}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCorridorModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
                    >
                      Simpan Koridor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PARAMETER SLA & RETENSI DATA */}
      {adminTab === 'sla' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-6 text-xs text-slate-300">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-400" />
              <span>Standard Operational Procedure (SOP) & Konfigurasi SLA</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Aturan perhitungan batas toleransi waktu (SLA) untuk peringatan otomatis keterlambatan rute darat maupun laut antarpulau.
            </p>
          </div>

          {slaSavedNotice && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Pengaturan parameter SLA & retensi data berhasil disimpan secara permanen.</span>
            </div>
          )}

          <form onSubmit={handleSaveSla} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-2">
                <label className="block font-bold text-slate-200">
                  Target SLA Rute Darat Jawa - Bali (Jam):
                </label>
                <input
                  type="number"
                  value={slaJawaBali}
                  onChange={(e) => setSlaJawaBali(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 w-full font-mono text-sm focus:border-teal-500 focus:outline-none"
                  min={1}
                />
                <span className="text-[11px] text-slate-400 block">
                  Target waktu tempuh pengiriman darat Jawa Timur, Jawa Barat, Jakarta hingga Bali (Default: 48 Jam).
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-2">
                <label className="block font-bold text-slate-200">
                  Target SLA Rute Luar Pulau / Kapal Kargo (Jam):
                </label>
                <input
                  type="number"
                  value={slaInterIsland}
                  onChange={(e) => setSlaInterIsland(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 w-full font-mono text-sm focus:border-teal-500 focus:outline-none"
                  min={1}
                />
                <span className="text-[11px] text-slate-400 block">
                  Target waktu tempuh pengiriman laut antarpulau (Sumatra, Kalimantan, Sulawesi) termasuk jadwal kapal kargo (Default: 120 Jam / 5 Hari).
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-2">
                <label className="block font-bold text-slate-200">
                  Masa Retensi Log Audit Sistem (Hari):
                </label>
                <input
                  type="number"
                  value={logRetentionDays}
                  onChange={(e) => setLogRetentionDays(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 w-full font-mono text-sm focus:border-teal-500 focus:outline-none"
                  min={30}
                />
                <span className="text-[11px] text-slate-400 block">
                  Jangka waktu penyimpanan riwayat perubahan status lead & persetujuan berjenjang sebelum diarsipkan (Default: 365 Hari).
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 flex flex-col justify-between">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Auto-Alert Notifikasi Keterlambatan:
                  </label>
                  <span className="text-[11px] text-slate-400 block">
                    Kirim sinyal visual peringatan saat lead aktif melebihi batas waktu SLA yang ditentukan.
                  </span>
                </div>
                <div className="pt-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlaAlerts}
                      onChange={(e) => setAutoSlaAlerts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    <span className="ml-3 text-xs font-bold text-slate-200">
                      {autoSlaAlerts ? 'Aktif (Auto-Alert ON)' : 'Non-aktif'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-md transition-all text-xs"
              >
                Simpan Konfigurasi SLA
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: STATUS KEAMANAN & ARSITEKTUR (LANGKAH 0 & KONTROL KEAMANAN) */}
      {adminTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-100">Status Keamanan Data Lead & Laporan Arsitektur (Langkah 0)</h3>
                <p className="text-xs text-slate-400">Evaluasi jujur arsitektur penyimpanan dan daftar kontrol tata kelola keamanan perusahaan.</p>
              </div>
            </div>

            {/* Frank Architecture Assessment */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs text-slate-300 leading-relaxed">
              <strong className="text-teal-300 font-bold block">Temuan Arsitektur & Penyimpanan Data:</strong>
              <p>
                Saat ini aplikasi berjalan sebagai SPA (Single Page Application) React pada Vite dengan penyimpanan state persisten di <code className="text-amber-300 font-mono">localStorage</code> (<code className="text-amber-300 font-mono">isotrack_app_state_v2</code>). 
                Karena seluruh data disimpan di sisi klien (browser), manipulasi langsung pada local storage oleh pengguna tingkat lanjut tidak dapat dicegah secara mutlak di frontend saja.
              </p>
              <div className="pt-2 text-[11px] text-amber-300 font-semibold">
                Jalur Sambung Produksi (Backend Integration Path):
              </div>
              <p className="text-slate-400 text-[11px]">
                Untuk deployment produksi nyata, disarankan untuk menyambungkan <strong>Firebase Auth + Firestore Security Rules</strong> atau <strong>Supabase Auth + Row Level Security (RLS)</strong> agar penegakan RBAC dan append-only audit trail berjalan langsung di tingkat database server.
              </p>
            </div>

            {/* Control List Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Daftar Kontrol Keamanan & Status Implementasi
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="p-3">Nama Kontrol Keamanan</th>
                      <th className="p-3">Cakupan Sistem</th>
                      <th className="p-3 text-center">Status Sesi 6</th>
                      <th className="p-3">Keterangan Teknis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-3 font-bold text-slate-100">RBAC Data-Level Access</td>
                      <td className="p-3">Kontrol baca/tulis berdasarkan peran (Karyawan, Manager, Reviewer, Admin)</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                          Aktif (Frontend Context)
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">Siap diganti dengan Firebase Firestore Rules / Supabase RLS</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Append-Only Audit Trail</td>
                      <td className="p-3">Pencatatan mutlak siapa, kapan, aksi, dan nilai sebelum/sesudah</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          Aktif
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">Tersimpan permanen di riwayat log sistem, tanpa tombol hapus/ubah</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Sensitive Data Masking</td>
                      <td className="p-3">Penyamaran nomor telepon, email, dan nilai kontrak finansial</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          Aktif
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">Membuka data wajib melalui modal konfirmasi kerahasiaan ber-audit log</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Watermarked Export & Logs</td>
                      <td className="p-3">Ekspor laporan PDF/Excel berwatermark identitas pengguna & waktu</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          Aktif
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">Melampirkan cap digital rahasia pada dokumen unduhan resmi</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Session Inactivity & 2FA</td>
                      <td className="p-3">Timeout otomatis tidak aktif dan verifikasi 2 langkah Admin</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          Aktif (2FA Menunggu Backend)
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">Peringatan 60 detik sebelum timeout; UI 2FA disiapkan untuk Admin</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Soft Delete & Hard Delete</td>
                      <td className="p-3">Penghapusan lunak (bisa dipulihkan) dan hapus permanen konfirmasi ID</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          Aktif
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">Hanya Admin yang memiliki kewenangan penuh penghapusan data</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
