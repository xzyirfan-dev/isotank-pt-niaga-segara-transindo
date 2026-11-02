import { LeadStatus, StageInfo } from '../types';

export const STAGE_LIST: StageInfo[] = [
  {
    step: 1,
    id: 'lead_created',
    name: '1. Lead Created & Transport Planning',
    shortName: 'Registrasi',
    actor: 'Karyawan Pembuat',
    description: 'Inisiasi Lead, pemilihan Mitra Transporter, dan booking jasa Kapal Kargo/Ro-Ro (jika pengiriman antar-pulau) beserta tiket form pemesanan.',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
    badgeText: 'text-blue-400',
  },
  {
    step: 2,
    id: 'lead_approval',
    name: '2. Lead & Multimodal Transport Approval',
    shortName: 'Approval',
    actor: 'Manager Operasional',
    description: 'Verifikasi kelayakan rute darat, keabsahan transporter/supir, dan konfirmasi jadwal/tiket kapal kargo laut.',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    badgeText: 'text-amber-400',
  },
  {
    step: 3,
    id: 'in_progress',
    name: '3. In Progress (Mobilisasi & Pelayaran)',
    shortName: 'Mobilisasi',
    actor: 'Karyawan PIC & Driver',
    description: 'Mobilisasi armada darat, proses penyeberangan kapal kargo (bila rute laut), update posisi GPS/Pelabuhan, & penanganan kendala.',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
    badgeText: 'text-cyan-400',
  },
  {
    step: 4,
    id: 'submission',
    name: '4. Submission for Review',
    shortName: 'Pengajuan',
    actor: 'Karyawan PIC',
    description: 'Pengajuan hasil pekerjaan beserta bukti dokumen muatan & tiket perjalanan.',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/30',
    badgeText: 'text-indigo-400',
  },
  {
    step: 5,
    id: 'review',
    name: '5. Review & Verification',
    shortName: 'Review',
    actor: 'Reviewer / Manager',
    description: 'Pemeriksaan kelengkapan dokumen perjalanan, segel isotank, dan manifes penyeberangan.',
    badgeBg: 'bg-purple-500/10 border-purple-500/30',
    badgeText: 'text-purple-400',
  },
  {
    step: 6,
    id: 'follow_up',
    name: '6. Follow-up & Issue',
    shortName: 'Revisi',
    actor: 'Karyawan PIC',
    description: 'Penanganan revisi atau kendala operasional yang diminta oleh Reviewer.',
    badgeBg: 'bg-orange-500/10 border-orange-500/30',
    badgeText: 'text-orange-400',
  },
  {
    step: 7,
    id: 'final_approval',
    name: '7. Final Approval & Bukti Sampai Tujuan',
    shortName: 'Verifikasi',
    actor: 'Manager Operasional',
    description: 'Verifikasi wajib dokumen & foto absah bahwa pengiriman telah sampai di tujuan akhir sebelum penutupan lead.',
    badgeBg: 'bg-teal-500/10 border-teal-500/30',
    badgeText: 'text-teal-400',
  },
  {
    step: 8,
    id: 'closed',
    name: '8. Done / Closed',
    shortName: 'Selesai',
    actor: 'Sistem (Read-Only)',
    description: 'Arsip resmi penutupan lead dengan bukti ketibaan tujuan lengkap (POD / BASTP).',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    badgeText: 'text-emerald-400',
  },
];

export const MANAGER_APPROVAL_CHECKLIST = [
  'Verifikasi Mitra Perusahaan Transporter, nama supir, dan nomor plat truk pengangkut.',
  'Dokumen absah kemitraan transportasi (Surat Perjanjian / STNK / SIM B2 Umum Supir) telah terlampir.',
  'Jika pengiriman luar pulau: Tiket form pemesanan kapal kargo, nama kapal, no. voyage, dan jadwal pelayaran terverifikasi.',
  'Surat Jalan dan spesifikasi muatan sesuai regulasi keselamatan kimia B3.',
  'Unit Isotank dalam status TERSEDIA dan lolos inspeksi fisik berkala.',
  'Target waktu ketibaan (SLA) realistis dengan kondisi rute darat & laut.',
];

export const REVIEWER_VERIFICATION_CHECKLIST = [
  'Dokumen Surat Jalan telah ditandatangani & dicap basah oleh penerima.',
  'Foto muatan & proses pemuatan/pembongkaran sesuai standar QA.',
  'Tiket/manifes penyeberangan kapal kargo tervalidasi jika rute antar-pulau.',
  'Tidak ada isu kendala operasional yang masih berstatus terbuka (Open).',
];

export const FINAL_APPROVAL_CHECKLIST = [
  'Bukti dokumen atau foto resmi bahwa pengiriman telah sampai di tujuan akhir (Proof of Delivery / BASTP) telah terlampir dan absah.',
  'Nama dan stempel pihak penerima di lokasi tujuan akhir telah terverifikasi.',
  'Seluruh dokumen bukti fisik dan digital lengkap 100%.',
  'Semua kendala operasional telah berstatus terselesaikan (Zero Open Issues).',
  'Kepatuhan SLA ketibaan dan integritas segel kimia terpenuhi.',
];
