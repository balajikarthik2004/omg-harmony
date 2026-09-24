import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronRight, ClipboardCheck, Edit3, ExternalLink, PackageCheck, Plus } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { RECEIVABLE_PO_STATUSES, useProcurementStore } from '@/hooks/useProcurementStore';
import { fmtMoney, fmtQty, matchPOLineItem, receivedAgainstPO, suggestedStore } from '@/lib/inventory';
import { cn } from '@/lib/utils';
import { evaluatePO } from '@/lib/poEvaluation';
import POApprovalModal from './POApprovalModal';
import { EmptyRow, StoreBadge, tdCls, thCls, useInventoryRole } from './shared';

const FILTERS = [
  { key: 'open', label: 'Open', statuses: ['Pending', 'Approved', 'Partially Received'] },
  { key: 'Pending', label: 'Awaiting approval', statuses: ['Pending'] },
  { key: 'due', label: 'Awaiting delivery', statuses: RECEIVABLE_PO_STATUSES },
  { key: 'closed', label: 'Completed', statuses: ['Received', 'Rejected'] },
  { key: 'all', label: 'All', statuses: [] as string[] },
];

const PurchaseOrdersTab: React.FC<{
  onReceive: (poId: string) => void;
  onCustomReceive?: (poId: string) => void;
  onNewOrder: () => void;
  /** Order to bring into view, e.g. one just raised by the procurement agent. */
  focusId?: string | null;
}> = ({ onReceive, onCustomReceive, onNewOrder, focusId }) => {
  const { state, summaries } = useInventoryStore();
  const { items: pos } = useProcurementStore();
  const { isAdmin } = useInventoryRole();
  const [filter, setFilter] = useState('open');
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    const statuses = FILTERS.find(f => f.key === filter)?.statuses ?? [];
    return pos.filter(p => !statuses.length || statuses.includes(p.status));
  }, [pos, filter]);

  const [reviewId, setReviewId] = useState<string | null>(null);

  useEffect(() => {
    const po = pos.find(p => p.id === focusId);
    if (!po) return;
    setFilter(po.status === 'Pending' ? 'Pending' : 'all');
    setExpanded(po.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  // A quick AI check on every order still awaiting approval, so the admin knows which ones need a closer look.
  const checks = useMemo(() => Object.fromEntries(pos.filter(p => p.status === 'Pending').map(p => [p.id, evaluatePO({
    poId: p.id, supplier: p.vendor, expectedDate: p.expectedDate, state, summaries, pos,
    lines: p.items.map((l, i) => ({ key: String(i), name: l.name, itemId: l.itemId, qty: l.quantity, price: l.price, store: suggestedStore(state.items, l) })),
  })])), [pos, state, summaries]);
  const pendingCount = pos.filter(p => p.status === 'Pending').length;

  return (
    <div className="section-panel inventory-main-panel shadow-sm">
      <div className="section-panel-header flex-wrap gap-3 py-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter orders">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn('h-8 px-3.5 rounded-full text-xs font-medium border transition-colors',
                filter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground')}>
              {f.label}
              {f.key === 'Pending' && pendingCount > 0 && (
                <span className={cn('ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  filter === f.key ? 'bg-primary-foreground/20' : 'bg-amber-500 text-white')}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/procurement"><ExternalLink className="h-4 w-4 mr-1.5" />Full procurement</Link>
          </Button>
          <Button size="sm" onClick={onNewOrder}><Plus className="h-4 w-4 mr-1.5" />New order</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="w-8" />
              <th className={thCls}>Order</th>
              <th className={thCls}>Supplier</th>
              <th className={thCls}>Items</th>
              <th className={thCls}>For store</th>
              <th className={cn(thCls, 'text-right')}>Amount</th>
              <th className={thCls}>Status</th>
              <th className={cn(thCls, 'text-right')}>Action</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {rows.length === 0 && <EmptyRow colSpan={8} message="No orders here." />}
            {rows.map(po => {
              const open = expanded === po.id;
              const received = receivedAgainstPO(state, po.id);
              const stores = [...new Set(po.items.map(l => suggestedStore(state.items, l)))];
              const confirmed = po.status !== 'Pending' && po.items.every(l => l.store);
              return (
                <React.Fragment key={po.id}>
                  <tr className={cn('border-b border-border hover:bg-muted/30 cursor-pointer', po.id === focusId && 'bg-primary/5')} onClick={() => setExpanded(open ? null : po.id)}>
                    <td className="pl-3 text-muted-foreground">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                    <td className={tdCls}>
                      <p className="font-semibold">{po.poNumber}</p>
                      <p className="text-xs text-muted-foreground">{po.date}{po.expectedDate && ` · due ${new Date(po.expectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}</p>
                    </td>
                    <td className={tdCls}>{po.vendor}</td>
                    <td className={cn(tdCls, 'text-muted-foreground max-w-[240px] truncate')}>{po.items.map(i => i.name).join(', ')}</td>
                    <td className={tdCls}>
                      <div className="flex flex-wrap gap-1" title={confirmed ? 'Confirmed by approver' : 'Requested store - confirmed at approval'}>
                        {stores.map(s => <StoreBadge key={s} store={s} className={confirmed ? '' : 'border-dashed opacity-80'} />)}
                      </div>
                    </td>
                    <td className={cn(tdCls, 'text-right tabular-nums font-medium')}>{fmtMoney(po.amount)}</td>
                    <td className={tdCls}>
                      <StatusBadge status={po.status} />
                      {checks[po.id] && (
                        <p className={cn('mt-1 text-[11px] font-semibold', checks[po.id].verdict === 'review' ? 'text-red-600 dark:text-red-400'
                          : checks[po.id].verdict === 'approve_with_changes' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}
                          title={checks[po.id].headline}>
                          AI {checks[po.id].score} · {checks[po.id].verdict === 'review' ? 'needs review' : checks[po.id].verdict === 'approve_with_changes' ? 'changes suggested' : 'looks right'}
                        </p>
                      )}
                    </td>
                    <td className={cn(tdCls, 'text-right whitespace-nowrap')} onClick={e => e.stopPropagation()}>
                      {RECEIVABLE_PO_STATUSES.includes(po.status) && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 font-medium border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-xs"
                            onClick={() => onReceive(po.id)}
                          >
                            <PackageCheck className="h-4 w-4" />
                            Receive
                          </Button>
                          {onCustomReceive && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-7 p-0 text-muted-foreground hover:text-foreground">
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => onCustomReceive(po.id)}>
                                  <Edit3 className="h-4 w-4 mr-2" /> Custom / Partial Receive...
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}
                      {po.status === 'Pending' && isAdmin && (
                        <Button size="sm" className="h-8 gap-1.5" onClick={() => setReviewId(po.id)}>
                          <ClipboardCheck className="h-4 w-4" /> Review &amp; approve
                        </Button>
                      )}
                      {po.status === 'Pending' && !isAdmin && <span className="text-xs text-muted-foreground">With admin</span>}
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-border bg-muted/20">
                      <td />
                      <td colSpan={7} className="px-3 py-3">
                        <table className="w-full max-w-3xl text-sm">
                          <thead><tr className="text-xs text-muted-foreground"><th className="text-left font-medium py-1">Item</th><th className="text-left font-medium py-1">Store</th><th className="text-right font-medium py-1">Ordered</th><th className="text-right font-medium py-1">Received</th><th className="text-right font-medium py-1">Rate</th></tr></thead>
                          <tbody>
                            {po.items.map((line, idx) => {
                              const itemId = matchPOLineItem(state.items, line);
                              return (
                                <tr key={idx}>
                                  <td className="py-1">{line.name}</td>
                                  <td className="py-1"><StoreBadge store={suggestedStore(state.items, line)} className={confirmed ? '' : 'border-dashed opacity-80'} /></td>
                                  <td className="py-1 text-right tabular-nums">{fmtQty(line.quantity)} {line.unit ?? ''}</td>
                                  <td className="py-1 text-right tabular-nums">{itemId ? fmtQty(received[itemId] ?? 0) : '-'}</td>
                                  <td className="py-1 text-right tabular-nums">{fmtMoney(line.price)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {po.rejectionReason && po.status === 'Rejected' && <p className="text-xs text-destructive mt-2">Reason: {po.rejectionReason}</p>}
                        {po.notes && <p className="text-xs text-muted-foreground mt-2">Note: {po.notes}</p>}
                        {po.approvedByName && po.status !== 'Pending' && po.status !== 'Rejected' && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Approved by {po.approvedByName} on {po.approvedDate}{po.revisedOnApproval && ' · revised during approval'}{po.approvalNote && ` · "${po.approvalNote}"`}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <POApprovalModal poId={reviewId} onClose={() => setReviewId(null)} />
    </div>
  );
};

export default PurchaseOrdersTab;
