import React, { useState } from 'react';
import {
  X, Truck, Clock, ShieldCheck, FileText, CheckCircle2, AlertCircle,
  MessageSquare, Upload, AlertTriangle, Printer, ExternalLink, ChevronRight,
  UserCheck, ArrowRight, CornerDownRight, Check, Eye, Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STAGE_LIST } from '../data/stageConfig';
import { EvidenceUploadModal } from './EvidenceUploadModal';
import { ApprovalChecklistModal } from './ApprovalChecklistModal';
import { FileViewerModal } from './FileViewerModal';

interface LeadDetailModalProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ leadId, onClose }) => {
  const {
    leads, evidences, issues, comments, currentUser, auditLogs,
    addIssue, resolveIssue, addComment, transitionLeadStage
  } = useApp();

  const [activeTab, setActiveTab] = useState<'timeline' | 'jejak_bukti' | 'issues' | 'comments'>('timeline');
  const [newIssueDesc, setNewIssueDesc] = useState('');
  const [newCommentMsg, setNewCommentMsg] = useState('');
  const [activeViewerEvidence, setActiveViewerEvidence] = useState<any>(null);

  // Modals for actions
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [approvalModalConfig, setApprovalModalConfig] = useState<{
    isOpen: boolean;
    actionType: 'approve_stage_2' | 'reject_stage_2' | 'approve_stage_5' | 'request_revision_stage_5' | 'approve_stage_7' | 'reject_stage_7';
    targetStage: any;
    targetStep: number;
  }>({
    isOpen: false,
    actionType: 'approve_stage_2',
    targetStage: 'in_progress',
    targetStep: 3,
  });

  if (!leadId) return null;

  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;

  const leadEvidences = evidences.filter(e => e.lead_id === leadId);
  const leadIssues = issues.filter(i => i.lead_id === leadId);
  const leadComments = comments.filter(c => c.lead_id === leadId);
  const leadLogs = auditLogs.filter(a => a.entity_id === leadId);

  const isClosed = lead.status === 'closed';

