import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import TopNavbar from '@/components/TopNavbar';

const AppLayout: React.FC = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <TopNavbar />
      <main className="flex-1 p-5 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AppLayout;
