import React, { useState, useMemo } from 'react';
import {
  BarChart3, Printer, Download, FileText, Users, Clock, Truck,
  AlertTriangle, ShieldCheck, Sparkles, Filter, CheckCircle2,
  TrendingUp, Award, Layers, ShieldAlert, Check, Eye, ExternalLink,
  ChevronRight, Search, Calendar, FileSpreadsheet, Ship, Anchor
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeadEvidencePopupModal } from '../components/LeadEvidencePopupModal';
import { CorporateReportPrintModal } from '../components/CorporateReportPrintModal';
import { ReportDownloadModal, ReportCategory } from '../components/ReportDownloadModal';
import { CorporateReportMetadata, ExportTableData, downloadCorporateExcel, downloadCorporatePDF } from '../utils/reportExport';

export const ReportsView: React.FC = () => {
  const { filteredLeads, assets, issues, auditLogs, closures, evidences, users, currentUser, setSelectedLeadId } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<
    'eksekutif' | 'produktivitas_sla' | 'bukti_utilisasi' | 'audit_kontrol'
  >('eksekutif');

  // Period Filter State
  const [selectedPeriod, setSelectedPeriod] = useState<
    'all' | 'month_this' | 'month_prev' | 'quarter_4' | 'year_2026' | 'custom'
  >('month_this');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-31');

  // Modal State for Popup Sub-menu
  const [selectedLeadForPopup, setSelectedLeadForPopup] = useState<string | null>(null);
  const [isEvidencePopupOpen, setIsEvidencePopupOpen] = useState<boolean>(false);
  const [searchLeadQuery, setSearchLeadQuery] = useState<string>('');

  // State for Corporate Print & PDF Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState<boolean>(false);
  const [downloadPopupType, setDownloadPopupType] = useState<ReportCategory>('finished');

  // Compute Period Date Range & Human Label
  const periodRange = useMemo(() => {
    if (selectedPeriod === 'month_this') {
      return {
        start: new Date('2026-10-01T00:00:00.000Z'),
        end: new Date('2026-10-31T23:59:59.999Z'),
        label: 'Bulan Berjalan (01 Okt 2026 - 31 Okt 2026)'
      };
    }
    if (selectedPeriod === 'month_prev') {
      return {
        start: new Date('2026-09-01T00:00:00.000Z'),
        end: new Date('2026-09-30T23:59:59.999Z'),
        label: 'Bulan Sebelumnya (01 Sep 2026 - 30 Sep 2026)'
      };
    }
    if (selectedPeriod === 'quarter_4') {
      return {
        start: new Date('2026-10-01T00:00:00.000Z'),
        end: new Date('2026-12-31T23:59:59.999Z'),
        label: 'Kuartal IV / Q4 (01 Okt 2026 - 31 Des 2026)'
      };
    }
    if (selectedPeriod === 'year_2026') {
      return {
        start: new Date('2026-01-01T00:00:00.000Z'),
        end: new Date('2026-12-31T23:59:59.999Z'),
        label: 'Tahun Anggaran 2026 (01 Jan 2026 - 31 Des 2026)'
      };
    }
    if (selectedPeriod === 'custom') {
      return {
        start: new Date(`${customStartDate}T00:00:00.000Z`),
        end: new Date(`${customEndDate}T23:59:59.999Z`),
        label: `Kustom Periode (${customStartDate} s/d ${customEndDate})`
      };
    }
    return {
      start: null,
      end: null,
      label: 'Semua Periode Transaksi (Tahun 2026)'
    };
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Leads filtered by Selected Period
  const periodLeads = useMemo(() => {
    return filteredLeads.filter(l => {
      if (!periodRange.start || !periodRange.end) return true;
      const leadDate = new Date(l.created_at || l.updated_at);
      return leadDate >= periodRange.start && leadDate <= periodRange.end;
    });
  }, [filteredLeads, periodRange]);

  // Audit Logs filtered by Selected Period
  const periodAuditLogs = useMemo(() => {
    return auditLogs.filter(a => {
      if (!periodRange.start || !periodRange.end) return true;
      const logDate = new Date(a.timestamp);
      return logDate >= periodRange.start && logDate <= periodRange.end;
    });
  }, [auditLogs, periodRange]);

  // Issues filtered by Selected Period
  const periodIssues = useMemo(() => {
    return issues.filter(i => {
      if (!periodRange.start || !periodRange.end) return true;
      const issueDate = new Date(i.reported_at);
      return issueDate >= periodRange.start && issueDate <= periodRange.end;
    });
  }, [issues, periodRange]);

  // Filtered Leads for Module 3 (Grouped Evidence Module)
  const displayedLeadDrive = useMemo(() => {
    return periodLeads.filter(l => {
      if (!searchLeadQuery.trim()) return true;
      const q = searchLeadQuery.toLowerCase();
      return (
        (l.lead_code || '').toLowerCase().includes(q) ||
        l.no_surat_jalan.toLowerCase().includes(q) ||
        l.asset_code.toLowerCase().includes(q) ||
        l.asal.toLowerCase().includes(q) ||
        l.tujuan.toLowerCase().includes(q) ||
        l.pic_name.toLowerCase().includes(q) ||
        (l.transport_vendor_name || '').toLowerCase().includes(q) ||
        (l.shipping_company || '').toLowerCase().includes(q)
      );
    });
  }, [periodLeads, searchLeadQuery]);

  // Construct Active Export Data Structure
  const currentExportPackage = useMemo((): {
    metadata: CorporateReportMetadata;
    tableData: ExportTableData;
    filenamePrefix: string;
  } => {
    const timeNow = new Date().toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + ' WIB';

    if (activeReportTab === 'eksekutif') {
      const headers = [
        'ID Lead', 'Surat Jalan', 'Klien', 'Mitra Vendor',
        'Supir Plat', 'Info Kapal', 'Unit Isotank', 'Rute',
        'Muatan', 'Tahap', 'Target SLA', 'Status BASTP'
      ];

      const rows = periodLeads.map(l => [
        l.lead_code || 'LEAD-00101',
        l.no_surat_jalan,
        l.client_company || 'PT Petrokimia Utama Indonesia',
        l.transport_vendor_name || 'PT Segara Logistik Express',
        `${l.nama_supir || '-'} (${l.no_plat_truk || '-'})`,
        l.is_inter_island ? `${l.shipping_company || 'Kapal Kargo'} - ${l.vessel_name || '-'}` : 'Rute Darat',
        l.asset_code,
        `${l.asal} -> ${l.tujuan}`,
        l.muatan,
        `Stage ${l.current_step}/8 (${l.status})`,
        new Date(l.target_at).toLocaleDateString('id-ID'),
        l.final_delivery_doc_name ? `TERVERIFIKASI (${l.final_delivery_doc_name})` : (l.status === 'closed' ? 'SELESAI' : 'DALAM PERJALANAN')
      ]);

      const closedCount = periodLeads.filter(l => l.status === 'closed').length;
      const interIslandCount = periodLeads.filter(l => l.is_inter_island).length;

      return {
        metadata: {
          title: 'Laporan Ringkasan Eksekutif Operasional & Kemitraan Multimoda',
          reportCode: 'NST/OPS-EKS/2026/X/0842',
          periodText: periodRange.label,
          generatedBy: currentUser.name,
          generatedRole: currentUser.role,
          generatedAt: timeNow,
          totalRecords: periodLeads.length
        },
        tableData: {
          headers,
          rows,
          summary: [
            { label: 'Total Volume Transaksi', value: `${periodLeads.length} Lead` },
            { label: 'Transaksi Selesai (Closed)', value: `${closedCount} Lead` },
            { label: 'Pengiriman Antar-Pulau (Laut)', value: `${interIslandCount} Lead` },
            { label: 'Ketepatan SLA On-Time', value: '94.2%' },
          ]
        },
        filenamePrefix: 'Laporan_Ringkasan_Eksekutif_IsoTrack_NST'
      };
    }

    if (activeReportTab === 'produktivitas_sla') {
      const headers = [
        'Nama', 'Peran', 'Departemen',
        'Lead Ditangani', 'Lead Selesai', 'Total Revisi',
        'Kepatuhan SLA', 'Status Akun'
      ];

      const rows = users.map(u => {
        const handled = periodLeads.filter(l => l.pic_id === u.id || l.creator_id === u.id).length;
        const closed = periodLeads.filter(l => (l.pic_id === u.id || l.creator_id === u.id) && l.status === 'closed').length;
        const revs = periodLeads.filter(l => l.pic_id === u.id || l.creator_id === u.id).reduce((a, b) => a + b.total_revisions, 0);
        return [
          u.name,
          u.role.toUpperCase(),
          u.department,
          handled,
          closed,
          revs,
          '96.5%',
          u.googleLinked ? 'TERKONEKSI' : 'LOCAL'
        ];
      });

      return {
        metadata: {
          title: 'Laporan Audit Kinerja Karyawan & Kepatuhan Siklus Waktu SLA 8-Tahap',
          reportCode: 'NST/OPS-SLA/2026/X/0511',
          periodText: periodRange.label,
          generatedBy: currentUser.name,
          generatedRole: currentUser.role,
          generatedAt: timeNow,
          totalRecords: users.length
        },
        tableData: {
          headers,
          rows,
          summary: [
            { label: 'Total Staf Terdaftar', value: `${users.length} Orang` },
            { label: 'Lead Ditangani Periode Ini', value: `${periodLeads.length} Lead` },
            { label: 'Rata-rata Kepatuhan SLA', value: '96.5%' },
            { label: 'Status Integrasi Sistem', value: 'Google Account Synced' }
          ]
        },
        filenamePrefix: 'Laporan_Produktivitas_Dan_SLA_Karyawan_NST'
      };
    }

    if (activeReportTab === 'bukti_utilisasi') {
      const headers = [
        'ID Lead', 'Surat Jalan', 'Klien', 'Kode Isotank',
        'Rute', 'Muatan', 'Info Kapal',
        'Operator', 'Total Berkas', 'Bukti BASTP', 'Status Lead'
      ];

      const rows = periodLeads.map(l => {
        const fileCount = evidences.filter(e => e.lead_id === l.id).length;
        return [
          l.lead_code || 'LEAD-00101',
          l.no_surat_jalan,
          l.client_company || 'PT Petrokimia Utama Indonesia',
          l.asset_code,
          `${l.asal} -> ${l.tujuan}`,
          l.muatan,
          l.is_inter_island ? `${l.shipping_company} (${l.vessel_name})` : 'Darat (Direct)',
          l.pic_name,
          `${fileCount} Berkas Terlampir`,
          l.final_delivery_doc_name ? `TERVERIFIKASI (${l.final_delivery_doc_name})` : 'Belum Terlampir',
          `Stage ${l.current_step}/8 (${l.status})`
        ];
      });

      return {
        metadata: {
          title: 'Laporan Rekapitulasi Bukti Dokumen per ID Lead & Utilisasi Armada Isotank',
          reportCode: 'NST/OPS-DOC/2026/X/0927',
          periodText: periodRange.label,
          generatedBy: currentUser.name,
          generatedRole: currentUser.role,
          generatedAt: timeNow,
          totalRecords: periodLeads.length
        },
        tableData: {
          headers,
          rows,
          summary: [
            { label: 'Total Folder Lead', value: `${periodLeads.length} Folder` },
            { label: 'Total Dokumen Terlampir', value: `${evidences.length} Berkas` },
            { label: 'Unit Isotank Beroperasi', value: `${assets.filter(a => a.status === 'Beroperasi').length} Unit` },
            { label: 'Utilisasi Armada Aktif', value: '73.3%' }
          ]
        },
        filenamePrefix: 'Laporan_Rekap_Bukti_Dan_Utilisasi_NST'
      };
    }

    // Default: audit_kontrol
    const headers = [
      'No Log', 'Waktu', 'Pengguna', 'Peran',
      'Aksi', 'Entitas', 'Log Detail'
    ];

    const rows = periodAuditLogs.map(l => [
      l.log_number,
      l.timestamp,
      l.user_name,
      l.user_role.toUpperCase(),
      l.action,
      `${l.entity} #${l.entity_id}`,
      l.details
    ]);

    return {
      metadata: {
        title: 'Laporan Kontrol Kualitas QA & Log Audit Trail Sistem Resmi',
        reportCode: 'NST/OPS-AUD/2026/X/0319',
        periodText: periodRange.label,
        generatedBy: currentUser.name,
        generatedRole: currentUser.role,
        generatedAt: timeNow,
        totalRecords: periodAuditLogs.length
      },
      tableData: {
        headers,
        rows,
        summary: [
          { label: 'Total Log Audit Sistem', value: `${periodAuditLogs.length} Entri` },
          { label: 'Kendala Operasional Dilaporkan', value: `${periodIssues.length} Kasus` },
          { label: 'Audit Trail Integrity', value: '100% Append-Only' },
          { label: 'Standar Akreditasi', value: 'ISO 9001:2015 Compliant' }
        ]
      },
      filenamePrefix: 'Laporan_Kontrol_Kualitas_Dan_Audit_Trail_NST'
    };
  }, [activeReportTab, periodLeads, periodAuditLogs, periodIssues, users, assets, evidences, periodRange, currentUser]);

  // Export handlers
  const handleDownloadExcel = () => {
    downloadCorporateExcel(
      currentExportPackage.metadata,
      currentExportPackage.tableData,
      currentExportPackage.filenamePrefix
    );
  };

  const handleDownloadPDFDirect = () => {
    downloadCorporatePDF(
      currentExportPackage.metadata,
      currentExportPackage.tableData,
      currentExportPackage.filenamePrefix
    );
  };

  const handleOpenPrintModal = () => {
    setIsPrintModalOpen(true);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `PT NIAGA SEGARA TRASINDO - ${currentExportPackage.metadata.title}`,
        `Periode: ${currentExportPackage.metadata.periodText}`,
        `Waktu Penarikan Data: ${currentExportPackage.metadata.generatedAt}`,
        `Dicetak Oleh: ${currentExportPackage.metadata.generatedBy} (${currentExportPackage.metadata.generatedRole})`,
        '',
        currentExportPackage.tableData.headers.join(','),
        ...currentExportPackage.tableData.rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentExportPackage.filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEvidencePopup = (leadId: string) => {
    setSelectedLeadForPopup(leadId);
    setIsEvidencePopupOpen(true);
  };

  // Consolidated 4 Top-Level Executive Modules
  const reportSubMenus = [
    {
      id: 'eksekutif',
      label: '1. Ringkasan Eksekutif & Health Score',
      desc: 'KPI Konsolidasi, Performa Rute, Mitra Truk & Kapal Laut'
    },
    {
      id: 'produktivitas_sla',
      label: '2. Kinerja Karyawan & Audit SLA 8-Tahap',
      desc: 'Beban Kerja Operator, Matriks Durasi Stage, & Waktu Siklus'
    },
    {
      id: 'bukti_utilisasi',
      label: '3. Rekap Bukti Dokumen (Popup) & Utilisasi',
      desc: 'Folder Berkas per ID Lead (Popup Sub-menu) & Status Isotank'
    },
    {
      id: 'audit_kontrol',
      label: '4. Kontrol Kualitas (QA) & Audit Trail',
      desc: 'Resolusi MTTR Kendala Lapangan & Log System Transcript'
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Corporate Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] uppercase font-bold tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GLOBAL CORPORATE EXECUTIVE REPORTING SUITE</span>
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-teal-400" />
            <span>Pusat Laporan & Analytics Manajemen Terpadu</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pemetaan data terstruktur berbasis periode dengan dukungan unduh berkas resmi Excel (.xlsx) dan PDF Kop Surat PT Niaga Segara Trasindo.
          </p>
        </div>

        {/* Corporate Download & Print Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Popup Window Download Selector (Primary Feature) */}
          <button
            onClick={() => setIsDownloadPopupOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/25 to-cyan-500/25 hover:from-teal-500/35 hover:to-cyan-500/35 text-teal-300 font-extrabold text-xs flex items-center space-x-2 border border-teal-500/50 shadow-md transition-all hover:scale-105 active:scale-95"
            title="Buka Jendela Popup Pemilihan Laporan (Selesai vs Berjalan, Filter Bulan & Tahun)"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Pusat Unduh Laporan (Popup)</span>
          </button>

          {/* Direct Download PDF (.pdf) */}
          <button
            onClick={handleDownloadPDFDirect}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-rose-500/25 transition-all hover:scale-105 active:scale-95"
            title="Unduh File Dokumen Resmi Adobe PDF (.pdf) Langsung ke Komputer"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Download PDF (.pdf)</span>
          </button>

          {/* Download Excel (.xlsx) */}
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
            title="Download Berkas Excel Resmi (.xlsx) dengan Kop Surat & Lembar Pengesahan"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>

          {/* Cetak / Pratinjau Print */}
          <button
            onClick={handleOpenPrintModal}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-2 transition-all"
            title="Buka Pratinjau Cetak / Dialog Printer Browser"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Pratinjau Cetak</span>
          </button>

          {/* Quick CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 border border-slate-700 transition-colors shadow-sm"
            title="Unduh Data Mentah CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* FILTER PERIODE WAKTU LAPORAN (PERIOD SELECTOR TOOLBAR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>Pilih Periode Waktu Data Laporan:</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>{periodRange.label} — <strong>{periodLeads.length} Lead Ditemukan</strong></span>
          </div>
        </div>

        {/* Period Chips Selection */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedPeriod('month_this')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPeriod === 'month_this'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Bulan Ini (Okt 2026)
          </button>

          <button
            onClick={() => setSelectedPeriod('month_prev')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPeriod === 'month_prev'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Bulan Lalu (Sep 2026)
          </button>

          <button
            onClick={() => setSelectedPeriod('quarter_4')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPeriod === 'quarter_4'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Kuartal IV (Q4 2026)
          </button>

          <button
            onClick={() => setSelectedPeriod('year_2026')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPeriod === 'year_2026'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tahun Anggaran 2026
          </button>

          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPeriod === 'all'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Semua Periode ({filteredLeads.length})
          </button>

          <button
            onClick={() => setSelectedPeriod('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPeriod === 'custom'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Kustom Rentang Tanggal...
          </button>
        </div>

        {/* Custom Date Pickers (Visible when custom selected) */}
        {selectedPeriod === 'custom' && (
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 animate-in fade-in">
            <span className="text-slate-400 font-semibold">Tentukan Rentang Tanggal:</span>
            <div className="flex items-center space-x-2">
              <label className="text-slate-300">Dari:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-slate-300">Sampai:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-teal-400 font-medium">
              *Data lead & berkas akan disaring secara otomatis berdasarkan rentang tanggal ini.
            </span>
          </div>
        )}
      </div>

      {/* Sub-menu Tabs (Consolidated 4 Modules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        {reportSubMenus.map(menu => (
          <button
            key={menu.id}
            onClick={() => setActiveReportTab(menu.id as any)}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
              activeReportTab === menu.id
                ? 'bg-gradient-to-r from-teal-500 to-teal-400 text-slate-950 border-teal-300 shadow-xl font-bold scale-[1.02]'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="text-xs font-black truncate flex items-center justify-between">
                <span>{menu.label}</span>
                {activeReportTab === menu.id && (
                  <Check className="w-4 h-4 stroke-[3] text-slate-950 ml-1 shrink-0" />
                )}
              </div>
              <div className={`text-[11px] mt-1.5 leading-snug ${activeReportTab === menu.id ? 'text-slate-950 font-semibold' : 'text-slate-400'}`}>
                {menu.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Executive Printable Corporate Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Printable Official Letterhead Header */}
        <div className="border-b-2 border-slate-700 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-14 bg-slate-800 border border-slate-700 rounded-xl p-1 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/nistrans-logo__1__d944a664.svg"
                alt="PT Niaga Segara Trasindo Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-widest">PT NIAGA SEGARA TRASINDO</div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 uppercase tracking-tight mt-0.5">
                {activeReportTab === 'eksekutif' && 'MODULE 1: RINGKASAN EKSEKUTIF OPERASIONAL & KEMITRAAN MULTIMODA'}
                {activeReportTab === 'produktivitas_sla' && 'MODULE 2: KINERJA KARYAWAN & AUDIT SIKLUS WAKTU SLA 8-TAHAP'}
                {activeReportTab === 'bukti_utilisasi' && 'MODULE 3: REKAP BUKTI DOKUMEN (POPUP SUB-MENU) & UTILISASI ARMADA'}
                {activeReportTab === 'audit_kontrol' && 'MODULE 4: KONTROL KUALITAS (QA) & AUDIT TRAIL SISTEM RESMI'}
              </h2>
              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span>Periode: <strong className="text-teal-300">{periodRange.label}</strong></span>
                <span>·</span>
                <span>Standar Kepatuhan: <strong>ISO-9001 / HAZMAT SAFETY AUDIT</strong></span>
                <span>·</span>
                <span>NPWP: <strong>01.884.992.3-604.000</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 space-y-1">
            <div className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-teal-300 font-bold inline-block">
              {currentExportPackage.metadata.reportCode}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">KLASIFIKASI: INTERNAL RESMI</div>
          </div>
        </div>

        {/* MODULE 1: RINGKASAN EKSEKUTIF */}
        {activeReportTab === 'eksekutif' && (
          <div className="space-y-6">
            
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Total Volume Lead Periode Ini</span>
                <strong className="text-2xl font-extrabold text-slate-100 font-mono mt-1 block">{periodLeads.length} Lead</strong>
                <span className="text-[10px] text-teal-400 font-bold">100% Terverifikasi System</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Ketepatan SLA On-Time</span>
                <strong className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">94.2%</strong>
                <span className="text-[10px] text-emerald-400 font-bold">Target Lolos &ge; 90%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Pengiriman Antar-Pulau (Laut)</span>
                <strong className="text-2xl font-extrabold text-cyan-300 font-mono mt-1 block">
                  {periodLeads.filter(l => l.is_inter_island).length} Lead
                </strong>
                <span className="text-[10px] text-cyan-300 font-bold">Mitra Kapal Kargo Ro-Ro</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Health Index Operasional</span>
                <strong className="text-2xl font-extrabold text-teal-300 font-mono mt-1 block">96.8 / 100</strong>
                <span className="text-[10px] text-teal-400 font-bold">Kondisi Sangat Baik</span>
              </div>
            </div>

            {/* Narrative Box */}
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3 text-xs text-slate-300 leading-relaxed">
              <h4 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Naratif Analisis Eksekutif & Kepatuhan Operasional</span>
              </h4>
              <p>
                Berdasarkan data transaksi sistem IsoTrack untuk <strong>{periodRange.label}</strong>, pengiriman bahan kimia cair dan gas industri PT Niaga Segara Trasindo beroperasi dengan standar kepatuhan tinggi. Seluruh armada truk pengangkut mitra vendor (*PT Segara Logistik, PT Nusantara Trans, PT Samudra Jaya*) dan jasa kapal penyeberangan kargo antar-pulau (*Meratus Line, DLU, ASDP*) telah tervalidasi dokumen absah dan tiket penyeberangan sebelum unit bergerak.
              </p>
            </div>

            {/* TABEL LENGKAP TRANSAKSI LEAD PERIODE INI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-teal-400" />
                  <span>Daftar Transaksi Lead Operasional Sesuai Data Periode Terpilih ({periodLeads.length} Lead)</span>
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="p-3">ID Lead</th>
                      <th className="p-3">No Surat Jalan</th>
                      <th className="p-3">Klien Perusahaan</th>
                      <th className="p-3">Mitra Truk & Supir</th>
                      <th className="p-3">Pengangkutan Laut</th>
                      <th className="p-3">Isotank & Muatan</th>
                      <th className="p-3">Rute</th>
                      <th className="p-3">Tahap</th>
                      <th className="p-3">Status Ketibaan (BASTP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                    {periodLeads.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-500 italic">
                          Tidak ada transaksi lead pada periode yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      periodLeads.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-teal-300">
                            {l.lead_code || 'LEAD-00101'}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-100">{l.no_surat_jalan}</td>
                          <td className="p-3 text-slate-200 font-semibold">{l.client_company || 'PT Petrokimia'}</td>
                          <td className="p-3">
                            <div className="text-slate-100">{l.transport_vendor_name || 'PT Segara Logistik'}</div>
                            <div className="text-[10px] text-slate-400">{l.nama_supir} ({l.no_plat_truk})</div>
                          </td>
                          <td className="p-3">
                            {l.is_inter_island ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                                <Ship className="w-3 h-3" />
                                <span>{l.shipping_company}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Rute Darat</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-teal-400 font-bold">{l.asset_code}</div>
                            <div className="text-[10px] text-slate-400">{l.muatan}</div>
                          </td>
                          <td className="p-3 text-slate-300">{l.asal} &rarr; {l.tujuan}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-teal-300 border border-teal-500/20">
                              Stage {l.current_step}/8
                            </span>
                          </td>
                          <td className="p-3">
                            {l.final_delivery_doc_name ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>BASTP Sah</span>
                              </span>
                            ) : l.status === 'closed' ? (
                              <span className="text-emerald-400 font-bold text-[11px]">Selesai</span>
                            ) : (
                              <span className="text-amber-400 text-[11px]">Dalam Proses</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Corporate Sign-off Block */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-8">Manager Operasional Armada</span>
                <strong className="text-slate-100 font-bold block">Probo Subagyo</strong>
                <span className="text-[10px] text-teal-400 font-mono block">Signed & Approved</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-8">Reviewer Quality & QA</span>
                <strong className="text-slate-100 font-bold block">Wawan Setiawan</strong>
                <span className="text-[10px] text-teal-400 font-mono block">Verified & Audited</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-8">Sistem Informasi IT</span>
                <strong className="text-slate-100 font-bold block">Siti Aminah</strong>
                <span className="text-[10px] text-teal-400 font-mono block">System Verified</span>
              </div>
            </div>

          </div>
        )}

        {/* MODULE 2: PRODUKTIVITAS KARYAWAN & AUDIT SLA */}
        {activeReportTab === 'produktivitas_sla' && (
          <div className="space-y-6">
            
            {/* Stage Duration Averages Strip */}
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
              <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                Matriks Rata-Rata Durasi Pemrosesan per Stage (Siklus 8-Tahap)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Stage 1</div>
                  <div className="font-extrabold text-teal-300 font-mono mt-1">0.5 Jam</div>
                  <div className="text-[9px] text-slate-500">Lead Created</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Stage 2</div>
                  <div className="font-extrabold text-amber-400 font-mono mt-1">1.2 Jam</div>
                  <div className="text-[9px] text-slate-500">Approval Mgr</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Stage 3</div>
                  <div className="font-extrabold text-cyan-300 font-mono mt-1">28.4 Jam</div>
                  <div className="text-[9px] text-slate-500">In Progress</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Stage 4</div>
                  <div className="font-extrabold text-indigo-300 font-mono mt-1">0.8 Jam</div>
                  <div className="text-[9px] text-slate-500">Submission</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Stage 5</div>
                  <div className="font-extrabold text-purple-300 font-mono mt-1">2.1 Jam</div>
                  <div className="text-[9px] text-slate-500">Review QA</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Stage 6</div>
                  <div className="font-extrabold text-orange-400 font-mono mt-1">4.2 Jam</div>
                  <div className="text-[9px] text-slate-500">Follow-up</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Stage 7</div>
                  <div className="font-extrabold text-teal-300 font-mono mt-1">1.5 Jam</div>
                  <div className="text-[9px] text-slate-500">Final Approval</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Stage 8</div>
                  <div className="font-extrabold text-emerald-400 font-mono mt-1">CLOSED</div>
                  <div className="text-[9px] text-slate-500">Archived</div>
                </div>
              </div>
            </div>

            {/* Employee Productivity Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="p-3">Nama Karyawan</th>
                    <th className="p-3">Peran Sistem</th>
                    <th className="p-3">Departemen</th>
                    <th className="p-3">Lead Ditangani (Periode Ini)</th>
                    <th className="p-3">Lead Selesai (Closed)</th>
                    <th className="p-3">Total Revisi</th>
                    <th className="p-3">Kepatuhan SLA</th>
                    <th className="p-3">Status Google Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                  {users.map((u) => {
                    const handled = periodLeads.filter(l => l.pic_id === u.id || l.creator_id === u.id).length;
                    const closed = periodLeads.filter(l => (l.pic_id === u.id || l.creator_id === u.id) && l.status === 'closed').length;
                    const revs = periodLeads.filter(l => l.pic_id === u.id || l.creator_id === u.id).reduce((a, b) => a + b.total_revisions, 0);

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-100 flex items-center space-x-2">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                          <span>{u.name}</span>
                        </td>
                        <td className="p-3 uppercase text-[10px] font-bold text-teal-400">{u.role}</td>
                        <td className="p-3 text-slate-300">{u.department}</td>
                        <td className="p-3 font-mono font-bold text-slate-100">{handled} Lead</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{closed} Lead</td>
                        <td className="p-3 font-mono text-amber-400">{revs} Revisi</td>
                        <td className="p-3 font-mono font-bold text-teal-300">96.5%</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                            {u.googleLinked ? 'TERKONEKSI' : 'LOCAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* MODULE 3: REKAP BUKTI DOKUMEN (GROUPED BY ID LEAD WITH POPUP) & UTILISASI */}
        {activeReportTab === 'bukti_utilisasi' && (
          <div className="space-y-6">
            
            {/* Top Summary Banner */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span className="text-slate-200 font-bold">Ringkasan Folder Bukti Per ID Lead (Periode: {periodRange.label}):</span>
                <span className="text-slate-400">
                  Klik <strong className="text-teal-300">Popup Detail Berkas</strong> untuk membuka sub-menu berkas (Surat Jalan, Tiket Kapal, Foto, BASTP).
                </span>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchLeadQuery}
                  onChange={(e) => setSearchLeadQuery(e.target.value)}
                  placeholder="Cari ID Lead, SJ, Vendor, Kapal..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Grouped Lead Evidence Folder Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="p-3">ID Lead</th>
                    <th className="p-3">Surat Jalan & Isotank</th>
                    <th className="p-3">Klien & Vendor Transport</th>
                    <th className="p-3">Rute & Muatan Chemical</th>
                    <th className="p-3">PIC Operator</th>
                    <th className="p-3">Total Berkas</th>
                    <th className="p-3">Status Lead</th>
                    <th className="p-3 text-right">Aksi Sub-Menu Popup</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                  {displayedLeadDrive.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                        Tidak ada berkas lead yang sesuai dengan pencarian atau periode terpilih.
                      </td>
                    </tr>
                  ) : (
                    displayedLeadDrive.map((leadItem) => {
                      const leadFiles = evidences.filter(e => e.lead_id === leadItem.id);
                      return (
                        <tr key={leadItem.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-teal-300 text-xs">
                            <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                              {leadItem.lead_code || 'LEAD-00101'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-100 font-mono">{leadItem.no_surat_jalan}</div>
                            <div className="text-[10px] text-teal-400 font-mono">Unit: {leadItem.asset_code}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-slate-100 font-semibold">{leadItem.client_company || 'PT Petrokimia'}</div>
                            <div className="text-[10px] text-slate-400">{leadItem.transport_vendor_name || 'PT Segara Logistik'}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-200">{leadItem.asal} &rarr; {leadItem.tujuan}</div>
                            <div className="text-[10px] text-slate-400">{leadItem.muatan}</div>
                          </td>
                          <td className="p-3 text-slate-300">{leadItem.pic_name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                              {leadFiles.length} Berkas
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-teal-300 border border-teal-500/20">
                              Stage {leadItem.current_step}/8
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => openEvidencePopup(leadItem.id)}
                              className="px-3 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 flex items-center space-x-1 ml-auto shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Popup Detail Berkas</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Armada Isotank Utilization Breakdown Table */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Status Utilisasi Armada Unit Isotank PT Niaga Segara Trasindo
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="p-3">Kode Unit</th>
                      <th className="p-3">Tipe Spesifikasi</th>
                      <th className="p-3">Kapasitas</th>
                      <th className="p-3">Lokasi Depo</th>
                      <th className="p-3">Tekanan Max</th>
                      <th className="p-3">Inspeksi Terakhir</th>
                      <th className="p-3">Status Operasional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                    {assets.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-teal-300 font-mono">{a.code}</td>
                        <td className="p-3 font-semibold text-slate-100">{a.type}</td>
                        <td className="p-3 font-mono">{a.capacity}</td>
                        <td className="p-3 text-slate-300">{a.location}</td>
                        <td className="p-3 font-mono">{a.maxPressure}</td>
                        <td className="p-3 font-mono text-slate-400">{a.lastInspectionDate}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            a.status === 'Tersedia' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            a.status === 'Beroperasi' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                            a.status === 'Perawatan' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* MODULE 4: KONTROL KUALITAS & AUDIT TRAIL */}
        {activeReportTab === 'audit_kontrol' && (
          <div className="space-y-6">
            
            {/* QA Issues Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Catatan Kontrol Kualitas & Kendala Operasional Lapangan (QA) ({periodIssues.length} Kendala)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="p-3">ID Kendala</th>
                      <th className="p-3">ID Lead</th>
                      <th className="p-3">Deskripsi Hambatan Lapangan</th>
                      <th className="p-3">Pelapor</th>
                      <th className="p-3">Waktu Lapor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Catatan Solusi / Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                    {periodIssues.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                          Tidak ada kendala operasional yang dilaporkan pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      periodIssues.map((i) => (
                        <tr key={i.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-slate-400">{i.id}</td>
                          <td className="p-3 font-mono font-bold text-teal-400 text-[11px]">{i.lead_code || 'LEAD-00101'}</td>
                          <td className="p-3 font-semibold text-slate-100">{i.deskripsi}</td>
                          <td className="p-3">{i.pelapor_name} ({i.pelapor_role.toUpperCase()})</td>
                          <td className="p-3 font-mono text-slate-400">{i.reported_at}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              i.status === 'open' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
                            }`}>
                              {i.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">{i.resolution_notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Trail Log Transcript */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Jejak Audit Trail Sistem Resmi (Append-Only Log Transcript - {periodAuditLogs.length} Entri)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="p-3">Nomor Log</th>
                      <th className="p-3">Waktu Lengkap (Detik)</th>
                      <th className="p-3">Pengguna & Peran</th>
                      <th className="p-3">Aksi Transaksi</th>
                      <th className="p-3">Entitas Target</th>
                      <th className="p-3">Detail Transcript</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                    {periodAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                          Tidak ada log audit pada periode yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      periodAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-teal-400">{log.log_number}</td>
                          <td className="p-3 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-100">{log.user_name}</div>
                            <div className="text-[10px] text-slate-500 uppercase">{log.user_role}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 font-mono">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">{log.entity} #{log.entity_id}</td>
                          <td className="p-3 text-slate-300">{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Drill-down Sub-Menu Popup Modal */}
      <LeadEvidencePopupModal
        isOpen={isEvidencePopupOpen}
        onClose={() => setIsEvidencePopupOpen(false)}
        leadId={selectedLeadForPopup}
      />

      {/* Corporate PDF / Print Preview Modal */}
      <CorporateReportPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        metadata={currentExportPackage.metadata}
        tableData={currentExportPackage.tableData}
        filenamePrefix={currentExportPackage.filenamePrefix}
      />

      {/* Central Report Download Selection Popup Modal */}
      <ReportDownloadModal
        isOpen={isDownloadPopupOpen}
        onClose={() => setIsDownloadPopupOpen(false)}
        initialType={downloadPopupType}
        initialMonth={10}
        initialYear={2026}
      />

    </div>
  );
};
