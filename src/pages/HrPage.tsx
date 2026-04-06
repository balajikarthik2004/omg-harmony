import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, CalendarDays, Users, Briefcase, Wallet, Search, Phone, Mail, FileText, BadgeIndianRupee, X, CheckCircle2, UserX, Receipt, Printer } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { useVolunteerStore } from '@/hooks/useVolunteerStore';
import VolunteerForm from '@/components/VolunteerForm';
import SalarySlip from '@/components/SalarySlip';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';
import FormField from '@/components/FormField';

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

interface PayrollEntry {
  id: string;
  staffId: string;
  month: string;
  basePay: number;
  allowance: number;
  deduction: number;
  netPay: number;
  payoutStatus: PayrollStatus;
  absentDays?: number;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: 'Present' | 'Absent';
}

const initialAttendance: AttendanceRecord[] = [
  { id: 'AT-001', staffId: 'ST002', date: new Date().toISOString().split('T')[0], status: 'Absent' },
];

type HrSection = 'staff' | 'payroll' | 'duties' | 'volunteers' | 'attendance';

const initialStaff: StaffRecord[] = [
  { id: 'ST001', name: 'Pandit Sharma', role: 'Priest', department: 'Main Sanctum', joinedDate: '2020-01-10', salary: 35000, phone: '+91 9876543210', email: 'sharma@temple.org', status: 'Active' },
  { id: 'ST002', name: 'Suresh Kumar', role: 'Staff', department: 'Kitchen', joinedDate: '2021-03-12', salary: 22000, phone: '+91 9876500011', email: 'suresh@temple.org', status: 'Active' },
  { id: 'ST003', name: 'Anita Menon', role: 'Staff', department: 'Administration', joinedDate: '2022-08-01', salary: 28000, phone: '+91 9876500022', email: 'anita@temple.org', status: 'Active' },
];

const initialDuties: DutySchedule[] = [
  { id: 'DT001', staffId: 'ST001', dutyType: 'Pooja Ritual', dutyDate: '2026-04-05', slot: '05:00 AM - 09:00 AM', location: 'Main Sanctum', status: 'Scheduled', notes: 'Morning pooja and archana' },
  { id: 'DT002', staffId: 'ST002', dutyType: 'Annadanam Service', dutyDate: '2026-04-05', slot: '09:00 AM - 01:00 PM', location: 'Kitchen', status: 'Scheduled', notes: 'Annadanam preparation' },
  { id: 'DT003', staffId: 'ST003', dutyType: 'Administration', dutyDate: '2026-04-05', slot: '01:00 PM - 05:00 PM', location: 'Admin Office', status: 'Completed', notes: 'Documentation and donor desk' },
];

const dutyTypeOptions: DutyType[] = [
  'Pooja Ritual', 'Annadanam Service', 'Temple Operations', 'Administration', 'Volunteer Coordination', 'Maintenance'
];

const initialVolunteers: VolunteerRecord[] = [
  { id: 'VL001', name: 'Meena Devi', phone: '+91 9000011111', email: 'meena@email.com', preferredArea: 'Events Desk', availability: 'Weekends', assignedDutyId: 'DT003', status: 'Assigned' },
  { id: 'VL002', name: 'Rahul Jain', phone: '+91 9000011112', email: 'rahul@email.com', preferredArea: 'Crowd Management', availability: 'Evenings', assignedDutyId: '', status: 'Registered' },
];

const initialPayroll: PayrollEntry[] = [
  { id: 'PY001', staffId: 'ST001', month: '2026-04', basePay: 35000, allowance: 3000, deduction: 1000, netPay: 37000, payoutStatus: 'Unpaid' },
  { id: 'PY002', staffId: 'ST002', month: '2026-04', basePay: 22000, allowance: 1500, deduction: 500, netPay: 23000, payoutStatus: 'Paid' },
];

