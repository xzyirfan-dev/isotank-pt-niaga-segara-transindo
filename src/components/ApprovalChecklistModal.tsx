import React, { useState } from 'react';
import { X, CheckSquare, AlertTriangle, ShieldCheck, CornerUpLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeadStatus } from '../types';
import { MANAGER_APPROVAL_CHECKLIST, REVIEWER_VERIFICATION_CHECKLIST } from '../data/stageConfig';

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
  const { transitionLeadStage, leads } = useApp();
  const lead = leads.find(l => l.id === leadId);

  const isApprovalAction = actionType.startsWith('approve');

  const checklistItems = actionType.includes('stage_2')
    ? MANAGER_APPROVAL_CHECKLIST
    : actionType.includes('stage_5')
    ? REVIEWER_VERIFICATION_CHECKLIST
    : [
        'Seluruh dokumen bukti fisik dan digital lengkap terverifikasi 100%.',
        'Tidak ada kendala operasional terbuka (Zero Open Issues).',
        'Memenuhi syarat ketepatan waktu SLA & standar kualitas ISO Niaga Segara Trasindo.',
      ];

  const [checkedState, setCheckedState] = useState<boolean[]>(
    new Array(checklistItems.length).fill(false)
  );
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

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

    const res = transitionLeadStage(leadId, targetStage, targetStep, comment, true);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
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
              <p className="text-[11px] text-slate-400">Lead #{lead.no_surat_jalan} ({lead.muatan})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleExecute} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isApprovalAction ? (
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                Checklist Kriteria Verifikasi Wajib (Centang Semua):
              </label>
              <div className="space-y-2.5 bg-slate-800/50 border border-slate-700/80 rounded-xl p-3.5">
                {checklistItems.map((item, idx) => (
                  <label key={idx} className="flex items-start space-x-3 cursor-pointer text-xs text-slate-300">
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
