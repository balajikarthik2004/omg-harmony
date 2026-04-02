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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
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
  Breakfast: { chip: 'bg-amber-50 text-amber-700 border-amber-200', icon: Flame },
  Lunch: { chip: 'bg-orange-50 text-orange-700 border-orange-200', icon: Soup },
  Dinner: { chip: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Wheat },
  Prasadam: { chip: 'bg-rose-50 text-rose-700 border-rose-200', icon: Star },
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

function parseQtyText(value: string) {
  const m = value.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
  if (!m) return null;
  return { qty: Number(m[1]), unit: (m[2] || '').toLowerCase() };
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
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Weekly Planner</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(p => p - 1)} className="w-7 h-7 rounded-md hover:bg-muted/70 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setWeekOffset(0)} className="text-xs font-medium px-2 py-1 rounded-md bg-muted/70">Today</button>
          <button onClick={() => setWeekOffset(p => p + 1)} className="w-7 h-7 rounded-md hover:bg-muted/70 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7">
        {weekDays.map((day, i) => {
          const ds = day.toISOString().split('T')[0];
          const entries = plansByDate[ds] || [];
          const selected = ds === selectedDate;
          return (
            <button key={ds} onClick={() => onDaySelect(ds)} className={`text-left px-2 py-2 min-h-[88px] border-r last:border-r-0 border-border/60 ${selected ? 'bg-amber-50/60' : 'hover:bg-muted/30'}`}>
              <p className="text-[10px] text-muted-foreground">{dayNames[i]}</p>
              <p className="text-sm font-semibold">{day.getDate()}</p>
              <div className="mt-1 space-y-0.5">
                {entries.slice(0, 2).map(item => (
                  <p key={item.id} className="text-[10px] px-1 py-0.5 rounded bg-muted text-foreground truncate">{item.mealType}</p>
                ))}
                {entries.length > 2 && <p className="text-[10px] text-muted-foreground">+{entries.length - 2}</p>}
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

  const openAddMeal = () => {
    setMealForm(emptyMealPlan);
    setEditMealId(null);
    setMealModalOpen(true);
  };

  const openEditMeal = (item: MealPlan) => {
    setMealForm({ ...item });
    setEditMealId(item.id);
    setMealModalOpen(true);
  };

  const saveMeal = () => {
    if (!mealForm.date || !mealForm.expectedCount) return;
    const normalizedMenu = mealForm.menu
      .map(item => ({ name: item.name.trim(), qty: item.qty.trim() }))
      .filter(item => item.name || item.qty);

    const payload: Omit<MealPlan, 'id'> = {
      ...mealForm,
      organizer: mealForm.organizer || 'Temple Office',
      menu: normalizedMenu.length > 0 ? normalizedMenu : [{ name: 'Standard Meal', qty: 'As per count' }],
    };

    if (editMealId) {
      meals.update(editMealId, payload);
    } else {
      const newMeal: MealPlan = {
        ...payload,
        id: nextMealPlanId(meals.items),
      };
      meals.setItems(prev => [newMeal, ...prev]);
    }
    setMealModalOpen(false);
  };

  const openAddDistribution = () => {
    const first = meals.items[0];
    setDistForm({ ...emptyDistribution, mealPlanId: first?.id || '', date: first?.date || todayStr, mealType: first?.mealType || 'Lunch', expectedCount: first?.expectedCount || 0 });
    setEditDistId(null);
    setDistModalOpen(true);
  };

  const openEditDistribution = (item: DistributionLog) => {
    setDistForm({ ...item });
    setEditDistId(item.id);
    setDistModalOpen(true);
  };

  const saveDistribution = () => {
    if (!distForm.mealPlanId || !distForm.date) return;
    if (editDistId) dists.update(editDistId, distForm);
    else dists.add(distForm);
    setDistModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="rounded-xl border border-border bg-gradient-to-r from-orange-50/70 via-background to-amber-50/70 px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Annadhanam Management</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-10">Meal planning, distribution logs, and ingredient stock in one place.</p>
        </div>
        <div className="flex gap-2">
          {tab === 'planner' && <Button onClick={openAddMeal}><Plus className="h-4 w-4 mr-2" />Plan Meal</Button>}
          {tab === 'distribution' && <Button onClick={openAddDistribution}><Plus className="h-4 w-4 mr-2" />Log Distribution</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Meal Plans</p>
          <p className="text-2xl font-semibold mt-1">{meals.items.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Served (Month)</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-700">{servedMonth.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Today's Meals</p>
          <p className="text-2xl font-semibold mt-1">{mealByDate.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Low Stock Alerts</p>
          <p className="text-2xl font-semibold mt-1 text-red-600">{lowStockCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg w-fit">
        {([
          ['planner', 'Meal Planner'],
          ['distribution', 'Distribution'],
          ['inventory', 'Inventory'],
        ] as Array<[Tab, string]>).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === k ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-full border border-border bg-background text-muted-foreground">
          {dateFilterActive ? `Date Filter: ${formatDateDDMMYYYY(selectedDate)}` : 'Date Filter: All Days'}
        </span>
        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={clearDateFilter} disabled={!dateFilterActive}>
          Clear Filter
        </Button>
      </div>

      {tab === 'planner' && (
        <div className="space-y-4">
          <WeekCalendar plans={meals.items} selectedDate={selectedDate} onDaySelect={handleDateSelect} />

          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Meal Plans</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  className="h-8 w-44 pl-8 pr-3 rounded-md border border-border bg-background text-xs"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search plans"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Meal</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Expected</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Organizer</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeals.map(plan => {
                    const Icon = mealTypeColor[plan.mealType].icon;
                    return (
                      <tr key={plan.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-medium">{plan.id}</td>
                        <td className="p-3 text-muted-foreground">{formatDateDDMMYYYY(plan.date)}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${mealTypeColor[plan.mealType].chip}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {plan.mealType}
                          </span>
                        </td>
                        <td className="p-3">{plan.expectedCount}</td>
                        <td className="p-3 text-muted-foreground">{plan.organizer || '-'}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusChip[plan.status]}`}>{plan.status}</span></td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditMeal(plan)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setMealDeleteId(plan.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'distribution' && (
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <h2 className="text-sm font-semibold">Distribution Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Log ID</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Meal</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Served / Expected</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Wastage</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Volunteer</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistributions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                      No distribution logs for {dateFilterActive ? formatDateDDMMYYYY(selectedDate) : 'the selected criteria'}.
                    </td>
                  </tr>
                ) : filteredDistributions.map(log => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium">{log.id}</td>
                    <td className="p-3 text-muted-foreground">{formatDateDDMMYYYY(log.date)}</td>
                    <td className="p-3 text-muted-foreground">{log.mealType}</td>
                    <td className="p-3 font-medium">{log.servedCount} / {log.expectedCount}</td>
                    <td className="p-3">
                      {(() => {
                        const wastedCount = Math.max(log.expectedCount - log.servedCount, 0);
                        const wastePct = log.expectedCount > 0 ? (wastedCount / log.expectedCount) * 100 : 0;
                        const tone = wastePct >= 15 ? 'bg-red-50 text-red-700 border-red-200' : wastePct > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${tone}`}>
                            {wastedCount} plates
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-muted-foreground">{log.volunteer || '-'}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${distStatusChip[log.status]}`}>{log.status}</span></td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDistribution(log)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDistDeleteId(log.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="space-y-4">
          {lowStockCount > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700 font-medium">{lowStockCount} inventory items are low and need replenishment.</p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Ingredients</p>
              <p className="text-xl font-semibold mt-1">{stock.items.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Categories</p>
              <p className="text-xl font-semibold mt-1">{inventoryCategoryCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Critical / Low</p>
              <p className="text-xl font-semibold mt-1 text-amber-700">{lowStockCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Healthy Items</p>
              <p className="text-xl font-semibold mt-1 text-emerald-700">{stock.items.length - lowStockCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {stock.items.map(item => {
              const level = stockLevel(item);
              const levelColor = level === 'critical' ? 'text-red-600 bg-red-50 border-red-200' : level === 'low' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';
              return (
                <div key={item.id} className="rounded-xl border border-border bg-background shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${levelColor}`}>{level.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <p className="text-xl font-bold mt-2">{item.currentStock} <span className="text-sm font-medium text-muted-foreground">{item.unit}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Min: {item.minThreshold} · Daily use: {item.dailyUsage}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={mealModalOpen} onClose={() => setMealModalOpen(false)} title={editMealId ? 'Edit Meal Plan' : 'Plan Meal'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <input type="date" className="w-full h-10 rounded-md border border-input px-3 text-sm" value={mealForm.date} onChange={e => setMealForm(prev => ({ ...prev, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Meal Type</label>
              <div className="relative">
                <select className="w-full h-10 rounded-md border border-input pl-3 pr-8 text-sm appearance-none" value={mealForm.mealType} onChange={e => setMealForm(prev => ({ ...prev, mealType: e.target.value as MealType }))}>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Prasadam">Prasadam</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Expected Count</label>
              <input type="number" className="w-full h-10 rounded-md border border-input px-3 text-sm" value={String(mealForm.expectedCount)} onChange={e => setMealForm(prev => ({ ...prev, expectedCount: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={mealForm.status} onChange={e => setMealForm(prev => ({ ...prev, status: e.target.value as MealStatus }))}>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sponsor</label>
              <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={mealForm.sponsor || ''} onChange={e => setMealForm(prev => ({ ...prev, sponsor: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Food Menu</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setMealForm(prev => ({ ...prev, menu: [...prev.menu, { name: '', qty: '' }] }))}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {mealForm.menu.map((menuItem, idx) => (
                <div key={`menu-${idx}`} className="grid grid-cols-[1fr_140px_36px] gap-2">
                  <input
                    className="h-9 rounded-md border border-input px-3 text-sm"
                    placeholder="Item name (e.g. Lemon Rice)"
                    value={menuItem.name}
                    onChange={e => {
                      const value = e.target.value;
                      setMealForm(prev => ({
                        ...prev,
                        menu: prev.menu.map((item, i) => i === idx ? { ...item, name: value } : item),
                      }));
                    }}
                  />
                  <input
                    className="h-9 rounded-md border border-input px-3 text-sm"
                    placeholder="Qty"
                    value={menuItem.qty}
                    onChange={e => {
                      const value = e.target.value;
                      setMealForm(prev => ({
                        ...prev,
                        menu: prev.menu.map((item, i) => i === idx ? { ...item, qty: value } : item),
                      }));
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setMealForm(prev => ({
                      ...prev,
                      menu: prev.menu.length === 1 ? prev.menu : prev.menu.filter((_, i) => i !== idx),
                    }))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-gradient-to-r from-sky-50/60 via-background to-emerald-50/50 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">AI Meal Suggestions</p>
            </div>

            {aiMealInsights.length > 0 ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 space-y-1">
                {aiMealInsights.map((warning, idx) => (
                  <p key={`warn-${idx}`} className="text-[11px] text-red-700">{warning}</p>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="text-[11px] text-emerald-700">Current expected count appears manageable with available stock.</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <textarea className="w-full min-h-[76px] rounded-md border border-input px-3 py-2 text-sm" value={mealForm.notes} onChange={e => setMealForm(prev => ({ ...prev, notes: e.target.value }))} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setMealModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={saveMeal}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={distModalOpen} onClose={() => setDistModalOpen(false)} title={editDistId ? 'Edit Distribution Log' : 'Log Distribution'}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Meal Plan</label>
            <select
              className="w-full h-10 rounded-md border border-input px-3 text-sm"
              value={distForm.mealPlanId}
              onChange={e => {
                const selected = meals.items.find(item => item.id === e.target.value);
                setDistForm(prev => ({
                  ...prev,
                  mealPlanId: e.target.value,
                  mealType: selected?.mealType || prev.mealType,
                  expectedCount: selected?.expectedCount || prev.expectedCount,
                  date: selected?.date || prev.date,
                }));
              }}
            >
              {meals.items.map(item => <option key={item.id} value={item.id}>{item.id} · {item.mealType} · {formatDateDDMMYYYY(item.date)}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Served Count</label>
              <input type="number" className="w-full h-10 rounded-md border border-input px-3 text-sm" value={String(distForm.servedCount)} onChange={e => setDistForm(prev => ({ ...prev, servedCount: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={distForm.status} onChange={e => setDistForm(prev => ({ ...prev, status: e.target.value as DistributionStatus }))}>
                <option value="Pending">Pending</option>
                <option value="Served">Served</option>
                <option value="Partial">Partial</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Start</label>
              <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={distForm.startTime} onChange={e => setDistForm(prev => ({ ...prev, startTime: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">End</label>
              <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={distForm.endTime} onChange={e => setDistForm(prev => ({ ...prev, endTime: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Volunteer</label>
            <input className="w-full h-10 rounded-md border border-input px-3 text-sm" value={distForm.volunteer} onChange={e => setDistForm(prev => ({ ...prev, volunteer: e.target.value }))} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Feedback</label>
            <textarea className="w-full min-h-[68px] rounded-md border border-input px-3 py-2 text-sm" value={distForm.feedback} onChange={e => setDistForm(prev => ({ ...prev, feedback: e.target.value }))} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDistModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={saveDistribution}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!mealDeleteId}
        onClose={() => setMealDeleteId(null)}
        onConfirm={() => mealDeleteId && meals.remove(mealDeleteId)}
        title="Delete Meal Plan"
        message="Are you sure you want to delete this meal plan?"
      />

      <ConfirmDialog
        open={!!distDeleteId}
        onClose={() => setDistDeleteId(null)}
        onConfirm={() => distDeleteId && dists.remove(distDeleteId)}
        title="Delete Distribution Log"
        message="Are you sure you want to delete this distribution log?"
      />
    </div>
  );
};

export default AnnadhanamPage;
