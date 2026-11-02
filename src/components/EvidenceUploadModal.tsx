import React, { useState } from 'react';
import { X, Upload, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeadStatus, EvidenceFileType } from '../types';

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  stage: LeadStatus;
  stageStep: number;
}

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen, onClose, leadId, stage, stageStep
}) => {
  const { addEvidence, leads } = useApp();
  const [fileType, setFileType] = useState<EvidenceFileType>('surat_jalan');
  const [fileName, setFileName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const lead = leads.find(l => l.id === leadId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setFileName(file.name);

    if (file.type.startsWith('image/')) {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Simulate auto image compression to max 1000px
          const canvas = document.createElement('canvas');
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPreviewUrl(compressedDataUrl);
          setIsCompressing(false);
        };
      };
      reader.readAsDataURL(file);
    } else {
      // Document file (PDF, DOCX)
      setPreviewUrl(null);
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      setErrorMsg('Pilih berkas dokumen atau foto terlebih dahulu!');
      return;
    }

    addEvidence(
      leadId,
      stage,
      stageStep,
      fileType,
      fileName,
      previewUrl ? '480 KB (Compressed)' : '1.4 MB',
      previewUrl || undefined,
      notes
    );

    onClose();
    setFileName('');
    setNotes('');
    setPreviewUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                {lead?.lead_code || 'LEAD-00101'}
              </span>
              <span>Unggah Bukti Dokumen Operasional</span>
            </h3>
            <p className="text-[11px] text-slate-400">ID Lead: <strong className="text-teal-300 font-mono">{lead?.lead_code || 'LEAD-00101'}</strong> | Surat Jalan #{lead?.no_surat_jalan} (Tahap {stageStep})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Jenis Bukti Dokumen:</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as EvidenceFileType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
            >
              <option value="surat_jalan">Surat Jalan Resmi (Stempel Basah)</option>
              <option value="dokumen_transporter">Dokumen Absah Kemitraan Transport / STNK / SIM</option>
              <option value="tiket_kapal">Form Pemesanan / Tiket Kapal Kargo (Antar-Pulau)</option>
              <option value="foto_muatan">Foto Muatan & Segel Isotank</option>
              <option value="foto_bongkar">Foto Proses Pemuatan / Pembongkaran</option>
              <option value="bukti_sampai_tujuan">Dokumen / Foto Bukti Sampai Tujuan (BASTP / POD)</option>
              <option value="laporan_kerja">Laporan Kerja Berita Acara (BA)</option>
              <option value="dokumen_lain">Dokumen Pendukung Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">File Berkas (PDF / JPG / PNG):</label>
            <div className="border-2 border-dashed border-slate-700 hover:border-teal-500/50 rounded-xl p-4 text-center bg-slate-800/40 transition-colors">
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="evidence-file-input"
              />
              <label htmlFor="evidence-file-input" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                {fileName ? (
                  <div className="text-xs font-bold text-teal-300 flex items-center justify-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-teal-400" />
                    <span>{fileName}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-slate-300 font-bold block">Klik untuk memilih file</span>
                    <span className="text-[11px] text-slate-400">Foto dikompres otomatis ke maks 1000px</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {isCompressing && (
            <div className="text-center py-2 text-xs text-teal-400 font-medium">
              Kompresi foto otomatis sedang berjalan...
            </div>
          )}

          {previewUrl && (
            <div className="mt-2">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Pratinjau Foto Terkompresi:</span>
              <img src={previewUrl} alt="Preview" className="w-full h-36 object-cover rounded-xl border border-slate-700" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Catatan Tambahan (Opsional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Nomor segel NST-9941 terpasang sempurna..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:border-teal-500 focus:outline-none h-20"
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
              className="px-5 py-2 text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 rounded-xl shadow-md shadow-teal-500/20"
            >
              Simpan & Unggah Bukti
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
