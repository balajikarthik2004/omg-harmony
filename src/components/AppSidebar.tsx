import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import { getNavigationLinks } from '@/lib/navigation';

import logo from '@/assets/img/logo.png'; 
import logo1 from '@/assets/img/logo1.png';

interface AppSidebarProps {
  position: 'left' | 'right';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ position, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = getNavigationLinks(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isRightPosition = position === 'right';
  const collapseIcon = isRightPosition
    ? (isCollapsed ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />)
    : (isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />);

  return (
    <aside
      className="layout-sidebar hidden lg:flex flex-col h-screen shrink-0 sticky top-0 overflow-hidden border transition-[width,box-shadow,transform] duration-300"
      style={{
        width: isCollapsed ? 'var(--layout-sidebar-collapsed-width)' : 'var(--layout-sidebar-expanded-width)',
        backgroundImage: 'linear-gradient(var(--sidebar-gradient-angle), var(--sidebar-gradient-start) 0%, var(--sidebar-gradient-mid) 54%, var(--sidebar-gradient-end) 100%)',
        backgroundColor: 'var(--layout-frame-background)',
        borderColor: 'var(--layout-frame-border)',
        boxShadow: isRightPosition ? 'var(--layout-sidebar-frame-shadow-right)' : 'var(--layout-sidebar-frame-shadow-left)',
        borderRadius: 'var(--layout-sidebar-radius)',
        backdropFilter: 'var(--layout-frame-backdrop)',
        WebkitBackdropFilter: 'var(--layout-frame-backdrop)',
        color: 'hsl(0, 0%, 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-14 h-52 w-52 rounded-full blur-3xl" style={{ background: 'var(--sidebar-glow-a)' }} />
        <div className="absolute bottom-10 -right-14 h-44 w-44 rounded-full blur-3xl" style={{ background: 'var(--sidebar-glow-b)' }} />
      </div>

      {/* Logo area */}
      <div className={`relative border-b border-white/10 backdrop-blur-sm bg-white/[0.03] ${isCollapsed ? 'p-3' : 'p-5'}`}>
        <div className={`flex ${isCollapsed ? 'flex-col items-center gap-2' : 'items-start justify-between gap-3'}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`h-7 w-7 rounded-md border border-white/20 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 hover:shadow-[0_8px_20px_rgba(0,0,0,0.22)] flex items-center justify-center ${
              isCollapsed ? 'order-1' : 'order-2 mt-0.5'
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapseIcon}
          </button>
          <div className={isCollapsed ? 'order-2' : 'order-1'}>
            <img
              src={isCollapsed ? logo1 : logo}
              alt="OMG Temple"
              className={`object-contain bg-white rounded-lg shadow-sm transition-all duration-200 ${
                isCollapsed ? 'h-10 w-10 px-1 mx-auto' : 'h-[50px] px-4'
              }`}
            />
          </div>
        </div>
        {!isCollapsed && (
          <p className="mt-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-white/70">Temple Governance System</p>
        )}
      </div>

      {/* Navigation */}
      <nav className={`relative flex-1 py-4 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3.5'}`}>
        {!isCollapsed && <p className="px-2 pb-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-white/45">Workspace</p>}
        <div className="space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              title={isCollapsed ? link.label : undefined}
              className={({ isActive }) =>
                `group relative isolate flex items-center rounded-xl border text-sm font-medium transition-all duration-200 ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'border-white/25 bg-[linear-gradient(140deg,rgba(255,255,255,0.22),rgba(255,255,255,0.1))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_18px_rgba(0,0,0,0.22)] -translate-y-[1px]'
                    : 'border-transparent text-white/75 hover:text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-[1px] hover:shadow-[0_8px_18px_rgba(0,0,0,0.18)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute inset-y-1 ${isRightPosition ? 'right-1' : 'left-1'} w-1 rounded-full transition-all duration-200 ${
                      isActive ? 'shadow-[0_0_12px_rgba(0,0,0,0.28)]' : 'bg-transparent group-hover:bg-white/35'
                    }`}
                    style={isActive ? { background: 'var(--sidebar-highlight)' } : undefined}
                  />
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]' : 'bg-white/[0.08] text-white/75 group-hover:bg-white/18 group-hover:text-white'
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                  </span>
                  {!isCollapsed && <span className="truncate">{link.label}</span>}
                  {!isCollapsed && (
                    <span
                      className={`ml-auto h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                        isActive ? 'scale-100' : 'bg-white/0 scale-75 group-hover:bg-white/70 group-hover:scale-100'
                      }`}
                      style={isActive ? { background: 'var(--sidebar-highlight-soft)' } : undefined}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User info & logout */}
      <div className={`relative border-t border-white/10 bg-black/10 backdrop-blur-sm ${isCollapsed ? 'p-2.5 space-y-2' : 'p-3.5 space-y-2.5'}`}>
        {/* User info pill */}
        <div className={`flex items-center rounded-xl bg-white/10 border border-white/15 ${isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'}`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-inner" style={{ background: 'linear-gradient(135deg, var(--sidebar-gradient-mid) 0%, var(--sidebar-gradient-start) 55%, var(--sidebar-avatar-mid) 100%)' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white/90 truncate">{user?.name}</p>
              <p className="text-[10px] tracking-wide text-white/55 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`group flex items-center rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 w-full transition-all duration-200 hover:-translate-y-[1px] ${
            isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
