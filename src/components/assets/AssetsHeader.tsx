import React from 'react';
import { Landmark, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssetsHeaderProps {
  canWrite: boolean;
  onOpenAdd: () => void;
}

export const AssetsHeader: React.FC<AssetsHeaderProps> = ({ canWrite, onOpenAdd }) => (
  <div className="page-header-banner assets-header">
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
        <Landmark className="w-5 h-5 text-emerald-500" />
        Temple Assets &amp; Property
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Manage buildings, land, valuable items, and track their maintenance cycle.
      </p>
      <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        Registry entries are audited by the trust board
      </span>
    </div>

    {canWrite && (
      <Button
        onClick={onOpenAdd}
        className="assets-cta shadow-md hover:shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Asset
      </Button>
    )}
  </div>
);

export default AssetsHeader;
