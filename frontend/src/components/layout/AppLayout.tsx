import React, { useState } from 'react';
import Sidebar from './Sidebar';
import EmotionAwareHeader from './EmotionAwareHeader';
import OfflineFooter from './OfflineFooter';
import PerformanceMonitor from '../monitoring/PerformanceMonitor';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emotion] = useState('focused'); // TODO: Connect to actual emotion detection

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <Sidebar />
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={toggleSidebar}
          ></div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <EmotionAwareHeader onMenuClick={toggleSidebar} emotion={emotion} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
        <OfflineFooter />
        <PerformanceMonitor />
      </div>
    </div>
  );
};

export default AppLayout;
