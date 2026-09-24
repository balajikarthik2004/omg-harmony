import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarRange, ClipboardList, Pencil, Plus, ShoppingCart, Sparkles, Trash2, UtensilsCrossed } from 'lucide-react';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { ISSUE_PURPOSES, STORES, SevaTemplate, StoreId, WHOLE_UNITS, addDays, daysBetween, fmtMoney, fmtQty, round3, storeName } from '@/lib/inventory';
import { toISODate } from '@/lib/utils';
import { ErrorNote, Field, ItemSelect, inputCls, parseNum, selectCls, tdCls, thCls, useInventoryRole } from './shared';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import type { POSuggestion } from './CreatePOModal';

interface PlanLine { key: string; templateId: string; count: string }
const newKey = () => Math.random().toString(36).slice(2);

const PlanningTab: React.FC<{
  onOrder: Record<string, number>;
  onIssueTemplate: (templateId: string, count: number) => void;
  onRaisePO: (lines: POSuggestion[]) => void;
}> = ({ onOrder, onIssueTemplate, onRaisePO }) => {
  const { state, summaries, actions } = useInventoryStore();
  const { isAdmin } = useInventoryRole();
  const [editing, setEditing] = useState<SevaTemplate | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('Navaratri Utsavam 2026');
  const [planDate, setPlanDate] = useState(toISODate(addDays(new Date(), 10)));
  const [includeRegular, setIncludeRegular] = useState(true);
  const [plan, setPlan] = useState<PlanLine[]>([
    { key: newKey(), templateId: 'tpl-abhishekam', count: '9' },
    { key: newKey(), templateId: 'tpl-homam', count: '3' },
    { key: newKey(), templateId: 'tpl-annadhanam', count: '4500' },
    { key: newKey(), templateId: 'tpl-pongal', count: '2000' },
  ]);

  const leadDays = Math.max(0, daysBetween(planDate, new Date()));

  const requirement = useMemo(() => {
    const need = new Map<string, number>();
    plan.forEach(p => {
      const t = state.templates.find(x => x.id === p.templateId);
      if (!t) return;
      const n = parseNum(p.count);
      t.lines.forEach(l => need.set(l.itemId, round3((need.get(l.itemId) ?? 0) + (l.qty * n) / t.basisQty)));
    });
    return [...need.entries()].flatMap(([itemId, planned]) => {
      const item = state.items.find(i => i.id === itemId);
      const s = summaries[itemId];
      if (!item || !s) return []; // template still lists an item that was removed
      const regular = includeRegular ? round3(s.avgDaily * leadDays) : 0;
      const available = round3(s.onHand + (onOrder[itemId] ?? 0));
      const total = round3(planned + regular);
      const rawShort = Math.max(0, round3(total - available));
      const shortfall = WHOLE_UNITS.has(item.unit) ? Math.ceil(rawShort) : Math.ceil(rawShort * 10) / 10;
      return [{ item, planned, regular, onHand: s.onHand, onOrder: onOrder[itemId] ?? 0, total, shortfall, cost: shortfall * item.unitCost }];
    }).filter(r => r.item).sort((a, b) => b.shortfall * b.item.unitCost - a.shortfall * a.item.unitCost);
  }, [plan, state.templates, state.items, summaries, onOrder, includeRegular, leadDays]);

  const shortItems = requirement.filter(r => r.shortfall > 0);
  const shortCost = shortItems.reduce((s, r) => s + r.cost, 0);
  const updatePlan = (key: string, patch: Partial<PlanLine>) => setPlan(prev => prev.map(p => (p.key === key ? { ...p, ...patch } : p)));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
      <section className="section-panel inventory-main-panel shadow-sm self-start">
        <div className="section-panel-header py-4">
          <h2 className="text-sm font-semibold flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> Seva templates</h2>
          <Button size="sm" variant="outline" onClick={() => setEditing('new')}><Plus className="h-4 w-4 mr-1" />New</Button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">The materials each seva or meal batch needs. Request everything a seva needs in one step; stock is released once approved.</p>
          {state.templates.map(t => {
            const cost = t.lines.reduce((s, l) => s + l.qty * (summaries[l.itemId]?.avgCost ?? 0), 0);
            return (
              <div key={t.id} className="rounded-xl border border-border bg-background p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm flex items-center gap-1.5">
                      {t.kind === 'Seva' ? <Sparkles className="h-3.5 w-3.5 text-amber-500" /> : <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />}{t.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">For {t.basisQty} {t.basisLabel} · approx. {fmtMoney(cost)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(t)} aria-label={`Edit ${t.name}`}><Pencil className="h-3.5 w-3.5" /></Button>
                    {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(t.id)} aria-label={`Delete ${t.name}`}><Trash2 className="h-3.5 w-3.5" /></Button>}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t.lines.map(l => { const i = state.items.find(x => x.id === l.itemId); return i ? `${i.name} ${fmtQty(l.qty)} ${i.unit}` : null; }).filter(Boolean).join(' · ')}
                </p>
                <Button size="sm" variant="secondary" className="w-full h-8" onClick={() => onIssueTemplate(t.id, t.basisQty)}>Issue for {t.basisQty} {t.basisLabel}</Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-panel inventory-main-panel shadow-sm">
        <div className="section-panel-header py-4">
          <h2 className="text-sm font-semibold flex items-center gap-2"><CalendarRange className="h-4 w-4 text-primary" /> Plan for a festival or event</h2>
        </div>
        <div className="p-4 space-y-5">
          <p className="text-sm text-muted-foreground">Add the sevas and meals you are planning. You will see straight away whether there is enough stock, and can order anything missing.</p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3">
            <Field label="Event name"><input className={inputCls} value={planName} onChange={e => setPlanName(e.target.value)} /></Field>
            <Field label="Event date" hint={`In ${leadDays} day${leadDays === 1 ? '' : 's'}`}><DatePicker value={planDate} minDate={new Date()} onChange={setPlanDate} /></Field>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr><th className={thCls}>Seva / meal</th><th className={`${thCls} w-40 text-right`}>How many</th><th className="w-10" /></tr></thead>
              <tbody>
                {plan.map(p => {
                  const t = state.templates.find(x => x.id === p.templateId);
                  return (
                    <tr key={p.key} className="border-t border-border">
                      <td className="px-3 py-2">
                        <ThemeSelect
                          value={p.templateId}
                          onChange={val => updatePlan(p.key, { templateId: val })}
                          options={[{ value: '', label: 'Select template' }, ...state.templates.map(x => ({ value: x.id, label: x.name }))]}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input type="number" min={0} className={`${inputCls} text-right`} value={p.count} onChange={e => updatePlan(p.key, { count: e.target.value })} aria-label="Planned quantity" />
                          <span className="text-xs text-muted-foreground w-16">{t?.basisLabel}</span>
                        </div>
                      </td>
                      <td className="px-2"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPlan(prev => prev.filter(x => x.key !== p.key))} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-border bg-muted/30">
              <Button variant="ghost" size="sm" onClick={() => setPlan(prev => [...prev, { key: newKey(), templateId: '', count: '1' }])}><Plus className="h-4 w-4 mr-1" /> Add another</Button>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={includeRegular} onChange={e => setIncludeRegular(e.target.checked)} className="accent-primary" />
                Also keep enough for normal daily use until the event
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className={thCls}>Item</th>
                  <th className={`${thCls} text-right`}>Needed</th>
                  <th className={`${thCls} text-right`}>Available</th>
                  <th className={`${thCls} text-right`}>Result</th>
                </tr>
              </thead>
              <tbody>
                {requirement.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Add a seva or meal above to see what is needed.</td></tr>}
                {requirement.map(r => (
                  <tr key={r.item.id} className={`border-t border-border ${r.shortfall > 0 ? 'bg-destructive/5' : ''}`}>
                    <td className={tdCls}>{r.item.name}</td>
                    <td className={`${tdCls} text-right tabular-nums`}>{fmtQty(r.total)} {r.item.unit}</td>
                    <td className={`${tdCls} text-right tabular-nums text-muted-foreground`} title={r.onOrder > 0 ? `${fmtQty(r.onHand)} in stock + ${fmtQty(r.onOrder)} ordered` : undefined}>{fmtQty(r.onHand + r.onOrder)} {r.item.unit}</td>
                    <td className={`${tdCls} text-right font-semibold whitespace-nowrap ${r.shortfall > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>{r.shortfall > 0 ? `Short by ${fmtQty(r.shortfall)} ${r.item.unit}` : 'Enough'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-sm">
              <span className="font-semibold">{planName || 'This event'}</span>: {shortItems.length ? <><span className="text-destructive font-semibold">{shortItems.length} item{shortItems.length === 1 ? '' : 's'} to order</span> · about {fmtMoney(shortCost)}</> : <span className="text-emerald-600 dark:text-emerald-400 font-semibold">everything is available</span>}
            </p>
            <Button disabled={!shortItems.length} onClick={() => onRaisePO(shortItems.map(r => ({ itemId: r.item.id, qty: r.shortfall })))}>
              <ShoppingCart className="h-4 w-4 mr-1.5" />Order missing items
            </Button>
          </div>
        </div>
      </section>

      <TemplateEditor template={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { actions.deleteTemplate(deleteId); toast.success('Template deleted'); } }}
        title="Delete template" message="Stock already issued is not affected. The template just won't be available any more." />
    </div>
  );
};

const TemplateEditor: React.FC<{ template: SevaTemplate | 'new' | null; onClose: () => void }> = ({ template, onClose }) => {
  const { state, summaries, actions } = useInventoryStore();
  const [form, setForm] = useState<Omit<SevaTemplate, 'id'> & { id?: string }>({ name: '', kind: 'Seva', basisQty: 1, basisLabel: 'seva', purpose: 'Daily Pooja', store: 'SANCTUM', lines: [] });
  const [lines, setLines] = useState<{ key: string; itemId: string; qty: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!template) return;
    setError(null);
    const t = template === 'new' ? { name: '', kind: 'Seva' as const, basisQty: 1, basisLabel: 'seva', purpose: 'Daily Pooja', store: 'SANCTUM' as StoreId, lines: [] } : template;
    setForm(t);
    setLines(t.lines.length ? t.lines.map(l => ({ key: newKey(), itemId: l.itemId, qty: String(l.qty) })) : [{ key: newKey(), itemId: '', qty: '' }]);
  }, [template]);

  const save = () => {
    try {
      actions.saveTemplate({ ...form, name: form.name.trim(), lines: lines.filter(l => l.itemId || l.qty).map(l => ({ itemId: l.itemId, qty: parseNum(l.qty) })) });
      toast.success('Template saved');
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal open={!!template} onClose={onClose} title={template === 'new' ? 'New Seva Template' : 'Edit Seva Template'} containerClassName="max-w-2xl">
      <div className="inventory-form-shell space-y-4">
        <ErrorNote message={error} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name" required><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rudrabhishekam" /></Field>
          <Field label="Type">
            <ThemeSelect value={form.kind} onChange={val => setForm(f => ({ ...f, kind: val as SevaTemplate['kind'] }))} options={['Seva', 'Annadhanam', 'Prasadam']} />
          </Field>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Quantities are for" required><input type="number" min={1} className={inputCls} value={form.basisQty} onChange={e => setForm(f => ({ ...f, basisQty: parseNum(e.target.value) }))} /></Field>
          <Field label="Unit (seva, meals...)"><input className={inputCls} value={form.basisLabel} onChange={e => setForm(f => ({ ...f, basisLabel: e.target.value }))} placeholder="seva / meals" /></Field>
          <Field label="Issue purpose">
            <ThemeSelect value={form.purpose} onChange={val => setForm(f => ({ ...f, purpose: val }))} options={ISSUE_PURPOSES} />
          </Field>
          <Field label="Issue from">
            <ThemeSelect value={form.store} onChange={val => setForm(f => ({ ...f, store: val as StoreId }))} options={STORES.map(s => ({ value: s.id, label: s.short }))} />
          </Field>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className={thCls}>Material</th><th className={`${thCls} w-36 text-right`}>Quantity</th><th className="w-10" /></tr></thead>
            <tbody>
              {lines.map(l => {
                const item = state.items.find(i => i.id === l.itemId);
                return (
                  <tr key={l.key} className="border-t border-border">
                    <td className="px-3 py-2"><ItemSelect items={state.items.filter(i => i.active)} summaries={summaries} value={l.itemId} onChange={id => setLines(prev => prev.map(x => (x.key === l.key ? { ...x, itemId: id } : x)))} /></td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <input type="number" min={0} step="any" className={`${inputCls} text-right`} value={l.qty} onChange={e => setLines(prev => prev.map(x => (x.key === l.key ? { ...x, qty: e.target.value } : x)))} aria-label="Quantity" />
                        <span className="text-xs text-muted-foreground w-10">{item?.unit}</span>
                      </div>
                    </td>
                    <td className="px-2"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLines(prev => prev.filter(x => x.key !== l.key))} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-border bg-muted/30">
            <Button variant="ghost" size="sm" onClick={() => setLines(prev => [...prev, { key: newKey(), itemId: '', qty: '' }])}><Plus className="h-4 w-4 mr-1" /> Add material</Button>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save template</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PlanningTab;
