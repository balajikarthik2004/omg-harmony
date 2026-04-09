import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; hover: string; dot: string }> = {
  'Active': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60', dot: 'bg-emerald-500' },
  'Inactive': { bg: 'bg-gray-100 dark:bg-gray-900/40', text: 'text-gray-600 dark:text-gray-300', hover: 'hover:bg-gray-200 dark:hover:bg-gray-900/60', dot: 'bg-gray-400' },
  'Confirmed': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60', dot: 'bg-emerald-500' },
  'Pending': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/60', dot: 'bg-amber-500' },
  'Completed': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/60', dot: 'bg-blue-500' },
  'Cancelled': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', hover: 'hover:bg-red-100 dark:hover:bg-red-950/60', dot: 'bg-red-500' },
  'Paid': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60', dot: 'bg-emerald-500' },
  'Refunded': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', hover: 'hover:bg-red-100 dark:hover:bg-red-950/60', dot: 'bg-red-500' },
  'Planned': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/60', dot: 'bg-blue-500' },
  'Scheduled': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/60', dot: 'bg-amber-500' },
  'In Progress': { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', hover: 'hover:bg-purple-100 dark:hover:bg-purple-950/60', dot: 'bg-purple-500' },
  'In Stock': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60', dot: 'bg-emerald-500' },
  'Low Stock': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', hover: 'hover:bg-red-100 dark:hover:bg-red-950/60', dot: 'bg-red-500' },
  'Good': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60', dot: 'bg-emerald-500' },
  'Excellent': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/60', dot: 'bg-blue-500' },
  'Fair': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/60', dot: 'bg-amber-500' },
  'Up to Date': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60', dot: 'bg-emerald-500' },
  'Due Soon': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/60', dot: 'bg-amber-500' },
  'Overdue': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', hover: 'hover:bg-red-100 dark:hover:bg-red-950/60', dot: 'bg-red-500' },
};

const defaultConfig = { bg: 'bg-gray-100 dark:bg-gray-900/40', text: 'text-gray-600 dark:text-gray-300', hover: 'hover:bg-gray-200 dark:hover:bg-gray-900/60', dot: 'bg-gray-400' };

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || defaultConfig;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-default ${config.bg} ${config.text} ${config.hover}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
