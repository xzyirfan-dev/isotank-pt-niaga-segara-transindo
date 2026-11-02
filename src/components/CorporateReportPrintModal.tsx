import React, { useRef } from 'react';
import {
  X, Printer, Download, FileSpreadsheet, FileText, ShieldCheck,
  CheckCircle2, Calendar, Building, Info, Sparkles
} from 'lucide-react';
import { CorporateReportMetadata, ExportTableData, downloadCorporateExcel, downloadCorporatePDF } from '../utils/reportExport';

interface CorporateReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: CorporateReportMetadata;
  tableData: ExportTableData;
  filenamePrefix: string;
}

export const CorporateReportPrintModal: React.FC<CorporateReportPrintModalProps> = ({
  isOpen,
  onClose,
  metadata,
  tableData,
  filenamePrefix,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handlePDFDownload = () => {
    downloadCorporatePDF(metadata, tableData, filenamePrefix);
  };

  const handleExcelDownload = () => {
    downloadCorporateExcel(metadata, tableData, filenamePrefix);
  };

  const handleCSVDownload = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `PT NIAGA SEGARA TRASINDO - ${metadata.title}`,
        `Periode: ${metadata.periodText}`,
        `Waktu Ekspor: ${metadata.generatedAt}`,
        `Penarik Data: ${metadata.generatedBy} (${metadata.generatedRole})`,
        '',
        tableData.headers.join(','),
        ...tableData.rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center space-x-2">
                <span>Pratinjau & Cetak Laporan Resmi PT NST</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  A4 FORMAT
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Lengkap dengan Kop Surat Perusahaan, Logo, Periode, Legalitas, & Tanda Tangan Resmi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Direct Download PDF File Button */}
            <button
              onClick={handlePDFDownload}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-500/25 transition-all hover:scale-105 active:scale-95"
              title="Download File Adobe PDF (.pdf) ke Komputer"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF (.pdf)</span>
            </button>

            {/* Download Excel Button */}
            <button
              onClick={handleExcelDownload}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all hover:scale-105"
              title="Unduh Format Spreadsheet Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>

            {/* Print Dialog Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 shadow-md transition-all hover:scale-105"
              title="Cetak langsung menggunakan dialog printer browser"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Printer</span>
            </button>

            {/* CSV Backup */}
            <button
              onClick={handleCSVDownload}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center space-x-1"
              title="Unduh data mentah CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Preview Paper Viewport */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/70">
          
          {/* Paper Container (Styled as clean white A4 corporate paper) */}
          <div
            ref={printAreaRef}
            id="corporate-print-document"
            className="w-full max-w-4xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:rounded-none"
          >
            
            {/* 1. KOP SURAT RESMI PERUSAHAAN (CORPORATE LETTERHEAD) */}
            <div className="border-b-4 border-slate-900 pb-3 mb-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                
                {/* Left: Logo & Company Identification */}
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-16 shrink-0 flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-lg">
                    <img
                      src="/assets/aistudio/nistrans-logo__1__d944a664.svg"
                      alt="PT Niaga Segara Trasindo Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-950 tracking-tight leading-tight">
                      PT NIAGA SEGARA TRASINDO
                    </h1>
                    <p className="text-[11px] font-extrabold text-teal-800 uppercase tracking-wider">
                      DIVISI OPERASIONAL LOGISTIK ISOTANK CHEMICAL & MULTIMODA
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                      Kantor Pusat: Graha Segara Lt. 4, Jl. Perak Timur No. 512, Pelabuhan Tanjung Perak, Surabaya 60165, Jawa Timur
                    </p>
                    <p className="text-[10px] text-slate-600">
                      Telp: (031) 329-8877 | Fax: (031) 329-8878 | Email: operational@niagasegara.co.id | Web: www.niagasegara.co.id
                    </p>
                  </div>
                </div>

                {/* Right: Registration & Credentials */}
                <div className="text-right sm:text-right text-[10px] text-slate-600 space-y-0.5 shrink-0 self-start sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 w-full sm:w-auto">
                  <div className="font-mono font-bold text-slate-900">
                    No. Dokumen: <span className="text-teal-900 font-extrabold">{metadata.reportCode}</span>
                  </div>
                  <div>NPWP: <strong>01.884.992.3-604.000</strong></div>
                  <div>NIB: <strong>9120004812391</strong></div>
                  <div>Izin Transporter B3: <strong>SK-MENLHK/089/2023</strong></div>
                  <div className="text-[9px] font-semibold text-teal-700">
                    Sertifikasi: ISO 9001:2015 & ISO 14001
                  </div>
                </div>

              </div>
            </div>
            {/* Thin bottom line for standard Indonesian formal double-rule letterhead */}
            <div className="border-b border-slate-400 mb-6"></div>

            {/* 2. DOCUMENT TITLE & PERIOD METADATA */}
            <div className="mb-6 text-center space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-wide">
                {metadata.title}
              </h2>
              <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-700 bg-slate-100 py-1.5 px-4 rounded-lg border border-slate-200">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" />
                  <span>Periode Data: <strong className="text-slate-950">{metadata.periodText}</strong></span>
                </span>
                <span>•</span>
                <span>Waktu Tarik Data: <strong className="text-slate-950">{metadata.generatedAt}</strong></span>
                <span>•</span>
                <span>Operator: <strong className="text-slate-950">{metadata.generatedBy}</strong> ({metadata.generatedRole.toUpperCase()})</span>
              </div>
            </div>

            {/* 3. SUMMARY KPI CARDS (If provided) */}
            {tableData.summary && tableData.summary.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {tableData.summary.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <span className="text-[10px] text-slate-600 block uppercase font-bold tracking-wider">{item.label}</span>
                    <strong className="text-sm font-black text-slate-950 font-mono mt-0.5 block">{item.value}</strong>
                  </div>
                ))}
              </div>
            )}

            {/* 4. MAIN DATA TABLE */}
            <div className="overflow-x-auto mb-8 border border-slate-300 rounded-lg">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold border-b border-slate-400">
                    <th className="p-2.5 text-center w-10">No</th>
                    {tableData.headers.map((h, i) => (
                      <th key={i} className="p-2.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {tableData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={tableData.headers.length + 1} className="p-6 text-center text-slate-500 italic">
                        Tidak ada data transaksi yang tercatat pada periode yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}>
                        <td className="p-2.5 text-center font-mono font-semibold text-slate-500">{rIdx + 1}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 whitespace-nowrap">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. NOTES & COMPLIANCE FOOTER */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 mb-8 space-y-1">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-teal-700" />
                <span>Catatan Kepatuhan & Validitas Dokumen Operasional:</span>
              </div>
              <p>
                1. Dokumen ini dicetak secara terotorisasi melalui Sistem Pelacakan IsoTrack PT Niaga Segara Trasindo. Seluruh transaksi lead dan berkas bukti (Surat Jalan, Tiket Kapal Antar-Pulau, BASTP Ketibaan) telah diaudit sesuai prosedur ISO 9001:2015.
              </p>
              <p>
                2. Data laporan ini mencakup status real-time siklus 8-tahap, pelacakan mitra armada truk, serta verifikasi ketibaan di lokasi tujuan.
              </p>
            </div>

            {/* 6. LEMBAR PENGESAHAN RESMI (CORPORATE SIGN-OFF & STAMP BLOCK) */}
            <div className="pt-4 border-t-2 border-slate-300">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider text-center mb-6">
                LEMBAR PENGESAHAN DOKUMEN SISTEM ISOTRACK PT NIAGA SEGARA TRASINDO
              </div>

              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                {/* Column 1: PIC Maker */}
                <div className="flex flex-col justify-between h-52 p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase block">Disiapkan Oleh (PIC / Pembuat):</span>
                    <span className="text-[10px] text-slate-500">Divisi Operasional Lapangan</span>
                  </div>

                  {/* Dedicated Space for Signature (TTD Pejabat) */}
                  <div className="border border-dashed border-slate-300 rounded-lg p-2 h-20 flex flex-col items-center justify-center my-1 bg-slate-50/60">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">
                      ( Ruang Tanda Tangan / TTD & Stempel )
                    </span>
                    <div className="w-4/5 border-b border-slate-300 mt-5 mb-0.5"></div>
                    <span className="text-[7.5px] font-mono text-slate-400">[VERIFIKASI SISTEM ELEKTRONIK]</span>
                  </div>

                  <div>
                    <strong className="text-slate-950 font-bold text-xs block">{metadata.generatedBy || 'Budi Santoso'}</strong>
                    <span className="text-[10px] text-slate-600 block capitalize">{metadata.generatedRole} Operasional</span>
                    <span className="text-[9px] text-slate-400 block">Verified: {metadata.generatedAt.slice(0, 10)}</span>
                  </div>
                </div>

                {/* Column 2: Reviewer QA */}
                <div className="flex flex-col justify-between h-52 p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase block">Diperiksa & Diaudit Oleh (QA):</span>
                    <span className="text-[10px] text-slate-500">Quality Assurance & K3 HAZMAT</span>
                  </div>

                  {/* Dedicated Space for Signature (TTD Pejabat) */}
                  <div className="border border-dashed border-slate-300 rounded-lg p-2 h-20 flex flex-col items-center justify-center my-1 bg-slate-50/60">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">
                      ( Ruang Tanda Tangan / TTD & Stempel )
                    </span>
                    <div className="w-4/5 border-b border-slate-300 mt-5 mb-0.5"></div>
                    <span className="text-[7.5px] font-mono text-slate-400">[AUDITED & ISO 9001:2015]</span>
                  </div>

                  <div>
                    <strong className="text-slate-950 font-bold text-xs block">Wawan Setiawan, S.T.</strong>
                    <span className="text-[10px] text-slate-600 block">QA & Safety Compliance Lead</span>
                    <span className="text-[9px] text-slate-400 block">Status: Audited & ISO Compliant</span>
                  </div>
                </div>

                {/* Column 3: Manager Approval */}
                <div className="flex flex-col justify-between h-52 p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase block">Disetujui Oleh (Manager Operasi):</span>
                    <span className="text-[10px] text-slate-500">Manajemen Armada & Operasi</span>
                  </div>

                  {/* Dedicated Space for Signature (TTD Pejabat) */}
                  <div className="border border-dashed border-slate-300 rounded-lg p-2 h-20 flex flex-col items-center justify-center my-1 bg-slate-50/60">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">
                      ( Ruang Tanda Tangan / TTD & Stempel )
                    </span>
                    <div className="w-4/5 border-b border-slate-300 mt-5 mb-0.5"></div>
                    <span className="text-[7.5px] font-mono text-slate-400">[AUTHORIZED & APPROVED]</span>
                  </div>

                  <div>
                    <strong className="text-slate-950 font-bold text-xs block">Probo Subagyo, M.M.</strong>
                    <span className="text-[10px] text-slate-600 block">Fleet & Operations Manager</span>
                    <span className="text-[9px] text-slate-400 block">Status: Approved for Distribution</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[9px] text-slate-500">
                <span>Dokumen Resmi Sistem Elektronik IsoTrack — PT Niaga Segara Trasindo</span>
                <span>Halaman 1 dari 1 • Waktu Audit: {metadata.generatedAt}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
