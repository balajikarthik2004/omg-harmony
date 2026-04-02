import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, CalendarDays, Users, Briefcase, Wallet } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';

type StaffRole = 'Priest' | 'Staff';
type StaffStatus = 'Active' | 'Inactive';

type StaffRecord = {
  id: string;
  name: string;
  role: StaffRole;
  department: string;
  joinedDate: string;
  salary: number;
  phone: string;
  email: string;
  status: StaffStatus;
};

type DutyStatus = 'Scheduled' | 'Completed' | 'Cancelled';
type DutyType = 'Pooja Ritual' | 'Annadanam Service' | 'Temple Operations' | 'Administration' | 'Volunteer Coordination' | 'Maintenance';

type DutySchedule = {
  id: string;
  staffId: string;
  dutyType: DutyType;
  dutyDate: string;
  slot: string;
  location: string;
  status: DutyStatus;
  notes: string;
};

type VolunteerStatus = 'Registered' | 'Assigned' | 'Inactive';

type VolunteerRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredArea: string;
  availability: string;
  assignedDutyId: string;
  status: VolunteerStatus;
};

type PayrollStatus = 'Paid' | 'Unpaid';

type PayrollEntry = {
  id: string;
  staffId: string;
  month: string;
  basePay: number;
  allowance: number;
  deduction: number;
  netPay: number;
  payoutStatus: PayrollStatus;
};

type HrSection = 'staff' | 'payroll' | 'duties' | 'volunteers';

const initialStaff: StaffRecord[] = [
  {
    id: 'ST001',
    name: 'Pandit Sharma',
    role: 'Priest',
    department: 'Main Sanctum',
    joinedDate: '2020-01-10',
    salary: 35000,
    phone: '+91 9876543210',
    email: 'sharma@temple.org',
    status: 'Active',
  },
  {
    id: 'ST002',
    name: 'Suresh Kumar',
    role: 'Staff',
    department: 'Kitchen',
    joinedDate: '2021-03-12',
    salary: 22000,
    phone: '+91 9876500011',
    email: 'suresh@temple.org',
    status: 'Active',
  },
  {
    id: 'ST003',
    name: 'Anita Menon',
    role: 'Staff',
    department: 'Administration',
    joinedDate: '2022-08-01',
    salary: 28000,
    phone: '+91 9876500022',
    email: 'anita@temple.org',
    status: 'Active',
  },
];

const initialDuties: DutySchedule[] = [
  { id: 'DT001', staffId: 'ST001', dutyType: 'Pooja Ritual', dutyDate: '2026-04-05', slot: '05:00 AM - 09:00 AM', location: 'Main Sanctum', status: 'Scheduled', notes: 'Morning pooja and archana' },
  { id: 'DT002', staffId: 'ST002', dutyType: 'Annadanam Service', dutyDate: '2026-04-05', slot: '09:00 AM - 01:00 PM', location: 'Kitchen', status: 'Scheduled', notes: 'Annadanam preparation' },
  { id: 'DT003', staffId: 'ST003', dutyType: 'Administration', dutyDate: '2026-04-05', slot: '01:00 PM - 05:00 PM', location: 'Admin Office', status: 'Completed', notes: 'Documentation and donor desk' },
];

const dutyTypeOptions: DutyType[] = [
  'Pooja Ritual',
  'Annadanam Service',
  'Temple Operations',
  'Administration',
  'Volunteer Coordination',
  'Maintenance',
];

const initialVolunteers: VolunteerRecord[] = [
  {
    id: 'VL001',
    name: 'Meena Devi',
    phone: '+91 9000011111',
    email: 'meena@email.com',
    preferredArea: 'Events Desk',
    availability: 'Weekends',
    assignedDutyId: 'DT003',
    status: 'Assigned',
  },
  {
    id: 'VL002',
    name: 'Rahul Jain',
    phone: '+91 9000011112',
    email: 'rahul@email.com',
    preferredArea: 'Crowd Management',
    availability: 'Evenings',
    assignedDutyId: '',
    status: 'Registered',
  },
];

const initialPayroll: PayrollEntry[] = [
  {
    id: 'PY001',
    staffId: 'ST001',
    month: '2026-04',
    basePay: 35000,
    allowance: 3000,
    deduction: 1000,
    netPay: 37000,
    payoutStatus: 'Unpaid',
  },
  {
    id: 'PY002',
    staffId: 'ST002',
    month: '2026-04',
    basePay: 22000,
    allowance: 1500,
    deduction: 500,
    netPay: 23000,
    payoutStatus: 'Paid',
  },
];

