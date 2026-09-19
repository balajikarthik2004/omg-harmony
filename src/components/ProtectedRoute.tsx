import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useTier } from '@/contexts/TierContext';
import { getLandingRoute } from '@/lib/navigation';
import type { ModuleId } from '@/lib/tiers';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  /** Module this route belongs to — blocked when the active tier doesn't include it. */
  module?: ModuleId;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, module }) => {
  const { isAuthenticated, user } = useAuth();
  const { tier, hasModule } = useTier();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'devotee' ? '/donate' : '/dashboard'} replace />;
  }
  if (module && !hasModule(module)) {
    return <Navigate to={getLandingRoute(user?.role, tier)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
