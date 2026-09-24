import React from 'react';
import { AlertOctagon, AlertTriangle, BrainCircuit, CheckCircle2, Info, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fmtDate, fmtDateTime, fmtMoney } from '@/lib/inventory';
import type { Finding, POEvaluation, Severity } from '@/lib/poEvaluation';
import { cn } from '@/lib/utils';

export const SEVERITY_STYLE: Record<Severity, { cls: string; Icon: React.ElementType }> = {
  risk: { cls: 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-900', Icon: AlertOctagon },
  warn: { cls: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900', Icon: AlertTriangle },
  info: { cls: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/40 dark:border-sky-900', Icon: Info },
  good: { cls: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900', Icon: CheckCircle2 },
};

const VERDICT = {
  approve: { label: 'Recommended to approve', cls: 'bg-emerald-600 text-white' },
  approve_with_changes: { label: 'Approve with changes', cls: 'bg-amber-500 text-white' },
  review: { label: 'Needs review', cls: 'bg-red-600 text-white' },
} as const;

export const FindingChip: React.FC<{ finding: Finding }> = ({ finding }) => {
  const { cls, Icon } = SEVERITY_STYLE[finding.severity];
  return (
    <span title={finding.detail} className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold whitespace-nowrap', cls)}>
      <Icon className="h-3 w-3" aria-hidden /> {finding.title}
    </span>
  );
};

const Tile: React.FC<{ label: string; value: React.ReactNode; sub?: React.ReactNode }> = ({ label, value, sub }) => (
  <div className="rounded-lg border border-border bg-background px-3 py-2">
    <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm font-bold mt-0.5">{value}</p>
    {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
  </div>
);

const POEvaluationPanel: React.FC<{
  evaluation: POEvaluation | null;
  lineNames: Record<string, string>;
  onRun: () => void;
  onApply: () => void;
}> = ({ evaluation, lineNames, onRun, onApply }) => {
  if (!evaluation) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
        <div className="flex items-start gap-3">
          <BrainCircuit className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">AI evaluation</p>
            <p className="text-xs text-muted-foreground">Checks each line against current stock, 30-day usage, lead time, other open orders, shelf life and the rates paid on past receipts.</p>
          </div>
        </div>
        <Button onClick={onRun} className="shrink-0"><Sparkles className="h-4 w-4 mr-1.5" />Run AI evaluation</Button>
      </div>
    );
  }

  const e = evaluation;
  const ring = e.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : e.score >= 55 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
  const issues = e.lines.flatMap(l => l.findings.filter(f => f.severity === 'risk' || f.severity === 'warn').map(f => ({ ...f, line: lineNames[l.key] ?? '' })));
  const saving = e.total - e.suggestedTotal;
  const onTime = e.supplier.deliveries ? ` · ${e.supplier.onTime} of ${e.supplier.deliveries} orders on time` : '';

  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-border/70">
        <p className="text-sm font-semibold flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-primary" /> AI evaluation</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Updates as you edit · {fmtDateTime(e.generatedAt)}</span>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onRun} aria-label="Re-run evaluation"><RefreshCw className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className={cn('relative h-16 w-16 rounded-full border-4 flex items-center justify-center', ring, 'border-current')}>
              <span className="text-xl font-extrabold tabular-nums text-foreground">{e.score}</span>
            </div>
            <div>
              <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-bold', VERDICT[e.verdict].cls)}>{VERDICT[e.verdict].label}</span>
              <p className="text-[11px] text-muted-foreground mt-1">Score out of 100</p>
            </div>
          </div>
          <p className="text-sm font-medium flex-1">{e.headline}</p>
          {e.changes > 0 && (
            <Button variant="outline" onClick={onApply} className="shrink-0 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
              <Wand2 className="h-4 w-4 mr-1.5" />Apply {e.changes} suggestion{e.changes > 1 ? 's' : ''}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Tile label="Urgency" value={e.urgency === 'critical' ? <span className="text-red-600 dark:text-red-400">Critical</span> : e.urgency === 'high' ? <span className="text-amber-600 dark:text-amber-400">High</span> : 'Normal'}
            sub={e.urgency === 'critical' ? 'Stock runs out before delivery' : e.urgency === 'high' ? 'Little stock left' : 'Enough stock until delivery'} />
          <Tile label="Order value" value={fmtMoney(e.total)} sub={saving > 0.5 ? `${fmtMoney(e.suggestedTotal)} with suggestions` : 'No savings found'} />
          <Tile label="Sign-off" value={e.approval.role} sub={`This month: ${fmtMoney(e.monthSpend)} approved`} />
          <Tile label="Supplier" value={e.supplier.name || '-'}
            sub={e.supplier.receipts ? `${e.supplier.receipts} goods receipts · last ${fmtDate(e.supplier.lastReceipt)}${onTime}` : 'New supplier - no past receipts'} />
        </div>

        {issues.length > 0 ? (
          <ul className="space-y-1.5">
            {issues.map((f, i) => {
              const { cls, Icon } = SEVERITY_STYLE[f.severity];
              return (
                <li key={i} className={cn('flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs', cls)}>
                  <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span><span className="font-semibold">{f.line}: {f.title}.</span> <span className="opacity-90">{f.detail}</span></span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" />No problems found on any line.</p>
        )}
        <p className="text-[10.5px] text-muted-foreground">Advisory only. Figures come from this temple's stock ledger and purchase history; the decision stays with the approver.</p>
      </div>
    </div>
  );
};

export default POEvaluationPanel;
