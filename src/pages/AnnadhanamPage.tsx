import React, { useMemo, useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Users,
  Package,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Soup,
  Wheat,
  Search,
  Star,
  Bell,
  Utensils,
  MapPin,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';
import { useStore } from '@/hooks/useStore';
import { formatDateDDMMYYYY } from '@/lib/utils';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Prasadam';
type MealStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
type DistributionStatus = 'Served' | 'Partial' | 'Pending' | 'Cancelled';

type MenuItem = { name: string; qty: string };

type MealPlan = {
  id: string;
  date: string;
  mealType: MealType;
  menu: MenuItem[];
  expectedCount: number;
  status: MealStatus;
  organizer: string;
  notes: string;
  sponsor?: string;
};

type DistributionLog = {
  id: string;
  mealPlanId: string;
  date: string;
  mealType: MealType;
  servedCount: number;
  expectedCount: number;
  startTime: string;
  endTime: string;
  status: DistributionStatus;
  volunteer: string;
  feedback: string;
  leftover: string;
};

type IngredientStock = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  dailyUsage: number;
  lastUpdated: string;
};

type SuggestedNeed = {
  ingredient: string;
  qty: number;
  unit: string;
  available: number;
  minThreshold: number;
};

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const mealTypeColor: Record<MealType, { chip: string; icon: React.FC<{ className?: string }> }> = {
  Breakfast: { chip: 'bg-amber-100 text-amber-800 border-amber-200', icon: Flame },
  Lunch: { chip: 'bg-orange-100 text-orange-800 border-orange-200', icon: Soup },
  Dinner: { chip: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Wheat },
  Prasadam: { chip: 'bg-rose-100 text-rose-800 border-rose-200', icon: Star },
};

const statusChip: Record<MealStatus, string> = {
  Planned: 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-amber-50 text-amber-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-red-50 text-red-700',
};

const distStatusChip: Record<DistributionStatus, string> = {
  Served: 'bg-emerald-50 text-emerald-700',
  Partial: 'bg-amber-50 text-amber-700',
  Pending: 'bg-blue-50 text-blue-700',
  Cancelled: 'bg-red-50 text-red-700',
};

const mockMealPlans: MealPlan[] = [
  { id: 'MP001', date: '2026-04-02', mealType: 'Lunch', menu: [{ name: 'Rice', qty: '20 kg' }, { name: 'Sambar', qty: '15 L' }], expectedCount: 300, status: 'In Progress', organizer: 'Pandit Sharma', notes: 'Regular Thursday lunch', sponsor: 'Ravi Family Trust' },
  { id: 'MP002', date: '2026-04-02', mealType: 'Dinner', menu: [{ name: 'Chapati', qty: '400 pcs' }, { name: 'Dal', qty: '20 L' }], expectedCount: 200, status: 'Planned', organizer: 'Temple Committee', notes: 'Evening prasadam' },
  { id: 'MP003', date: '2026-04-03', mealType: 'Breakfast', menu: [{ name: 'Pongal', qty: '15 kg' }, { name: 'Chutney', qty: '5 kg' }], expectedCount: 150, status: 'Planned', organizer: 'Lakshmi Devi', notes: 'Friday morning breakfast' },
];

const mockDistributions: DistributionLog[] = [
  { id: 'DL001', mealPlanId: 'MP001', date: '2026-04-01', mealType: 'Lunch', servedCount: 342, expectedCount: 350, startTime: '12:00 PM', endTime: '2:30 PM', status: 'Served', volunteer: 'Ramesh & Team', feedback: 'Smooth distribution', leftover: '~1 kg rice' },
  { id: 'DL002', mealPlanId: 'MP002', date: '2026-04-02', mealType: 'Dinner', servedCount: 0, expectedCount: 200, startTime: '7:00 PM', endTime: '', status: 'Pending', volunteer: 'Suresh Kumar', feedback: '', leftover: '' },
];

