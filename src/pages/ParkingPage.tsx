import React, { useState, useEffect } from 'react';
import { 
  Car, 
  ParkingCircle, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  QrCode, 
  History, 
  LayoutGrid, 
  CheckCircle2, 
  Search,
  Plus,
  ArrowRightCircle,
  ArrowLeftCircle,
  Settings2,
  Activity,
  Cpu,
  Monitor
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';

// Mock Data
const PARKING_STATISTICS = [
  { name: '06:00', general: 12, vip: 5, staff: 8 },
  { name: '09:00', general: 45, vip: 12, staff: 15 },
  { name: '12:00', general: 85, vip: 20, staff: 18 },
  { name: '15:00', general: 65, vip: 18, staff: 16 },
  { name: '18:00', general: 95, vip: 22, staff: 19 },
  { name: '21:00', general: 40, vip: 10, staff: 12 },
];

const REVENUE_DATA = [
  { name: 'Mon', amount: 1200 },
  { name: 'Tue', amount: 900 },
  { name: 'Wed', amount: 1100 },
  { name: 'Thu', amount: 1500 },
  { name: 'Fri', amount: 2200 },
  { name: 'Sat', amount: 3500 },
  { name: 'Sun', amount: 4200 },
];

// Types
interface ParkingZone {
  id: string;
  name: string;
  capacity: number;
  color: string;
  type: 'VIP' | 'General' | 'Staff';
}

interface ParkingSlot {
  id: string;
  zone: string;
  status: 'available' | 'occupied';
  vehicleNo: string;
  entryTime: string | null;
}

const INITIAL_ZONES: ParkingZone[] = [
  { id: '1', name: 'VIP Zone', capacity: 10, color: '#293088', type: 'VIP' },
  { id: '2', name: 'General', capacity: 30, color: '#353EB0', type: 'General' },
  { id: '3', name: 'Staff', capacity: 8, color: '#E22E26', type: 'Staff' },
];

const ParkingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPeakMode, setIsPeakMode] = useState(false);
  const [zones, setZones] = useState<ParkingZone[]>(INITIAL_ZONES);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => {
    const generatedSlots: ParkingSlot[] = [];
    zones.forEach(zone => {
      const prefixMap = { 'VIP': 'VIP', 'Staff': 'STF', 'General': 'P' };
      const prefix = prefixMap[zone.type];
      for (let i = 1; i <= zone.capacity; i++) {
        const isOccupied = Math.random() > 0.4;
        generatedSlots.push({
          id: `${prefix}-${i}`,
          zone: zone.name,
          status: isOccupied ? 'occupied' : 'available',
          vehicleNo: isOccupied ? `TN ${Math.floor(Math.random() * 99)} AB ${Math.floor(Math.random() * 9999)}` : '',
          entryTime: isOccupied ? new Date(Date.now() - Math.random() * 10000000).toISOString() : null,
        });
      }
    });
    setSlots(generatedSlots);
  }, []);

  // Stats
  const totalSlots = slots.length;
  const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
  const availableSlots = totalSlots - occupiedSlots;
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  // New Zone State
  const [newArea, setNewArea] = useState<{
    name: string;
    capacity: string;
    type: 'VIP' | 'General' | 'Staff';
    color: string;
  }>({
    name: '',
    capacity: '10',
    type: 'General',
    color: '#8B5CF6'
  });

  const handleAddZone = () => {
    if (!newArea.name) {
      toast.error("Please enter an area name");
      return;
    }
    
    const cap = parseInt(newArea.capacity);
    const newId = (zones.length + 1).toString();
    const zoneToAdd: ParkingZone = {
      id: newId,
      name: newArea.name,
      capacity: cap,
      color: newArea.color,
      type: newArea.type
    };

    setZones([...zones, zoneToAdd]);
    
    // Generate slots for the new zone
    const newSlots: ParkingSlot[] = [];
    const prefixMap = { 'VIP': 'VIP', 'Staff': 'STF', 'General': 'P' };
    const prefix = prefixMap[newArea.type];
    const zoneCount = zones.filter(z => z.type === newArea.type).length + 1;
    
    for (let i = 1; i <= cap; i++) {
      newSlots.push({
        id: `${prefix}-${zoneCount}-${i}`,
        zone: newArea.name,
        status: 'available',
        vehicleNo: '',
        entryTime: null
      });
    }

    setSlots([...slots, ...newSlots]);
    setAreaDialogOpen(false);
    setNewArea({ name: '', capacity: '10', type: 'General', color: '#8B5CF6' });
    toast.success(`Parking Area "${newArea.name}" added with ${cap} slots!`, {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    });
  };

  // New vehicle state
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    zone: 'General',
    duration: '2'
  });

  const handleEntry = () => {
    if (!newVehicle.plate) {
      toast.error("Please enter a vehicle number", {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />
      });
      return;
    }
    
    setScanning(true);
    setTimeout(() => {
      const freeSlot = slots.find(s => s.status === 'available' && s.zone === newVehicle.zone);
      if (!freeSlot) {
        toast.error(`No available slots in ${newVehicle.zone} zone`, {
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />
        });
        setScanning(false);
        return;
      }

      const updatedSlots: ParkingSlot[] = slots.map(s => 
        s.id === freeSlot.id 
          ? { ...s, status: 'occupied', vehicleNo: newVehicle.plate, entryTime: new Date().toISOString() } 
          : s
      );
      setSlots(updatedSlots);
      setScanning(false);
      setEntryDialogOpen(false);
      setNewVehicle({ plate: '', zone: 'General', duration: '2' });
      toast.success(`Vehicle ${newVehicle.plate} assigned to slot ${freeSlot.id}`, {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      });
    }, 1500);
  };

  const handleExit = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    setScanning(true);
    setTimeout(() => {
      const updatedSlots: ParkingSlot[] = slots.map(s => 
        s.id === slotId 
          ? { ...s, status: 'available', vehicleNo: '', entryTime: null } 
          : s
      );
      setSlots(updatedSlots);
      setScanning(false);
      toast.success(`Vehicle ${slot.vehicleNo} exited from ${slot.id}. Fee: ₹50`, {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Parking Management</h1>
          <p className="text-slate-500 mt-1">Real-time occupancy monitoring and automated vehicle control.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${isPeakMode ? 'bg-orange-50 border-orange-200 shadow-orange-100' : 'bg-white border-slate-100'}`}>
            <div className="flex flex-col items-end">
              <Label htmlFor="peak-mode" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peak Festival Mode</Label>
              <span className={`text-[11px] font-medium ${isPeakMode ? 'text-orange-600' : 'text-slate-500'}`}>
                {isPeakMode ? 'High Capacity Active' : 'Normal Operations'}
              </span>
            </div>
            <Switch 
              id="peak-mode" 
              checked={isPeakMode} 
              onCheckedChange={(val) => {
                setIsPeakMode(val);
                toast(val ? "Peak Mode Activated: Temporary zones enabled." : "Peak Mode Deactivated.", {
                  icon: val ? <AlertTriangle className="w-5 h-5 text-orange-500" /> : <CheckCircle2 className="w-5 h-5 text-slate-500" />
                });
              }} 
            />
          </div>
          
          <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl border-slate-200">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Add Area
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Plus className="w-6 h-6 text-indigo-600" />
                  Add Parking Area
                </DialogTitle>
                <DialogDescription>
                  Create a new logical parking zone and auto-generate slots.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Area Name</Label>
                  <Input 
                    placeholder="e.g. South Gate, Cellar 2" 
                    className="rounded-xl"
                    value={newArea.name}
                    onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Capacity</Label>
                    <Input 
                      type="number"
                      className="rounded-xl"
                      value={newArea.capacity}
                      onChange={(e) => setNewArea({...newArea, capacity: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Access Category</Label>
                    <Select value={newArea.type} onValueChange={(val: any) => setNewArea({...newArea, type: val})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                   <Label>Area Theme Color</Label>
                   <div className="flex gap-2">
                     {['#293088', '#353EB0', '#E22E26', '#8B5CF6', '#10B981', '#F59E0B'].map(c => (
                       <button 
                        key={c}
                        onClick={() => setNewArea({...newArea, color: c})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${newArea.color === c ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                       />
                     ))}
                   </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddZone} 
                  className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Area & Slots
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg bg-gradient-to-r from-[#293088] to-[#353EB0] hover:shadow-indigo-200/50 transition-all border-none py-6 h-auto px-6">
                <Plus className="w-5 h-5 mr-2" />
                Capture Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Monitor className="w-6 h-6 text-indigo-600" />
                  Vehicle Entry Capture
                </DialogTitle>
                <DialogDescription>
                  Automated slot assignment and token generation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Vehicle Number Plate</Label>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. TN 01 AB 1234" 
                      className="rounded-xl uppercase font-mono text-lg py-6 border-slate-200 focus:border-indigo-400"
                      value={newVehicle.plate}
                      onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})}
                    />
                    <Cpu className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 opacity-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Parking Zone</Label>
                    <Select value={newVehicle.zone} onValueChange={(val) => setNewVehicle({...newVehicle, zone: val})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map(z => (
                          <SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (Est. Hrs)</Label>
                    <Select value={newVehicle.duration} onValueChange={(val) => setNewVehicle({...newVehicle, duration: val})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Hours</SelectItem>
                        <SelectItem value="4">4 Hours</SelectItem>
                        <SelectItem value="8">8 Hours</SelectItem>
                        <SelectItem value="24">Max (24hrs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {scanning && (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-indigo-200 animate-pulse">
                    <QrCode className="w-16 h-16 text-indigo-600 mb-2" />
                    <p className="text-sm font-medium text-indigo-700">AI Slot Optimizer Running...</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleEntry} 
                  disabled={scanning}
                  className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-lg shadow-xl shadow-indigo-100"
                >
                  {scanning ? 'Processing...' : 'Confirm & Assign Slot'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] rounded-2xl p-1 bg-white/50 backdrop-blur-sm border border-slate-100 shadow-sm mb-6">
          <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="slots" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            Slot Matrix
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            Live Traffic
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group">
              <div className="h-1.5 w-full bg-[#293088]" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-[#293088]/60">Total Occupancy</CardDescription>
                <div className="flex items-center justify-between mt-1">
                  <CardTitle className="text-2xl font-bold">{occupancyRate}%</CardTitle>
                  <div className="p-2 rounded-lg bg-indigo-50 text-[#293088]">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={occupancyRate} className="h-1.5 bg-indigo-50" />
                <p className="text-[11px] text-slate-500 mt-3 font-medium">
                  <span className="text-emerald-600 font-bold">2.4% lower</span> than last Sunday
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
              <div className="h-1.5 w-full bg-[#E22E26]" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-red-600/60">Free Slots</CardDescription>
                <div className="flex items-center justify-between mt-1">
                  <CardTitle className="text-2xl font-bold">{availableSlots}</CardTitle>
                  <div className="p-2 rounded-lg bg-red-50 text-red-600">
                    <ParkingCircle className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={`h-3 w-3 rounded-sm ${i < 4 ? 'bg-red-500 animate-pulse' : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 font-medium">Critical in General Zone (Slot 42-48)</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
              <div className="h-1.5 w-full bg-emerald-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-emerald-600/60">Vehicles In Today</CardDescription>
                <div className="flex items-center justify-between mt-1">
                  <CardTitle className="text-2xl font-bold">342</CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-6">
                  {[4, 7, 5, 8, 10, 6, 9].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-100 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 font-medium">Avg duration: 3.2 hours</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
              <div className="h-1.5 w-full bg-amber-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-amber-600/60">AI Insights</CardDescription>
                <div className="flex items-center justify-between mt-1">
                  <CardTitle className="text-2xl font-bold">Predictive</CardTitle>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="bg-amber-50 border-amber-100 text-amber-700 text-[10px] rounded-lg">
                  Overflow Predicted: 17:30
                </Badge>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Recommending Zone D activation.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Hourly Demand Projection</CardTitle>
                  <CardDescription>AI-enhanced traffic analysis for the last 24 hours</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700 border-none hover:bg-emerald-100 cursor-default">Real-time</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PARKING_STATISTICS}>
                      <defs>
                        <linearGradient id="colorGeneral" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#293088" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#293088" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="general" stroke="#293088" strokeWidth={3} fillOpacity={1} fill="url(#colorGeneral)" />
                      <Area type="monotone" dataKey="vip" stroke="#E22E26" strokeWidth={2} fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
              <CardHeader>
                <CardTitle>Zone Distribution</CardTitle>
                <CardDescription>Current capacity split</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={zones.map(z => ({
                          name: z.name,
                          value: slots.filter(s => s.zone === z.name && s.status === 'occupied').length || 0,
                          color: z.color
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {zones.map((zone, index) => (
                          <Cell key={`cell-${index}`} fill={zone.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  {zones.map((zone) => {
                    const zoneOccupancy = slots.filter(s => s.zone === zone.name && s.status === 'occupied').length;
                    const zoneTotal = slots.filter(s => s.zone === zone.name).length;
                    const percentage = zoneTotal > 0 ? Math.round((zoneOccupancy / zoneTotal) * 100) : 0;
                    
                    return (
                      <div key={zone.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                          <span className="text-slate-600">{zone.name}</span>
                        </div>
                        <span className="font-bold">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="slots" className="space-y-6">
          <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Interactive Slot Matrix</CardTitle>
                <CardDescription>Visual map of all parking zones</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" /> Available
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-slate-200" /> Occupied
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-amber-400" /> Reserved
                  </div>
                </div>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <Input 
                    placeholder="Find Vehicle No." 
                    className="pl-9 rounded-xl border-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 mt-4">
                {slots.filter(s => s.id.includes(searchQuery) || s.vehicleNo.includes(searchQuery.toUpperCase())).map((slot) => (
                  <Dialog key={slot.id}>
                    <DialogTrigger asChild>
                      <button 
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all duration-200 hover:scale-105 shadow-sm border-b-4 ${
                          slot.status === 'available' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-white text-slate-500 border-slate-100 shadow-inner'
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <span className="opacity-60">{slot.id}</span>
                        {slot.status === 'occupied' ? <Car className="w-5 h-5 text-slate-400" /> : <div className="p-1 rounded-full bg-white shadow-sm"><ParkingCircle className="w-5 h-5 text-emerald-500" /></div>}
                        <span className="text-[8px] uppercase tracking-tighter opacity-80">{slot.zone}</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl flex items-center justify-between">
                          Slot Details - {slot.id}
                          <Badge className={slot.status === 'available' ? 'bg-emerald-500' : 'bg-[#E22E26]'}>
                            {slot.status.toUpperCase()}
                          </Badge>
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="py-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-2xl">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Zone</Label>
                            <p className="text-lg font-bold text-[#293088]">{slot.zone}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Rate</Label>
                            <p className="text-lg font-bold text-[#293088]">₹{slot.zone === 'VIP' ? '100' : '50'}/hr</p>
                          </div>
                        </div>
                        
                        {slot.status === 'occupied' && (
                          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Car className="w-8 h-8 text-indigo-600" />
                              </div>
                              <div>
                                <Label className="text-[10px] uppercase font-bold text-indigo-400">License Plate</Label>
                                <p className="text-2xl font-mono font-bold tracking-wider">{slot.vehicleNo}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                              <div>
                                <Label className="text-[10px] uppercase font-bold text-indigo-400">Entry Time</Label>
                                <p className="text-sm font-medium">{new Date(slot.entryTime!).toLocaleTimeString()}</p>
                              </div>
                              <div className="text-right">
                                <Label className="text-[10px] uppercase font-bold text-indigo-400">Duration</Label>
                                <p className="text-sm font-medium">2h 45m</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <DialogFooter>
                        {slot.status === 'occupied' ? (
                          <Button 
                            className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleExit(slot.id)}
                            disabled={scanning}
                          >
                            {scanning ? 'Scanning...' : 'Proceed to Checkout'}
                          </Button>
                        ) : (
                          <Button 
                            className="w-full h-12 rounded-xl bg-[#293088]"
                            onClick={() => {
                              setNewVehicle({...newVehicle, zone: slot.zone});
                              setEntryDialogOpen(true);
                            }}
                          >
                            Add Vehicle
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Vehicle Traffic</CardTitle>
                  <CardDescription>Current vehicles in the facility</CardDescription>
                </div>
                <Button variant="outline" className="rounded-xl">
                  <Download className="w-4 h-4 mr-2" /> Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-none">
                    <TableHead className="font-bold py-4 pl-6">Vehicle No</TableHead>
                    <TableHead className="font-bold">Slot</TableHead>
                    <TableHead className="font-bold">Zone</TableHead>
                    <TableHead className="font-bold">Entry Time</TableHead>
                    <TableHead className="font-bold">Duration</TableHead>
                    <TableHead className="font-bold text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.filter(s => s.status === 'occupied').map((slot) => (
                    <TableRow key={slot.id} className="hover:bg-slate-50/50 border-slate-100">
                      <TableCell className="font-mono font-bold pl-6">{slot.vehicleNo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg">{slot.id}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${slot.zone === 'VIP' ? 'bg-indigo-600' : slot.zone === 'Staff' ? 'bg-red-600' : 'bg-slate-600'} rounded-lg`}>
                          {slot.zone}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 font-medium">{new Date(slot.entryTime!).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <History className="w-3 h-3 text-slate-400" />
                          <span className="text-sm font-medium">3h 24m</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg"
                          onClick={() => handleExit(slot.id)}
                        >
                          Checkout
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
              <CardHeader className="bg-indigo-600 text-white relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                   <TrendingUp className="w-24 h-24" />
                 </div>
                 <CardTitle>Revenue Analytics</CardTitle>
                 <CardDescription className="text-indigo-100">Weekly collection trends from paid parking zones</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REVENUE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Bar dataKey="amount" fill="#293088" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Weekly Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">₹14,600</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white border-none py-1.5 px-3">
                    +18.4% WoW
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
              <CardHeader>
                 <CardTitle>Peak Usage Insights</CardTitle>
                 <CardDescription>AI-generated report on bottleneck areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl text-red-600 shadow-sm">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-red-900">General Zone Saturation</p>
                        <p className="text-sm text-red-700/80">Predicted occupancy to reach 100% within the next 45 minutes based on current entry rate.</p>
                        <Button variant="outline" className="mt-3 border-red-200 text-red-700 bg-white hover:bg-red-50 rounded-xl" size="sm">
                          Configure Overflow
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900">Optimization Result</p>
                        <p className="text-sm text-emerald-700/80">Staff zone re-allocation saved ~22 minutes of queue time during morning rush (08:00 - 10:00).</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                       <span className="text-sm font-medium text-slate-500">Resource Utilization</span>
                       <span className="text-sm font-bold text-slate-900">76%</span>
                    </div>
                    <Progress value={76} className="h-2 bg-slate-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Simple helper icon
const Download = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export default ParkingPage;