const emptyStaffForm = {
  name: '',
  role: 'Staff' as StaffRole,
  department: '',
  joinedDate: '',
  salary: 0,
  phone: '',
  email: '',
  status: 'Active' as StaffStatus,
};

const emptyDutyForm = {
  staffId: '',
  dutyType: 'Temple Operations' as DutyType,
  dutyDate: '',
  slot: '05:00 AM - 09:00 AM',
  location: '',
  status: 'Scheduled' as DutyStatus,
  notes: '',
};

const emptyVolunteerForm = {
  name: '',
  phone: '',
  email: '',
  preferredArea: '',
  availability: '',
  assignedDutyId: '',
  status: 'Registered' as VolunteerStatus,
};

function money(n: number) {
  return `Rs ${n.toLocaleString('en-IN')}`;
}

function initials(name: string) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

const HrPage: React.FC = () => {
  const { items: staff, add: addStaff, update: updateStaff, remove: removeStaff } = useStore<StaffRecord>(initialStaff);
  const { items: duties, add: addDuty, update: updateDuty, remove: removeDuty } = useStore<DutySchedule>(initialDuties);
  const { items: volunteers, add: addVolunteer, update: updateVolunteer, remove: removeVolunteer } = useStore<VolunteerRecord>(initialVolunteers);
  const { items: payroll, add: addPayroll, update: updatePayroll, setItems: setPayroll } = useStore<PayrollEntry>(initialPayroll);

  const [search, setSearch] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('2026-04');
  const [activeSection, setActiveSection] = useState<HrSection>('staff');

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffEditId, setStaffEditId] = useState<string | null>(null);
  const [staffDeleteId, setStaffDeleteId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);

  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [dutyEditId, setDutyEditId] = useState<string | null>(null);
  const [dutyDeleteId, setDutyDeleteId] = useState<string | null>(null);
  const [dutyForm, setDutyForm] = useState(emptyDutyForm);

  const [volModalOpen, setVolModalOpen] = useState(false);
  const [volEditId, setVolEditId] = useState<string | null>(null);
  const [volDeleteId, setVolDeleteId] = useState<string | null>(null);
  const [volForm, setVolForm] = useState(emptyVolunteerForm);

  const staffById = useMemo(() => Object.fromEntries(staff.map(item => [item.id, item])), [staff]);
  const normalizedQuery = search.toLowerCase().trim();

  const filteredStaff = useMemo(() => {
    if (!normalizedQuery) return staff;
    return staff.filter(item =>
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.role.toLowerCase().includes(normalizedQuery) ||
      item.department.toLowerCase().includes(normalizedQuery) ||
      item.email.toLowerCase().includes(normalizedQuery)
    );
  }, [staff, normalizedQuery]);

  const filteredDuties = useMemo(() => {
    if (!normalizedQuery) return duties;
    return duties.filter(item => {
      const assignee = (staffById[item.staffId]?.name || '').toLowerCase();
      return (
        assignee.includes(normalizedQuery) ||
        item.location.toLowerCase().includes(normalizedQuery) ||
        item.slot.toLowerCase().includes(normalizedQuery) ||
        item.status.toLowerCase().includes(normalizedQuery) ||
        item.dutyDate.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [duties, staffById, normalizedQuery]);

  const filteredVolunteers = useMemo(() => {
    if (!normalizedQuery) return volunteers;
    return volunteers.filter(item =>
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.preferredArea.toLowerCase().includes(normalizedQuery) ||
      item.availability.toLowerCase().includes(normalizedQuery) ||
      item.status.toLowerCase().includes(normalizedQuery) ||
      item.phone.toLowerCase().includes(normalizedQuery)
    );
  }, [volunteers, normalizedQuery]);

  const payrollForMonth = useMemo(() => payroll.filter(entry => entry.month === payrollMonth), [payroll, payrollMonth]);

  const totals = useMemo(() => {
    const activeStaff = filteredStaff.filter(item => item.status === 'Active').length;
    const priests = filteredStaff.filter(item => item.role === 'Priest' && item.status === 'Active').length;
    const scheduledDuties = filteredDuties.filter(item => item.status === 'Scheduled').length;
    const assignedVolunteers = filteredVolunteers.filter(item => item.status === 'Assigned').length;
    return { activeStaff, priests, scheduledDuties, assignedVolunteers };
  }, [filteredStaff, filteredDuties, filteredVolunteers]);

  const openAddStaff = () => {
    setStaffForm(emptyStaffForm);
    setStaffEditId(null);
    setStaffModalOpen(true);
  };

  const openEditStaff = (item: StaffRecord) => {
    setStaffForm({
      name: item.name,
      role: item.role,
      department: item.department,
      joinedDate: item.joinedDate,
      salary: item.salary,
      phone: item.phone,
      email: item.email,
      status: item.status,
    });
    setStaffEditId(item.id);
    setStaffModalOpen(true);
  };

  const saveStaff = () => {
    if (!staffForm.name.trim() || !staffForm.department.trim()) return;
    const payload: Omit<StaffRecord, 'id'> = {
      ...staffForm,
      salary: Number(staffForm.salary) || 0,
    };

    if (staffEditId) {
      updateStaff(staffEditId, payload);
    } else {
      addStaff(payload);
    }
    setStaffModalOpen(false);
  };

  const openAddDuty = () => {
    setDutyForm({ ...emptyDutyForm, staffId: staff[0]?.id ?? '' });
    setDutyEditId(null);
    setDutyModalOpen(true);
  };

  const openEditDuty = (item: DutySchedule) => {
    setDutyForm({
      staffId: item.staffId,
      dutyType: item.dutyType,
      dutyDate: item.dutyDate,
      slot: item.slot,
      location: item.location,
      status: item.status,
      notes: item.notes,
    });
    setDutyEditId(item.id);
    setDutyModalOpen(true);
  };

  const saveDuty = () => {
    if (!dutyForm.staffId || !dutyForm.dutyDate || !dutyForm.location.trim()) return;
    const payload: Omit<DutySchedule, 'id'> = { ...dutyForm };

    if (dutyEditId) {
      updateDuty(dutyEditId, payload);
    } else {
      addDuty(payload);
    }
    setDutyModalOpen(false);
  };

  const openAddVolunteer = () => {
    setVolForm(emptyVolunteerForm);
    setVolEditId(null);
    setVolModalOpen(true);
  };

  const openEditVolunteer = (item: VolunteerRecord) => {
    setVolForm({
      name: item.name,
      phone: item.phone,
      email: item.email,
      preferredArea: item.preferredArea,
      availability: item.availability,
      assignedDutyId: item.assignedDutyId,
      status: item.status,
    });
    setVolEditId(item.id);
    setVolModalOpen(true);
  };

  const saveVolunteer = () => {
    if (!volForm.name.trim()) return;
    const payload: Omit<VolunteerRecord, 'id'> = { ...volForm };

    if (volEditId) {
      updateVolunteer(volEditId, payload);
    } else {
      addVolunteer(payload);
    }
    setVolModalOpen(false);
  };

  const generatePayrollForMonth = () => {
    const existingStaffIds = new Set(payroll.filter(entry => entry.month === payrollMonth).map(entry => entry.staffId));

    const newEntries: PayrollEntry[] = staff
      .filter(item => item.status === 'Active' && !existingStaffIds.has(item.id))
      .map(item => {
        const allowance = item.role === 'Priest' ? 2500 : 1200;
        const deduction = 0;
        return {
          id: `tmp-${crypto.randomUUID()}`,
          staffId: item.id,
          month: payrollMonth,
          basePay: item.salary,
          allowance,
          deduction,
          netPay: item.salary + allowance - deduction,
          payoutStatus: 'Unpaid',
        };
      });

    if (newEntries.length > 0) {
      setPayroll(prev => [...newEntries, ...prev]);
    }
  };

  const payrollTotal = payrollForMonth.reduce((sum, entry) => sum + entry.netPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-gradient-to-r from-amber-50/50 via-background to-blue-50/50 px-4 py-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">HR & Volunteer Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Priest/staff records, duty schedules, payroll, and volunteer assignment in one workspace.</p>
        </div>
        <input
          className="w-full max-w-xs px-3 py-2 text-sm border border-border rounded-md bg-background"
          placeholder="Search staff, duties, volunteers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active Staff</p>
          <p className="text-2xl font-semibold mt-1">{totals.activeStaff}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Priests</p>
          <p className="text-2xl font-semibold mt-1">{totals.priests}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Scheduled Duties</p>
          <p className="text-2xl font-semibold mt-1">{totals.scheduledDuties}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Assigned Volunteers</p>
          <p className="text-2xl font-semibold mt-1">{totals.assignedVolunteers}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {([
            { key: 'staff' as HrSection, label: 'Staff Records', icon: Briefcase },
            { key: 'duties' as HrSection, label: 'Duty Schedules', icon: CalendarDays },
            { key: 'volunteers' as HrSection, label: 'Volunteers', icon: Users },
            { key: 'payroll' as HrSection, label: 'Payroll', icon: Wallet },
          ]).map(sec => (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors border ${activeSection === sec.key ? 'bg-muted border-foreground/20 text-foreground font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            >
              <sec.icon className="h-4 w-4" />
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'staff' && (
        <section className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Priest & Staff Records</h2>
            </div>
            <Button size="sm" onClick={openAddStaff}><Plus className="h-4 w-4 mr-1" />Add Staff</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Salary</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(item => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.email || 'No email'}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">{item.role}</td>
                    <td className="p-3 text-muted-foreground">{item.department}</td>
                    <td className="p-3 text-muted-foreground">{item.joinedDate}</td>
                    <td className="p-3 text-right font-semibold">{money(item.salary)}</td>
                    <td className="p-3"><StatusBadge status={item.status} /></td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditStaff(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setStaffDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeSection === 'payroll' && (
        <section className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Payroll</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="month"
                value={payrollMonth}
                onChange={e => setPayrollMonth(e.target.value)}
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              />
              <Button size="sm" onClick={generatePayrollForMonth}>Generate</Button>
            </div>

            <div className="rounded-md border border-border p-3 bg-muted/10">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Payroll Total</p>
              <p className="text-xl font-semibold mt-1">{money(payrollTotal)}</p>
            </div>

            <div className="space-y-2 max-h-[270px] overflow-y-auto pr-1">
              {payrollForMonth.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No payroll entries for this month.</p>
              ) : (
                payrollForMonth.map(entry => {
                  const member = staffById[entry.staffId];
                  return (
                    <div key={entry.id} className="rounded-md border border-border p-3 bg-background">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{member?.name ?? 'Staff Member'}</p>
                        <StatusBadge status={entry.payoutStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{money(entry.basePay)} + {money(entry.allowance)} - {money(entry.deduction)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-semibold">Net: {money(entry.netPay)}</p>
                        {entry.payoutStatus === 'Unpaid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePayroll(entry.id, { payoutStatus: 'Paid' })}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'duties' && (
        <section className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Duty Schedules</h2>
            </div>
            <Button size="sm" onClick={openAddDuty}><Plus className="h-4 w-4 mr-1" />Assign Duty</Button>
          </div>
          <div className="p-4 space-y-2 max-h-[380px] overflow-y-auto">
            {filteredDuties.map(item => (
              <div key={item.id} className="rounded-lg border border-border p-3 bg-background">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{staffById[item.staffId]?.name ?? 'Unknown Staff'}</p>
                    <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">{item.dutyType}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.dutyDate} · {item.slot}</p>
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.notes && <p className="text-xs text-muted-foreground mt-2">{item.notes}</p>}
                <div className="flex justify-end gap-1 mt-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDuty(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDutyDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'volunteers' && (
        <section className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Volunteer Registration & Assignment</h2>
            </div>
            <Button size="sm" onClick={openAddVolunteer}><Plus className="h-4 w-4 mr-1" />Register</Button>
          </div>
          <div className="p-4 space-y-2 max-h-[380px] overflow-y-auto">
            {filteredVolunteers.map(item => (
              <div key={item.id} className="rounded-lg border border-border p-3 bg-background">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-xs font-semibold">
                      {initials(item.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.preferredArea} · {item.availability}</p>
                      <p className="text-xs text-muted-foreground">{item.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Assigned Duty: {item.assignedDutyId ? duties.find(d => d.id === item.assignedDutyId)?.location ?? item.assignedDutyId : 'Not assigned'}
                </p>
                <div className="flex justify-end gap-1 mt-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditVolunteer(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setVolDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal open={staffModalOpen} onClose={() => setStaffModalOpen(false)} title={staffEditId ? 'Edit Staff Record' : 'Add Staff Record'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={staffForm.name} onChange={e => setStaffForm(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={staffForm.role} onChange={e => setStaffForm(prev => ({ ...prev, role: e.target.value as StaffRole }))}>
              <option value="Priest">Priest</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Department</label>
            <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={staffForm.department} onChange={e => setStaffForm(prev => ({ ...prev, department: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Joined Date</label>
            <input type="date" className="w-full h-10 rounded-md border border-input px-3 text-sm" value={staffForm.joinedDate} onChange={e => setStaffForm(prev => ({ ...prev, joinedDate: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Monthly Salary</label>
            <input type="number" className="w-full h-10 rounded-md border border-input px-3 text-sm" value={String(staffForm.salary)} onChange={e => setStaffForm(prev => ({ ...prev, salary: Number(e.target.value) }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={staffForm.status} onChange={e => setStaffForm(prev => ({ ...prev, status: e.target.value as StaffStatus }))}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={staffForm.phone} onChange={e => setStaffForm(prev => ({ ...prev, phone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input type="email" className="w-full h-10 rounded-md border border-input px-3 text-sm" value={staffForm.email} onChange={e => setStaffForm(prev => ({ ...prev, email: e.target.value }))} />
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setStaffModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveStaff} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={dutyModalOpen} onClose={() => setDutyModalOpen(false)} title={dutyEditId ? 'Edit Duty Schedule' : 'Assign Duty'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Staff/Priest</label>
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={dutyForm.staffId} onChange={e => setDutyForm(prev => ({ ...prev, staffId: e.target.value }))}>
              {staff.map(item => <option key={item.id} value={item.id}>{item.name} ({item.role})</option>)}
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Duty Type</label>
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={dutyForm.dutyType} onChange={e => setDutyForm(prev => ({ ...prev, dutyType: e.target.value as DutyType }))}>
              {dutyTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Duty Date</label>
            <input type="date" className="w-full h-10 rounded-md border border-input px-3 text-sm" value={dutyForm.dutyDate} onChange={e => setDutyForm(prev => ({ ...prev, dutyDate: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Slot</label>
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={dutyForm.slot} onChange={e => setDutyForm(prev => ({ ...prev, slot: e.target.value }))}>
              <option>05:00 AM - 09:00 AM</option>
              <option>09:00 AM - 01:00 PM</option>
              <option>01:00 PM - 05:00 PM</option>
              <option>05:00 PM - 09:00 PM</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Location</label>
            <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={dutyForm.location} onChange={e => setDutyForm(prev => ({ ...prev, location: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={dutyForm.status} onChange={e => setDutyForm(prev => ({ ...prev, status: e.target.value as DutyStatus }))}>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea className="w-full rounded-md border border-input px-3 py-2 text-sm min-h-[76px]" value={dutyForm.notes} onChange={e => setDutyForm(prev => ({ ...prev, notes: e.target.value }))} />
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDutyModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveDuty} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={volModalOpen} onClose={() => setVolModalOpen(false)} title={volEditId ? 'Edit Volunteer' : 'Register Volunteer'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={volForm.name} onChange={e => setVolForm(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={volForm.phone} onChange={e => setVolForm(prev => ({ ...prev, phone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input type="email" className="w-full h-10 rounded-md border border-input px-3 text-sm" value={volForm.email} onChange={e => setVolForm(prev => ({ ...prev, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Preferred Area</label>
            <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={volForm.preferredArea} onChange={e => setVolForm(prev => ({ ...prev, preferredArea: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Availability</label>
            <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={volForm.availability} onChange={e => setVolForm(prev => ({ ...prev, availability: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Assign Duty</label>
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={volForm.assignedDutyId} onChange={e => setVolForm(prev => ({ ...prev, assignedDutyId: e.target.value }))}>
              <option value="">Not assigned</option>
              {duties.map(item => (
                <option key={item.id} value={item.id}>{item.dutyDate} · {item.location}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={volForm.status} onChange={e => setVolForm(prev => ({ ...prev, status: e.target.value as VolunteerStatus }))}>
              <option value="Registered">Registered</option>
              <option value="Assigned">Assigned</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setVolModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveVolunteer} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!staffDeleteId}
        onClose={() => setStaffDeleteId(null)}
        onConfirm={() => staffDeleteId && removeStaff(staffDeleteId)}
        title="Delete Staff Record"
        message="Are you sure you want to delete this staff record?"
      />

      <ConfirmDialog
        open={!!dutyDeleteId}
        onClose={() => setDutyDeleteId(null)}
        onConfirm={() => dutyDeleteId && removeDuty(dutyDeleteId)}
        title="Delete Duty Schedule"
        message="Are you sure you want to delete this schedule entry?"
      />

      <ConfirmDialog
        open={!!volDeleteId}
        onClose={() => setVolDeleteId(null)}
        onConfirm={() => volDeleteId && removeVolunteer(volDeleteId)}
        title="Delete Volunteer"
        message="Are you sure you want to delete this volunteer record?"
      />
    </div>
  );
};

export default HrPage;
