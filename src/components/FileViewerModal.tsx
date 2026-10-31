import React, { useState } from 'react';
import {
  X, Download, Eye, Printer, FileText, Image as ImageIcon, ShieldCheck,
  CheckCircle2, ZoomIn, ZoomOut, RotateCw, ExternalLink, Lock
} from 'lucide-react';
import { Evidence } from '../types';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: Evidence | null;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  evidence,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  if (!isOpen || !evidence) return null;

  const handleDownload = () => {
    let downloadUrl = evidence.file_data_url;

    // If no custom data URL (e.g., standard mock document), construct SVG/PDF document blob URL
    if (!downloadUrl) {
      const docHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">
          <rect width="800" height="1100" fill="#ffffff"/>
          <rect x="40" y="40" width="720" height="1020" fill="none" stroke="#0f172a" stroke-width="4"/>
          
          <!-- Header -->
          <rect x="60" y="60" width="680" height="120" fill="#0b1f3a"/>
          <text x="90" y="110" fill="#14b8a6" font-family="sans-serif" font-size="24" font-weight="bold">PT NIAGA SEGARA TRASINDO</text>
          <text x="90" y="140" fill="#ffffff" font-family="sans-serif" font-size="14">DOKUMEN RESMI BUKTI OPERASIONAL ARMADA ISOTANK</text>
          
          <!-- Metadata Box -->
          <rect x="60" y="200" width="680" height="180" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
          <text x="80" y="230" fill="#0f172a" font-family="sans-serif" font-size="16" font-weight="bold">ID LEAD: ${evidence.lead_code || 'LEAD-00101'}</text>
          <text x="80" y="260" fill="#334155" font-family="sans-serif" font-size="14">Nama Berkas: ${evidence.file_name}</text>
          <text x="80" y="290" fill="#334155" font-family="sans-serif" font-size="14">Jenis Dokumen: ${evidence.file_type.toUpperCase().replace('_', ' ')}</text>
          <text x="80" y="320" fill="#334155" font-family="sans-serif" font-size="14">Tahap Operasional: Stage ${evidence.stage_step} (${evidence.stage.toUpperCase()})</text>
          <text x="80" y="350" fill="#334155" font-family="sans-serif" font-size="14">Nomor Audit System Log: ${evidence.log_number || 'LOG-SYSTEM'}</text>

          <!-- Seal / Stamp -->
          <circle cx="620" cy="290" r="50" fill="none" stroke="#0ea5e9" stroke-width="4" stroke-dasharray="6 3"/>
          <text x="620" y="285" fill="#0ea5e9" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">OFFICIAL STAMP</text>
          <text x="620" y="305" fill="#0ea5e9" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">VERIFIED</text>

          <!-- Details & Notes -->
          <text x="60" y="420" fill="#0f172a" font-family="sans-serif" font-size="16" font-weight="bold">Informasi Pengunggahan & Verifikasi:</text>
          <text x="80" y="450" fill="#334155" font-family="sans-serif" font-size="14">Pengunggah: ${evidence.uploaded_by} (${evidence.uploaded_by_role.toUpperCase()})</text>
          <text x="80" y="480" fill="#334155" font-family="sans-serif" font-size="14">Waktu Unggah: ${evidence.uploaded_at}</text>
          <text x="80" y="510" fill="#334155" font-family="sans-serif" font-size="14">Catatan Operasional: ${evidence.notes || 'Berkas lengkap dan sesuai standar keselamatan IsoTrack.'}</text>

          <!-- Watermark -->
          <text x="400" y="700" fill="#e2e8f0" font-family="sans-serif" font-size="60" font-weight="bold" text-anchor="middle" transform="rotate(-30, 400, 700)">PT NST VERIFIED</text>

          <!-- Footer -->
          <line x1="60" y1="980" x2="740" y2="980" stroke="#cbd5e1" stroke-width="2"/>
          <text x="400" y="1010" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">PT Niaga Segara Trasindo - Sistem Manajemen Transaksi Isotank IsoTrack</text>
        </svg>
      `;

      const blob = new Blob([docHtml], { type: 'image/svg+xml' });
      downloadUrl = URL.createObjectURL(blob);
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${evidence.lead_code || 'LEAD'}_${evidence.file_name.replace(/\s+/g, '_')}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold font-mono">
              {evidence.file_data_url ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  {evidence.lead_code || 'LEAD-00101'}
                </span>
                <span className="font-extrabold text-slate-100 text-sm">{evidence.file_name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-700 text-teal-300">
                  Stage {evidence.stage_step}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Jenis: <strong className="text-teal-300 capitalize">{evidence.file_type.replace('_', ' ')}</strong> · Ukuran: <span className="text-slate-300 font-mono">{evidence.file_size}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {evidence.file_data_url && (
              <>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Rotate Image"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-extrabold text-xs hover:bg-teal-400 flex items-center space-x-1.5 shadow-lg shadow-teal-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 no-print"
              title="Cetak Berkas"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white no-print">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/80">
          {evidence.file_data_url ? (
            <div className="relative overflow-auto max-w-full max-h-[60vh] flex items-center justify-center">
              <img
                src={evidence.file_data_url}
                alt={evidence.file_name}
                className="transition-all duration-200 rounded-xl shadow-2xl border border-slate-800 object-contain max-h-[55vh]"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                }}
              />
            </div>
          ) : (
            /* Document Digital Official Sheet Preview */
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-xs text-slate-200">
              
              {/* Document Letterhead */}
              <div className="border-b border-slate-700 pb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-black flex items-center justify-center text-sm font-mono">
                    NST
                  </div>
                  <div>
                    <div className="font-extrabold text-teal-400 uppercase tracking-widest text-xs">PT NIAGA SEGARA TRASINDO</div>
                    <div className="text-[11px] text-slate-300 font-bold uppercase mt-0.5">
                      DOKUMEN RESMI {evidence.file_type.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold">
                    VERIFIED DOCUMENT
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">ID Lead:</span>
                  <strong className="text-teal-300 font-mono text-sm">{evidence.lead_code || 'LEAD-00101'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Nomor System Log:</span>
                  <strong className="text-slate-100 font-mono">{evidence.log_number || 'LOG-SYSTEM'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Tahap Operasional:</span>
                  <span className="text-slate-200">Stage {evidence.stage_step} ({evidence.stage.toUpperCase()})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Pengunggah Berkas:</span>
                  <span className="text-slate-200">{evidence.uploaded_by} ({evidence.uploaded_by_role.toUpperCase()})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Waktu Pengunggahan:</span>
                  <span className="text-slate-200 font-mono">{evidence.uploaded_at}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Ukuran File:</span>
                  <span className="text-slate-200 font-mono">{evidence.file_size}</span>
                </div>
              </div>

              {/* Notes */}
              {evidence.notes && (
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-300">
                  <strong className="text-teal-300 block mb-1">Catatan Verifikasi Berkas:</strong>
                  <p className="text-[11px] italic">&quot;{evidence.notes}&quot;</p>
                </div>
              )}

              {/* Seal Notice */}
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Dokumen ini telah melalui verifikasi digital standar keselamatan ISO-9001 & HAZMAT PT NST.</span>
              </div>

            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300 shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Klik **Unduh Berkas** untuk menyimpan file resmi ke perangkat Anda.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-teal-400 flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-xs"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
