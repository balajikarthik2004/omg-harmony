import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ReceiptText, QrCode, CreditCard, ShieldCheck, Smartphone } from 'lucide-react';
import { mockDonations } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import { formatDateDDMMYYYY } from '@/lib/utils';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

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

function mapChannel(method: string): DonationChannel {
  if (method === 'UPI' || method === 'Card') return 'Online';
  return 'Counter';
}

function mapGateway(method: string): Gateway {
  if (method === 'UPI') return 'PhonePe';
  if (method === 'Card') return 'Razorpay';
  return 'Temple POS';
}

const initialDonations: DonationRecord[] = mockDonations.map((item, idx) => ({
  id: `seed-${item.id}`,
  donationCode: item.id,
  donorName: item.donorName,
  phone: '',
  email: '',
  category: (categoryOptions.includes(item.category as DonationCategory) ? item.category : 'General') as DonationCategory,
  amount: item.amount,
  date: item.date,
  channel: mapChannel(item.paymentMethod),
  paymentMethod: (methodOptions.includes(item.paymentMethod as PaymentMethod) ? item.paymentMethod : 'Cash') as PaymentMethod,
  gateway: mapGateway(item.paymentMethod),
  transactionRef: `TXN-${item.id}`,
  paymentStatus: 'Success',
  receiptNumber: `RC-${String(idx + 1).padStart(4, '0')}`,
  notes: '',
}));

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

