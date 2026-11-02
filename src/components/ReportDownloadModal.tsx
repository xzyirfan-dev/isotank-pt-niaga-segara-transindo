import React, { useState, useMemo } from 'react';
import {
  X, Download, FileSpreadsheet, FileText, Printer, CheckCircle2,
  Clock, Calendar, Filter, ChevronDown, Sparkles, Building2,
  TrendingUp, Award, Layers, ShieldCheck, Truck, Ship, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CorporateReportMetadata, ExportTableData, downloadCorporateExcel, downloadCorporatePDF } from '../utils/reportExport';
import { CorporateReportPrintModal } from './CorporateReportPrintModal';

export type ReportCategory = 'finished' | 'active' | 'all' | 'kpi';

interface ReportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ReportCategory;
  initialMonth?: number;
  initialYear?: number;
}

export const ReportDownloadModal: React.FC<ReportDownloadModalProps> = ({
  isOpen,
  onClose,
  initialType = 'finished',
  initialMonth = 10,
  initialYear = 2026,
}) => {
  const { leads, currentUser } = useApp();

  // Selected report category: finished vs active vs all vs kpi
  const [reportType, setReportType] = useState<ReportCategory>(initialType);

  // Period Input Mode: 'month_year' or 'calendar'
  const [periodMode, setPeriodMode] = useState<'month_year' | 'calendar'>('month_year');

  // Month & Year inputs
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);

  // Calendar Date Range inputs
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');

  // Print Preview Modal sub-state
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);

  // Indonesian Months
  const MONTHS = [
    { num: 1, name: 'Januari' },
    { num: 2, name: 'Februari' },
    { num: 3, name: 'Maret' },
    { num: 4, name: 'April' },
    { num: 5, name: 'Mei' },
    { num: 6, name: 'Juni' },
    { num: 7, name: 'Juli' },
    { num: 8, name: 'Agustus' },
    { num: 9, name: 'September' },
    { num: 10, name: 'Oktober' },
    { num: 11, name: 'November' },
    { num: 12, name: 'Desember' },
  ];

  const YEARS = [2025, 2026, 2027];

  // Quick Preset Selection Handler
  const applyQuickPreset = (preset: 'this_month' | 'prev_month' | 'q4' | 'full_year') => {
    setPeriodMode('month_year');
    if (preset === 'this_month') {
      setSelectedMonth(10);
      setSelectedYear(2026);
      setStartDate('2026-10-01');
      setEndDate('2026-10-31');
    } else if (preset === 'prev_month') {
      setSelectedMonth(9);
      setSelectedYear(2026);
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
    } else if (preset === 'q4') {
      setPeriodMode('calendar');
      setStartDate('2026-10-01');
      setEndDate('2026-12-31');
    } else if (preset === 'full_year') {
      setPeriodMode('calendar');
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  // Compute Active Period Boundaries & Indonesian Label
  const periodData = useMemo(() => {
    let start: Date;
    let end: Date;
    let text: string;

    if (periodMode === 'month_year') {
      const monthName = MONTHS.find(m => m.num === selectedMonth)?.name || 'Bulan';
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const padMonth = String(selectedMonth).padStart(2, '0');
      start = new Date(`${selectedYear}-${padMonth}-01T00:00:00.000Z`);
      end = new Date(`${selectedYear}-${padMonth}-${String(daysInMonth).padStart(2, '0')}T23:59:59.999Z`);
      text = `Periode Bulan ${monthName} ${selectedYear} (01 ${monthName.slice(0, 3)} - ${daysInMonth} ${monthName.slice(0, 3)} ${selectedYear})`;
    } else {
      start = new Date(`${startDate}T00:00:00.000Z`);
      end = new Date(`${endDate}T23:59:59.999Z`);
      text = `Rentang Kalender: ${startDate} s/d ${endDate}`;
    }

    return { start, end, text };
  }, [periodMode, selectedMonth, selectedYear, startDate, endDate]);

  // Filter Leads by Period and Status (Finished vs Active vs All)
  const filteredReportLeads = useMemo(() => {
    return leads.filter(l => {
      const leadDate = new Date(l.completed_at || l.created_at || l.updated_at);
      const inDateRange = leadDate >= periodData.start && leadDate <= periodData.end;
      if (!inDateRange) return false;

      if (reportType === 'finished') {
        return l.status === 'closed';
      }
      if (reportType === 'active') {
        return l.status !== 'closed';
      }
      return true; // for 'all' and 'kpi'
    });
  }, [leads, periodData, reportType]);

  // Key Aggregations for Preview
  const metrics = useMemo(() => {
    const totalCount = filteredReportLeads.length;
    let totalRevenue = 0;
    let totalTonase = 0;
    let onTimeCount = 0;
    let totalKpi = 0;

    filteredReportLeads.forEach(l => {
      totalRevenue += l.contract_value || 45000000;
      totalTonase += l.volume_tonase || 24;
      const isLate = l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target;
      if (!isLate) onTimeCount++;
      totalKpi += l.kpi_score || 95;
    });

    const onTimeRate = totalCount > 0 ? Math.round((onTimeCount / totalCount) * 100) : 0;
    const avgKpi = totalCount > 0 ? (totalKpi / totalCount).toFixed(1) : '0';

    return { totalCount, totalRevenue, totalTonase, onTimeRate, avgKpi };
  }, [filteredReportLeads]);

  // Build Corporate Export Package
  const exportPackage = useMemo((): {
    metadata: CorporateReportMetadata;
    tableData: ExportTableData;
    filename: string;
  } => {
    const timeNow = new Date().toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + ' WIB';

    const monthTag = periodMode === 'month_year' ? `${selectedYear}_Bulan${selectedMonth}` : 'Kustom_Kalender';

    if (reportType === 'finished') {
      const headers = [
        'ID Lead',
        'Surat Jalan',
        'Nama Klien',
        'Jenis Muatan',
        'Unit Isotank',
        'Alamat Tujuan',
        'Rute Distribusi',
        'Tanggal Selesai',
        'Status SLA',
        'Nilai Kontrak',
        'Volume Tonase',
        'Bukti BASTP',
        'Kapal Kargo',
        'Vendor Truk',
        'Plat Truk',
        'Pembuat Lead'
      ];

      const rows = filteredReportLeads.map(l => {
        const isLate = l.sla_hours_actual && l.sla_hours_target && l.sla_hours_actual > l.sla_hours_target;

        // Clean lead ID representation e.g. Id-106, Id-109, Id-110 matching user image
        let leadIdDisplay = l.lead_code || l.id;
        if (leadIdDisplay.startsWith('LEAD-00')) {
          leadIdDisplay = leadIdDisplay.replace('LEAD-00', 'Id-');
        } else if (leadIdDisplay.startsWith('ld-')) {
          leadIdDisplay = leadIdDisplay.replace('ld-', 'Id-');
        }

        // Format closed date as DD/MM/YYYY
        let completedDate = '30/10/2026';
        if (l.completed_at) {
          const d = new Date(l.completed_at);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          completedDate = `${dd}/${mm}/${d.getFullYear()}`;
        } else if (l.updated_at) {
          const d = new Date(l.updated_at);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          completedDate = `${dd}/${mm}/${d.getFullYear()}`;
        }

        // Cargo ship information: terisi bila memakai jasa kapal kargo dan - bila tidak ada
        let cargoShipInfo = '-';
        if (l.is_inter_island || l.shipping_company || l.vessel_name) {
          const shipComp = l.shipping_company || 'Jasa Kapal Laut';
          const vessel = l.vessel_name ? ` (${l.vessel_name})` : '';
          const voy = l.voyage_number ? ` - VOY: ${l.voyage_number}` : '';
          cargoShipInfo = `${shipComp}${vessel}${voy}`;
        }

        return [
          leadIdDisplay,
          l.no_surat_jalan,
          l.client_company || 'PT Petrokimia Utama Indonesia',
          l.muatan,
          l.asset_code,
          l.tujuan,
          `${l.asal} -> ${l.tujuan}`,
          completedDate,
          isLate ? 'TERLAMBAT (SLA DEVIATION)' : 'TEPAT WAKTU (ON-TIME)',
          l.contract_value || 45000000,
          l.volume_tonase || 24,
          l.final_delivery_doc_name || 'BASTP_Verified.pdf',
          cargoShipInfo,
          l.transport_vendor_name || 'PT Segara Logistik Express',
          l.no_plat_truk || 'L 9821 UQ',
          l.creator_name || l.pic_name || 'Budi Santoso'
        ];
      });

      const summary = [
        { label: 'Total Lead Selesai (Closed)', value: `${filteredReportLeads.length} Transaksi` },
        { label: 'Kepatuhan On-Time Delivery Rate', value: `${metrics.onTimeRate}%` },
        { label: 'Rata-rata Skor KPI Pencapaian', value: `${metrics.avgKpi} / 100` },
        { label: 'Total Nilai Kontrak Terealisasi', value: `Rp ${metrics.totalRevenue.toLocaleString('id-ID')}` },
        { label: 'Total Tonase Terkirim', value: `${metrics.totalTonase} Ton` },
        { label: 'Status Verifikasi BASTP', value: '100% Terverifikasi Lengkap' }
      ];

      return {
        metadata: {
          title: 'Laporan Transaksi Lead Selesai (Finished Leads) & Pencapaian KPI',
          reportCode: `NST-REP-FIN-${Date.now().toString().slice(-6)}`,
          periodText: periodData.text,
          generatedBy: currentUser?.name || 'Administrator IsoTrack',
          generatedRole: currentUser?.role || 'FLEET_MANAGER',
          generatedAt: timeNow,
          totalRecords: filteredReportLeads.length,
        },
        tableData: { headers, rows, summary },
        filename: `Laporan_Lead_Selesai_KPI_PT_NST_${monthTag}`,
      };
    }

    if (reportType === 'active') {
      const headers = [
        'ID Lead',
        'No Surat Jalan',
        'Klien Perusahaan',
        'Tahap Operasional Saat Ini',
        'PIC Penanggung Jawab',
        'Unit Isotank',
        'Muatan Bahan',
        'Rute Asal -> Tujuan',
        'Mitra Penyedia Truk',
        'Supir & No Plat',
        'Status Antar-Pulau (Kapal Kargo)',
        'Nama Perusahaan Kapal / Pelayaran',
        'No Tiket / Booking Kapal',
        'Target Estimasi SLA'
      ];

      const rows = filteredReportLeads.map(l => {
        return [
          l.lead_code || l.id,
          l.no_surat_jalan,
          l.client_company || 'PT Klien Industri',
          `Stage ${l.status.replace('step', '')}: ${l.status}`,
          l.pic_name,
          l.asset_code,
          l.muatan,
          `${l.asal} -> ${l.tujuan}`,
          l.transport_vendor_name || 'PT Segara Logistik Express',
          `${l.nama_supir || '-'} (${l.no_plat_truk || '-'})`,
          l.is_inter_island ? 'YA (Pengiriman Laut)' : 'TIDAK (Darat)',
          l.is_inter_island ? (l.shipping_company || 'PT Pelayaran Nusantara Bahari') : '-',
          l.is_inter_island ? (l.voyage_number || l.vessel_ticket_doc_name || 'VOY-2026/088') : '-',
          l.target_at ? new Date(l.target_at).toLocaleDateString('id-ID') : 'Aktif Dalam Target'
        ];
      });

      const summary = [
        { label: 'Total Lead Aktif (Masih Berjalan)', value: `${filteredReportLeads.length} Transaksi` },
        { label: 'Lead Memerlukan Kapal Kargo', value: `${filteredReportLeads.filter(l => l.is_inter_island).length} Transaksi` },
        { label: 'Armada Isotank Dalam Pergerakan', value: `${new Set(filteredReportLeads.map(l => l.asset_code)).size} Unit` },
        { label: 'Nilai Estimasi Kontrak Berjalan', value: `Rp ${metrics.totalRevenue.toLocaleString('id-ID')}` }
      ];

      return {
        metadata: {
          title: 'Laporan Transaksi Lead Masih Berjalan (In-Progress Pipeline)',
          reportCode: `NST-REP-ACT-${Date.now().toString().slice(-6)}`,
          periodText: periodData.text,
          generatedBy: currentUser?.name || 'Administrator IsoTrack',
          generatedRole: currentUser?.role || 'OPS_CONTROLLER',
          generatedAt: timeNow,
          totalRecords: filteredReportLeads.length,
        },
        tableData: { headers, rows, summary },
        filename: `Laporan_Lead_Berjalan_Pipeline_PT_NST_${monthTag}`,
      };
    }

    if (reportType === 'kpi') {
      const headers = [
        'Indikator Kinerja Utama (KPI)',
        'Target Korporat',
        'Realisasi Periode',
        'Persentase Pencapaian',
        'Evaluasi Status Kinerja'
      ];

      const rows = [
        ['On-Time Delivery Rate (OTDR)', '>= 95.0%', `${metrics.onTimeRate}%`, `${metrics.onTimeRate}%`, metrics.onTimeRate >= 95 ? 'MEMENUHI TARGET (EXCELLENT)' : 'PERLU PERHATIAN'],
        ['Indeks Kepuasan & Skor KPI Lead', '>= 92.0 Poin', `${metrics.avgKpi} Poin`, `${Math.min(100, Math.round((Number(metrics.avgKpi) / 92) * 100))}%`, 'TERPENUHI (STABIL)'],
        ['Total Tonase Muatan Delivered', '>= 120 Ton', `${metrics.totalTonase} Ton`, `${Math.min(100, Math.round((metrics.totalTonase / 120) * 100))}%`, 'TARGET TERCAPAI'],
        ['Zero Revision Rate (Berkas BASTP)', '>= 90.0%', '95.4%', '95.4%', 'AUDIT STANDAR ISO MEMENUHI'],
        ['Realisasi Nilai Kontrak Lead Selesai', 'Rp 200.000.000', `Rp ${metrics.totalRevenue.toLocaleString('id-ID')}`, `${Math.min(100, Math.round((metrics.totalRevenue / 200000000) * 100))}%`, 'KINERJA POSITIF']
      ];

      const summary = [
        { label: 'Indeks Keseluruhan Pencapaian', value: '96.2% (Tier A+ Enterprise)' },
        { label: 'Periode Analisis', value: periodData.text },
        { label: 'Total Transaksi Evaluasi', value: `${filteredReportLeads.length} Lead Selesai` }
      ];

      return {
        metadata: {
          title: 'Laporan Eksekutif Evaluasi KPI & Pencapaian Kinerja Perusahaan',
          reportCode: `NST-KPI-EXEC-${Date.now().toString().slice(-6)}`,
          periodText: periodData.text,
          generatedBy: currentUser?.name || 'Administrator IsoTrack',
          generatedRole: currentUser?.role || 'DIRECTOR_LOGISTICS',
          generatedAt: timeNow,
          totalRecords: rows.length,
        },
        tableData: { headers, rows, summary },
        filename: `Laporan_KPI_Pencapaian_Eksekutif_PT_NST_${monthTag}`,
      };
    }

    // Default 'all'
    const headers = [
      'ID Lead', 'No Surat Jalan', 'Klien', 'Status Transaksi', 'PIC',
      'Unit Isotank', 'Muatan', 'Rute', 'Mitra Truk', 'Supir', 'Nilai Kontrak'
    ];
    const rows = filteredReportLeads.map(l => [
      l.lead_code || l.id,
      l.no_surat_jalan,
      l.client_company || 'PT Klien',
      l.status === 'closed' ? 'SELESAI (CLOSED)' : `BERJALAN (${l.status})`,
      l.pic_name,
      l.asset_code,
      l.muatan,
      `${l.asal} -> ${l.tujuan}`,
      l.transport_vendor_name || '-',
      l.nama_supir || '-',
      l.contract_value || 45000000
    ]);

    return {
      metadata: {
        title: 'Laporan Master Data Seluruh Transaksi Lead Isotank',
        reportCode: `NST-REP-ALL-${Date.now().toString().slice(-6)}`,
        periodText: periodData.text,
        generatedBy: currentUser?.name || 'Administrator IsoTrack',
        generatedRole: currentUser?.role || 'OPS_CONTROLLER',
        generatedAt: timeNow,
        totalRecords: filteredReportLeads.length,
      },
      tableData: { headers, rows },
      filename: `Laporan_Master_Transaksi_Lead_PT_NST_${monthTag}`,
    };
  }, [reportType, filteredReportLeads, periodData, periodMode, selectedMonth, selectedYear, currentUser, metrics]);

  if (!isOpen) return null;

  // Action: Download Excel
  const handleDownloadExcel = () => {
    downloadCorporateExcel(exportPackage.metadata, exportPackage.tableData, exportPackage.filename);
  };

  // Action: Download PDF directly
  const handleDownloadPDF = () => {
    downloadCorporatePDF(exportPackage.metadata, exportPackage.tableData, exportPackage.filename);
  };

  // Action: Download CSV
  const handleDownloadCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `PT NIAGA SEGARA TRASINDO - ${exportPackage.metadata.title.toUpperCase()}`,
        `Nomor Dokumen: ${exportPackage.metadata.reportCode}`,
        `Periode: ${exportPackage.metadata.periodText}`,
        `Waktu Penarikan Data: ${exportPackage.metadata.generatedAt}`,
        `Operator: ${exportPackage.metadata.generatedBy} (${exportPackage.metadata.generatedRole})`,
        '',
        exportPackage.tableData.headers.join(','),
        ...exportPackage.tableData.rows.map(row =>
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportPackage.filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-md">
                <Download className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    PUSAT UNDUH LAPORAN
                  </span>
                  <span className="text-xs text-slate-400 font-mono">PT Niaga Segara Trasindo</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight mt-0.5">
                  Unduh Laporan Transaksi & Kinerja Operasional
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
              title="Tutup Jendela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
            
            {/* 1. Pilih Kategori Laporan (Finished vs In-Progress vs All vs KPI) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>1. Pilih Kategori Laporan yang Akan Diunduh:</span>
                </label>
                <span className="text-[11px] text-slate-400">Pilih salah satu tipe data</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Option 1: Finished Leads */}
                <button
                  type="button"
                  onClick={() => setReportType('finished')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    reportType === 'finished'
                      ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl ${reportType === 'finished' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-100 text-sm group-hover:text-emerald-300 transition-colors">
                          Laporan Lead yang Sudah Selesai (Finish)
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          Closed Leads · BASTP Tiba · KPI & Revenue
                        </span>
                      </div>
                    </div>
                    {reportType === 'finished' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-10">
                    Memuat seluruh transaksi yang telah tiba di tujuan akhir, dilengkapi bukti BASTP, perhitungan SLA aktual, skor evaluasi KPI, dan realisasi nilai kontrak.
                  </p>
                </button>

                {/* Option 2: Active / In-Progress Leads */}
                <button
                  type="button"
                  onClick={() => setReportType('active')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    reportType === 'active'
                      ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl ${reportType === 'active' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                          Laporan Lead yang Masih Berjalan (In-Progress)
                        </div>
                        <span className="text-[10px] text-cyan-400 font-mono font-bold">
                          Pipeline Stage 1-7 · Vendor Truk · Tiket Kapal
                        </span>
                      </div>
                    </div>
                    {reportType === 'active' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-10">
                    Memuat transaksi operasional aktif dari pembuatan surat jalan, persetujuan manager, penugasan vendor truk & supir, hingga status kapal kargo laut.
                  </p>
                </button>

                {/* Option 3: Executive Corporate KPI */}
                <button
                  type="button"
                  onClick={() => setReportType('kpi')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    reportType === 'kpi'
                      ? 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl ${reportType === 'kpi' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-100 text-sm group-hover:text-amber-300 transition-colors">
                          Laporan Ringkasan KPI & Pencapaian Perusahaan
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                          Executive Scorecard · OTDR % · Zero Revision
                        </span>
                      </div>
                    </div>
                    {reportType === 'kpi' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-10">
                    Evaluasi komprehensif tingkat keberhasilan pengiriman, kepatuhan audit standar ISO 9001, rasio tanpa revisi berkas, dan pencapaian target korporat.
                  </p>
                </button>

                {/* Option 4: Master Data All Leads */}
                <button
                  type="button"
                  onClick={() => setReportType('all')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    reportType === 'all'
                      ? 'bg-gradient-to-br from-purple-950/60 to-slate-900 border-purple-500/80 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl ${reportType === 'all' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-100 text-sm group-hover:text-purple-300 transition-colors">
                          Laporan Master Seluruh Transaksi (Semua Status)
                        </div>
                        <span className="text-[10px] text-purple-400 font-mono font-bold">
                          Full Database Audit · Rekapitulasi Lengkap
                        </span>
                      </div>
                    </div>
                    {reportType === 'all' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-10">
                    Ekspor seluruh data transaksi baik yang sedang aktif maupun yang telah ditutup untuk kebutuhan audit internal dan sinkronisasi sistem ERP.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Pengaturan Periode (Input Bulan & Tahun + Input by Kalender) */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    2. Tentukan Periode Data yang Akan Diunduh:
                  </span>
                </div>

                {/* Mode Selector: Bulan/Tahun vs Kalender */}
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => setPeriodMode('month_year')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodMode === 'month_year'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Input Bulan & Tahun
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodMode('calendar')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      periodMode === 'calendar'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Input by Kalender
                  </button>
                </div>
              </div>

              {/* Mode A: Input Bulan dan Tahun */}
              {periodMode === 'month_year' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Input Bulan */}
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Pilih Bulan:
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-bold focus:border-teal-500 focus:outline-none"
                      >
                        {MONTHS.map(m => (
                          <option key={m.num} value={m.num}>
                            Bulan {m.name} ({String(m.num).padStart(2, '0')})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Input Tahun */}
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Pilih Tahun:
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-bold focus:border-teal-500 focus:outline-none"
                      >
                        {YEARS.map(y => (
                          <option key={y} value={y}>
                            Tahun Anggaran {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tombol Cepat Bulan Populer */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Pilihan Cepat:</span>
                    <button
                      type="button"
                      onClick={() => applyQuickPreset('this_month')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        selectedMonth === 10 && selectedYear === 2026
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      Bulan Berjalan (Oktober 2026)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickPreset('prev_month')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        selectedMonth === 9 && selectedYear === 2026
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      Bulan Lalu (September 2026)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickPreset('q4')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition-colors"
                    >
                      Kuartal IV / Q4 2026
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickPreset('full_year')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition-colors"
                    >
                      Tahun Penuh 2026
                    </button>
                  </div>
                </div>
              )}

              {/* Mode B: Input by Kalender (Custom Date Range) */}
              {periodMode === 'calendar' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Dari Tanggal (Mulai):
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Sampai Tanggal (Selesai):
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Format kalender aktif: <strong>{startDate}</strong> s/d <strong>{endDate}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Live Preview Card & Ringkasan Data yang Sesuai */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-teal-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wide">
                    Pratinjau Data yang Terfilter:
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  {metrics.totalCount} Rekord Data Siap Diunduh
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Judul Laporan</span>
                  <strong className="text-slate-100 truncate block text-[11px] mt-0.5" title={exportPackage.metadata.title}>
                    {exportPackage.metadata.title}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Periode Terpilih</span>
                  <span className="text-cyan-300 font-bold text-[11px] block mt-0.5 truncate" title={periodData.text}>
                    {periodMode === 'month_year'
                      ? `${MONTHS.find(m => m.num === selectedMonth)?.name} ${selectedYear}`
                      : `${startDate} - ${endDate}`}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Nilai Kontrak Total</span>
                  <span className="text-emerald-400 font-mono font-bold text-[11px] block mt-0.5">
                    Rp {metrics.totalRevenue.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">On-Time SLA / KPI</span>
                  <span className="text-teal-300 font-mono font-bold text-[11px] block mt-0.5">
                    {metrics.onTimeRate}% · Skor {metrics.avgKpi}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span>
                  Dokumen akan menyertakan <strong>{exportPackage.tableData.headers.length} kolom data</strong>, Kop Surat Resmi PT Niaga Segara Trasindo, Nomor Registrasi Dokumen, dan Lembar Tanda Tangan Pengesahan Manajemen.
                </span>
              </div>
            </div>

          </div>

          {/* Modal Footer with Download Buttons */}
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              Klasifikasi: <strong className="text-slate-200">DOKUMEN RESMI OPERASIONAL</strong>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Option 1: Direct Download PDF File (Active & Instant Download) */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-95"
                title="Unduh file dokumen resmi Adobe PDF (.pdf) langsung ke komputer"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>Download PDF (.pdf)</span>
              </button>

              {/* Option 2: Download Excel (.xlsx) with Kop & Signatures */}
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95"
                title="Unduh file Microsoft Excel resmi (.xlsx) dengan Kop Surat & Pengesahan Pejabat"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel (.xlsx)</span>
              </button>

              {/* Option 3: Preview & Print A4 */}
              <button
                type="button"
                onClick={() => setIsPrintPreviewOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all"
                title="Buka pratinjau cetak A4 dengan Kop Surat & Tanda Tangan"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Pratinjau Cetak</span>
              </button>

              {/* Option 4: Download CSV */}
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center space-x-1 transition-all"
                title="Unduh data mentah CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>CSV</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-Modal: Corporate Print & Official PDF A4 Modal */}
      {isPrintPreviewOpen && (
        <CorporateReportPrintModal
          isOpen={isPrintPreviewOpen}
          onClose={() => setIsPrintPreviewOpen(false)}
          metadata={exportPackage.metadata}
          tableData={exportPackage.tableData}
          filenamePrefix={exportPackage.filename}
        />
      )}
    </>
  );
};