  // Calculate SLA countdown
  const targetDate = new Date(lead.target_at);
  const now = new Date();
  const diffHours = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isOverdue = diffHours < 0 && !isClosed;

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueDesc.trim()) return;
    addIssue(leadId, newIssueDesc);
    setNewIssueDesc('');
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentMsg.trim()) return;
    addComment(leadId, newCommentMsg);
    setNewCommentMsg('');
  };

  // Printable Surat Jalan
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
          
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    {lead.lead_code || 'LEAD-00101'}
                  </span>
                  <span className="font-extrabold text-slate-100 text-base font-mono">{lead.no_surat_jalan}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-700 text-teal-300">
                    Aset: {lead.asset_code}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Rute: <strong className="text-slate-200">{lead.asal}</strong> &rarr; <strong className="text-slate-200">{lead.tujuan}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* SLA Badge */}
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center space-x-1 ${
                isClosed
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isOverdue
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {isClosed ? 'Closed (Selesai)' : isOverdue ? `Terlambat SLA (${Math.abs(diffHours)}j)` : `Sisa SLA: ${diffHours} Jam`}
                </span>
              </div>

              <button
                onClick={handlePrint}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors no-print"
                title="Cetak Surat Jalan & Detail"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white no-print">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Status Alur 8 Tahap Operasional:</span>
              <span className="text-teal-400 font-mono">Stage {lead.current_step} dari 8 ({lead.progress_percentage}%)</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${lead.progress_percentage}%` }}
              />
            </div>

            {/* Stepper items */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-1 text-center">
              {STAGE_LIST.map((stg) => {
                const isPassed = lead.current_step > stg.step;
                const isCurrent = lead.current_step === stg.step;
                return (
                  <div key={stg.step} className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed
                        ? 'bg-teal-500 text-slate-950'
                        : isCurrent
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : stg.step}
                    </div>
                    <span className={`text-[10px] mt-1 font-semibold truncate w-full ${
                      isCurrent ? 'text-amber-400' : isPassed ? 'text-teal-300' : 'text-slate-500'
                    }`}>
                      {stg.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 px-6 bg-slate-950/60 border-b border-slate-800 text-xs shrink-0 no-print">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2.5 font-bold border-b-2 transition-colors ${
                activeTab === 'timeline'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Timeline 8 Tahap
            </button>
            <button
              onClick={() => setActiveTab('jejak_bukti')}
              className={`px-4 py-2.5 font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'jejak_bukti'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Jejak Tahap & Bukti Selesai</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-teal-300">
                {leadEvidences.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-2.5 font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'issues'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Kendala Operasional</span>
              {leadIssues.filter(i => i.status === 'open').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]">
                  {leadIssues.filter(i => i.status === 'open').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2.5 font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'comments'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Diskusi & Komentar ({leadComments.length})</span>
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">

            {/* TAB 1: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                
                {/* General Info & Transporter Partnership Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Klien Perusahaan / Pemilik:</span>
                    <strong className="text-teal-300 font-bold">{lead.client_company || 'PT Petrokimia Utama Indonesia'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Jenis Muatan Chemical:</span>
                    <strong className="text-slate-100 font-bold">{lead.muatan}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Unit Isotank:</span>
                    <strong className="text-teal-300 font-mono">{lead.asset_code}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Mitra Penyedia Truk (Vendor):</span>
                    <strong className="text-slate-100 font-bold">{lead.transport_vendor_name || 'PT Segara Logistik Express'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Nama Supir / Pengemudi:</span>
                    <span className="text-slate-200 font-medium">{lead.nama_supir || 'Bambang Susanto (SIM B2)'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">No. Plat Nomor Truk:</span>
                    <span className="text-teal-300 font-mono font-bold">{lead.no_plat_truk || 'B 9842 UFX'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Target Waktu Ketibaan (SLA):</span>
                    <strong className="text-slate-100">{new Date(lead.target_at).toLocaleString('id-ID')}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Karyawan Pembuat / PIC:</span>
                    <span className="text-slate-200">{lead.creator_name}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Manager Penanggung Jawab:</span>
                    <span className="text-slate-200">{lead.manager_name}</span>
                  </div>
                </div>

                {/* Transporter Legal Attachment Banner */}
                <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-100 block">Dokumen Absah Kemitraan Transport / STNK / SIM:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{lead.transport_doc_name || 'Surat_Penunjukan_Transporter_SegaraLogistik.pdf'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveViewerEvidence({
                      id: `ev-trans-${lead.id}`,
                      lead_id: lead.id,
                      lead_code: lead.lead_code || 'LEAD-00101',
                      stage: 'lead_created',
                      stage_step: 1,
                      file_type: 'dokumen_transporter',
                      file_name: lead.transport_doc_name || 'Surat_Penunjukan_Transporter_SegaraLogistik.pdf',
                      file_size: '1.8 MB',
                      uploaded_at: lead.created_at,
                      uploaded_by: lead.creator_name,
                      uploaded_by_role: 'karyawan',
                      notes: `Dokumen Legal Absah Kemitraan Transport Vendor: ${lead.transport_vendor_name || 'PT Segara Logistik Express'}, Supir: ${lead.nama_supir || 'Bambang Susanto'}, No Plat: ${lead.no_plat_truk || 'B 9842 UFX'}.`,
                    })}
                    className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat & Unduh Dokumen Absah</span>
                  </button>
                </div>

                {/* Location Note */}
                {lead.current_location_note && (
                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center space-x-2">
                    <Truck className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span><strong>Posisi/Status Terakhir:</strong> {lead.current_location_note}</span>
                  </div>
                )}

                {/* Timeline Step details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Detail Alur Siklus Tahap
                  </h4>

                  <div className="space-y-3">
                    {STAGE_LIST.map((stg) => {
                      const isCompleted = lead.current_step > stg.step || isClosed;
                      const isCurrent = lead.current_step === stg.step && !isClosed;
                      const stageEvidenceCount = leadEvidences.filter(e => e.stage_step === stg.step).length;

                      return (
                        <div
                          key={stg.step}
                          className={`p-4 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-slate-800/90 border-teal-500 shadow-md ring-1 ring-teal-500/30'
                              : isCompleted
                              ? 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                              : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isCompleted
                                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                  : isCurrent
                                  ? 'bg-amber-400 text-slate-950 font-bold'
                                  : 'bg-slate-800 text-slate-500'
                              }`}>
                                {stg.step}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-100 text-xs flex items-center space-x-2">
                                  <span>{stg.name}</span>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400 text-slate-950 uppercase font-bold animate-pulse">
                                      Tahap Aktif
                                    </span>
                                  )}
                                </h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">{stg.description}</p>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  Pelaku Wajib: <strong className="text-slate-300">{stg.actor}</strong>
                                </div>
                              </div>
                            </div>

                            {stageEvidenceCount > 0 && (
                              <span className="px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold">
                                {stageEvidenceCount} Berkas Terlampir
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: JEJAK TAHAP DAN BUKTI SELESAI */}
            {activeTab === 'jejak_bukti' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">
                    Audit Jejak Tahap & Lampiran Bukti Dokumen
                  </h4>
                  {!isClosed && (
                    <button
                      onClick={() => setIsEvidenceModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 flex items-center space-x-1 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Bukti Baru</span>
                    </button>
                  )}
                </div>

                {leadEvidences.length === 0 ? (
                  <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800 text-xs text-slate-400">
                    Belum ada bukti yang diunggah untuk lead ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                        <tr>
                          <th className="p-3">ID Lead</th>
                          <th className="p-3">Tahap</th>
                          <th className="p-3">Nomor Log System</th>
                          <th className="p-3">Jenis Bukti</th>
                          <th className="p-3">Nama Berkas</th>
                          <th className="p-3">Pengunggah & Peran</th>
                          <th className="p-3">Waktu Selesai</th>
                          <th className="p-3 text-right">Aksi Berkas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {leadEvidences.map((ev) => (
                          <tr key={ev.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono font-bold text-teal-400 text-[11px]">
                              {ev.lead_code || lead.lead_code || 'LEAD-00101'}
                            </td>
                            <td className="p-3 font-semibold text-teal-300">Tahap {ev.stage_step}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-400">{ev.log_number || 'LOG-SYSTEM'}</td>
                            <td className="p-3 capitalize">{ev.file_type.replace('_', ' ')}</td>
                            <td className="p-3 font-bold text-slate-100 flex items-center space-x-1.5">
                              <FileText className="w-3.5 h-3.5 text-teal-400" />
                              <span>{ev.file_name}</span>
                            </td>
                            <td className="p-3">
                              <div>{ev.uploaded_by}</div>
                              <div className="text-[10px] text-slate-500 uppercase">{ev.uploaded_by_role}</div>
                            </td>
                            <td className="p-3 text-slate-400">{ev.uploaded_at}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setActiveViewerEvidence(ev)}
                                className="px-2.5 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[11px] inline-flex items-center space-x-1 shadow-sm"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat & Unduh</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ISSUES */}
            {activeTab === 'issues' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">Daftar Kendala Lapangan</h4>
                </div>

                {!isClosed && (
                  <form onSubmit={handleCreateIssue} className="flex gap-2">
                    <input
                      type="text"
                      value={newIssueDesc}
                      onChange={(e) => setNewIssueDesc(e.target.value)}
                      placeholder="Laporkan kendala operasional baru (contoh: Kebocoran minor segel / Antrean gate)..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Laporkan Kendala
                    </button>
                  </form>
                )}

                {leadIssues.length === 0 ? (
                  <div className="text-center py-6 bg-slate-800/30 rounded-xl border border-slate-800 text-xs text-slate-400">
                    Tidak ada kendala operasional yang dilaporkan untuk lead ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leadIssues.map((iss) => (
                      <div
                        key={iss.id}
                        className={`p-3.5 rounded-xl border text-xs ${
                          iss.status === 'open'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                iss.status === 'open' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
                              }`}>
                                {iss.status === 'open' ? 'KENDALA TERBUKA' : 'TERSELESAIKAN'}
                              </span>
                              <span className="text-slate-400 text-[11px] font-mono">{iss.log_number}</span>
                            </div>
                            <p className="font-bold text-slate-100 mt-1.5">{iss.deskripsi}</p>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Pelapor: {iss.pelapor_name} ({iss.pelapor_role}) pada {iss.reported_at}
                            </div>
                            {iss.resolution_notes && (
                              <div className="mt-2 p-2 rounded bg-slate-900/60 border border-emerald-500/20 text-emerald-300">
                                <strong>Catatan Solusi:</strong> {iss.resolution_notes} ({iss.resolved_at})
                              </div>
                            )}
                          </div>

                          {iss.status === 'open' && !isClosed && (
                            <button
                              onClick={() => {
                                const notes = prompt('Masukkan catatan penyelesaian kendala ini:');
                                if (notes) resolveIssue(iss.id, notes);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                            >
                              Tandai Selesai
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COMMENTS */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-200">Diskusi & Riwayat Komentar</h4>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {leadComments.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">Belum ada komentar.</div>
                  ) : (
                    leadComments.map((cmt) => (
                      <div key={cmt.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-200">{cmt.user_name} ({cmt.user_role.toUpperCase()})</span>
                          <span className="text-[10px] text-slate-400">{cmt.created_at}</span>
                        </div>
                        <p className="text-slate-300">{cmt.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {!isClosed && (
                  <form onSubmit={handleCreateComment} className="flex gap-2 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      value={newCommentMsg}
                      onChange={(e) => setNewCommentMsg(e.target.value)}
                      placeholder="Tulis pesan komentar diskusi tim..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 shadow-md"
                    >
                      Kirim Pesan
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* Action Footer Bar Matrix */}
          {!isClosed && (
            <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
              <div className="text-xs text-slate-300">
                Aksi Berperan saat ini: <strong className="text-teal-400 capitalize">{currentUser.name} ({currentUser.role})</strong>
              </div>

              <div className="flex items-center space-x-2">
                
                {/* Stage 1: Lead Created -> Send to Approval (Karyawan) */}
                {lead.current_step === 1 && (
                  <button
                    onClick={() => transitionLeadStage(leadId, 'lead_approval', 2, 'Mengajukan lead ke Manager untuk approval.')}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 shadow-md"
                  >
                    Ajukan ke Manager (Stage 2)
                  </button>
                )}

                {/* Stage 2: Manager Approval (Manager) */}
                {lead.current_step === 2 && (currentUser.role === 'manager' || currentUser.role === 'admin') && (
                  <>
                    <button
                      onClick={() => setApprovalModalConfig({
                        isOpen: true,
                        actionType: 'reject_stage_2',
                        targetStage: 'lead_created',
                        targetStep: 1,
                      })}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                    >
                      Tolak Lead
                    </button>
                    <button
                      onClick={() => setApprovalModalConfig({
                        isOpen: true,
                        actionType: 'approve_stage_2',
                        targetStage: 'in_progress',
                        targetStep: 3,
                      })}
                      className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 shadow-md"
                    >
                      Setujui Lead (Stage 3)
                    </button>
                  </>
                )}

                {/* Stage 3: In Progress (Karyawan PIC) */}
                {lead.current_step === 3 && (currentUser.role === 'karyawan' || currentUser.role === 'admin') && (
                  <>
                    <button
                      onClick={() => setIsEvidenceModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl border border-slate-600"
                    >
                      Unggah Bukti Pemuatan
                    </button>
                    <button
                      onClick={() => transitionLeadStage(leadId, 'submission', 4, 'Mengajukan dokumen pengiriman untuk review.')}
                      className="px-4 py-2 bg-indigo-500 text-white font-bold text-xs rounded-xl hover:bg-indigo-400 shadow-md"
                    >
                      Submit untuk Review (Stage 4)
                    </button>
                  </>
                )}

                {/* Stage 4 -> Stage 5: Submission to Review */}
                {lead.current_step === 4 && (
                  <button
                    onClick={() => transitionLeadStage(leadId, 'review', 5, 'Memulai proses verifikasi reviewer.')}
                    className="px-4 py-2 bg-purple-500 text-white font-bold text-xs rounded-xl hover:bg-purple-400 shadow-md"
                  >
                    Mulai Verifikasi Reviewer (Stage 5)
                  </button>
                )}

                {/* Stage 5: Review & Verification (Reviewer / Manager) */}
                {lead.current_step === 5 && (currentUser.role === 'reviewer' || currentUser.role === 'manager' || currentUser.role === 'admin') && (
                  <>
                    <button
                      onClick={() => setApprovalModalConfig({
                        isOpen: true,
                        actionType: 'request_revision_stage_5',
                        targetStage: 'follow_up',
                        targetStep: 6,
                      })}
                      className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl"
                    >
                      Minta Perbaikan (Revisi)
                    </button>
                    <button
                      onClick={() => setApprovalModalConfig({
                        isOpen: true,
                        actionType: 'approve_stage_5',
                        targetStage: 'final_approval',
                        targetStep: 7,
                      })}
                      className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 shadow-md"
                    >
                      Verifikasi OK & Ke Final (Stage 7)
                    </button>
                  </>
                )}

                {/* Stage 6: Follow-up & Issue (Karyawan PIC) */}
                {lead.current_step === 6 && (currentUser.role === 'karyawan' || currentUser.role === 'admin') && (
                  <>
                    <button
                      onClick={() => setIsEvidenceModalOpen(true)}
                      className="px-3 py-2 bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
                    >
                      Unggah Dokumen Perbaikan
                    </button>
                    <button
                      onClick={() => transitionLeadStage(leadId, 'submission', 4, 'Revisi selesai diunggah, mengajukan ulang.')}
                      className="px-4 py-2 bg-indigo-500 text-white font-bold text-xs rounded-xl hover:bg-indigo-400 shadow-md"
                    >
                      Ajukan Ulang ke Review (Stage 4)
                    </button>
                  </>
                )}

                {/* Stage 7: Final Approval (Manager) */}
                {lead.current_step === 7 && (currentUser.role === 'manager' || currentUser.role === 'admin') && (
                  <button
                    onClick={() => setApprovalModalConfig({
                      isOpen: true,
                      actionType: 'approve_stage_7',
                      targetStage: 'closed',
                      targetStep: 8,
                    })}
                    className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                  >
                    Finalize & Close Lead (Stage 8)
                  </button>
                )}

              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sub-modals */}
      <EvidenceUploadModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        leadId={leadId}
        stage={lead.status}
        stageStep={lead.current_step}
      />

      <ApprovalChecklistModal
        isOpen={approvalModalConfig.isOpen}
        onClose={() => setApprovalModalConfig(prev => ({ ...prev, isOpen: false }))}
        leadId={leadId}
        actionType={approvalModalConfig.actionType}
        targetStage={approvalModalConfig.targetStage}
        targetStep={approvalModalConfig.targetStep}
      />

      <FileViewerModal
        isOpen={!!activeViewerEvidence}
        onClose={() => setActiveViewerEvidence(null)}
        evidence={activeViewerEvidence}
      />
    </>
  );
};