function money(n: number) {
  return `Rs ${n.toLocaleString('en-IN')}`;
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
  const { items, add, update, remove } = useStore<DonationRecord>(initialDonations);

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
    setForm(emptyForm);
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
      if (channel === 'Hundi') {
        return {
          ...prev,
          channel,
          donorName: prev.donorName || 'Hundi - Anonymous',
          paymentMethod: 'Cash',
          gateway: 'Temple POS',
        };
      }

      if (channel === 'Counter') {
        return { ...prev, channel, paymentMethod: 'Cash', gateway: 'Temple POS' };
      }

      return { ...prev, channel, paymentMethod: 'UPI', gateway: 'PhonePe' };
    });
  };

  const handleMethodChange = (method: PaymentMethod) => {
    setForm(prev => {
      const gateway = method === 'UPI' ? 'PhonePe' : method === 'Card' ? 'Razorpay' : 'Temple POS';
      return { ...prev, paymentMethod: method, gateway };
    });
  };

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

    if (editId) {
      update(editId, payload);
    } else {
      add({
        donationCode: nextDonationCode(items),
        receiptNumber: nextReceipt(items),
        ...payload,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-gradient-to-r from-amber-50/60 via-background to-emerald-50/60 px-4 py-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Donation</h1>
          <p className="text-sm text-muted-foreground mt-1">Hundi, online, and counter donations with receipts, accounting, and gateway flow.</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Record Donation</Button>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm p-3">
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
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                reportPeriod === option.key
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  : 'bg-muted/50 text-foreground border-transparent hover:bg-muted hover:border-border/70'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {reportPeriod === 'custom' && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 gap-2 p-2">
          <div className="rounded-lg border border-border bg-muted/10 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Collection</p>
            <p className="text-lg font-semibold mt-0.5">{money(reports.total)}</p>
          </div>

          <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Hundi</p>
            <p className="text-lg font-semibold mt-0.5">{money(reports.byChannel.Hundi)}</p>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50/40 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-blue-700">Online</p>
            <p className="text-lg font-semibold mt-0.5 text-blue-700">{money(reports.byChannel.Online)}</p>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-emerald-700">Counter</p>
            <p className="text-lg font-semibold mt-0.5 text-emerald-700">{money(reports.byChannel.Counter)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Donation Ledger</h2>
            <input
              className="w-full max-w-xs px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Search by donor, code, category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Donation ID</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Donor</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Channel</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Payment</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">No donations found for this search/period.</td>
                  </tr>
                ) : (
                  filtered.map(item => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium">{item.donationCode}</td>
                      <td className="p-3">
                        <p className="font-medium">{item.donorName}</p>
                        <p className="text-xs text-muted-foreground">{item.receiptNumber}</p>
                      </td>
                      <td className="p-3 text-muted-foreground">{item.channel}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">{item.category}</span></td>
                      <td className="p-3 text-muted-foreground">
                        {item.paymentMethod} {item.channel === 'Online' ? `(${item.gateway})` : ''}
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5">{formatDateDDMMYYYY(item.date)}</p>
                      </td>
                      <td className="p-3 text-right font-semibold">{money(item.amount)}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedReceipt(item); setReceiptOpen(true); }}>
                            <ReceiptText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Category Report</h2>
              <span className="text-xs text-muted-foreground">{periodItems.length} entries</span>
            </div>
            <div className="p-4 space-y-2">
              {reports.byCategory.map(([name, total]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-semibold">{money(total)}</span>
                </div>
              ))}
              {reports.byCategory.length === 0 && <p className="text-sm text-muted-foreground">No data for selected period.</p>}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <h2 className="text-sm font-semibold">Payment Mix</h2>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Cash</span><span className="font-semibold">{money(reports.byMethod.Cash)}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">UPI</span><span className="font-semibold">{money(reports.byMethod.UPI)}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Card</span><span className="font-semibold">{money(reports.byMethod.Card)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Donation Entry' : 'Record Donation'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Channel</label>
              <select
                value={form.channel}
                onChange={e => handleChannelChange(e.target.value as DonationChannel)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {channelOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value as DonationCategory }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Donor Name</label>
              <input
                value={form.donorName}
                onChange={e => setForm(prev => ({ ...prev, donorName: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                placeholder={form.channel === 'Hundi' ? 'Hundi - Anonymous' : 'Enter donor name'}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Amount (Rs)</label>
              <input
                type="number"
                value={String(form.amount)}
                onChange={e => setForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <input
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={e => handleMethodChange(e.target.value as PaymentMethod)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                disabled={form.channel === 'Hundi'}
              >
                {(form.channel === 'Online' ? ['UPI', 'Card'] : ['Cash']).map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          {form.channel === 'Online' && (
            <div className="rounded-xl border border-border bg-slate-50/60 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Payment Gateway (Static Demo)</p>
                  <p className="text-xs text-muted-foreground">Real payment UI preview for future integration.</p>
                </div>
                <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Secure
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Payment Gateway</label>
                <select
                  value={form.gateway}
                  onChange={e => setForm(prev => ({ ...prev, gateway: e.target.value as Gateway }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {(form.paymentMethod === 'UPI' ? ['PhonePe', 'PayU', 'Razorpay'] : ['Razorpay', 'PayU']).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {form.paymentMethod === 'UPI' ? (
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-foreground inline-flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> UPI Checkout</p>
                    <span className="text-[11px] text-muted-foreground">Gateway: {form.gateway}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-md border border-dashed border-border flex items-center justify-center bg-muted/40">
                      <QrCode className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Scan QR with any UPI app</p>
                      <p className="mt-1">UPI ID: templeharmony@{form.gateway.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-foreground inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Card Checkout</p>
                    <span className="text-[11px] text-muted-foreground">Gateway: {form.gateway}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="h-9 rounded-md border border-border bg-muted/30 px-2 flex items-center text-muted-foreground">Card Number (demo)</div>
                    <div className="h-9 rounded-md border border-border bg-muted/30 px-2 flex items-center text-muted-foreground">Card Holder</div>
                    <div className="h-9 rounded-md border border-border bg-muted/30 px-2 flex items-center text-muted-foreground">MM/YY</div>
                    <div className="h-9 rounded-md border border-border bg-muted/30 px-2 flex items-center text-muted-foreground">CVV</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
              placeholder="Optional note for internal accounting"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save & Generate Receipt</Button>
          </div>
        </div>
      </Modal>

      <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Donation Receipt">
        {selectedReceipt && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 bg-muted/20">
              <div className="flex justify-between items-center">
                <p className="font-semibold">{selectedReceipt.receiptNumber}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{selectedReceipt.paymentStatus}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <p><span className="text-muted-foreground">Donation ID:</span> {selectedReceipt.donationCode}</p>
                <p><span className="text-muted-foreground">Date:</span> {formatDateDDMMYYYY(selectedReceipt.date)}</p>
                <p><span className="text-muted-foreground">Donor:</span> {selectedReceipt.donorName}</p>
                <p><span className="text-muted-foreground">Category:</span> {selectedReceipt.category}</p>
                <p><span className="text-muted-foreground">Channel:</span> {selectedReceipt.channel}</p>
                <p><span className="text-muted-foreground">Method:</span> {selectedReceipt.paymentMethod}</p>
                <p><span className="text-muted-foreground">Gateway:</span> {selectedReceipt.gateway}</p>
                <p><span className="text-muted-foreground">Txn Ref:</span> {selectedReceipt.transactionRef}</p>
                <p className="col-span-2"><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">{money(selectedReceipt.amount)}</span></p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setReceiptOpen(false)}>Close</Button>
              <Button className="flex-1" onClick={() => window.print()}>Print Receipt</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Delete Donation"
        message="Are you sure you want to delete this donation record?"
      />
    </div>
  );
};

export default DonationsPage;
