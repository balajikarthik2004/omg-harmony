import React from 'react';
import {
  Heart, CalendarDays, Users, TrendingUp, CalendarCheck,
  LayoutDashboard, Search, Activity, Package, AlertTriangle, PieChart as PieChartIcon
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

import {
  donationTrendData, donationCategoryData, serviceBookingData,
  inventoryUsageData, mockBookings, mockDevotees, mockDonations, mockEvents,
  mockInventory, mockLedgerEntries
} from '@/data/mockData';
import { getLedgerTotals, formatRupees } from '@/lib/finance';
import { formatDateDDMMYYYY, toISODate } from '@/lib/utils';

// Every figure below is derived from the registers. These were hard-coded and
// had drifted badly - the devotee count alone read 2,347 against 34 records.
const successfulDonations = mockDonations.filter(d => d.paymentStatus === 'Success');
const donationTotal = successfulDonations.reduce((sum, d) => sum + d.amount, 0);
const pendingBookings = mockBookings.filter(b => b.paymentStatus === 'Pending').length;
const lowStockCount = mockInventory.filter(i => i.stockStatus === 'Low Stock').length;
const ledgerTotals = getLedgerTotals(mockLedgerEntries);
const today = toISODate(new Date());
const futureEvents = mockEvents.filter(e => e.date >= today);

const kpis = [
  { label: 'Total Donations', value: formatRupees(donationTotal), icon: Heart, color: 'text-red-500', bg: 'bg-primary/15 border-primary/25', trend: `${successfulDonations.length} receipts issued` },
  { label: 'Service Bookings', value: String(mockBookings.length), icon: CalendarDays, color: 'text-accent', bg: 'bg-accent/15 border-accent/30', trend: `${pendingBookings} pending approval` },
  { label: 'Total Devotees', value: mockDevotees.length.toLocaleString('en-IN'), icon: Users, color: 'text-foreground', bg: 'bg-foreground/10 border-foreground/20', trend: `${mockDevotees.filter(d => d.status === 'Active').length} active` },
  { label: 'Net Balance', value: formatRupees(ledgerTotals.net), icon: TrendingUp, color: 'text-success', bg: 'bg-success/15 border-success/30', trend: `${formatRupees(ledgerTotals.expense)} spent` },
];

const secondaryKpis = [
  { label: futureEvents.length > 0 ? 'Upcoming Events' : 'Events On Record', value: String(futureEvents.length || mockEvents.length), icon: CalendarCheck, color: 'text-primary font-bold bg-primary/10 border border-primary/20' },
  { label: 'Inventory Alerts', value: String(lowStockCount), icon: AlertTriangle, color: 'text-destructive font-bold bg-destructive/10 border border-destructive/20 ring-2 ring-destructive/20' },
];

const recentActivity = [...successfulDonations]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5)
  .map(donation => ({
    text: `Donation received from ${donation.donorName} ${formatRupees(donation.amount)}`,
    time: formatDateDDMMYYYY(donation.date),
    initial: donation.donorName.charAt(0),
    color: 'bg-muted text-foreground dark:bg-muted/50 dark:text-white border border-border',
  }));

const upcomingEvents = (futureEvents.length > 0 ? futureEvents : mockEvents)
  .slice()
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 3)
  .map(event => ({ name: event.name, date: formatDateDDMMYYYY(event.date), location: event.location }));

const dashboardColors = {
  line: 'hsl(var(--primary))',
  lineGrid: 'var(--chart-grid)',
  lineFillTop: 'var(--chart-accent-c)',
  lineFillBottom: 'var(--chart-accent-c)',
  chartAccentA: 'var(--chart-accent-a)',
  chartAccentB: 'var(--chart-accent-b)',
  chartAccentC: 'var(--chart-accent-c)',
  chartAccentD: 'var(--chart-accent-d)',
  tooltipBorder: '1px solid hsl(var(--border))',
  tooltipShadow: '0 14px 34px -14px hsl(var(--secondary) / 0.35)',
  tooltipBg: 'hsl(var(--card))',
  chartCursor: 'var(--chart-cursor)',
};

const sectionIconClassName = 'w-4 h-4 text-foreground/85';



