import React, { useEffect } from 'react';
import { Truck, Ship, Anchor, FileText, CheckCircle2, Clock, AlertCircle, Phone, Mail, ShieldAlert, ChevronRight, Download } from 'lucide-react';
import { PublicTrackingPayload } from '../types';
import { downloadClientServiceOrderPDF } from '../utils/reportExport';

interface PublicClientTrackingViewProps {
  payload?: PublicTrackingPayload | null;
  invalidMessage?: string;
  isSimulatedPreview?: boolean;
}

export const PublicClientTrackingView: React.FC<PublicClientTrackingViewProps> = ({
  payload,
  invalidMessage = 'Link tidak valid atau sudah tidak berlaku. Silakan hubungi perusahaan.',
  isSimulatedPreview = false
}) => {
  // Set meta tags for privacy & SEO noindex
  useEffect(() => {
    if (typeof document !== 'undefined') {
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', 'noindex, nofollow');
    }
  }, []);

  if (!payload) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-2xl animate-fadeIn">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-100">Informasi Pelacakan</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {invalidMessage}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-500">
            PT Niaga Segara Trasindo &middot; Layanan Pengiriman Isotank
          </div>
        </div>
      </div>
    );
  }

  const getStageIcon = (iconType: string) => {
    switch (iconType) {
      case 'ship':
        return <Ship className="w-4 h-4" />;
      case 'dock':
        return <Anchor className="w-4 h-4" />;
      case 'depo':
        return <Truck className="w-4 h-4" />;
      case 'doc':
        return <FileText className="w-4 h-4" />;
      case 'flag':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Truck className="w-4 h-4" />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white ${isSimulatedPreview ? 'p-2' : 'p-4 md:p-8'}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Branding (Pure External View - No Internal App Navigation) */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black text-sm">
                NST
              </div>
              <div>
                <h1 className="text-base font-black text-slate-100">PT Niaga Segara Trasindo</h1>
                <p className="text-xs text-slate-400">Portal Informasi Pelacakan Pengiriman Klien</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => {
                  const leadData = {
                    lead_code: payload.displayRefNo || 'LEAD-00101',
                    no_surat_jalan: payload.displayRefNo || 'SJ-NST-2026-0001',
                    client_company: payload.clientCompany,
                    muatan: payload.cargoType,
                    asal: payload.ruteAsal,
                    tujuan: payload.ruteTujuan,
                    target_at: payload.finalEtaRange || new Date().toISOString(),
                    asset_code: 'ISO-20T-13',
                    transport_vendor_name: 'PT Segara Logistik Express',
                    no_plat_truk: 'B 9842 UFX',
                    nama_supir: 'Bambang Susanto',
                    current_step: 2,
                    manager_name: 'Probo Subagyo, M.M.',
                    volume_tonase: 24,
                    created_at: payload.lastUpdatedAt || new Date().toISOString()
                  };
                  downloadClientServiceOrderPDF(leadData);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md transition-transform active:scale-95 no-print flex items-center space-x-1.5"
                title="Unduh Dokumen Surat Konfirmasi Pemesanan Jasa & Work Order (PDF Sah)"
              >
                <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                <span>📄 Surat Order Jasa (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors no-print"
                title="Cetak Bukti Pelacakan"
              >
                🖨️ Cetak
              </button>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">No. Referensi Surat Jalan</span>
                <span className="text-sm font-mono font-black text-teal-300">{payload.displayRefNo}</span>
              </div>
            </div>
          </div>

          {/* Service Summary Grid (Filtered Whitelist Only) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Perusahaan Pemesan:</span>
              <strong className="text-slate-100 font-bold truncate block">{payload.clientCompany}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Jenis Layanan / Muatan:</span>
              <strong className="text-teal-300 font-bold truncate block">{payload.cargoType}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Rute Pengiriman:</span>
              <span className="text-slate-200 font-medium truncate block">{payload.ruteAsal} &rarr; {payload.ruteTujuan}</span>
            </div>
          </div>
        </div>

        {/* Action Required Banner (Controlled Exception) */}
        {payload.needsClientAction && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg animate-pulse">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="font-bold block text-slate-100">Tindakan Diperlukan Dari Anda</strong>
                <span>{payload.clientActionText || 'Menunggu kelengkapan dokumen dari Anda.'}</span>
              </div>
            </div>
            <a
              href={`tel:${payload.companyContact.phone}`}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs inline-flex items-center space-x-1.5 shadow-md"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hubungi CS</span>
            </a>
          </div>
        )}

        {/* Current Active Status & ETA Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-teal-500/40 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block font-mono">Tahap Layanan Aktif Saat Ini</span>
              <h2 className="text-lg font-black text-slate-100 mt-0.5">{payload.activeStageLabel}</h2>
            </div>
            <div className="px-3 py-1.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center space-x-1.5">
              <Clock className="w-4 h-4" />
              <span>{payload.finalEtaRange}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Status diperbarui secara real-time pada: <span className="text-slate-300 font-mono">{payload.lastUpdatedAt}</span>
          </p>
        </div>

        {/* Monotonic Stage Progress Steps List */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Progres Siklus Tahap Pengiriman
          </h3>

          <div className="space-y-3">
            {payload.clientStages.map((stg) => {
              const isPassed = stg.status === 'selesai';
              const isCurrent = stg.status === 'berjalan';

              return (
                <div
                  key={stg.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-800/95 border-teal-500 shadow-lg ring-1 ring-teal-500/30'
                      : isPassed
                      ? 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isPassed
                        ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                        : isCurrent
                        ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {getStageIcon(stg.iconType)}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-extrabold text-slate-100 text-xs">{stg.order}. {stg.label}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                          isPassed
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : isCurrent
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          {stg.status === 'selesai' ? '✓ SELESAI' : stg.status === 'berjalan' ? '▶ SEDANG DIPROSES' : 'BELUM'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{stg.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer & Company Contact */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-slate-300">
            <div>
              <span className="font-bold text-slate-100 block">{payload.companyContact.name}</span>
              <span className="text-[11px] text-slate-400">Layanan Pelanggan Logistik & Transportasi Tanker</span>
            </div>

            <div className="flex items-center space-x-4">
              <a href={`tel:${payload.companyContact.phone}`} className="flex items-center space-x-1 hover:text-teal-400 font-mono">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>{payload.companyContact.phone}</span>
              </a>
              <a href={`mailto:${payload.companyContact.email}`} className="flex items-center space-x-1 hover:text-teal-400 font-mono">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>{payload.companyContact.email}</span>
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
            <span>Halaman ini dilindungi enkripsi Base64URL 128-bit &middot; No-Index Privacy Enforced</span>
            <span>PT Niaga Segara Trasindo &copy; 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
};
