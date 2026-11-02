import React, { useState } from 'react';
import {
  X, FileText, Image as ImageIcon, Filter, Download, ExternalLink,
  ShieldCheck, CheckCircle2, Printer, Eye, Truck, Calendar, User, Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Evidence, EvidenceFileType } from '../types';
import { STAGE_LIST } from '../data/stageConfig';
import { FileViewerModal } from './FileViewerModal';

interface LeadEvidencePopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string | null;
}

export const LeadEvidencePopupModal: React.FC<LeadEvidencePopupModalProps> = ({
  isOpen,
  onClose,
  leadId,
}) => {
  const { leads, evidences, setSelectedLeadId } = useApp();
  const [selectedStageStep, setSelectedStageStep] = useState<number | 'all'>('all');
  const [selectedFileType, setSelectedFileType] = useState<EvidenceFileType | 'all'>('all');
  
  // State for File Viewer Modal
  const [activeViewerEvidence, setActiveViewerEvidence] = useState<Evidence | null>(null);

  if (!isOpen || !leadId) return null;

  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;

  // Filter evidences for this lead
  const leadEvidences = evidences.filter(e => e.lead_id === leadId);

  const filteredEvidences = leadEvidences.filter(e => {
    if (selectedStageStep !== 'all' && e.stage_step !== selectedStageStep) return false;
    if (selectedFileType !== 'all' && e.file_type !== selectedFileType) return false;
    return true;
  });

  const handlePrintEvidenceManifest = () => {
    window.print();
  };

  const handleQuickDownload = (ev: Evidence, event: React.MouseEvent) => {
    event.stopPropagation();
    let downloadUrl = ev.file_data_url;

    if (!downloadUrl) {
      const docHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">
        <rect width="800" height="1100" fill="#ffffff"/>
        <rect x="40" y="40" width="720" height="1020" fill="none" stroke="#0f172a" stroke-width="4"/>
        <rect x="60" y="60" width="680" height="120" fill="#0b1f3a"/>
        <text x="90" y="110" fill="#14b8a6" font-family="sans-serif" font-size="24" font-weight="bold">PT NIAGA SEGARA TRASINDO</text>
        <text x="90" y="140" fill="#ffffff" font-family="sans-serif" font-size="14">DOKUMEN BUKTI OPERASIONAL - ISOTRACK SYSTEM</text>
        <rect x="60" y="200" width="680" height="180" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
        <text x="80" y="230" fill="#0f172a" font-family="sans-serif" font-size="16" font-weight="bold">ID LEAD: ${ev.lead_code || 'LEAD-00101'}</text>
        <text x="80" y="260" fill="#334155" font-family="sans-serif" font-size="14">Nama Berkas: ${ev.file_name}</text>
        <text x="80" y="290" fill="#334155" font-family="sans-serif" font-size="14">Jenis Dokumen: ${ev.file_type.toUpperCase().replace('_', ' ')}</text>
        <text x="80" y="320" fill="#334155" font-family="sans-serif" font-size="14">Pengunggah: ${ev.uploaded_by} (${ev.uploaded_by_role.toUpperCase()})</text>
        <text x="80" y="350" fill="#334155" font-family="sans-serif" font-size="14">Waktu Unggah: ${ev.uploaded_at}</text>
      </svg>`;
      const blob = new Blob([docHtml], { type: 'image/svg+xml' });
      downloadUrl = URL.createObjectURL(blob);
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${ev.lead_code || 'LEAD'}_${ev.file_name.replace(/\s+/g, '_')}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
          
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold font-mono">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    {lead.lead_code || 'LEAD-00101'}
                  </span>
                  <span className="font-extrabold text-slate-100 text-sm font-mono">{lead.no_surat_jalan}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-700 text-teal-300">
                    {lead.asset_code}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Rute: <strong className="text-slate-200">{lead.asal}</strong> &rarr; <strong className="text-slate-200">{lead.tujuan}</strong> ({lead.muatan})
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrintEvidenceManifest}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors no-print"
                title="Cetak Manifest Bukti Lead Ini"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  setSelectedLeadId(lead.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 flex items-center space-x-1 no-print shadow-sm"
              >
                <span>Detail Alur Lead</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white no-print">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-menu Filter Selector */}
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 no-print">
            
            {/* Stage Step Filter Chips */}
            <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <span className="text-slate-400 font-semibold mr-1 shrink-0">Stage:</span>
              <button
                onClick={() => setSelectedStageStep('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors shrink-0 ${
                  selectedStageStep === 'all'
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Semua ({leadEvidences.length})
              </button>

              {STAGE_LIST.map(stg => {
                const count = leadEvidences.filter(e => e.stage_step === stg.step).length;
                return (
                  <button
                    key={stg.step}
                    onClick={() => setSelectedStageStep(stg.step)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors shrink-0 flex items-center space-x-1 ${
                      selectedStageStep === stg.step
                        ? 'bg-teal-500 text-slate-950'
                        : count > 0
                        ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    <span>S{stg.step}</span>
                    <span className={`px-1 py-0.1 rounded text-[9px] ${selectedStageStep === stg.step ? 'bg-slate-950/40 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* File Type Selector */}
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-teal-400" />
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
              >
                <option value="all">Semua Jenis Dokumen</option>
                <option value="surat_jalan">Surat Jalan (Stempel)</option>
                <option value="dokumen_transporter">Dokumen Absah Transporter</option>
                <option value="tiket_kapal">Tiket / Booking Kapal Kargo</option>
                <option value="foto_muatan">Foto Muatan & Segel</option>
                <option value="foto_bongkar">Foto Pembongkaran</option>
                <option value="bukti_sampai_tujuan">Dokumen / Foto Sampai Tujuan (BASTP)</option>
                <option value="laporan_kerja">Berita Acara (BA)</option>
                <option value="dokumen_lain">Dokumen Pendukung</option>
              </select>
            </div>

          </div>

          {/* Modal Content Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {filteredEvidences.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-800 text-xs text-slate-400">
                Tidak ada bukti dokumen terlampir pada filter Stage / Jenis yang dipilih.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-3 group/card"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          Stage {ev.stage_step} ({ev.stage.replace('_', ' ').toUpperCase()})
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{ev.log_number || 'LOG-SYSTEM'}</span>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                          {ev.file_data_url ? (
                            <ImageIcon className="w-5 h-5 text-teal-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-100 text-xs truncate" title={ev.file_name}>
                            {ev.file_name}
                          </div>
                          <div className="text-[11px] text-teal-400 capitalize font-medium">
                            {ev.file_type.replace('_', ' ')} · <span className="text-slate-400">{ev.file_size}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Pengunggah: <strong className="text-slate-300">{ev.uploaded_by}</strong> ({ev.uploaded_by_role.toUpperCase()})
                          </div>
                        </div>
                      </div>

                      {ev.notes && (
                        <div className="mt-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 italic">
                          &quot;{ev.notes}&quot;
                        </div>
                      )}
                    </div>

                    {/* Image Preview Thumbnail if Available */}
                    {ev.file_data_url && (
                      <div className="relative group/img rounded-lg overflow-hidden border border-slate-700/80 max-h-32">
                        <img src={ev.file_data_url} alt={ev.file_name} className="w-full h-32 object-cover" />
                        <button
                          onClick={() => setActiveViewerEvidence(ev)}
                          className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white space-x-1"
                        >
                          <Eye className="w-4 h-4 text-teal-400" />
                          <span>Pratinjau Foto Penuh</span>
                        </button>
                      </div>
                    )}

                    {/* Action Row: View & Download Buttons */}
                    <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActiveViewerEvidence(ev)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs flex items-center space-x-1 border border-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-400" />
                        <span>Lihat Dokumen</span>
                      </button>

                      <button
                        onClick={(e) => handleQuickDownload(ev, e)}
                        className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh File</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Summary */}
          <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300 shrink-0">
            <div>
              Total Berkas Terdaftar pada Lead: <strong className="text-teal-300 font-mono">{leadEvidences.length} Berkas</strong>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs"
            >
              Tutup Popup
            </button>
          </div>

        </div>
      </div>

      {/* Universal Interactive File Viewer Modal */}
      <FileViewerModal
        isOpen={!!activeViewerEvidence}
        onClose={() => setActiveViewerEvidence(null)}
        evidence={activeViewerEvidence}
      />
    </>
  );
};
