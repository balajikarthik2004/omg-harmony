import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ReceiptText, Scale } from 'lucide-react';
import { formatRupees, type LedgerTotals } from '@/lib/finance';

interface FinanceStatsProps {
  totals: LedgerTotals;
}

export const FinanceStats: React.FC<FinanceStatsProps> = ({ totals }) => {
  const inSurplus = totals.net >= 0;

  const cards = [
    {
      key: 'income',
      label: 'Total Income',
      value: formatRupees(totals.income),
      icon: ArrowUpRight,
      tone: 'text-emerald-500',
      panel: 'border-emerald-500/20 bg-emerald-500/5',
      halo: 'bg-emerald-500/10',
    },
    {
      key: 'expense',
      label: 'Total Expense',
      value: formatRupees(totals.expense),
      icon: ArrowDownLeft,
      tone: 'text-destructive',
      panel: 'border-destructive/20 bg-destructive/5',
      halo: 'bg-destructive/10',
    },
    {
      key: 'net',
      label: inSurplus ? 'Net Surplus' : 'Net Deficit',
      value: formatRupees(Math.abs(totals.net)),
      icon: Scale,
      tone: inSurplus ? 'text-emerald-500' : 'text-destructive',
      panel: inSurplus ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-destructive/20 bg-destructive/5',
      halo: inSurplus ? 'bg-emerald-500/10' : 'bg-destructive/10',
    },
    {
      key: 'entries',
      label: 'Entries Posted',
      value: String(totals.entryCount),
      icon: ReceiptText,
      tone: 'text-foreground',
      panel: '',
      halo: 'bg-muted/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
      {cards.map(card => (
        <div
          key={card.key}
          className={`stat-card finance-stat-card flex flex-col justify-between group overflow-hidden relative ${card.panel}`}
        >
          <div
            className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${card.halo} group-hover:scale-110 transition-transform`}
          />
          <p
            className={`text-[11px] uppercase tracking-widest font-bold flex items-center gap-1.5 ${
              card.key === 'entries' ? 'text-muted-foreground' : card.tone
            }`}
          >
            <card.icon className="w-3.5 h-3.5" />
            {card.label}
          </p>
          <p
            className={`font-display font-bold mt-2 relative z-10 ${card.tone} ${
              card.key === 'entries' ? 'text-3xl' : 'text-2xl'
            }`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FinanceStats;
