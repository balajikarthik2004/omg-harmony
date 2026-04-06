import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Eye, CheckCircle, XCircle, FileClock, IndianRupee, Truck, Calendar, DollarSign, PackageOpen, LayoutGrid, AlertCircle, BrainCircuit, ShieldCheck, Mail, Send } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';

// Mock data based on the image
const mockProcurements = [
  { 
    id: '1', 
    poNumber: 'PO-1042', 
    vendor: 'Sri Pooja Supplies', 
    amount: 45000, 
    date: 'Feb 20, 2026', 
    status: 'Approved',
    items: [
      { name: 'Incense Sticks', quantity: 50, price: 500 },
      { name: 'Camphor', quantity: 20, price: 800 }
    ],
    submittedBy: 'manager1',
    submittedByName: 'Ramesh Kumar',
    approvedBy: 'admin1',
    approvedByName: 'Admin User',
    approvedDate: 'Feb 21, 2026',
    rejectedBy: null,
    rejectedDate: null,
    rejectionReason: ''
  },
  { 
    id: '2', 
    poNumber: 'PO-1043', 
    vendor: 'Kitchen World', 
    amount: 120000, 
    date: 'Feb 22, 2026', 
    status: 'Pending',
    items: [
      { name: 'Rice (50kg)', quantity: 10, price: 5000 },
      { name: 'Toor Dal (10kg)', quantity: 5, price: 3000 },
      { name: 'Cooking Oil (15L)', quantity: 2, price: 4000 }
    ],
    submittedBy: 'manager2',
    submittedByName: 'Suresh Yadav',
    approvedBy: null,
    approvedByName: null,
    approvedDate: null,
    rejectedBy: null,
    rejectedDate: null,
    rejectionReason: ''
  },
  { 
    id: '3', 
    poNumber: 'PO-1041', 
    vendor: 'Electrical Corp', 
    amount: 88000, 
    date: 'Feb 18, 2026', 
    status: 'Rejected',
    items: [
      { name: 'LED Lights - 20W', quantity: 20, price: 40000 },
      { name: 'Copper Wires (100m)', quantity: 5, price: 8000 },
      { name: 'Switches', quantity: 15, price: 3000 }
    ],
    submittedBy: 'manager1',
    submittedByName: 'Ramesh Kumar',
    approvedBy: null,
    approvedByName: null,
    approvedDate: null,
    rejectedBy: 'admin1',
    rejectedByName: 'Admin User',
    rejectedDate: 'Feb 19, 2026',
    rejectionReason: 'Budget constraints, please reduce quantity'
  },
  { 
    id: '4', 
    poNumber: 'PO-1044', 
    vendor: 'Flower Mandapam', 
    amount: 35000, 
    date: 'Feb 23, 2026', 
    status: 'Pending',
    items: [
      { name: 'Fresh Roses', quantity: 100, price: 5000 },
      { name: 'Marigold', quantity: 200, price: 8000 },
      { name: 'Jasmine', quantity: 50, price: 4000 }
    ],
    submittedBy: 'manager1',
    submittedByName: 'Ramesh Kumar',
    approvedBy: null,
    approvedByName: null,
    approvedDate: null,
    rejectedBy: null,
    rejectedDate: null,
    rejectionReason: ''
  },
];

// Mock current user (this would come from your auth context)
const currentUser = {
  id: '1',
  email: 'admin@gmail.com',
  role: 'Admin', // or 'Temple Manager'
  name: 'Admin',
  team: 'All'
};

const emptyForm = { 
  poNumber: '',
  vendor: '', 
  amount: '', 
  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  status: 'Pending',
  items: [] as Array<{name: string, quantity: number, price: number}>,
  notes: '',
  deliveryDate: '',
  paymentTerms: '',
  rejectionReason: '',
  submittedBy: '',
  submittedByName: ''
};

const emptyItem = {
  name: '',
  quantity: 1,
  price: 0
};

type Urgency = 'Low' | 'Medium' | 'High' | 'Critical';
type Category = 'Pooja' | 'Annadhanam' | 'Maintenance' | 'General';

type AgentRequest = {
  pr_id: string;
  item_description: string;
  requested_quantity: number;
  urgency: Urgency;
  required_date: string;
  reason_for_request: string;
  category: Category;
};

type AgentInventory = {
  current_stock: number;
  daily_consumption: number;
  minimum_threshold: number;
};

type AgentEvent = {
  upcoming_event_date: string;
  demand_multiplier: number;
};

type AgentVendor = {
  vendor_id: string;
  vendor_name: string;
  unit_price: number;
  delivery_eta_days: number;
  reliability_score: number;
  emergency_support: boolean;
  contract_status: 'Active' | 'Limited' | 'Blacklisted';
};