const mockIngredients: IngredientStock[] = [
  { id: 'IG001', name: 'Rice', category: 'Grains', currentStock: 120, unit: 'kg', minThreshold: 50, dailyUsage: 22, lastUpdated: '2026-04-02' },
  { id: 'IG002', name: 'Cooking Oil', category: 'Oils', currentStock: 12, unit: 'L', minThreshold: 10, dailyUsage: 3, lastUpdated: '2026-04-02' },
  { id: 'IG003', name: 'Ghee', category: 'Dairy', currentStock: 4, unit: 'kg', minThreshold: 5, dailyUsage: 1, lastUpdated: '2026-04-02' },
  { id: 'IG004', name: 'Wheat Flour', category: 'Grains', currentStock: 45, unit: 'kg', minThreshold: 20, dailyUsage: 10, lastUpdated: '2026-04-01' },
  { id: 'IG005', name: 'Toor Dal', category: 'Pulses', currentStock: 22, unit: 'kg', minThreshold: 12, dailyUsage: 5, lastUpdated: '2026-04-02' },
  { id: 'IG006', name: 'Jaggery', category: 'Sweeteners', currentStock: 8, unit: 'kg', minThreshold: 6, dailyUsage: 2, lastUpdated: '2026-04-02' },
  { id: 'IG007', name: 'Banana Leaves', category: 'Serving', currentStock: 160, unit: 'pcs', minThreshold: 80, dailyUsage: 50, lastUpdated: '2026-04-02' },
  { id: 'IG008', name: 'Mixed Vegetables', category: 'Vegetables', currentStock: 38, unit: 'kg', minThreshold: 25, dailyUsage: 12, lastUpdated: '2026-04-01' },
  { id: 'IG009', name: 'Curd', category: 'Dairy', currentStock: 14, unit: 'L', minThreshold: 8, dailyUsage: 4, lastUpdated: '2026-04-02' },
  { id: 'IG010', name: 'Pepper & Spices', category: 'Spices', currentStock: 5, unit: 'kg', minThreshold: 4, dailyUsage: 1, lastUpdated: '2026-04-01' },
];

const emptyMealPlan: Omit<MealPlan, 'id'> = {
  date: todayStr,
  mealType: 'Lunch',
  menu: [{ name: '', qty: '' }],
  expectedCount: 100,
  status: 'Planned',
  organizer: '',
  notes: '',
  sponsor: '',
};

const emptyDistribution: Omit<DistributionLog, 'id'> = {
  mealPlanId: '',
  date: todayStr,
  mealType: 'Lunch',
  servedCount: 0,
  expectedCount: 0,
  startTime: '12:00 PM',
  endTime: '',
  status: 'Pending',
  volunteer: '',
  feedback: '',
  leftover: '',
};

function stockLevel(item: IngredientStock): 'critical' | 'low' | 'good' {
  const ratio = item.currentStock / item.minThreshold;
  if (ratio <= 1) return 'critical';
  if (ratio <= 1.5) return 'low';
  return 'good';
}

function nextMealPlanId(items: MealPlan[]) {
  const max = items.reduce((curr, item) => {
    const m = /^MP(\d+)$/i.exec(item.id);
    if (!m) return curr;
    const n = Number(m[1]);
    return Number.isFinite(n) ? Math.max(curr, n) : curr;
  }, 0);
  return `MP${String(max + 1).padStart(3, '0')}`;
}

function getMealBaseRequirements(mealType: MealType) {
  if (mealType === 'Breakfast') {
    return [
      { ingredient: 'Rice', unit: 'kg', perPerson: 0.12 },
      { ingredient: 'Jaggery', unit: 'kg', perPerson: 0.02 },
      { ingredient: 'Cooking Oil', unit: 'L', perPerson: 0.006 },
    ];
  }
  if (mealType === 'Dinner') {
    return [
      { ingredient: 'Wheat Flour', unit: 'kg', perPerson: 0.15 },
      { ingredient: 'Toor Dal', unit: 'kg', perPerson: 0.03 },
      { ingredient: 'Mixed Vegetables', unit: 'kg', perPerson: 0.06 },
      { ingredient: 'Cooking Oil', unit: 'L', perPerson: 0.008 },
    ];
  }
  if (mealType === 'Prasadam') {
    return [
      { ingredient: 'Rice', unit: 'kg', perPerson: 0.06 },
      { ingredient: 'Jaggery', unit: 'kg', perPerson: 0.015 },
      { ingredient: 'Ghee', unit: 'kg', perPerson: 0.01 },
    ];
  }
  return [
    { ingredient: 'Rice', unit: 'kg', perPerson: 0.2 },
    { ingredient: 'Toor Dal', unit: 'kg', perPerson: 0.04 },
    { ingredient: 'Mixed Vegetables', unit: 'kg', perPerson: 0.08 },
    { ingredient: 'Cooking Oil', unit: 'L', perPerson: 0.01 },
  ];
}

