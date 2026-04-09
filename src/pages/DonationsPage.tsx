import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus, Pencil, Trash2, ReceiptText, QrCode, CreditCard,
  ShieldCheck, Smartphone, Target, HandHeart, Search, Filter,
  Crown, Award, Medal, Users, Send, TrendingUp, History,
  UserCheck, AlertTriangle, BarChart3, LayoutList,
  Phone, Mail, Calendar
} from 'lucide-react';
import { mockDonations } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import { formatDateDDMMYYYY } from '@/lib/utils';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';

type DonorTier = 'Platinum' | 'Gold' | 'Silver' | 'Member';

interface DonorProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalAmount: number;
  frequency: number;
  lastDonationDate: string;
  preferredCategory: string;
  tier: DonorTier;
  isInactive: boolean;
}

type DonationChannel = 'Hundi' | 'Online' | 'Counter';
type DonationCategory = 'General' | 'Annadanam' | 'Temple Renovation' | 'Festival Fund' | 'Education' | 'Medical Aid';
type PaymentMethod = 'Cash' | 'UPI' | 'Card';
type Gateway = 'Razorpay' | 'PayU' | 'PhonePe' | 'Temple POS';
type ReportPeriod = 'all' | 'today' | 'week' | 'month' | 'custom';

type DonationRecord = {
  id: string;
  donationCode: string;
  donorName: string;
  phone: string;
  email: string;
  category: DonationCategory;
  amount: number;
  date: string;
  channel: DonationChannel;
  paymentMethod: PaymentMethod;
  gateway: Gateway;
  transactionRef: string;
  paymentStatus: 'Success' | 'Pending' | 'Failed';
  receiptNumber: string;
  notes: string;
};

const channelOptions: DonationChannel[] = ['Hundi', 'Online', 'Counter'];
const categoryOptions: DonationCategory[] = ['General', 'Annadanam', 'Temple Renovation', 'Festival Fund', 'Education', 'Medical Aid'];
const methodOptions: PaymentMethod[] = ['Cash', 'UPI', 'Card'];

function money(n: number) {
  return `₹ ${n.toLocaleString('en-IN')}`;
}

const emptyForm = {
  donorName: '',
  phone: '',
  email: '',
  category: 'General' as DonationCategory,
  amount: 0,
  date: '',
  channel: 'Counter' as DonationChannel,
  paymentMethod: 'Cash' as PaymentMethod,
  gateway: 'Temple POS' as Gateway,
  notes: '',
};

function nextDonationCode(records: DonationRecord[]) {
  const max = records.reduce((acc, rec) => {
    const m = rec.donationCode.match(/^DN(\d+)$/i);
    if (!m) return acc;
    const v = Number(m[1]);
    return Number.isFinite(v) ? Math.max(acc, v) : acc;
  }, 0);
  return `DN${String(max + 1).padStart(3, '0')}`;
}

function nextReceipt(records: DonationRecord[]) {
  const max = records.reduce((acc, rec) => {
    const m = rec.receiptNumber.match(/^RC-(\d+)$/i);
    if (!m) return acc;
    const v = Number(m[1]);
    return Number.isFinite(v) ? Math.max(acc, v) : acc;
  }, 0);
  return `RC-${String(max + 1).padStart(4, '0')}`;
}

function createTxnRef(gateway: Gateway) {
  const prefix = gateway.slice(0, 2).toUpperCase();
  const serial = Date.now().toString().slice(-6);
  return `${prefix}-${serial}`;
}

