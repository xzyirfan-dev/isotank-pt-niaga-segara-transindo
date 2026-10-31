import React from 'react';
import { CheckSquare, ArrowRight, Shield, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STAGE_LIST } from '../data/stageConfig';

export const MyTasksView: React.FC = () => {
  const { filteredLeads, currentUser, setSelectedLeadId } = useApp();

  const myTasks = filteredLeads.filter(lead => {
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
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] uppercase font-bold tracking-wider">
              INBOX TUGAS BERPERAN
            </span>
            <span className="text-slate-400 text-xs">· Peran: <strong className="text-teal-400 uppercase">{currentUser.role}</strong></span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-teal-400" />
            <span>Daftar Tugas Saya ({currentUser.name})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Menampilkan transaksi lead yang sedang menunggu tindakan langsung dari peran Anda dalam alur 8-tahap.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
          Total Tugas Antrean: <strong className="text-teal-400 font-mono text-base ml-1">{myTasks.length}</strong>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {myTasks.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
            <CheckSquare className="w-10 h-10 text-teal-400/40 mx-auto" />
            <div className="font-bold text-slate-200">Tidak Ada Tugas Menunggu</div>
            <p className="text-slate-400">Seluruh alur transaksi untuk peran {currentUser.role.toUpperCase()} saat ini telah selesai diproses.</p>
          </div>
        ) : (
          myTasks.map((lead) => {
            const stageMeta = STAGE_LIST.find(s => s.id === lead.status) || STAGE_LIST[0];

            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/60 transition-all shadow-md cursor-pointer group hover:bg-slate-800/80"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-xs">
                      {lead.current_step}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                          {lead.lead_code || 'LEAD-00101'}
                        </span>
                        <span className="font-mono font-bold text-slate-100 text-sm group-hover:text-teal-300">
                          {lead.no_surat_jalan}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-teal-400 border border-teal-500/20 font-mono">
                          {lead.asset_code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        {lead.asal} &rarr; {lead.tujuan} ({lead.muatan})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${stageMeta.badgeBg} ${stageMeta.badgeText}`}>
                      {stageMeta.name}
                    </span>

                    <button className="px-4 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 flex items-center space-x-1 shadow-sm">
                      <span>Proses Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 mt-3 flex items-center justify-between">
                  <span><strong>Tindakan yang Dibutuhkan:</strong> {stageMeta.description}</span>
                  <span className="font-mono text-slate-400">Target SLA: {new Date(lead.target_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
