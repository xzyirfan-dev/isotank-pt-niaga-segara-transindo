import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, Asset, Lead, Evidence, Issue, Comment, AuditLog, ClosureArchive,
  LeadStatus, Language, AccentColor, PeriodFilter, UserRole,
  InAppNotification, MasterDataConfig, TableDensity, LeadViewMode, DetailDisplayMode, SavedFilterPreset,
  OperationalSubStageStatus, OperationalSubStageItem
} from '../types';
import {
  INITIAL_USERS, INITIAL_ASSETS, INITIAL_LEADS, INITIAL_EVIDENCES,
  INITIAL_ISSUES, INITIAL_COMMENTS, INITIAL_AUDIT_LOGS, INITIAL_CLOSURES,
  INITIAL_NOTIFICATIONS, INITIAL_MASTER_DATA, INITIAL_SAVED_PRESETS
} from '../data/mockData';
import { isValidTransition } from '../utils/stateMachine';
import { createDefaultOperationalSubStages } from '../utils/operationalStages';

interface AppContextType {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: UserRole) => void;
  isGoogleAuthenticated: boolean;
  setIsGoogleAuthenticated: (auth: boolean) => void;
  googleAuthUser: { name: string; email: string; picture: string } | null;
  setGoogleAuthUser: (user: { name: string; email: string; picture: string } | null) => void;
  syncGoogleUserToEmployee: (googleAccount: { name: string; email: string; picture: string; role?: UserRole }) => User;
  addEmployeeAccount: (newUser: Omit<User, 'id'>) => void;
  updateEmployeeAccount: (userId: string, updatedData: Partial<User>) => void;
  toggleEmployeeStatus: (userId: string) => void;
  
  // App Navigation
  activeView: string;
  setActiveView: (view: string) => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;

  // Domain Data
  leads: Lead[];
  assets: Asset[];
  evidences: Evidence[];
  issues: Issue[];
  comments: Comment[];
  auditLogs: AuditLog[];
  closures: ClosureArchive[];

  // Settings & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  themeMode: 'dark' | 'light';
  setThemeMode: (mode: 'dark' | 'light') => void;
  periodFilter: PeriodFilter;
  setPeriodFilter: React.Dispatch<React.SetStateAction<PeriodFilter>>;

  // FASE 2: In-App Notifications
  notifications: InAppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<InAppNotification, 'id' | 'created_at' | 'read'>) => void;

  // FASE 2: Master Data Management (Admin)
  masterData: MasterDataConfig;
  updateMasterData: <K extends keyof MasterDataConfig>(section: K, data: MasterDataConfig[K]) => void;

  // FASE 2: UI Preferences & Density
  tableDensity: TableDensity;
  setTableDensity: (density: TableDensity) => void;
  leadViewMode: LeadViewMode;
  setLeadViewMode: (mode: LeadViewMode) => void;
  detailDisplayMode: DetailDisplayMode;
  setDetailDisplayMode: (mode: DetailDisplayMode) => void;

  // FASE 2: Command Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // FASE 2: Saved Filter Presets
  savedFilterPresets: SavedFilterPreset[];
  activePresetFilterId: string | null;
  applySavedPreset: (presetId: string | null) => void;

  // FASE 2: System Logic & Duplicate Detection
  checkDuplicateLead: (noSuratJalan: string, clientCompany?: string, assetCode?: string) => { isDuplicate: boolean; field: string; message: string; existingLead?: Lead };
  bulkTransitionStage: (leadIds: string[], targetStage: LeadStatus, targetStep: number, notes?: string) => { successCount: number; message: string };
  bulkAssignPic: (leadIds: string[], picId: string, picName: string) => void;
  requestRevisionWithReason: (leadId: string, reason: string) => void;

  // Actions
  createNewLead: (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'current_step' | 'total_revisions' | 'progress_percentage'>) => { success: boolean; message: string; leadId?: string };
  updateLeadVesselBooking: (
    leadId: string,
    vesselData: {
      is_inter_island: boolean;
      shipping_company?: string;
      vessel_name?: string;
      voyage_number?: string;
      vessel_schedule?: string;
      port_origin?: string;
      port_destination?: string;
      vessel_ticket_doc_name?: string;
      vessel_ticket_doc_url?: string;
    }
  ) => void;
  updateLeadFinalDelivery: (
    leadId: string,
    deliveryData: {
      final_delivery_doc_name: string;
      final_delivery_received_by: string;
      final_delivery_date: string;
      final_delivery_doc_url?: string;
    }
  ) => void;
  transitionLeadStage: (
    leadId: string,
    targetStage: LeadStatus,
    targetStep: number,
    comment?: string,
    checklistCleared?: boolean
  ) => { success: boolean; message: string };
  updateOperationalSubStage: (
    leadId: string,
    subStageId: string,
    newStatus: OperationalSubStageStatus,
    internalNotes?: string
  ) => { success: boolean; message: string };
  addEvidence: (
    leadId: string,
    stage: LeadStatus,
    stage_step: number,
    fileType: Evidence['file_type'],
    fileName: string,
    fileSize: string,
    fileDataUrl?: string,
    notes?: string
  ) => void;
  addIssue: (leadId: string, deskripsi: string) => void;
  resolveIssue: (issueId: string, notes: string) => void;
  addComment: (leadId: string, message: string) => void;
  updateAssetStatus: (assetId: string, status: Asset['status']) => void;
  resetDemoData: () => void;

  // Toast Feedback & Undo System (Apple Web Interface Guidelines)
  toast: ToastNotification | null;
  showToast: (toastData: Omit<ToastNotification, 'id'>) => void;
  clearToast: () => void;

  // Filtered Leads helper
  filteredLeads: Lead[];
}

