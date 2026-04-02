import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  'Active': 'bg-emerald-100 text-emerald-700',
  'Inactive': 'bg-muted text-muted-foreground',
  'Confirmed': 'bg-emerald-100 text-emerald-700',
  'Pending': 'bg-amber-100 text-amber-700',
  'Completed': 'bg-blue-100 text-blue-700',
  'Cancelled': 'bg-red-100 text-red-700',
  'Paid': 'bg-emerald-100 text-emerald-700',
  'Refunded': 'bg-red-100 text-red-700',
  'Planned': 'bg-blue-100 text-blue-700',
  'Scheduled': 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-purple-100 text-purple-700',
  'In Stock': 'bg-emerald-100 text-emerald-700',
  'Low Stock': 'bg-red-100 text-red-700',
  'Good': 'bg-emerald-100 text-emerald-700',
  'Excellent': 'bg-blue-100 text-blue-700',
  'Fair': 'bg-amber-100 text-amber-700',
  'Up to Date': 'bg-emerald-100 text-emerald-700',
  'Due Soon': 'bg-amber-100 text-amber-700',
  'Overdue': 'bg-red-100 text-red-700',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-muted text-muted-foreground'}`}>
    {status}
  </span>
);

export default StatusBadge;