const DashboardPage: React.FC = () => {
  const donationCategoryPalette = [
    dashboardColors.chartAccentA,
    dashboardColors.chartAccentB,
    dashboardColors.chartAccentC,
    dashboardColors.chartAccentD,
  ];

  return (
    <div className="dashboard-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner dashboard-header-banner">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><LayoutDashboard className="dashboard-title-icon w-5 h-5 text-primary" /> Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of temple operations, finances, and key metrics.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full max-w-[200px] hidden sm:block">
            <Search className="dashboard-search-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="h-10 w-full pl-9 pr-3 rounded-lg border border-input bg-background/60 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
              placeholder="Quick search..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`dashboard-kpi-card rounded-2xl border p-5 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden ${kpi.bg}`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-current ${kpi.color.split(' ')[0]}`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground opacity-80">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${kpi.color} bg-background`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="numeric-font text-3xl font-bold text-foreground tracking-tight">{kpi.value}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="section-panel shadow-sm lg:col-span-2 flex flex-col">
          <div className="section-panel-header">
            <h3 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className={sectionIconClassName} /> Donation Trend</h3>
          </div>
          <div className="p-5 flex-1 relative">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={donationTrendData}>
                <defs>
                  <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dashboardColors.lineFillTop} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={dashboardColors.lineFillBottom} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={dashboardColors.lineGrid} vertical={false} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000)}k`} dx={-10} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']}
                  separator=": "
                  contentStyle={{ borderRadius: '12px', border: dashboardColors.tooltipBorder, boxShadow: dashboardColors.tooltipShadow, background: dashboardColors.tooltipBg, fontSize: '13px', padding: '10px 14px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={dashboardColors.line}
                  strokeWidth={3}
                  dot={{ r: 4, fill: dashboardColors.line, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 6, fill: dashboardColors.line, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  fill="url(#donationGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="section-panel shadow-sm flex flex-col">
          <div className="section-panel-header">
            <h3 className="text-sm font-semibold flex items-center gap-2"><PieChartIcon className={sectionIconClassName} /> Donation Categories</h3>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center relative">
            <ResponsiveContainer width="100%" height={230}>
              <RechartsPieChart>
                <Pie data={donationCategoryData} cx="50%" cy="50%" fontSize={12} outerRadius={85} innerRadius={45} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={{ stroke: 'hsl(var(--muted-foreground))' }} strokeWidth={2} stroke="hsl(var(--background))">
                  {donationCategoryData.map((entry, i) => (
                    <Cell key={i} fill={donationCategoryPalette[i % donationCategoryPalette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: dashboardColors.tooltipBorder, boxShadow: dashboardColors.tooltipShadow, background: dashboardColors.tooltipBg, fontSize: '13px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="section-panel shadow-sm">
          <div className="section-panel-header">
            <h3 className="text-sm font-semibold flex items-center gap-2"><CalendarDays className={sectionIconClassName} /> Service Bookings Distribution</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={serviceBookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke={dashboardColors.lineGrid} vertical={false} />
                <XAxis dataKey="service" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: dashboardColors.tooltipBorder, boxShadow: dashboardColors.tooltipShadow, background: dashboardColors.tooltipBg, fontSize: '13px' }}
                  cursor={{ fill: dashboardColors.chartCursor }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="bookings" fill={dashboardColors.chartAccentA} radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="section-panel shadow-sm">
          <div className="section-panel-header">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Package className={sectionIconClassName} /> Inventory Usage Trends</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={inventoryUsageData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={dashboardColors.lineGrid} vertical={false} />
                <XAxis dataKey="item" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: dashboardColors.tooltipBorder, boxShadow: dashboardColors.tooltipShadow, background: dashboardColors.tooltipBg, fontSize: '13px' }}
                  cursor={{ fill: dashboardColors.chartCursor }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="used" fill={dashboardColors.chartAccentD} radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="remaining" fill={dashboardColors.chartAccentB} radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="section-panel shadow-sm">
          <div className="section-panel-header">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Activity className={sectionIconClassName} /> Recent Activity Feed</h3>
          </div>
          <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${a.color}`}>
                  {a.initial}
                </div>
                <div className="pt-1.5 flex-1 border-b border-border/40 pb-3 group-last:border-0 group-last:pb-0">
                  <p className="text-[13px] font-medium text-foreground leading-snug">{a.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-semibold">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-panel shadow-sm">
          <div className="section-panel-header">
            <h3 className="text-sm font-semibold flex items-center gap-2"><CalendarCheck className={sectionIconClassName} /> Upcoming Events</h3>
          </div>
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {upcomingEvents.map((e, i) => (
              <div key={i} className="dashboard-event-card flex flex-col p-3.5 bg-background border border-border/60 shadow-sm rounded-xl hover:border-primary/30 transition-colors duration-200 gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-foreground">{e.name}</p>
                  <span className="text-[10px] text-foreground bg-muted border border-border/50 rounded-full px-2.5 py-1 font-bold uppercase tracking-wider">{e.date}</span>
                </div>
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {e.location}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