function WeekCalendar({ plans, selectedDate, onDaySelect }: { plans: MealPlan[]; selectedDate: string; onDaySelect: (d: string) => void }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const base = new Date(today);
    base.setDate(base.getDate() + weekOffset * 7);
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const plansByDate = useMemo(() => {
    const map: Record<string, MealPlan[]> = {};
    for (const p of plans) {
      if (!map[p.date]) map[p.date] = [];
      map[p.date].push(p);
    }
    return map;
  }, [plans]);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="section-panel mb-4 shadow-sm pb-0 relative z-10 backdrop-blur-md bg-background/90">
      <div className="section-panel-header gap-4 border-b border-border/60 pb-3">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Weekly Planner</h2>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(p => p - 1)} className="w-8 h-8 rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="ghost" onClick={() => setWeekOffset(0)} className="text-xs font-semibold px-3 h-8 rounded-full hover:bg-primary/10 hover:text-primary">Today</Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(p => p + 1)} className="w-8 h-8 rounded-full"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 divide-x divide-border/60 p-2">
        {weekDays.map((day, i) => {
          const ds = day.toISOString().split('T')[0];
          const entries = plansByDate[ds] || [];
          const selected = ds === selectedDate;
          return (
            <button key={ds} onClick={() => onDaySelect(ds)} className={`text-left p-3 min-h-[100px] transition-all rounded-xl relative overflow-hidden group ${selected ? 'bg-orange-50/50 shadow-inner' : 'hover:bg-muted/40'}`}>
              {selected && <div className="absolute top-0 left-0 w-full h-1 bg-orange-400" />}
              <p className={`text-[11px] font-semibold tracking-wide uppercase ${selected ? 'text-orange-700' : 'text-muted-foreground group-hover:text-foreground'}`}>{dayNames[i]}</p>
              <p className={`text-xl font-bold mt-0.5 ${selected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{day.getDate()}</p>
              <div className="mt-2 space-y-1">
                {entries.slice(0, 2).map(item => {
                  const Icon = mealTypeColor[item.mealType].icon;
                  return (
                    <div key={item.id} className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border ${mealTypeColor[item.mealType].chip} bg-opacity-40`}>
                      <Icon className="w-3 h-3" /> <span className="font-semibold truncate">{item.mealType}</span>
                    </div>
                  );
                })}
                {entries.length > 2 && <p className="text-[10px] text-muted-foreground font-semibold px-1">+{entries.length - 2} more</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Tab = 'planner' | 'distribution' | 'inventory';

const AnnadhanamPage: React.FC = () => {
  const meals = useStore<MealPlan>(mockMealPlans);
  const dists = useStore<DistributionLog>(mockDistributions);
  const stock = useStore<IngredientStock>(mockIngredients);

  const [tab, setTab] = useState<Tab>('planner');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [search, setSearch] = useState('');

  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [editMealId, setEditMealId] = useState<string | null>(null);
  const [mealDeleteId, setMealDeleteId] = useState<string | null>(null);
  const [mealForm, setMealForm] = useState<Omit<MealPlan, 'id'>>(emptyMealPlan);

  const [distModalOpen, setDistModalOpen] = useState(false);
  const [editDistId, setEditDistId] = useState<string | null>(null);
  const [distDeleteId, setDistDeleteId] = useState<string | null>(null);
  const [distForm, setDistForm] = useState<Omit<DistributionLog, 'id'>>(emptyDistribution);

  const mealByDate = useMemo(() => meals.items.filter(item => item.date === selectedDate), [meals.items, selectedDate]);

  const dateScopedMeals = useMemo(() => {
    if (!dateFilterActive) return meals.items;
    return meals.items.filter(item => item.date === selectedDate);
  }, [meals.items, selectedDate, dateFilterActive]);

  const filteredMeals = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return dateScopedMeals;
    return dateScopedMeals.filter(item =>
      item.id.toLowerCase().includes(q) ||
      item.mealType.toLowerCase().includes(q) ||
      item.organizer.toLowerCase().includes(q) ||
      item.date.includes(q)
    );
  }, [dateScopedMeals, search]);

  const filteredDistributions = useMemo(() => {
    if (!dateFilterActive) return dists.items;
    return dists.items.filter(item => item.date === selectedDate);
  }, [dists.items, selectedDate, dateFilterActive]);

  const servedMonth = useMemo(
    () => dists.items.filter(item => item.status === 'Served').reduce((sum, item) => sum + item.servedCount, 0),
    [dists.items]
  );

  const lowStockCount = stock.items.filter(item => stockLevel(item) !== 'good').length;
  const inventoryCategoryCount = new Set(stock.items.map(item => item.category)).size;

  const suggestedNeeds = useMemo<SuggestedNeed[]>(() => {
    const expected = Number(mealForm.expectedCount) || 0;
    if (expected <= 0) return [];

    return getMealBaseRequirements(mealForm.mealType)
      .map(base => {
        const inv = stock.items.find(item => item.name.toLowerCase() === base.ingredient.toLowerCase());
        if (!inv) return null;
        return {
          ingredient: base.ingredient,
          qty: Number((expected * base.perPerson).toFixed(1)),
          unit: base.unit,
          available: inv.currentStock,
          minThreshold: inv.minThreshold,
        };
      })
      .filter((item): item is SuggestedNeed => Boolean(item));
  }, [mealForm.expectedCount, mealForm.mealType, stock.items]);

  const aiMealInsights = useMemo(() => {
    const warnings: string[] = [];

    if (mealForm.expectedCount >= 500) {
      warnings.push('Expected count is very high. Consider splitting into batches or adding an extra serving slot.');
    } else if (mealForm.expectedCount >= 350) {
      warnings.push('Expected count is high. Keep buffer stock and review serving slots.');
    }

    suggestedNeeds.forEach(item => {
      if (item.available < item.qty) {
        warnings.push(`${item.ingredient} may run short: need ${item.qty} ${item.unit}, available ${item.available} ${item.unit}.`);
      }
    });

    return warnings;
  }, [mealForm.expectedCount, suggestedNeeds]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setDateFilterActive(true);
  };

  const clearDateFilter = () => {
    setDateFilterActive(false);
  };

  const openAddMeal = () => { setMealForm(emptyMealPlan); setEditMealId(null); setMealModalOpen(true); };
  const openEditMeal = (item: MealPlan) => { setMealForm({ ...item }); setEditMealId(item.id); setMealModalOpen(true); };
  const saveMeal = () => {
    if (!mealForm.date || !mealForm.expectedCount) return;
    const normalizedMenu = mealForm.menu.map(item => ({ name: item.name.trim(), qty: item.qty.trim() })).filter(item => item.name || item.qty);
    const payload = { ...mealForm, organizer: mealForm.organizer || 'Temple Office', menu: normalizedMenu.length > 0 ? normalizedMenu : [{ name: 'Standard Meal', qty: 'As per count' }] };
    if (editMealId) meals.update(editMealId, payload);
    else meals.setItems(prev => [{ ...payload, id: nextMealPlanId(meals.items) }, ...prev]);
    setMealModalOpen(false);
  };
  const setMField = <K extends keyof Omit<MealPlan, 'id'>>(k: K, v: any) => setMealForm(p => ({ ...p, [k]: v }));

  const openAddDistribution = () => {
    const first = meals.items[0];
    setDistForm({ ...emptyDistribution, mealPlanId: first?.id || '', date: first?.date || todayStr, mealType: first?.mealType || 'Lunch', expectedCount: first?.expectedCount || 0 });
    setEditDistId(null);
    setDistModalOpen(true);
  };
  const openEditDistribution = (item: DistributionLog) => { setDistForm({ ...item }); setEditDistId(item.id); setDistModalOpen(true); };
  const saveDistribution = () => {
    if (!distForm.mealPlanId || !distForm.date) return;
    if (editDistId) dists.update(editDistId, distForm);
    else dists.add(distForm);
    setDistModalOpen(false);
  };
  const setDField = <K extends keyof Omit<DistributionLog, 'id'>>(k: K, v: any) => setDistForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner bg-gradient-to-r from-orange-50/80 via-background to-rose-50/80">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><UtensilsCrossed className="w-5 h-5 text-orange-600" /> Annadhanam Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Free meal planning, serving logs, volunteer tracking, and ingredients inventory.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {tab === 'planner' && <Button onClick={openAddMeal} className="shadow-md bg-orange-600 hover:bg-orange-700 text-white"><Plus className="h-4 w-4 mr-2" />Plan Meal</Button>}
          {tab === 'distribution' && <Button onClick={openAddDistribution} className="shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="h-4 w-4 mr-2" />Log Distribution</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Total Meal Plans</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{meals.items.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Served This Month</p>
          <p className="text-2xl font-bold mt-1 text-emerald-700">{servedMonth.toLocaleString('en-IN')}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-orange-800 flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5" /> Meals Today</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{mealByDate.length}</p>
        </div>
        <div className="stat-card border-red-100 bg-red-50/30">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-red-800 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Low Stock Items</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{lowStockCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 w-full md:w-auto relative z-20">
        {( [
          { key: 'planner' as Tab, label: 'Meal Plan', icon: Calendar, color: 'bg-orange-600 border-orange-700' },
          { key: 'distribution' as Tab, label: 'Distribution', icon: Users, color: 'bg-emerald-600 border-emerald-700' },
          { key: 'inventory' as Tab, label: 'Inventory', icon: Package, color: 'bg-red-600 border-red-700' },
        ]).map(sec => (
          <button
            key={sec.key}
            onClick={() => setTab(sec.key)}
            className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 border-2 shadow-sm
              ${tab === sec.key 
                ? `${sec.color} text-white shadow-lg scale-[1.03]` 
                : 'bg-background border-border text-muted-foreground hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground'}`}
          >
            <sec.icon className={`h-4 w-4 ${tab === sec.key ? 'text-white' : ''}`} />
            {sec.label}
          </button>
        ))}
      </div>

      {['planner', 'distribution'].includes(tab) && (
        <div className="flex items-center justify-between flex-wrap gap-3 animate-slide-up">
          <div className="flex items-center gap-2 text-xs bg-muted/30 p-1.5 rounded-lg border border-border/50">
            <span className="px-3 py-1 font-semibold text-foreground">
              {dateFilterActive ? `Date Filter: ${formatDateDDMMYYYY(selectedDate)}` : 'Showing All Dates'}
            </span>
            {dateFilterActive && <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground bg-background border border-border" onClick={clearDateFilter}>Clear Filter</Button>}
          </div>
        </div>
      )}

      <div className="animate-slide-up">
        {tab === 'planner' && (
          <div className="space-y-6">
            <WeekCalendar plans={meals.items} selectedDate={selectedDate} onDaySelect={handleDateSelect} />

            <section className="section-panel">
              <div className="section-panel-header gap-4 border-b border-border/60 pb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /> Active Meal Plans</h2>
                <div className="relative w-full sm:max-w-xs ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className="h-10 w-full pl-9 pr-3 rounded-lg border border-input bg-background/60 text-sm focus:ring-2 focus:ring-primary/20 hover:border-border transition-all outline-none shadow-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search plans or organizers..."
                  />
                </div>
              </div>
              <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Plan Info</th>
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Service Type</th>
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Menu Summary</th>
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Expected Crowd</th>
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Organizer / Sponsor</th>
                      <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background">
                    {filteredMeals.length === 0 ? <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No meal plans match the criteria.</td></tr> : filteredMeals.map(plan => {
                      const Icon = mealTypeColor[plan.mealType].icon;
                      return (
                        <tr key={plan.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-foreground">{plan.id}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium"><Calendar className="w-3 h-3 inline mr-1" />{formatDateDDMMYYYY(plan.date)}</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold tracking-wide uppercase ${mealTypeColor[plan.mealType].chip}`}>
                              <Icon className="w-3.5 h-3.5" />
                              {plan.mealType}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1 text-[11px]">
                              {plan.menu.slice(0, 2).map((m, i) => <span key={i} className="bg-muted/60 px-2 py-0.5 rounded text-foreground font-medium border border-border/50">{m.name} <span className="text-muted-foreground ml-1">({m.qty})</span></span>)}
                              {plan.menu.length > 2 && <span className="text-xs text-muted-foreground font-medium pl-1">+{plan.menu.length - 2} more</span>}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-amber-700 text-lg flex items-center gap-1.5 pt-5"><Users className="w-4 h-4" />{plan.expectedCount}</td>
                          <td className="p-4">
                            <p className="font-semibold text-sm">{plan.organizer || '-'}</p>
                            {plan.sponsor && <p className="text-[10px] uppercase font-bold text-emerald-600 mt-1">Sponsor: {plan.sponsor}</p>}
                          </td>
                          <td className="p-4"><StatusBadge status={plan.status} /></td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditMeal(plan)} title="Edit Plan"><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => setMealDeleteId(plan.id)} className="hover:text-destructive hover:bg-destructive/10" title="Delete Plan"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div></div>
            </section>
          </div>
        )}

        {tab === 'distribution' && (
          <section className="section-panel">
            <div className="section-panel-header gap-4 border-b border-border/60 pb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Distribution Logs Overview</h2>
            </div>
            <div className="table-container border-0 rounded-none shadow-none"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Log Reference</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Service Info</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Timings</th>
                    <th className="text-center p-4 font-medium text-muted-foreground whitespace-nowrap">Served vs Expected</th>
                    <th className="text-center p-4 font-medium text-muted-foreground whitespace-nowrap">Wastage Insights</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">In-Charge</th>
                    <th className="text-left p-4 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-background">
                  {filteredDistributions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-sm text-muted-foreground border-b border-border">No distribution logs recorded for {dateFilterActive ? formatDateDDMMYYYY(selectedDate) : 'all dates'}.</td>
                    </tr>
                  ) : filteredDistributions.map(log => {
                    const wastedCount = Math.max(log.expectedCount - log.servedCount, 0);
                    const wastePct = log.expectedCount > 0 ? (wastedCount / log.expectedCount) * 100 : 0;
                    const tone = wastePct >= 15 ? 'bg-red-50 text-red-700 border-red-200' : wastePct > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold text-foreground">{log.id}</td>
                        <td className="p-4">
                          <p className="font-semibold text-sm">{log.mealType}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5"><Calendar className="w-3 h-3 inline mr-1" />{formatDateDDMMYYYY(log.date)}</p>
                        </td>
                        <td className="p-4">
                          <div className="text-[11px] font-medium text-muted-foreground flex flex-col gap-1">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-600" /> Start: {log.startTime}</span>
                            {log.endTime && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-600" /> End: {log.endTime}</span>}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-end gap-1.5">
                            <span className="text-2xl font-bold text-emerald-700">{log.servedCount}</span>
                            <span className="text-xs text-muted-foreground font-medium pb-1">/ {log.expectedCount} planned</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold border shadow-sm ${tone}`}>
                            {wastedCount} portions left
                          </span>
                          {log.leftover && <p className="text-[10px] text-muted-foreground italic mt-1.5 truncate max-w-[150px]">"{log.leftover}"</p>}
                        </td>
                        <td className="p-4 text-sm font-semibold">{log.volunteer || 'Unassigned'}</td>
                        <td className="p-4"><StatusBadge status={log.status} /></td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDistribution(log)}><Pencil className="h-4 w-4 text-foreground" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={() => setDistDeleteId(log.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div></div>
          </section>
        )}

        {tab === 'inventory' && (
          <div className="space-y-6">
            {lowStockCount > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-center gap-3 shadow-sm animate-pulse-slow">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-900">Inventory Alert</h3>
                  <p className="text-sm text-red-700 font-medium mt-0.5"><span className="font-bold">{lowStockCount} items</span> have fallen below minimum thresholds and require immediate purchase.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 shrink-0 flex flex-col gap-3">
                <div className="section-panel p-5 bg-gradient-to-b from-sky-50/50 to-background flex-1">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Total Ingredients</p>
                  <p className="text-4xl font-display font-bold text-foreground mb-6">{stock.items.length}</p>

                  <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Categories Mapped</p>
                  <p className="text-2xl font-bold text-foreground mb-6">{inventoryCategoryCount}</p>

                  <div className="space-y-4 border-t border-border/80 pt-5 text-sm">
                    <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Healthy Stock</span> <span className="font-bold text-emerald-600">{stock.items.length - lowStockCount}</span></div>
                    <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Low / Critical</span> <span className="font-bold text-red-600">{lowStockCount}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {stock.items.map(item => {
                  const level = stockLevel(item);
                  const isCrit = level === 'critical';
                  const levelColor = isCrit ? 'text-red-700 bg-red-100 border-red-200 ring-2 ring-red-500/20' : level === 'low' ? 'text-amber-800 bg-amber-100 border-amber-300' : 'text-emerald-800 bg-emerald-50 border-emerald-200 border-dashed';
                  return (
                    <div key={item.id} className="rounded-xl border border-border/60 bg-background shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-start relative overflow-hidden group">
                      {isCrit && <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/5 -z-0 rounded-bl-full" />}

                      <div className="w-full flex items-start justify-between mb-4 z-10 relative">
                        <div>
                          <p className="font-bold text-lg leading-tight text-foreground">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">{item.category}</p>
                        </div>
                        <span className={`text-[9px] px-2.5 py-1 rounded-sm font-bold tracking-widest border ${levelColor}`}>{level.toUpperCase()}</span>
                      </div>

                      <div className="flex items-end gap-1.5 mt-auto mb-4 w-full z-10 relative">
                        <p className="text-3xl font-display font-bold text-foreground">{item.currentStock}</p>
                        <p className="text-sm font-semibold text-muted-foreground pb-1">{item.unit}</p>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-2 text-[11px] bg-muted/40 p-2.5 rounded-lg border border-border/50 z-10 relative font-medium">
                        <div className="flex flex-col"><span className="text-muted-foreground">Min Threshold</span><span className="text-foreground font-semibold">{item.minThreshold} {item.unit}</span></div>
                        <div className="flex flex-col"><span className="text-muted-foreground">Avg Daily Use</span><span className="text-foreground font-semibold">{item.dailyUsage} {item.unit}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal open={mealModalOpen} onClose={() => setMealModalOpen(false)} title={editMealId ? 'Edit Meal Plan Options' : 'Create New Meal Plan'}>
        <div className="space-y-5 px-1 max-h-[80vh] overflow-y-auto pb-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Service Date" value={mealForm.date} onChange={v => setMField('date', v)} type="date" required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Service Type</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-border" value={mealForm.mealType} onChange={e => setMField('mealType', e.target.value as MealType)}>
                <option value="Breakfast">Breakfast</option><option value="Lunch">Lunch</option><option value="Dinner">Dinner</option><option value="Prasadam">Prasadam / Snacks</option>
              </select>
            </div>
            <FormField label="Expected Crowd Count" value={String(mealForm.expectedCount)} onChange={v => setMField('expectedCount', Number(v) || 0)} type="number" required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Current Status</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-border" value={mealForm.status} onChange={e => setMField('status', e.target.value as MealStatus)}>
                <option value="Planned">Planned</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
            <FormField label="Organizer / Lead Person" value={mealForm.organizer} onChange={v => setMField('organizer', v)} placeholder="e.g. Temple Committee" />
            <FormField label="Sponsor Details (Optional)" value={mealForm.sponsor || ''} onChange={v => setMField('sponsor', v)} placeholder="e.g. The Rao Family" />
          </div>

          <div className="border border-border/80 rounded-xl bg-muted/10 p-4">
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-600" /> Food Menu items</label>
              <Button type="button" variant="outline" size="sm" className="h-8 bg-background shadow-sm" onClick={() => setMealForm(prev => ({ ...prev, menu: [...prev.menu, { name: '', qty: '' }] }))}><Plus className="h-3.5 w-3.5 mr-1" />Add Item</Button>
            </div>
            <div className="space-y-2">
              {mealForm.menu.map((menuItem, idx) => (
                <div key={`menu-${idx}`} className="flex gap-2 items-center bg-background p-2 rounded-lg border border-border shadow-sm">
                  <input className="h-9 flex-1 min-w-[150px] rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Dish name (e.g. Sambar)" value={menuItem.name} onChange={e => { const val = e.target.value; setMealForm(prev => ({ ...prev, menu: prev.menu.map((m, i) => i === idx ? { ...m, name: val } : m) })); }} />
                  <input className="h-9 w-24 sm:w-32 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Qty (e.g. 15L)" value={menuItem.qty} onChange={e => { const val = e.target.value; setMealForm(prev => ({ ...prev, menu: prev.menu.map((m, i) => i === idx ? { ...m, qty: val } : m) })); }} />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0" onClick={() => setMealForm(prev => ({ ...prev, menu: prev.menu.length === 1 ? prev.menu : prev.menu.filter((_, i) => i !== idx) }))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-4 space-y-3 shadow-sm">
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-indigo-800 flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> AI Inventory Insights</h4>
            {aiMealInsights.length > 0 ? (
              <div className="rounded-lg border border-red-200 bg-red-50/80 p-3 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                {aiMealInsights.map((warning, idx) => <p key={`warn-${idx}`} className="text-[11px] font-semibold text-red-800 flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" /> {warning}</p>)}
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Operations look good. Expected count fits within typical inventory levels.</p>
              </div>
            )}
          </div>

          <div className="col-span-2 space-y-1.5 pt-2">
            <label className="text-sm font-medium text-foreground">Operational Notes</label>
            <textarea className="w-full min-h-[80px] rounded-lg border border-input bg-background/60 p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Any special seating arrangements, VIP protocols..." value={mealForm.notes} onChange={e => setMField('notes', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" className="flex-1 py-5" onClick={() => setMealModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 py-5 shadow-md" onClick={saveMeal}>{editMealId ? 'Update Meal Plan' : 'Publish Meal Plan'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={distModalOpen} onClose={() => setDistModalOpen(false)} title={editDistId ? 'Update Distribution Log' : 'Create New Log'}>
        <div className="space-y-4 px-1 pb-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Select Source Meal Plan</label>
            <select className="w-full h-11 rounded-lg border border-input bg-background/60 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium text-foreground group shadow-sm transition-all hover:border-border" value={distForm.mealPlanId} onChange={e => {
              const selected = meals.items.find(item => item.id === e.target.value);
              setDistForm(prev => ({ ...prev, mealPlanId: e.target.value, mealType: selected?.mealType || prev.mealType, expectedCount: selected?.expectedCount || prev.expectedCount, date: selected?.date || prev.date }));
            }}>
              <option value="" disabled>Select a plan to log against...</option>
              {meals.items.map(item => <option key={item.id} value={item.id}>{item.id} - {item.mealType} ({formatDateDDMMYYYY(item.date)}) - {item.expectedCount} planned</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
            <FormField label="Actual Served Count" value={String(distForm.servedCount)} onChange={v => setDField('servedCount', Number(v) || 0)} type="number" required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Service Status</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-border" value={distForm.status} onChange={e => setDField('status', e.target.value as DistributionStatus)}>
                <option value="Pending">Pending</option><option value="Served">Fully Served</option><option value="Partial">Partial Served</option><option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <FormField label="Start Time" value={distForm.startTime} onChange={v => setDField('startTime', v)} placeholder="e.g. 12:00 PM" />
            <FormField label="End Time" value={distForm.endTime} onChange={v => setDField('endTime', v)} placeholder="e.g. 02:30 PM" />
            <FormField label="Lead Volunteer" value={distForm.volunteer} onChange={v => setDField('volunteer', v)} placeholder="e.g. Ravi & Team" />
            <FormField label="Leftover Record" value={distForm.leftover} onChange={v => setDField('leftover', v)} placeholder="e.g. 2kg Rice went to cow shelter" />
          </div>

          <div className="col-span-2 space-y-1.5 border-t border-border/60 pt-4 mt-2">
            <label className="text-sm font-medium text-foreground">Feedback / Occurrence log</label>
            <textarea className="w-full min-h-[90px] rounded-lg border border-input bg-background/60 p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-muted-foreground/60" placeholder="Did the food last? How was crowd management? Any incidents?" value={distForm.feedback} onChange={e => setDField('feedback', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-5 border-t border-border/60 mt-4">
            <Button variant="outline" className="flex-1 py-5" onClick={() => setDistModalOpen(false)}>Cancel Form</Button>
            <Button className="flex-1 py-5 shadow-md" onClick={saveDistribution}>{editDistId ? 'Save Changes' : 'Confirm Distribution Log'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!mealDeleteId} onClose={() => setMealDeleteId(null)} onConfirm={() => mealDeleteId && meals.remove(mealDeleteId)} title="Remove Meal Plan" message="Are you extremely sure you want to completely delete this meal plan? The attached inventory projections may shift." />
      <ConfirmDialog open={!!distDeleteId} onClose={() => setDistDeleteId(null)} onConfirm={() => distDeleteId && dists.remove(distDeleteId)} title="Remove Distribution Log" message="Are you absolutely sure you want to discard this physical distribution log permanently?" />
    </div>
  );
};

export default AnnadhanamPage;
