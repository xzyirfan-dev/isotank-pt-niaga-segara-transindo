import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  Ship, 
  Truck, 
  AlertTriangle, 
  RefreshCw, 
  Upload, 
  ChevronDown, 
  Building2, 
  MapPin, 
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose }) => {
  const { assets, users, currentUser, createNewLead, leads, checkDuplicateLead } = useApp();

  const generateAutoSJ = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `SJ-NST-2026-${randomNum}`;
  };

  const [noSuratJalan, setNoSuratJalan] = useState(generateAutoSJ());
  const [clientCompany, setClientCompany] = useState('PT Petrokimia Utama Indonesia');
  const [transportVendorName, setTransportVendorName] = useState('PT Segara Logistik Express');
  const [namaSupir, setNamaSupir] = useState('Bambang Susanto (SIM B2 Umum)');
  const [noPlatTruk, setNoPlatTruk] = useState('B 9842 UFX');
  const [transportDocName, setTransportDocName] = useState('Surat_Penunjukan_Transporter_SegaraLogistik.pdf');

  // Active dropdown popover key ('transportVendor' | 'transportDoc' | 'shippingCompany' | 'vesselTicketDoc' | 'muatan' | null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Inter-Island Sea Freight (Kapal Kargo / Ro-Ro)
  const [isInterIsland, setIsInterIsland] = useState<boolean>(false);
  const [shippingCompany, setShippingCompany] = useState<string>('PT Pelayaran Meratus Line');
  const [vesselName, setVesselName] = useState<string>('KM Meratus Banjar');
  const [voyageNumber, setVoyageNumber] = useState<string>('VOY-2026/088-SBY-BPN');
  const [vesselSchedule, setVesselSchedule] = useState<string>('ETD: 02 Nov 18:00 WIB | ETA: 04 Nov 07:00 WITA');
  const [portOrigin, setPortOrigin] = useState<string>('Pelabuhan Tanjung Perak Surabaya');
  const [portDestination, setPortDestination] = useState<string>('Pelabuhan Semayang Balikpapan');
  const [vesselTicketDocName, setVesselTicketDocName] = useState<string>('Tiket_Booking_Kapal_Meratus_VOY088.pdf');
  const [vesselTicketStatus, setVesselTicketStatus] = useState<'terlampir' | 'menyusul'>('terlampir');

  const [assetId, setAssetId] = useState('');
  const [asal, setAsal] = useState('Depo Utama Tuban');
  const [tujuan, setTujuan] = useState('Kawasan Industri Petrokimia Gresik');
  const [muatan, setMuatan] = useState('Caustic Soda Liquid 48%');
  const [targetAt, setTargetAt] = useState('');
  const [managerId, setManagerId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Find managers
  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  useEffect(() => {
    if (managers.length > 0 && !managerId) {
      setManagerId(managers[0].id);
    }
  }, [managers, managerId]);

  // Click outside to close active dropdown popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Check which assets are currently occupied by active leads (status 1..7)
  const occupiedAssetIds = new Set(
    leads.filter(l => l.status !== 'closed').map(l => l.asset_id)
  );

  const selectedAsset = assets.find(a => a.id === assetId);
  const duplicateStatus = checkDuplicateLead(noSuratJalan, clientCompany, selectedAsset?.code);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (duplicateStatus.isDuplicate) {
      setErrorMsg(`Peringatan Validasi Sistem: ${duplicateStatus.message}. Harap ganti nomor surat jalan atau pilih unit isotank yang berstatus tersedia!`);
      return;
    }

    if (!noSuratJalan || !clientCompany || !transportVendorName || !namaSupir || !noPlatTruk || !assetId || !asal || !tujuan || !muatan || !targetAt || !managerId) {
      setErrorMsg('Seluruh bidang formulir wajib diisi dengan benar termasuk data Klien, Mitra Transporter & Driver!');
      return;
    }

    if (isInterIsland && (!shippingCompany || !vesselName || !voyageNumber)) {
      setErrorMsg('Untuk pengiriman antar-pulau, data Perusahaan Kapal Kargo, Nama Kapal, dan No. Voyage wajib diisi!');
      return;
    }

    if (!selectedAsset) {
      setErrorMsg('Unit Isotank tidak valid!');
      return;
    }

    const selectedManager = users.find(u => u.id === managerId);
    const nextLeadNum = 100 + leads.length + 1;
    const generatedCode = `LEAD-00${nextLeadNum}`;

    const result = createNewLead({
      lead_code: generatedCode,
      no_surat_jalan: noSuratJalan,
      client_company: clientCompany,
      transport_vendor_name: transportVendorName,
      nama_supir: namaSupir,
      no_plat_truk: noPlatTruk,
      transport_doc_name: transportDocName || 'Surat_Penunjukan_Transporter.pdf',
      is_inter_island: isInterIsland,
      shipping_company: isInterIsland ? shippingCompany : undefined,
      vessel_name: isInterIsland ? vesselName : undefined,
      voyage_number: isInterIsland ? voyageNumber : undefined,
      vessel_schedule: isInterIsland ? vesselSchedule : undefined,
      port_origin: isInterIsland ? portOrigin : undefined,
      port_destination: isInterIsland ? portDestination : undefined,
      vessel_ticket_doc_name: isInterIsland ? (vesselTicketStatus === 'menyusul' ? 'MENYUSUL (Belum Dilampirkan)' : (vesselTicketDocName || 'Tiket_Booking_Kapal.pdf')) : undefined,
      vessel_ticket_status: isInterIsland ? vesselTicketStatus : undefined,
      asset_id: assetId,
      asset_code: selectedAsset.code,
      creator_id: currentUser.id,
      creator_name: currentUser.name,
      manager_id: managerId,
      manager_name: selectedManager?.name || 'Probo Subagyo',
      pic_id: currentUser.id,
      pic_name: currentUser.name,
      reviewer_id: users.find(u => u.role === 'reviewer')?.id,
      reviewer_name: users.find(u => u.role === 'reviewer')?.name || 'Wawan Setiawan',
      asal,
      tujuan,
      muatan,
      target_at: new Date(targetAt).toISOString(),
    });

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setNoSuratJalan(generateAutoSJ());
      }, 1000);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col"
      >
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm tracking-wide">Inisiasi Lead Transaksi Baru & Penunjukan Transporter</h3>
              <p className="text-[11px] text-slate-400 font-medium">Stage 1 Operational Ingestion & Vendor Assignment</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
            title="Tutup Modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Real-time Duplicate Detection Banner */}
          {duplicateStatus.isDuplicate && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold flex items-center justify-between text-amber-300">
                  <span>Deteksi Duplikasi Sistem ({duplicateStatus.field})</span>
                  {duplicateStatus.field === 'no_surat_jalan' && (
                    <button
                      type="button"
                      onClick={() => setNoSuratJalan(generateAutoSJ())}
                      className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center space-x-1 underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Acak No. SJ Baru</span>
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-slate-300 text-[11px] leading-relaxed">
                  {duplicateStatus.message}
                </p>
                {duplicateStatus.existingLead && (
                  <div className="mt-1.5 p-2 rounded-lg bg-slate-900/80 border border-amber-500/20 text-[10px] text-slate-300 font-mono">
                    <span className="text-amber-400 font-bold">{duplicateStatus.existingLead.lead_code}</span>: {duplicateStatus.existingLead.client_company} · Unit: {duplicateStatus.existingLead.asset_code} · Status: <span className="uppercase text-teal-300">{duplicateStatus.existingLead.status}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 1: INFORMASI KLIEN & TRANSAKSI */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  1. Data Klien Perusahaan & Transaksi
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-700/80 text-slate-300 text-[10px] font-mono font-semibold">
                STEP 1 INISIASI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Client Company Name - UNIFIED SMART INPUT */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Nama Perusahaan Klien / Pemilik Muatan:
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="Contoh: PT Petrokimia Utama Indonesia"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-28 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'clientCompany' ? null : 'clientCompany')}
                    className="absolute right-1 px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-teal-300 text-[11px] font-bold flex items-center space-x-1 transition-colors border border-teal-500/30 cursor-pointer"
                  >
                    <span>🏢 Preset</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'clientCompany' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Client Downlist Popover */}
                  {openDropdown === 'clientCompany' && (
                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-slate-800 border border-teal-500/40 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-slate-700/60 animate-fadeIn">
                      {[
                        { label: 'PT Petrokimia Utama Indonesia', desc: 'Industri Pupuk & Petrokimia Nasional' },
                        { label: 'PT Pupuk Kalimantan Timur (PKT)', desc: 'Produsen Pupuk Kimia & Urea Terbesar' },
                        { label: 'PT Chandra Asri Pacific Tbk', desc: 'Perusahaan Petrokimia Terintegrasi' },
                        { label: 'PT Wilmar Nabati Indonesia', desc: 'Industri Pengolahan Oleokimia & Nabati' },
                        { label: 'PT Lautan Luas Tbk', desc: 'Distributor Bahan Kimia Industri' },
                        { label: 'PT Asahimas Chemical', desc: 'Chlor-Alkali & Caustic Soda' }
                      ].map((opt) => (
                        <button
                          type="button"
                          key={opt.label}
                          onClick={() => {
                            setClientCompany(opt.label);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-teal-500/15 text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                            clientCompany === opt.label ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-teal-300">{opt.label}</span>
                            {clientCompany === opt.label && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* No Surat Jalan */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    No. Surat Jalan <span className="text-teal-400 font-semibold">(Unik)</span>:
                  </label>
                  <button
                    type="button"
                    onClick={() => setNoSuratJalan(generateAutoSJ())}
                    className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center space-x-1 px-2 py-0.5 rounded bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Acak No. SJ</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={noSuratJalan}
                    onChange={(e) => setNoSuratJalan(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 h-10 text-xs font-mono font-bold text-teal-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: TRANSPORTER & DRIVER (UNIFIED SMART INPUTS) */}
          <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  2. Pencarian & Penunjukan Mitra Transporter / Truk
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                PENTING UNTUK STAGE 2
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Transport Vendor Company - UNIFIED SMART INPUT */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Nama Perusahaan Penyedia Truk / Vendor:
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={transportVendorName}
                    onChange={(e) => setTransportVendorName(e.target.value)}
                    placeholder="Contoh: PT Segara Logistik Express"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-28 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'transportVendor' ? null : 'transportVendor')}
                    className="absolute right-1 px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-teal-300 text-[11px] font-bold flex items-center space-x-1 transition-colors border border-teal-500/30 cursor-pointer"
                  >
                    <span>🚛 Preset</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'transportVendor' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Downlist Popover */}
                  {openDropdown === 'transportVendor' && (
                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-slate-800 border border-teal-500/40 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-slate-700/60 animate-fadeIn">
                      {[
                        { label: 'PT Segara Logistik Express', desc: 'Vendor Utama NST - Tanker & B3 Transport' },
                        { label: 'PT Transporindo Agung Sejahtera', desc: 'Armada Truk Trailer & Isotank Jawa-Bali' },
                        { label: 'PT Dunex Logistics Indonesia', desc: 'Spesialis Angkutan Bahan Kimia Cair' },
                        { label: 'PT Cipta Krida Bahari (CKB)', desc: 'Penyedia Logistik Multimoda Tanker' }
                      ].map((opt) => (
                        <button
                          type="button"
                          key={opt.label}
                          onClick={() => {
                            setTransportVendorName(opt.label);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-teal-500/15 text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                            transportVendorName === opt.label ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-teal-300">{opt.label}</span>
                            {transportVendorName === opt.label && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Driver Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Nama Supir / Pengemudi Truk:
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={namaSupir}
                    onChange={(e) => setNamaSupir(e.target.value)}
                    placeholder="Contoh: Bambang Susanto (SIM B2 Umum)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Truck License Plate */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Nomor Plat Truk Pengangkut:
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={noPlatTruk}
                    onChange={(e) => setNoPlatTruk(e.target.value)}
                    placeholder="Contoh: B 9842 UFX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 h-10 text-xs font-mono font-bold text-teal-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Legal Document Attachment - UNIFIED DUAL ACTION INPUT */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Dokumen Lampiran Absah (STNK / SIM / Penunjukan):
                  </label>
                  {transportDocName && (
                    <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-teal-400" /> TERLAMPIR
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={transportDocName}
                    onChange={(e) => setTransportDocName(e.target.value)}
                    placeholder="Nama Berkas Dokumen (pdf/jpg)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-44 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono transition-all"
                    required
                  />

                  {/* Integrated Action Buttons */}
                  <div className="absolute right-1 flex items-center space-x-1">
                    <label className="px-2 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-sm">
                      <Upload className="w-3 h-3 text-slate-950" />
                      <span>Unggah</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setTransportDocName(file.name);
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === 'transportDoc' ? null : 'transportDoc')}
                      className="px-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 text-teal-300 text-[11px] font-bold flex items-center space-x-1 border border-teal-500/30 transition-colors cursor-pointer"
                    >
                      <span>📄 Preset</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'transportDoc' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Downlist Popover */}
                  {openDropdown === 'transportDoc' && (
                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-slate-800 border border-teal-500/40 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-slate-700/60 animate-fadeIn">
                      {[
                        { label: 'Surat Penunjukan Transporter', val: 'Surat_Penunjukan_Transporter_SegaraLogistik.pdf', desc: 'Resmi penunjukan vendor PT Segara Logistik' },
                        { label: 'STNK Truk & SIM B2 Umum', val: 'STNK_Truk_B9842UFX_Dan_SIM_B2.pdf', desc: 'Identitas legalitas fisik kendaraan & pengemudi' },
                        { label: 'Kontrak Kemitraan Transport 2026', val: 'Kontrak_Kemitraan_Transport_2026.pdf', desc: 'Perjanjian kerjasama pengangkutan B2B' },
                        { label: 'Izin Operasional Transporter B3', val: 'Izin_Transporter_B3_KemenLHK.pdf', desc: 'Lisensi izin pengangkutan bahan berbahaya KemenLHK' }
                      ].map((opt) => (
                        <button
                          type="button"
                          key={opt.val}
                          onClick={() => {
                            setTransportDocName(opt.val);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-teal-500/15 text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                            transportDocName === opt.val ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-teal-300">{opt.label}</span>
                            {transportDocName === opt.val && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono truncate">{opt.val}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: PENGIRIMAN LUAR PULAU (KAPAL KARGO / RO-RO) */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Ship className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  3. Pengiriman Luar Pulau (Jasa Kapal Kargo / Ro-Ro)
                </span>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-1 rounded-xl border border-cyan-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={isInterIsland}
                  onChange={(e) => setIsInterIsland(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                />
                <span className="text-xs font-bold text-cyan-300">
                  {isInterIsland ? '✓ Aktif: Rute Luar Pulau' : 'Aktifkan Bila Luar Pulau'}
                </span>
              </label>
            </div>

            {isInterIsland ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-cyan-500/20">
                
                {/* Shipping Company - UNIFIED SMART INPUT */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Nama Perusahaan Jasa Kapal Kargo / Ro-Ro:
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={shippingCompany}
                      onChange={(e) => setShippingCompany(e.target.value)}
                      placeholder="Contoh: PT Pelayaran Meratus Line"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-28 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                      required={isInterIsland}
                    />
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === 'shippingCompany' ? null : 'shippingCompany')}
                      className="absolute right-1 px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold flex items-center space-x-1 border border-cyan-500/30 transition-colors cursor-pointer"
                    >
                      <span>🚢 Preset</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'shippingCompany' ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Popover */}
                    {openDropdown === 'shippingCompany' && (
                      <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-slate-800 border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-slate-700/60 animate-fadeIn">
                        {[
                          { label: 'PT Pelayaran Meratus Line', desc: 'Layanan Kapal Container & Kargo Antar-Pulau' },
                          { label: 'PT Dharma Lautan Utama (DLU)', desc: 'Kapal Ro-Ro Penyeberangan Fast Logistics' },
                          { label: 'PT ASDP Indonesia Ferry', desc: 'BUMN Penyeberangan Utama Indonesia' },
                          { label: 'PT Samudera Indonesia', desc: 'Pelayaran Kargo Industri & Multimoda' },
                          { label: 'PT Salam Pacific Indonesia Lines (SPIL)', desc: 'Armada Petikemas & Tanker Laut' }
                        ].map((opt) => (
                          <button
                            type="button"
                            key={opt.label}
                            onClick={() => {
                              setShippingCompany(opt.label);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3.5 py-2 hover:bg-cyan-500/15 text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                              shippingCompany === opt.label ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-cyan-300">{opt.label}</span>
                              {shippingCompany === opt.label && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                            </div>
                            <span className="text-[10px] text-slate-400 truncate">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vessel Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Kapal Kargo / Ro-Ro Pengangkut:
                  </label>
                  <input
                    type="text"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    placeholder="Contoh: KM Meratus Banjar"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    required={isInterIsland}
                  />
                </div>

                {/* Voyage Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    No. Voyage / Manifest ID:
                  </label>
                  <input
                    type="text"
                    value={voyageNumber}
                    onChange={(e) => setVoyageNumber(e.target.value)}
                    placeholder="Contoh: VOY-2026/088-SBY-BPN"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-cyan-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    required={isInterIsland}
                  />
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Jadwal Pelayaran (ETD Keberangkatan & ETA):
                  </label>
                  <input
                    type="text"
                    value={vesselSchedule}
                    onChange={(e) => setVesselSchedule(e.target.value)}
                    placeholder="Contoh: ETD: 02 Nov 18:00 WIB | ETA: 04 Nov 07:00 WITA"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    required={isInterIsland}
                  />
                </div>

                {/* Port Origin */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pelabuhan Asal Muat Kapal:</label>
                  <input
                    type="text"
                    value={portOrigin}
                    onChange={(e) => setPortOrigin(e.target.value)}
                    placeholder="Contoh: Pelabuhan Tanjung Perak Surabaya"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Port Destination */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pelabuhan Tujuan Bongkar Kapal:</label>
                  <input
                    type="text"
                    value={portDestination}
                    onChange={(e) => setPortDestination(e.target.value)}
                    placeholder="Contoh: Pelabuhan Semayang Balikpapan"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Vessel Ticket Status Choice: Terlampir vs Menyusul */}
                <div className="md:col-span-2 space-y-2 pt-1">
                  <label className="block text-xs font-bold text-cyan-300">
                    Pilihan Status Waktu Dokumen Tiket & Booking Kapal (Validasi Keamanan & Proses Lapangan):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVesselTicketStatus('terlampir')}
                      className={`p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                        vesselTicketStatus === 'terlampir'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold">Lampirkan Sekarang</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Tiket & booking kapal sudah siap diunggah</div>
                      </div>
                      {vesselTicketStatus === 'terlampir' && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setVesselTicketStatus('menyusul')}
                      className={`p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                        vesselTicketStatus === 'menyusul'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold">Tiket Menyusul</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Karyawan masih mengurus armada/truk/kapal bertahap (wajib sebelum truk ke pelabuhan)</div>
                      </div>
                      {vesselTicketStatus === 'menyusul' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                    </button>
                  </div>
                </div>

                {/* Vessel Booking Document / Ticket - UNIFIED DUAL ACTION INPUT */}
                <div className="md:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Lampiran Form Pemesanan / Tiket Jasa Kapal (PDF/JPG):
                    </label>
                    {vesselTicketStatus === 'menyusul' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> STATUS: MENYUSUL
                      </span>
                    ) : vesselTicketDocName ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" /> TERLAMPIR
                      </span>
                    ) : null}
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={vesselTicketDocName}
                      onChange={(e) => setVesselTicketDocName(e.target.value)}
                      placeholder="Nama Berkas Tiket (pdf/jpg)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-48 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono transition-all"
                      required={isInterIsland}
                    />

                    {/* Integrated Action Buttons */}
                    <div className="absolute right-1 flex items-center space-x-1">
                      <label className="px-2 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-sm">
                        <Upload className="w-3 h-3 text-slate-950" />
                        <span>Unggah Tiket</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setVesselTicketDocName(file.name);
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === 'vesselTicketDoc' ? null : 'vesselTicketDoc')}
                        className="px-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 text-cyan-300 text-[11px] font-bold flex items-center space-x-1 border border-cyan-500/30 transition-colors cursor-pointer"
                      >
                        <span>🎫 Preset</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'vesselTicketDoc' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Popover */}
                    {openDropdown === 'vesselTicketDoc' && (
                      <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-slate-800 border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-slate-700/60 animate-fadeIn">
                        {[
                          { label: 'Tiket Booking Kapal Meratus VOY088', val: 'Tiket_Booking_Kapal_Meratus_VOY088.pdf', desc: 'Bukti resmi konfirmasi slot kapal kargo Meratus' },
                          { label: 'Form Pemesanan Kapal Dharma Rucitra', val: 'Form_Pemesanan_Kapal_DharmaRucitra.pdf', desc: 'Resi booking truk & Isotank Ro-Ro DLU' },
                          { label: 'Manifes Kargo Pelayaran ASDP', val: 'Manifest_Kargo_Pelayaran_ASDP.pdf', desc: 'Manifes sah penyeberangan armada kapal ASDP' },
                          { label: 'Bill of Lading (B/L) Sea Freight', val: 'Bill_of_Lading_SeaFreight_2026.pdf', desc: 'Dokumen kepemilikan kargo pelayaran laut' }
                        ].map((opt) => (
                          <button
                            type="button"
                            key={opt.val}
                            onClick={() => {
                              setVesselTicketDocName(opt.val);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3.5 py-2 hover:bg-cyan-500/15 text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                              vesselTicketDocName === opt.val ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-cyan-300">{opt.label}</span>
                              {vesselTicketDocName === opt.val && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono truncate">{opt.val}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Centang opsi di atas apabila rute pengiriman melintasi pulau (misal: Jawa ➔ Kalimantan, Sumatera, Sulawesi, dll.) untuk mencantumkan data kapal kargo & tiket penyeberangan.
              </p>
            )}
          </div>

          {/* SECTION 4: DETAIL RUTE, UNIT ISOTANK & TARGET SLA */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3.5">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-slate-300" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                4. Detail Rute, Unit Isotank & Target SLA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Asset Isotank Selection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Pilih Unit Isotank <span className="text-teal-400">*Wajib Ready</span>:
                  </label>
                </div>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Unit Isotank --</option>
                  {assets.map((ast) => {
                    const isOccupied = occupiedAssetIds.has(ast.id);
                    return (
                      <option
                        key={ast.id}
                        value={ast.id}
                        disabled={isOccupied || ast.status === 'Perawatan' || ast.status === 'Inspeksi'}
                      >
                        {ast.code} - {ast.type} ({ast.location}) {isOccupied ? '[BEROPERASI]' : `[${ast.status.toUpperCase()}]`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Chemical Cargo - UNIFIED SMART INPUT */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Spesifikasi Muatan Chemical / Liquid:
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={muatan}
                    onChange={(e) => setMuatan(e.target.value)}
                    placeholder="Contoh: Caustic Soda Liquid 48%"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-28 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'muatan' ? null : 'muatan')}
                    className="absolute right-1 px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-teal-300 text-[11px] font-bold flex items-center space-x-1 border border-teal-500/30 transition-colors cursor-pointer"
                  >
                    <span>🧪 Preset</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'muatan' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Popover */}
                  {openDropdown === 'muatan' && (
                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-slate-700/60 animate-fadeIn">
                      {[
                        { label: 'Caustic Soda Liquid 48%', desc: 'Kimia Industri B3 Hazard Class 8' },
                        { label: 'Sulfuric Acid (H2SO4) 98%', desc: 'Asam Sulfat Pekat Industri Petrokimia' },
                        { label: 'Hydrochloric Acid (HCl) 32%', desc: 'Asam Klorida Pembersihan Metal' },
                        { label: 'Food Grade Liquid Sugar Syrup', desc: 'Sirup Gula Cair Industri Makanan & Minuman' },
                        { label: 'Crude Palm Oil (CPO Liquid)', desc: 'Minyak Kelapa Sawit Cair Non-Hazardous' }
                      ].map((opt) => (
                        <button
                          type="button"
                          key={opt.label}
                          onClick={() => {
                            setMuatan(opt.label);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-700 text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                            muatan === opt.label ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-teal-300">{opt.label}</span>
                            {muatan === opt.label && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Asal */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Lokasi Asal (Depo/Pelabuhan):</label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={asal}
                    onChange={(e) => setAsal(e.target.value)}
                    placeholder="Contoh: Depo Utama Tuban"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Tujuan */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Lokasi Tujuan Pembongkaran:</label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    placeholder="Contoh: Kawasan Industri Petrokimia Gresik"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Target SLA Datetime */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Waktu Ketibaan (SLA):</label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="datetime-local"
                    value={targetAt}
                    onChange={(e) => setTargetAt(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Manager Assignment */}
              <div className="space-y-1">
                <div className="flex items-center justify-between h-6 mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Manager Penanggung Jawab Approval:</label>
                </div>
                <div className="relative flex items-center">
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 h-10 text-xs text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all cursor-pointer"
                  >
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* User Info Bar */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-[11px] text-slate-400 flex items-center justify-between">
            <div>
              Karyawan Pembuat & PIC: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.department})
            </div>
            <span className="text-[10px] text-teal-400 font-mono">ISO 9001 Audit Ready</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 rounded-xl shadow-lg shadow-teal-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Terbitkan Lead Transaksi & Penunjukan Transporter</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
