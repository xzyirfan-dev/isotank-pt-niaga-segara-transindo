import React, { useState, useEffect } from 'react';
import { X, PlusCircle, AlertCircle, CheckCircle2, Ship, Anchor, Truck, AlertTriangle, RefreshCw } from 'lucide-react';
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

  // Inter-Island Sea Freight (Kapal Kargo / Ro-Ro)
  const [isInterIsland, setIsInterIsland] = useState<boolean>(false);
  const [shippingCompany, setShippingCompany] = useState<string>('PT Pelayaran Meratus Line');
  const [vesselName, setVesselName] = useState<string>('KM Meratus Banjar');
  const [voyageNumber, setVoyageNumber] = useState<string>('VOY-2026/088-SBY-BPN');
  const [vesselSchedule, setVesselSchedule] = useState<string>('ETD: 02 Nov 18:00 WIB | ETA: 04 Nov 07:00 WITA');
  const [portOrigin, setPortOrigin] = useState<string>('Pelabuhan Tanjung Perak Surabaya');
  const [portDestination, setPortDestination] = useState<string>('Pelabuhan Semayang Balikpapan');
  const [vesselTicketDocName, setVesselTicketDocName] = useState<string>('Tiket_Booking_Kapal_Meratus_VOY088.pdf');

  const [assetId, setAssetId] = useState('');
  const [asal, setAsal] = useState('Depo Utama Tuban');
  const [tujuan, setTujuan] = useState('Kawasan Industri Petrokimia Gresik');
  const [muatan, setMuatan] = useState('Caustic Soda Liquid 48%');
  const [targetAt, setTargetAt] = useState('');
  const [managerId, setManagerId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Find managers
  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  useEffect(() => {
    if (managers.length > 0 && !managerId) {
      setManagerId(managers[0].id);
    }
  }, [managers, managerId]);

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
      vessel_ticket_doc_name: isInterIsland ? (vesselTicketDocName || 'Tiket_Booking_Kapal.pdf') : undefined,
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
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-slate-100 text-sm">Buat Lead Transaksi Baru & Penunjukan Transporter (Stage 1)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Real-time Duplicate Detection Banner */}
          {duplicateStatus.isDuplicate && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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
                      <span>Acak Ulang No. SJ</span>
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-slate-300 text-[11px] leading-relaxed">
                  {duplicateStatus.message}
                </p>
                {duplicateStatus.existingLead && (
                  <div className="mt-1.5 p-2 rounded-lg bg-slate-900/70 border border-amber-500/20 text-[10px] text-slate-300 font-mono">
                    <span className="text-amber-400 font-bold">{duplicateStatus.existingLead.lead_code}</span>: {duplicateStatus.existingLead.client_company} · Unit: {duplicateStatus.existingLead.asset_code} · Status: <span className="uppercase text-teal-300">{duplicateStatus.existingLead.status}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 1: Informasi Klien & Transaksi */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3">
            <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
              <span>1. Data Klien Perusahaan & Transaksi</span>
              <span className="text-[10px] text-slate-400">Step 1 Inisiasi</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Client Company Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Perusahaan Klien / Pemilik Muatan:</label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="Contoh: PT Petrokimia Utama Indonesia"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* No Surat Jalan */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  No. Surat Jalan <span className="text-teal-400">(Unik)</span>:
                </label>
                <input
                  type="text"
                  value={noSuratJalan}
                  onChange={(e) => setNoSuratJalan(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-teal-300 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Penunjukan Mitra Penyedia Truk Transport & Driver */}
          <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/30 space-y-3">
            <div className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center justify-between">
              <span>2. Pencarian & Penunjukan Mitra Transporter / Truk</span>
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px]">Penting Untuk Persetujuan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Transport Vendor Company */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Perusahaan Penyedia Truk / Vendor:</label>
                <input
                  type="text"
                  value={transportVendorName}
                  onChange={(e) => setTransportVendorName(e.target.value)}
                  placeholder="Contoh: PT Segara Logistik Express"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Driver Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Supir / Pengemudi Truk:</label>
                <input
                  type="text"
                  value={namaSupir}
                  onChange={(e) => setNamaSupir(e.target.value)}
                  placeholder="Contoh: Bambang Susanto (SIM B2 Umum)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Truck License Plate */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nomor Plat Nomor Truk Pengangkut:</label>
                <input
                  type="text"
                  value={noPlatTruk}
                  onChange={(e) => setNoPlatTruk(e.target.value)}
                  placeholder="Contoh: B 9842 UFX"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-teal-300 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Transport Legal Attachment Document */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Dokumen Lampiran Absah (STNK / SIM / Surat Penunjukan):</label>
                <input
                  type="text"
                  value={transportDocName}
                  onChange={(e) => setTransportDocName(e.target.value)}
                  placeholder="Nama Berkas Dokumen (pdf/jpg)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pencarian & Pemesanan Jasa Kapal Kargo (Rute Luar Pulau) */}
          <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Ship className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  3. Pengiriman Luar Pulau (Jasa Kapal Kargo / Ro-Ro)
                </span>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer bg-slate-900/80 px-3 py-1 rounded-xl border border-cyan-500/40">
                <input
                  type="checkbox"
                  checked={isInterIsland}
                  onChange={(e) => setIsInterIsland(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-600"
                />
                <span className="text-xs font-bold text-cyan-300">
                  {isInterIsland ? 'Aktif: Rute Luar Pulau' : 'Aktifkan Bila Luar Pulau'}
                </span>
              </label>
            </div>

            {isInterIsland ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-cyan-500/20 animate-fadeIn">
                {/* Shipping Company / Perusahaan Jasa Kapal */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Perusahaan Jasa Kapal Kargo / Ro-Ro:
                  </label>
                  <input
                    type="text"
                    value={shippingCompany}
                    onChange={(e) => setShippingCompany(e.target.value)}
                    placeholder="Contoh: PT Pelayaran Meratus Line / PT ASDP / PT DLU"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    required={isInterIsland}
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {['PT Pelayaran Meratus Line', 'PT Dharma Lautan Utama', 'PT ASDP Ferry', 'PT Samudera Indonesia'].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setShippingCompany(preset)}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      >
                        {preset.replace('PT ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vessel Name / Nama Kapal */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Kapal Kargo / Ro-Ro Pengangkut:
                  </label>
                  <input
                    type="text"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    placeholder="Contoh: KM Meratus Banjar / KMP Dharma Rucitra VII"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    required={isInterIsland}
                  />
                </div>

                {/* Voyage Number / ID Perjalanan */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    No. Perjalanan / Voyage ID / Manifest ID:
                  </label>
                  <input
                    type="text"
                    value={voyageNumber}
                    onChange={(e) => setVoyageNumber(e.target.value)}
                    placeholder="Contoh: VOY-2026/088-SBY-BPN"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-cyan-300 focus:border-cyan-500 focus:outline-none"
                    required={isInterIsland}
                  />
                </div>

                {/* Vessel Schedule / Jadwal Pelayaran */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Jadwal Pelayaran (ETD Keberangkatan & ETA Kedatangan):
                  </label>
                  <input
                    type="text"
                    value={vesselSchedule}
                    onChange={(e) => setVesselSchedule(e.target.value)}
                    placeholder="Contoh: ETD: 02 Nov 18:00 WIB | ETA: 04 Nov 07:00 WITA"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Vessel Booking Document / Ticket */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Lampiran Bukti Form Pemesanan / Tiket Jasa Kapal (PDF/JPG):
                  </label>
                  <input
                    type="text"
                    value={vesselTicketDocName}
                    onChange={(e) => setVesselTicketDocName(e.target.value)}
                    placeholder="Nama Berkas Tiket (Contoh: Tiket_Booking_Kapal_Meratus_VOY088.pdf)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    required={isInterIsland}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Formulir pemesanan / tiket penyeberangan ini akan ditinjau dan diverifikasi oleh Manager Operasional pada Stage 2 Approval.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Centang opsi di atas apabila rute pengiriman melintasi pulau (misal: Jawa ➔ Kalimantan, Sumatera, Sulawesi, dll.) untuk mencantumkan data kapal kargo & tiket penyeberangan.
              </p>
            )}
          </div>

          {/* Section 4: Rute, Asset, Muatan & SLA */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              4. Detail Rute, Unit Isotank & Target SLA
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Asset Isotank Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Pilih Unit Isotank <span className="text-teal-400">*Wajib Ready</span>:
                </label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
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

              {/* Muatan Chemical */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Spesifikasi Muatan Chemical:</label>
                <input
                  type="text"
                  value={muatan}
                  onChange={(e) => setMuatan(e.target.value)}
                  placeholder="Contoh: Caustic Soda Liquid 48%"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Asal */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Lokasi Asal (Depo/Pelabuhan):</label>
                <input
                  type="text"
                  value={asal}
                  onChange={(e) => setAsal(e.target.value)}
                  placeholder="Contoh: Depo Utama Tuban"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Tujuan */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Lokasi Tujuan Pembongkaran:</label>
                <input
                  type="text"
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  placeholder="Contoh: Kawasan Industri Petrokimia Gresik"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Target SLA Datetime */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Target Waktu Ketibaan (SLA):</label>
                <input
                  type="datetime-local"
                  value={targetAt}
                  onChange={(e) => setTargetAt(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Manager Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Manager Penanggung Jawab Approval:</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                >
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px] text-slate-400">
            Karyawan Pembuat & PIC: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.department})
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 rounded-xl shadow-md shadow-teal-500/20 transition-colors"
            >
              Terbitkan Lead & Kemitraan Transporter
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
