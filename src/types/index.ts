export type UserRole = 'karyawan' | 'manager' | 'reviewer' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  department: string;
  active: boolean;
  googleLinked?: boolean;
  googleLastLogin?: string;
}

export type AssetType = 'T11 Chemical' | 'T50 Gas' | 'Food Grade' | 'Refrigerated ISO' | 'T75 Cryogenic';
export type AssetStatus = 'Tersedia' | 'Beroperasi' | 'Perawatan' | 'Inspeksi';

export interface Asset {
  id: string;
  code: string; // e.g. ISO-20T-01
  type: AssetType;
  capacity: string; // e.g. 24,000 Liter
  location: string;
  status: AssetStatus;
  maxPressure: string;
  lastInspectionDate: string;
}

export type LeadStatus =
  | 'lead_created'   // 1. Lead Created
  | 'lead_approval'  // 2. Lead Approval
  | 'in_progress'    // 3. In Progress
  | 'submission'     // 4. Submission for Review
  | 'review'         // 5. Review & Verification
  | 'follow_up'      // 6. Follow-up & Issue Resolution
  | 'final_approval' // 7. Final Approval
  | 'closed';        // 8. Done / Closed

export interface StageInfo {
  step: number;
  id: LeadStatus;
  name: string;
  shortName: string;
  actor: string;
  description: string;
  badgeBg: string;
  badgeText: string;
}

export interface Lead {
  id: string;
  lead_code: string; // Explicit Lead ID e.g. LEAD-00101
  no_surat_jalan: string; // Unique SJ Number
  client_company?: string; // Nama Perusahaan Klien
  transport_vendor_name?: string; // Perusahaan Penyedia Truk Transport
  nama_supir?: string; // Nama Driver / Supir Pengangkut
  no_plat_truk?: string; // Nomor Plat Nomor Truk / Kendaraan
  transport_doc_name?: string; // Dokumen Lampiran Absah Kemitraan Transport/STNK/SIM
  transport_doc_url?: string;
  asset_id: string;
  asset_code: string;
  creator_id: string;
  creator_name: string;
  manager_id: string;
  manager_name: string;
  pic_id: string;
  pic_name: string;
  reviewer_id?: string;
  reviewer_name?: string;
  asal: string;
  tujuan: string;
  muatan: string;
  target_at: string; // ISO Datetime
  status: LeadStatus;
  current_step: number; // 1 to 8
  created_at: string;
  updated_at: string;
  completed_at?: string;
  total_revisions: number;
  progress_percentage: number;
  current_location_note?: string;
  rejection_comment?: string;
}

export type EvidenceFileType = 'surat_jalan' | 'foto_muatan' | 'foto_bongkar' | 'dokumen_transporter' | 'laporan_kerja' | 'dokumen_lain';

export interface Evidence {
  id: string;
  lead_id: string;
  lead_code: string; // Explicit Lead ID e.g. LEAD-00101
  stage: LeadStatus;
  stage_step: number;
  file_type: EvidenceFileType;
  file_name: string;
  file_size: string;
  uploaded_at: string;
  uploaded_by: string;
  uploaded_by_role: UserRole;
  file_data_url?: string;
  notes?: string;
  log_number?: string;
}

export interface Issue {
  id: string;
  lead_id: string;
  lead_code: string; // Explicit Lead ID e.g. LEAD-00101
  deskripsi: string;
  pelapor_id: string;
  pelapor_name: string;
  pelapor_role: UserRole;
  status: 'open' | 'resolved';
  reported_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  log_number?: string;
}

export interface Comment {
  id: string;
  lead_id: string;
  lead_code?: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  avatar?: string;
  message: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  log_number: string; // e.g. LOG-0042
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
}

export interface ClosureArchive {
  lead_id: string;
  lead_code: string; // Explicit Lead ID e.g. LEAD-00101
  no_surat_jalan: string;
  asset_code: string;
  closed_at: string;
  closed_by: string;
  summary: string;
  total_hours: number;
  sla_on_time: boolean;
  total_revisions: number;
  total_issues: number;
}

export type Language = 'id' | 'en';
export type AccentColor = 'teal' | 'sky' | 'emerald' | 'amber';
export type DatePreset = '30d' | '90d' | 'all' | 'custom';

export interface PeriodFilter {
  preset: DatePreset;
  startDate: string;
  endDate: string;
}
