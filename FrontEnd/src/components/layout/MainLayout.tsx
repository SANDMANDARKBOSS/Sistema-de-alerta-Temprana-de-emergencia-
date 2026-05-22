import React from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { Header } from '../header/Header';
import { PanelLogsIA } from '../panel-logs-ia/PanelLogsIA';
import { OnboardingGuide } from '../tutorial/OnboardingGuide';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      {/* Eliminado overflow-hidden y fijado el margen izquierdo al ancho del Sidebar */}
      <div className="flex-1 ml-[220px] flex flex-col min-h-screen relative">
        <Header />
        <main className="p-8 flex-1">
          {children}
        </main>
        <PanelLogsIA />
        <OnboardingGuide />
      </div>
    </div>
  );
};
