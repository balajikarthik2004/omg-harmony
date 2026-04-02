import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, Eye, CheckCircle, XCircle, FileClock, IndianRupee, Truck } from 'lucide-react';
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
  rejectionReason: ''
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
      rejectionReason: item.rejectionReason || ''
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
      rejectionReason: item.rejectionReason || ''
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

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

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
    const newTotal = form.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 
                    (currentItem.price * currentItem.quantity);
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
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-gradient-to-r from-emerald-50/60 via-background to-teal-50/60 px-4 py-3">
        <h1 className="text-2xl font-display font-bold text-foreground">Procurement & Purchase Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">Track purchase requests for pooja materials, prasadam kitchen supplies, and temple asset procurement.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pending Orders</p>
          <p className="text-2xl font-semibold mt-1 text-amber-700">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Approved Orders</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-700">{approvedCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Value</p>
          <p className="text-2xl font-semibold mt-1">₹{totalValue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Today Requests</p>
          <p className="text-2xl font-semibold mt-1">{todayRequests}</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="rounded-xl border border-border bg-background shadow-sm p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search PO number or vendor"
            className="h-9 w-full sm:w-64 pl-8 pr-3 rounded-md border border-border bg-background text-sm"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            className="px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="delivered">Delivered</option>
          </select>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>


      {/* Table */}
      {/* Table */}
<div className="relative border border-border rounded-md overflow-hidden">
  <div className="overflow-x-auto">
    <div className="inline-block min-w-full align-middle">
      <div className="overflow-y-auto h-[calc(100vh-280px)]">
        <table className="min-w-full divide-y divide-border">
          <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">PO Number</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Vendor</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Amount</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Status</th>
              {isAdmin && <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Submitted By</th>}
              <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Items</th>
              <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {filteredItems.map(proc => (
              <tr key={proc.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium text-foreground whitespace-nowrap">{proc.poNumber}</td>
                <td className="p-4 text-muted-foreground whitespace-nowrap">{proc.vendor}</td>
                <td className="p-4 font-medium text-foreground whitespace-nowrap">₹{proc.amount.toLocaleString()}</td>
                <td className="p-4 text-muted-foreground whitespace-nowrap">{proc.date}</td>
                <td className="p-4 whitespace-nowrap">
                  <StatusBadge status={proc.status} />
                  {proc.status === 'Rejected' && proc.rejectionReason && (
                    <div className="text-xs text-destructive mt-1" title={proc.rejectionReason}>
                      Reason: {proc.rejectionReason.substring(0, 20)}...
                    </div>
                  )}
                </td>
                {isAdmin && (
                  <td className="p-4 text-muted-foreground whitespace-nowrap">{proc.submittedByName}</td>
                )}
                <td className="p-4">
                  <div className="flex flex-col gap-1 max-w-xs">
                    {proc.items.map((item, idx) => (
                      <div key={idx} className="text-xs bg-muted/30 px-2 py-1 rounded whitespace-nowrap">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground ml-1">({item.quantity} × ₹{item.price})</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex gap-1 justify-end">
                    {/* View button for everyone */}
                    <Button variant="ghost" size="icon" onClick={() => openView(proc)} title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {/* Admin actions - Approve/Reject for pending items */}
                    {isAdmin && proc.status === 'Pending' && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleApprove(proc.id)} className="text-green-600" title="Approve">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openRejectModal(proc.id)} className="text-destructive" title="Reject">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {/* Edit button - visible to manager for their own pending items, or admin for any pending */}
                    {(isManager ? (proc.submittedBy === currentUser.id && proc.status === 'Pending') : (isAdmin && proc.status === 'Pending')) && (
                      <Button variant="ghost" size="icon" onClick={() => openEdit(proc)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Delete button - only admin for pending items */}
                    {isAdmin && proc.status === 'Pending' && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(proc.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No procurement records found</p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

      {/* Add/Edit/View Modal */}
      <Modal 
        open={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setViewId(null);
          setEditId(null);
        }} 
        title={viewId ? 'View Purchase Order' : (editId ? 'Edit Purchase Order' : 'Create New Purchase Order')}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField 
            label="PO Number" 
            value={form.poNumber} 
            onChange={v => set('poNumber', v)} 
            required 
            disabled={!!viewId}
          />
          <FormField 
            label="Vendor" 
            value={form.vendor} 
            onChange={v => set('vendor', v)} 
            required 
            disabled={!!viewId}
          />
          
          {/* Items Section */}
          <div className="col-span-2 border border-border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Items</h3>
              {!viewId && (
                <Button size="sm" variant="outline" onClick={() => setItemModalOpen(true)}>
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              )}
            </div>
            
            {form.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No items added yet</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {form.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Qty: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                      </span>
                    </div>
                    {!viewId && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => editItem(index)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormField 
            label="Total Amount (₹)" 
            value={form.amount} 
            onChange={v => set('amount', v)} 
            type="number"
            disabled={!!viewId}
          />
          <FormField 
            label="Order Date" 
            value={form.date} 
            onChange={v => set('date', v)} 
            disabled={!!viewId}
          />
          
          <FormField 
            label="Expected Delivery" 
            value={form.deliveryDate} 
            onChange={v => set('deliveryDate', v)} 
            disabled={!!viewId}
          />
          <FormField 
            label="Payment Terms" 
            value={form.paymentTerms} 
            onChange={v => set('paymentTerms', v)} 
            disabled={!!viewId}
            placeholder="e.g., Net 30"
          />
          
          <div className="col-span-2">
            <FormField 
              label="Notes" 
              value={form.notes} 
              onChange={v => set('notes', v)} 
              disabled={!!viewId}
              textarea
            />
          </div>

          {/* Show rejection reason if rejected */}
          {form.status === 'Rejected' && form.rejectionReason && (
            <div className="col-span-2 bg-destructive/10 p-3 rounded-md">
              <label className="text-sm font-medium text-destructive">Rejection Reason</label>
              <p className="text-sm mt-1">{form.rejectionReason}</p>
            </div>
          )}

          <div className="col-span-2 flex gap-3 pt-4 mt-2">
            <Button variant="outline" onClick={() => {
              setModalOpen(false);
              setViewId(null);
            }} className="flex-1">
              {viewId ? 'Close' : 'Cancel'}
            </Button>
            {!viewId && (
              <Button onClick={handleSave} className="flex-1">
                {editId ? 'Update' : 'Submit for Approval'}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal
        open={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setCurrentItem(emptyItem);
          setEditingItemIndex(null);
        }}
        title={editingItemIndex !== null ? 'Edit Item' : 'Add Item'}
      >
        <div className="space-y-4">
          <FormField
            label="Item Name"
            value={currentItem.name}
            onChange={v => setCurrentItem({ ...currentItem, name: v })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Quantity"
              value={currentItem.quantity.toString()}
              onChange={v => setCurrentItem({ ...currentItem, quantity: Number(v) || 0 })}
              type="number"
              required
            />
            <FormField
              label="Unit Price (₹)"
              value={currentItem.price.toString()}
              onChange={v => setCurrentItem({ ...currentItem, price: Number(v) || 0 })}
              type="number"
              required
            />
          </div>
          <div className="bg-muted/30 p-3 rounded-md">
            <span className="text-sm font-medium">Subtotal: </span>
            <span className="text-lg font-bold">₹{currentItem.quantity * currentItem.price}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => {
              setItemModalOpen(false);
              setCurrentItem(emptyItem);
              setEditingItemIndex(null);
            }} className="flex-1">
              Cancel
            </Button>
            <Button onClick={addItem} className="flex-1">
              {editingItemIndex !== null ? 'Update' : 'Add'} Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectItemId(null);
          setRejectReason('');
        }}
        title="Reject Purchase Order"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please provide a reason for rejecting this purchase order. This will be visible to the manager who submitted it.
          </p>
          <FormField
            label="Rejection Reason"
            value={rejectReason}
            onChange={setRejectReason}
            textarea
            required
            placeholder="e.g., Budget constraints, incorrect items, etc."
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => {
              setRejectModalOpen(false);
              setRejectItemId(null);
              setRejectReason('');
            }} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              className="flex-1 bg-destructive hover:bg-destructive/90"
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => {
          if (deleteId) remove(deleteId);
          setDeleteId(null);
        }} 
        title="Delete Purchase Order" 
        message="Are you sure you want to delete this purchase order? This action cannot be undone." 
      />
    </div>
  );
};

export default ProcurementPage;