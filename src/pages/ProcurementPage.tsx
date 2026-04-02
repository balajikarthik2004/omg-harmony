import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Eye, CheckCircle, XCircle, FileClock, IndianRupee, Truck, Calendar, DollarSign, PackageOpen, LayoutGrid, AlertCircle } from 'lucide-react';
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
  name: 'Admin User',
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

  // Check user role
  const isAdmin = currentUser.role === 'Admin';
  const isManager = currentUser.role === 'Temple Manager';

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
    else add(formattedForm as any);
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
          <p className="text-3xl font-display font-bold mt-2 text-indigo-700 relative z-10">₹{totalValue.toLocaleString('en-IN')}</p>
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
          <h2 className="text-sm font-semibold whitespace-nowrap hidden md:flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-primary" /> Purchase Orders Manifest</h2>
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
                <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Order Ref</th>
                <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Vendor Info</th>
                <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Settlement</th>
                <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Authorization Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Manifest Line Items</th>
                <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Controls</th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {filteredItems.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-muted-foreground border-b border-border">No procurement records align with your active filters.</td></tr> : filteredItems.map(proc => (
                <tr key={proc.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                  <td className="p-4 whitespace-nowrap">
                    <p className="font-bold text-foreground font-display text-base tracking-tight">{proc.poNumber}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 uppercase tracking-widest font-bold"><Calendar className="w-3 h-3 opacity-70" /> {proc.date}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-foreground truncate max-w-[200px]">{proc.vendor}</p>
                    {isAdmin && <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1 max-w-[200px] truncate bg-muted/60 inline-flex px-1.5 py-0.5 rounded border border-border/40">Originator: {proc.submittedByName}</p>}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <p className="text-lg font-bold text-emerald-700 font-display tracking-tight">₹{proc.amount.toLocaleString('en-IN')}</p>
                  </td>
                  <td className="p-4 w-48">
                    <StatusBadge status={proc.status} />
                    {proc.status === 'Rejected' && proc.rejectionReason && (
                      <div className="text-[10px] font-bold tracking-wide leading-relaxed text-destructive mt-2 p-1.5 bg-destructive/10 rounded border border-destructive/20 max-w-[200px]" title={proc.rejectionReason}>
                         {proc.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 max-w-[280px]">
                      {proc.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-[11px] bg-muted/30 px-2 py-1 rounded truncate border border-border shadow-sm flex justify-between items-center group-hover:bg-background transition-colors">
                          <span className="font-semibold text-foreground tracking-wide">{item.name}</span>
                          <span className="text-muted-foreground font-medium ml-2 shrink-0">{item.quantity} × <span className="font-semibold">₹{item.price}</span></span>
                        </div>
                      ))}
                      {proc.items.length > 2 && <p className="text-[10px] text-primary font-bold pl-1 tracking-wider uppercase">+{proc.items.length - 2} auxiliary items...</p>}
                    </div>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap align-top">
                    <div className="flex gap-1.5 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openView(proc)} title="Preview Dossier">
                        <Eye className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      </Button>
                      
                      {isAdmin && proc.status === 'Pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(proc.id)} className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:ring-1 ring-emerald-200" title="Grant Approval">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openRejectModal(proc.id)} className="text-destructive hover:bg-destructive/10 hover:ring-1 ring-destructive/20 text-muted-foreground" title="Deny Approval">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {(isManager ? (proc.submittedBy === currentUser.id && proc.status === 'Pending') : (isAdmin && proc.status === 'Pending')) && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(proc)} title="Modify Order">
                          <Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </Button>
                      )}
                      
                      {isAdmin && proc.status === 'Pending' && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(proc.id)} title="Purge Record" className="hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
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
          <FormField label="Order Designation No." value={form.poNumber} onChange={v => setFormFieldValue('poNumber', v)} required disabled={!!viewId} />
          <FormField label="Registered Vendor / Supplier" value={form.vendor} onChange={v => setFormFieldValue('vendor', v)} required disabled={!!viewId} />
          
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
                        Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')} = <span className="text-foreground font-bold ml-1">₹{(item.quantity * item.price).toLocaleString('en-IN')}</span>
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
               <span className="text-2xl font-bold text-emerald-700 font-display tracking-tight">₹{Number(form.amount).toLocaleString('en-IN')}</span>
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
            <FormField label="Quote Unit Price (₹)" value={currentItem.price.toString()} onChange={v => setCurrentItem({ ...currentItem, price: Number(v) || 0 })} type="number" required />
          </div>
          <div className="bg-gradient-to-r from-sky-50 to-background text-sky-900 p-5 rounded-xl border border-sky-100 flex justify-between items-center shadow-sm">
            <span className="text-sm font-bold uppercase tracking-widest text-sky-800">Projection Line Total</span>
            <span className="text-2xl font-bold font-display">₹{(currentItem.quantity * currentItem.price).toLocaleString('en-IN')}</span>
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