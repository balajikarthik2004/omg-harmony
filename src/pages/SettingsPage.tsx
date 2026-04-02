import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>

      <div className="erp-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium text-foreground">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium text-foreground">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Role</span>
            <span className="text-sm font-medium text-foreground capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="erp-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Temple Info</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Temple Name</span>
            <span className="text-sm font-medium text-foreground">OMG Temple</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium text-foreground">ERP v1.0</span>
          </div>
        </div>
      </div>

      <Button variant="outline">Save Changes</Button>
    </div>
  );
};

export default SettingsPage;
