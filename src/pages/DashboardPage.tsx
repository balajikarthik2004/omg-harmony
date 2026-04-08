import React from 'react';
import {
  Heart, CalendarDays, Users, TrendingUp, CalendarCheck,
  LayoutDashboard, Search, Activity, Package, AlertTriangle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

import {
  donationTrendData, donationCategoryData, serviceBookingData,
  inventoryUsageData
} from '@/data/mockData';

const kpis = [
  { label: "Today's Donations", value: '₹1,90,000', icon: Heart, color: 'text-red-500', bg: 'bg-primary/15 border-primary/25', trend: '+12% from yesterday' },
  { label: "Today's Bookings", value: '24', icon: CalendarDays, color: 'text-accent', bg: 'bg-accent/15 border-accent/30', trend: '4 pending approval' },
  { label: 'Total Devotees', value: '2,347', icon: Users, color: 'text-foreground', bg: 'bg-foreground/10 border-foreground/20', trend: '+45 this week' },
  { label: 'Revenue (MTD)', value: '₹12,40,000', icon: TrendingUp, color: 'text-success', bg: 'bg-success/15 border-success/30', trend: '' },
];

const secondaryKpis = [
  { label: 'Upcoming Events', value: '4', icon: CalendarCheck, color: 'text-primary font-bold bg-primary/10 border border-primary/20' },
  { label: 'Inventory Alerts', value: '3', icon: AlertTriangle, color: 'text-destructive font-bold bg-destructive/10 border border-destructive/20 ring-2 ring-destructive/20' },
];

const recentActivity = [
  { text: 'Donation received from Rajesh Kumar ₹25,000', time: '10 min ago', initial: 'R', color: 'bg-primary/10 text-primary border border-primary/20' },
  { text: 'Evening Aarti completed', time: '1 hour ago', initial: 'E', color: 'bg-primary/10 text-primary border border-primary/20' },
  { text: 'Camphor issued to temple kitchen', time: '2 hours ago', initial: 'C', color: 'bg-muted text-muted-foreground border border-border' },
  { text: 'New booking: Ganesh Pooja by Priya Sharma', time: '3 hours ago', initial: 'N', color: 'bg-primary/10 text-primary border border-primary/20' },
  { text: 'Maintenance request approved', time: '4 hours ago', initial: 'M', color: 'bg-success/10 text-success border border-success/20' },
];

const upcomingEvents = [
  { name: 'Maha Shivaratri', date: 'Mar 20', attendees: 1200 },
  { name: 'Satyanarayana Pooja', date: 'Mar 25', attendees: 150 },
  { name: 'Navratri Festival', date: 'Apr 6', attendees: 3400 },
];

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
              <p className="text-[11px] uppercase tracking-wider font-bold text-foreground/70">{kpi.label}</p>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${kpi.color} bg-background/80 backdrop-blur-sm border border-border/40`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="numeric-font text-3xl font-bold text-foreground tracking-tight">{kpi.value}</p>
              <p className="text-xs font-semibold text-foreground/60 mt-1">{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="section-panel shadow-sm lg:col-span-2 flex flex-col">
          <div className="section-panel-header">
            <h3 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Donation Trend</h3>
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
            <h3 className="text-sm font-semibold flex items-center gap-2"><PieChart className="w-4 h-4 text-primary" /> Donation Categories</h3>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center relative">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={donationCategoryData} cx="50%" cy="50%" fontSize={12} outerRadius={85} innerRadius={45} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={{ stroke: 'hsl(var(--muted-foreground))' }} strokeWidth={2} stroke="hsl(var(--background))">
                  {donationCategoryData.map((entry, i) => (
                    <Cell key={i} fill={donationCategoryPalette[i % donationCategoryPalette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: dashboardColors.tooltipBorder, boxShadow: dashboardColors.tooltipShadow, background: dashboardColors.tooltipBg, fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="section-panel shadow-sm">
          <div className="section-panel-header">
            <h3 className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Service Bookings Distribution</h3>
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
                />
                <Bar dataKey="bookings" fill={dashboardColors.chartAccentA} radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="section-panel shadow-sm">
          <div className="section-panel-header">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Inventory Usage Trends</h3>
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
            <h3 className="text-sm font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Recent Activity Feed</h3>
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
            <h3 className="text-sm font-semibold flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-primary" /> Upcoming Events</h3>
          </div>
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {upcomingEvents.map((e, i) => (
              <div key={i} className="dashboard-event-card flex flex-col p-3.5 bg-background border border-border/60 shadow-sm rounded-xl hover:border-primary/30 transition-colors duration-200 gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-foreground">{e.name}</p>
                  <span className="text-[10px] text-primary bg-primary/10 rounded-full px-2.5 py-1 font-bold uppercase tracking-wider">{e.date}</span>
                </div>
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Expected: {e.attendees.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
