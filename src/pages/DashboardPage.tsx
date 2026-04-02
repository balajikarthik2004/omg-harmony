import React from 'react';
import {
  Heart, CalendarDays, Users, Wallet, TrendingUp, CalendarCheck,
  CheckSquare, AlertTriangle
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
  { label: "Today's Donations", value: '₹1,90,000', icon: Heart, color: 'bg-primary/10 text-primary' },
  { label: "Today's Bookings", value: '24', icon: CalendarDays, color: 'bg-secondary/10 text-secondary' },
  { label: 'Total Devotees', value: '2,847', icon: Users, color: 'bg-accent/10 text-accent' },
  // { label: 'Cash & Bank', value: '₹45,20,000', icon: Wallet, color: 'bg-primary/10 text-primary' },
  { label: 'Revenue (MTD)', value: '₹12,40,000', icon: TrendingUp, color: 'bg-secondary/10 text-secondary' },
  { label: 'Upcoming Events', value: '4', icon: CalendarCheck, color: 'bg-accent/10 text-accent' },
  { label: 'Pending Tasks', value: '7', icon: CheckSquare, color: 'bg-secondary/10 text-secondary' },
  { label: 'Inventory Alerts', value: '3', icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
];

const recentActivity = [
  { text: 'Donation received from Rajesh Kumar ₹25,000', time: '10 min ago' },
  { text: 'Evening Aarti completed', time: '1 hour ago' },
  { text: 'Camphor issued to temple kitchen', time: '2 hours ago' },
  { text: 'New booking: Ganesh Pooja by Priya Sharma', time: '3 hours ago' },
  { text: 'Maintenance request approved', time: '4 hours ago' },
];

const upcomingEvents = [
  { name: 'Maha Shivaratri', date: 'Mar 20' },
  { name: 'Satyanarayana Pooja', date: 'Mar 25' },
  { name: 'Navratri Festival', date: 'Apr 6' },
];

const pendingApprovals = [
  { text: 'Leave request - Pandit Verma', type: 'Leave' },
  { text: 'Generator servicing', type: 'Maintenance' },
  { text: 'Hundi opening - March 13', type: 'Audit' },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-stagger">
        {kpis.map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div className={`kpi-icon ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
              <p className="text-lg font-display font-bold text-foreground">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 erp-card !p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Donation Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={donationTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 12%, 90%)" />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000)}k`} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="amount" stroke="hsl(1, 76%, 52%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="erp-card !p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Donation Categories</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={donationCategoryData} cx="50%" cy="50%" fontSize={12} outerRadius={75} innerRadius={40} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                {donationCategoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="erp-card !p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Service Bookings</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={serviceBookingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 12%, 90%)" />
              <XAxis dataKey="service" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="bookings" fill="hsl(233, 53%, 35%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="erp-card !p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Inventory Usage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={inventoryUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 12%, 90%)" />
              <XAxis dataKey="item" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="used" fill="hsl(270, 43%, 32%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="remaining" fill="hsl(40, 70%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="erp-card !p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
          <div className="space-y-2.5">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs text-foreground leading-snug">{a.text}</p>
                  <p className="text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="erp-card !p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Pending Approvals</h3>
          <div className="space-y-2">
            {pendingApprovals.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                <p className="text-xs text-foreground">{a.text}</p>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{a.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="erp-card !p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming Events</h3>
          <div className="space-y-2">
            {upcomingEvents.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-foreground">{e.name}</p>
                <span className="text-[10px] text-muted-foreground">{e.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
