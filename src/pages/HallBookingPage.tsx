import React, { useState } from 'react';
import {
    Building2, Calendar, FileText, IndianRupee, Users,
    Edit, CheckCircle2, AlertCircle, Clock,
    Plus, Search, Filter, Download, Trash2,
    LayoutDashboard, PieChart, Info, MapPin,
    Utensils, Armchair, Zap, Sparkles, ChevronRight,
    ClipboardCheck, TrendingUp, Receipt, ArrowRight, X
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

// --- Mock Data ---
const initialHalls = [
    {
        id: 'h1', name: 'The Royal Vedic Grand Ballroom', tagline: 'Ideal for Grand Mahotsavs & Marriages',
        capacity: 1000, basePrice: 75000,
        facilities: ['Centralized AC', 'Bridal Executive Suite', '10KW JBL Pro Sound', 'Modular Pure-Veg Kitchen', 'Crystal Chandeliers'],
        image: 'https://t3.ftcdn.net/jpg/03/13/80/56/240_F_313805680_9TQ2uhQqAo4ZOGjGMXVlhWnr1HJ4OfsN.jpg'
    },
    {
        id: 'h2', name: 'Saraswati Cultural Pavilion', tagline: 'Boutique Space for Rituals & Upnayanam',
        capacity: 250, basePrice: 20000,
        facilities: ['Vedic Altar Stage', 'Bose Surround System', 'Premium Sofa Seating', 'Integrated CCTV'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdd3lLxcAwofveFq30DGCNRE08cfsE4oMWig&s'
    },
    {
        id: 'h3', name: 'Annapurna Dining Mahashala', tagline: 'Modern Dining with Vedic Grace',
        capacity: 450, basePrice: 12000,
        facilities: ['Stainless Steel Serving', 'Purified RO Water Plant', 'Steam Cooking Utility', 'Marble Flooring'],
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaZb0DaBe3gJRu41m6V68ghb_2f-gDhrSay5DRRTkjLg0WwfD_PFaKqzs&s"
    },
    {
        id: 'h4', name: 'The Shanti Vana Garden Arena', tagline: 'Exquisite Outdoor Open-Air Celebrations',
        capacity: 1800, basePrice: 45000,
        facilities: ['Artificial Waterfall', 'Luxury Gazebos', 'Perimeter LED Lighting', 'Ample Car Parking'],
        image: 'https://t4.ftcdn.net/jpg/02/96/40/39/360_F_296403993_oxQTsstYc83xJqzaAjz5cv1PePLoMRd1.jpg'
    }
];

const initialBookings = [
    { id: 'B1001', hall: 'Hall A', devotee: 'Venkat Rao', date: '12-04-2026', slot: 'Full Day', status: 'Confirmed', amount: 48000, event: 'Maha Marriage' },
    { id: 'B1002', hall: 'Hall B', devotee: 'Priya Sharma', date: '15-05-2026', slot: 'Half Day (Morning)', status: 'Pending', amount: 12000, event: 'Mundan Ceremony' },
    { id: 'B1003', hall: 'Bhojan Shala', devotee: 'Temple Committee', date: '15-04-2026', slot: 'Full Day', status: 'Confirmed', amount: 0, event: 'Annadhanam' },
    { id: 'B1004', hall: 'Hall A', devotee: 'Rajesh Kumar', date: '20-04-2026', slot: 'Full Day', status: 'Locked', amount: 45000, event: 'Satsang Event' },
    { id: 'B1005', hall: 'Hall B', devotee: 'Suresh Iyer', date: '25-04-2026', slot: 'Full Day', status: 'Confirmed', amount: 15000, event: 'Upanayanam' },
    { id: 'B1006', hall: 'Temple Lawn', devotee: 'Meenakshi Reddy', date: '02-05-2026', slot: 'Full Day', status: 'Confirmed', amount: 55000, event: 'Grand Reception' },
    { id: 'B1007', hall: 'Bhojan Shala', devotee: 'Anand G.', date: '10-05-2026', slot: 'Half Day (Afternoon)', status: 'Pending', amount: 8000, event: 'Seemantham' },
];

const revenueData = [
    { name: 'Jan', amount: 150000 }, { name: 'Feb', amount: 220000 }, { name: 'Mar', amount: 180000 },
    { name: 'Apr', amount: 310000 }, { name: 'May', amount: 420000 }, { name: 'Jun', amount: 380000 },
];

const hallUtilization = [
    { name: 'Hall A', value: 75 }, { name: 'Hall B', value: 45 },
    { name: 'Bhojan Shala', value: 60 }, { name: 'Open Space', value: 30 },
];

const COLORS = ['#293088', '#4F58CA', '#767DD6', '#E22E26'];

// Unified button class: black text default → red bg + white text on hover
const BTN = "bg-white text-foreground border border-border font-bold transition-all duration-200 hover:bg-[#E22E26] hover:text-white hover:border-[#E22E26] active:scale-[0.98]";

const KPIChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="amount" stroke="#293088" strokeWidth={3} dot={{ r: 4, fill: '#293088' }} activeDot={{ r: 6 }} />
        </LineChart>
    </ResponsiveContainer>
);

const StatusBadge = ({ status }) => {
    const map = {
        Confirmed: 'bg-emerald-100 text-emerald-700',
        Pending: 'bg-amber-100 text-amber-700',
        Locked: 'bg-slate-100 text-slate-700',
    };
    return (
        <Badge className={`${map[status] || 'bg-gray-100 text-gray-700'} border-none px-3 font-bold uppercase text-[9px]`}>
            {status}
        </Badge>
    );
};

const HallBookingPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [bookingStep, setBookingStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [inventorySearch, setInventorySearch] = useState('');
    const [hallsList, setHallsList] = useState(initialHalls);
    const [bookingsList, setBookingsList] = useState(initialBookings);
    const [selectedHallId, setSelectedHallId] = useState(null);
    const [bookingFormData, setBookingFormData] = useState({
        firstName: '', lastName: '', phone: '', email: '',
        category: 'marriage', guests: '', notes: '',
        date: '2026-04-12', slot: 'full'
    });
    const [selectedAddonIds, setSelectedAddonIds] = useState([]);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [newBookingId, setNewBookingId] = useState(null);

    // Add New Hall Dialog state
    const [newHallData, setNewHallData] = useState({
        name: '', capacity: '', basePrice: '', strategy: 'daily',
        facilities: []
    });
    const [addHallOpen, setAddHallOpen] = useState(false);

    // Delete booking state
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Edit booking state (inline status change)
    const [editingBookingId, setEditingBookingId] = useState(null);

    const selectedHall = hallsList.find(h => h.id === selectedHallId);

    const ADDONS = [
        { id: 'a1', title: 'Full Decoration', price: 25000, desc: 'Floral & lighting traditional temple decor', icon: Sparkles },
        { id: 'a2', title: 'Standard Kitchen Access', price: 5000, desc: 'Gas & basic utility usage', icon: Utensils },
        { id: 'a3', title: 'Additional Electricity', price: 3000, desc: 'AC surge & heavy lighting support', icon: Zap },
        { id: 'a4', title: 'Furniture Rental', price: 8000, desc: '200 Extra chairs & 10 banquet tables', icon: Armchair },
        { id: 'a5', title: 'Professional Cleaning', price: 2500, desc: 'Pre and post event deep cleaning', icon: ClipboardCheck },
        { id: 'a6', title: 'Event Staff Support', price: 4000, desc: '4 Helpers for management', icon: Users },
    ];

    const handleExportCSV = () => {
        const headers = "ID,Hall,Devotee,Date,Slot,Status,Amount,Event\n";
        const rows = bookingsList.map(b => `${b.id},${b.hall},${b.devotee},${b.date},${b.slot},${b.status},${b.amount},${b.event}`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `hall_bookings_${new Date().toLocaleDateString()}.csv`; a.click();
    };

    const calculateSummary = () => {
        const basePrice = selectedHall?.basePrice || 0;
        const addOnsPrice = selectedAddonIds.reduce((sum, id) => {
            const addon = ADDONS.find(a => a.id === id);
            return sum + (addon?.price || 0);
        }, 0);
        const subtotal = basePrice + addOnsPrice;
        const surge = Math.round(subtotal * 0.2);
        const total = subtotal + surge;
        const advance = Math.round(total * 0.5);
        return { basePrice, addOnsPrice, surge, total, advance };
    };

    const handleConfirmBooking = () => {
        const summary = calculateSummary();
        const id = `B${Math.floor(Math.random() * 9000) + 1000}`;
        const slotLabel = bookingFormData.slot === 'full' ? 'Full Day' : bookingFormData.slot === 'morning' ? 'Morning Half' : 'Evening Half';
        // Format date for display
        const dateObj = new Date(bookingFormData.date);
        const displayDate = isNaN(dateObj) ? bookingFormData.date :
            `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
        const newBooking = {
            id,
            hall: selectedHall?.name || 'Unknown',
            devotee: `${bookingFormData.firstName} ${bookingFormData.lastName}`.trim() || 'Unknown Devotee',
            date: displayDate,
            slot: slotLabel,
            status: 'Confirmed',
            amount: summary.total,
            event: bookingFormData.category.charAt(0).toUpperCase() + bookingFormData.category.slice(1)
        };
        setBookingsList(prev => [newBooking, ...prev]);
        setNewBookingId(id);
        setIsConfirmed(true);
    };

    const handleDeleteBooking = (id) => {
        setBookingsList(prev => prev.filter(b => b.id !== id));
        setDeleteConfirmId(null);
    };

    const handleStatusChange = (id, newStatus) => {
        setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        setEditingBookingId(null);
    };

    const handleAddNewHall = () => {
        if (!newHallData.name) return;
        const newHall = {
            id: `h${hallsList.length + 1}`,
            name: newHallData.name || 'New Function Space',
            tagline: 'Premium Custom Venue',
            capacity: parseInt(newHallData.capacity) || 500,
            basePrice: parseInt(newHallData.basePrice) || 30000,
            facilities: newHallData.facilities.length ? newHallData.facilities : ['AC', 'Sound', 'Kitchen'],
            image: 'https://images.unsplash.com/photo-1540333563391-6456636ef73a?q=80&w=2000'
        };
        setHallsList(prev => [...prev, newHall]);
        setNewHallData({ name: '', capacity: '', basePrice: '', strategy: 'daily', facilities: [] });
        setAddHallOpen(false);
    };

    const filteredBookings = bookingsList.filter(b =>
        b.devotee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.hall.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        totalRevenue: bookingsList.reduce((sum, b) => sum + b.amount, 0),
        confirmedBookings: bookingsList.filter(b => b.status === 'Confirmed').length,
        activeHalls: hallsList.length,
        avgUtilization: 62
    };

    const resetBooking = () => {
        setBookingStep(1); setSelectedHallId(null);
        setBookingFormData({ firstName: '', lastName: '', phone: '', email: '', category: 'marriage', guests: '', notes: '', date: '2026-04-12', slot: 'full' });
        setSelectedAddonIds([]); setIsConfirmed(false); setNewBookingId(null);
    };

    return (
        <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto p-3 md:p-6 pb-16">

            {/* Header Banner */}
            <div className="page-header-banner hall-booking-header relative overflow-hidden mb-6">
                <div className="relative z-10">
                    <h1 className="text-2xl font-display font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md hidden sm:flex">
                            <Building2 className="w-6 h-6" />
                        </div>
                        Hall Booking System
                    </h1>
                    <p className="text-sm mt-1.5 max-w-xl font-medium opacity-90">
                        Manage temple venues, monitor event schedules, and optimize space utilization.
                    </p>
                </div>
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 -left-8 w-36 h-36 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex gap-2 z-10">
                    <Button className="hall-booking-cta h-10 px-8 text-sm font-bold shadow-xl"
                        onClick={() => { resetBooking(); setActiveTab('book'); }}>
                        <Plus className="w-4 h-4 mr-2" /> New Booking
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="overflow-x-auto pb-1">
                    <TabsList className="bg-muted/40 p-1 rounded-xl h-11 md:h-12 backdrop-blur-sm border border-border/50 min-w-max">
                        {['overview', 'book', 'calendar', 'inventory', 'revenue'].map(tab => (
                            <TabsTrigger key={tab} value={tab}
                                className="data-[state=active]:bg-white data-[state=active]:text-[#293088] data-[state=active]:shadow-md rounded-lg px-3 md:px-5 font-bold transition-all text-[11px] md:text-sm capitalize">
                                {tab === 'book' ? 'Book New' : tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* ═══════════════════════════════════════════
                    OVERVIEW TAB
                ═══════════════════════════════════════════ */}
                <TabsContent value="overview" className="space-y-4 md:space-y-6 mt-4">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { label: 'Total Revenue (MTD)', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-[#293088]', bg: 'bg-[#EBECF9]', trend: '+12% from last month' },
                            { label: 'Confirmed Bookings', value: stats.confirmedBookings.toString(), icon: Calendar, color: 'text-[#E22E26]', bg: 'bg-[#F9D6D4]', trend: 'Scheduled this cycle' },
                            { label: 'Active Halls', value: stats.activeHalls.toString(), icon: Building2, color: 'text-[#4F58CA]', bg: 'bg-[#EBECF9]', trend: 'Active across premises' },
                            { label: 'Avg. Utilization', value: `${stats.avgUtilization}%`, icon: LayoutDashboard, color: 'text-[#293088]', bg: 'bg-[#EBECF9]', trend: '+5% higher than prev.' },
                        ].map((kpi, i) => (
                            <Card key={i} className="border shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-3 md:p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-0.5">{kpi.label}</p>
                                            <h3 className="text-lg md:text-2xl font-bold text-foreground">{kpi.value}</h3>
                                        </div>
                                        <div className={`${kpi.bg} ${kpi.color} p-2 md:p-2.5 rounded-xl`}>
                                            <kpi.icon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[9px] md:text-[10px] font-semibold text-muted-foreground">
                                        <span className="text-emerald-600 mr-1">↑</span>{kpi.trend}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Bookings Table - FIXED: shows newly added bookings */}
                        <Card className="lg:col-span-2 border shadow-sm overflow-hidden">
                            <CardHeader className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#293088]" />
                                    <CardTitle className="text-sm md:text-base font-bold">All Bookings ({bookingsList.length})</CardTitle>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-56">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <Input placeholder="Search devotee, hall, ID…" className="pl-8 h-8 text-xs bg-muted/50 border-none"
                                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                    </div>
                                    <Button className={`${BTN} h-8 px-3 text-[10px] font-bold whitespace-nowrap`} onClick={handleExportCSV}>
                                        <Download className="w-3 h-3 mr-1" /> CSV
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table className="min-w-[640px]">
                                    <TableHeader className="bg-muted/20">
                                        <TableRow>
                                            <TableHead className="font-bold text-[10px] uppercase h-9">ID</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase h-9">Hall & Devotee</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase h-9">Date & Slot</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase h-9 text-right">Amount</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase h-9 text-center">Status</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase h-9 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                                            <TableRow key={booking.id} className={`hover:bg-muted/10 transition-colors border-border/40 ${booking.id === newBookingId ? 'bg-emerald-50' : ''}`}>
                                                <TableCell className="font-bold text-[#293088] text-xs font-mono py-3">{booking.id}</TableCell>
                                                <TableCell className="py-3">
                                                    <div>
                                                        <p className="font-bold text-xs md:text-sm">{booking.devotee}</p>
                                                        <p className="text-[10px] text-muted-foreground">{booking.hall} • {booking.event}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <p className="font-semibold text-xs">{booking.date}</p>
                                                    <p className="text-[10px] text-muted-foreground">{booking.slot}</p>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-xs py-3">
                                                    {booking.amount > 0 ? `₹${booking.amount.toLocaleString()}` : <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    {editingBookingId === booking.id ? (
                                                        <Select value={booking.status} onValueChange={(v) => handleStatusChange(booking.id, v)}>
                                                            <SelectTrigger className="h-7 text-[10px] w-28 mx-auto">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                                <SelectItem value="Pending">Pending</SelectItem>
                                                                <SelectItem value="Locked">Locked</SelectItem>
                                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <StatusBadge status={booking.status} />
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button size="icon"
                                                            className={`${BTN} h-6 w-6 rounded-md border-border/50`}
                                                            onClick={() => setEditingBookingId(editingBookingId === booking.id ? null : booking.id)}
                                                            title="Edit status">
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="icon"
                                                            className="h-6 w-6 rounded-md bg-white text-foreground border border-border font-bold hover:bg-[#E22E26] hover:text-white hover:border-[#E22E26] transition-all"
                                                            onClick={() => setDeleteConfirmId(booking.id)}
                                                            title="Delete booking">
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                                                    No bookings found for "{searchQuery}"
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Right Side Cards */}
                        <div className="space-y-4">
                            <Card className="border shadow-sm">
                                <CardHeader className="p-4 pb-3 border-b">
                                    <div className="flex items-center gap-2">
                                        <ClipboardCheck className="w-4 h-4 text-[#293088]" />
                                        <CardTitle className="text-sm font-bold">Operational Status</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {[
                                        { hall: 'Main Hall A', status: 'Cleaning', progress: 65, color: 'bg-[#293088]' },
                                        { hall: 'Function Hall B', status: 'Ready', progress: 100, color: 'bg-emerald-500' },
                                        { hall: 'Bhojan Shala', status: 'Service', progress: 100, color: 'bg-[#4F58CA]' },
                                        { hall: 'Open Lawn', status: 'Maintenance', progress: 30, color: 'bg-amber-500' },
                                    ].map((stat, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                                <span>{stat.hall}</span>
                                                <span className={stat.progress === 100 ? "text-emerald-600" : "text-muted-foreground"}>{stat.status}</span>
                                            </div>
                                            <Progress value={stat.progress} className="h-1.5" indicatorClassName={stat.color} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border bg-indigo-50 border-indigo-100 p-4 md:p-5 relative overflow-hidden">
                                <div className="relative z-10 space-y-3">
                                    <div className="w-10 h-10 rounded-full bg-[#293088]/10 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-[#293088]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base text-[#293088]">Surge Pricing Active</h4>
                                        <p className="text-[#293088]/70 text-xs mt-1 font-medium leading-relaxed">Navratri festival surge (20%) is applied to all bookings Apr 6 – Apr 15.</p>
                                    </div>
                                    <button className={`${BTN} w-full justify-center flex items-center gap-2 text-xs h-9 rounded-lg px-4 border`}>
                                        Manage Pricing Rules <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ═══════════════════════════════════════════
                    BOOK NEW TAB
                ═══════════════════════════════════════════ */}
                <TabsContent value="book" className="mt-4">
                    <Card className="border shadow-sm overflow-visible">
                        <CardHeader className="p-4 md:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-base md:text-xl font-bold flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#293088]/10 flex items-center justify-center text-[#293088] text-sm font-bold">
                                        {bookingStep}
                                    </div>
                                    New Hall Booking Wizard
                                </CardTitle>
                                <CardDescription className="text-[11px] mt-1 font-medium">
                                    {bookingStep === 1 && "Step 1: Check Availability & Select Hall"}
                                    {bookingStep === 2 && "Step 2: Enter Devotee & Event Details"}
                                    {bookingStep === 3 && "Step 3: Choose Add-ons & Facilities"}
                                    {bookingStep === 4 && "Step 4: Review Summary & Advance Payment"}
                                </CardDescription>
                            </div>
                            <div className="flex gap-1.5 min-w-[160px] sm:min-w-[200px]">
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 cursor-pointer ${s <= bookingStep ? 'bg-[#293088]' : 'bg-muted'}`}
                                        onClick={() => s < bookingStep && setBookingStep(s)} />
                                ))}
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 md:p-8">
                            {/* STEP 1: Hall Selection */}
                            {bookingStep === 1 && (
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                                    <div className="lg:col-span-1 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase opacity-70 tracking-wider">Event Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input type="date" className="pl-10 h-10 bg-muted/30 border-border font-bold"
                                                    value={bookingFormData.date}
                                                    onChange={(e) => setBookingFormData(p => ({ ...p, date: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase opacity-70 tracking-wider">Preferred Slot</Label>
                                            <Select value={bookingFormData.slot} onValueChange={(v) => setBookingFormData(p => ({ ...p, slot: v }))}>
                                                <SelectTrigger className="h-10 bg-muted/30 border-border font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full">Full Day (6 AM – Mon 6 AM)</SelectItem>
                                                    <SelectItem value="morning">Morning Half (6 AM – 2 PM)</SelectItem>
                                                    <SelectItem value="evening">Evening Half (3 PM – 11 PM)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button className={`${BTN} w-full h-10 text-xs`}>Check Availability</Button>
                                        {selectedHall && (
                                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                                                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                                Selected: <strong>{selectedHall.name}</strong>
                                            </div>
                                        )}
                                    </div>
                                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {hallsList.map(hall => (
                                            <div key={hall.id} className={`group border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md bg-white flex flex-col ${selectedHallId === hall.id ? 'border-[#293088] ring-1 ring-[#293088]/30' : 'border-border hover:border-[#293088]/40'}`}>
                                                <div className="h-32 md:h-36 overflow-hidden relative">
                                                    <img src={hall.image} alt={hall.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
                                                        <Badge className="bg-white/90 text-[#293088] border-none font-bold shadow text-[10px]">₹{hall.basePrice.toLocaleString()}</Badge>
                                                        {selectedHallId === hall.id && (
                                                            <div className="bg-[#293088] text-white p-1 rounded-full shadow">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-3 flex-1 flex flex-col">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-foreground group-hover:text-[#293088] transition-colors">{hall.name}</h4>
                                                        <p className="text-[9px] text-[#293088]/60 font-bold uppercase tracking-widest mt-1">{hall.tagline}</p>
                                                        <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-1">
                                                            <Users className="w-3 h-3" /> {hall.capacity.toLocaleString()} Guests
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 pt-2 border-t border-border/50">
                                                        {hall.facilities.slice(0, 3).map(f => (
                                                            <span key={f} className="text-[9px] bg-muted/50 px-2 py-0.5 rounded-full font-bold text-muted-foreground uppercase">{f}</span>
                                                        ))}
                                                        {hall.facilities.length > 3 && <span className="text-[9px] text-[#293088] font-bold">+{hall.facilities.length - 3}</span>}
                                                    </div>
                                                    <Button className={`w-full mt-2 font-bold h-9 text-xs transition-all border-2 ${selectedHallId === hall.id ? 'bg-[#293088] text-white border-[#293088]' : `${BTN}`}`}
                                                        onClick={() => { setSelectedHallId(hall.id); setBookingStep(2); }}>
                                                        {selectedHallId === hall.id ? "✓ Selected" : "Select Space"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Devotee Details */}
                            {bookingStep === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-4xl mx-auto">
                                    <div className="space-y-5">
                                        <h3 className="font-bold text-base flex items-center gap-2 text-[#293088] border-b pb-2">
                                            <Users className="w-4 h-4" /> Devotee Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase opacity-70">First Name *</Label>
                                                <Input placeholder="First name" className="h-10 text-xs"
                                                    value={bookingFormData.firstName}
                                                    onChange={(e) => setBookingFormData(p => ({ ...p, firstName: e.target.value }))} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase opacity-70">Last Name</Label>
                                                <Input placeholder="Last name" className="h-10 text-xs"
                                                    value={bookingFormData.lastName}
                                                    onChange={(e) => setBookingFormData(p => ({ ...p, lastName: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase opacity-70">Mobile Number *</Label>
                                            <Input placeholder="+91 XXXX XXX XXX" className="h-10 text-xs"
                                                value={bookingFormData.phone}
                                                onChange={(e) => setBookingFormData(p => ({ ...p, phone: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase opacity-70">Email (Optional)</Label>
                                            <Input placeholder="devotee@example.com" className="h-10 text-xs"
                                                value={bookingFormData.email}
                                                onChange={(e) => setBookingFormData(p => ({ ...p, email: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <h3 className="font-bold text-base flex items-center gap-2 text-[#E22E26] border-b pb-2">
                                            <Calendar className="w-4 h-4" /> Event Details
                                        </h3>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase opacity-70">Event Category *</Label>
                                            <Select value={bookingFormData.category} onValueChange={(v) => setBookingFormData(p => ({ ...p, category: v }))}>
                                                <SelectTrigger className="h-10 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="marriage">Marriage</SelectItem>
                                                    <SelectItem value="upanayanam">Upanayanam</SelectItem>
                                                    <SelectItem value="engagement">Engagement</SelectItem>
                                                    <SelectItem value="private">Private Function</SelectItem>
                                                    <SelectItem value="religious">Religious Gathering</SelectItem>
                                                    <SelectItem value="seemantham">Seemantham</SelectItem>
                                                    <SelectItem value="annadhanam">Annadhanam</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase opacity-70">Expected Guest Count</Label>
                                            <Input type="number" placeholder="e.g. 500" className="h-10 text-xs"
                                                value={bookingFormData.guests}
                                                onChange={(e) => setBookingFormData(p => ({ ...p, guests: e.target.value }))} />
                                            {selectedHall && bookingFormData.guests && parseInt(bookingFormData.guests) > selectedHall.capacity && (
                                                <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Exceeds hall capacity of {selectedHall.capacity.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase opacity-70">Special Requirements</Label>
                                            <Input placeholder="Additional notes…" className="h-10 text-xs"
                                                value={bookingFormData.notes}
                                                onChange={(e) => setBookingFormData(p => ({ ...p, notes: e.target.value }))} />
                                        </div>
                                    </div>
                                    {!bookingFormData.firstName && (
                                        <div className="md:col-span-2 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <p className="text-xs font-medium">Please enter at least the first name to proceed.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: Add-ons */}
                            {bookingStep === 3 && (
                                <div className="space-y-6 max-w-5xl mx-auto">
                                    <h3 className="font-bold text-base flex items-center gap-2 text-[#293088] border-b pb-2">
                                        <Sparkles className="w-4 h-4" /> Enhance Your Event (Optional Add-ons)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                        {ADDONS.map((addon) => {
                                            const active = selectedAddonIds.includes(addon.id);
                                            return (
                                                <label key={addon.id} className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer bg-white ${active ? 'border-[#293088] bg-[#293088]/5 ring-1 ring-[#293088]/10' : 'border-border shadow-sm hover:border-[#293088]/40'}`}>
                                                    <Checkbox className="mt-0.5 w-5 h-5 rounded-md data-[state=checked]:bg-[#293088] data-[state=checked]:border-[#293088]"
                                                        checked={active}
                                                        onCheckedChange={() => setSelectedAddonIds(prev => active ? prev.filter(id => id !== addon.id) : [...prev, addon.id])} />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className={`font-bold text-xs ${active ? 'text-[#293088]' : 'text-foreground'}`}>{addon.title}</span>
                                                            <span className="text-[10px] font-bold text-[#293088]">₹{addon.price.toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">{addon.desc}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2.5 rounded-xl">
                                                <Info className="w-5 h-5 text-[#293088]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-[#293088]/60 tracking-widest">Add-on Total</p>
                                                <p className="text-xl font-bold text-foreground">₹{calculateSummary().addOnsPrice.toLocaleString()}
                                                    <span className="text-xs font-medium text-muted-foreground ml-2">({selectedAddonIds.length} selected)</span>
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic sm:text-right max-w-xs">Festival surcharges will be applied in the final summary step.</p>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Summary */}
                            {bookingStep === 4 && (
                                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    <div className="space-y-6">
                                        <div className="border-b pb-4">
                                            <h3 className="font-bold text-lg text-[#293088]">Booking Summary</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Review all details before confirming.</p>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Devotee', value: `${bookingFormData.firstName} ${bookingFormData.lastName}`.trim() || '(Name TBD)' },
                                                { label: 'Venue', value: selectedHall?.name || 'No Hall Selected' },
                                                { label: 'Schedule', value: `${bookingFormData.date} • ${bookingFormData.slot === 'full' ? 'Full Day' : bookingFormData.slot === 'morning' ? 'Morning' : 'Evening'} Slot` },
                                                { label: 'Guests', value: bookingFormData.guests ? `${parseInt(bookingFormData.guests).toLocaleString()} people` : 'Not specified' },
                                                { label: 'Mobile', value: bookingFormData.phone || 'Not provided' },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex justify-between items-center p-3 bg-white rounded-xl border border-border/70 hover:bg-[#E22E26] hover:text-white hover:border-[#E22E26] group transition-all cursor-default">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide group-hover:text-white/80">{label}</span>
                                                    <span className="text-sm font-bold text-foreground group-hover:text-white">{value}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-border/70 hover:bg-[#E22E26] hover:text-white hover:border-[#E22E26] group transition-all cursor-default">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide group-hover:text-white/80">Event Purpose</span>
                                                <Badge className="bg-[#293088] text-white font-bold text-[10px] uppercase group-hover:bg-white group-hover:text-[#293088] transition-all">
                                                    {bookingFormData.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                            <p className="text-[10px] font-medium text-amber-900 leading-relaxed">
                                                <strong>Notice:</strong> Hall booking requires 50% advance payment. Balance due 2 days before the event date.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <h3 className="font-bold text-base text-[#E22E26] border-b pb-2">Payment Ledger</h3>
                                        <Card className="border shadow-md overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="p-5 space-y-3">
                                                    {[
                                                        { label: 'Standard Hall Rental', value: calculateSummary().basePrice, color: '' },
                                                        { label: `Festival Surge (20%)`, value: calculateSummary().surge, color: 'text-[#E22E26]' },
                                                        { label: `Selected Add-ons (${selectedAddonIds.length})`, value: calculateSummary().addOnsPrice, color: '' },
                                                    ].map(({ label, value, color }) => (
                                                        <div key={label} className="flex justify-between text-xs">
                                                            <span className={`font-semibold text-muted-foreground uppercase tracking-wide text-[10px] ${color}`}>{label}</span>
                                                            <span className={`font-bold ${color}`}>₹{value.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                    <hr className="border-dashed border-muted-foreground/30 my-2" />
                                                    <div className="flex justify-between text-base font-bold bg-muted/40 -mx-5 px-5 py-3 border-y border-muted-foreground/5">
                                                        <span className="text-[#293088] uppercase tracking-widest text-xs">Total Amount</span>
                                                        <span>₹{calculateSummary().total.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm font-bold text-emerald-600 pt-2">
                                                        <span className="flex items-center gap-1.5 uppercase tracking-wider text-xs">
                                                            <CheckCircle2 className="w-4 h-4" /> Advance (50%)
                                                        </span>
                                                        <span>₹{calculateSummary().advance.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-[#293088] text-white p-2.5 flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                                                    <Receipt className="w-3.5 h-3.5" /> Receipt will be auto-generated
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="p-4 md:p-6 border-t bg-muted/10 flex justify-between rounded-b-xl gap-3">
                            <Button className={`${BTN} h-10 px-4 text-xs`}
                                onClick={() => bookingStep > 1 ? setBookingStep(bookingStep - 1) : resetBooking()}
                                disabled={bookingStep === 1}>
                                {bookingStep > 1 ? "← Go Back" : "Cancel"}
                            </Button>
                            <div className="flex gap-3">
                                {bookingStep < 4 ? (
                                    <Button className={`${BTN} h-10 px-6 md:px-10 text-xs font-bold shadow-md`}
                                        onClick={() => {
                                            if (bookingStep === 1 && !selectedHallId) { alert('Please select a hall first.'); return; }
                                            if (bookingStep === 2 && !bookingFormData.firstName) { alert('Please enter the devotee name.'); return; }
                                            setBookingStep(bookingStep + 1);
                                        }}>
                                        Next Step <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                ) : (
                                    <Dialog open={isConfirmed} onOpenChange={setIsConfirmed}>
                                        <DialogTrigger asChild>
                                            <Button className={`${BTN} h-10 px-8 md:px-12 text-xs font-bold shadow-lg`}
                                                onClick={handleConfirmBooking}>
                                                Confirm & Pay
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-2xl p-6 md:p-8">
                                            <DialogHeader>
                                                <DialogTitle className="text-center font-bold text-xl text-[#293088]">Booking Confirmed!</DialogTitle>
                                                <DialogDescription className="text-center py-6" asChild>
                                                    <div>
                                                        <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                                        </div>
                                                        <p className="font-bold text-foreground text-base">Booking ID: {newBookingId}</p>
                                                        <p className="text-xs mt-2 px-2 leading-relaxed font-medium text-muted-foreground">
                                                            <strong>{bookingFormData.firstName}</strong>, your booking for <strong>{selectedHall?.name}</strong> on <strong>{bookingFormData.date}</strong> is successfully secured. Advance payment of <strong>₹{calculateSummary().advance.toLocaleString()}</strong> is due.
                                                        </p>
                                                    </div>
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-2.5">
                                                <Button className={`${BTN} w-full h-11 text-sm font-bold shadow-md`}>
                                                    <Receipt className="w-4 h-4 mr-2" /> Download Receipt
                                                </Button>
                                                <Button className={`${BTN} w-full h-11 text-sm font-bold`}
                                                    onClick={() => { resetBooking(); setActiveTab('overview'); }}>
                                                    Go to Dashboard →
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ═══════════════════════════════════════════
                    CALENDAR TAB
                ═══════════════════════════════════════════ */}
                <TabsContent value="calendar" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
                        <Card className="lg:col-span-3 border shadow-sm flex flex-col">
                            <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="icon" className={`${BTN} w-8 h-8 rounded-full`}><ChevronRight className="w-4 h-4 rotate-180" /></Button>
                                    <CardTitle className="text-base font-bold">April 2026</CardTitle>
                                    <Button variant="outline" size="icon" className={`${BTN} w-8 h-8 rounded-full`}><ChevronRight className="w-4 h-4" /></Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" className={`${BTN} h-8 text-xs px-3 hidden sm:flex`}>Today</Button>
                                    <Select defaultValue="month">
                                        <SelectTrigger className="h-8 text-xs font-bold w-[85px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="month">Month</SelectItem>
                                            <SelectItem value="week">Week</SelectItem>
                                            <SelectItem value="day">Day</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <div className="min-w-[600px]">
                                    <div className="grid grid-cols-7 bg-muted/20 border-b">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="p-3 text-center text-[9px] font-bold uppercase text-muted-foreground tracking-widest">{day}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 grid-rows-5">
                                        {Array.from({ length: 35 }).map((_, i) => {
                                            const day = i - 2;
                                            const isCurrentMonth = day > 0 && day <= 30;
                                            const isToday = day === 6;
                                            const events = bookingsList.filter(b => {
                                                const d = parseInt(b.date?.split('-')[0]);
                                                return d === day;
                                            });
                                            return (
                                                <div key={i} className={`border-r border-b border-border/40 p-1.5 min-h-[80px] md:min-h-[95px] transition-colors hover:bg-muted/10 ${!isCurrentMonth ? 'opacity-30 bg-muted/5' : ''}`}>
                                                    {isCurrentMonth && (
                                                        <>
                                                            <span className={`text-[10px] md:text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-[#E22E26] text-white' : 'text-foreground'}`}>{day}</span>
                                                            <div className="mt-1 space-y-0.5">
                                                                {events.slice(0, 2).map(ev => (
                                                                    <div key={ev.id} className={`text-[7px] md:text-[8px] text-white p-0.5 md:p-1 rounded font-bold truncate shadow-sm ${ev.status === 'Confirmed' ? 'bg-[#293088]/90' : ev.status === 'Pending' ? 'bg-amber-500/90' : 'bg-slate-500/90'}`}>
                                                                        {ev.devotee.split(' ')[0]}: {ev.event}
                                                                    </div>
                                                                ))}
                                                                {events.length > 2 && <div className="text-[7px] text-muted-foreground font-bold">+{events.length - 2} more</div>}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card className="border shadow-sm">
                                <CardHeader className="p-4 pb-3 border-b">
                                    <CardTitle className="text-sm font-bold">Booking Legend</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    {[
                                        { label: 'Confirmed Booking', color: 'bg-[#293088]' },
                                        { label: 'Pending Payment', color: 'bg-amber-500' },
                                        { label: 'Internal Event', color: 'bg-[#E22E26]' },
                                        { label: 'Locked/Processing', color: 'bg-slate-500' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
                                            <span className="text-[10px] font-semibold text-muted-foreground">{item.label}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm overflow-hidden">
                                <CardHeader className="p-4 pb-3 bg-[#293088]/5 border-b">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[#E22E26]" /> Venue Map
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 aspect-square flex items-center justify-center bg-muted/20 relative">
                                    <div className="w-full h-full border-2 border-[#293088]/20 rounded-xl bg-white shadow-inner overflow-hidden flex flex-col p-3 gap-2">
                                        <div className="flex-1 flex gap-2">
                                            <div className="flex-1 border-2 border-[#293088]/20 bg-[#293088]/5 rounded-lg flex items-center justify-center text-[9px] font-bold text-[#293088] text-center px-1">HALL A</div>
                                            <div className="w-1/3 border-2 border-[#4F58CA]/20 bg-[#4F58CA]/5 rounded-lg flex items-center justify-center text-[9px] font-bold text-[#4F58CA] text-center px-1">HALL B</div>
                                        </div>
                                        <div className="h-1/3 border-2 border-emerald-200 bg-emerald-50 rounded-lg flex items-center justify-center text-[9px] font-bold text-emerald-700 uppercase tracking-wider">BHOJAN SHALA</div>
                                        <div className="h-1/4 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-[9px] font-bold text-muted-foreground uppercase bg-muted/10">TEMPLE LAWN</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick stats */}
                            <Card className="border shadow-sm">
                                <CardHeader className="p-4 pb-3 border-b">
                                    <CardTitle className="text-sm font-bold">April Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2">
                                    {[
                                        { label: 'Total Bookings', value: bookingsList.length },
                                        { label: 'Confirmed', value: bookingsList.filter(b => b.status === 'Confirmed').length },
                                        { label: 'Pending', value: bookingsList.filter(b => b.status === 'Pending').length },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-muted-foreground">{label}</span>
                                            <span className="font-bold">{value}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ═══════════════════════════════════════════
                    INVENTORY TAB
                ═══════════════════════════════════════════ */}
                <TabsContent value="inventory" className="mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9 h-10 border-border rounded-xl text-xs bg-white shadow-sm"
                                placeholder="Search halls or facilities…"
                                value={inventorySearch}
                                onChange={(e) => setInventorySearch(e.target.value)} />
                        </div>
                        <Dialog open={addHallOpen} onOpenChange={setAddHallOpen}>
                            <DialogTrigger asChild>
                                <Button className={`${BTN} h-10 w-full sm:w-auto text-xs font-bold shadow`}>
                                    <Plus className="w-4 h-4 mr-2" /> Add New Space
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
                                <DialogHeader>
                                    <DialogTitle className="font-bold text-lg">Create Hall Inventory</DialogTitle>
                                    <DialogDescription className="text-xs">Define a new space within temple premises.</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Hall Name *</Label>
                                        <Input placeholder="e.g. Meditation Hall C" className="h-10 text-xs"
                                            value={newHallData.name}
                                            onChange={(e) => setNewHallData(p => ({ ...p, name: e.target.value }))} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Max Capacity</Label>
                                        <Input type="number" placeholder="No. of people" className="h-10 text-xs"
                                            value={newHallData.capacity}
                                            onChange={(e) => setNewHallData(p => ({ ...p, capacity: e.target.value }))} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Base Price (Per Day ₹)</Label>
                                        <Input type="number" placeholder="Amount" className="h-10 text-xs"
                                            value={newHallData.basePrice}
                                            onChange={(e) => setNewHallData(p => ({ ...p, basePrice: e.target.value }))} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Pricing Strategy</Label>
                                        <Select value={newHallData.strategy} onValueChange={(v) => setNewHallData(p => ({ ...p, strategy: v }))}>
                                            <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily Flat Rate</SelectItem>
                                                <SelectItem value="hourly">Hourly Billing</SelectItem>
                                                <SelectItem value="custom">Tiered Pricing</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Available Facilities</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-muted/30 rounded-xl border border-muted-foreground/10">
                                            {['Air Conditioning', 'Audio System', 'Kitchen Access', 'Extra Seating', 'Stage Lighting', 'Basement Parking'].map(f => {
                                                const checked = newHallData.facilities.includes(f);
                                                return (
                                                    <label key={f} className="flex items-center gap-2 cursor-pointer group p-1.5 rounded-lg hover:bg-[#E22E26] hover:text-white transition-all">
                                                        <Checkbox className="bg-white data-[state=checked]:bg-[#293088] h-4 w-4 rounded"
                                                            checked={checked}
                                                            onCheckedChange={() => setNewHallData(p => ({ ...p, facilities: checked ? p.facilities.filter(x => x !== f) : [...p.facilities, f] }))} />
                                                        <span className="text-[10px] font-semibold">{f}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button className={`${BTN} w-full h-11 text-sm font-bold shadow-lg`} onClick={handleAddNewHall}>
                                        Create Hall Space
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {hallsList.filter(h => h.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                            h.facilities.some(f => f.toLowerCase().includes(inventorySearch.toLowerCase()))
                        ).map((hall) => (
                            <Card key={hall.id} className="border shadow-sm hover:shadow-xl transition-all duration-500 group overflow-visible flex flex-col">
                                <div className="relative h-40 md:h-44 overflow-hidden rounded-t-xl shrink-0">
                                    <img src={hall.image} alt={hall.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3">
                                        <h4 className="text-white font-bold text-sm leading-tight">{hall.name}</h4>
                                        <p className="text-[8px] font-bold tracking-[0.15em] uppercase mt-1 bg-white/90 text-[#293088] w-fit px-2 py-0.5 rounded">{hall.tagline}</p>
                                    </div>
                                    <Badge className="absolute top-3 left-3 bg-white/95 text-[#293088] border-none font-bold text-[9px] h-5 shadow">ID: {hall.id}</Badge>
                                    <Button size="icon" variant="ghost"
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-white/95 hover:bg-[#E22E26] hover:text-white rounded-full w-7 h-7 shadow"
                                        onClick={() => setHallsList(prev => prev.filter(h => h.id !== hall.id))}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                <CardContent className="p-4 space-y-3 flex-1">
                                    <div className="flex justify-between items-center border-b pb-3">
                                        <div className="text-center flex-1 border-r">
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Capacity</p>
                                            <p className="text-sm font-bold">{hall.capacity.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center flex-1">
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Daily Rate</p>
                                            <p className="text-sm font-bold text-[#293088]">₹{(hall.basePrice / 1000).toFixed(0)}k</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase text-center tracking-widest">Facilities</p>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {hall.facilities.slice(0, 4).map(f => (
                                                <Badge key={f} variant="secondary" className="px-2 py-0.5 text-[8px] font-bold bg-blue-50 text-[#293088] border-none uppercase">{f}</Badge>
                                            ))}
                                            {hall.facilities.length > 4 && <Badge variant="outline" className="px-2 py-0.5 text-[8px] font-bold border-dashed">+{hall.facilities.length - 4}</Badge>}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-3 bg-muted/5 rounded-b-xl gap-2">
                                    <Button className={`${BTN} flex-1 text-[10px] h-9 font-bold`}>
                                        <Edit className="w-3.5 h-3.5 mr-1" /> Config
                                    </Button>
                                    <Button className={`${BTN} flex-1 text-[10px] h-9 font-bold`}>
                                        <IndianRupee className="w-3.5 h-3.5 mr-1" /> Pricing
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}

                        {/* Add new placeholder */}
                        <div className="border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center p-8 bg-muted/5 group hover:border-[#293088]/40 hover:bg-[#293088]/5 transition-all cursor-pointer min-h-[320px] shadow-sm"
                            onClick={() => setAddHallOpen(true)}>
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#293088] group-hover:border-none transition-all duration-300">
                                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-white" />
                            </div>
                            <h4 className="font-bold text-sm text-muted-foreground group-hover:text-[#293088] transition-colors text-center leading-relaxed">
                                Add New Workspace<br />
                                <span className="text-[11px] font-medium opacity-70 tracking-normal block mt-2 px-4">Meditation Cells, Veda Patashala, or Storage</span>
                            </h4>
                        </div>
                    </div>
                </TabsContent>

                {/* ═══════════════════════════════════════════
                    REVENUE TAB
                ═══════════════════════════════════════════ */}
                <TabsContent value="revenue" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { label: 'Total FY Revenue', value: '₹16,60,000', trend: '+28% YoY' },
                            { label: 'This Month', value: `₹${bookingsList.reduce((s, b) => s + b.amount, 0).toLocaleString()}`, trend: 'Live MTD' },
                            { label: 'Avg per Booking', value: `₹${Math.round(bookingsList.filter(b => b.amount > 0).reduce((s, b) => s + b.amount, 0) / bookingsList.filter(b => b.amount > 0).length).toLocaleString()}`, trend: 'Per confirmed event' },
                            { label: 'Peak Occupancy', value: '95%', trend: 'Mar 2026' },
                        ].map((kpi, i) => (
                            <Card key={i} className="border shadow-sm">
                                <CardContent className="p-3 md:p-5">
                                    <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{kpi.label}</p>
                                    <p className="text-lg md:text-2xl font-bold">{kpi.value}</p>
                                    <p className="text-[9px] text-emerald-600 font-semibold mt-1">↑ {kpi.trend}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <Card className="border shadow-sm">
                            <CardHeader className="p-4 border-b">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-[#293088]" /> Revenue Growth Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <KPIChart data={revenueData} />
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardHeader className="p-4 border-b">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-[#E22E26]" /> Income Distribution by Hall
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 min-h-[250px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height={230}>
                                    <RePieChart>
                                        <Pie data={hallUtilization} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value"
                                            label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                                            {hallUtilization.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border shadow-sm overflow-hidden">
                        <CardHeader className="p-4 bg-muted/30 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <CardTitle className="text-sm font-bold">Comprehensive Revenue Ledger (FY 2026-27)</CardTitle>
                            <div className="flex gap-2">
                                <Button size="sm" className={`${BTN} text-[10px] h-7 px-3 font-bold`}>Monthly View</Button>
                                <Button size="sm" className={`${BTN} text-[10px] h-7 px-3 font-bold`} onClick={handleExportCSV}>
                                    <Download className="w-3 h-3 mr-1" /> Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <Table className="min-w-[640px]">
                                <TableHeader className="bg-muted/10">
                                    <TableRow>
                                        <TableHead className="font-bold text-[10px] uppercase h-10">Period</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase text-right h-10">Bookings</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase text-right h-10">Net Revenue</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase h-10">Top Space</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase text-center h-10">Efficiency</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { period: 'Apr 2026 (MTD)', count: bookingsList.length, amount: bookingsList.reduce((s, b) => s + b.amount, 0), top: 'Hall A (62%)', efficiency: 88 },
                                        { period: 'Mar 2026', count: 24, amount: 580000, top: 'Hall A (70%)', efficiency: 95 },
                                        { period: 'Feb 2026', count: 12, amount: 190000, top: 'Hall B (45%)', efficiency: 62 },
                                        { period: 'Jan 2026', count: 9, amount: 145000, top: 'Bhojan Shala (40%)', efficiency: 58 },
                                    ].map((row, i) => (
                                        <TableRow key={i} className="hover:bg-muted/10 border-border/50">
                                            <TableCell className="font-bold text-xs py-4">{row.period}</TableCell>
                                            <TableCell className="text-right font-semibold text-xs py-4">{row.count}</TableCell>
                                            <TableCell className="text-right font-bold text-[#293088] text-xs py-4">₹{row.amount.toLocaleString()}</TableCell>
                                            <TableCell className="font-medium text-xs text-muted-foreground py-4">{row.top}</TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className={`text-[10px] font-bold ${row.efficiency >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>{row.efficiency}%</span>
                                                    <Progress value={row.efficiency} className="h-1.5 w-24 sm:w-32" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ═══════════════════════════════════════════
                DELETE CONFIRM DIALOG
            ═══════════════════════════════════════════ */}
            <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="font-bold text-base text-[#E22E26]">Delete Booking?</DialogTitle>
                        <DialogDescription className="text-xs mt-2">
                            Are you sure you want to delete booking <strong>{deleteConfirmId}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-4">
                        <Button className={`${BTN} flex-1 h-10 text-xs font-bold`} onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                        <Button className="flex-1 h-10 text-xs font-bold bg-[#E22E26] text-white border border-[#E22E26] hover:bg-[#c0251f] hover:border-[#c0251f] transition-all"
                            onClick={() => handleDeleteBooking(deleteConfirmId)}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HallBookingPage;