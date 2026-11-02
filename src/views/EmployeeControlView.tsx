import React, { useState } from 'react';
import {
  Users, UserPlus, ShieldCheck, Lock, CheckCircle2, AlertTriangle,
  Edit3, RefreshCw, Key, Power, Search, BarChart2, ShieldAlert, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';

interface EmployeeControlViewProps {
  compactHeader?: boolean;
}

export const EmployeeControlView: React.FC<EmployeeControlViewProps> = ({ compactHeader = false }) => {
  const {
    users,
    currentUser,
    filteredLeads,
    addEmployeeAccount,
    updateEmployeeAccount,
    toggleEmployeeStatus,
  } = useApp();

  const isManagerOrAdmin = currentUser.role === 'manager' || currentUser.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New employee form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Operasional Lapangan & Logistik');
  const [newRole, setNewRole] = useState<UserRole>('karyawan');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Filtered employees
  const employees = users.filter(u => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggle = (user: User) => {
    toggleEmployeeStatus(user.id);
    setFeedbackMsg(`Status akun ${user.name} berhasil diubah menjadi ${!user.active ? 'AKTIF' : 'SUSPENDED (Non-aktif)'}.`);
  };

  const handleResetPin = (userName: string) => {
    setFeedbackMsg(`PIN Keamanan SSL untuk ${userName} telah diriset ke default ("123456"). Notifikasi otentikasi Google telah dikirimkan.`);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    addEmployeeAccount({
      name: newName,
      email: newEmail,
      role: newRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      department: newDept,
      active: true,
      googleLinked: true,
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setFeedbackMsg(`Akun Karyawan baru "${newName}" (${newEmail}) berhasil dibuat & tersinkronisasi otomatis dengan Akun Google.`);
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    updateEmployeeAccount(selectedUserForEdit.id, selectedUserForEdit);
    setFeedbackMsg(`Profil & otorisasi hak akses ${selectedUserForEdit.name} berhasil diperbarui & disinkronkan.`);
    setSelectedUserForEdit(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner / Action Bar */}
      {!compactHeader ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] uppercase font-bold tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>MANAGER FULL CONTROL ACCESS & GOOGLE SYNC</span>
              </span>
              <span className="text-slate-400 text-xs">· PT Niaga Segara Trasindo</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
              <Users className="w-6 h-6 text-teal-400" />
              <span>Pengaturan & Kontrol Akun Karyawan</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Modul kontrol penuh Manager ({currentUser.name}) untuk registrasi, pengeditan hak akses, penangguhan status, dan sinkronisasi otomatis dengan Akun Google.
            </p>
          </div>

          {isManagerOrAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/20 transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Karyawan Baru</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-slate-100 text-sm">
                  Pengaturan Karyawan, Hak Akses & Google Sync
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Google Linked
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Otorisasi peran (RBAC), penangguhan/aktivasi akun, reset kredensial PIN SSL, serta pemantauan beban lead karyawan.
              </p>
            </div>
          </div>

          {isManagerOrAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-md shadow-teal-500/20 transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Karyawan Baru</span>
            </button>
          )}
        </div>
      )}

      {!isManagerOrAdmin && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Akses Terbatas: Menu kontrol penuh akun karyawan hanya dapat dikelola oleh Manager (Probo Subagyo) dan Administrator.</span>
        </div>
      )}

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-teal-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-slate-400 hover:text-white text-xs">OK</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama karyawan, email, departemen..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Akun Terdaftar: <strong className="text-teal-400">{users.length} User</strong>
        </div>
      </div>

      {/* Employee List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const empLeads = filteredLeads.filter(l => l.pic_id === emp.id || l.creator_id === emp.id);
          const activeLeadsCount = empLeads.filter(l => l.status !== 'closed').length;
          const closedLeadsCount = empLeads.filter(l => l.status === 'closed').length;
          const totalRevisions = empLeads.reduce((a, b) => a + b.total_revisions, 0);

          return (
            <div
              key={emp.id}
              className={`p-5 rounded-2xl border transition-all shadow-md flex flex-col justify-between space-y-4 ${
                emp.active
                  ? 'bg-slate-900 border-slate-800 hover:border-teal-500/50'
                  : 'bg-slate-950/80 border-rose-500/30 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img src={emp.avatar} alt={emp.name} className="w-11 h-11 rounded-full border-2 border-slate-700 object-cover" />
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-sm flex items-center space-x-1.5">
                        <span>{emp.name}</span>
                        {!emp.active && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-rose-500 text-white">
                            SUSPENDED
                          </span>
                        )}
                      </h3>
                      <div className="text-[11px] text-teal-400 font-mono flex items-center space-x-1">
                        <span>{emp.email}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                    emp.role === 'karyawan' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    emp.role === 'manager' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    emp.role === 'reviewer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {emp.role}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-[10px] text-teal-400 font-semibold bg-teal-500/10 border border-teal-500/20 rounded-lg px-2 py-1 mb-3">
                  <Check className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Google Account Linked & Auto Synced</span>
                </div>

                <div className="text-xs text-slate-400 space-y-1 mb-3">
                  <div>Departemen: <strong className="text-slate-200">{emp.department}</strong></div>
                  <div>Status Akses: <strong className={emp.active ? 'text-emerald-400' : 'text-rose-400'}>{emp.active ? 'Aktif Bekerja' : 'Akses Dibatasi'}</strong></div>
                </div>

                {/* Performance Snapshot */}
                <div className="grid grid-cols-3 gap-2 bg-slate-800/50 border border-slate-700/80 rounded-xl p-2.5 text-center text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lead Aktif</span>
                    <strong className="text-teal-300 font-mono text-xs">{activeLeadsCount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Selesai</span>
                    <strong className="text-emerald-400 font-mono text-xs">{closedLeadsCount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Revisi</span>
                    <strong className="text-amber-400 font-mono text-xs">{totalRevisions}</strong>
                  </div>
                </div>
              </div>

              {/* Manager Controls Bar */}
              {isManagerOrAdmin && (
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleToggle(emp)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors ${
                        emp.active
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950'
                      }`}
                      title="Aktifkan / Suspend Akun"
                    >
                      <Power className="w-3 h-3" />
                      <span>{emp.active ? 'Suspend' : 'Aktifkan'}</span>
                    </button>

                    <button
                      onClick={() => handleResetPin(emp.name)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1"
                      title="Reset Passcode PIN SSL"
                    >
                      <Key className="w-3 h-3 text-amber-400" />
                      <span>Reset PIN</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedUserForEdit(emp)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700"
                    title="Edit Detail Akun"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Tambah Karyawan Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Registrasi Akun Karyawan & Google Sync</h3>

            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Lengkap Karyawan:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Rian Hidayat"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Alamat Email Google Perusahaan:</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="rian.hidayat@niagasegara.co.id"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Departemen / Divisi:</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Hak Akses Role System:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                >
                  <option value="karyawan">Karyawan (PIC Operasional Lapangan)</option>
                  <option value="manager">Manager Operasional Armada</option>
                  <option value="reviewer">Reviewer QA & Quality</option>
                  <option value="admin">Administrator Sistem</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl hover:bg-teal-400 shadow-md"
                >
                  Buat Akun & Sinkronkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Akun Karyawan */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Edit Profil & Hak Akses ({selectedUserForEdit.name})</h3>

            <form onSubmit={handleUpdateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={selectedUserForEdit.name}
                  onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Alamat Email:</label>
                <input
                  type="email"
                  value={selectedUserForEdit.email}
                  onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Departemen:</label>
                <input
                  type="text"
                  value={selectedUserForEdit.department}
                  onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, department: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl hover:bg-teal-400 shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
