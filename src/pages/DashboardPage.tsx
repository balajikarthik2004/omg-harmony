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
  { label: "Today's Donations", value: '₹1,90,000', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', trend: '+12% from yesterday' },
  { label: "Today's Bookings", value: '24', icon: CalendarDays, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', trend: '4 pending approval' },
  { label: 'Total Devotees', value: '2,847', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', trend: '+45 this week' },
  { label: 'Revenue (MTD)', value: '₹12,40,000', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', trend: '' },
];

const secondaryKpis = [
  { label: 'Upcoming Events', value: '4', icon: CalendarCheck, color: 'text-blue-600 font-bold bg-blue-50 border border-blue-100' },
  { label: 'Inventory Alerts', value: '3', icon: AlertTriangle, color: 'text-red-700 font-bold bg-red-50 border border-red-200 ring-2 ring-red-500/20' },
];

const recentActivity = [
  { text: 'Donation received from Rajesh Kumar ₹25,000', time: '10 min ago', initial: 'R', color: 'bg-emerald-100 text-emerald-800' },
  { text: 'Evening Aarti completed', time: '1 hour ago', initial: 'E', color: 'bg-blue-100 text-blue-800' },
  { text: 'Camphor issued to temple kitchen', time: '2 hours ago', initial: 'C', color: 'bg-amber-100 text-amber-800' },
  { text: 'New booking: Ganesh Pooja by Priya Sharma', time: '3 hours ago', initial: 'N', color: 'bg-indigo-100 text-indigo-800' },
  { text: 'Maintenance request approved', time: '4 hours ago', initial: 'M', color: 'bg-rose-100 text-rose-800' },
];

const upcomingEvents = [
  { name: 'Maha Shivaratri', date: 'Mar 20', attendees: 1200 },
  { name: 'Satyanarayana Pooja', date: 'Mar 25', attendees: 150 },
  { name: 'Navratri Festival', date: 'Apr 6', attendees: 3400 },
];



const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-primary" /> Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of temple operations, finances, and key metrics.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative w-full max-w-[200px] hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="h-10 w-full pl-9 pr-3 rounded-lg border border-input bg-background/60 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                placeholder="Quick search..."
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`rounded-2xl border p-5 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden ${kpi.bg}`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-current ${kpi.color.split(' ')[0]}`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
               <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground opacity-80">{kpi.label}</p>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-background/80 shadow-sm ${kpi.color}`}>
                  <kpi.icon className="w-4 h-4" />
               </div>
            </div>
            <div className="relative z-10">
               <p className="text-3xl font-display font-bold text-foreground tracking-tight">{kpi.value}</p>
               <p className="text-xs font-semibold text-muted-foreground mt-1">{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-stagger">
        {secondaryKpis.map(kpi => (
          <div key={kpi.label} className={`rounded-xl p-4 flex items-center justify-between shadow-sm ${kpi.color}`}>
            <div className="flex items-center gap-3">
              <kpi.icon className="w-5 h-5 opacity-80" />
              <p className="text-sm font-semibold">{kpi.label}</p>
            </div>
            <p className="text-xl font-bold">{kpi.value}</p>
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
                    <stop offset="5%" stopColor="hsl(1, 76%, 52%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(1, 76%, 52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 12%, 92%)" vertical={false} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000)}k`} dx={-10} />
                <Tooltip 
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']}
                  separator=": "
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40, 12%, 85%)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px', padding: '10px 14px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(1, 76%, 52%)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'hsl(1, 76%, 52%)', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: 'hsl(1, 76%, 52%)', strokeWidth: 2, stroke: '#fff' }}
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
                <Pie data={donationCategoryData} cx="50%" cy="50%" fontSize={12} outerRadius={85} innerRadius={45} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={{ stroke: 'hsl(40, 12%, 80%)' }} strokeWidth={2} stroke="hsl(40, 33%, 98%)">
                  {donationCategoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40, 12%, 85%)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px' }}
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 12%, 92%)" vertical={false} />
                <XAxis dataKey="service" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40, 12%, 85%)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px' }}
                  cursor={{ fill: 'hsl(40, 20%, 94%)' }}
                />
                <Bar dataKey="bookings" fill="hsl(233, 53%, 35%)" radius={[6, 6, 0, 0]} barSize={32} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 12%, 92%)" vertical={false} />
                <XAxis dataKey="item" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40, 12%, 85%)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px' }}
                  cursor={{ fill: 'hsl(40, 20%, 94%)' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="used" fill="hsl(270, 43%, 32%)" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="remaining" fill="hsl(40, 70%, 50%)" radius={[4, 4, 0, 0]} barSize={24} />
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
              <div key={i} className="flex flex-col p-3.5 bg-background border border-border/60 shadow-sm rounded-xl hover:border-primary/30 transition-colors duration-200 gap-2">
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