export interface ToastNotification {
  id: string;
  type: 'status' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  undoAction?: () => void;
  duration?: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'isotrack_app_state_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial mock data
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          users: parsed.users || INITIAL_USERS,
          leads: parsed.leads || INITIAL_LEADS,
          assets: parsed.assets || INITIAL_ASSETS,
          evidences: parsed.evidences || INITIAL_EVIDENCES,
          issues: parsed.issues || INITIAL_ISSUES,
          comments: parsed.comments || INITIAL_COMMENTS,
          auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
          closures: parsed.closures || INITIAL_CLOSURES,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          masterData: parsed.masterData || INITIAL_MASTER_DATA,
          tableDensity: (parsed.tableDensity as TableDensity) || 'comfortable',
          leadViewMode: (parsed.leadViewMode as LeadViewMode) || 'table',
          detailDisplayMode: (parsed.detailDisplayMode as DetailDisplayMode) || 'drawer',
          savedFilterPresets: parsed.savedFilterPresets || INITIAL_SAVED_PRESETS,
        };
      }
    } catch (e) {
      console.error('Failed to parse localStorage:', e);
    }
    return {
      users: INITIAL_USERS,
      leads: INITIAL_LEADS,
      assets: INITIAL_ASSETS,
      evidences: INITIAL_EVIDENCES,
      issues: INITIAL_ISSUES,
      comments: INITIAL_COMMENTS,
      auditLogs: INITIAL_AUDIT_LOGS,
      closures: INITIAL_CLOSURES,
      notifications: INITIAL_NOTIFICATIONS,
      masterData: INITIAL_MASTER_DATA,
      tableDensity: 'comfortable' as TableDensity,
      leadViewMode: 'table' as LeadViewMode,
      detailDisplayMode: 'drawer' as DetailDisplayMode,
      savedFilterPresets: INITIAL_SAVED_PRESETS,
    };
  };

  const initialData = loadInitialState();

  const [users, setUsers] = useState<User[]>(initialData.users);
  const [currentUser, setCurrentUser] = useState<User>(initialData.users[0] || INITIAL_USERS[0]);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState<boolean>(true);
  const [googleAuthUser, setGoogleAuthUser] = useState<{ name: string; email: string; picture: string } | null>({
    name: 'Mufid Irfan Syaifullah',
    email: 'mufid.irfan.syaifullah@gmail.com',
    picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>(initialData.leads);
  const [assets, setAssets] = useState<Asset[]>(initialData.assets);
  const [evidences, setEvidences] = useState<Evidence[]>(initialData.evidences);
  const [issues, setIssues] = useState<Issue[]>(initialData.issues);
  const [comments, setComments] = useState<Comment[]>(initialData.comments);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialData.auditLogs);
  const [closures, setClosures] = useState<ClosureArchive[]>(initialData.closures);

  // FASE 2: In-App Notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>(initialData.notifications);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (notifData: Omit<InAppNotification, 'id' | 'created_at' | 'read'>) => {
    const newNotif: InAppNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // FASE 2: Master Data Management (Admin)
  const [masterData, setMasterData] = useState<MasterDataConfig>(initialData.masterData);

  const updateMasterData = <K extends keyof MasterDataConfig>(section: K, data: MasterDataConfig[K]) => {
    setMasterData(prev => ({ ...prev, [section]: data }));
    appendAuditLog(
      'UPDATE_MASTER_DATA',
      'Settings',
      section,
      `Admin memperbarui master data konfigurasi operasional pada bagian [${section}].`
    );
    showToast({
      type: 'success',
      title: 'Master Data Tersimpan',
      message: `Konfigurasi ${section} berhasil diperbarui tanpa reload kode.`
    });
  };

  // FASE 2: UI Preferences & Density
  const [tableDensity, setTableDensity] = useState<TableDensity>(initialData.tableDensity);
  const [leadViewMode, setLeadViewMode] = useState<LeadViewMode>(initialData.leadViewMode);
  const [detailDisplayMode, setDetailDisplayMode] = useState<DetailDisplayMode>(initialData.detailDisplayMode);

  // FASE 2: Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // FASE 2: Saved Filter Presets
  const [savedFilterPresets] = useState<SavedFilterPreset[]>(initialData.savedFilterPresets);
  const [activePresetFilterId, setActivePresetFilterId] = useState<string | null>(null);

  const applySavedPreset = (presetId: string | null) => {
    setActivePresetFilterId(presetId);
  };

  const [language, setLanguage] = useState<Language>('id');
  const [accentColor, setAccentColor] = useState<AccentColor>('teal');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
    preset: 'all',
    startDate: '',
    endDate: '',
  });

  // Apple-grade Toast System with Undo Capability
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (toastData: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastNotification = { ...toastData, id };
    setToast(newToast);

    // Auto dismiss after duration unless it has an undo action (give undo 7 seconds)
    const timeoutMs = toastData.undoAction ? (toastData.duration || 7000) : (toastData.duration || 4000);
    setTimeout(() => {
      setToast(current => (current?.id === id ? null : current));
    }, timeoutMs);
  };

  const clearToast = () => setToast(null);

  // Save to localStorage when main state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          users,
          leads,
          assets,
          evidences,
          issues,
          comments,
          auditLogs,
          closures,
          notifications,
          masterData,
          tableDensity,
          leadViewMode,
          detailDisplayMode,
          savedFilterPresets
        })
      );
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [users, leads, assets, evidences, issues, comments, auditLogs, closures, notifications, masterData, tableDensity, leadViewMode, detailDisplayMode, savedFilterPresets]);

  // Sync html class for dark/light theme
  useEffect(() => {
    if (themeMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [themeMode]);

  // Helper for sequential LOG numbers
  const generateLogNumber = (): string => {
    const count = auditLogs.length + 1;
    return `LOG-${count.toString().padStart(4, '0')}`;
  };

  // Helper to append audit log entry
  const appendAuditLog = (action: string, entity: string, entityId: string, details: string) => {
    const now = new Date();
    const formattedTime = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');

    const logNumber = generateLogNumber();
    const newLog: AuditLog = {
      id: `alg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      log_number: logNumber,
      timestamp: formattedTime,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      action,
      entity,
      entity_id: entityId,
      details,
    };

    setAuditLogs(prev => [newLog, ...prev]);
    return logNumber;
  };

  // Automatically sync Google Account with Employee System
  const syncGoogleUserToEmployee = (googleAccount: { name: string; email: string; picture: string; role?: UserRole }) => {
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === googleAccount.email.toLowerCase());

    if (existingIndex >= 0) {
      const existingUser = users[existingIndex];
      const updatedUser: User = {
        ...existingUser,
        name: googleAccount.name || existingUser.name,
        avatar: googleAccount.picture || existingUser.avatar,
        googleLinked: true,
        googleLastLogin: new Date().toLocaleString('id-ID'),
      };
      setUsers(prev => {
        const copy = [...prev];
        copy[existingIndex] = updatedUser;
        return copy;
      });
      setCurrentUser(updatedUser);
      appendAuditLog('GOOGLE_LOGIN_SYNC', 'User', updatedUser.id, `Sesi pengguna ${updatedUser.name} (${updatedUser.email}) berhasil masuk & tersinkronisasi via Google Account.`);
      return updatedUser;
    } else {
      // Create new Employee Account linked to Google Account
      const newEmp: User = {
        id: `usr-${Date.now()}`,
        name: googleAccount.name,
        email: googleAccount.email,
        role: googleAccount.role || 'karyawan',
        avatar: googleAccount.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        department: 'Operasional Lapangan & Logistik',
        active: true,
        googleLinked: true,
        googleLastLogin: new Date().toLocaleString('id-ID'),
      };
      setUsers(prev => [...prev, newEmp]);
      setCurrentUser(newEmp);
      appendAuditLog('GOOGLE_AUTO_REGISTER_SYNC', 'User', newEmp.id, `Otomatis mendaftarkan karyawan baru "${newEmp.name}" (${newEmp.email}) via Google Sign-In.`);
      return newEmp;
    }
  };

  const addEmployeeAccount = (newUser: Omit<User, 'id'>) => {
    const newEmp: User = {
      ...newUser,
      id: `usr-${Date.now()}`,
      googleLinked: true,
    };
    setUsers(prev => [...prev, newEmp]);
    appendAuditLog('CREATE_EMPLOYEE_ACCOUNT', 'User', newEmp.id, `Manager membuat akun karyawan baru "${newEmp.name}" (${newEmp.email}).`);
  };

  const updateEmployeeAccount = (userId: string, updatedData: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }
    appendAuditLog('UPDATE_EMPLOYEE_ACCOUNT', 'User', userId, `Manager memperbarui profil/akses karyawan #${userId}.`);
  };

  const toggleEmployeeStatus = (userId: string) => {
    let targetName = '';
    let targetStatus = false;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        targetName = u.name;
        targetStatus = !u.active;
        return { ...u, active: targetStatus };
      }
      return u;
    }));
    appendAuditLog('TOGGLE_EMPLOYEE_STATUS', 'User', userId, `Manager mengubah status akun ${targetName} menjadi ${targetStatus ? 'AKTIF' : 'SUSPENDED'}.`);
  };

  // Switch role convenience for demo evaluator
  const switchUserRole = (role: UserRole) => {
    const target = users.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
      appendAuditLog('ROLE_SWITCH', 'UserSession', target.id, `Beralih peran aktif ke ${target.name} (${target.role.toUpperCase()}).`);
    }
  };

  // Create new lead with uniqueness checks
  const createNewLead = (
    leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'current_step' | 'total_revisions' | 'progress_percentage'>
  ) => {
    const duplicateSJ = leads.some(l => l.no_surat_jalan.trim().toLowerCase() === leadData.no_surat_jalan.trim().toLowerCase());
    if (duplicateSJ) {
      return { success: false, message: `Nomor Surat Jalan "${leadData.no_surat_jalan}" sudah terdaftar di sistem!` };
    }

    const activeLeadUsingAsset = leads.find(l => l.asset_id === leadData.asset_id && l.status !== 'closed');
    if (activeLeadUsingAsset) {
      return {
        success: false,
        message: `Isotank ${leadData.asset_code} sedang digunakan oleh Lead Aktif #${activeLeadUsingAsset.no_surat_jalan} (Status: ${activeLeadUsingAsset.status.toUpperCase()}). Pilih unit isotank yang dalam status TERSEDIA!`
      };
    }

    const nowIso = new Date().toISOString();
    const newLeadId = `ld-${Date.now()}`;
    const nextLeadNum = 100 + leads.length + 1;
    const generatedLeadCode = (leadData as any).lead_code || `LEAD-00${nextLeadNum}`;

    const newLead: Lead = {
      ...leadData,
      id: newLeadId,
      lead_code: generatedLeadCode,
      status: 'lead_created',
      current_step: 1,
      total_revisions: 0,
      progress_percentage: 10,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setLeads(prev => [newLead, ...prev]);
    setAssets(prev => prev.map(a => a.id === leadData.asset_id ? { ...a, status: 'Beroperasi' } : a));

    appendAuditLog('CREATE_LEAD', 'Lead', newLeadId, `Membuat Lead Pengiriman Baru [${generatedLeadCode}] #${newLead.no_surat_jalan} (Aset: ${newLead.asset_code}, Rute: ${newLead.asal} -> ${newLead.tujuan})${newLead.is_inter_island ? ' [RUTE ANTAR-PULAU: ' + (newLead.shipping_company || 'Kapal Kargo') + ']' : ''}.`);

    return { success: true, message: `Lead [${generatedLeadCode}] #${newLead.no_surat_jalan} berhasil dibuat!`, leadId: newLeadId };
  };

  // Update Inter-Island Vessel Booking Info
  const updateLeadVesselBooking = (
    leadId: string,
    vesselData: {
      is_inter_island: boolean;
      shipping_company?: string;
      vessel_name?: string;
      voyage_number?: string;
      vessel_schedule?: string;
      port_origin?: string;
      port_destination?: string;
      vessel_ticket_doc_name?: string;
      vessel_ticket_doc_url?: string;
    }
  ) => {
    setLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      ...vesselData,
      updated_at: new Date().toISOString()
    } : l));

    const target = leads.find(l => l.id === leadId);
    appendAuditLog(
      'UPDATE_VESSEL_BOOKING',
      'Lead',
      leadId,
      `[ID Lead: ${target?.lead_code || leadId}] Memperbarui data pemesanan kapal kargo: ${vesselData.shipping_company || 'Kapal Kargo'} (${vesselData.vessel_name || '-'}, Voyage: ${vesselData.voyage_number || '-'}).`
    );
  };

  // Update Final Delivery Proof (Syarat Penutupan Lead)
  const updateLeadFinalDelivery = (
    leadId: string,
    deliveryData: {
      final_delivery_doc_name: string;
      final_delivery_received_by: string;
      final_delivery_date: string;
      final_delivery_doc_url?: string;
    }
  ) => {
    setLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      ...deliveryData,
      updated_at: new Date().toISOString()
    } : l));

    const target = leads.find(l => l.id === leadId);
    appendAuditLog(
      'UPLOAD_FINAL_DELIVERY_PROOF',
      'Lead',
      leadId,
      `[ID Lead: ${target?.lead_code || leadId}] Melampirkan bukti dokumen/foto ketibaan di tujuan akhir (${deliveryData.final_delivery_doc_name}) diterima oleh ${deliveryData.final_delivery_received_by}.`
    );
  };

  // Transition Lead through 8 Stages
  const transitionLeadStage = (
    leadId: string,
    targetStage: LeadStatus,
    targetStep: number,
    comment?: string,
    checklistCleared: boolean = true
  ) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return { success: false, message: 'Lead tidak ditemukan.' };

    if (!isValidTransition(lead.status, targetStage)) {
      return {
        success: false,
        message: `Transisi tidak valid dari tahap ${lead.status} ke ${targetStage} ditolak oleh state machine sistem.`
      };
    }

    if (targetStage === 'submission' || targetStage === 'review') {
      const stageEvidences = evidences.filter(e => e.lead_id === leadId);
      if (stageEvidences.length === 0) {
        return {
          success: false,
          message: 'Gagal mengajukan: Wajib mengunggah minimal 1 dokumen bukti (Surat Jalan / Foto Muatan) sebelum mengarahkan ke Tahap Review!'
        };
      }
    }

    if (targetStage === 'final_approval' || targetStage === 'closed') {
      const openIssues = issues.filter(i => i.lead_id === leadId && i.status === 'open');
      if (openIssues.length > 0) {
        return {
          success: false,
          message: `Gagal menyetujui: Masih terdapat ${openIssues.length} kendala terbuka (Open Issues). Semua kendala wajib diselesaikan terlebih dahulu!`
        };
      }
    }

    // MANDATORY PROOF OF FINAL ARRIVAL FOR CLOSURE (Stage 8)
    if (targetStage === 'closed') {
      const hasFinalDeliveryProof = Boolean(lead.final_delivery_doc_name) ||
        evidences.some(e => e.lead_id === leadId && (e.file_type === 'bukti_sampai_tujuan' || e.file_type === 'surat_jalan'));
      if (!hasFinalDeliveryProof) {
        return {
          success: false,
          message: 'Gagal menutup lead: Bukti berupa dokumen atau foto bahwa pengiriman telah sampai tujuan akhir (Proof of Delivery / BASTP) wajib dilampirkan sebelum lead dapat diselesaikan!'
        };
      }
    }

    const nowIso = new Date().toISOString();
    let updatedRevisions = lead.total_revisions;
    let progressPct = Math.min(100, targetStep * 12.5);

    if (targetStage === 'follow_up') {
      updatedRevisions += 1;
    }

    const updatedLead: Lead = {
      ...lead,
      status: targetStage,
      current_step: targetStep,
      progress_percentage: progressPct,
      total_revisions: updatedRevisions,
      updated_at: nowIso,
      completed_at: targetStage === 'closed' ? nowIso : lead.completed_at,
      rejection_comment: comment || lead.rejection_comment,
    };

    setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));

    if (targetStage === 'closed') {
      setAssets(prev => prev.map(a => a.id === lead.asset_id ? { ...a, status: 'Tersedia' } : a));

      const createdDate = new Date(lead.created_at);
      const closedDate = new Date(nowIso);
      const diffHours = Math.round((closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
      const targetDate = new Date(lead.target_at);
      const isOnTime = closedDate.getTime() <= targetDate.getTime();

      const newArchive: ClosureArchive = {
        lead_id: leadId,
        lead_code: lead.lead_code || 'LEAD-00101',
        no_surat_jalan: lead.no_surat_jalan,
        asset_code: lead.asset_code,
        closed_at: nowIso,
        closed_by: currentUser.name,
        summary: `Siklus pengiriman [${lead.lead_code || 'LEAD-00101'}] #${lead.no_surat_jalan} (Rute: ${lead.asal} -> ${lead.tujuan}) telah ditutup resmi.`,
        total_hours: diffHours,
        sla_on_time: isOnTime,
        total_revisions: updatedRevisions,
        total_issues: issues.filter(i => i.lead_id === leadId).length,
      };

      setClosures(prev => [newArchive, ...prev]);
    }

    if (comment && comment.trim()) {
      addComment(leadId, `[Transisi Tahap ${targetStep}]: ${comment}`);
    }

    appendAuditLog(
      `STAGE_TRANSITION_STEP_${targetStep}`,
      'Lead',
      leadId,
      `Mengubah status Lead [${lead.lead_code}] #${lead.no_surat_jalan} dari Stage ${lead.current_step} ke Stage ${targetStep} (${targetStage.toUpperCase()}).`
    );

    // Apple Toast with Undo Action
    const previousLeadState = { ...lead };
    showToast({
      type: 'success',
      title: `Tahap Berhasil Diperbarui: Stage ${targetStep}`,
      message: `Lead ${lead.lead_code} (${lead.no_surat_jalan}) berhasil dipindahkan ke tahap ${targetStage.replace('_', ' ').toUpperCase()}.`,
      undoAction: () => {
        setLeads(prev => prev.map(l => l.id === leadId ? previousLeadState : l));
        appendAuditLog(
          'UNDO_STAGE_TRANSITION',
          'Lead',
          leadId,
          `[ID Lead: ${lead.lead_code}] Pengguna membatalkan (Undo) perubahan tahap kembali ke Stage ${previousLeadState.current_step} (${previousLeadState.status}).`
        );
        showToast({
          type: 'status',
          title: 'Perubahan Dibatalkan (Undo)',
          message: `Lead ${lead.lead_code} dikembalikan ke Stage ${previousLeadState.current_step}.`
        });
      }
    });

    return { success: true, message: `Status Lead [${lead.lead_code}] #${lead.no_surat_jalan} berhasil diperbarui ke Stage ${targetStep}.` };
  };

  const updateOperationalSubStage = (
    leadId: string,
    subStageId: string,
    newStatus: OperationalSubStageStatus,
    internalNotes?: string
  ) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return { success: false, message: 'Lead tidak ditemukan.' };

    const currentSubStages = lead.operationalSubStages || createDefaultOperationalSubStages();
    
    // Sequential consistency check: cannot complete sub-stage N unless N-1 is complete
    const targetIdx = currentSubStages.findIndex(s => s.id === subStageId);
    if (targetIdx > 0 && newStatus === 'selesai') {
      const prevSubStage = currentSubStages[targetIdx - 1];
      if (prevSubStage.status !== 'selesai' && currentUser.role !== 'admin') {
        return {
          success: false,
          message: `Aturan Konsistensi Lapangan: Sub-tahap "${currentSubStages[targetIdx].title}" tidak dapat diselesaikan sebelum sub-tahap sebelumnya ("${prevSubStage.title}") selesai!`
        };
      }
    }

    const nowIso = new Date().toISOString();
    const updatedSubStages = currentSubStages.map(s => {
      if (s.id === subStageId) {
        return {
          ...s,
          status: newStatus,
          startTime: newStatus === 'berjalan' && !s.startTime ? nowIso : s.startTime,
          endTime: newStatus === 'selesai' ? nowIso : s.endTime,
          internalNotes: internalNotes !== undefined ? internalNotes : s.internalNotes,
        };
      }
      return s;
    });

    const updatedLead: Lead = {
      ...lead,
      operationalSubStages: updatedSubStages,
      updated_at: nowIso,
    };

    setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));

    appendAuditLog(
      'UPDATE_OPERATIONAL_SUBSTAGE',
      'Lead',
      leadId,
      `Memperbarui sub-tahap operasional lapangan ID ${subStageId} menjadi status: ${newStatus.toUpperCase()}`
    );

    showToast({
      type: 'success',
      title: 'Sub-tahap Operasional Diperbarui',
      message: `Status sub-tahap berhasil diubah menjadi ${newStatus.toUpperCase()}`
    });

    return { success: true, message: 'Status sub-tahap operasional berhasil diperbarui.' };
  };

  const addEvidence = (
    leadId: string,
    stage: LeadStatus,
    stage_step: number,
    fileType: Evidence['file_type'],
    fileName: string,
    fileSize: string,
    fileDataUrl?: string,
    notes?: string
  ) => {
    const targetLead = leads.find(l => l.id === leadId);
    const leadCode = targetLead?.lead_code || 'LEAD-00101';
    const logNumber = appendAuditLog('UPLOAD_EVIDENCE', 'Evidence', leadId, `[ID Lead: ${leadCode}] Mengunggah berkas ${fileName} (${fileType.toUpperCase()}) untuk Lead #${leadCode}.`);
    
    const newEv: Evidence = {
      id: `ev-${Date.now()}`,
      lead_id: leadId,
      lead_code: leadCode,
      stage,
      stage_step,
      file_type: fileType,
      file_name: fileName,
      file_size: fileSize,
      uploaded_at: new Date().toLocaleString('id-ID'),
      uploaded_by: currentUser.name,
      uploaded_by_role: currentUser.role,
      file_data_url: fileDataUrl,
      notes,
      log_number: logNumber,
    };

    setEvidences(prev => [newEv, ...prev]);
  };

  const addIssue = (leadId: string, deskripsi: string) => {
    const targetLead = leads.find(l => l.id === leadId);
    const leadCode = targetLead?.lead_code || 'LEAD-00101';
    const logNumber = appendAuditLog('REPORT_ISSUE', 'Issue', leadId, `[ID Lead: ${leadCode}] Melaporkan kendala operasional: ${deskripsi}`);
    const newIss: Issue = {
      id: `iss-${Date.now()}`,
      lead_id: leadId,
      lead_code: leadCode,
      deskripsi,
      pelapor_id: currentUser.id,
      pelapor_name: currentUser.name,
      pelapor_role: currentUser.role,
      status: 'open',
      reported_at: new Date().toLocaleString('id-ID'),
      log_number: logNumber,
    };

    setIssues(prev => [newIss, ...prev]);
  };

  const resolveIssue = (issueId: string, notes: string) => {
    const iss = issues.find(i => i.id === issueId);
    if (!iss) return;

    appendAuditLog('RESOLVE_ISSUE', 'Issue', issueId, `Penyelesaian kendala #${issueId}: ${notes}`);
    setIssues(prev => prev.map(i => i.id === issueId ? {
      ...i,
      status: 'resolved',
      resolved_at: new Date().toLocaleString('id-ID'),
      resolution_notes: notes,
    } : i));
  };

  const addComment = (leadId: string, message: string) => {
    const targetLead = leads.find(l => l.id === leadId);
    const leadCode = targetLead?.lead_code;
    const newCmt: Comment = {
      id: `cmt-${Date.now()}`,
      lead_id: leadId,
      lead_code: leadCode,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      avatar: currentUser.avatar,
      message,
      created_at: new Date().toLocaleString('id-ID'),
    };
    setComments(prev => [newCmt, ...prev]);
  };

  const updateAssetStatus = (assetId: string, status: Asset['status']) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status } : a));
    appendAuditLog('UPDATE_ASSET_STATUS', 'Asset', assetId, `Status Isotank ${assetId} diubah menjadi ${status.toUpperCase()}.`);
  };

  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setLeads(INITIAL_LEADS);
    setAssets(INITIAL_ASSETS);
    setEvidences(INITIAL_EVIDENCES);
    setIssues(INITIAL_ISSUES);
    setComments(INITIAL_COMMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setClosures(INITIAL_CLOSURES);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    appendAuditLog('SYSTEM_RESET', 'System', 'ALL', 'Mengembalikan seluruh data ke kondisi demo awal.');
  };

  const filteredLeads = leads.filter(lead => {
    if (periodFilter.preset === 'all') return true;

    // Use completed_at for closed leads if available, otherwise created_at
    const dateStr = (lead.status === 'closed' && lead.completed_at) ? lead.completed_at : lead.created_at;
    const leadDate = new Date(dateStr);
    const leadTime = leadDate.getTime();
    const now = new Date().getTime();

    if (periodFilter.preset === '30d') {
      const limit = now - (30 * 24 * 60 * 60 * 1000);
      return leadTime >= limit;
    }
    if (periodFilter.preset === '90d') {
      const limit = now - (90 * 24 * 60 * 60 * 1000);
      return leadTime >= limit;
    }
    if (periodFilter.preset === 'month_this') {
      // October 2026 (based on system demo year 2026)
      return leadDate.getMonth() === 9 && leadDate.getFullYear() === 2026;
    }
    if (periodFilter.preset === 'month_prev') {
      // September 2026
      return leadDate.getMonth() === 8 && leadDate.getFullYear() === 2026;
    }
    if (periodFilter.preset === 'quarter_4') {
      // Q4 (Oct, Nov, Dec 2026)
      const month = leadDate.getMonth();
      return (month >= 9 && month <= 11) && leadDate.getFullYear() === 2026;
    }
    if (periodFilter.preset === 'year_2026') {
      return leadDate.getFullYear() === 2026;
    }
    if (periodFilter.preset === 'month_year' && periodFilter.selectedMonth && periodFilter.selectedYear) {
      return (leadDate.getMonth() + 1) === periodFilter.selectedMonth && leadDate.getFullYear() === periodFilter.selectedYear;
    }
    if (periodFilter.preset === 'custom' && periodFilter.startDate && periodFilter.endDate) {
      const start = new Date(periodFilter.startDate).getTime();
      const end = new Date(periodFilter.endDate).getTime() + (24 * 60 * 60 * 1000 - 1);
      return leadTime >= start && leadTime <= end;
    }
    return true;
  });

  // FASE 2: Duplicate Lead Detection
  const checkDuplicateLead = (noSuratJalan: string, clientCompany?: string, assetCode?: string) => {
    const cleanSJ = noSuratJalan.trim().toLowerCase();
    if (!cleanSJ) return { isDuplicate: false, field: '', message: '' };

    const existingBySJ = leads.find(l => l.no_surat_jalan.trim().toLowerCase() === cleanSJ);
    if (existingBySJ) {
      return {
        isDuplicate: true,
        field: 'no_surat_jalan',
        message: `Nomor Surat Jalan "${noSuratJalan}" sudah terdaftar pada Lead [${existingBySJ.lead_code}] dengan status ${existingBySJ.status.toUpperCase()}.`,
        existingLead: existingBySJ,
      };
    }

    if (assetCode && clientCompany) {
      const activeSameAsset = leads.find(
        l => l.status !== 'closed' &&
             l.asset_code.toLowerCase() === assetCode.toLowerCase() &&
             l.client_company?.toLowerCase() === clientCompany.toLowerCase()
      );
      if (activeSameAsset) {
        return {
          isDuplicate: true,
          field: 'asset_and_client',
          message: `Peringatan: Unit Isotank ${assetCode} saat ini masih aktif beroperasi untuk klien "${clientCompany}" pada Lead [${activeSameAsset.lead_code}].`,
          existingLead: activeSameAsset,
        };
      }
    }

    return { isDuplicate: false, field: '', message: '' };
  };

  // FASE 2: Bulk Stage Transitions
  const bulkTransitionStage = (leadIds: string[], targetStage: LeadStatus, targetStep: number, notes?: string) => {
    let successCount = 0;
    leadIds.forEach(id => {
      const res = transitionLeadStage(id, targetStage, targetStep, notes);
      if (res.success) successCount++;
    });
    showToast({
      type: 'success',
      title: 'Aksi Massal Selesai',
      message: `${successCount} dari ${leadIds.length} lead berhasil diperbarui ke Stage ${targetStep}.`
    });
    return { successCount, message: `${successCount} lead diproses` };
  };

  // FASE 2: Bulk PIC Assignment
  const bulkAssignPic = (leadIds: string[], picId: string, picName: string) => {
    setLeads(prev => prev.map(l => leadIds.includes(l.id) ? { ...l, pic_id: picId, pic_name: picName, updated_at: new Date().toISOString() } : l));
    appendAuditLog(
      'BULK_ASSIGN_PIC',
      'Lead',
      leadIds.join(', '),
      `Penugasan massal PIC ke "${picName}" untuk ${leadIds.length} transaksi lead.`
    );
    showToast({
      type: 'success',
      title: 'PIC Berhasil Ditugaskan',
      message: `${leadIds.length} lead kini dialokasikan ke ${picName}.`
    });
  };

  // FASE 2: Mandatory Revision Reason
  const requestRevisionWithReason = (leadId: string, reason: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    transitionLeadStage(leadId, 'follow_up', 6, `Alasan Revisi / Penolakan Wajib: ${reason}`);
    addNotification({
      title: `Permintaan Revisi: ${lead.lead_code}`,
      message: `Reviewer/Manager meminta revisi dokumen/operasional: "${reason}". Harap tangani pada Tahap 6.`,
      type: 'revision',
      lead_id: lead.id,
      lead_code: lead.lead_code,
      no_surat_jalan: lead.no_surat_jalan,
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        switchUserRole,
        isGoogleAuthenticated,
        setIsGoogleAuthenticated,
        googleAuthUser,
        setGoogleAuthUser,
        syncGoogleUserToEmployee,
        addEmployeeAccount,
        updateEmployeeAccount,
        toggleEmployeeStatus,
        activeView,
        setActiveView,
        selectedLeadId,
        setSelectedLeadId,
        leads,
        assets,
        evidences,
        issues,
        comments,
        auditLogs,
        closures,
        language,
        setLanguage,
        accentColor,
        setAccentColor,
        themeMode,
        setThemeMode,
        periodFilter,
        setPeriodFilter,
        createNewLead,
        updateLeadVesselBooking,
        updateLeadFinalDelivery,
        transitionLeadStage,
        updateOperationalSubStage,
        addEvidence,
        addIssue,
        resolveIssue,
        addComment,
        updateAssetStatus,
        resetDemoData,
        filteredLeads,
        toast,
        showToast,
        clearToast,

        // FASE 2 Values
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        masterData,
        updateMasterData,
        tableDensity,
        setTableDensity,
        leadViewMode,
        setLeadViewMode,
        detailDisplayMode,
        setDetailDisplayMode,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        savedFilterPresets,
        activePresetFilterId,
        applySavedPreset,
        checkDuplicateLead,
        bulkTransitionStage,
        bulkAssignPic,
        requestRevisionWithReason,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
