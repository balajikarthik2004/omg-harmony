import React from 'react';
import { AlertCircle, Building, Gem, ShieldCheck } from 'lucide-react';

interface AssetsStatsProps {
  total: number;
  inService: number;
  maintenance: number;
  totalValue: number;
}

const cards = [
  {
    key: 'total',
    label: 'Total Assets',
    icon: Building,
    tone: 'text-foreground',
    panel: '',
    halo: 'bg-muted/30',
  },
  {
    key: 'inService',
    label: 'In Service',
    icon: ShieldCheck,
    tone: 'text-emerald-500',
    panel: 'border-emerald-500/20 bg-emerald-500/5',
    halo: 'bg-emerald-500/10',
  },
  {
    key: 'maintenance',
    label: 'Need Maintenance',
    icon: AlertCircle,
    tone: 'text-destructive',
    panel: 'border-destructive/20 bg-destructive/5',
    halo: 'bg-destructive/10',
  },
  {
    key: 'totalValue',
    label: 'Registry Value',
    icon: Gem,
    tone: 'text-blue-500',
    panel: 'border-blue-500/20 bg-blue-500/5',
    halo: 'bg-blue-500/10',
  },
] as const;

export const AssetsStats: React.FC<AssetsStatsProps> = ({
  total,
  inService,
  maintenance,
  totalValue,
}) => {
  const values: Record<(typeof cards)[number]['key'], string> = {
    total: String(total),
    inService: String(inService),
    maintenance: String(maintenance),
    totalValue: `₹${totalValue.toLocaleString('en-IN')}`,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
      {cards.map(card => (
        <div
          key={card.key}
          className={`stat-card assets-stat-card flex flex-col justify-between group overflow-hidden relative ${card.panel}`}
        >
          <div
            className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${card.halo} group-hover:scale-110 transition-transform`}
          />
          <p
            className={`text-[11px] uppercase tracking-widest font-bold flex items-center gap-1.5 ${
              card.key === 'total' ? 'text-muted-foreground' : card.tone
            }`}
          >
            <card.icon className="w-3.5 h-3.5" />
            {card.label}
          </p>
          <p
            className={`font-display font-bold mt-2 relative z-10 ${card.tone} ${
              card.key === 'totalValue' ? 'text-2xl' : 'text-3xl'
            }`}
          >
            {values[card.key]}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AssetsStats;
