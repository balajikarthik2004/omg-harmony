import React from 'react';
import { BadgeCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MembershipHeaderProps {
  canWrite: boolean;
  onOpenAdd: () => void;
}

export const MembershipHeader: React.FC<MembershipHeaderProps> = ({ canWrite, onOpenAdd }) => (
  <div className="page-header-banner membership-header">
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
        <BadgeCheck className="w-5 h-5 text-primary" />
        Devotee Membership
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Enrol devotees, track validity, and stay ahead of renewals across every membership category.
      </p>
    </div>

    {canWrite && (
      <Button
        onClick={onOpenAdd}
        className="membership-cta shadow-md hover:shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Enrol Member
      </Button>
    )}
  </div>
);

export default MembershipHeader;