function inSelectedPeriod(dateText: string, period: ReportPeriod, start: string, end: string) {
  if (!dateText) return false;
  if (period === 'all') return true;

  const target = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(target.getTime())) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'today') {
    return target.getTime() === today.getTime();
  }

  if (period === 'week') {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    return target >= weekStart && target <= today;
  }

  if (period === 'month') {
    return target.getMonth() === today.getMonth() && target.getFullYear() === today.getFullYear();
  }

  if (!start || !end) return true;

  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T23:59:59`);
  return target >= from && target <= to;
}

const DonationsPage: React.FC = () => {
  const { items, add, update, remove } = useStore<DonationRecord>(mockDonations as DonationRecord[]);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [activeTab, setActiveTab] = useState<'ledger' | 'analytics'>('ledger');
  const [selectedProfile, setSelectedProfile] = useState<DonorProfile | null>(null);

  const donorProfiles = useMemo(() => {
    const profiles: DonorProfile[] = [];
    const donorsMap = new Map<string, DonationRecord[]>();

    items.forEach(rec => {
      const key = rec.phone || rec.donorName;
      if (!donorsMap.has(key)) donorsMap.set(key, []);
      donorsMap.get(key)!.push(rec);
    });

    donorsMap.forEach((donations, key) => {
      const latest = donations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
      const frequency = donations.length;

      const catCounts: Record<string, number> = {};
      donations.forEach(d => catCounts[d.category] = (catCounts[d.category] || 0) + 1);
      const preferredCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];

      const lastDate = new Date(latest.date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const isInactive = lastDate < sixMonthsAgo;

      let tier: DonorTier = 'Member';
      if (totalAmount >= 100000 || (totalAmount >= 50000 && frequency >= 10)) tier = 'Platinum';
      else if (totalAmount >= 25000 || (totalAmount >= 10000 && frequency >= 5)) tier = 'Gold';
      else if (totalAmount >= 5000 || frequency >= 2) tier = 'Silver';

      profiles.push({
        id: key,
        name: latest.donorName,
        phone: latest.phone,
        email: latest.email,
        totalAmount,
        frequency,
        lastDonationDate: latest.date,
        preferredCategory,
        tier,
        isInactive
      });
    });

    return profiles.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [items]);

  const periodItems = useMemo(
    () => items.filter(item => inSelectedPeriod(item.date, reportPeriod, customFrom, customTo)),
    [items, reportPeriod, customFrom, customTo]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return periodItems;
    return periodItems.filter(item =>
      item.donationCode.toLowerCase().includes(q) ||
      item.receiptNumber.toLowerCase().includes(q) ||
      item.donorName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.channel.toLowerCase().includes(q)
    );
  }, [periodItems, search]);

  const reports = useMemo(() => {
    const total = periodItems.reduce((sum, item) => sum + item.amount, 0);
    const byChannel: Record<DonationChannel, number> = { Hundi: 0, Online: 0, Counter: 0 };
    const byMethod: Record<PaymentMethod, number> = { Cash: 0, UPI: 0, Card: 0 };
    const byCategory: Record<string, number> = {};

    for (const item of periodItems) {
      byChannel[item.channel] += item.amount;
      byMethod[item.paymentMethod] += item.amount;
      byCategory[item.category] = (byCategory[item.category] ?? 0) + item.amount;
    }

    return {
      total,
      byChannel,
      byMethod,
      byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
    };
  }, [periodItems]);

  const openAdd = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (item: DonationRecord) => {
    setForm({
      donorName: item.donorName,
      phone: item.phone,
      email: item.email,
      category: item.category,
      amount: item.amount,
      date: item.date,
      channel: item.channel,
      paymentMethod: item.paymentMethod,
      gateway: item.gateway,
      notes: item.notes,
    });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleChannelChange = (channel: DonationChannel) => {
    setForm(prev => {
      if (channel === 'Hundi') return { ...prev, channel, donorName: prev.donorName || 'Hundi - Anonymous', paymentMethod: 'Cash', gateway: 'Temple POS' };
      if (channel === 'Counter') return { ...prev, channel, paymentMethod: 'Cash', gateway: 'Temple POS' };
      return { ...prev, channel, paymentMethod: 'UPI', gateway: 'PhonePe' };
    });
  };

  const handleMethodChange = (method: PaymentMethod) => {
    setForm(prev => {
      const gateway = method === 'UPI' ? 'PhonePe' : method === 'Card' ? 'Razorpay' : 'Temple POS';
      return { ...prev, paymentMethod: method, gateway };
    });
  };

  const setFormField = (key: string, val: string | number) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!form.amount || !form.date || !form.category) return;
    const gatewayNeeded = form.channel === 'Online' && (form.paymentMethod === 'UPI' || form.paymentMethod === 'Card');

    const payload = {
      donorName: form.donorName.trim() || 'Anonymous Donor',
      phone: form.phone,
      email: form.email,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      channel: form.channel,
      paymentMethod: form.paymentMethod,
      gateway: form.gateway,
      transactionRef: gatewayNeeded ? createTxnRef(form.gateway) : '-',
      paymentStatus: 'Success' as const,
      notes: form.notes,
    };

    if (editId) update(editId, payload);
    else add({ donationCode: nextDonationCode(items), receiptNumber: nextReceipt(items), ...payload });
    setModalOpen(false);
  };

  return (
    <div className="donations-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner donations-header">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><HandHeart className="w-5 h-5 text-foreground" /> Donation Ledger & Receipts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage Hundi, online, and counter donations with integrated digital receipts.</p>
        </div>
        <Button onClick={openAdd} className="donations-cta shadow-md hover:shadow-lg bg-primary hover:opacity-90 text-foreground"><Plus className="h-4 w-4 mr-2" />Record Donation</Button>
      </div>

      <div className="flex bg-muted/40 p-1 rounded-xl w-fit border border-border/60 mb-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ledger' ? 'bg-card text-foreground shadow-sm border border-border/40' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <LayoutList className="w-4 h-4" /> Transaction Ledger
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-card text-secondary shadow-sm border border-border/40 font-display' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <BarChart3 className="w-4 h-4" /> Donor Analytics System {donorProfiles.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] rounded-full border border-secondary/20">{donorProfiles.length}</span>}
        </button>
      </div>

      {activeTab === 'ledger' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
          <div className="donations-filter-bar flex flex-col sm:flex-row items-center gap-3 justify-between bg-card p-3 rounded-xl border border-border shadow-sm flex-wrap">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'Last 7 Days' },
                { key: 'month', label: 'This Month' },
                { key: 'custom', label: 'Custom Range' },
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setReportPeriod(option.key as ReportPeriod)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border ${reportPeriod === option.key
                    ? 'bg-primary/10 text-foreground border-primary/20 shadow-sm scale-105'
                    : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/80 hover:text-foreground'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {reportPeriod === 'custom' && (
              <div className="flex items-center gap-2 animate-fade-in bg-muted/20 p-1.5 rounded-lg border border-border">
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none hover:border-border transition-all" />
                <span className="text-muted-foreground text-xs font-bold">—</span>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none hover:border-border transition-all" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-stagger">
            <div className="stat-card donations-stat-card flex flex-col justify-between border-primary/20 bg-primary/5">
              <p className="text-[11px] uppercase tracking-widest font-bold text-foreground mb-1 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Total Collection</p>
              <div className="flex items-end justify-between mt-auto pt-2">
                <p className="text-3xl font-display font-bold text-foreground tracking-tight">{money(reports.total)}</p>
              </div>
            </div>

            <div className="stat-card donations-stat-card flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-muted/40 rounded-bl-[100%] transition-transform group-hover:scale-110" />
              <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Hundi Drop</p>
              <p className="text-2xl font-bold text-foreground mt-2">{money(reports.byChannel.Hundi)}</p>
            </div>

            <div className="stat-card donations-stat-card flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-bl-[100%] transition-transform group-hover:scale-110" />
              <p className="text-[11px] uppercase tracking-widest font-bold text-amber-500 mb-1">Online Transfer</p>
              <p className="text-2xl font-bold text-amber-500 mt-2">{money(reports.byChannel.Online)}</p>
            </div>

            <div className="stat-card donations-stat-card flex flex-col justify-between relative overflow-hidden group bg-emerald-500/5 border-emerald-500/20">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-[100%] transition-transform group-hover:scale-110" />
              <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-500 mb-1">Office Counter</p>
              <p className="text-2xl font-bold text-emerald-500 mt-2">{money(reports.byChannel.Counter)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            <div className="section-panel donations-ledger-panel shadow-sm xl:col-span-3">
              <div className="section-panel-header gap-3 border-b border-border/60 pb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2"><Filter className="w-4 h-4 text-foreground" /> Donation Master Ledger</h2>
                <div className="relative flex-1 max-w-sm ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className="w-full h-10 pl-9 pr-3 text-sm border border-input rounded-lg bg-background/60 hover:border-border transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
                    placeholder="Search ref code, donor, category..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[40%] text-xs">Donor & Category</th>
                      <th className="text-left py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[25%] text-xs">Donation Details</th>
                      <th className="text-right py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[20%] text-xs">Amount</th>
                      <th className="text-right py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[15%] text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background">
                    {filtered.length === 0 ? <tr><td colSpan={4} className="p-10 text-center text-muted-foreground border-b border-border">No donations found. Check active filters.</td></tr> : filtered.map(item => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-3 align-top">
                          <div className="flex flex-col gap-0.5">
                            <p className="font-bold text-foreground text-sm flex items-center gap-2">
                              {item.donorName}
                              <span className="text-[9px] px-1.5 py-0.5 bg-muted font-mono rounded text-muted-foreground">{item.donationCode}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-accent text-[10px] font-bold tracking-wider uppercase italic">{item.category}</span>
                              <span className="text-[9px] text-muted-foreground font-medium">• {item.channel}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 align-top whitespace-nowrap">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-bold text-foreground text-[10px] whitespace-nowrap">{item.paymentMethod}</span>
                            {item.channel === 'Online' && <span className="text-[9px] bg-muted/60 border border-border/60 px-1 py-0.5 rounded font-semibold text-muted-foreground">{item.gateway}</span>}
                          </div>
                          <p className="text-[10px] font-medium text-muted-foreground">{formatDateDDMMYYYY(item.date)}</p>
                        </td>
                        <td className="py-4 px-3 align-top text-right font-display font-bold text-foreground text-lg tracking-tight pt-3 whitespace-nowrap">{money(item.amount)}</td>
                        <td className="py-4 px-3 align-top text-right text-foreground">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedReceipt(item); setReceiptOpen(true); }} className="h-8 w-8 hover:bg-primary/10 hover:text-foreground shadow-sm border border-border/50 bg-background" title="View Digital Receipt">
                              <ReceiptText className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)} title="Edit Record"><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground" title="Delete Record"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div></div>
            </div>

            <div className="space-y-5 xl:sticky xl:top-4 self-start">
              <div className="section-panel donations-side-panel shadow-sm">
                <div className="section-panel-header border-b border-border/60">
                  <h2 className="text-sm font-semibold">Fund Allocation</h2>
                  <span className="text-[10px] bg-primary/10 text-foreground font-bold rounded-full px-2 py-0.5">{periodItems.length} records</span>
                </div>
                <div className="p-3 max-h-[350px] overflow-y-auto">
                  {reports.byCategory.map(([name, total]) => {
                    const pct = reports.total > 0 ? (total / reports.total) * 100 : 0;
                    return (
                      <div key={name} className="flex flex-col gap-1 p-3 hover:bg-muted/40 rounded-xl transition-colors border border-transparent hover:border-border/60">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-bold text-foreground text-xs">{name}</span>
                          <span className="font-bold text-foreground">{money(total)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted/60 border border-border/40 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[9px] text-muted-foreground font-bold text-right tracking-wider">{pct.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                  {reports.byCategory.length === 0 && <p className="p-5 text-sm text-center text-muted-foreground italic font-medium">No category data present.</p>}
                </div>
              </div>

              <div className="section-panel donations-side-panel shadow-sm">
                <div className="section-panel-header border-b border-border/60">
                  <h2 className="text-sm font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-foreground" /> Settlement Sources</h2>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/10 hover:border-primary/20 transition-colors">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cash</span>
                    <span className="font-bold text-base text-foreground">{money(reports.byMethod.Cash)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-secondary/20 bg-secondary/10 hover:border-secondary/30 transition-colors">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">UPI Scan</span>
                    <span className="font-bold text-base text-amber-500">{money(reports.byMethod.UPI)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Card Swipe</span>
                    <span className="font-bold text-base text-emerald-500">{money(reports.byMethod.Card)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="donor-segmentation-engine space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4 section-panel border-t-4 border-t-primary shadow-sm">
              <div className="section-panel-header border-b border-border/60">
                <h3 className="font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-foreground" /> Executive Donor Board</h3>
              </div>
              <div className="table-container border-0 shadow-none"><div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Patron Ranking</th>
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Classification</th>
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Contribution Value</th>
                      <th className="text-right p-4 font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorProfiles.slice(0, 15).map((profile, idx) => {
                      const tierStyles = {
                        Platinum: 'text-foreground bg-primary/10 border-primary/20',
                        Gold: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                        Silver: 'text-muted-foreground bg-muted border-border',
                        Member: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                      }[profile.tier];
                      const TierIcon = { Platinum: Crown, Gold: Medal, Silver: Award, Member: Users }[profile.tier];

                      return (
                        <tr key={profile.id} className="group border-b border-border/40 transition-colors hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${idx < 3 ? 'bg-primary text-foreground shadow-sm scale-110' : 'bg-muted text-muted-foreground'}`}>{idx + 1}</div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground text-sm">{profile.name}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5"><History className="w-3 h-3" /> Last: {formatDateDDMMYYYY(profile.lastDonationDate)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center w-fit gap-1.5 ${tierStyles}`}>
                              <TierIcon className="w-3 h-3" /> {profile.tier}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-display font-bold text-foreground text-base">{money(profile.totalAmount)}</span>
                              <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">{profile.preferredCategory} Patron</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-mono font-bold text-sm text-foreground">{profile.frequency}x <span className="text-[10px] text-muted-foreground uppercase font-sans tracking-wide">Times</span></span>
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold px-2 mt-1 hover:bg-primary/10 hover:text-foreground rounded-lg group-hover:visible invisible" onClick={() => setSelectedProfile(profile)}>
                                Detailed View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div></div>
            </div>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Manage Donation Entry' : 'Record New Donation'}>
        <div className="space-y-5 px-1 pb-4 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Collection Channel</label>
              <select value={form.channel} onChange={e => handleChannelChange(e.target.value as DonationChannel)} className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm text-foreground transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm">
                {channelOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Designated Category</label>
              <select value={form.category} onChange={e => setFormField('category', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm text-foreground transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm">
                {categoryOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
            <FormField label="Donor Full Name" value={form.donorName} onChange={v => setFormField('donorName', v)} placeholder={form.channel === 'Hundi' ? 'Hundi - Anonymous' : 'Enter donor name'} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Donation Amount (₹)</label>
              <input type="number" value={String(form.amount)} onChange={e => setFormField('amount', Number(e.target.value))} className="w-full h-10 rounded-lg border border-input bg-card hover:border-primary/20 px-3 transition-all focus:border-primary font-display font-bold text-xl outline-none focus:ring-2 focus:ring-primary/10 shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 opacity-90">
            <FormField label="Phone Number" value={form.phone} onChange={v => setFormField('phone', v)} placeholder="+91" disabled={form.channel === 'Hundi'} />
            <FormField label="Email Address" value={form.email} onChange={v => setFormField('email', v)} type="email" placeholder="example@email.com" disabled={form.channel === 'Hundi'} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Mode of Payment</label>
              <select value={form.paymentMethod} onChange={e => handleMethodChange(e.target.value as PaymentMethod)} disabled={form.channel === 'Hundi'} className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm text-foreground transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm">
                {(form.channel === 'Online' ? ['UPI', 'Card'] : ['Cash']).map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <FormField label="Receipt Date" value={form.date} onChange={v => setFormField('date', v)} type="date" />
          </div>

          {form.channel === 'Online' && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm mt-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-bold text-foreground">Secure Payment Processing</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Simulation frame for active payment portal.</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded border border-primary/20 bg-primary/10 text-foreground font-bold uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" /> E2E Secure
                </span>
              </div>

              <div className="space-y-1.5 relative z-10">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select Payment Gateway</label>
                <select value={form.gateway} onChange={e => setFormField('gateway', e.target.value)} className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-medium">
                  {(form.paymentMethod === 'UPI' ? ['PhonePe', 'PayU', 'Razorpay'] : ['Razorpay', 'PayU']).map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              {form.paymentMethod === 'UPI' ? (
                <div className="rounded-xl border border-border/80 bg-background p-5 shadow-sm relative z-10 border-dashed">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-foreground inline-flex items-center gap-2"><Smartphone className="h-4 w-4 text-foreground" /> Dynamic QR Code</p>
                    <span className="text-[9px] font-bold tracking-widest text-foreground bg-primary/10 border border-primary/20 px-2 py-0.5 rounded shadow-sm">{form.gateway}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 rounded-xl border border-border/80 flex items-center justify-center bg-muted/20 shadow-sm relative">
                      <QrCode className="h-10 w-10 text-muted-foreground/40" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent flex items-center justify-center border-2 border-primary border-t-transparent border-r-transparent animate-spin rounded-xl" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <p className="font-semibold text-foreground">Scan via any UPI App</p>
                      <p className="px-2 py-1.5 bg-muted/40 border border-border/50 rounded-md font-mono text-[10px] text-foreground font-semibold inline-block">tepmle_hash@{form.gateway.toLowerCase()}</p>
                      <p className="text-[10px] italic pt-1">Awaiting scanner confirmation...</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border/80 bg-background p-5 shadow-sm relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-foreground inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-foreground" /> Credit/Debit Card Details</p>
                    <span className="text-[9px] font-bold tracking-widest text-foreground bg-primary/10 border border-primary/20 px-2 py-0.5 rounded shadow-sm">{form.gateway}</span>
                  </div>
                  <div className="space-y-3 text-xs font-mono">
                    <div className="h-11 rounded-lg border border-border bg-muted/10 px-3 flex items-center text-muted-foreground tracking-widest border-dashed">XXXX XXXX XXXX XXXX</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-11 rounded-lg border border-border bg-muted/10 px-3 flex items-center text-muted-foreground border-dashed">MM / YY</div>
                      <div className="h-11 rounded-lg border border-border bg-muted/10 px-3 flex items-center text-muted-foreground border-dashed">CVV</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5 mt-4 pt-2">
            <label className="text-sm font-medium text-foreground">Internal Notes & Reference Info (Optional)</label>
            <textarea value={form.notes} onChange={e => setFormField('notes', e.target.value)} className="w-full rounded-lg border border-input bg-background/60 hover:border-border p-3 text-sm min-h-[90px] resize-none transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm" placeholder="Any specific wishes or instructions from the donor..." />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border/60">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 py-5">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 py-5 shadow-md">Complete Transaction & Issue Receipt</Button>
          </div>
        </div>
      </Modal>

      <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Official Tax Receipt">
        {selectedReceipt && (
          <div className="space-y-5 animate-fade-in px-1 pb-1">
            <div className="rounded-2xl border-2 border-border p-6 bg-card relative overflow-hidden shadow-[inset_0_4px_24px_-8px_rgba(0,0,0,0.05)] pt-7">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

              <div className="flex flex-col items-center justify-center border-b border-border/60 pb-6 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 border border-primary/20">
                  <ShieldCheck className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground">Temple Governance Trust</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-1">Reg No: THT-8832-IN · Official Acknowledgement</p>
              </div>

              <div className="flex items-center justify-between mb-6 bg-muted/40 p-3 rounded-lg border border-border/60">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Receipt Number</p>
                  <p className="font-mono font-bold text-lg text-foreground tracking-wider">{selectedReceipt.receiptNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Issued Date</p>
                  <p className="font-bold text-foreground text-sm">{formatDateDDMMYYYY(selectedReceipt.date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm mb-6">
                <div className="col-span-2">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Received with thanks from</p>
                  <p className="font-bold text-lg text-foreground">{selectedReceipt.donorName}</p>
                  {selectedReceipt.phone && <p className="text-xs text-muted-foreground font-medium mt-0.5">{selectedReceipt.phone} {selectedReceipt.email && `· ${selectedReceipt.email}`}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Fund Category</p>
                  <span className="px-2.5 py-1 bg-accent/10 border border-accent/20 rounded font-bold text-accent text-[11px] uppercase tracking-wide inline-block">{selectedReceipt.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Payment Mode</p>
                  <p className="font-bold text-foreground text-xs uppercase tracking-wider bg-muted/60 border border-border/60 inline-block px-2.5 py-1 rounded">{selectedReceipt.channel} · {selectedReceipt.paymentMethod}</p>
                </div>

                {selectedReceipt.transactionRef !== '-' && (
                  <div className="col-span-2 pt-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Transaction Reference</p>
                    <p className="font-mono text-[11px] px-2 py-1 bg-primary/10 border border-primary/20 rounded inline-block font-semibold text-foreground">{selectedReceipt.transactionRef}</p>
                  </div>
                )}
              </div>

              <div className="pt-5 border border-dashed border-border/50 flex items-center justify-between bg-muted/40 p-4 rounded-xl shadow-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Sum of Rupees</p>
                  <StatusBadge status={selectedReceipt.paymentStatus} />
                </div>
                <p className="text-3xl font-display font-bold text-foreground tracking-tight">{money(selectedReceipt.amount)}</p>
              </div>

              <p className="text-[10px] italic text-center text-muted-foreground mt-6 font-medium px-4">Donations made to the temple are eligible for tax deduction under Section 80G. May the divine blessings be upon abundance.</p>
            </div>

            <div className="flex gap-3 pt-3">
              <Button variant="outline" className="flex-1 h-12 text-[13px] font-bold tracking-wide" onClick={() => setReceiptOpen(false)}>Close Window</Button>
              <Button className="flex-1 h-12 shadow-lg bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-wider text-[13px]" onClick={() => window.print()}><ReceiptText className="w-4 h-4 mr-2" />Print Document</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Ledger Entry" message="Are you absolutely sure you want to permanently delete this donation record? This will alter financial audit trails." />

      <Modal open={!!selectedProfile} onClose={() => setSelectedProfile(null)} title="Patron Contribution Insight">
        {selectedProfile && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-2">
            {/* Header Profile Section */}
            <div className="bg-card p-6 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-foreground text-2xl font-bold shadow-lg">
                  {selectedProfile.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">{selectedProfile.name}</h3>
                    <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5 
                        ${selectedProfile.tier === 'Platinum' ? 'bg-primary/10 text-foreground border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                      {selectedProfile.tier}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium"><Phone className="w-3.5 h-3.5" /> {selectedProfile.phone || 'No phone recorded'}</p>
                    {selectedProfile.email && <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium"><Mail className="w-3.5 h-3.5" /> {selectedProfile.email}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Contribution Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-muted/5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Lifetime Value</p>
                <p className="text-2xl font-display font-bold text-foreground">{money(selectedProfile.totalAmount)}</p>
                <p className="text-[10px] text-foreground/70 font-semibold italic mt-1">Gross Cumulative Contribution</p>
              </div>
              <div className="p-5 rounded-2xl border border-border bg-muted/5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Engagement</p>
                <p className="text-2xl font-display font-bold text-foreground">{selectedProfile.frequency} Submissions</p>
                <p className="text-[10px] text-muted-foreground font-semibold italic mt-1">Average Frequency Level</p>
              </div>
            </div>

            {/* Behavioral Summary */}
            <div className="space-y-4">
              <div className="section-panel bg-card border border-border shadow-none overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-foreground flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Focus Category</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{selectedProfile.preferredCategory}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Last Visit</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{formatDateDDMMYYYY(selectedProfile.lastDonationDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl flex items-center justify-between border ${selectedProfile.isInactive ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30' : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedProfile.isInactive ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-indigo-600 text-white shadow-indigo-200'} shadow-md`}>
                    {selectedProfile.isInactive ? <AlertTriangle className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-foreground">{selectedProfile.isInactive ? 'Dormant Patron' : 'Active Contributor'}</p>
                    <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-medium italic mt-0.5">{selectedProfile.isInactive ? 'No records found in the last 6 months' : 'Consistent engagement history detected'}</p>
                  </div>
                </div>
                {selectedProfile.isInactive && (
                  <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold bg-white dark:bg-card text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                    Initiate Re-engage
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedProfile(null)} className="flex-1 py-5 font-bold tracking-tight">Close Profile</Button>
              <Button className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold tracking-tight">Issue Personalized Gratitude</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DonationsPage;
