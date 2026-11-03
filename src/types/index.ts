export type UserRole = 'karyawan' | 'manager' | 'reviewer' | 'admin' | 'operasional';

export interface RolePermissions {
  canCreateLead: boolean;
  canApproveLead: boolean;
  canReviewLead: boolean;
  canManageSettings: boolean;
  canViewReports: boolean;
  canDeleteLead: boolean;
  canManageOperations: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  karyawan: { canCreateLead: true, canApproveLead: false, canReviewLead: false, canManageSettings: false, canViewReports: true, canDeleteLead: false, canManageOperations: false },
  manager: { canCreateLead: false, canApproveLead: true, canReviewLead: false, canManageSettings: false, canViewReports: true, canDeleteLead: false, canManageOperations: false },
  reviewer: { canCreateLead: false, canApproveLead: false, canReviewLead: true, canManageSettings: false, canViewReports: true, canDeleteLead: false, canManageOperations: false },
  operasional: { canCreateLead: true, canApproveLead: false, canReviewLead: false, canManageSettings: false, canViewReports: true, canDeleteLead: false, canManageOperations: true },
  admin: { canCreateLead: true, canApproveLead: true, canReviewLead: true, canManageSettings: true, canViewReports: true, canDeleteLead: true, canManageOperations: true },
};

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
  // Inter-Island Sea Freight (Kapal Kargo / Ro-Ro)
  is_inter_island?: boolean; // Indikator rute antar-pulau membutuhkan kapal kargo
  shipping_company?: string; // Nama Perusahaan Jasa Kapal Kargo (misal: PT Pelayaran Meratus, PT ASDP, PT DLU)
  vessel_name?: string; // Nama Kapal Pengangkut (misal: KMP Dharma Rucitra VII / KM Meratus)
  voyage_number?: string; // Nomor Perjalanan / Voyage ID / Manifest ID (misal: VOY-2026/088-SBY-BPN)
  vessel_schedule?: string; // Jadwal Keberangkatan & Ketibaan (ETD - ETA)
  port_origin?: string; // Pelabuhan Asal Muat
  port_destination?: string; // Pelabuhan Tujuan Bongkar
  vessel_ticket_doc_name?: string; // Lampiran Bukti Form Pemesanan / Tiket Kapal Kargo
  vessel_ticket_doc_url?: string;
  vessel_ticket_status?: 'terlampir' | 'menyusul'; // Status: Terlampir saat inisiasi atau Menyusul sebelum truk ke pelabuhan
  vessel_ticket_verified_at?: string; // Tanggal verifikasi tiket kapal
  vessel_ticket_verified_by?: string; // Petugas verifikator tiket kapal
  // Final Delivery Proof (Syarat Penutupan / Selesai Lead)
  final_delivery_doc_name?: string; // Dokumen Berita Acara Serah Terima / Foto Ketibaan Tujuan
  final_delivery_doc_url?: string;
  final_delivery_received_by?: string; // Nama Penerima di Lokasi Tujuan Akhir
  final_delivery_date?: string; // Waktu Tiba di Lokasi Tujuan
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
  // KPI & Commercial Achievement Metrics
  contract_value?: number; // Nilai kontrak (Rp)
  volume_tonase?: number; // Muatan terkirim (Ton)
  kpi_score?: number; // Skor pencapaian KPI (1-100)
  sla_hours_actual?: number; // Durasi aktual siklus jam
  sla_hours_target?: number; // Batas toleransi target SLA jam

  // Sensitive Contact Data (Masked by default)
  client_phone?: string;
  client_email?: string;
  driver_phone?: string;

  // Fase 3: Soft Delete & Data Lifecycle
  is_deleted?: boolean;
  deleted_at?: string;

  // Fase 7: Operational Field Sub-stages
  operationalSubStages?: OperationalSubStageItem[];

  // Fase 8: Public Client Tracking Link (Sanitized & Monotonic)
  clientLinkInfo?: ClientTrackingLinkInfo;
  highestClientStageOrder?: number;
  deleted_by?: string;
  deleted_by_name?: string;
  deletion_reason?: string;
}

export type EvidenceFileType =
  | 'surat_jalan'
  | 'foto_muatan'
  | 'foto_bongkar'
  | 'dokumen_transporter'
  | 'tiket_kapal'
  | 'bukti_sampai_tujuan'
  | 'laporan_kerja'
  | 'dokumen_lain';

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
  // Fase 3: Immutable Before/After Diff & Security Audit Trail
  field_name?: string;
  old_value?: string | number;
  new_value?: string | number;
  ip_address?: string;
  user_agent?: string;
  is_sensitive_unmask?: boolean;
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
export type DatePreset = '30d' | '90d' | 'all' | 'custom' | 'month_this' | 'month_prev' | 'quarter_4' | 'year_2026' | 'month_year';