const defaultRequest: AgentRequest = {
  pr_id: 'PR-2026-0412',
  item_description: 'Pure Ghee (15kg tins)',
  requested_quantity: 25,
  urgency: 'High',
  required_date: '2026-04-15',
  reason_for_request: 'Annadhanam and festival demand spike',
  category: 'Annadhanam',
};

const defaultInventory: AgentInventory = {
  current_stock: 10,
  daily_consumption: 4,
  minimum_threshold: 6,
};

const defaultEvent: AgentEvent = {
  upcoming_event_date: '2026-04-14',
  demand_multiplier: 1.6,
};

const defaultVendors: AgentVendor[] = [
  { vendor_id: 'V-101', vendor_name: 'Sri Pooja Supplies', unit_price: 3200, delivery_eta_days: 4, reliability_score: 90, emergency_support: true, contract_status: 'Active' },
  { vendor_id: 'V-102', vendor_name: 'Temple Agro Wholesale', unit_price: 2950, delivery_eta_days: 7, reliability_score: 82, emergency_support: false, contract_status: 'Active' },
  { vendor_id: 'V-103', vendor_name: 'Rapid Ritual Logistics', unit_price: 3450, delivery_eta_days: 2, reliability_score: 76, emergency_support: true, contract_status: 'Limited' },
  { vendor_id: 'V-104', vendor_name: 'Legacy Traders', unit_price: 2800, delivery_eta_days: 6, reliability_score: 60, emergency_support: false, contract_status: 'Blacklisted' },
];

type ProcurementRecord = typeof mockProcurements[number];
type BannerTone = 'success' | 'info';
type BannerMessage = { id: number; tone: BannerTone; title: string; detail: string };

