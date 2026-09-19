import React from 'react';
import { AlertCircle, BadgeCheck, IndianRupee, Users } from 'lucide-react';

interface MembershipStatsProps {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
  revenue: number;
}

export const MembershipStats: React.FC<MembershipStatsProps> = ({
  total,
  active,
  expiringSoon,
  expired,
  revenue,
}) => {
  const cards = [
    {
      key: 'total',
      label: 'Total Members',
      value: String(total),
      icon: Users,
      tone: 'text-foreground',
      labelTone: 'text-muted-foreground',
      panel: '',
      halo: 'bg-muted/30',
    },
    {
      key: 'active',
      label: 'Active',
      value: String(active),
      icon: BadgeCheck,
      tone: 'text-emerald-500',
      labelTone: 'text-emerald-500',
      panel: 'border-emerald-500/20 bg-emerald-500/5',
      halo: 'bg-emerald-500/10',
    },
    {
      key: 'expiring',
      label: 'Expiring in 30 Days',
      value: String(expiringSoon),
      icon: AlertCircle,
      tone: 'text-amber-500',
      labelTone: 'text-amber-500',
      panel: 'border-amber-500/20 bg-amber-500/5',
      halo: 'bg-amber-500/10',
      footnote: expired > 0 ? `${expired} already expired` : undefined,
    },
    {
      key: 'revenue',
      label: 'Membership Revenue',
      value: `₹${revenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      tone: 'text-primary',
      labelTone: 'text-primary',
      panel: 'border-primary/20 bg-primary/5',
      halo: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
      {cards.map(card => (
        <div
          key={card.key}
          className={`stat-card membership-stat-card flex flex-col justify-between group overflow-hidden relative ${card.panel}`}
        >
          <div
            className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${card.halo} group-hover:scale-110 transition-transform`}
          />
          <p
            className={`text-[11px] uppercase tracking-widest font-bold flex items-center gap-1.5 ${card.labelTone}`}
          >
            <card.icon className="w-3.5 h-3.5" />
            {card.label}
          </p>
          <p
            className={`font-display font-bold mt-2 relative z-10 ${card.tone} ${
              card.key === 'revenue' ? 'text-2xl' : 'text-3xl'
            }`}
          >
            {card.value}
          </p>
          {card.footnote && (
            <p className="text-[11px] font-semibold text-rose-500 mt-1 relative z-10">{card.footnote}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default MembershipStats;
