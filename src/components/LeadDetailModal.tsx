import React, { useState } from 'react';
import {
  X, Truck, Clock, ShieldCheck, FileText, CheckCircle2, AlertCircle,
  MessageSquare, Upload, AlertTriangle, Printer, ExternalLink, ChevronRight,
  UserCheck, ArrowRight, CornerDownRight, Check, Eye, Download, Ship, Anchor
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
    leads, evidences, issues, comments, currentUser, auditLogs, users,
    addIssue, resolveIssue, addComment, transitionLeadStage,
    updateLeadVesselBooking, updateLeadFinalDelivery,
    detailDisplayMode, setDetailDisplayMode, requestRevisionWithReason
  } = useApp();

  const [activeTab, setActiveTab] = useState<'timeline' | 'jejak_bukti' | 'issues' | 'comments'>('timeline');
  const [newIssueDesc, setNewIssueDesc] = useState('');
  const [newCommentMsg, setNewCommentMsg] = useState('');
  const [activeViewerEvidence, setActiveViewerEvidence] = useState<any>(null);

  // Mandatory Reason for Rejection / Revision modal
  const [isRevisionReasonOpen, setIsRevisionReasonOpen] = useState(false);
  const [mandatoryReasonText, setMandatoryReasonText] = useState('');

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

  const isDrawer = detailDisplayMode === 'drawer';

  const renderMessageWithMentions = (text: string) => {
    const parts = text.split(/(@[A-Za-z\s]+?)(?=[.,!?:;]|\s|$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="inline-block px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 text-[11px] mr-0.5">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex ${
        isDrawer ? 'justify-end overflow-hidden' : 'items-center justify-center p-2 sm:p-4 overflow-y-auto'
      }`}>
        <div className={`${
          isDrawer
            ? 'w-full max-w-2xl h-full border-l border-slate-700 shadow-2xl'
            : 'w-full max-w-4xl rounded-2xl border border-slate-700 shadow-2xl my-auto max-h-[92vh]'
        } bg-slate-900 overflow-hidden flex flex-col animate-fadeIn`}>
          
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40 tabular-nums">
                    {lead.lead_code || 'LEAD-00101'}
                  </span>
                  <span className="font-extrabold text-slate-100 text-base font-mono">{lead.no_surat_jalan}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-700 text-teal-300 font-mono">
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
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center space-x-1 tabular-nums ${
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

              {/* Drawer vs Modal Toggle */}
              <button
                onClick={() => setDetailDisplayMode(isDrawer ? 'modal' : 'drawer')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors no-print"
                title={isDrawer ? 'Beralih ke Tampilan Modal Layar Penuh' : 'Beralih ke Tampilan Drawer Samping'}
              >
                {isDrawer ? '⤢ Modal' : '⇥ Drawer'}
              </button>

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
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping inline-block" />
                <span>Alur Transaksional 8 Tahap Operasional:</span>
              </span>
              <span className="text-teal-400 font-mono tabular-nums text-xs font-bold">
                Tahap {lead.current_step} dari 8 ({lead.progress_percentage}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${lead.progress_percentage}%` }}
              />
            </div>

            {/* Stepper items with strict contrast and weight separation */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center">
              {STAGE_LIST.map((stg) => {
                const isPassed = lead.current_step > stg.step || isClosed;
                const isCurrent = lead.current_step === stg.step && !isClosed;
                return (
                  <div key={stg.step} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                        isCurrent
                          ? 'bg-white text-slate-950 font-black ring-4 ring-teal-400/50 shadow-lg scale-105 z-10'
                          : isPassed
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-sm shadow-teal-500/20'
                          : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 font-medium'
                      }`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : stg.step}
                    </div>
                    <span className={`text-[10px] mt-1.5 truncate w-full ${
                      isCurrent
                        ? 'text-white font-black underline underline-offset-2 decoration-teal-400'
                        : isPassed
                        ? 'text-slate-200 font-semibold'
                        : 'text-slate-500 font-normal'
                    }`}>
                      {stg.shortName}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Active Stage & PIC Banner */}
            {(() => {
              const currentStageInfo = STAGE_LIST.find(s => s.step === lead.current_step) || STAGE_LIST[0];
              return (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-teal-500/40 shadow-inner flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black text-sm shrink-0">
                      {lead.current_step}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-[11px] uppercase tracking-wider font-extrabold text-teal-400">
                          Tahap Aktif: {currentStageInfo.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                          Aktor: {currentStageInfo.actor}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5 font-medium leading-relaxed">
                        {currentStageInfo.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 text-xs pl-2 border-l border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">PIC Pelaksana:</span>
                      <span className="text-slate-100 font-bold">{lead.pic_name || 'Budi Santoso'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Status Tahap:</span>
                      <span className="text-teal-300 font-bold">
                        {lead.current_step === 8
                          ? 'Arsip Final Selesai'
                          : lead.current_step === 6
                          ? 'Perlu Revisi PIC'
                          : lead.current_step === 2 || lead.current_step === 7
                          ? 'Menunggu Approval'
                          : 'Dalam Proses'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
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

                {/* Inter-Island Sea Freight (Kapal Kargo) Section */}
                {lead.is_inter_island ? (
                  <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                          <Ship className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-100 text-xs">Pencarian & Pemesanan Kapal Kargo Antar-Pulau</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              MULTIMODA SEA FREIGHT
                            </span>
                          </div>
                          <span className="text-[11px] text-cyan-300/80">Pengangkutan Truk & Unit Isotank via Kapal Laut</span>
                        </div>
                      </div>

                      {lead.vessel_ticket_doc_name && (
                        <button
                          onClick={() => setActiveViewerEvidence({
                            id: `ev-ship-${lead.id}`,
                            lead_id: lead.id,
                            lead_code: lead.lead_code || 'LEAD-00101',
                            stage: 'lead_approval',
                            stage_step: 2,
                            file_type: 'tiket_kapal',
                            file_name: lead.vessel_ticket_doc_name,
                            file_size: '2.1 MB',
                            uploaded_at: lead.created_at,
                            uploaded_by: lead.creator_name,
                            uploaded_by_role: 'karyawan',
                            notes: `Form Pemesanan / Tiket Kapal Kargo Resmi: Perusahaan ${lead.shipping_company || '-'}, Kapal ${lead.vessel_name || '-'}, No. Voyage / ID Perjalanan: ${lead.voyage_number || '-'}, Rute: ${lead.port_origin || '-'} -> ${lead.port_destination || '-'}, Jadwal: ${lead.vessel_schedule || '-'}.`,
                          })}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat & Unduh Tiket Kapal</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Perusahaan Jasa Kapal:</span>
                        <strong className="text-cyan-200 font-bold">{lead.shipping_company || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Nama Kapal & No. Perjalanan (Voyage):</span>
                        <strong className="text-slate-100">{lead.vessel_name || '-'} {lead.voyage_number ? `(${lead.voyage_number})` : ''}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Pelabuhan Muat &rarr; Bongkar:</span>
                        <span className="text-slate-200 font-medium">{lead.port_origin || '-'} &rarr; {lead.port_destination || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Jadwal Keberangkatan & Ketibaan:</span>
                        <span className="text-amber-300 font-medium">{lead.vessel_schedule || '-'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Truck className="w-4 h-4 text-slate-500" />
                      <span>Rute Darat Reguler (Bila memerlukan kapal penyeberangan kargo antar-pulau, dapat diaktifkan)</span>
                    </div>
                    {!isClosed && (
                      <button
                        onClick={() => {
                          const shipCo = prompt('Nama Perusahaan Jasa Kapal Kargo:', 'PT Pelayaran Meratus Line');
                          if (shipCo) {
                            const shipName = prompt('Nama Kapal & No. Voyage / Perjalanan:', 'KM Meratus Banjar - VOY-8841');
                            const sched = prompt('Jadwal Keberangkatan / Ketibaan (ETD/ETA):', 'ETD: Hari +1 19:00 WIB | ETA: Hari +3 08:00 WITA');
                            const pOrigin = prompt('Pelabuhan Asal Muat:', 'Pelabuhan Tanjung Perak, Surabaya');
                            const pDest = prompt('Pelabuhan Tujuan Bongkar:', 'Pelabuhan Trisakti, Banjarmasin');
                            const ticketDoc = prompt('Nama Berkas Tiket/Form Pemesanan Kapal:', 'Form_Booking_Tiket_Kapal_Resmi.pdf');
                            updateLeadVesselBooking(lead.id, {
                              is_inter_island: true,
                              shipping_company: shipCo,
                              vessel_name: shipName || 'KM Kargo Niaga',
                              voyage_number: 'VOY-REGULER',
                              vessel_schedule: sched || 'Jadwal Reguler',
                              port_origin: pOrigin || 'Pelabuhan Muat',
                              port_destination: pDest || 'Pelabuhan Bongkar',
                              vessel_ticket_doc_name: ticketDoc || 'Form_Booking_Tiket_Kapal.pdf'
                            });
                          }
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold underline"
                      >
                        + Tambah Pengiriman Kapal Antar-Pulau
                      </button>
                    )}
                  </div>
                )}

                {/* Final Delivery Arrival Proof (Dokumen / Foto Sampai Tujuan - BASTP) */}
                {lead.final_delivery_doc_name ? (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-100 text-xs">Bukti Dokumen / Foto Pengiriman Telah Sampai Tujuan</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              STATUS: TIBA DI TUJUAN (BASTP SAH)
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-300/80">Dokumen Absah Penyelesaian Lead & Verifikasi Final Ketibaan</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveViewerEvidence({
                          id: `ev-arrival-${lead.id}`,
                          lead_id: lead.id,
                          lead_code: lead.lead_code || 'LEAD-00101',
                          stage: 'final_approval',
                          stage_step: 7,
                          file_type: 'bukti_sampai_tujuan',
                          file_name: lead.final_delivery_doc_name || 'BASTP_Bukti_Sampai_Tujuan.pdf',
                          file_size: '2.4 MB',
                          uploaded_at: lead.final_delivery_date || new Date().toISOString(),
                          uploaded_by: lead.final_delivery_received_by || 'Staff Gudang Penerima',
                          uploaded_by_role: 'reviewer',
                          notes: `Verifikasi Kedatangan: Muatan isotank ${lead.asset_code} telah sampai di tujuan (${lead.tujuan}) dengan selamat. Diterima dan ditandatangani oleh: ${lead.final_delivery_received_by}. Berita Acara Serah Terima & Foto Ketibaan telah diverifikasi sah.`,
                        })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat & Unduh Bukti Sampai Tujuan</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Nama Berkas Absah:</span>
                        <strong className="text-emerald-300 font-mono text-[11px]">{lead.final_delivery_doc_name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Diterima & Ditandatangani Oleh:</span>
                        <strong className="text-slate-100">{lead.final_delivery_received_by || 'Supervisor Gudang Penerima'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Waktu / Tanggal Kedatangan:</span>
                        <span className="text-slate-200">{lead.final_delivery_date || 'Tercatat Sesuai Berita Acara'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  (lead.current_step >= 6 || lead.status === 'final_approval') && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-amber-300">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                        <div>
                          <span className="font-bold block">Dokumen / Foto Bukti Sampai Tujuan Belum Terlampir</span>
                          <span className="text-[11px] text-amber-300/80">Untuk menyelesaikan lead ke Stage 8 (Closed), lampirkan dokumen BASTP atau foto ketibaan di tujuan.</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const doc = prompt('Masukkan nama berkas BASTP / Foto Ketibaan Tujuan:', `BASTP_${lead.no_surat_jalan}_Tiba.pdf`);
                          if (doc) {
                            const receiver = prompt('Nama Petugas/Penerima di Lokasi Tujuan:', 'Bpk. Hendrawan (Supervisor Gudang Pabrik)');
                            updateLeadFinalDelivery(lead.id, {
                              final_delivery_doc_name: doc,
                              final_delivery_received_by: receiver || 'Penerima Gudang Tujuan',
                              final_delivery_date: new Date().toLocaleString('id-ID')
                            });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                      >
                        + Lampirkan Bukti Ketibaan Sekarang
                      </button>
                    </div>
                  )
                )}

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
                            <td className="p-3">
                              {ev.file_type === 'tiket_kapal' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center space-x-1">
                                  <span>🚢 Tiket Kapal</span>
                                </span>
                              ) : ev.file_type === 'bukti_sampai_tujuan' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center space-x-1">
                                  <span>✓ BASTP / Sampai Tujuan</span>
                                </span>
                              ) : ev.file_type === 'dokumen_transporter' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Dokumen Transporter
                                </span>
                              ) : ev.file_type === 'surat_jalan' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                  Surat Jalan Resmi
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                                  {ev.file_type.replace(/_/g, ' ')}
                                </span>
                              )}
                            </td>
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

            {/* TAB 4: COMMENTS WITH @MENTIONS */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">Diskusi Internal & Catatan Alur Kerja</h4>
                  <span className="text-[10px] text-slate-400">Gunakan @nama untuk mention rekan tim</span>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {leadComments.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">Belum ada komentar.</div>
                  ) : (
                    leadComments.map((cmt) => (
                      <div key={cmt.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{cmt.user_name} ({cmt.user_role.toUpperCase()})</span>
                          <span className="text-[10px] text-slate-400">{cmt.created_at}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{renderMessageWithMentions(cmt.message)}</p>
                      </div>
                    ))
                  )}
                </div>

                {!isClosed && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {/* Quick Mention Pills */}
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 text-[11px] text-slate-400">
                      <span>Mention:</span>
                      {users.slice(0, 4).map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setNewCommentMsg(prev => prev + `@${u.name} `)}
                          className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[10px] font-semibold transition-colors"
                        >
                          @{u.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleCreateComment} className="flex gap-2">
                      <input
                        type="text"
                        value={newCommentMsg}
                        onChange={(e) => setNewCommentMsg(e.target.value)}
                        placeholder="Tulis pesan komentar diskusi tim (@Budi, @Probo)..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 shadow-md active:scale-95 transition-all"
                      >
                        Kirim Pesan
                      </button>
                    </form>
                  </div>
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
                      onClick={() => setIsRevisionReasonOpen(true)}
                      className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl"
                    >
                      Minta Revisi (Alasan Wajib)
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

      {/* Mandatory Revision Reason Modal */}
      {isRevisionReasonOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-slate-100">Alasan Wajib Penolakan / Permintaan Revisi</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sesuai aturan kepatuhan operasional PT Niaga Segara Trasindo, Anda wajib mencantumkan alasan spesifik dan perbaikan yang diminta agar Karyawan PIC dapat menindaklanjutinya pada Tahap 6 (Follow-up).
            </p>
            <textarea
              rows={3}
              value={mandatoryReasonText}
              onChange={(e) => setMandatoryReasonText(e.target.value)}
              placeholder="Tuliskan kendala spesifik: misal berkas STNK buram, valve bocor, atau kekurangan tanda tangan BASTP..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:border-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setIsRevisionReasonOpen(false);
                  setMandatoryReasonText('');
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Batal
              </button>
              <button
                disabled={!mandatoryReasonText.trim()}
                onClick={() => {
                  requestRevisionWithReason(leadId, mandatoryReasonText.trim());
                  setIsRevisionReasonOpen(false);
                  setMandatoryReasonText('');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
              >
                Kirim Permintaan Revisi (Stage 6)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
