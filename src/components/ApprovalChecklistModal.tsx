import React, { useState } from 'react';
import { X, CheckSquare, AlertTriangle, ShieldCheck, CornerUpLeft, Ship, FileCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeadStatus } from '../types';
import { MANAGER_APPROVAL_CHECKLIST, REVIEWER_VERIFICATION_CHECKLIST, FINAL_APPROVAL_CHECKLIST } from '../data/stageConfig';

interface ApprovalChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  actionType: 'approve_stage_2' | 'reject_stage_2' | 'approve_stage_5' | 'request_revision_stage_5' | 'approve_stage_7' | 'reject_stage_7';
  targetStage: LeadStatus;
  targetStep: number;
}

export const ApprovalChecklistModal: React.FC<ApprovalChecklistModalProps> = ({
  isOpen, onClose, leadId, actionType, targetStage, targetStep
}) => {
  const { transitionLeadStage, updateLeadFinalDelivery, leads } = useApp();
  const lead = leads.find(l => l.id === leadId);

  const isApprovalAction = actionType.startsWith('approve');

  const checklistItems = actionType.includes('stage_2')
    ? MANAGER_APPROVAL_CHECKLIST
    : actionType.includes('stage_5')
    ? REVIEWER_VERIFICATION_CHECKLIST
    : FINAL_APPROVAL_CHECKLIST;

  const [checkedState, setCheckedState] = useState<boolean[]>(
    new Array(checklistItems.length).fill(false)
  );
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Final Delivery Proof inputs if not yet provided on stage 7
  const [finalDocName, setFinalDocName] = useState<string>(
    lead?.final_delivery_doc_name || 'BASTP_Bukti_Sampai_Tujuan.pdf'
  );
  const [receivedBy, setReceivedBy] = useState<string>(
    lead?.final_delivery_received_by || 'Penanggung Jawab Gudang Penerima'
  );

  if (!isOpen || !lead) return null;

  const allChecked = checkedState.every(Boolean);

  const toggleCheck = (index: number) => {
    const updated = [...checkedState];
    updated[index] = !updated[index];
    setCheckedState(updated);
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Rejection or Revision requires mandatory comment
    if (!isApprovalAction && (!comment || comment.trim().length < 5)) {
      setErrorMsg('Komentar wajib diisi minimal 5 karakter jika melakukan Penolakan / Permintaan Revisi!');
      return;
    }

    // Approval requires all checklist items
    if (isApprovalAction && !allChecked) {
      setErrorMsg('Wajib menyetujui seluruh butir kriteria verifikasi checklist sebelum memproses!');
      return;
    }

    // If approving Stage 7 (Final Approval for Closure)
    if (actionType === 'approve_stage_7') {
      if (!lead.final_delivery_doc_name && !finalDocName.trim()) {
        setErrorMsg('Bukti berupa dokumen atau foto bahwa pengiriman telah sampai di tujuan (Proof of Delivery / BASTP) wajib dilampirkan!');
        return;
      }

      if (!lead.final_delivery_doc_name && finalDocName.trim()) {
        updateLeadFinalDelivery(leadId, {
          final_delivery_doc_name: finalDocName,
          final_delivery_received_by: receivedBy || 'Penerima Lokasi Tujuan',
          final_delivery_date: new Date().toLocaleString('id-ID') + ' WIB',
        });
      }
    }

    const res = transitionLeadStage(leadId, targetStage, targetStep, comment, true);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isApprovalAction ? 'bg-teal-950/40 border-teal-800/60' : 'bg-rose-950/40 border-rose-800/60'
        }`}>
          <div className="flex items-center space-x-2">
            {isApprovalAction ? (
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {isApprovalAction ? 'Konfirmasi Approval & Checklist Kepatuhan' : 'Form Penolakan / Minta Revisi'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Lead [{lead.lead_code || 'LEAD-00101'}] #{lead.no_surat_jalan} ({lead.muatan})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleExecute} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Stage 2 Inter-Island Vessel Verification Badge */}
          {actionType === 'approve_stage_2' && lead.is_inter_island && (
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs space-y-1.5">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold">
                <Ship className="w-4 h-4" />
                <span>Rute Antar-Pulau Terdeteksi (Verifikasi Kapal Kargo Laut)</span>
              </div>
              <div className="text-slate-300 text-[11px] space-y-0.5">
                <div>Perusahaan Kapal: <strong className="text-slate-100">{lead.shipping_company}</strong></div>
                <div>Kapal & Voyage: <strong className="text-cyan-300">{lead.vessel_name}</strong> ({lead.voyage_number})</div>
                <div>Jadwal Pelayaran: <span className="text-slate-400">{lead.vessel_schedule}</span></div>
                <div>Lampiran Tiket: <strong className="text-teal-300 font-mono">{lead.vessel_ticket_doc_name || 'Tiket_Booking_Kapal.pdf'}</strong></div>
              </div>
            </div>
          )}

          {/* Stage 7 Proof of Final Delivery Required */}
          {actionType === 'approve_stage_7' && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <FileCheck className="w-4 h-4" />
                <span>Bukti Dokumen / Foto Bahwa Pengiriman Telah Sampai Tujuan (Syarat Final Lead)</span>
              </div>
              
              {lead.final_delivery_doc_name ? (
                <div className="text-slate-300 text-[11px] space-y-0.5">
                  <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dokumen Ketibaan Tersedia: <strong>{lead.final_delivery_doc_name}</strong></span>
                  </div>
                  <div>Penerima di Tujuan: <span className="text-slate-100 font-bold">{lead.final_delivery_received_by}</span> ({lead.final_delivery_date})</div>
                </div>
              ) : (
                <div className="space-y-2 pt-1 border-t border-emerald-500/20">
                  <p className="text-[11px] text-slate-300">
                    Konfirmasikan bukti dokumen / foto ketibaan (Proof of Delivery / BASTP) dan nama penerima di lokasi tujuan akhir:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Nama Dokumen / Foto Ketibaan:</label>
                      <input
                        type="text"
                        value={finalDocName}
                        onChange={(e) => setFinalDocName(e.target.value)}
                        placeholder="Contoh: BASTP_Penerimaan_Tujuan.pdf"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Nama Pihak Penerima:</label>
                      <input
                        type="text"
                        value={receivedBy}
                        onChange={(e) => setReceivedBy(e.target.value)}
                        placeholder="Nama Staff Gudang Penerima"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isApprovalAction ? (
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                Checklist Kriteria Verifikasi Wajib (Centang Semua):
              </label>
              <div className="space-y-2.5 bg-slate-800/50 border border-slate-700/80 rounded-xl p-3.5">
                {checklistItems.map((item) => (
                  <label key={item} className="flex items-start space-x-3 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={checkedState[idx]}
                      onChange={() => toggleCheck(idx)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500 bg-slate-900"
                    />
                    <span className={checkedState[idx] ? 'text-slate-100 font-medium' : 'text-slate-400'}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              Penolakan/Permintaan revisi akan mengembalikan status Lead ke Tahap {targetStep} ({targetStage.toUpperCase()}) dan mewajibkan karyawan melakukan perbaikan.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Catatan & Komentar {!isApprovalAction && <span className="text-rose-400">*Wajib</span>}:
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isApprovalAction ? 'Catatan persetujuan opsional...' : 'Jelaskan alasan detail penolakan/revisi yang harus diperbaiki...'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:border-teal-500 focus:outline-none h-24"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all ${
                isApprovalAction
                  ? 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-teal-500/20'
                  : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {isApprovalAction ? 'Setujui & Lanjutkan Transisi' : 'Kirim Penolakan / Permintaan Revisi'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
