import React from 'react';
import { BookOpenCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinanceHeaderProps {
  canWrite: boolean;
  onOpenAdd: () => void;
}

export const FinanceHeader: React.FC<FinanceHeaderProps> = ({ canWrite, onOpenAdd }) => (
  <div className="page-header-banner finance-header">
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
        <BookOpenCheck className="w-5 h-5" />
        Finance Ledger
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Every rupee in and out of the temple, posted in date order with a running balance.
      </p>
    </div>

    {canWrite && (
      <Button onClick={onOpenAdd} className="finance-cta shadow-md hover:shadow-lg">
        <Plus className="h-4 w-4 mr-2" />
        Post Entry
      </Button>
    )}
  </div>
);

export default FinanceHeader;
