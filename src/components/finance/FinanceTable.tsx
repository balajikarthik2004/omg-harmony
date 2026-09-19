import React from 'react';
import { BookOpenCheck, Calendar, Link2, Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDateDDMMYYYY } from '@/lib/utils';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  formatRupees,
  type LedgerDirection,
  type LedgerRow,
} from '@/lib/finance';

export type DirectionFilter = 'All' | LedgerDirection;

const DIRECTION_FILTERS: DirectionFilter[] = ['All', 'Income', 'Expense'];

interface FinanceTableProps {
  rows: LedgerRow[];
  search: string;
  onSearchChange: (value: string) => void;
  directionFilter: DirectionFilter;
  onDirectionFilterChange: (value: DirectionFilter) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onEdit: (row: LedgerRow) => void;
  onDelete: (id: string) => void;
  canWrite: boolean;
}

export const FinanceTable: React.FC<FinanceTableProps> = ({
  rows,
  search,
  onSearchChange,
  directionFilter,
  onDirectionFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onEdit,
  onDelete,
  canWrite,
}) => (
  <div className="section-panel finance-main-panel shadow-sm">
    <div className="section-panel-header finance-main-header flex-wrap gap-3">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <BookOpenCheck className="w-4 h-4" />
        Ledger Entries
      </h2>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search voucher, particulars or reference..."
            className="finance-search-input w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background/80 text-sm transition-all shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none hover:border-border"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => onCategoryFilterChange(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background/80 px-3 text-sm font-medium shadow-sm outline-none transition-all hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="All">All categories</option>
          <optgroup label="Income">
            {INCOME_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </optgroup>
          <optgroup label="Expense">
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    </div>

    <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-2">
      {DIRECTION_FILTERS.map(direction => (
        <button
          key={direction}
          onClick={() => onDirectionFilterChange(direction)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all',
            directionFilter === direction
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground'
          )}
        >
          {direction}
        </button>
      ))}
    </div>

    <div className="table-container border-0 rounded-none shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Voucher</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Particulars</th>
              <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Income</th>
              <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Expense</th>
              <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Balance</th>
              {canWrite && (
                <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-background">
            {rows.map(row => (
              <tr
                key={row.id}
                className="finance-row border-b border-border hover:bg-muted/30 transition-colors group"
              >
                <td className="p-4 whitespace-nowrap">
                  <p className="font-bold text-foreground text-xs">{row.voucherNo}</p>
                  {row.reference && row.reference !== '-' && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{row.reference}</p>
                  )}
                </td>
                <td className="p-4 text-muted-foreground font-medium text-[11px] whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                    {formatDateDDMMYYYY(row.date)}
                  </span>
                </td>
                <td className="p-4">
                  <p className="font-semibold text-foreground">{row.particulars}</p>
                  <p className="text-[11px] mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="text-accent font-bold tracking-wider uppercase italic">
                      {row.category}
                    </span>
                    <span className="text-muted-foreground">{row.paymentMode}</span>
                    {row.sourceModule && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Link2 className="w-3 h-3" />
                        auto-posted from {row.sourceModule}
                      </span>
                    )}
                  </p>
                </td>
                <td className="p-4 text-right whitespace-nowrap font-semibold text-emerald-600">
                  {row.direction === 'Income' ? formatRupees(row.amount) : '—'}
                </td>
                <td className="p-4 text-right whitespace-nowrap font-semibold text-destructive">
                  {row.direction === 'Expense' ? formatRupees(row.amount) : '—'}
                </td>
                <td
                  className={cn(
                    'p-4 text-right whitespace-nowrap font-bold',
                    row.balance >= 0 ? 'text-foreground' : 'text-destructive'
                  )}
                >
                  {formatRupees(row.balance)}
                </td>
                {canWrite && (
                  <td className="p-4 text-right whitespace-nowrap">
                    {row.sourceModule ? (
                      <span
                        className="text-[11px] font-semibold text-muted-foreground"
                        title={`Edit this in the ${row.sourceModule} module`}
                      >
                        Linked
                      </span>
                    ) : (
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(row)} title="Edit Entry">
                          <Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(row.id)}
                          className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                          title="Delete Entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={canWrite ? 7 : 6}
                  className="p-12 text-center text-sm font-medium text-muted-foreground border-b border-border"
                >
                  No ledger entries match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default FinanceTable;
