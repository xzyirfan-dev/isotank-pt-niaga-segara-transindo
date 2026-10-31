import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GlobalPeriodFilter } from './components/GlobalPeriodFilter';
import { GoogleLoginModal } from './components/GoogleLoginModal';
import { NewLeadModal } from './components/NewLeadModal';
import { LeadDetailModal } from './components/LeadDetailModal';

import { DashboardView } from './views/DashboardView';
import { MyTasksView } from './views/MyTasksView';
import { LeadListView } from './views/LeadListView';
import { ReportsView } from './views/ReportsView';
import { AiRecommendationsView } from './views/AiRecommendationsView';
import { SystemLogView } from './views/SystemLogView';
import { AdminView } from './views/AdminView';
import { EmployeeControlView } from './views/EmployeeControlView';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView, selectedLeadId, setSelectedLeadId } = useApp();

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header onOpenGoogleLogin={() => setIsGoogleModalOpen(true)} />

      {/* Body Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
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

          {activeView === 'employee_control' && (
            <EmployeeControlView />
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

          {activeView === 'admin' && (
            <AdminView />
          )}
        </main>
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
