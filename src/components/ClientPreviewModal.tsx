import React from 'react';
import { X, Eye, ExternalLink, ShieldCheck } from 'lucide-react';
import { PublicClientTrackingView } from '../views/PublicClientTrackingView';
import { PublicTrackingPayload } from '../types';

interface ClientPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: PublicTrackingPayload | null;
}

export const ClientPreviewModal: React.FC<ClientPreviewModalProps> = ({
  isOpen,
  onClose,
  payload
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-fadeIn">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center space-x-2">
                <span>Pratinjau Tampilan Klien Publik</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold">
                  PRIVASI TERJAGA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Data yang ditampilkan telah disaring oleh Whitelist Layer. Catatan internal & nilai kontrak 100% tersembunyi.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {payload?.token && (
              <a
                href={`/t/${payload.token}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold border border-slate-600 inline-flex items-center space-x-1"
              >
                <span>Buka Rute Publik</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Notice Bar */}
        <div className="px-6 py-2.5 bg-teal-500/10 border-b border-teal-500/20 text-xs text-teal-300 flex items-center space-x-2 shrink-0 font-mono">
          <ShieldCheck className="w-4 h-4 shrink-0 text-teal-400" />
          <span>Audit Status: Field terlarang (Internal Notes, Rejection Reasons, Lead Internal ID, Contract Price) telah disaring.</span>
        </div>

        {/* Body View Container */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-2 md:p-4">
          <PublicClientTrackingView payload={payload} isSimulatedPreview={true} />
        </div>

      </div>
    </div>
  );
};
