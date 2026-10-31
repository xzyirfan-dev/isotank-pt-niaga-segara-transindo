import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, Asset, Lead, Evidence, Issue, Comment, AuditLog, ClosureArchive,
  LeadStatus, Language, AccentColor, PeriodFilter, UserRole
} from '../types';
import {
  INITIAL_USERS, INITIAL_ASSETS, INITIAL_LEADS, INITIAL_EVIDENCES,
  INITIAL_ISSUES, INITIAL_COMMENTS, INITIAL_AUDIT_LOGS, INITIAL_CLOSURES
} from '../data/mockData';

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

  // Actions
  createNewLead: (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'current_step' | 'total_revisions' | 'progress_percentage'>) => { success: boolean; message: string; leadId?: string };
  transitionLeadStage: (
    leadId: string,
    targetStage: LeadStatus,
    targetStep: number,
    comment?: string,
    checklistCleared?: boolean
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

  // Filtered Leads helper
  filteredLeads: Lead[];
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

  const [language, setLanguage] = useState<Language>('id');
  const [accentColor, setAccentColor] = useState<AccentColor>('teal');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
    preset: 'all',
    startDate: '',
    endDate: '',
  });

  // Save to localStorage when main state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ users, leads, assets, evidences, issues, comments, auditLogs, closures })
      );
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [users, leads, assets, evidences, issues, comments, auditLogs, closures]);

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

    appendAuditLog('CREATE_LEAD', 'Lead', newLeadId, `Membuat Lead Pengiriman Baru [${generatedLeadCode}] #${newLead.no_surat_jalan} (Aset: ${newLead.asset_code}, Rute: ${newLead.asal} -> ${newLead.tujuan}).`);

    return { success: true, message: `Lead [${generatedLeadCode}] #${newLead.no_surat_jalan} berhasil dibuat!`, leadId: newLeadId };
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

    return { success: true, message: `Status Lead [${lead.lead_code}] #${lead.no_surat_jalan} berhasil diperbarui ke Stage ${targetStep}.` };
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
    const leadTime = new Date(lead.created_at).getTime();
    const now = new Date().getTime();

    if (periodFilter.preset === '30d') {
      const limit = now - (30 * 24 * 60 * 60 * 1000);
      return leadTime >= limit;
    }
    if (periodFilter.preset === '90d') {
      const limit = now - (90 * 24 * 60 * 60 * 1000);
      return leadTime >= limit;
    }
    if (periodFilter.preset === 'custom' && periodFilter.startDate && periodFilter.endDate) {
      const start = new Date(periodFilter.startDate).getTime();
      const end = new Date(periodFilter.endDate).getTime() + (24 * 60 * 60 * 1000);
      return leadTime >= start && leadTime <= end;
    }
    return true;
  });

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
        transitionLeadStage,
        addEvidence,
        addIssue,
        resolveIssue,
        addComment,
        updateAssetStatus,
        resetDemoData,
        filteredLeads,
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
