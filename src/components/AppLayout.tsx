import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import TopNavbar from '@/components/TopNavbar';
import BottomSidebarDock from '@/components/BottomSidebarDock';
import { useTheme } from '@/contexts/ThemeContext';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(theme.sidebarCollapsedByDefault);
  const isBottomSidebar = theme.sidebarPosition === 'bottom';
  const isRightSidebar = theme.sidebarPosition === 'right';
  const isThemeStudioPage = location.pathname === '/theme-studio';

  React.useEffect(() => {
    setIsSidebarCollapsed(theme.sidebarCollapsedByDefault);
  }, [theme.sidebarCollapsedByDefault]);

  return (
    <div
      className="app-shell flex h-screen w-full overflow-hidden bg-background"
      style={{
        flexDirection: isRightSidebar ? 'row-reverse' : 'row',
        padding: 'var(--layout-shell-spacing)',
        gap: 'var(--layout-shell-spacing)',
      }}
    >
      {!isBottomSidebar && (
        <AppSidebar
          position={isRightSidebar ? 'right' : 'left'}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <main
          className={`app-main flex-1 relative ${isThemeStudioPage ? 'overflow-hidden' : 'overflow-y-auto'}`}
          style={{
            padding: 'var(--layout-page-padding)',
            paddingBottom: isBottomSidebar
              ? 'calc(var(--layout-page-padding) + 92px)'
              : 'calc(var(--layout-page-padding) + var(--layout-bottom-dock-space))',
            background: 'linear-gradient(var(--layout-gradient-angle), var(--layout-bg-start) 0%, var(--layout-bg-mid) 52%, var(--layout-bg-end) 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 right-20 h-64 w-64 rounded-full blur-3xl opacity-55" style={{ background: 'hsl(var(--primary) / 0.16)' }} />
            <div className="absolute bottom-10 -left-10 h-56 w-56 rounded-full blur-3xl opacity-45" style={{ background: 'hsl(var(--secondary) / 0.14)' }} />
          </div>
          <div className={`layout-content-shell premium-page-shell animate-fade-in relative z-[1] ${isThemeStudioPage ? 'h-full min-h-0 overflow-hidden' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
      <BottomSidebarDock showOnDesktop={isBottomSidebar} />
    </div>
  );
};

export default AppLayout;
