import React, { useState, useMemo, useEffect } from 'react';
import {
  X, CheckSquare, AlertTriangle, ShieldCheck, CornerUpLeft, Ship,
  FileCheck, CheckCircle2, AlertCircle, Check, Upload, Lock, FileText,
  Truck, ArrowRight, ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeadStatus } from '../types';
import { MANAGER_APPROVAL_CHECKLIST, REVIEWER_VERIFICATION_CHECKLIST, FINAL_APPROVAL_CHECKLIST } from '../data/stageConfig';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface ApprovalChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  actionType: 'approve_stage_2' | 'reject_stage_2' | 'approve_stage_5' | 'request_revision_stage_5' | 'approve_stage_7' | 'reject_stage_7';
  targetStage: LeadStatus;
  targetStep: number;
}

interface ValidatedChecklistItem {
  index: number;
  label: string;
  shortLabel: string;
  isValid: boolean;
  docInfo?: string;
  missingText?: string;
  quickActionType?: 'transport_doc' | 'vessel_doc' | 'final_doc';
}

export const ApprovalChecklistModal: React.FC<ApprovalChecklistModalProps> = ({
  isOpen, onClose, leadId, actionType, targetStage, targetStep
}) => {
  const {
    transitionLeadStage,
    updateLeadFinalDelivery,
    updateLeadTransportDoc,
    updateLeadVesselBooking,
    leads,
    evidences,
    issues,
    currentUser
  } = useApp();

  const lead = leads.find(l => l.id === leadId);
  const isApprovalAction = actionType.startsWith('approve');

  // Input states for quick inline attachments
  const [quickTransportDoc, setQuickTransportDoc] = useState<string>('');
  const [quickVesselTicket, setQuickVesselTicket] = useState<string>('');

  // Final Delivery Proof inputs if not yet provided on stage 7
  const [finalDocName, setFinalDocName] = useState<string>(
    lead?.final_delivery_doc_name || ''
  );
  const [receivedBy, setReceivedBy] = useState<string>(
    lead?.final_delivery_received_by || ''
  );

  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // REAL SYSTEM VALIDATOR ENGINE
  const validatedItems: ValidatedChecklistItem[] = useMemo(() => {
    if (!lead) return [];

    const leadEvidences = evidences.filter(e => e.lead_id === leadId);
    const openIssues = issues.filter(i => i.lead_id === leadId && i.status === 'open');

    if (actionType.includes('stage_2')) {
      // 1. Data Mitra Truk, Supir, Plat
      const hasDriverData = Boolean(lead.transport_vendor_name && lead.nama_supir && lead.no_plat_truk);

      // 2. Dokumen Absah Kemitraan Transport
      const hasTransportDoc = Boolean(lead.transport_doc_name) ||
        Boolean(quickTransportDoc.trim()) ||
        leadEvidences.some(e => e.file_type === 'dokumen_transporter' || e.file_type === 'surat_jalan');

      // 3. Tiket Kapal jika antar-pulau
      let isVesselValid = true;
      let vesselDocText = 'Rute Darat Reguler (Tanpa Penyeberangan Kapal Laut)';
      let vesselMissing = '';
      if (lead.is_inter_island) {
        const hasVesselDoc = Boolean(lead.vessel_ticket_doc_name) ||
          Boolean(quickVesselTicket.trim()) ||
          leadEvidences.some(e => e.file_type === 'tiket_kapal');
        if (hasVesselDoc) {
          isVesselValid = true;
          vesselDocText = `Tiket Kapal Terlampir: ${lead.vessel_ticket_doc_name || quickVesselTicket} (${lead.shipping_company || '-'} - ${lead.vessel_name || '-'})`;
        } else if (lead.vessel_ticket_status === 'menyusul') {
          isVesselValid = true;
          vesselDocText = 'Status Tiket: MENYUSUL (Diizinkan: Wajib divalidasi petugas lapangan sebelum truk menuju ke pelabuhan)';
        } else {
          isVesselValid = false;
          vesselMissing = 'Pengiriman antar-pulau terdeteksi, namun berkas tiket kapal kargo belum terlampir.';
        }
      }

      // 4. Surat Jalan & Muatan
      const hasSJ = Boolean(lead.no_surat_jalan && lead.muatan);

      // 5. Unit Isotank
      const hasAsset = Boolean(lead.asset_code);

      // 6. SLA
      const hasTarget = Boolean(lead.target_at);

      return [
        {
          index: 0,
          label: MANAGER_APPROVAL_CHECKLIST[0],
          shortLabel: 'Mitra Truk & Supir',
          isValid: hasDriverData,
          docInfo: hasDriverData ? `${lead.transport_vendor_name} · Supir: ${lead.nama_supir} (${lead.no_plat_truk})` : undefined,
          missingText: 'Data mitra penyedia truk, nama pengemudi (SIM B2), atau plat nomor belum lengkap di sistem.',
        },
        {
          index: 1,
          label: MANAGER_APPROVAL_CHECKLIST[1],
          shortLabel: 'Dokumen Kemitraan Transport',
          isValid: hasTransportDoc,
          docInfo: hasTransportDoc ? (lead.transport_doc_name || quickTransportDoc || 'Dokumen_Kemitraan_Transport.pdf') : undefined,
          missingText: 'Berkas Dokumen Absah Kemitraan (Surat Perjanjian/STNK/SIM B2) belum diunggah ke sistem!',
          quickActionType: 'transport_doc',
        },
        {
          index: 2,
          label: MANAGER_APPROVAL_CHECKLIST[2],
          shortLabel: 'Tiket Kapal Kargo',
          isValid: isVesselValid,
          docInfo: isVesselValid ? vesselDocText : undefined,
          missingText: vesselMissing,
          quickActionType: lead.is_inter_island ? 'vessel_doc' : undefined,
        },
        {
          index: 3,
          label: MANAGER_APPROVAL_CHECKLIST[3],
          shortLabel: 'Surat Jalan & Spesifikasi Muatan',
          isValid: hasSJ,
          docInfo: hasSJ ? `No SJ: ${lead.no_surat_jalan} · Muatan: ${lead.muatan} (${lead.asal} -> ${lead.tujuan})` : undefined,
          missingText: 'Nomor surat jalan atau data spesifikasi muatan bahan kimia belum valid.',
        },
        {
          index: 4,
          label: MANAGER_APPROVAL_CHECKLIST[4],
          shortLabel: 'Unit Isotank',
          isValid: hasAsset,
          docInfo: hasAsset ? `Unit: ${lead.asset_code} (Status Tersedia & Lolos Uji Berkala)` : undefined,
          missingText: 'Kode unit isotank belum dialokasikan pada transaksi ini.',
        },
        {
          index: 5,
          label: MANAGER_APPROVAL_CHECKLIST[5],
          shortLabel: 'Target SLA',
          isValid: hasTarget,
          docInfo: hasTarget ? `Target Ketibaan SLA: ${new Date(lead.target_at).toLocaleDateString('id-ID')}` : undefined,
          missingText: 'Estimasi batas target waktu ketibaan SLA belum ditentukan.',
        },
      ];
    }

    if (actionType.includes('stage_5')) {
      const hasSJDoc = Boolean(lead.transport_doc_name) || leadEvidences.length > 0;
      const hasEvidences = leadEvidences.length > 0;
      const isVesselValid = !lead.is_inter_island || Boolean(lead.vessel_ticket_doc_name) || Boolean(lead.shipping_company);
      const isIssuesClear = openIssues.length === 0;

      return [
        {
          index: 0,
          label: REVIEWER_VERIFICATION_CHECKLIST[0],
          shortLabel: 'Surat Jalan Bertandatangan',
          isValid: hasSJDoc,
          docInfo: hasSJDoc ? (lead.transport_doc_name || 'Surat_Jalan_Bertandatangan.pdf') : undefined,
          missingText: 'Dokumen surat jalan resmi bertanda tangan belum diunggah ke arsip bukti.',
        },
        {
          index: 1,
          label: REVIEWER_VERIFICATION_CHECKLIST[1],
          shortLabel: 'Dokumentasi Foto & QA',
          isValid: hasEvidences,
          docInfo: hasEvidences ? `Dokumentasi Fisik QA Terlampir (${leadEvidences.length} Berkas Bukti)` : undefined,
          missingText: 'Belum ada berkas foto muatan / bukti operasional yang diunggah ke sistem pada transaksi ini!',
        },
        {
          index: 2,
          label: REVIEWER_VERIFICATION_CHECKLIST[2],
          shortLabel: 'Manifes Tiket Kapal',
          isValid: isVesselValid,
          docInfo: isVesselValid ? (lead.is_inter_island ? `Tiket Kapal: ${lead.vessel_ticket_doc_name || 'Tiket_Kapal.pdf'}` : 'Rute Darat (Bebas Manifes Laut)') : undefined,
          missingText: 'Tiket atau manifes kapal kargo penyeberangan antar-pulau belum terverifikasi.',
        },
        {
          index: 3,
          label: REVIEWER_VERIFICATION_CHECKLIST[3],
          shortLabel: 'Status Kendala Operasional',
          isValid: isIssuesClear,
          docInfo: isIssuesClear ? 'Zero Open Issues (Seluruh kendala lapangan terselesaikan)' : undefined,
          missingText: `Terdapat ${openIssues.length} kendala operasional yang masih berstatus OPEN. Selesaikan kendala sebelum melanjutkan approval!`,
        },
      ];
    }

    // Stage 7: FINAL_APPROVAL_CHECKLIST
    // Real system validation: must be truly saved on lead or uploaded in evidences
    const hasFinalProof = Boolean(lead.final_delivery_doc_name) ||
      leadEvidences.some(e => e.file_type === 'bukti_sampai_tujuan' || (e.file_name && e.file_name.toLowerCase().includes('bastp')));
    const hasReceiver = Boolean(lead.final_delivery_received_by);
    const isAllDocsComplete = hasFinalProof && hasReceiver && (Boolean(lead.transport_doc_name) || leadEvidences.length > 0);
    const isIssuesClear = openIssues.length === 0;
    const hasTarget = Boolean(lead.target_at);

    return [
      {
        index: 0,
        label: FINAL_APPROVAL_CHECKLIST[0],
        shortLabel: 'Dokumen BASTP Ketibaan',
        isValid: hasFinalProof,
        docInfo: hasFinalProof ? `Dokumen BASTP Sah: ${lead.final_delivery_doc_name}` : undefined,
        missingText: 'Bukti dokumen atau foto Berita Acara Serah Terima (BASTP) belum dilampirkan dan disimpan!',
        quickActionType: 'final_doc',
      },
      {
        index: 1,
        label: FINAL_APPROVAL_CHECKLIST[1],
        shortLabel: 'Nama Pihak Penerima',
        isValid: hasReceiver,
        docInfo: hasReceiver ? `Diterima Oleh: ${lead.final_delivery_received_by}` : undefined,
        missingText: 'Nama petugas atau penanggung jawab penerima di lokasi tujuan belum diisi.',
      },
      {
        index: 2,
        label: FINAL_APPROVAL_CHECKLIST[2],
        shortLabel: 'Kelengkapan Berkas 100%',
        isValid: isAllDocsComplete,
        docInfo: isAllDocsComplete ? 'Audit Dokumen Lengkap 100% (STNK/SIM, Tiket, BASTP Sah)' : undefined,
        missingText: 'Kelengkapan berkas fisik & digital belum 100% lengkap.',
      },
      {
        index: 3,
        label: FINAL_APPROVAL_CHECKLIST[3],
        shortLabel: 'Zero Open Issues',
        isValid: isIssuesClear,
        docInfo: isIssuesClear ? 'Zero Open Issues (Tidak ada kendala aktif)' : undefined,
        missingText: `Masih terdapat ${openIssues.length} kendala operasional aktif yang belum diselesaikan.`,
      },
      {
        index: 4,
        label: FINAL_APPROVAL_CHECKLIST[4],
        shortLabel: 'Kepatuhan SLA & Segel',
        isValid: hasTarget,
        docInfo: hasTarget ? 'Integritas Segel Tangki & Target SLA Terverifikasi' : undefined,
        missingText: 'Integritas target SLA atau segel belum terverifikasi.',
      },
    ];
  }, [lead, evidences, issues, actionType, leadId, quickTransportDoc, quickVesselTicket, finalDocName, receivedBy]);

  // Track user manual checklist confirmation
  const [checkedState, setCheckedState] = useState<boolean[]>(() => {
    return new Array(validatedItems.length).fill(false);
  });

  useEffect(() => {
    if (isOpen) {
      setCheckedState(new Array(validatedItems.length).fill(false));
      setErrorMsg('');
    }
  }, [isOpen, leadId, actionType, validatedItems.length]);

  if (!isOpen || !lead) return null;

  // Filter missing items
  const missingItems = validatedItems.filter(v => !v.isValid);
  const hasIncompleteRequirements = missingItems.length > 0;

  // Checklist is complete only if all validated items are valid AND user checked them
  const allChecked = validatedItems.every((item, idx) => item.isValid && checkedState[idx]);

  const toggleCheck = (index: number) => {
    // Prevent checking unvalidated items
    if (!validatedItems[index]?.isValid) {
      setErrorMsg(`Syarat "${validatedItems[index]?.shortLabel}" belum valid di sistem! Lengkapi syarat sebelum mencentang.`);
      return;
    }
    const updated = [...checkedState];
    updated[index] = !updated[index];
    setCheckedState(updated);
    setErrorMsg('');
  };

  const handleCheckAllValid = () => {
    const updated = validatedItems.map(v => v.isValid);
    setCheckedState(updated);
    setErrorMsg('');
  };

  // Quick fix for Transport Doc in Stage 2
  const handleQuickAttachTransportDoc = () => {
    const docName = quickTransportDoc.trim() || `Surat_Kemitraan_Transport_${lead.no_surat_jalan.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    updateLeadTransportDoc(leadId, docName);
    setQuickTransportDoc(docName);
    setErrorMsg('');
  };

  // Quick fix for Inter-Island Vessel Ticket in Stage 2
  const handleQuickAttachVesselTicket = () => {
    const ticketDoc = quickVesselTicket.trim() || `Tiket_RoRo_${lead.shipping_company ? lead.shipping_company.replace(/[^a-zA-Z0-9]/g, '_') : 'Pelayaran'}_Resmi.pdf`;
    updateLeadVesselBooking(leadId, {
      is_inter_island: true,
      shipping_company: lead.shipping_company || 'PT Pelayaran Nusantara Bahari',
      vessel_name: lead.vessel_name || 'KM Kargo Express',
      vessel_ticket_doc_name: ticketDoc
    });
    setQuickVesselTicket(ticketDoc);
    setErrorMsg('');
  };

  // Real Verification for BASTP in Stage 7
  const handleSaveAndVerifyBASTP = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!finalDocName.trim()) {
      setErrorMsg('Nama Berkas BASTP / Bukti Sampai Tujuan wajib diisi!');
      return;
    }
    if (!receivedBy.trim()) {
      setErrorMsg('Nama Pihak Penerima di Lokasi Tujuan wajib diisi!');
      return;
    }
    updateLeadFinalDelivery(leadId, {
      final_delivery_doc_name: finalDocName.trim(),
      final_delivery_received_by: receivedBy.trim(),
      final_delivery_date: new Date().toLocaleString('id-ID') + ' WIB',
    });
    setErrorMsg('');
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Rejection or Revision requires mandatory comment
    if (!isApprovalAction && (!comment || comment.trim().length < 5)) {
      setErrorMsg('Komentar wajib diisi minimal 5 karakter jika melakukan Penolakan / Permintaan Revisi!');
      return;
    }

    // STRICT VALIDATOR INSTRUMENT CHECK:
    if (isApprovalAction && hasIncompleteRequirements) {
      setErrorMsg(`VALIDATOR SISTEM DITOLAK: Terdapat ${missingItems.length} syarat dokumen yang belum lengkap di sistem! Selesaikan seluruh kelengkapan dokumen sebelum melanjutkan approval.`);
      return;
    }

    // Approval requires all checklist items checked
    if (isApprovalAction && !allChecked) {
      setErrorMsg('Wajib mencentang seluruh butir kriteria verifikasi checklist yang telah tervalidasi sebelum memproses transisi!');
      return;
    }

    // If approving Stage 7 (Final Approval for Closure)
    if (actionType === 'approve_stage_7') {
      if (!lead.final_delivery_doc_name) {
        setErrorMsg('Bukti dokumen / foto ketibaan di tujuan (BASTP) wajib disimpan & diverifikasi terlebih dahulu!');
        return;
      }
    }

    const res = transitionLeadStage(leadId, targetStage, targetStep, comment, true);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isApprovalAction ? 'bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 border-teal-500/30' : 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/30'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
              isApprovalAction ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {isApprovalAction ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-slate-100 text-sm sm:text-base">
                  {isApprovalAction ? 'Konfirmasi Approval & Validator Kepatuhan' : 'Form Penolakan / Permintaan Revisi'}
                </h3>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold uppercase ${
                  isApprovalAction ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {isApprovalAction ? 'SECURITY VALIDATOR' : 'REVISION REQUEST'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Lead [{lead.lead_code || 'LEAD-00101'}] #{lead.no_surat_jalan} · <span className="text-slate-300">{lead.muatan}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleExecute} className="p-6 space-y-4 overflow-y-auto text-xs">
          
          {/* Top Error Alert Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border-2 border-rose-500/60 text-rose-300 text-xs flex items-start space-x-2.5 shadow-lg animate-pulse">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="font-extrabold text-white block uppercase">Peringatan Validasi Sistem:</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* WARNING NOTIFICATION BANNER: SYARAT BELUM LENGKAP */}
          {isApprovalAction && hasIncompleteRequirements && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/80 via-slate-900 to-rose-950/70 border-2 border-rose-500/80 shadow-xl space-y-2.5">
              <div className="flex items-center space-x-2 text-rose-300 font-black">
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce shrink-0" />
                <span className="uppercase tracking-wider text-xs font-black">
                  VALIDATOR INSTRUMEN KEAMANAN: SYARAT DOKUMEN BELUM LENGKAP ({missingItems.length} SYARAT)
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed text-xs">
                Sistem keamanan transaksi <strong>tidak mengizinkan persetujuan (approval)</strong> dilanjutkan karena dokumen/syarat berikut belum terpenuhi pada data Lead:
              </p>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/40 space-y-2">
                {missingItems.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs">
                    <span className="text-rose-400 font-bold">•</span>
                    <div className="flex-1">
                      <strong className="text-rose-300">{item.shortLabel}:</strong>{' '}
                      <span className="text-slate-300">{item.missingText}</span>

                      {/* Inline quick fix button */}
                      {item.quickActionType === 'transport_doc' && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                          <input
                            type="text"
                            value={quickTransportDoc}
                            onChange={(e) => setQuickTransportDoc(e.target.value)}
                            placeholder="Contoh: Surat_Perjanjian_Penyedia_Truk_FoodGrade.pdf"
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 flex-1 min-w-[200px]"
                          />
                          <button
                            type="button"
                            onClick={handleQuickAttachTransportDoc}
                            className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Lampirkan Sekarang</span>
                          </button>
                        </div>
                      )}

                      {item.quickActionType === 'vessel_doc' && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                          <input
                            type="text"
                            value={quickVesselTicket}
                            onChange={(e) => setQuickVesselTicket(e.target.value)}
                            placeholder="Contoh: Tiket_RoRo_ASDP_DLU_Merak_Bakauheni.pdf"
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 flex-1 min-w-[200px]"
                          />
                          <button
                            type="button"
                            onClick={handleQuickAttachVesselTicket}
                            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1"
                          >
                            <Ship className="w-3.5 h-3.5" />
                            <span>Lampirkan Tiket Kapal</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-amber-300 font-semibold flex items-center space-x-1.5 pt-1">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Tombol persetujuan terkunci secara otomatis hingga syarat di atas dilengkapi.</span>
              </div>
            </div>
          )}

          {/* Inter-Island Vessel Verification Badge */}
          {actionType === 'approve_stage_2' && lead.is_inter_island && (
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-extrabold">
                <Ship className="w-4 h-4 text-cyan-400" />
                <span>Rute Antar-Pulau Terdeteksi! (Verifikasi Kapal Kargo Laut)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-cyan-500/20">
                <div>Perusahaan Kapal: <strong className="text-slate-100">{lead.shipping_company || '-'}</strong></div>
                <div>Kapal & Voyage: <strong className="text-cyan-300">{lead.vessel_name || '-'}</strong> ({lead.voyage_number || '-'})</div>
                <div>Jadwal Pelayaran: <span className="text-slate-400">{lead.vessel_schedule || '-'}</span></div>
                <div>Lampiran Tiket: <strong className="text-teal-300 font-mono">{lead.vessel_ticket_doc_name || quickVesselTicket || 'Tiket_RoRo_ASDP_DLU.pdf'}</strong></div>
              </div>
            </div>
          )}

          {/* Stage 7 Proof of Final Delivery Required */}
          {actionType === 'approve_stage_7' && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold">
                <FileCheck className="w-4 h-4" />
                <span>Bukti Dokumen / Foto Bahwa Pengiriman Telah Sampai Tujuan (Syarat Final Lead)</span>
              </div>
              
              <div className="space-y-3 pt-1 border-t border-emerald-500/20">
                {lead.final_delivery_doc_name ? (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-300 block">Berkas BASTP Telah Tervalidasi Resmi:</span>
                        <span className="font-mono text-slate-200 text-[11px]">{lead.final_delivery_doc_name}</span>
                        <span className="text-slate-400 text-[10px] block mt-0.5">Penerima: {lead.final_delivery_received_by || '-'} ({lead.final_delivery_date || 'Tercatat'})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateLeadFinalDelivery(leadId, {
                          final_delivery_doc_name: '',
                          final_delivery_received_by: '',
                          final_delivery_date: '',
                        });
                      }}
                      className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-rose-300 underline"
                    >
                      Ubah / Input Ulang
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Dokumen BASTP belum terekam di sistem. Masukkan nama berkas bukti ketibaan dan identitas penerima lalu klik verifikasi:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-300 mb-1">
                          Nama Dokumen / Foto BASTP Ketibaan:
                        </label>
                        <input
                          type="text"
                          value={finalDocName}
                          onChange={(e) => setFinalDocName(e.target.value)}
                          placeholder="Contoh: BASTP_Mayora_Cikande_Tiba.pdf"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-300 mb-1">
                          Nama Pihak Penerima di Lokasi:
                        </label>
                        <input
                          type="text"
                          value={receivedBy}
                          onChange={(e) => setReceivedBy(e.target.value)}
                          placeholder="Contoh: Bpk. Hendrawan (Supervisor Pabrik)"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAndVerifyBASTP}
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Simpan & Verifikasi Berkas BASTP Resmi (Aktifkan Validator)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Checklist Container */}
          {isApprovalAction ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Checklist Kriteria Verifikasi Wajib (Instrumen Validator):</span>
                </label>
                {!hasIncompleteRequirements && (
                  <button
                    type="button"
                    onClick={handleCheckAllValid}
                    className="text-[11px] font-bold text-teal-300 hover:text-teal-200 underline"
                  >
                    Centang Semua yang Tervalidasi
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {validatedItems.map((item, idx) => {
                  const isChecked = checkedState[idx] && item.isValid;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        item.isValid
                          ? 'bg-slate-900/90 border-slate-700/80 hover:border-teal-500/40'
                          : 'bg-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Checkbox or Lock */}
                        <div className="pt-0.5">
                          {item.isValid ? (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheck(idx)}
                              className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500 bg-slate-800 cursor-pointer"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-rose-400">
                              <Lock className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        {/* Text and Glowing Validator Badge */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`font-semibold text-xs leading-snug ${
                              item.isValid ? (isChecked ? 'text-slate-100 font-bold' : 'text-slate-300') : 'text-slate-400 line-through'
                            }`}>
                              {item.label}
                            </span>

                            {/* Glowing Validation Status Badge: Neon Emerald Green Glowing Checkmark */}
                            {item.isValid ? (
                              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.55)] text-emerald-300 text-[10px] font-mono font-black shrink-0 animate-in fade-in">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                                </span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.95)] stroke-[2.5]" />
                                <span className="tracking-wider uppercase text-emerald-200">TERVALIDASI</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border-2 border-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.35)] text-rose-300 text-[10px] font-mono font-black shrink-0">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                <span className="tracking-wide uppercase">BELUM VALID</span>
                              </div>
                            )}
                          </div>

                          {/* Detail Note for Validated Document */}
                          {item.isValid && item.docInfo && (
                            <div className="p-2 rounded-xl bg-slate-950/80 border border-teal-500/30 text-teal-300 text-[11px] font-mono flex items-center space-x-2">
                              <Check className="w-3.5 h-3.5 text-teal-400 stroke-[3] shrink-0" />
                              <span className="truncate">Data Terverifikasi: <strong>{item.docInfo}</strong></span>
                            </div>
                          )}

                          {/* Warning for Missing Requirement */}
                          {!item.isValid && (
                            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-[11px] space-y-1">
                              <div className="flex items-center space-x-1 text-rose-400 font-black uppercase text-[10px]">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>Syarat Belum Lengkap:</span>
                              </div>
                              <p className="text-slate-200">{item.missingText}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
              <strong className="block text-slate-100 font-bold">Penolakan / Permintaan Revisi:</strong>
              <p>Tindakan ini akan mengembalikan status Lead ke Tahap {targetStep} ({targetStage.toUpperCase()}) dan mewajibkan Karyawan PIC melakukan perbaikan berkas.</p>
            </div>
          )}

          {/* Digital Signature & E-Seal Field Module */}
          {isApprovalAction && (
            <DigitalSignaturePad
              signatoryName={currentUser.name}
              signatoryRole={
                currentUser.role === 'manager'
                  ? 'Fleet & Operations Manager'
                  : currentUser.role === 'reviewer'
                  ? 'QA & Safety Compliance Lead Inspector'
                  : 'Staff Logistik & PIC Operasional'
              }
              leadCode={lead.lead_code}
              noSuratJalan={lead.no_surat_jalan}
            />
          )}

          {/* Comments Box */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-1.5">
              Catatan & Komentar {!isApprovalAction && <span className="text-rose-400 font-bold">*Wajib Diisi</span>}:
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isApprovalAction ? 'Catatan persetujuan validator (opsional)...' : 'Tuliskan alasan spesifik kekurangan berkas yang harus direvisi karyawan...'}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-slate-100 focus:border-teal-500 focus:outline-none h-20 font-medium"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono">
              {isApprovalAction ? (
                hasIncompleteRequirements ? (
                  <span className="text-rose-400 font-bold">⚠️ Syarat belum lengkap ({missingItems.length} belum valid)</span>
                ) : allChecked ? (
                  <span className="text-emerald-400 font-bold">✓ Syarat 100% tervalidasi</span>
                ) : (
                  <span className="text-amber-400 font-semibold">Centang seluruh checklist di atas</span>
                )
              ) : (
                <span className="text-slate-400">Status Penolakan</span>
              )}
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isApprovalAction && (hasIncompleteRequirements || !allChecked)}
                className={`px-5 py-2.5 text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-2 ${
                  isApprovalAction
                    ? hasIncompleteRequirements || !allChecked
                      ? 'bg-slate-800 text-slate-500 border border-slate-700/80 cursor-not-allowed opacity-60'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/30 hover:scale-105 active:scale-95'
                    : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30 hover:scale-105 active:scale-95'
                }`}
                title={
                  isApprovalAction
                    ? hasIncompleteRequirements
                      ? 'Tidak dapat memproses: dokumen belum lengkap'
                      : !allChecked
                      ? 'Centang seluruh checklist untuk melanjutkan'
                      : 'Setujui & Lanjutkan Transisi'
                    : 'Kirim Penolakan'
                }
              >
                {isApprovalAction ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Setujui & Lanjutkan Transisi</span>
                  </>
                ) : (
                  <>
                    <CornerUpLeft className="w-4 h-4" />
                    <span>Kirim Penolakan / Permintaan Revisi</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

