import React from 'react';
import { BadgeCheck, Calendar, Infinity as InfinityIcon, Pencil, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDateDDMMYYYY } from '@/lib/utils';
import {
  MEMBERSHIP_TYPES,
  STATUS_TONE,
  daysUntilExpiry,
  getDurationLabel,
  getMembershipStatus,
  type MembershipStatus,
} from '@/lib/membership';
import type { Membership } from '@/data/mockData';

export type StatusFilter = 'All' | MembershipStatus;

const STATUS_FILTERS: StatusFilter[] = ['All', 'Active', 'Expiring Soon', 'Expired'];

interface MembershipTableProps {
  items: Membership[];
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  onEdit: (item: Membership) => void;
  onRenew: (item: Membership) => void;
  onDelete: (id: string) => void;
  canWrite: boolean;
}

const expiryHint = (member: Membership) => {
  const days = daysUntilExpiry(member);
  if (days === null) return null;
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'Expires today';
  return `in ${days} days`;
};

export const MembershipTable: React.FC<MembershipTableProps> = ({
  items,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  onEdit,
  onRenew,
  onDelete,
  canWrite,
}) => (
  <div className="section-panel membership-main-panel shadow-sm">
    <div className="section-panel-header membership-main-header flex-wrap gap-3">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <BadgeCheck className="w-4 h-4 text-primary" />
        Membership Register
      </h2>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search name, number, phone or email..."
            className="membership-search-input w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background/80 text-sm transition-all shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none hover:border-border"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => onTypeFilterChange(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background/80 px-3 text-sm font-medium shadow-sm outline-none transition-all hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="All">All categories</option>
          {MEMBERSHIP_TYPES.map(type => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-2">
      {STATUS_FILTERS.map(status => (
        <button
          key={status}
          onClick={() => onStatusFilterChange(status)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all',
            statusFilter === status
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground'
          )}
        >
          {status}
        </button>
      ))}
    </div>

    <div className="table-container border-0 rounded-none shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Member</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Category</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Joined</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Valid Till</th>
              <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Fee Paid</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Status</th>
              {canWrite && (
                <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-background">
            {items.map(member => {
              const status = getMembershipStatus(member);
              const hint = expiryHint(member);
              const renewable = status === 'Expiring Soon' || status === 'Expired';

              return (
                <tr
                  key={member.id}
                  className="membership-row border-b border-border hover:bg-muted/30 transition-colors group"
                >
                  <td className="p-4">
                    <p className="font-bold text-foreground">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {member.membershipNo} · {member.phone}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-accent text-[11px] font-bold tracking-wider uppercase italic">
                      {member.membershipType}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground font-medium text-[11px] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 opacity-50" />
                      {formatDateDDMMYYYY(member.startDate)}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {member.expiryDate ? (
                      <>
                        <p className="font-semibold text-xs text-foreground/80">
                          {formatDateDDMMYYYY(member.expiryDate)}
                        </p>
                        {hint && (
                          <p
                            className={cn(
                              'text-[11px] font-semibold mt-0.5',
                              status === 'Expired' ? 'text-rose-500' : 'text-muted-foreground'
                            )}
                          >
                            {hint}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-xs text-foreground/80 inline-flex items-center gap-1.5">
                          <InfinityIcon className="w-3.5 h-3.5 text-secondary" />
                          {member.membershipType}
                        </p>
                        <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                          {getDurationLabel(member.membershipType)}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="p-4 text-right font-semibold text-foreground whitespace-nowrap">
                    ₹{Number(member.fee || 0).toLocaleString('en-IN')}
                    <span className="block text-[11px] font-medium text-muted-foreground">
                      {member.paymentMode}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[11px] font-bold',
                        STATUS_TONE[status]
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {status}
                    </span>
                  </td>
                  {canWrite && (
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex gap-1.5 justify-end">
                        {renewable && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRenew(member)}
                            className="text-primary hover:bg-primary/10 hover:text-primary"
                            title="Renew Membership"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => onEdit(member)} title="Edit Member">
                          <Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(member.id)}
                          className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                          title="Remove Member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={canWrite ? 7 : 6}
                  className="p-12 text-center text-sm font-medium text-muted-foreground border-b border-border"
                >
                  No members match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default MembershipTable;
