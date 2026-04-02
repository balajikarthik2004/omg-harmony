import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'admin' | 'manager' | 'devotee';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<UserRole, User> = {
  admin: { id: '1', email: 'admin@omgtemple.com', name: 'Admin User', role: 'admin' },
  manager: { id: '2', email: 'manager@omgtemple.com', name: 'Temple Manager', role: 'manager' },
  devotee: { id: '3', email: 'devotee@omgtemple.com', name: 'Rajesh Kumar', role: 'devotee' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('omg_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email: string, _password: string, role: UserRole) => {
    const u = { ...DEMO_USERS[role], email };
    setUser(u);
    localStorage.setItem('omg_user', JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('omg_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
