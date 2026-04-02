import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import TopNavbar from '@/components/TopNavbar';

const AppLayout: React.FC = () => (
  <div className="flex h-screen w-full overflow-hidden bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <TopNavbar />
      <main className="flex-1 p-6 overflow-y-auto" style={{
        background: 'linear-gradient(180deg, hsl(40, 33%, 97%) 0%, hsl(40, 33%, 98%) 100%)',
      }}>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);

export default AppLayout;
