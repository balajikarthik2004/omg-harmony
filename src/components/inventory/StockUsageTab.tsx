import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ClipboardCheck, Plus } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { StockRequestStatus, fmtDateTime, fmtMoney, fmtQty } from '@/lib/inventory';
import { cn } from '@/lib/utils';
import StockRequestApprovalModal from './StockRequestApprovalModal';
import { EmptyRow, StoreBadge, tdCls, thCls, useInventoryRole } from './shared';

const FILTERS: { key: string; label: string; statuses: StockRequestStatus[] }[] = [
  { key: 'pending', label: 'Awaiting approval', statuses: ['Pending'] },
  { key: 'approved', label: 'Approved', statuses: ['Approved'] },
  { key: 'rejected', label: 'Rejected', statuses: ['Rejected'] },
  { key: 'all', label: 'All', statuses: [] },
];

const filterFor = (status: StockRequestStatus) => FILTERS.find(f => f.statuses.length === 1 && f.statuses[0] === status)?.key ?? 'all';

const StockUsageTab: React.FC<{ onNewRequest: () => void; focusId?: string | null }> = ({ onNewRequest, focusId }) => {
  const { state, summaries } = useInventoryStore();
  const { isAdmin } = useInventoryRole();
  const [filter, setFilter] = useState(() => (state.requests.some(r => r.status === 'Pending') ? 'pending' : 'all'));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  // Just-saved entry: switch to the filter that contains it and open it.
  useEffect(() => {
    const r = state.requests.find(x => x.id === focusId);
    if (!r) return;
    setFilter(filterFor(r.status));
    setExpanded(r.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  const itemName = (id: string) => state.items.find(i => i.id === id)?.name ?? 'Unknown item';
  const unit = (id: string) => state.items.find(i => i.id === id)?.unit ?? '';
  const pendingCount = state.requests.filter(r => r.status === 'Pending').length;

  const rows = useMemo(() => {
    const statuses = FILTERS.find(f => f.key === filter)?.statuses ?? [];
    return state.requests.filter(r => !statuses.length || statuses.includes(r.status));
  }, [state.requests, filter]);

  return (
    <div className="section-panel inventory-main-panel shadow-sm">
      <div className="section-panel-header flex-wrap gap-3 py-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter requests">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn('h-8 px-3.5 rounded-full text-xs font-medium border transition-colors',
                filter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground')}>
              {f.label}
              {f.key === 'pending' && pendingCount > 0 && (
                <span className={cn('ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  filter === f.key ? 'bg-primary-foreground/20' : 'bg-amber-500 text-white')}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={onNewRequest}><Plus className="h-4 w-4 mr-1.5" />New request</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="w-8" />
              <th className={thCls}>Request</th>
              <th className={thCls}>Store</th>
              <th className={thCls}>Purpose · for</th>
              <th className={thCls}>Items</th>
              <th className={cn(thCls, 'text-right')}>Value</th>
              <th className={thCls}>Status</th>
              <th className={cn(thCls, 'text-right')}>Action</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {rows.length === 0 && <EmptyRow colSpan={8} message={filter === 'pending' ? 'No stock requests are waiting for approval.' : 'No requests here.'} />}
            {rows.map(r => {
              const open = expanded === r.id;
              const lines = r.approvedLines ?? r.lines;
              const value = lines.reduce((a, l) => a + l.qty * (summaries[l.itemId]?.avgCost ?? 0), 0);
              const store = r.approvedStore ?? r.store;
              return (
                <React.Fragment key={r.id}>
                  <tr className={cn('border-b border-border hover:bg-muted/30 cursor-pointer', r.id === focusId && 'bg-primary/5')} onClick={() => setExpanded(open ? null : r.id)}>
                    <td className="pl-3 text-muted-foreground">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                    <td className={tdCls}>
                      <p className="font-semibold">{r.refNo}</p>
                      <p className="text-xs text-muted-foreground">{fmtDateTime(r.requestedAt)} · {r.requestedBy}</p>
                    </td>
                    <td className={tdCls}>
                      <StoreBadge store={store} />
                      {r.approvedStore && <p className="text-[10px] text-muted-foreground mt-0.5">changed by approver</p>}
                    </td>
                    <td className={tdCls}>
                      <p className="font-medium">{r.purpose}</p>
                      <p className="text-xs text-muted-foreground">{r.party}</p>
                    </td>
                    <td className={cn(tdCls, 'text-muted-foreground max-w-[240px] truncate')}>{lines.map(l => itemName(l.itemId)).join(', ')}</td>
                    <td className={cn(tdCls, 'text-right tabular-nums font-medium')}>{fmtMoney(value)}</td>
                    <td className={tdCls}><StatusBadge status={r.status} /></td>
                    <td className={cn(tdCls, 'text-right whitespace-nowrap')} onClick={e => e.stopPropagation()}>
                      {r.status === 'Pending' && isAdmin && (
                        <Button size="sm" className="h-8 gap-1.5" onClick={() => setReviewId(r.id)}>
                          <ClipboardCheck className="h-4 w-4" /> Review &amp; approve
                        </Button>
                      )}
                      {r.status === 'Pending' && !isAdmin && <span className="text-xs text-muted-foreground">With admin</span>}
                      {r.status === 'Approved' && <span className="text-xs text-muted-foreground">Issued · {r.issueRef}</span>}
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-border bg-muted/20">
                      <td />
                      <td colSpan={7} className="px-3 py-3">
                        <table className="w-full max-w-2xl text-sm">
                          <thead>
                            <tr className="text-xs text-muted-foreground">
                              <th className="text-left font-medium py-1">Item</th>
                              <th className="text-right font-medium py-1">Requested</th>
                              {r.status === 'Approved' && <th className="text-right font-medium py-1">Issued</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {[...new Set([...r.lines, ...(r.approvedLines ?? [])].map(l => l.itemId))].map(id => {
                              const asked = r.lines.find(l => l.itemId === id)?.qty;
                              const issued = (r.approvedLines ?? r.lines).find(l => l.itemId === id)?.qty ?? 0;
                              return (
                                <tr key={id}>
                                  <td className="py-1">{itemName(id)}</td>
                                  <td className="py-1 text-right tabular-nums">{asked !== undefined ? `${fmtQty(asked)} ${unit(id)}` : '-'}</td>
                                  {r.status === 'Approved' && (
                                    <td className={cn('py-1 text-right tabular-nums', issued !== asked && 'text-amber-600 dark:text-amber-400 font-medium')}>{fmtQty(issued)} {unit(id)}</td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {r.notes && <p className="text-xs text-muted-foreground mt-2">Note: {r.notes}</p>}
                        {r.decidedBy && (
                          <p className={cn('text-xs mt-2', r.status === 'Rejected' ? 'text-destructive' : 'text-muted-foreground')}>
                            {r.status} by {r.decidedBy} on {fmtDateTime(r.decidedAt)}{r.decisionNote && ` · "${r.decisionNote}"`}
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
      <StockRequestApprovalModal requestId={reviewId} onClose={() => setReviewId(null)} />
    </div>
  );
};

export default StockUsageTab;
