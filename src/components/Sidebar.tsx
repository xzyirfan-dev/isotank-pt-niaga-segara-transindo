import {
  LayoutDashboard, CheckSquare, Truck, PlusCircle, BarChart3,
  Sparkles, FileText, Settings, Users, ShieldCheck, Database, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, currentUser, leads, resetDemoData } = useApp();

  // Count my pending tasks
  const myPendingTasksCount = leads.filter(lead => {
    if (currentUser.role === 'karyawan') {
      return (lead.pic_id === currentUser.id || lead.creator_id === currentUser.id) &&
             (lead.status === 'lead_created' || lead.status === 'in_progress' || lead.status === 'follow_up');
    }
    if (currentUser.role === 'manager') {
      return lead.status === 'lead_approval' || lead.status === 'final_approval';
    }
    if (currentUser.role === 'reviewer') {
      return lead.status === 'submission' || lead.status === 'review';
    }
    return lead.status !== 'closed';
  }).length;

  const navItems = [
    { id: 'dashboard', label: 'Dasbor Utama', icon: LayoutDashboard },
    { id: 'my_tasks', label: 'Tugas Saya', icon: CheckSquare, badge: myPendingTasksCount },
    { id: 'leads', label: 'Transaksi Lead', icon: Truck },
    { id: 'new_lead', label: 'Buat Lead Baru', icon: PlusCircle },
    { id: 'employee_control', label: 'Pengaturan Karyawan', icon: Users },
    { id: 'reports', label: 'Laporan & Analytics', icon: BarChart3 },
    { id: 'ai_recommendations', label: 'Rekomendasi AI', icon: Sparkles, highlight: true },
    { id: 'system_log', label: 'Log Sistem (Audit)', icon: FileText },
    { id: 'admin', label: 'Kelola Admin & Aset', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        
        {/* Logged-In Employee Profile Banner (Foto kiri | Kanan line 1: Nama + Tag Karyawan | Line 2: Jabatan | Line 3: Email Google) */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 shadow-md">
          <div className="flex items-center space-x-2.5">
            {/* Sebelah kiri foto */}
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-xl object-cover border-2 border-teal-500/40 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" title="Status Google Sign-In Aktif" />
            </div>

            {/* Kanan */}
            <div className="min-w-0 flex-1 space-y-0.5">
              {/* Baris 1: Nama + Tag Karyawan di sebelah kanan nama */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold text-slate-100 truncate leading-tight" title={currentUser.name}>
                  {currentUser.name}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-teal-500/20 text-teal-300 uppercase border border-teal-500/30 shrink-0">
                  {currentUser.role}
                </span>
              </div>

              {/* Baris 2: Jabatan */}
              <div className="text-[10px] font-semibold text-teal-400 truncate leading-tight" title={currentUser.department}>
                {currentUser.department}
              </div>

              {/* Baris 3: Email Google Login */}
              <div className="text-[9px] text-slate-400 font-mono truncate leading-tight" title={currentUser.email}>
                {currentUser.email}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            MENU OPERASIONAL
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                    : item.highlight
                    ? 'text-teal-300 hover:bg-slate-800 border border-teal-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : item.highlight ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${isActive ? 'bg-slate-950 text-teal-400' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Demo Data Reset Button */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>SLA Guard Active</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">v3.2</span>
        </div>

        <button
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data transaksi ke kondisi awal demo?')) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-medium text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Data Demo</span>
        </button>
      </div>
    </aside>
  );
};
