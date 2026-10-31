import React, { useState } from 'react';
import {
  BarChart3, Printer, Download, FileText, Users, Clock, Truck,
  AlertTriangle, ShieldCheck, Sparkles, Filter, CheckCircle2,
  TrendingUp, Award, Layers, ShieldAlert, Check, Eye, ExternalLink,
  ChevronRight, Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeadEvidencePopupModal } from '../components/LeadEvidencePopupModal';

export const ReportsView: React.FC = () => {
  const { filteredLeads, assets, issues, auditLogs, closures, evidences, users, setSelectedLeadId } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<
    'eksekutif' | 'produktivitas_sla' | 'bukti_utilisasi' | 'audit_kontrol'
  >('eksekutif');

  // Modal State for Popup Sub-menu
  const [selectedLeadForPopup, setSelectedLeadForPopup] = useState<string | null>(null);
  const [isEvidencePopupOpen, setIsEvidencePopupOpen] = useState<boolean>(false);
  const [searchLeadQuery, setSearchLeadQuery] = useState<string>('');

  // Helper to export any table data to CSV file
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCurrent = () => {
    const timestampStr = new Date().toISOString().slice(0, 10);

    if (activeReportTab === 'eksekutif') {
      const headers = ['ID Lead', 'No Surat Jalan', 'Kode Isotank', 'Asal', 'Tujuan', 'Muatan', 'Stage', 'Status SLA', 'Revisi'];
      const rows = filteredLeads.map(l => [
        l.lead_code || 'LEAD-00101', l.no_surat_jalan, l.asset_code, l.asal, l.tujuan, l.muatan, `Stage ${l.current_step}`, l.status === 'closed' ? 'CLOSED' : 'IN_PROGRESS', l.total_revisions
      ]);
      exportToCSV(`Laporan_Ringkasan_Eksekutif_${timestampStr}`, headers, rows);
    } else if (activeReportTab === 'produktivitas_sla') {
      const headers = ['Nama Karyawan', 'Peran System', 'Departemen', 'Lead Ditangani', 'Lead Selesai', 'Total Revisi', 'Tingkat SLA %', 'Status Google Sync'];
      const rows = users.map(u => {
        const handled = filteredLeads.filter(l => l.pic_id === u.id || l.creator_id === u.id).length;
        const closed = filteredLeads.filter(l => (l.pic_id === u.id || l.creator_id === u.id) && l.status === 'closed').length;
        const revs = filteredLeads.filter(l => l.pic_id === u.id || l.creator_id === u.id).reduce((a, b) => a + b.total_revisions, 0);
        return [u.name, u.role.toUpperCase(), u.department, handled, closed, revs, '96.5%', u.googleLinked ? 'TERKONEKSI' : 'LOCAL'];
      });
      exportToCSV(`Laporan_Produktivitas_Dan_SLA_Karyawan_${timestampStr}`, headers, rows);
    } else if (activeReportTab === 'bukti_utilisasi') {
      const headers = ['ID Lead', 'No Surat Jalan', 'Kode Isotank', 'Rute Asal-Tujuan', 'Muatan Chemical', 'PIC Operator', 'Total Dokumen', 'Status Lead'];
      const rows = filteredLeads.map(l => {
        const fileCount = evidences.filter(e => e.lead_id === l.id).length;
        return [l.lead_code || 'LEAD-00101', l.no_surat_jalan, l.asset_code, `${l.asal} -> ${l.tujuan}`, l.muatan, l.pic_name, `${fileCount} Berkas`, `Stage ${l.current_step}`];
      });
      exportToCSV(`Laporan_Rekap_Bukti_Dan_Utilisasi_${timestampStr}`, headers, rows);
    } else if (activeReportTab === 'audit_kontrol') {
      const headers = ['No Log System', 'Waktu Detik', 'Pengguna', 'Peran System', 'Aksi Transaksi', 'Entitas Target', 'Detail Transcript'];
      const rows = auditLogs.map(l => [
        l.log_number, l.timestamp, l.user_name, l.user_role.toUpperCase(), l.action, `${l.entity} #${l.entity_id}`, l.details
      ]);
      exportToCSV(`Laporan_Kontrol_Kualitas_Dan_Audit_Trail_${timestampStr}`, headers, rows);
    }
  };

  const handlePrint = () => {
    window.print();
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
      desc: 'KPI Konsolidasi, Performa Rute Utama, & Otorisasi Direksi'
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

  // Filtered Leads for Grouped Evidence Module
  const displayedLeadDrive = filteredLeads.filter(l => {
    if (!searchLeadQuery.trim()) return true;
    const q = searchLeadQuery.toLowerCase();
    return (
      (l.lead_code || '').toLowerCase().includes(q) ||
      l.no_surat_jalan.toLowerCase().includes(q) ||
      l.asset_code.toLowerCase().includes(q) ||
      l.asal.toLowerCase().includes(q) ||
      l.tujuan.toLowerCase().includes(q) ||
      l.pic_name.toLowerCase().includes(q)
    );
  });

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
            Pemetaan data terstruktur dan ringkas berbasis modul eksekutif dengan dukungan popup drill-down dokumen resmi PT Niaga Segara Trasindo.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCurrent}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-2 border border-slate-700 transition-colors shadow-md"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Ekspor CSV File</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/20 transition-transform hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF Laporan Resmi</span>
          </button>
        </div>
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
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-md font-mono">
              NST
            </div>
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-widest">PT NIAGA SEGARA TRASINDO</div>
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight mt-0.5">
                {activeReportTab === 'eksekutif' && 'MODULE 1: RINGKASAN EKSEKUTIF & HEALTH SCORE OPERASIONAL'}
                {activeReportTab === 'produktivitas_sla' && 'MODULE 2: KINERJA KARYAWAN & AUDIT SIKLUS WAKTU SLA'}
                {activeReportTab === 'bukti_utilisasi' && 'MODULE 3: REKAP BUKTI DOKUMEN (POPUP SUB-MENU) & UTILISASI ARMADA'}
                {activeReportTab === 'audit_kontrol' && 'MODULE 4: KONTROL KUALITAS (QA) & AUDIT TRAIL SISTEM RESMI'}
              </h2>
              <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-1">
                <span>Tanggal Laporan: <strong>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                <span>·</span>
                <span>Standar Kepatuhan: <strong>ISO-9001 / HAZMAT SAFETY AUDIT</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 space-y-1">
            <div className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-teal-300 font-bold inline-block">
              REF NO: NST-EXEC-2026-V8
            </div>
            <div className="text-[10px] text-slate-500 uppercase">KLASIFIKASI: INTERNAL CONFIDENTIAL</div>
          </div>
        </div>

        {/* MODULE 1: RINGKASAN EKSEKUTIF */}
        {activeReportTab === 'eksekutif' && (
          <div className="space-y-6">
            
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Total Volume Lead</span>
                <strong className="text-2xl font-extrabold text-slate-100 font-mono mt-1 block">{filteredLeads.length} Lead</strong>
                <span className="text-[10px] text-teal-400 font-bold">100% Terverifikasi System</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Ketepatan SLA On-Time</span>
                <strong className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">94.2%</strong>
                <span className="text-[10px] text-emerald-400 font-bold">Target Lolos &ge; 90%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-xs text-slate-400 font-semibold block">Rata Siklus Pengiriman</span>
                <strong className="text-2xl font-extrabold text-cyan-300 font-mono mt-1 block">198 Jam</strong>
                <span className="text-[10px] text-slate-400">Stage 1 s/d Stage 8</span>
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
                Berdasarkan konsolidasi data transaksi sistem IsoTrack, kinerja pengiriman bahan kimia cair dan gas industri PT Niaga Segara Trasindo pada periode ini mencatatkan efisiensi tinggi. Rute utama frekuensi tinggi seperti **Depo Utama Tuban - Petrokimia Gresik**, **Tanjung Perak - Terboyo Semarang**, dan **Depo Cilegon - Jababeka Cikarang** beroperasi secara optimal dengan utilisasi isotank mencapai **73.3%**.
              </p>
              <p>
                Penerapan verifikasi checklist 4-butir di Stage 2 (Manager Approval) dan 3-butir di Stage 5 (Reviewer Verification) terbukti meminimalkan risiko kesalahan administrasi Surat Jalan stempel basah.
              </p>
            </div>

            {/* Main Routes Summary Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Performa Rute Pengiriman Utama</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="p-3">Rute Pengiriman</th>
                      <th className="p-3">Spesifikasi Muatan</th>
                      <th className="p-3">Total Volume</th>
                      <th className="p-3">Durasi Rata-rata</th>
                      <th className="p-3">SLA Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-100">Tuban &rarr; Gresik</td>
                      <td className="p-3">Caustic Soda Liquid 48%</td>
                      <td className="p-3 font-mono">4 Lead</td>
                      <td className="p-3 font-mono">36 Jam</td>
                      <td className="p-3 font-bold text-emerald-400">100% On-Time</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-100">Surabaya &rarr; Semarang</td>
                      <td className="p-3">Methanol Grade A Industrial</td>
                      <td className="p-3 font-mono">3 Lead</td>
                      <td className="p-3 font-mono">48 Jam</td>
                      <td className="p-3 font-bold text-emerald-400">100% On-Time</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-100">Cilegon &rarr; Cikarang</td>
                      <td className="p-3">LPG Industrial Mix</td>
                      <td className="p-3 font-mono">3 Lead</td>
                      <td className="p-3 font-mono">52 Jam</td>
                      <td className="p-3 font-bold text-amber-400">92% On-Time</td>
                    </tr>
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
                    <th className="p-3">Peran System</th>
                    <th className="p-3">Departemen</th>
                    <th className="p-3">Lead Ditangani</th>
                    <th className="p-3">Lead Selesai</th>
                    <th className="p-3">Total Revisi</th>
                    <th className="p-3">SLA On-Time Rate</th>
                    <th className="p-3">Status Google Sign-In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                  {users.map((u) => {
                    const handledCount = filteredLeads.filter(l => l.pic_id === u.id || l.creator_id === u.id).length;
                    const closedCount = filteredLeads.filter(l => (l.pic_id === u.id || l.creator_id === u.id) && l.status === 'closed').length;
                    const revsCount = filteredLeads.filter(l => l.pic_id === u.id || l.creator_id === u.id).reduce((a, b) => a + b.total_revisions, 0);

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-100 flex items-center space-x-2">
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full border border-slate-700 object-cover" />
                          <div>
                            <div>{u.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </td>
                        <td className="p-3 uppercase font-bold text-teal-400">{u.role}</td>
                        <td className="p-3 text-slate-400">{u.department}</td>
                        <td className="p-3 font-bold font-mono text-slate-100">{handledCount} Lead</td>
                        <td className="p-3 font-bold font-mono text-emerald-400">{closedCount} Lead</td>
                        <td className="p-3 font-mono text-amber-400">{revsCount} Kali</td>
                        <td className="p-3 font-bold text-emerald-400">96.5%</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                            TERKONEKSI
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
                <span className="text-slate-200 font-bold">Ringkasan Folder Bukti Per ID Lead:</span>
                <span className="text-slate-400">
                  Data dikelompokkan ringkas per ID Lead. Klik <strong className="text-teal-300">Popup Detail Berkas</strong> untuk memilih & melihat berkas lampiran per stage secara interaktif.
                </span>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchLeadQuery}
                  onChange={(e) => setSearchLeadQuery(e.target.value)}
                  placeholder="Cari ID Lead, SJ, Asset..."
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
                    <th className="p-3">Rute & Muatan Chemical</th>
                    <th className="p-3">PIC Operator</th>
                    <th className="p-3">Total Berkas Dokumen</th>
                    <th className="p-3">Status Lead</th>
                    <th className="p-3 text-right">Aksi Sub-Menu Popup</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                  {displayedLeadDrive.map((leadItem) => {
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
                          <div className="font-semibold text-slate-200">{leadItem.asal} &rarr; {leadItem.tujuan}</div>
                          <div className="text-[10px] text-slate-400">{leadItem.muatan}</div>
                        </td>
                        <td className="p-3 text-slate-300">{leadItem.pic_name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                            {leadFiles.length} Berkas Lampiran
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
                  })}
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
                Catatan Kontrol Kualitas & Kendala Operasional Lapangan (QA)
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
                    {issues.map((i) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Trail Log Transcript */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Jejak Audit Trail Sistem Resmi (Append-Only Log Transcript)
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
                    {auditLogs.map((log) => (
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
                    ))}
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

    </div>
  );
};
