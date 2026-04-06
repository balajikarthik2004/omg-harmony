import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, UserPlus, Save, UserCheck } from 'lucide-react';
import { Volunteer, VolunteerStatus } from '@/hooks/useVolunteerStore';
import { toast } from 'sonner';

interface VolunteerFormProps {
  initialData?: Volunteer | null;
  onSave: (data: Omit<Volunteer, 'id'>) => void;
  onCancel: () => void;
}

const VolunteerForm: React.FC<VolunteerFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    contact: initialData?.contact || '',
    email: initialData?.email || '',
    skills: initialData?.skills || [] as string[],
    availability: initialData?.availability || 'Morning',
    experienceLevel: initialData?.experienceLevel || 'Beginner' as any,
    status: initialData?.status || 'Registered' as VolunteerStatus,
    preferredArea: initialData?.preferredArea || ''
  });

  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) {
      toast.error("Name and Contact are required");
      return;
    }

    onSave({
      ...formData,
      participationCount: initialData?.participationCount || 0,
      reliabilityScore: initialData?.reliabilityScore || 100,
      lastParticipation: initialData?.lastParticipation || 'Never'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
          <Input 
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            placeholder="E.g. Rajesh Kumar"
            className="rounded-xl border-slate-200 h-11 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Number</Label>
          <Input 
            value={formData.contact}
            onChange={e => setFormData(p => ({ ...p, contact: e.target.value }))}
            placeholder="9876543210"
            className="rounded-xl border-slate-200 h-11 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
          <Input 
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            placeholder="rajesh@example.com"
            className="rounded-xl border-slate-200 h-11 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Area</Label>
          <Input 
            value={formData.preferredArea}
            onChange={e => setFormData(p => ({ ...p, preferredArea: e.target.value }))}
            placeholder="E.g. Events Desk"
            className="rounded-xl border-slate-200 h-11 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Availability</Label>
          <Select value={formData.availability} onValueChange={v => setFormData(p => ({ ...p, availability: v }))}>
            <SelectTrigger className="rounded-xl border-slate-200 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Morning">Morning (06:00 - 12:00)</SelectItem>
              <SelectItem value="Evening">Evening (16:00 - 21:00)</SelectItem>
              <SelectItem value="Full Day">Full Day</SelectItem>
              <SelectItem value="Weekends">Weekends Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Experience Level</Label>
          <Select value={formData.experienceLevel} onValueChange={v => setFormData(p => ({ ...p, experienceLevel: v as any }))}>
            <SelectTrigger className="rounded-xl border-slate-200 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Expert">Master / Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Status</Label>
          <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as VolunteerStatus }))}>
            <SelectTrigger className="rounded-xl border-slate-200 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Registered">Registered</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Assigned">Assigned (On Duty)</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills & Expertise</Label>
        <div className="flex gap-2">
          <Input 
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Add a skill..."
            className="rounded-xl border-slate-200 h-10"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
          />
          <Button type="button" variant="outline" onClick={handleAddSkill} className="rounded-xl px-4 border-slate-200 font-bold hover:bg-slate-50">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.skills.map(skill => (
            <Badge key={skill} className="rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 px-3 py-1.5 border-none transition-all group">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="text-indigo-400 hover:text-indigo-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
          {formData.skills.length === 0 && <p className="text-[11px] text-slate-400 italic">No skills listed yet.</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 rounded-xl h-12 font-bold text-slate-500">Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl h-12 font-bold bg-[#293088] hover:bg-[#1e246a] text-white shadow-lg shadow-indigo-100">
          {initialData ? <Save className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          {initialData ? 'Update Profile' : 'Register Volunteer'}
        </Button>
      </div>
    </form>
  );
};

export default VolunteerForm;
