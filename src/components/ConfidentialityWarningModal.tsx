import React from 'react';
import { ShieldAlert, AlertTriangle, Eye, Lock, X } from 'lucide-react';

interface ConfidentialityWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fieldName: string;
  leadCode: string;
  userName: string;
  userRole: string;
}

export const ConfidentialityWarningModal: React.FC<ConfidentialityWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fieldName,
  leadCode,
  userName,
  userRole
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Akses Data Sensitif & Rahasia</h3>
            <p className="text-xs text-slate-400">Klasifikasi: Dokumen Resmi Perusahaan (Confidential)</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Pemberitahuan Audit Trail:</strong> Membuka data <strong>{fieldName}</strong> pada lead <span className="font-mono font-bold text-amber-300">{leadCode}</span> akan otomatis dicatat ke dalam log audit keamanan yang <strong>tidak dapat diubah (append-only)</strong>.
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-[11px] text-slate-400 space-y-1">
            <div>Operator: <span className="text-slate-200">{userName} ({userRole.toUpperCase()})</span></div>
            <div>Tindakan: <span className="text-teal-300">UNMASK_SENSITIVE_DATA</span></div>
            <div>Waktu: <span className="text-slate-200">{new Date().toLocaleString('id-ID')}</span></div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-900/30 flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Buka & Catat Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
