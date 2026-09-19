import React from 'react';
import { AlertCircle, Calendar, Landmark, Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDateDDMMYYYY } from '@/lib/utils';
import type { Asset } from '@/data/mockData';

interface AssetsTableProps {
  items: Asset[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (item: Asset) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  canWrite: boolean;
}

const conditionDot = (condition: string) => {
  if (condition === 'Excellent') return 'bg-emerald-500';
  if (condition === 'Good') return 'bg-blue-500';
  if (condition === 'Fair') return 'bg-amber-500';
  return 'bg-rose-500';
};

export const AssetsTable: React.FC<AssetsTableProps> = ({
  items,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  isLoading = false,
  canWrite,
}) => (
  <div className="section-panel assets-main-panel shadow-sm">
    <div className="section-panel-header assets-main-header whitespace-nowrap overflow-hidden">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <Landmark className="w-4 h-4 text-emerald-600" />
        All Asset List
      </h2>
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by name, category or condition..."
          className="assets-search-input w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background/80 text-sm transition-all shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none hover:border-border"
        />
      </div>
    </div>

    <div className="table-container border-0 rounded-none shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Asset Name</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Category</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Bought Date</th>
              <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Value</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Condition</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Maintenance</th>
              {canWrite && (
                <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-background">
            {isLoading && (
              <tr>
                <td
                  colSpan={canWrite ? 7 : 6}
                  className="p-12 text-center text-sm font-medium text-muted-foreground border-b border-border"
                >
                  Loading asset registry...
                </td>
              </tr>
            )}

            {!isLoading &&
              items.map(asset => (
                <tr
                  key={asset.id}
                  className="assets-row border-b border-border hover:bg-muted/30 transition-colors group"
                >
                  <td className="p-4">
                    <p className="font-bold text-foreground">{asset.name}</p>
                    {asset.notes && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[320px] truncate">
                        {asset.notes}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-accent text-[11px] font-bold tracking-wider uppercase italic">
                      {asset.category}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground font-medium text-[11px] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 opacity-50" />
                      {formatDateDDMMYYYY(asset.purchaseDate)}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-foreground whitespace-nowrap">
                    ₹{Number(asset.cost || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${conditionDot(asset.condition)}`} />
                      <span className="font-semibold text-xs text-foreground/80">{asset.condition}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[11px] font-bold',
                        asset.maintenanceStatus === 'Up to Date'
                          ? 'text-emerald-500'
                          : asset.maintenanceStatus === 'Overdue'
                            ? 'text-rose-500'
                            : 'text-amber-500'
                      )}
                    >
                      {asset.maintenanceStatus !== 'Up to Date' && <AlertCircle className="w-3.5 h-3.5" />}
                      {asset.maintenanceStatus}
                    </div>
                  </td>
                  {canWrite && (
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(asset)} title="Edit Asset">
                          <Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(asset.id)}
                          className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                          title="Delete Asset"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

            {!isLoading && items.length === 0 && (
              <tr>
                <td
                  colSpan={canWrite ? 7 : 6}
                  className="p-12 text-center text-sm font-medium text-muted-foreground border-b border-border"
                >
                  No assets found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AssetsTable;