export interface PeriodFilter {
  preset: DatePreset;
  startDate: string;
  endDate: string;
  selectedMonth?: number; // 1 to 12
  selectedYear?: number;  // e.g. 2026
}

// ============================================================================
// FASE 2 DOMAIN TYPES: FITUR, MENU, DASBOR INTERAKTIF
// ============================================================================

export type NotificationType = 'approval' | 'revision' | 'sla_warning' | 'closed' | 'info';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  lead_id?: string;
  lead_code?: string;
  no_surat_jalan?: string;
  read: boolean;
  created_at: string;
}

export interface IsotankTypeMaster {
  id: string;
  name: string;
  capacity: string;
  description: string;
  imdgClass: string;
  suitableCargo: string;
}

export interface PicMaster {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  phone: string;
  email: string;
  active: boolean;
}

export interface ClosureCriterionMaster {
  id: string;
  label: string;
  required: boolean;
  category: 'bastp' | 'segel' | 'transporter' | 'inspeksi';
  description: string;
}

export interface SlaLimitMaster {
  id: string;
  corridorName: string;
  origin: string;
  destination: string;
  targetHoursLand: number;
  targetHoursSea: number;
}

export interface MasterDataConfig {
  isotankTypes: IsotankTypeMaster[];
  picList: PicMaster[];
  closureCriteria: ClosureCriterionMaster[];
  slaLimits: SlaLimitMaster[];
}

export type TableDensity = 'comfortable' | 'compact';
export type LeadViewMode = 'table' | 'kanban';
export type DetailDisplayMode = 'modal' | 'drawer';

export interface SavedFilterPreset {
  id: string;
  name: string;
  description: string;
  stageFilter?: string;
  muatanFilter?: string;
  depoFilter?: string;
  slaUrgentOnly?: boolean;
}

// ============================================================================
// FASE 3 SECURITY & GOVERNANCE TYPES
// ============================================================================

export type OperationalSubStageStatus = 'belum' | 'berjalan' | 'selesai';

export interface OperationalSubStageItem {
  id: string;
  stepNumber: number; // 1 to 5
  stepOrder?: number;
  title: string;
  description?: string;
  targetHours?: number;
  status: OperationalSubStageStatus;
  startTime?: string;
  endTime?: string;
  estimatedEndTime?: string;
  fieldPic: string;
  internalNotes: string;
  attachmentName?: string;
}

export interface SecuritySessionState {
  timeoutMinutes: number;
  lastActiveTimestamp: number;
  isTimeoutWarningOpen: boolean;
  isAdmin2FAVerified: boolean;
  admin2FAExpiresAt: number | null; // Timestamp
}

export interface SensitiveMaskState {
  [leadId: string]: {
    [fieldName: string]: boolean; // true = revealed for current session
  };
}

// ============================================================================
// FASE 8 PUBLIC CLIENT LINK & WHITELIST TYPES
// ============================================================================

export interface ClientStageMappingConfig {
  id: string;
  order: number;
  label: string;
  description: string;
  iconType: 'truck' | 'ship' | 'depo' | 'dock' | 'doc' | 'flag';
  triggerInternalStatuses: string[];
}

export interface ClientTrackingLinkInfo {
  token: string;
  tokenHash: string;
  createdAt: string;
  createdBy: string;
  expiresAt: string;
  isActive: boolean;
  viewCount: number;
  lastOpenedAt?: string;
  maxDaysAfterClosed: number;
  needsClientAction?: boolean;
  clientActionMessage?: string;
}

export interface PublicTrackingPayload {
  token: string;
  displayRefNo: string;
  clientCompany: string;
  cargoType: string;
  ruteAsal: string;
  ruteTujuan: string;
  clientStages: {
    id: string;
    order: number;
    label: string;
    description: string;
    status: 'selesai' | 'berjalan' | 'berikutnya';
    iconType: string;
  }[];
  activeStageIndex: number;
  activeStageLabel: string;
  highestReachedStageOrder: number;
  finalEtaRange: string;
  lastUpdatedAt: string;
  companyContact: {
    name: string;
    phone: string;
    email: string;
  };
  needsClientAction: boolean;
  clientActionText?: string;
}