const emptyStaffForm = { name: '', role: 'Staff' as StaffRole, department: '', joinedDate: '', salary: 0, phone: '', email: '', status: 'Active' as StaffStatus };
const emptyDutyForm = { staffId: '', dutyType: 'Temple Operations' as DutyType, dutyDate: '', slot: '05:00 AM - 09:00 AM', location: '', status: 'Scheduled' as DutyStatus, notes: '' };

function money(n: number) { return `₹${n.toLocaleString('en-IN')}`; }
function initials(name: string) { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(); }

const HrPage: React.FC = () => {
  const { items: staff, add: addStaff, update: updateStaff, remove: removeStaff } = useStore<StaffRecord>(initialStaff);
  const { items: duties, add: addDuty, update: updateDuty, remove: removeDuty } = useStore<DutySchedule>(initialDuties);
  const { items: volunteers, add: addVolunteer, update: updateVolunteer, remove: removeVolunteer } = useVolunteerStore();
  
  const { items: payroll, add: addPayroll, update: updatePayroll, setItems: setPayroll } = useStore<PayrollEntry>(initialPayroll);
  const { items: attendance, add: addAttendance, update: updateAttendance, remove: removeAttendance } = useStore<AttendanceRecord>(initialAttendance);
  
  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedStaffForAttendance, setSelectedStaffForAttendance] = useState<string | null>(null);
  const [viewingBill, setViewingBill] = useState<PayrollEntry | null>(null);
  const [activeSection, setActiveSection] = useState<HrSection>('staff');

  const [search, setSearch] = useState('');

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
      (item.preferredArea || '').toLowerCase().includes(normalizedQuery) ||
      item.availability.toLowerCase().includes(normalizedQuery) ||
      item.status.toLowerCase().includes(normalizedQuery) ||
      item.contact.toLowerCase().includes(normalizedQuery)
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

  const openAddStaff = () => { setStaffForm(emptyStaffForm); setStaffEditId(null); setStaffModalOpen(true); };
  const openEditStaff = (item: StaffRecord) => { setStaffForm({ ...item }); setStaffEditId(item.id); setStaffModalOpen(true); };
  const saveStaff = () => {
    if (!staffForm.name.trim() || !staffForm.department.trim()) return;
    const payload = { ...staffForm, salary: Number(staffForm.salary) || 0 };
    if (staffEditId) updateStaff(staffEditId, payload);
    else addStaff(payload);
    setStaffModalOpen(false);
  };
  const setSField = <K extends keyof StaffRecord>(k: K, v: any) => setStaffForm(p => ({ ...p, [k]: v }));

  const openAddDuty = () => { setDutyForm({ ...emptyDutyForm, staffId: staff[0]?.id ?? '' }); setDutyEditId(null); setDutyModalOpen(true); };
  const openEditDuty = (item: DutySchedule) => { setDutyForm({ ...item }); setDutyEditId(item.id); setDutyModalOpen(true); };
  const saveDuty = () => {
    if (!dutyForm.staffId || !dutyForm.dutyDate || !dutyForm.location.trim()) return;
    if (dutyEditId) updateDuty(dutyEditId, { ...dutyForm });
    else addDuty({ ...dutyForm });
    setDutyModalOpen(false);
  };
  const setDField = <K extends keyof DutySchedule>(k: K, v: any) => setDutyForm(p => ({ ...p, [k]: v }));
  const generatePayrollForMonth = () => {
    const existingStaffIds = new Set(payroll.filter(entry => entry.month === payrollMonth).map(entry => entry.staffId));
    
    const newEntries = staff.filter(member => !existingStaffIds.has(member.id)).map(member => {
      // Calculate Absences for this month
      const memberAbsences = attendance.filter(a => 
        a.staffId === member.id && 
        a.date.startsWith(payrollMonth) && 
        a.status === 'Absent'
      ).length;

      const basePay = member.salary;
      const allowance = 500;
      const dailyRate = basePay / 30;
      const deduction = Math.round(dailyRate * memberAbsences);
      const netPay = basePay + allowance - deduction;

      return {
        id: `PAY-${member.id}-${payrollMonth}`,
        staffId: member.id,
        month: payrollMonth,
        basePay,
        allowance,
        deduction,
        netPay,
        payoutStatus: 'Unpaid' as PayrollStatus,
        absentDays: memberAbsences
      };
    });

    if (newEntries.length > 0) {
        setPayroll([...payroll, ...newEntries]);
        toast.success(`Generated payroll for ${newEntries.length} staff members.`);
    } else {
        toast.info("Payroll already generated for all staff this month.");
    }
  };

  const payrollTotal = payrollForMonth.reduce((sum, entry) => sum + entry.netPay, 0);

  return (
    <div className="hr-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner hr-header bg-gradient-to-r from-violet-50/80 via-background to-sky-50/80">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><Briefcase className="w-5 h-5 text-violet-600" /> HR & Volunteer Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage temple staff details, schedules, payroll, and volunteers.</p>
        </div>
        <div className="relative max-w-sm w-full md:w-72 mt-3 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="hr-search-input w-full pl-9 pr-4 h-10 rounded-lg border border-input bg-background/80 text-sm transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 hover:border-border outline-none shadow-sm"
            placeholder="Search staff..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <div className="stat-card hr-stat-card flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-muted/30 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Total Active Staff</p>
          <p className="text-3xl font-display font-bold mt-2 text-foreground relative z-10">{totals.activeStaff}</p>
        </div>
        <div className="stat-card hr-stat-card flex flex-col justify-between group overflow-hidden relative border-orange-100 bg-orange-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-orange-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-orange-800 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Priests</p>
          <p className="text-3xl font-display font-bold mt-2 text-orange-700 relative z-10">{totals.priests}</p>
        </div>
        <div className="stat-card hr-stat-card flex flex-col justify-between group overflow-hidden relative border-amber-100 bg-amber-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-amber-800 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Assigned Duties</p>
          <p className="text-3xl font-display font-bold mt-2 text-amber-700 relative z-10">{totals.scheduledDuties}</p>
        </div>
        <div className="stat-card hr-stat-card flex flex-col justify-between group overflow-hidden relative border-emerald-100 bg-emerald-50/40">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-100/50 group-hover:scale-110 transition-transform" />
          <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-800 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Total Volunteers</p>
          <p className="text-3xl font-display font-bold mt-2 text-emerald-700 relative z-10">{totals.assignedVolunteers}</p>
        </div>
      </div>

      <div className="hr-tabbar bg-card/80 backdrop-blur-md rounded-2xl border border-border/80 p-1.5 flex flex-wrap gap-1 md:inline-flex shadow-sm relative z-10">
        {([
          { key: 'staff' as HrSection, label: 'Staff List', icon: Briefcase },
          { key: 'duties' as HrSection, label: 'Duties', icon: CalendarDays },
          { key: 'volunteers' as HrSection, label: 'Volunteers', icon: Users },
          { key: 'attendance' as HrSection, label: 'Attendance', icon: UserX },
          { key: 'payroll' as HrSection, label: 'Payroll', icon: Wallet },
        ]).map(sec => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={`hr-tab-btn flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 flex-1 md:flex-none ${activeSection === sec.key ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
          >
            <sec.icon className="h-4 w-4" />
            {sec.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in relative">
        {activeSection === 'staff' && (
          <section className="section-panel hr-main-panel shadow-sm border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
            <div className="section-panel-header gap-4 border-b border-border/60 pb-4 bg-gradient-to-r from-primary/5 to-transparent">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Staff Member List</h2>
              <Button onClick={openAddStaff} className="shadow-md hover:shadow-lg"><Plus className="h-4 w-4 mr-2" />Add Staff</Button>
            </div>
            <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Employee Info</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Role & Dept</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Joined Date</th>
                    <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Salary</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-background">
                  {filteredStaff.length === 0 ? <tr><td colSpan={6} className="p-10 text-center font-medium text-muted-foreground border-b border-border">No staff found matching search.</td></tr> : filteredStaff.map(item => (
                    <tr key={item.id} className="hr-row border-b border-border hover:bg-muted/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border-2 ${item.role === 'Priest' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                             {initials(item.name)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm tracking-wide">{item.name}</p>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-muted-foreground mt-1">
                              <span className="flex items-center gap-1 bg-muted/60 px-1.5 py-0.5 rounded border border-border/50"><Phone className="w-3 h-3 opacity-70" />{item.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold mb-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border ${item.role === 'Priest' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{item.role}</span>
                        <p className="text-xs font-semibold text-foreground/80">{item.department}</p>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs font-medium">{item.joinedDate}</td>
                      <td className="p-4 text-right font-display font-bold text-emerald-700 text-lg tracking-tight">{money(item.salary)}</td>
                      <td className="p-4"><StatusBadge status={item.status} /></td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => openEditStaff(item)} title="Edit Staff"><Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setStaffDeleteId(item.id)} title="Delete Staff" className="hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          </section>
        )}

        {activeSection === 'payroll' && (
          <section className="section-panel hr-main-panel bg-gradient-to-b from-background to-slate-50/50 shadow-sm border-l-4 border-slate-500">
             <div className="section-panel-header gap-4 border-b border-border/60 pb-4 bg-gradient-to-r from-slate-100/50 to-transparent">
               <h2 className="text-sm font-semibold flex items-center gap-2"><Wallet className="w-4 h-4 text-slate-600" /> Payroll Management</h2>
             </div>
             <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 mb-8 bg-background border border-border/70 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex-1 relative z-10">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground block mb-2">Select Month</label>
                    <div className="flex gap-3">
                      <input type="month" value={payrollMonth} onChange={e => setPayrollMonth(e.target.value)} className="h-12 w-48 rounded-lg border border-input bg-background px-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-slate-500/20 outline-none hover:border-border transition-all shadow-inner" />
                      <Button onClick={generatePayrollForMonth} className="h-12 px-6 shadow-md font-bold bg-slate-700 hover:bg-slate-800 text-white">Generate Payroll</Button>
                    </div>
                  </div>
                  <div className="md:border-l md:border-border/60 md:pl-8 flex flex-col justify-center relative z-10">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Total Salary for Month</p>
                    <p className="text-4xl font-display font-bold text-slate-800 mt-1">{money(payrollTotal)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><BadgeIndianRupee className="h-4 w-4 text-slate-600" /> Paid Salaries Record</h3>
                  {payrollForMonth.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 border-2 border-dashed border-border rounded-2xl">
                      <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-base font-bold text-foreground">No payroll generated for this month</p>
                      <p className="text-sm font-medium text-muted-foreground mt-1">Select a month and click "Generate Payroll" to populate.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {payrollForMonth.map(entry => {
                        const member = staffById[entry.staffId];
                        return (
                          <div key={entry.id} className="rounded-2xl border border-border bg-background p-5 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5">
                            <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
                              <div>
                                <p className="text-base font-bold text-foreground tracking-tight">{member?.name ?? 'Unknown Staff'}</p>
                                <p className="text-[11px] uppercase font-bold tracking-widest text-muted-foreground mt-1 bg-muted/50 inline-flex px-1.5 py-0.5 rounded border border-border/50">{member?.role} · {member?.department}</p>
                              </div>
                              <StatusBadge status={entry.payoutStatus} />
                            </div>
                            
                            <div className="space-y-2.5 mb-5 text-sm font-semibold bg-muted/20 p-4 rounded-xl border border-border/40 scale-[0.98] group-hover:scale-100 transition-transform origin-center">
                              <div className="flex justify-between text-muted-foreground items-center"><span>Base Pay</span> <span className="text-foreground tracking-tight">{money(entry.basePay)}</span></div>
                              <div className="flex justify-between text-emerald-700 items-center"><span>Allowances</span> <span className="bg-emerald-50 px-1.5 rounded text-emerald-800">+{money(entry.allowance)}</span></div>
                              {entry.deduction > 0 && <div className="flex justify-between text-rose-600 items-center"><span>Deductions</span> <span className="bg-rose-50 px-1.5 rounded text-rose-800">-{money(entry.deduction)}</span></div>}
                            </div>
                            
                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Net Pay</p>
                                <p className="text-2xl font-display font-bold text-foreground tracking-tight">{money(entry.netPay)}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="border-slate-200 h-9 font-bold hover:bg-slate-50" onClick={() => setViewingBill(entry)}>
                                    <Receipt className="w-3.5 h-3.5 mr-1.5" /> Statement
                                </Button>
                                {entry.payoutStatus === 'Unpaid' && (
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 font-bold shadow-sm" onClick={() => updatePayroll(entry.id, { payoutStatus: 'Paid' })}>Pay Salary</Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
             </div>
          </section>
        )}

        {activeSection === 'duties' && (
          <section className="section-panel hr-main-panel border-l-4" style={{ borderLeftColor: 'hsl(var(--amber))' }}>
            <div className="section-panel-header gap-4 border-b border-border/60 pb-4 bg-gradient-to-r from-amber-50/50 to-transparent">
              <h2 className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-amber-600" /> Active Duties List</h2>
              <Button onClick={openAddDuty} className="shadow-md hover:shadow-lg bg-amber-600 hover:bg-amber-700 text-white"><Plus className="h-4 w-4 mr-2" />Add Duty</Button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {filteredDuties.length === 0 ? <p className="col-span-full py-12 text-center text-muted-foreground font-medium border-2 border-dashed border-border rounded-2xl">No duties are currently set up.</p> : filteredDuties.map(item => (
                 <div key={item.id} className="hr-duty-card rounded-2xl border border-border bg-background p-5 shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden hover:-translate-y-1">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
                   <div className="relative z-10 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-4">
                       <div className="flex gap-3">
                         <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0 border border-amber-200 shadow-sm">{initials(staffById[item.staffId]?.name ?? 'US')}</div>
                         <div>
                           <p className="font-bold text-base leading-tight text-foreground tracking-tight">{staffById[item.staffId]?.name ?? 'Unknown Staff'}</p>
                           <p className="text-[10px] uppercase tracking-widest text-amber-700 font-bold mt-1 bg-amber-50 inline-flex px-1.5 rounded">{item.dutyType}</p>
                         </div>
                       </div>
                       <StatusBadge status={item.status} />
                     </div>
                     <div className="space-y-2 text-xs text-muted-foreground font-semibold bg-muted/30 p-3.5 rounded-xl border border-border/50 mb-4 flex-1">
                        <div className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5 text-primary/70" /> <span className="text-foreground">{item.dutyDate}</span> • {item.slot}</div>
                        <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-emerald-600/70" /> <span className="text-foreground">{item.location}</span></div>
                     </div>
                     {item.notes && <div className="text-xs text-muted-foreground italic mb-5 border-l-2 border-amber-300 pl-2 py-0.5">"{item.notes}"</div>}
                     
                     <div className="flex gap-2 mt-auto pt-4 border-t border-border/60">
                        <Button variant="ghost" size="sm" className="flex-1 h-9 font-bold bg-muted/40 hover:bg-muted" onClick={() => openEditDuty(item)}><Pencil className="h-3.5 w-3.5 mr-2 text-muted-foreground group-hover:text-foreground" />Edit</Button>
                        <Button variant="ghost" size="sm" className="flex-1 h-9 font-bold text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDutyDeleteId(item.id)}><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</Button>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </section>
        )}

        {activeSection === 'volunteers' && (
          <section className="section-panel hr-main-panel border-l-4" style={{ borderLeftColor: 'hsl(var(--emerald))' }}>
            <div className="section-panel-header gap-4 border-b border-border/60 pb-4 bg-gradient-to-r from-emerald-50/50 to-transparent">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-emerald-600" /> Enlisted Volunteers</h2>
              <Button onClick={() => { setVolEditId(null); setVolModalOpen(true); }} className="shadow-md hover:shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="h-4 w-4 mr-2" />Add Volunteer</Button>
            </div>
            <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Volunteer Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Preferred Area</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Availability</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-background">
                  {filteredVolunteers.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-muted-foreground font-medium border-b border-border">No volunteers in community database.</td></tr> : filteredVolunteers.map(item => (
                    <tr key={item.id} className="hr-row border-b border-border hover:bg-muted/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                             {initials(item.name)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm tracking-wide">{item.name}</p>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1 flex gap-2">
                               <span><Phone className="w-3 h-3 inline pb-0.5 opacity-70" /> {item.contact}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-foreground/80">{item.preferredArea}</td>
                      <td className="p-4 text-muted-foreground text-xs font-semibold">{item.availability}</td>
                      <td className="p-4"><StatusBadge status={item.status} /></td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setVolEditId(item.id);
                            setVolModalOpen(true);
                          }} title="Edit Details"><Pencil className="h-4 w-4 text-muted-foreground group-hover:text-foreground" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setVolDeleteId(item.id)} className="hover:text-destructive hover:bg-destructive/10" title="Remove Record"><Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          </section>
        )}
        {activeSection === 'attendance' && (
          <section className="section-panel hr-main-panel border-l-4 border-rose-500">
            <div className="section-panel-header gap-4 border-b border-border/60 pb-4 bg-gradient-to-r from-rose-50/80 to-transparent">
              <div className="flex-1">
                <h2 className="text-sm font-semibold flex items-center gap-2 pr-4 border-r border-border/60"><UserX className="w-4 h-4 text-rose-600" /> Attendance Registry</h2>
                <div className="flex items-center gap-2 ml-4">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Daily Duty Checklist • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Attendance Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                 <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 group hover:border-slate-200 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Users className="w-6 h-6" /></div>
                    <div>
                       <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1.5 text-center">Total Staff</p>
                       <p className="text-2xl font-display font-bold text-slate-800 leading-none">{staff.length}</p>
                    </div>
                 </div>
                 <div className="bg-emerald-50 border border-emerald-100/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 group hover:bg-emerald-100/40 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><CheckCircle2 className="w-6 h-6" /></div>
                    <div>
                       <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-widest leading-none mb-1.5">Present Today</p>
                       <p className="text-2xl font-display font-bold text-emerald-800 leading-none">{staff.length - attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'Absent').length}</p>
                    </div>
                 </div>
                 <div className="bg-rose-50 border border-rose-100/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 group hover:bg-rose-100/40 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><UserX className="w-6 h-6" /></div>
                    <div>
                       <p className="text-[10px] uppercase font-bold text-rose-700 tracking-widest leading-none mb-1.5">Absent Today</p>
                       <p className="text-2xl font-display font-bold text-rose-800 leading-none">{attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'Absent').length}</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {staff.map(member => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const record = attendance.find(a => a.staffId === member.id && a.date === todayStr);
                  const isAbsent = record?.status === 'Absent';
                  
                  return (
                    <div key={member.id} className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group overflow-hidden relative ${isAbsent ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/40'}`}>
                      {isAbsent && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-200/20 rounded-bl-full pointer-events-none" />}
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-300 ${isAbsent ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 ring-4 ring-rose-100' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
                          {initials(member.name)}
                        </div>
                        <div>
                          <p className={`font-bold text-base tracking-tight transition-colors ${isAbsent ? 'text-rose-900 group-hover:text-rose-950' : 'text-slate-800 group-hover:text-black'}`}>
                            {member.name}
                            {isAbsent && <span className="ml-2 inline-block px-1.5 py-0.5 bg-rose-200 text-rose-700 text-[9px] uppercase tracking-tighter rounded font-black">Absent</span>}
                          </p>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">{member.role} • {member.department}</p>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => {
                            if (record) {
                                if (record.status === 'Absent') {
                                    removeAttendance(record.id);
                                    toast.success(`${member.name} marked as Present`, { icon: '✅' });
                                }
                            } else {
                                addAttendance({
                                    id: `AT-${member.id}-${todayStr}`,
                                    staffId: member.id,
                                    date: todayStr,
                                    status: 'Absent'
                                });
                                toast.error(`${member.name} marked as Absent`, { icon: '❌' });
                            }
                        }}
                        className={`rounded-xl h-10 w-10 flex items-center justify-center p-0 transition-all shadow-sm ${isAbsent ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-100'}`}
                      >
                         {isAbsent ? <X className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 border-none rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-16 -mb-16" />
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-indigo-100 text-[11px] font-bold uppercase tracking-widest mb-1.5 opacity-80">Connected Subsystem</p>
                        <h3 className="text-xl font-display font-bold text-white leading-none">Automated Payroll Deduction</h3>
                        <p className="text-indigo-100 text-sm font-medium mt-2 max-w-md">Every absence recorded in this registry is automatically calculated as a Loss of Pay (L.O.P.) during the monthly payroll generation.</p>
                    </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/30 text-white font-black text-center relative z-10 group hover:bg-white/30 transition-all cursor-default">
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-1 opacity-80">Status</p>
                    <p className="text-lg">L.O.P. ACTIVE</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Viewing Bill Modal */}
      <Modal open={!!viewingBill} onClose={() => setViewingBill(null)} title="Official Salary Bill">
        {viewingBill && (
            <SalarySlip 
                entry={viewingBill} 
                member={staffById[viewingBill.staffId]} 
                onClose={() => setViewingBill(null)} 
            />
        )}
      </Modal>

      {/* Staff Modal */}
      <Modal open={staffModalOpen} onClose={() => setStaffModalOpen(false)} title={staffEditId ? 'Edit Staff File' : 'Add New Staff'}>
        <div className="hr-form-shell grid grid-cols-2 gap-4 px-1 py-2">
          <FormField label="Full Name" value={staffForm.name} onChange={v => setSField('name', v)} required />
          <div className="space-y-1.5">
             <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Staff Role</label>
             <select className="w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-semibold" value={staffForm.role} onChange={e => setSField('role', e.target.value)}>
                <option value="Priest">Priest</option><option value="Staff">Support Staff</option>
             </select>
          </div>
          <FormField label="Department" value={staffForm.department} onChange={v => setSField('department', v)} />
          <FormField label="Joining Date" value={staffForm.joinedDate} onChange={v => setSField('joinedDate', v)} type="date" />
          <FormField label="Salary (₹)" value={String(staffForm.salary)} onChange={v => setSField('salary', v)} type="number" />
          <div className="space-y-1.5">
             <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Status</label>
             <select className="w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-semibold" value={staffForm.status} onChange={e => setSField('status', e.target.value)}>
                <option value="Active">Active</option><option value="Inactive">Inactive</option>
             </select>
          </div>
          <FormField label="Phone Number" value={staffForm.phone} onChange={v => setSField('phone', v)} />
          <FormField label="Email Address" value={staffForm.email} onChange={v => setSField('email', v)} type="email" />
          <div className="col-span-2 flex gap-3 pt-5 border-t border-border/60 mt-2">
            <Button variant="outline" onClick={() => setStaffModalOpen(false)} className="flex-1 py-5">Cancel</Button>
            <Button onClick={saveStaff} className="flex-1 py-5 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold">Save Details</Button>
          </div>
        </div>
      </Modal>

      {/* Duty Modal */}
      <Modal open={dutyModalOpen} onClose={() => setDutyModalOpen(false)} title={dutyEditId ? 'Edit Duty Details' : 'Assign New Duty'}>
        <div className="hr-form-shell grid grid-cols-2 gap-4 px-1 py-2">
          <div className="col-span-2 space-y-1.5">
             <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Staff Member</label>
             <select className="w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-semibold" value={dutyForm.staffId} onChange={e => setDField('staffId', e.target.value)}>
                {staff.filter(s => s.status === 'Active').map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
             </select>
          </div>
          <div className="col-span-2 space-y-1.5">
             <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Duty Type</label>
             <select className="w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-semibold" value={dutyForm.dutyType} onChange={e => setDField('dutyType', e.target.value)}>
                {dutyTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
          </div>
          <FormField label="Duty Date" value={dutyForm.dutyDate} onChange={v => setDField('dutyDate', v)} type="date" />
          <div className="space-y-1.5">
             <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Time Slot</label>
             <select className="w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-bold" value={dutyForm.slot} onChange={e => setDField('slot', e.target.value)}>
                 <option>05:00 AM - 09:00 AM</option><option>09:00 AM - 01:00 PM</option><option>01:00 PM - 05:00 PM</option><option>05:00 PM - 09:00 PM</option>
             </select>
          </div>
          <FormField label="Location" value={dutyForm.location} onChange={v => setDField('location', v)} />
          <div className="space-y-1.5">
             <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Duty Status</label>
             <select className="w-full h-11 rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none shadow-sm font-bold" value={dutyForm.status} onChange={e => setDField('status', e.target.value)}>
                <option value="Scheduled">Scheduled</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option>
             </select>
          </div>
          <div className="col-span-2 space-y-1.5">
             <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Optional Notes</label>
             <textarea className="w-full rounded-xl border border-input bg-background/80 px-3 py-3 text-sm min-h-[100px] resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium shadow-sm" value={dutyForm.notes} onChange={e => setDField('notes', e.target.value)} placeholder="Type specific instructions..." />
          </div>
          <div className="col-span-2 flex gap-3 pt-5 border-t border-border/60 mt-2">
            <Button variant="outline" onClick={() => setDutyModalOpen(false)} className="flex-1 py-5">Cancel</Button>
            <Button onClick={saveDuty} className="flex-1 py-5 shadow-md bg-amber-600 hover:bg-amber-700 text-white font-bold">Save Duty</Button>
          </div>
        </div>
      </Modal>

      {/* Volunteer Modal */}
      <Modal open={volModalOpen} onClose={() => setVolModalOpen(false)} title={volEditId ? 'Edit Volunteer Details' : 'Add New Volunteer'}>
        <div className="p-1">
          <VolunteerForm 
            initialData={volEditId ? volunteers.find(v => v.id === volEditId) : null}
            onSave={(data) => {
              if (volEditId) updateVolunteer(volEditId, data as any);
              else addVolunteer(data as any);
              setVolModalOpen(false);
              setVolEditId(null);
            }}
            onCancel={() => {
              setVolModalOpen(false);
              setVolEditId(null);
            }}
          />
        </div>
      </Modal>

      <ConfirmDialog open={!!staffDeleteId} onClose={() => setStaffDeleteId(null)} onConfirm={() => staffDeleteId && removeStaff(staffDeleteId)} title="Delete Staff Member" message="Are you certain you wish to delete this staff member? This action cannot be easily undone." />
      <ConfirmDialog open={!!dutyDeleteId} onClose={() => setDutyDeleteId(null)} onConfirm={() => dutyDeleteId && removeDuty(dutyDeleteId)} title="Delete Duty Record" message="Do you want to permanently delete this assigned duty?" />
      <ConfirmDialog open={!!volDeleteId} onClose={() => setVolDeleteId(null)} onConfirm={() => volDeleteId && removeVolunteer(volDeleteId)} title="Delete Volunteer Entry" message="Are you completely sure you want to remove this volunteer from the database?" />
    </div>
  );
};

export default HrPage;
