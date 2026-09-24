import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle, ArrowRight, BrainCircuit, CheckCircle2, Clock, Copy, IndianRupee, PackageSearch, ShieldCheck, Split, Star, Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { formatPODate, nextPONumber, procurementActions, useProcurementStore } from '@/hooks/useProcurementStore';
import { STORES, StoreId, addDays, fmtDate, fmtMoney, fmtQty } from '@/lib/inventory';
import { DEMAND_OUTLOOKS, DemandKey, runProcurementAgent, rfqDraft, type AgentResult } from '@/lib/procurementAgent';
import { cn, toISODate } from '@/lib/utils';
import { ErrorNote, Field, ItemSelect, StoreBadge, inputCls, parseNum, useInventoryRole } from '@/components/inventory/shared';

const BUDGET_KEY = 'omg_procurement_budget';
const SPLIT = '__split__';

const readBudget = () => {
  try { return Number(localStorage.getItem(BUDGET_KEY)) || 250000; } catch { return 250000; }
};

const Stat: React.FC<{ label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: string }> = ({ label, value, sub, tone }) => (
  <div className="rounded-xl border border-border bg-background px-3 py-2.5">
    <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={cn('text-lg font-bold tabular-nums mt-0.5', tone)}>{value}</p>
    {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
  </div>
);

/**
 * Raises a purchase request for one item: the agent shortlists the temple's own suppliers from
 * purchase history, the user picks one, and a pending purchase order goes to Inventory for approval.
 */
const ProcurementAgentConsole: React.FC = () => {
  const navigate = useNavigate();
  const { state, summaries } = useInventoryStore();
  const { items: pos } = useProcurementStore();
  const { userName } = useInventoryRole();
  const activeItems = useMemo(() => state.items.filter(i => i.active), [state.items]);

  const [itemId, setItemId] = useState('');
  const [qty, setQty] = useState('');
  const [requiredBy, setRequiredBy] = useState(toISODate(addDays(new Date(), 5)));
  const [store, setStore] = useState<StoreId>('MAIN');
  const [demand, setDemand] = useState<DemandKey>('normal');
  const [reason, setReason] = useState('');
  const [budget, setBudget] = useState(readBudget);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [choice, setChoice] = useState('');
  const [override, setOverride] = useState('');
  const [error, setError] = useState<string | null>(null);

  const item = state.items.find(i => i.id === itemId);
  const factor = DEMAND_OUTLOOKS.find(d => d.key === demand)?.factor ?? 1;

  useEffect(() => { try { localStorage.setItem(BUDGET_KEY, String(budget)); } catch { /* memory only */ } }, [budget]);
  // Any change to the request makes the last evaluation stale.
  useEffect(() => { setResult(null); setChoice(''); setOverride(''); }, [itemId, qty, requiredBy, store, demand, budget]);

  const pickItem = (id: string) => {
    setItemId(id);
    const it = state.items.find(i => i.id === id);
    if (!it) return;
    setStore(it.defaultStore);
    setRequiredBy(toISODate(addDays(new Date(), it.leadTimeDays + 1)));
    // Pre-fill with what tops stock up to the maximum; the agent re-checks it on every run.
    try {
      const r = runProcurementAgent({ itemId: id, qty: 1, requiredBy: toISODate(addDays(new Date(), it.leadTimeDays + 1)), store: it.defaultStore, demandFactor: factor, budget, state, summaries, pos });
      setQty(String(r.suggestedQty || ''));
    } catch { setQty(''); }
  };

  const run = () => {
    try {
      setError(null);
      const r = runProcurementAgent({ itemId, qty: parseNum(qty), requiredBy, store, demandFactor: factor, budget, state, summaries, pos });
      setResult(r);
      setChoice(r.strategy === 'split' ? SPLIT : r.recommended?.name ?? '');
      setOverride('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const recommendedChoice = result ? (result.strategy === 'split' ? SPLIT : result.recommended?.name ?? '') : '';
  const chosen = result?.vendors.find(v => v.name === choice);
  const chosenTotal = choice === SPLIT ? result?.split?.total ?? 0 : chosen?.total ?? 0;
  const draftVendor = choice === SPLIT ? result?.split?.cheap.name ?? '' : choice;
  const draft = result && draftVendor ? rfqDraft(result, draftVendor, result.qty, userName) : null;

  const createPO = () => {
    if (!result) return;
    try {
      setError(null);
      if (!choice) throw new Error('Select a supplier.');
      if (choice !== recommendedChoice && !override.trim()) throw new Error('You chose a different supplier from the recommendation. Give the reason for the approver.');
      const u = result.item.unit;
      const orders = choice === SPLIT && result.split
        ? [{ v: result.split.fast, qty: result.split.urgentQty, tag: 'urgent part of split order' }, { v: result.split.cheap, qty: result.split.balanceQty, tag: 'balance of split order' }]
        : [{ v: chosen!, qty: result.qty, tag: '' }];
      const created: { id: string; poNumber: string }[] = [];
      let all = pos;
      for (const o of orders) {
        const poNumber = nextPONumber(all);
        const notes = [
          `AI agent: ${o.v.name} ranked #${o.v.rank} (score ${o.v.score})${o.tag ? `, ${o.tag}` : ''}.`,
          result.reason,
          choice !== recommendedChoice && `Chosen over the recommendation: ${override.trim()}`,
          o.v.rateBasis !== 'past receipts' && 'Rate is an estimate - confirm the quotation before approving.',
          reason.trim() && `Reason: ${reason.trim()}`,
        ].filter(Boolean).join(' ');
        const rec = procurementActions.add({
          id: '', poNumber, vendor: o.v.name, date: formatPODate(), status: 'Pending',
          amount: Math.round(o.qty * o.v.rate),
          items: [{ name: result.item.name, quantity: o.qty, price: o.v.rate, itemId: result.item.id, unit: u, store: result.store }],
          submittedBy: userName, submittedByName: userName, approvedBy: null, approvedDate: null, rejectedBy: null, rejectedDate: null,
          rejectionReason: '', source: 'agent', expectedDate: o.v.eta, notes,
        });
        all = [rec, ...all];
        created.push({ id: rec.id, poNumber });
      }
      toast.success(`${created.map(c => c.poNumber).join(' & ')} sent for approval`, { description: `${fmtQty(result.qty)} ${u} ${result.item.name} · ${fmtMoney(chosenTotal)}` });
      navigate(`/inventory?tab=orders&review=${created[0].id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copyDraft = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
      toast.success('Quotation request copied', { description: 'Paste it into email or WhatsApp to send.' });
    } catch {
      toast.error('Could not copy - select the text and copy it manually.');
    }
  };

  const s = item ? summaries[item.id] : undefined;

  return (
    <div className="section-panel border-l-4 border-l-primary overflow-hidden">
      <div className="section-panel-header bg-gradient-to-r from-primary/10 via-background to-primary/5 border-b border-border/60 flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-primary" /> AI Procurement Agent</h2>
          <p className="text-xs text-muted-foreground mt-1">Pick an item. The agent reads its stock and usage, ranks your suppliers on past rates, delivery and reliability, and raises a purchase order for approval.</p>
        </div>
        <Button onClick={run} disabled={!itemId}><ShieldCheck className="w-4 h-4 mr-2" />Run AI evaluation</Button>
      </div>

      <div className="p-5 space-y-5">
        <ErrorNote message={error} />

        {/* 1. The request */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <Field label="Item" required className="md:col-span-2">
            <ItemSelect items={activeItems} summaries={summaries} value={itemId} onChange={pickItem} placeholder="Choose an inventory item" />
          </Field>
          <Field label={`Quantity${item ? ` (${item.unit})` : ''}`} required hint={result ? `Suggested: ${fmtQty(result.suggestedQty)} ${result.item.unit}` : undefined}>
            <input type="number" min={0} step="any" className={inputCls} value={qty} onChange={e => setQty(e.target.value)} disabled={!item} />
          </Field>
          <Field label="Needed by" required>
            <DatePicker value={requiredBy} onChange={setRequiredBy} />
          </Field>
          <Field label="Deliver to" required>
            <ThemeSelect value={store} onChange={v => setStore(v as StoreId)} options={STORES.map(x => ({ value: x.id, label: x.name }))} />
          </Field>
          <Field label="Demand outlook" hint="Scales the last 30 days of usage.">
            <ThemeSelect value={demand} onChange={v => setDemand(v as DemandKey)} options={DEMAND_OUTLOOKS.map(d => ({ value: d.key, label: d.label }))} />
          </Field>
          <Field label="Monthly purchase budget (₹)">
            <input type="number" min={0} className={inputCls} value={budget} onChange={e => setBudget(parseNum(e.target.value))} />
          </Field>
          <Field label="Reason (optional)">
            <input className={inputCls} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Navarathri annadhanam" />
          </Field>
        </div>

        {item && s && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{item.code} · {item.name}</span>
            <span>In stock {fmtQty(s.onHand)} {item.unit}</span>
            <span>Uses {fmtQty(Math.round(s.avgDaily * 100) / 100)} {item.unit}/day</span>
            <span>Reorder at {fmtQty(item.reorderLevel)} · max {fmtQty(item.maxStock)}</span>
            <span>Usual supplier {item.supplier || '-'} · {item.leadTimeDays} days lead</span>
          </div>
        )}

        {!result && (
          <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            <PackageSearch className="h-7 w-7 mx-auto mb-2 opacity-40" />
            {itemId ? 'Check the quantity and date, then run the AI evaluation.' : 'Choose an item to start.'}
          </div>
        )}

        {result && (
          <>
            {/* 2. The need */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Expected use / day" value={`${fmtQty(result.adjustedDaily)} ${result.item.unit}`}
                sub={result.demandFactor !== 1 ? `${fmtQty(Math.round(result.avgDaily * 100) / 100)} normally × ${result.demandFactor}` : 'Last 30 days'} />
              <Stat label="Stock lasts until" value={result.stockOutDate ? fmtDate(result.stockOutDate) : 'No recent use'}
                tone={result.urgency === 'critical' ? 'text-red-600 dark:text-red-400' : result.urgency === 'high' ? 'text-amber-600 dark:text-amber-400' : ''}
                sub={`${fmtQty(result.available)} ${result.item.unit} usable${result.incoming ? ` · ${fmtQty(result.incoming)} on order` : ''}`} />
              <Stat label="Selected order value" value={fmtMoney(chosenTotal)} sub={`Needs ${result.approval.role.toLowerCase()} sign-off`} />
              <Stat label="Budget after this order" value={fmtMoney(result.budget - result.monthSpend - chosenTotal)}
                tone={result.budget - result.monthSpend - chosenTotal < 0 ? 'text-red-600 dark:text-red-400' : ''}
                sub={`${fmtMoney(result.monthSpend)} already approved this month`} />
            </div>

            {result.warnings.length > 0 && (
              <ul className="space-y-1">
                {result.warnings.map(wn => (
                  <li key={wn} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {wn}
                  </li>
                ))}
              </ul>
            )}

            {/* 3. The recommendation */}
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 flex items-start gap-3">
              <BrainCircuit className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Recommendation · {result.strategy === 'split' ? 'split order' : result.strategy.replace('_', ' ')}
                  {result.urgency !== 'normal' && <span className="ml-2 rounded-full bg-red-600 text-white px-2 py-0.5 normal-case tracking-normal">{result.urgency === 'critical' ? 'Critical' : 'Urgent'}</span>}
                </p>
                <p className="text-sm mt-1">{result.reason}</p>
              </div>
            </div>

            {/* 4. Choose a supplier */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Choose a supplier</p>
              <div className="space-y-2" role="radiogroup" aria-label="Supplier">
                {result.split && (
                  <button type="button" role="radio" aria-checked={choice === SPLIT} onClick={() => setChoice(SPLIT)}
                    className={cn('w-full text-left rounded-xl border p-3 transition-all', choice === SPLIT ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/40')}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold flex items-center gap-2"><Split className="h-4 w-4 text-primary" />Split order
                        {recommendedChoice === SPLIT && <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold"><Star className="h-3 w-3" />Recommended</span>}
                      </p>
                      <span className="font-bold tabular-nums">{fmtMoney(result.split.total)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fmtQty(result.split.urgentQty)} {result.item.unit} from {result.split.fast.name} by {fmtDate(result.split.fast.eta)} + {fmtQty(result.split.balanceQty)} {result.item.unit} from {result.split.cheap.name} by {fmtDate(result.split.cheap.eta)} · creates two orders
                    </p>
                  </button>
                )}
                {result.vendors.map(v => {
                  const active = choice === v.name;
                  return (
                    <button key={v.name} type="button" role="radio" aria-checked={active} onClick={() => setChoice(v.name)}
                      className={cn('w-full text-left rounded-xl border p-3 transition-all', active ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/40')}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground tabular-nums">#{v.rank}</span> {v.name}
                            {recommendedChoice === v.name && <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold"><Star className="h-3 w-3" />Recommended</span>}
                            <span className="text-[10.5px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5">{v.source}</span>
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{fmtMoney(v.rate)}/{result.item.unit}{v.rateBasis !== 'past receipts' && ' (estimate)'}</span>
                            <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{fmtDate(v.eta)} · {v.leadDays} days ({v.leadBasis})</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{v.reliabilityBasis}</span>
                            {v.lastSupplied && <span>Last supplied {fmtDate(v.lastSupplied)}</span>}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {v.pros.map(p => <span key={p} className="rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 text-[10.5px] font-medium">{p}</span>)}
                            {v.cons.map(c => <span key={c} className="rounded-md border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.5 text-[10.5px] font-medium">{c}</span>)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold tabular-nums">{fmtMoney(v.total)}</p>
                          <div className="mt-1 flex items-center justify-end gap-1.5">
                            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${v.score}%` }} /></div>
                            <span className="text-[11px] tabular-nums text-muted-foreground">{v.score}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {choice && choice !== recommendedChoice && (
              <Field label="Why this supplier instead of the recommendation?" required hint="Shown to the approver on the purchase order.">
                <input className={inputCls} value={override} onChange={e => setOverride(e.target.value)} placeholder="e.g. Better quality last time; recommended supplier out of stock" />
              </Field>
            )}

            {draft && (
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quotation request draft · {draftVendor}</p>
                  <Button variant="ghost" size="sm" className="h-7" onClick={copyDraft}><Copy className="h-3.5 w-3.5 mr-1" />Copy</Button>
                </div>
                <p className="text-xs font-semibold">{draft.subject}</p>
                <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap font-sans">{draft.body}</pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
              <div className="text-sm">
                <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {choice === SPLIT ? 'Two purchase orders' : choice ? `Purchase order to ${choice}` : 'Select a supplier'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                  {fmtQty(result.qty)} {result.item.unit} {result.item.name} · {fmtMoney(chosenTotal)} · deliver to <StoreBadge store={result.store} /> · goes to Inventory → Purchase Orders for approval
                </p>
              </div>
              <Button onClick={createPO} disabled={!choice} className="inventory-cta">
                Create PO &amp; send for approval <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProcurementAgentConsole;
