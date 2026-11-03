import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GlobalPeriodFilter } from './components/GlobalPeriodFilter';
import { GoogleLoginModal } from './components/GoogleLoginModal';
import { NewLeadModal } from './components/NewLeadModal';
import { LeadDetailModal } from './components/LeadDetailModal';
import { AppleToastNotification } from './components/AppleToastNotification';
import { CommandPalette } from './components/CommandPalette';
import { CursorFollowerLight } from './components/CursorFollowerLight';

import { DashboardView } from './views/DashboardView';
import { MyTasksView } from './views/MyTasksView';
import { LeadListView } from './views/LeadListView';
import { ReportsView } from './views/ReportsView';
import { AiRecommendationsView } from './views/AiRecommendationsView';
import { SystemLogView } from './views/SystemLogView';
import { AdminView } from './views/AdminView';

import { PublicClientTrackingView } from './views/PublicClientTrackingView';

const MainLayout: React.FC = () => {
  const {
    activeView, setActiveView, selectedLeadId, setSelectedLeadId,
    publicTrackingStore, recordClientLinkView
  } = useApp();

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Standalone Public Client Route Detection (/t/<token>)
  const pathname = window.location.pathname;
  const isPublicRoute = pathname.startsWith('/t/') || window.location.search.includes('token=');

  if (isPublicRoute) {
    let token = '';
    if (pathname.startsWith('/t/')) {
      token = pathname.replace('/t/', '').split('/')[0];
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token') || '';
    }

    const payload = token ? (publicTrackingStore[token] || null) : null;

    useEffect(() => {
      if (token && payload) {
        recordClientLinkView(token);
      }
    }, [token, payload]);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <PublicClientTrackingView payload={payload} />
      </div>
    );
  }

  const handleOpenNewLeadModal = () => {
    setIsNewLeadModalOpen(true);
  };

  const handleCloseNewLeadModal = () => {
    setIsNewLeadModalOpen(false);
    if (activeView === 'new_lead') {
      setActiveView('leads');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans selection:bg-[var(--primary)] selection:text-white transition-colors duration-300 px-0 md:px-4">
      <div className="w-full max-w-[1600px] mx-auto bg-[var(--bg-surface)] shadow-2xl flex flex-row overflow-hidden min-h-screen md:h-[calc(100vh-2rem)] md:my-4 md:rounded-2xl md:border border-[var(--border-color)]">
        {/* Sidebar Navigation - Full height */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header */}
          <Header onOpenGoogleLogin={() => setIsGoogleModalOpen(true)} />

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {/* Global Period Filter bar */}
            <GlobalPeriodFilter />

            {/* Active View Router */}
            {(activeView === 'dashboard' || activeView === 'new_lead') && (
              <DashboardView onOpenNewLead={handleOpenNewLeadModal} />
            )}

            {activeView === 'my_tasks' && (
              <MyTasksView />
            )}

            {activeView === 'leads' && (
              <LeadListView onOpenNewLead={handleOpenNewLeadModal} />
            )}

            {activeView === 'reports' && (
              <ReportsView />
            )}

            {activeView === 'ai_recommendations' && (
              <AiRecommendationsView />
            )}

            {activeView === 'system_log' && (
              <SystemLogView />
            )}

            {(activeView === 'admin' || activeView === 'employee_control') && (
              <AdminView initialTab={activeView === 'employee_control' ? 'karyawan' : 'karyawan'} />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <GoogleLoginModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />

      <NewLeadModal
        isOpen={isNewLeadModalOpen || activeView === 'new_lead'}
        onClose={handleCloseNewLeadModal}
      />

      <LeadDetailModal
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />

      {/* Global Apple Feedback Toast with Undo */}
      <AppleToastNotification />

      {/* Global Command Palette (Cmd/Ctrl + K) */}
      <CommandPalette />

      {/* Global Futuristic Cursor Follower Light Effect */}
      <CursorFollowerLight />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
