import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  Users, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Award, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Trophy, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  Mail, 
  Phone,
  BarChart3,
  TrendingUp,
  History,
  QrCode,
  UserCheck,
  AlertTriangle,
  X
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
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'sonner';
import { useVolunteerStore, Volunteer, VolunteerCampaign, CampaignRole } from '@/hooks/useVolunteerStore';
import VolunteerForm from '@/components/VolunteerForm';

const VolunteerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const { 
    items: volunteers, 
    add: addVolunteer, 
    update: updateVolunteer, 
    remove: removeVolunteer,
    campaigns,
    updateCampaign,
    addCampaign
  } = useVolunteerStore();
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isAddVolunteerOpen, setIsAddVolunteerOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<VolunteerCampaign | null>(null);
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState<string>('');

  // Stats
  const totalVolunteers = volunteers.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const avgReliability = Math.round(volunteers.reduce((acc, v) => acc + v.reliabilityScore, 0) / (totalVolunteers || 1));
  const participationRate = Math.round((volunteers.filter(v => v.participationCount > 10).length / (totalVolunteers || 1)) * 100);

  // New Campaign state
  const [newCampaign, setNewCampaign] = useState<Partial<VolunteerCampaign>>({
    title: '',
    type: 'Festival Support',
    description: '',
    startDate: '',
    endDate: '',
  });

  // Filtered Volunteers
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkill = skillFilter === 'all' || v.skills.includes(skillFilter);
      return matchesSearch && matchesSkill;
    });
  }, [volunteers, searchQuery, skillFilter]);

  const handleCreateCampaign = () => {
    const { title, type, description } = newCampaign;
    if (!title || !type) return;

    addCampaign({
        title,
        description: description || '',
        startDate: '2026-04-10',
        endDate: '2026-04-12',
        type: type as any,
        status: 'Active',
        roles: [
            { name: 'General Support', required: 10, assigned: 0, skills_needed: [] }
        ],
        assignedVolunteers: []
    });

    setIsCampaignDialogOpen(false);
    toast.success("New mission initiated successfully!");
  };

  const handleCheckIn = (volunteerId: string) => {
    const v = volunteers.find(vol => vol.id === volunteerId);
    if (!v) return;
    
    updateVolunteer(volunteerId, { 
        reliabilityScore: Math.min(100, v.reliabilityScore + 2), 
        participationCount: v.participationCount + 1 
    });
    
    toast.success("Volunteer checked-in successfully!", {
        icon: <UserCheck className="w-5 h-5 text-emerald-500" />
    });
  };

  const handleAssign = (volunteerId: string) => {
    if (!selectedCampaign || !selectedRoleForAssign) return;

    const campaignId = selectedCampaign.id;
    const role = selectedCampaign.roles.find(r => r.name === selectedRoleForAssign);
    const volunteer = volunteers.find(v => v.id === volunteerId);
    
    if (!role || !volunteer) return;

    if (role.assigned >= role.required) {
        toast.error(`Slot full for ${selectedRoleForAssign}`);
        return;
    }

    if (selectedCampaign.assignedVolunteers.includes(volunteerId)) {
        toast.error(`${volunteer.name} is already assigned to this mission`);
        return;
    }

    const updatedRoles = selectedCampaign.roles.map(r => 
        r.name === selectedRoleForAssign ? { ...r, assigned: r.assigned + 1 } : r
    );

    const updatedAssigned = [...selectedCampaign.assignedVolunteers, volunteerId];

    updateCampaign(campaignId, {
        roles: updatedRoles,
        assignedVolunteers: updatedAssigned
    });

    updateVolunteer(volunteerId, { status: 'Assigned' });

    // Update local selected campaign to reflect change in dialog
    setSelectedCampaign({
        ...selectedCampaign,
        roles: updatedRoles,
        assignedVolunteers: updatedAssigned
    });

    toast.success(`${volunteer.name} assigned to ${selectedRoleForAssign}`, {
        icon: <UserCheck className="w-5 h-5 text-emerald-500" />
    });
  };

  const handleUnassign = (volunteerId: string) => {
    if (!selectedCampaign) return;

    const campaignId = selectedCampaign.id;
    const volunteer = volunteers.find(v => v.id === volunteerId);
    
    // Find which role they were in
    const roleToDecremet = selectedCampaign.roles.find(r => 
        // This is a simplification, in a real DB we'd have a mapping table
        // For now, we'll try to find a role that has assignments > 0
        r.assigned > 0
    );

    if (!roleToDecremet) return;

    const updatedRoles = selectedCampaign.roles.map(r => 
        r.name === roleToDecremet.name ? { ...r, assigned: Math.max(0, r.assigned - 1) } : r
    );

    const updatedAssigned = selectedCampaign.assignedVolunteers.filter(id => id !== volunteerId);

    updateCampaign(campaignId, {
        roles: updatedRoles,
        assignedVolunteers: updatedAssigned
    });

    updateVolunteer(volunteerId, { status: 'Active' });

    setSelectedCampaign({
        ...selectedCampaign,
        roles: updatedRoles,
        assignedVolunteers: updatedAssigned
    });

    toast.info(`${volunteer?.name} removed from mission`);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Volunteer Campaign System</h1>
          <p className="text-slate-500 mt-1">Mobilize, track and empower temple volunteers for seamless operations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg bg-gradient-to-r from-[#293088] to-[#353EB0] hover:shadow-indigo-200/50 transition-all border-none py-6 h-auto px-6">
                <Plus className="w-5 h-5 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  Initiate Campaign
                </DialogTitle>
                <DialogDescription>
                  Define a new volunteer mission for temple activities.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Campaign Title</Label>
                  <Input 
                    placeholder="e.g. Navratri 2026 Support" 
                    className="rounded-xl border-slate-200"
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mission Type</Label>
                    <Select value={newCampaign.type} onValueChange={(val) => setNewCampaign({...newCampaign, type: val as any})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Festival Support">Festival Support</SelectItem>
                        <SelectItem value="Annadhanam">Annadhanam</SelectItem>
                        <SelectItem value="Crowd Control">Crowd Control</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                        <SelectItem value="Technical">Technical Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" className="rounded-xl" value={newCampaign.startDate} onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Campaign Objectives & Details</Label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    placeholder="Describe the mission goals..."
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                    onClick={handleCreateCampaign}
                    className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-lg shadow-xl shadow-indigo-100"
                >
                  Confirm Mission Launch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] rounded-2xl p-1 bg-white/50 backdrop-blur-sm border border-slate-100 shadow-sm mb-6">
          <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            Insights
          </TabsTrigger>
          <TabsTrigger value="directory" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            Volunteer Base
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            Missions
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group">
              <div className="h-1.5 w-full bg-[#293088]" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-[#293088]/60">Total Base</CardDescription>
                <div className="flex items-center justify-between mt-1">
                  <CardTitle className="text-2xl font-bold">{totalVolunteers}</CardTitle>
                  <div className="p-2 rounded-lg bg-indigo-50 text-[#293088]">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-slate-500 font-medium">
                  <span className="text-emerald-600 font-bold">+3 new</span> registered this month
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
              <div className="h-1.5 w-full bg-[#E22E26]" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-red-600/60">Active Missions</CardDescription>
                <div className="flex items-center justify-between mt-1">
                  <CardTitle className="text-2xl font-bold">{activeCampaigns}</CardTitle>
                  <div className="p-2 rounded-lg bg-red-50 text-red-600">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-slate-500 font-medium">Participated by 82 volunteers</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
              <div className="h-1.5 w-full bg-emerald-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-emerald-600/60">Reliability Index</CardDescription>
                <div className="flex items-center justify-between mt-1">
                  <CardTitle className="text-2xl font-bold">{avgReliability}%</CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={avgReliability} className="h-1.5 bg-emerald-50" />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
              <div className="h-1.5 w-full bg-amber-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-amber-600/60">Top Performers</CardDescription>
                <div className="flex items-center justify-between mt-1">
                  <CardTitle className="text-2xl font-bold">{participationRate}%</CardTitle>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-slate-500 font-medium">Have &gt;10 participation history</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Reliability Distribution</CardTitle>
                  <CardDescription>Volunteer accountability tracking across base</CardDescription>
                </div>
                <Badge variant="outline" className="bg-indigo-50 border-indigo-100 text-[#293088] rounded-xl px-3">
                    Healthy Retention
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volunteers.map(v => ({ name: v.name.split(' ')[0], score: v.reliabilityScore }))}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
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
                      <Area type="monotone" dataKey="score" stroke="#293088" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
              <CardHeader>
                <CardTitle>Top Contributions</CardTitle>
                <CardDescription>Most active volunteers this season</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 mt-2">
                  {volunteers.sort((a,b) => b.participationCount - a.participationCount).slice(0, 4).map((v, i) => (
                    <div key={v.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-300' : i === 2 ? 'bg-orange-300' : 'bg-indigo-400'
                        }`}>
                          {v.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{v.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{v.skills[0] || 'Volunteer'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600">{v.participationCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Missions</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-6 text-indigo-600 hover:bg-indigo-50 rounded-xl">View Leaderboard</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="directory" className="space-y-6">
          <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
             <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Volunteer Registry</CardTitle>
                        <CardDescription>Comprehensive database of all registered service members</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Search by name, ID..." 
                                className="pl-9 rounded-xl border-slate-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => setIsAddVolunteerOpen(true)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Volunteer
                        </Button>
                        <Select value={skillFilter} onValueChange={setSkillFilter}>
                            <SelectTrigger className="w-[160px] rounded-xl border-slate-200">
                                <Filter className="w-3.5 h-3.5 mr-2 opacity-60" />
                                <SelectValue placeholder="All Skills" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Skills</SelectItem>
                                <SelectItem value="Crowd Control">Crowd Control</SelectItem>
                                <SelectItem value="Annadhanam">Annadhanam</SelectItem>
                                <SelectItem value="Technical">Technical</SelectItem>
                                <SelectItem value="First Aid">First Aid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
             </CardHeader>
             <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80 border-none">
                            <TableHead className="font-bold py-4 pl-6">Member info</TableHead>
                            <TableHead className="font-bold">Skills / Experts</TableHead>
                            <TableHead className="font-bold">Availability</TableHead>
                            <TableHead className="font-bold">Reliability</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold text-right pr-6">Engagement</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVolunteers.map((v) => (
                            <TableRow key={v.id} className="hover:bg-slate-50/30 transition-colors border-slate-100 group">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shadow-inner">
                                            {v.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">{v.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">#{v.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {v.skills.map(s => (
                                            <Badge key={s} variant="outline" className="text-[9px] px-1.5 py-0 rounded-md border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        {v.availability}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 w-24">
                                        <div className="flex items-center justify-between text-[10px] font-bold">
                                            <span className={v.reliabilityScore > 90 ? 'text-emerald-600' : 'text-amber-600'}>
                                                {v.reliabilityScore}%
                                            </span>
                                        </div>
                                        <Progress value={v.reliabilityScore} className={`h-1 ${v.reliabilityScore > 90 ? 'bg-emerald-50' : 'bg-amber-50'}`} />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`rounded-xl text-[10px] font-bold px-2.5 ${
                                        v.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {v.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button variant="ghost" size="sm" className="rounded-lg text-indigo-600 hover:bg-indigo-50 font-bold text-xs">
                                        Assign Mission
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(campaign => (
                    <Card key={campaign.id} className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`h-1.5 w-full ${
                            campaign.type === 'Festival Support' ? 'bg-indigo-600' : 
                            campaign.type === 'Annadhanam' ? 'bg-emerald-600' : 
                            campaign.type === 'Crowd Control' ? 'bg-red-600' : 'bg-amber-600'
                        }`} />
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <Badge className={`rounded-lg text-[10px] uppercase tracking-wider font-bold ${
                                    campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                    campaign.status === 'Draft' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                    {campaign.status}
                                </Badge>
                                <span className="text-[10px] font-bold text-slate-400">#{campaign.id}</span>
                            </div>
                            <CardTitle className="text-lg font-bold mt-2 leading-tight">{campaign.title}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2 mt-1">{campaign.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="flex flex-col gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-500">Resource Fulfilled</span>
                                    <span className="text-slate-900">{campaign.roles.reduce((acc, r) => acc + r.assigned, 0)}/{campaign.roles.reduce((acc, r) => acc + r.required, 0)}</span>
                                </div>
                                <Progress value={Math.round((campaign.roles.reduce((acc, r) => acc + r.assigned, 0) / campaign.roles.reduce((acc, r) => acc + r.required, 0)) * 100)} className="h-1.5" />
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    {campaign.startDate} {campaign.endDate ? ` - ${campaign.endDate}` : ''}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                    {campaign.roles.length} roles defined
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 pt-4">
                            <Button 
                                variant="outline" 
                                className="w-full rounded-xl border-slate-200 text-xs font-bold py-5 hover:bg-white hover:text-indigo-600 transition-all"
                                onClick={() => {
                                    setSelectedCampaign(campaign);
                                    setSelectedRoleForAssign(campaign.roles[0]?.name || '');
                                    setIsAssignDialogOpen(true);
                                }}
                            >
                                Manage Assignments
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                
                {/* Empty Add Card */}
                <button 
                  onClick={() => setIsCampaignDialogOpen(true)}
                  className="rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all group"
                >
                    <div className="p-4 rounded-full bg-slate-50 group-hover:bg-indigo-100 transition-all">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-sm">Initiate New Mission</span>
                </button>
           </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
           <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
                <CardHeader className="bg-[#293088] text-white relative">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                     <UserCheck className="w-24 h-24" />
                   </div>
                   <CardTitle>Daily Engagement Registry</CardTitle>
                   <CardDescription className="text-white/70">Check-in volunteers for today's active missions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-none">
                                <TableHead className="font-bold py-4 pl-6">Volunteer</TableHead>
                                <TableHead className="font-bold">Assigned Mission</TableHead>
                                <TableHead className="font-bold">Shift</TableHead>
                                <TableHead className="font-bold">Current Reliability</TableHead>
                                <TableHead className="font-bold text-right pr-6">Verification</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {volunteers.slice(0, 4).map((v, i) => (
                                <TableRow key={v.id} className="border-slate-100">
                                    <TableCell className="pl-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-[10px]">
                                                {v.name.charAt(0)}
                                            </div>
                                            <p className="font-bold text-sm text-slate-900">{v.name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-none">
                                            {i % 2 === 0 ? 'Maha Shivaratri' : 'Sunday Annadhanam'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {v.availability === 'Full Day' ? '06:00 - 18:00' : '08:00 - 14:00'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`rounded-xl border-dashed ${
                                            v.reliabilityScore > 90 ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'border-amber-500 text-amber-600 bg-amber-50/50'
                                        }`}>
                                            {v.reliabilityScore}% Index
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button 
                                            size="sm" 
                                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 h-9 px-4 font-bold text-[11px] shadow-lg shadow-emerald-100 transition-all border-none"
                                            onClick={() => handleCheckIn(v.id)}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                            Verify Attendance
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden flex flex-col items-center justify-center p-8 text-center border-b-4 border-indigo-500 group">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-all">
                        <QrCode className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900">QR Check-in</h4>
                    <p className="text-xs text-slate-500 mt-2">Generate instant QR codes for volunteers to self-verify.</p>
                    <Button 
                        variant="outline" 
                        className="mt-6 w-full rounded-xl border-slate-200"
                        onClick={() => toast.info("Opening QR Scanner camera...")}
                    >
                        Open QR Scanner
                    </Button>
                </Card>

                <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden flex flex-col items-center justify-center p-8 text-center border-b-4 border-emerald-500 group">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-all">
                        <UserCheck className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900">Auto SMS Notification</h4>
                    <p className="text-xs text-slate-500 mt-2">Remind assigned volunteers about their upcoming shifts.</p>
                    <Button 
                        variant="outline" 
                        className="mt-6 w-full rounded-xl border-slate-200"
                        onClick={() => toast.success("Reminders dispatched to all assigned volunteers!")}
                    >
                        Dispatch Reminders
                    </Button>
                </Card>

                <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden flex flex-col items-center justify-center p-8 text-center border-b-4 border-red-500 group">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-all">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900">Absence Alert</h4>
                    <p className="text-xs text-slate-500 mt-2">Identify no-shows for the current active shift.</p>
                    <Button 
                        variant="outline" 
                        className="mt-6 w-full rounded-xl border-slate-200"
                        onClick={() => toast.warning("Scanning for 12 potential no-shows...")}
                    >
                        View Alert List
                    </Button>
                </Card>
           </div>
        </TabsContent>
      </Tabs>

      {/* Add Volunteer Dialog */}
      <Dialog open={isAddVolunteerOpen} onOpenChange={setIsAddVolunteerOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-3xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle><Users className="w-6 h-6 mr-2 inline text-indigo-600"/>Volunteer Registration</DialogTitle>
            <DialogDescription>
              Create a new volunteer profile. This record will be synchronized with the HR department database.
            </DialogDescription>
          </DialogHeader>
          <VolunteerForm 
            onSave={(data) => {
                addVolunteer(data);
                setIsAddVolunteerOpen(false);
                toast.success("Volunteer profile synchronized successfully!");
            }}
            onCancel={() => setIsAddVolunteerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600" />
              Manage Assignments: {selectedCampaign?.title}
            </DialogTitle>
            <DialogDescription>
              Assign available volunteers to specific roles for this mission.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Target Role</Label>
                    <Select value={selectedRoleForAssign} onValueChange={setSelectedRoleForAssign}>
                        <SelectTrigger className="w-[240px] rounded-xl bg-white">
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedCampaign?.roles.map(role => (
                                <SelectItem key={role.name} value={role.name}>
                                    {role.name} ({role.assigned}/{role.required})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Capacity</p>
                    <p className="text-xl font-bold text-[#293088]">
                        {selectedCampaign?.roles.find(r => r.name === selectedRoleForAssign)?.assigned} / {selectedCampaign?.roles.find(r => r.name === selectedRoleForAssign)?.required}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                    <Label className="text-sm font-bold text-slate-700">Available Volunteers</Label>
                    <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse text-[10px]">
                        Smart Matching Active
                    </Badge>
                </div>
                <div className="border rounded-xl overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold py-3 text-[11px] uppercase tracking-wider text-slate-500">Volunteer</TableHead>
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Skills</TableHead>
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Fit Score</TableHead>
                                <TableHead className="text-right pr-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {volunteers.filter(v => !selectedCampaign?.assignedVolunteers.includes(v.id)).length > 0 ? (
                                volunteers.filter(v => !selectedCampaign?.assignedVolunteers.includes(v.id))
                                .sort((a, b) => {
                                    // Smart Sort: Skills match first
                                    const aMatch = a.skills.some(s => selectedRoleForAssign.includes(s) || s.includes(selectedRoleForAssign));
                                    const bMatch = b.skills.some(s => selectedRoleForAssign.includes(s) || s.includes(selectedRoleForAssign));
                                    if (aMatch && !bMatch) return -1;
                                    if (!aMatch && bMatch) return 1;
                                    return b.reliabilityScore - a.reliabilityScore;
                                })
                                .map(v => {
                                    const isMatch = v.skills.some(s => selectedRoleForAssign.includes(s) || s.includes(selectedRoleForAssign));
                                    return (
                                        <TableRow key={v.id} className={`hover:bg-slate-50/50 border-slate-100 group ${isMatch ? 'bg-indigo-50/20' : ''}`}>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isMatch ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        {v.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{v.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">#{v.id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {v.skills.slice(0, 2).map(s => (
                                                        <Badge key={s} variant="outline" className={`text-[9px] px-1.5 py-0 ${isMatch && (selectedRoleForAssign.includes(s) || s.includes(selectedRoleForAssign)) ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-slate-200'}`}>
                                                            {s}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${v.reliabilityScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {v.reliabilityScore}%
                                                    </span>
                                                    {isMatch && <span className="text-[9px] font-bold text-indigo-500 uppercase">Skill Match</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className={`rounded-lg h-8 font-bold text-xs ${isMatch ? 'text-indigo-600 hover:bg-indigo-100' : 'text-slate-500 hover:bg-slate-100'}`}
                                                    onClick={() => handleAssign(v.id)}
                                                    disabled={selectedCampaign?.roles.find(r => r.name === selectedRoleForAssign)?.assigned! >= selectedCampaign?.roles.find(r => r.name === selectedRoleForAssign)?.required!}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Assign Member
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-slate-400 italic text-sm">
                                        No more available volunteers for this mission.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Currently Assigned List */}
            {selectedCampaign?.assignedVolunteers && selectedCampaign.assignedVolunteers.length > 0 && (
                <div className="space-y-3 mt-4">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Currently On Mission</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedCampaign.assignedVolunteers.map(vId => {
                            const v = volunteers.find(vol => vol.id === vId);
                            if (!v) return null;
                            return (
                                <div key={vId} className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-[#293088] text-white flex items-center justify-center text-[10px] font-bold">
                                            {v.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{v.name}</p>
                                            <p className="text-[9px] text-slate-500 uppercase font-bold">Mission Assigned</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => handleUnassign(vId)}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
          </div>
          <DialogFooter className="bg-slate-50 p-4 -m-6 mt-2 rounded-b-2xl border-t border-slate-100">
             <Button 
              className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              onClick={() => setIsAssignDialogOpen(false)}
             >
                Done Managing Missions
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerPage;