const ProcurementPage: React.FC = () => {
  const { items, add, update, remove } = useStore(mockProcurements);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectItemId, setRejectItemId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(emptyItem);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [agentRequest, setAgentRequest] = useState<AgentRequest>(defaultRequest);
  const [agentInventory, setAgentInventory] = useState<AgentInventory>(defaultInventory);
  const [agentEvent, setAgentEvent] = useState<AgentEvent>(defaultEvent);
  const [availableBudget, setAvailableBudget] = useState(220000);
  const [agentResult, setAgentResult] = useState<null | {
    stock_exhaust_days: number;
    adjusted_daily_consumption: number;
    strategy: 'lowest_cost_vendor' | 'fastest_delivery_vendor' | 'split_procurement_strategy';
    selected_vendor: string;
    requested_value: number;
    post_approval_balance: number;
    decision_reason: string;
    approval_required: Array<{ role: string; reason: string }>;
    vendor_evaluations: Array<{
      vendor_id: string;
      vendor_name: string;
      unit_price: number;
      delivery_eta_days: number;
      delivery_possible: boolean;
      reliability_score: number;
      contract_status: string;
      rank: number | null;
    }>;
    approval_email: { subject: string; body: string };
    vendor_rfp_email: Array<{ vendor: string; subject: string; body: string }>;
  }>(null);
  const [agentApprovedPRs, setAgentApprovedPRs] = useState<string[]>([]);
  const [bannerMessages, setBannerMessages] = useState<BannerMessage[]>([]);

  // Check user role
  const isAdmin = currentUser.role === 'Admin';
  const isManager = currentUser.role === 'Temple Manager';

  const runAgent = () => {
    const adjustedDaily = Number((agentInventory.daily_consumption * agentEvent.demand_multiplier).toFixed(2));
    const stockDays = adjustedDaily > 0 ? Number((agentInventory.current_stock / adjustedDaily).toFixed(2)) : 0;

    const validVendors = defaultVendors.map(v => {
      const deliveryPossible = v.delivery_eta_days <= stockDays;
      return {
        ...v,
        delivery_possible: deliveryPossible,
        requested_value: v.unit_price * agentRequest.requested_quantity,
        blocked: v.contract_status === 'Blacklisted',
      };
    });

    const eligible = validVendors.filter(v => !v.blocked);
    if (!eligible.length) {
      setAgentResult(null);
      return;
    }

    const ranked = [...eligible]
      .sort((a, b) => {
        if (a.delivery_possible !== b.delivery_possible) return a.delivery_possible ? -1 : 1;
        if (a.unit_price !== b.unit_price) return a.unit_price - b.unit_price;
        return b.reliability_score - a.reliability_score;
      })
      .map((v, idx) => ({ ...v, rank: idx + 1 }));

    const cheapest = [...eligible].sort((a, b) => a.unit_price - b.unit_price)[0];
    const fastest = [...eligible].sort((a, b) => a.delivery_eta_days - b.delivery_eta_days)[0];

    let strategy: 'lowest_cost_vendor' | 'fastest_delivery_vendor' | 'split_procurement_strategy' = 'lowest_cost_vendor';
    let selectedVendor = cheapest.vendor_name;
    let requestedValue = cheapest.requested_value;
    let decisionReason = 'Stock coverage is sufficient, so lowest-cost vendor is selected.';

    if (stockDays < cheapest.delivery_eta_days && stockDays >= fastest.delivery_eta_days) {
      strategy = 'split_procurement_strategy';
      selectedVendor = `${fastest.vendor_name} + ${cheapest.vendor_name}`;
      const urgentQty = Math.min(agentRequest.requested_quantity, Math.max(1, Math.ceil(adjustedDaily * 2)));
      const balanceQty = Math.max(0, agentRequest.requested_quantity - urgentQty);
      requestedValue = urgentQty * fastest.unit_price + balanceQty * cheapest.unit_price;
      decisionReason = `Partial shortage risk detected. Split order: ${urgentQty} urgent units from fast vendor and remaining from low-cost vendor.`;
    } else if (stockDays < cheapest.delivery_eta_days) {
      strategy = 'fastest_delivery_vendor';
      selectedVendor = fastest.vendor_name;
      requestedValue = fastest.requested_value;
      decisionReason = 'Stock-out risk detected before cheapest vendor ETA, so fastest vendor is selected.';
    }

    const approvalRequired =
      requestedValue <= 10000
        ? [{ role: 'System', reason: 'Auto approval for values up to Rs.10,000.' }]
        : requestedValue <= 50000
          ? [{ role: 'Manager', reason: 'Manager approval required for values from Rs.10,001 to Rs.50,000.' }]
          : [{ role: 'Trustee', reason: 'Trustee approval required for values above Rs.50,000.' }];

    setAgentResult({
      stock_exhaust_days: stockDays,
      adjusted_daily_consumption: adjustedDaily,
      strategy,
      selected_vendor: selectedVendor,
      requested_value: requestedValue,
      post_approval_balance: availableBudget - requestedValue,
      decision_reason: decisionReason,
      approval_required: approvalRequired,
      vendor_evaluations: defaultVendors.map(v => {
        const m = ranked.find(r => r.vendor_id === v.vendor_id);
        return {
          vendor_id: v.vendor_id,
          vendor_name: v.vendor_name,
          unit_price: v.unit_price,
          delivery_eta_days: v.delivery_eta_days,
          delivery_possible: v.delivery_eta_days <= stockDays,
          reliability_score: v.reliability_score,
          contract_status: v.contract_status,
          rank: m ? m.rank : null,
        };
      }),
      approval_email: {
        subject: `Procurement Request - ${agentRequest.pr_id}`,
        body: `Hi,\n\nPlease review the new procurement request ${agentRequest.pr_id} by ${currentUser.name} and provide your approval.\n\nRegards,\nProcurement Team`,
      },
      vendor_rfp_email: defaultVendors.map(v => ({
        vendor: v.vendor_name,
        subject: `RFP - ${agentRequest.pr_id} | ${agentRequest.item_description} | ${agentRequest.required_date}`,
        body: `Hi ${v.vendor_name},\n\nPlease find attached the RFP document for the following procurement request.\n\nPR ID : ${agentRequest.pr_id}\nItem : ${agentRequest.item_description}\nQuantity : ${agentRequest.requested_quantity}\nDelivery By : ${agentRequest.required_date}\n\nKindly review the attached RFP and submit your quotation as per instructions.\n\nRegards,\nProcurement Team`,
      })),
    });
  };

  const pushBanner = (tone: BannerTone, title: string, detail: string) => {
    const id = Date.now() + Math.floor(Math.random() * 10000);
    setBannerMessages(prev => [...prev, { id, tone, title, detail }]);
    setTimeout(() => {
      setBannerMessages(prev => prev.filter(message => message.id !== id));
    }, 3200);
  };

  const createPOFromAgent = () => {
    if (!agentResult) return;
    if (agentApprovedPRs.includes(agentRequest.pr_id)) {
      pushBanner('info', 'Already Approved', `${agentRequest.pr_id} is already converted to a purchase order.`);
      return;
    }

    const bestVendor = agentResult.vendor_evaluations
      .filter(v => v.rank !== null)
      .sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER))[0];

    const selectedVendor = bestVendor?.vendor_name || agentResult.selected_vendor.split(' + ')[0] || 'Sri Pooja Supplies';
    const unitPrice = bestVendor?.unit_price || Math.round(agentResult.requested_value / Math.max(1, agentRequest.requested_quantity));
    const poDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newEntry: ProcurementRecord = {
      id: String(Date.now()),
      poNumber: generatePONumber(),
      vendor: selectedVendor,
      amount: Math.round(agentResult.requested_value),
      date: poDate,
      status: 'Approved',
      items: [
        {
          name: agentRequest.item_description,
          quantity: Math.max(1, agentRequest.requested_quantity),
          price: unitPrice,
        },
      ],
      submittedBy: currentUser.id,
      submittedByName: currentUser.name,
      approvedBy: currentUser.id,
      approvedByName: currentUser.name,
      approvedDate: poDate,
      rejectedBy: null,
      rejectedDate: null,
      rejectionReason: '',
    };

    add(newEntry as unknown as typeof items[number]);
    setAgentApprovedPRs(prev => [...prev, agentRequest.pr_id]);
    setStatusFilter('all');

    pushBanner('success', 'Approval Completed', `${agentRequest.pr_id} approved and ${newEntry.poNumber} created.`);
    setTimeout(() => {
      pushBanner('success', 'Mail Sent Successfully', `Approval mail sent to workflow roles for ${newEntry.poNumber}.`);
    }, 350);
    setTimeout(() => {
      pushBanner('success', 'Vendor RFP Sent', `RFP sent successfully to ${selectedVendor}.`);
    }, 700);
  };

  const openAdd = () => { 
    setForm({
      ...emptyForm,
      poNumber: generatePONumber(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }); 
    setEditId(null); 
    setModalOpen(true); 
  };

  const openEdit = (item: typeof mockProcurements[0]) => {
    setForm({
      poNumber: item.poNumber,
      vendor: item.vendor,
      amount: item.amount.toString(),
      date: item.date,
      status: item.status,
      items: item.items,
      notes: '',
      deliveryDate: '',
      paymentTerms: '',
      rejectionReason: item.rejectionReason || '',
      submittedBy: item.submittedBy || '',
      submittedByName: item.submittedByName || ''
    });
    setEditId(item.id);
    setModalOpen(true);
  };

  const openView = (item: typeof mockProcurements[0]) => {
    setForm({
      poNumber: item.poNumber,
      vendor: item.vendor,
      amount: item.amount.toString(),
      date: item.date,
      status: item.status,
      items: item.items,
      notes: '',
      deliveryDate: '',
      paymentTerms: '',
      rejectionReason: item.rejectionReason || '',
      submittedBy: item.submittedBy || '',
      submittedByName: item.submittedByName || ''
    });
    setViewId(item.id);
    setModalOpen(true);
  };

  const handleApprove = (id: string) => {
    update(id, {
      status: 'Approved',
      approvedBy: currentUser.id,
      approvedByName: currentUser.name,
      approvedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rejectedBy: null,
      rejectedDate: null,
      rejectionReason: ''
    });
  };

  const openRejectModal = (id: string) => {
    setRejectItemId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = () => {
    if (rejectItemId && rejectReason.trim()) {
      update(rejectItemId, {
        status: 'Rejected',
        rejectedBy: currentUser.id,
        rejectedByName: currentUser.name,
        rejectedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rejectionReason: rejectReason,
        approvedBy: null,
        approvedDate: null
      });
      setRejectModalOpen(false);
      setRejectItemId(null);
      setRejectReason('');
    }
  };

  const handleSave = () => {
    const formattedForm = {
      ...form,
      amount: Number(form.amount),
      submittedBy: isManager ? currentUser.id : form.submittedBy,
      submittedByName: isManager ? currentUser.name : form.submittedByName,
      status: isManager ? 'Pending' : form.status // Managers always submit as pending
    };
    
    if (editId) update(editId, formattedForm);
    else add(formattedForm as unknown as typeof items[number]);
    setModalOpen(false);
    setViewId(null);
  };

  const generatePONumber = () => {
    const lastPO = items
      .map(i => parseInt(i.poNumber.split('-')[1]))
      .sort((a, b) => b - a)[0] || 1044;
    return `PO-${lastPO + 1}`;
  };

  const setFormFieldValue = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const addItem = () => {
    if (editingItemIndex !== null) {
      const updatedItems = [...form.items];
      updatedItems[editingItemIndex] = currentItem;
      setForm(prev => ({ ...prev, items: updatedItems }));
    } else {
      setForm(prev => ({ 
        ...prev, 
        items: [...prev.items, currentItem] 
      }));
    }
    
    // Recalculate total amount
    const newTotal = (form.items.reduce((sum, item, idx) => idx === editingItemIndex ? sum : sum + (item.price * item.quantity), 0) + 
                    (currentItem.price * currentItem.quantity));
    setForm(prev => ({ ...prev, amount: newTotal.toString() }));
    
    setItemModalOpen(false);
    setCurrentItem(emptyItem);
    setEditingItemIndex(null);
  };

  const removeItem = (index: number) => {
    const updatedItems = form.items.filter((_, i) => i !== index);
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setForm(prev => ({ 
      ...prev, 
      items: updatedItems,
      amount: newTotal.toString()
    }));
  };

  const editItem = (index: number) => {
    setCurrentItem(form.items[index]);
    setEditingItemIndex(index);
    setItemModalOpen(true);
  };

  // Filter items based on search and status
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
    
    // For managers, only show their own submissions
    if (isManager) {
      return matchesSearch && matchesStatus && item.submittedBy === currentUser.id;
    }
    return matchesSearch && matchesStatus;
  });

  const pendingCount = items.filter(i => i.status === 'Pending').length;
  const approvedCount = items.filter(i => i.status === 'Approved').length;
  const totalValue = items.reduce((sum, i) => sum + i.amount, 0);
  const todayRequests = items.filter(i => i.date === new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })).length;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="section-panel border-l-4 border-l-indigo-600 overflow-hidden">
        <div className="section-panel-header bg-gradient-to-r from-indigo-50 via-background to-sky-50 border-b border-border/60">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-indigo-600" /> AI Procurement Agent Console</h2>
            <p className="text-xs text-muted-foreground mt-1">Evaluates all vendors, balances cost vs delivery risk, and produces approval + communication outputs.</p>
          </div>
          <Button onClick={runAgent} className="bg-indigo-600 hover:bg-indigo-700 text-white"><ShieldCheck className="w-4 h-4 mr-2" />Run AI Evaluation</Button>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="PR ID" value={agentRequest.pr_id} onChange={v => setAgentRequest(prev => ({ ...prev, pr_id: v }))} />
            <FormField label="Item Description" value={agentRequest.item_description} onChange={v => setAgentRequest(prev => ({ ...prev, item_description: v }))} />
            <FormField label="Requested Quantity" value={String(agentRequest.requested_quantity)} onChange={v => setAgentRequest(prev => ({ ...prev, requested_quantity: Number(v) || 0 }))} type="number" />
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Urgency</label>
              <select className="w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm" value={agentRequest.urgency} onChange={e => setAgentRequest(prev => ({ ...prev, urgency: e.target.value as Urgency }))}>
                {['Low', 'Medium', 'High', 'Critical'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <FormField label="Required Date" value={agentRequest.required_date} onChange={v => setAgentRequest(prev => ({ ...prev, required_date: v }))} type="date" />
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Category</label>
              <select className="w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm" value={agentRequest.category} onChange={e => setAgentRequest(prev => ({ ...prev, category: e.target.value as Category }))}>
                {['Pooja', 'Annadhanam', 'Maintenance', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <FormField label="Current Stock" value={String(agentInventory.current_stock)} onChange={v => setAgentInventory(prev => ({ ...prev, current_stock: Number(v) || 0 }))} type="number" />
            <FormField label="Daily Consumption" value={String(agentInventory.daily_consumption)} onChange={v => setAgentInventory(prev => ({ ...prev, daily_consumption: Number(v) || 0 }))} type="number" />
            <FormField label="Demand Multiplier" value={String(agentEvent.demand_multiplier)} onChange={v => setAgentEvent(prev => ({ ...prev, demand_multiplier: Number(v) || 1 }))} type="number" />
            <FormField label="Available Budget (Rs.)" value={String(availableBudget)} onChange={v => setAvailableBudget(Number(v) || 0)} type="number" />
            <FormField label="Reason for Request" value={agentRequest.reason_for_request} onChange={v => setAgentRequest(prev => ({ ...prev, reason_for_request: v }))} />
          </div>

          {agentResult && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="stat-card"><p className="text-[10px] uppercase text-muted-foreground">Adjusted Daily</p><p className="text-xl font-bold">{agentResult.adjusted_daily_consumption}</p></div>
                <div className="stat-card"><p className="text-[10px] uppercase text-muted-foreground">Stock Exhaust (Days)</p><p className="text-xl font-bold">{agentResult.stock_exhaust_days}</p></div>
                <div className="stat-card"><p className="text-[10px] uppercase text-muted-foreground">Requested Value</p><p className="text-xl font-bold">Rs.{agentResult.requested_value.toLocaleString('en-IN')}</p></div>
                <div className="stat-card"><p className="text-[10px] uppercase text-muted-foreground">Post Approval Balance</p><p className="text-xl font-bold">Rs.{agentResult.post_approval_balance.toLocaleString('en-IN')}</p></div>
              </div>

              <div className="table-container">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-3 text-xs">Vendor</th>
                      <th className="text-right p-3 text-xs">Unit Price</th>
                      <th className="text-center p-3 text-xs">ETA (days)</th>
                      <th className="text-center p-3 text-xs">Delivery Possible</th>
                      <th className="text-center p-3 text-xs">Reliability</th>
                      <th className="text-center p-3 text-xs">Contract</th>
                      <th className="text-center p-3 text-xs">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentResult.vendor_evaluations.map(v => (
                      <tr key={v.vendor_id}>
                        <td className="p-3 font-semibold">{v.vendor_name}</td>
                        <td className="p-3 text-right">Rs.{v.unit_price.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center">{v.delivery_eta_days}</td>
                        <td className="p-3 text-center">{v.delivery_possible ? 'Yes' : 'No'}</td>
                        <td className="p-3 text-center">{v.reliability_score}</td>
                        <td className="p-3 text-center">{v.contract_status}</td>
                        <td className="p-3 text-center font-bold">{v.rank ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="info-panel">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">AI Advisory Summary</p>
                    <p className="text-sm font-semibold mt-1">Strategy: {agentResult.strategy.replace(/_/g, ' ')}</p>
                    <p className="text-sm mt-1">Recommended: {agentResult.selected_vendor}</p>
                    <p className="text-xs text-muted-foreground mt-2">{agentResult.decision_reason}</p>
                  </div>
                </div>
                <div className="info-panel">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Approval Workflow</p>
                    {agentResult.approval_required.map(a => (
                      <p key={a.role} className="text-sm mt-1"><span className="font-semibold">{a.role}:</span> {a.reason}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4 bg-muted/10">
                  <p className="text-xs uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Approval Email</p>
                  <p className="text-xs font-semibold">{agentResult.approval_email.subject}</p>
                  <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{agentResult.approval_email.body}</p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-muted/10">
                  <p className="text-xs uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1"><Send className="w-3.5 h-3.5" />Vendor RFP Subject Preview</p>
                  {agentResult.vendor_rfp_email.map(v => (
                    <p key={v.vendor} className="text-xs mt-1"><span className="font-semibold">{v.vendor}:</span> {v.subject}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-emerald-800">Agent Action</p>
                  <p className="text-sm font-semibold text-emerald-900 mt-0.5">Approve recommendation and push it to Purchase Orders.</p>
                </div>
                <Button
                  onClick={createPOFromAgent}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  disabled={agentApprovedPRs.includes(agentRequest.pr_id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {agentApprovedPRs.includes(agentRequest.pr_id) ? 'Already Approved' : 'Approve & Create PO'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {bannerMessages.length > 0 && (
        <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 w-[min(92vw,420px)]">
          {bannerMessages.map(message => (
            <div
              key={message.id}
              className={`rounded-xl border p-3 shadow-lg backdrop-blur-sm animate-fade-in ${message.tone === 'success' ? 'bg-emerald-50/95 border-emerald-200' : 'bg-sky-50/95 border-sky-200'}`}
            >
              <div className="flex items-start gap-2">
                {message.tone === 'success' ? (
                  <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-700" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 text-sky-700" />
                )}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${message.tone === 'success' ? 'text-emerald-800' : 'text-sky-800'}`}>{message.title}</p>
                  <p className="text-sm text-foreground font-medium mt-0.5">{message.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-amber-100 bg-amber-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-amber-800 flex items-center gap-1.5"><FileClock className="w-3.5 h-3.5" /> Pending Orders</p>
          <p className="text-3xl font-display font-bold mt-2 text-amber-700 relative z-10">{pendingCount}</p>
        </div>
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-emerald-100 bg-emerald-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-800 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Approved Orders</p>
          <p className="text-3xl font-display font-bold mt-2 text-emerald-700 relative z-10">{approvedCount}</p>
        </div>
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-indigo-100 bg-indigo-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-indigo-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-indigo-800 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Total Value</p>
          <p className="text-3xl font-display font-bold mt-2 text-indigo-700 relative z-10">Rs.{totalValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="stat-card flex flex-col justify-between group overflow-hidden relative border-blue-100 bg-blue-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-blue-800 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Today's Requests</p>
          <p className="text-3xl font-display font-bold mt-2 text-blue-700 relative z-10">{todayRequests}</p>
        </div>
      </div>

      <div className="section-panel shadow-sm border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
        {/* Search and Actions */}
        <div className="section-panel-header gap-4 flex-wrap bg-gradient-to-r from-primary/5 to-transparent border-b border-border/60 pb-4">
          <h2 className="text-sm font-semibold whitespace-nowrap hidden md:flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-primary" /> Purchase Orders</h2>
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 justify-end">
             <div className="relative w-full sm:max-w-sm">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <input
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 placeholder="Search PO number or vendor..."
                 className="h-10 w-full pl-9 pr-3 rounded-lg border border-input bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
               />
             </div>
             <select
               className="h-10 px-3 w-full sm:w-auto border border-input rounded-lg bg-background/80 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="all">Every Status</option>
               <option value="pending">Pending Auth</option>
               <option value="approved">Approved</option>
               <option value="rejected">Rejected</option>
               <option value="delivered">Delivered</option>
             </select>
             <Button onClick={openAdd} className="shadow-md hover:shadow-lg w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" />New Request</Button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b border-border">
                <th className="text-left py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[10%] text-xs">Order ID</th>
                <th className="text-left py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[15%] text-xs">Vendor & Requested By</th>
                <th className="text-right py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[12%] text-xs">Total Amount</th>
                <th className="text-left py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[13%] text-xs">Status</th>
                <th className="text-left py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[45%] text-xs">Ordered Items</th>
                <th className="py-4 px-3 font-medium text-muted-foreground whitespace-nowrap w-[15%] text-xs text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {filteredItems.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-muted-foreground border-b border-border">No procurement records align with your active filters.</td></tr> : filteredItems.map(proc => (
                <tr key={proc.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                  <td className="py-4 px-3 whitespace-nowrap">
                    <p className="font-bold text-foreground font-mono tracking-tighter text-sm">{proc.poNumber}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 font-medium">{proc.date}</p>
                  </td>
                  <td className="py-4 px-3">
                    <p className="font-bold text-foreground truncate max-w-[180px] text-xs" title={proc.vendor}>{proc.vendor}</p>
                    {isAdmin && <p className="text-[9px] font-medium text-muted-foreground mt-0.5 truncate max-w-[180px]">By: {proc.submittedByName}</p>}
                  </td>
                  <td className="py-4 px-3 text-right whitespace-nowrap">
                    <p className="text-base font-bold text-emerald-700 font-display tracking-tight">Rs.{proc.amount.toLocaleString('en-IN')}</p>
                  </td>
                  <td className="py-4 px-3">
                    <StatusBadge status={proc.status} />
                    {proc.status === 'Rejected' && proc.rejectionReason && (
                      <p className="text-[9px] font-medium text-destructive mt-1 truncate max-w-[100px]" title={proc.rejectionReason}>{proc.rejectionReason}</p>
                    )}
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-wrap gap-1.5 max-w-[350px]">
                      {proc.items.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="text-[9px] bg-muted/40 px-2 py-0.5 rounded border border-border/50 text-foreground font-medium shrink-0 flex items-center gap-1">
                          {item.name} <span className="text-muted-foreground opacity-60">Qty:{item.quantity}</span>
                        </span>
                      ))}
                      {proc.items.length > 3 && <span className="text-[9px] text-primary font-bold px-1 py-0.5 underline">+{proc.items.length - 3} more</span>}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-right whitespace-nowrap">
                    <div className="flex gap-1 justify-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openView(proc)} title="View Details">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      
                      {isAdmin && proc.status === 'Pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(proc.id)} className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openRejectModal(proc.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {(isManager ? (proc.submittedBy === currentUser.id && proc.status === 'Pending') : (isAdmin && proc.status === 'Pending')) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(proc)} title="Edit">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </div>

      {modalOpen && (
      <Modal 
        open={modalOpen} 
        onClose={() => { setModalOpen(false); setViewId(null); setEditId(null); }} 
        title={viewId ? 'Procurement Dossier' : (editId ? 'Amend Purchase Order' : 'Initiate Procurement')}
      >
        <div className="grid grid-cols-2 gap-4 px-1 pb-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Order Number</label>
            <input value={form.poNumber} disabled className="w-full h-11 rounded-lg border border-input bg-muted/30 px-3 text-sm font-mono font-bold" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Registered Vendor / Supplier</label>
            <select 
              value={form.vendor} 
              onChange={e => setFormFieldValue('vendor', e.target.value)} 
              disabled={!!viewId}
              className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-medium disabled:opacity-50"
            >
              <option value="">Select registered vendor</option>
              {['Sri Pooja Supplies', 'Kitchen World', 'Electrical Corp', 'Flower Mandapam', 'General Provision Store', 'Temple Decor Art'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2 border border-border/80 bg-muted/10 rounded-2xl p-4 shadow-sm mt-1">
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><PackageOpen className="w-4 h-4 text-primary" /> Manifest Elements</h3>
              {!viewId && (
                <Button size="sm" variant="outline" className="h-9 text-xs bg-background shadow-sm font-bold tracking-wide" onClick={() => setItemModalOpen(true)}>
                  <Plus className="h-3 w-3 mr-1.5" /> Append Item
                </Button>
              )}
            </div>
            
            {form.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 font-medium">Manifest is currently empty. Please append required stock.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {form.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-background border border-border/60 p-3.5 rounded-xl shadow-sm hover:border-primary/30 transition-all">
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium bg-muted/40 inline-flex px-2 py-0.5 rounded">
                        Qty: {item.quantity} x Rs.{item.price.toLocaleString('en-IN')} = <span className="text-foreground font-bold ml-1">Rs.{(item.quantity * item.price).toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                    {!viewId && (
                      <div className="flex gap-1.5 bg-muted/30 p-1.5 rounded-lg border border-border/50">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background border border-transparent hover:border-border shadow-sm" onClick={() => editItem(index)}><Pencil className="h-3.5 w-3.5 text-foreground" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-rose-50 border border-transparent hover:border-rose-100 shadow-sm" onClick={() => removeItem(index)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-5 pt-4 border-t border-border/60 flex justify-between items-center bg-gradient-to-r from-emerald-50/50 to-background p-4 rounded-xl border border-emerald-100 shadow-sm">
               <span className="text-xs uppercase tracking-widest font-bold text-emerald-800">Total Invoice Valuation</span>
               <span className="text-2xl font-bold text-emerald-700 font-display tracking-tight">Rs.{Number(form.amount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4 mt-1 opacity-90">
             <FormField label="Date of Generation" value={form.date} onChange={v => setFormFieldValue('date', v)} disabled={!!viewId} />
             <FormField label="Target Fulfillment Date" value={form.deliveryDate} onChange={v => setFormFieldValue('deliveryDate', v)} disabled={!!viewId} type="date" />
          </div>
          <div className="col-span-2">
             <FormField label="Settlement Constraints" value={form.paymentTerms} onChange={v => setFormFieldValue('paymentTerms', v)} disabled={!!viewId} placeholder="e.g., Net 30, Instant Digital Settlement" />
          </div>
          
          <div className="col-span-2">
            <FormField label="Addendum & Memos" value={form.notes} onChange={v => setFormFieldValue('notes', v)} disabled={!!viewId} textarea />
          </div>

          {form.status === 'Rejected' && form.rejectionReason && (
            <div className="col-span-2 bg-rose-50 border border-rose-200 p-5 rounded-2xl mt-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
              <label className="text-[11px] uppercase tracking-widest font-bold text-rose-800 flex items-center gap-1.5 mb-2"><XCircle className="w-4 h-4" /> Rejection Directives</label>
              <p className="text-sm text-rose-900/90 font-medium leading-relaxed">{form.rejectionReason}</p>
            </div>
          )}

          <div className="col-span-2 flex gap-3 pt-6 border-t border-border/60 mt-3">
            <Button variant="outline" onClick={() => { setModalOpen(false); setViewId(null); }} className="flex-1 py-6 font-bold">{viewId ? 'Acknowledge Drossier' : 'Discard Order'}</Button>
            {!viewId && (
              <Button onClick={handleSave} className="flex-1 py-6 font-bold shadow-md bg-indigo-600 hover:bg-indigo-700 text-white text-base">{editId ? 'Resubmit Authorization' : 'Commit for Approval'}</Button>
            )}
          </div>
        </div>
      </Modal>
      )}

      {/* Item Modal */}
      <Modal open={itemModalOpen} onClose={() => { setItemModalOpen(false); setCurrentItem(emptyItem); setEditingItemIndex(null); }} title={editingItemIndex !== null ? 'Modify Manifest Element' : 'Append Manifest Element'}>
        <div className="space-y-5 px-1 py-2">
          <FormField label="Item Designation" value={currentItem.name} onChange={v => setCurrentItem({ ...currentItem, name: v })} required placeholder="e.g. Pure Ghee 15kg" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Volume Wanted" value={currentItem.quantity.toString()} onChange={v => setCurrentItem({ ...currentItem, quantity: Number(v) || 0 })} type="number" required />
            <FormField label="Quote Unit Price (G�)" value={currentItem.price.toString()} onChange={v => setCurrentItem({ ...currentItem, price: Number(v) || 0 })} type="number" required />
          </div>
          <div className="bg-gradient-to-r from-sky-50 to-background text-sky-900 p-5 rounded-xl border border-sky-100 flex justify-between items-center shadow-sm">
            <span className="text-sm font-bold uppercase tracking-widest text-sky-800">Projection Line Total</span>
            <span className="text-2xl font-bold font-display">Rs.{(currentItem.quantity * currentItem.price).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" onClick={() => { setItemModalOpen(false); setCurrentItem(emptyItem); setEditingItemIndex(null); }} className="flex-1 py-5">Omit Changes</Button>
            <Button onClick={addItem} className="flex-1 py-5 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold">{editingItemIndex !== null ? 'Verify Alignment' : 'Append to Manifest'}</Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModalOpen} onClose={() => { setRejectModalOpen(false); setRejectItemId(null); setRejectReason(''); }} title="Decline Authorization">
        <div className="space-y-5 px-1 py-2">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm font-medium leading-relaxed shadow-sm">
             <AlertCircle className="w-5 h-5 inline mr-2 text-amber-600 mb-0.5" />
             Please outline your rejection criterion. The originator will review your directives to amend the proposition.
          </div>
          <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Detailed Rejection Memo</label>
             <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full rounded-xl border border-input bg-background/80 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none p-4 text-sm min-h-[140px] resize-none shadow-sm transition-all font-medium" required placeholder="Outline explicit instructions or constraints preventing immediate approval..." />
          </div>
          <div className="flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" onClick={() => { setRejectModalOpen(false); setRejectItemId(null); setRejectReason(''); }} className="flex-1 py-5">Cancel Halt</Button>
            <Button onClick={handleReject} className="flex-1 py-5 bg-rose-600 hover:bg-rose-700 text-white shadow-md font-bold" disabled={!rejectReason.trim()}>Stamp Decline</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} title="Purge Manifest" message="Are you absolutely positive you want to annihilate this purchase order trajectory? This is a terminal action." />
    </div>
  );
};

export default ProcurementPage;
