import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { CATEGORIES, EXPIRY_WARNING_DAYS, addDays, daysBetween, downloadCSV, fmtDate, fmtMoney, fmtQty, storeName } from '@/lib/inventory';
import { toISODate } from '@/lib/utils';
import { tdCls, thCls } from './shared';

type ReportKey = 'valuation' | 'consumption' | 'expiry' | 'wastage' | 'donations';

const REPORTS: { key: ReportKey; label: string }[] = [
  { key: 'valuation', label: 'Stock value' },
  { key: 'consumption', label: 'Usage (last 30 days)' },
  { key: 'expiry', label: 'Expiring items' },
  { key: 'wastage', label: 'Write-offs (last 30 days)' },
  { key: 'donations', label: 'Donated items' },
];

const ReportsTab: React.FC<{ onOpenItem: (itemId: string) => void }> = ({ onOpenItem }) => {
  const { state, summaries } = useInventoryStore();
  const [report, setReport] = useState<ReportKey>('valuation');
  const itemById = useMemo(() => new Map(state.items.map(i => [i.id, i])), [state.items]);
  const since30 = useMemo(() => addDays(new Date(), -30).toISOString(), []);

  const valuation = useMemo(() => CATEGORIES.map(c => {
    const items = state.items.filter(i => i.category === c.name && i.active);
    const value = items.reduce((s, i) => s + summaries[i.id].value, 0);
    return { category: c.name, items: items.length, value: Math.round(value) };
  }).filter(r => r.items > 0).sort((a, b) => b.value - a.value), [state.items, summaries]);
  const totalValue = valuation.reduce((s, r) => s + r.value, 0);

  const consumption = useMemo(() => {
    const map = new Map<string, { qty: number; value: number; purposes: Record<string, number> }>();
    state.movements.forEach(m => {
      if (m.type !== 'ISSUE' || m.date < since30) return;
      const r = map.get(m.itemId) ?? { qty: 0, value: 0, purposes: {} };
      r.qty += -m.qty; r.value += -m.qty * m.unitCost;
      r.purposes[m.purpose ?? 'Other'] = (r.purposes[m.purpose ?? 'Other'] ?? 0) + -m.qty * m.unitCost;
      map.set(m.itemId, r);
    });
    return [...map.entries()].map(([itemId, r]) => ({ item: itemById.get(itemId)!, ...r })).filter(r => r.item).sort((a, b) => b.value - a.value);
  }, [state.movements, itemById, since30]);

  const expiry = useMemo(() => {
    const now = new Date();
    const limit = toISODate(addDays(now, 30));
    return state.items.flatMap(i => summaries[i.id].batches.filter(b => b.expiryDate && b.expiryDate <= limit && (i.shelfLifeDays ?? 0) >= 14 || (b.expiryDate && daysBetween(b.expiryDate, now) < 0))
      .map(b => ({ item: i, batch: b, days: daysBetween(b.expiryDate as string, now), value: b.qty * b.unitCost })))
      .sort((a, b) => a.days - b.days);
  }, [state.items, summaries]);

  const wastage = useMemo(() => state.movements.filter(m => m.type === 'WASTAGE' && m.date >= since30), [state.movements, since30]);
  const wastageByReason = useMemo(() => {
    const map: Record<string, number> = {};
    wastage.forEach(m => { map[m.reason ?? 'Other'] = (map[m.reason ?? 'Other'] ?? 0) + -m.qty * m.unitCost; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [wastage]);
  const wastageByItem = useMemo(() => {
    const map = new Map<string, { qty: number; value: number }>();
    wastage.forEach(m => { const r = map.get(m.itemId) ?? { qty: 0, value: 0 }; r.qty += -m.qty; r.value += -m.qty * m.unitCost; map.set(m.itemId, r); });
    return [...map.entries()].map(([id, r]) => ({ item: itemById.get(id)!, ...r })).filter(r => r.item).sort((a, b) => b.value - a.value);
  }, [wastage, itemById]);

  const donations = useMemo(() => state.movements.filter(m => m.type === 'DONATION').sort((a, b) => b.date.localeCompare(a.date)), [state.movements]);

  const exportReport = () => {
    const stamp = toISODate(new Date());
    if (report === 'valuation') {
      downloadCSV(`stock-valuation-${stamp}.csv`, [['Code', 'Item', 'Category', 'On hand', 'Unit', 'Avg cost', 'Value'],
        ...state.items.filter(i => i.active).map(i => [i.code, i.name, i.category, summaries[i.id].onHand, i.unit, summaries[i.id].avgCost.toFixed(2), summaries[i.id].value.toFixed(2)])]);
    } else if (report === 'consumption') {
      downloadCSV(`consumption-30d-${stamp}.csv`, [['Code', 'Item', 'Issued qty', 'Unit', 'Avg per day', 'Value'],
        ...consumption.map(r => [r.item.code, r.item.name, r.qty.toFixed(2), r.item.unit, (r.qty / 30).toFixed(3), r.value.toFixed(2)])]);
    } else if (report === 'expiry') {
      downloadCSV(`expiry-report-${stamp}.csv`, [['Code', 'Item', 'Store', 'Batch', 'Expiry', 'Days left', 'Qty', 'Unit', 'Value'],
        ...expiry.map(r => [r.item.code, r.item.name, storeName(r.batch.store), r.batch.batchNo, r.batch.expiryDate, r.days, r.batch.qty, r.item.unit, r.value.toFixed(2)])]);
    } else if (report === 'wastage') {
      downloadCSV(`wastage-30d-${stamp}.csv`, [['Date', 'Ref', 'Code', 'Item', 'Store', 'Qty', 'Unit', 'Value', 'Reason', 'User'],
        ...wastage.map(m => { const i = itemById.get(m.itemId); return [m.date.slice(0, 10), m.refNo, i?.code, i?.name, storeName(m.store), -m.qty, i?.unit, (-m.qty * m.unitCost).toFixed(2), m.reason ?? '', m.user]; })]);
    } else {
      downloadCSV(`inkind-donations-${stamp}.csv`, [['Date', 'Ref', 'Donor', 'Phone', 'Receipt no', 'Item', 'Qty', 'Unit', 'Est. value'],
        ...donations.map(m => { const i = itemById.get(m.itemId); return [m.date.slice(0, 10), m.refNo, m.party ?? '', m.donorPhone ?? '', m.receiptNo ?? '', i?.name, m.qty, i?.unit, (m.qty * m.unitCost).toFixed(2)]; })]);
    }
    toast.success('Report exported');
  };

  return (
    <div className="section-panel inventory-main-panel shadow-sm">
      <div className="section-panel-header flex-wrap gap-3 py-4">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Reports">
          {REPORTS.map(r => (
            <button key={r.key} role="tab" aria-selected={report === r.key} onClick={() => setReport(r.key)}
              className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${report === r.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}>
              {r.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportReport}><Download className="h-4 w-4 mr-1.5" />Download</Button>
      </div>

      <div className="p-4 space-y-4">
        {report === 'valuation' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            <div>
              <h3 className="text-sm font-semibold">Stock value by category</h3>
              <p className="text-xs text-muted-foreground mb-3">Total {fmtMoney(totalValue)}</p>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={valuation} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={v => `₹${Math.round(v / 1000)}k`} fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="category" width={150} fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(v: number) => [fmtMoney(v), 'Value']}
                      contentStyle={{ borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <table className="w-full text-sm self-start">
              <thead className="bg-muted/40"><tr><th className={thCls}>Category</th><th className={`${thCls} text-right`}>Items</th><th className={`${thCls} text-right`}>Value</th><th className={`${thCls} text-right`}>Share</th></tr></thead>
              <tbody>
                {valuation.map(r => (
                  <tr key={r.category} className="border-t border-border">
                    <td className={tdCls}>{r.category}</td>
                    <td className={`${tdCls} text-right tabular-nums`}>{r.items}</td>
                    <td className={`${tdCls} text-right tabular-nums`}>{fmtMoney(r.value)}</td>
                    <td className={`${tdCls} text-right tabular-nums text-muted-foreground`}>{totalValue ? ((r.value / totalValue) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border font-semibold"><td className={tdCls}>Total</td><td className={`${tdCls} text-right`}>{valuation.reduce((s, r) => s + r.items, 0)}</td><td className={`${tdCls} text-right tabular-nums`}>{fmtMoney(totalValue)}</td><td className={`${tdCls} text-right`}>100%</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {report === 'consumption' && (
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr><th className={thCls}>Item</th><th className={`${thCls} text-right`}>Used</th><th className={`${thCls} text-right`}>Per day</th><th className={`${thCls} text-right`}>Cost</th><th className={thCls}>Mostly for</th></tr></thead>
            <tbody>
              {consumption.map(r => {
                const top = Object.entries(r.purposes).sort((a, b) => b[1] - a[1])[0];
                return (
                  <tr key={r.item.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => onOpenItem(r.item.id)}>
                    <td className={tdCls}><span className="font-medium">{r.item.name}</span></td>
                    <td className={`${tdCls} text-right tabular-nums`}>{fmtQty(r.qty)} {r.item.unit}</td>
                    <td className={`${tdCls} text-right tabular-nums text-muted-foreground`}>{fmtQty(r.qty / 30)}</td>
                    <td className={`${tdCls} text-right tabular-nums`}>{fmtMoney(r.value)}</td>
                    <td className={`${tdCls} text-xs text-muted-foreground`}>{top?.[0]}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-border font-semibold"><td className={tdCls} colSpan={3}>Total</td><td className={`${tdCls} text-right tabular-nums`}>{fmtMoney(consumption.reduce((s, r) => s + r.value, 0))}</td><td /></tr>
            </tbody>
          </table>
        )}

        {report === 'expiry' && (
          <>
            <p className="text-xs text-muted-foreground">Stock that has expired or will expire in the next 30 days. Fresh flowers, milk and leaves bought daily are not listed.</p>
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr><th className={thCls}>Item</th><th className={thCls}>Store</th><th className={thCls}>Expiry</th><th className={`${thCls} text-right`}>Quantity</th><th className={`${thCls} text-right`}>Value</th></tr></thead>
              <tbody>
                {expiry.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nothing expiring in the next 30 days.</td></tr>}
                {expiry.map(r => (
                  <tr key={`${r.item.id}-${r.batch.store}-${r.batch.batchNo}`} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => onOpenItem(r.item.id)}>
                    <td className={tdCls}><span className="font-medium">{r.item.name}</span></td>
                    <td className={`${tdCls} text-xs`}>{storeName(r.batch.store)}</td>
                    <td className={`${tdCls} font-semibold ${r.days < 0 ? 'text-destructive' : r.days <= EXPIRY_WARNING_DAYS ? 'text-amber-600 dark:text-amber-400' : ''}`}>{fmtDate(r.batch.expiryDate)} · {r.days < 0 ? `expired ${-r.days}d ago` : `${r.days}d left`}</td>
                    <td className={`${tdCls} text-right tabular-nums`}>{fmtQty(r.batch.qty)} {r.item.unit}</td>
                    <td className={`${tdCls} text-right tabular-nums`}>{fmtMoney(r.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {report === 'wastage' && (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-2 self-start">
              <h3 className="text-sm font-semibold">Why it was written off</h3>
              {wastageByReason.length === 0 && <p className="text-sm text-muted-foreground">Nothing written off.</p>}
              {wastageByReason.map(([reason, value]) => (
                <div key={reason} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm"><span>{reason}</span><span className="font-semibold tabular-nums">{fmtMoney(value)}</span></div>
              ))}
              <div className="flex justify-between px-3 pt-2 text-sm font-semibold"><span>Total</span><span className="tabular-nums">{fmtMoney(wastageByReason.reduce((s, [, v]) => s + v, 0))}</span></div>
            </div>
            <table className="w-full text-sm self-start">
              <thead className="bg-muted/40"><tr><th className={thCls}>Item</th><th className={`${thCls} text-right`}>Quantity</th><th className={`${thCls} text-right`}>Value</th><th className={`${thCls} text-right`}>Share of usage</th></tr></thead>
              <tbody>
                {wastageByItem.map(r => {
                  const used = consumption.find(c => c.item.id === r.item.id)?.qty ?? 0;
                  return (
                    <tr key={r.item.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => onOpenItem(r.item.id)}>
                      <td className={tdCls}>{r.item.name}</td>
                      <td className={`${tdCls} text-right tabular-nums`}>{fmtQty(r.qty)} {r.item.unit}</td>
                      <td className={`${tdCls} text-right tabular-nums`}>{fmtMoney(r.value)}</td>
                      <td className={`${tdCls} text-right tabular-nums text-muted-foreground`}>{used > 0 ? `${((r.qty / used) * 100).toFixed(1)}%` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {report === 'donations' && (
          <>
            <p className="text-xs text-muted-foreground">Items donated by devotees · {donations.length} donations worth about {fmtMoney(donations.reduce((s, m) => s + m.qty * m.unitCost, 0))}</p>
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr><th className={thCls}>Date</th><th className={thCls}>Donor</th><th className={thCls}>Item</th><th className={`${thCls} text-right`}>Quantity</th><th className={`${thCls} text-right`}>Approx. value</th><th className={thCls}>Receipt no.</th></tr></thead>
              <tbody>
                {donations.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No donated items recorded yet.</td></tr>}
                {donations.map(m => {
                  const i = itemById.get(m.itemId);
                  return (
                    <tr key={m.id} className="border-t border-border">
                      <td className={`${tdCls} text-xs whitespace-nowrap`}>{fmtDate(m.date)}</td>
                      <td className={tdCls}><p className="font-medium">{m.party}</p>{m.donorPhone && <p className="text-[11px] text-muted-foreground">{m.donorPhone}</p>}</td>
                      <td className={tdCls}>{i?.name}</td>
                      <td className={`${tdCls} text-right tabular-nums`}>{fmtQty(m.qty)} {i?.unit}</td>
                      <td className={`${tdCls} text-right tabular-nums`}>{fmtMoney(m.qty * m.unitCost)}</td>
                      <td className={`${tdCls} text-xs text-muted-foreground`}>{m.receiptNo ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;
