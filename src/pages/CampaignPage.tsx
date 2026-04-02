import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Users, UserCheck, Search, MessageSquare, Mail, MessageCircle, CalendarClock } from 'lucide-react';
import { mockDevotees, mockEvents } from '@/data/mockData';
import { formatDateDDMMYYYY } from '@/lib/utils';
import FormField from '@/components/FormField';

type ChannelKey = 'sms' | 'email' | 'whatsapp';
type RecipientMode = 'all' | 'selected';

type CampaignLog = {
  id: string;
  title: string;
  createdAt: string;
  recipientCount: number;
  channels: string;
  status: 'Sent' | 'Draft';
};

const channelConfig: Record<ChannelKey, { label: string; icon: React.ReactNode; colorClass: string }> = {
  sms: { label: 'SMS', icon: <MessageSquare className="h-4 w-4" />, colorClass: 'text-violet-700 bg-violet-100 border-violet-200' },
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" />, colorClass: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
  email: { label: 'Email', icon: <Mail className="h-4 w-4" />, colorClass: 'text-sky-700 bg-sky-100 border-sky-200' },
};

const CampaignPage: React.FC = () => {
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('all');
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedEventId, setSelectedEventId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState<Record<ChannelKey, boolean>>({ sms: true, email: true, whatsapp: true });
  const [lastStatus, setLastStatus] = useState('');
  const [logs, setLogs] = useState<CampaignLog[]>([]);

  const selectedEvent = useMemo(() => mockEvents.find(event => event.id === selectedEventId), [selectedEventId]);

  const devotees = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return mockDevotees;
    return mockDevotees.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q)
    );
  }, [search]);

  const targetUsers = useMemo(() => {
    if (recipientMode === 'all') return mockDevotees;
    return mockDevotees.filter(item => selectedUsers.has(item.id));
  }, [recipientMode, selectedUsers]);

  const selectedChannels = useMemo(
    () => (Object.keys(channels) as ChannelKey[]).filter(key => channels[key]).map(key => channelConfig[key].label),
    [channels]
  );

  const autoFillFromEvent = () => {
    if (!selectedEvent) return;
    const draftSubject = `Invitation: ${selectedEvent.name}`;
    const draftMessage = `Dear Devotee,\n\nYou are warmly invited to ${selectedEvent.name} on ${formatDateDDMMYYYY(selectedEvent.date)} at ${selectedEvent.time}.\nLocation: ${selectedEvent.location}\n\n${selectedEvent.description}\n\nWith blessings,\nTemple Harmony`;
    setSubject(draftSubject);
    setMessage(draftMessage);
  };

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      setLastStatus('Error: Please enter both a title and message before sending.');
      return;
    }
    if (selectedChannels.length === 0) {
      setLastStatus('Error: Select at least one notification channel.');
      return;
    }
    if (recipientMode === 'selected' && targetUsers.length === 0) {
      setLastStatus('Error: Select at least one devotee for selected-user campaigns.');
      return;
    }

    const campaign: CampaignLog = {
      id: `CMP-${String(logs.length + 1).padStart(3, '0')}`,
      title: subject,
      createdAt: new Date().toISOString(),
      recipientCount: targetUsers.length,
      channels: selectedChannels.join(', '),
      status: 'Sent',
    };

    setLogs(prev => [campaign, ...prev]);
    setLastStatus(`Success: Campaign sent to ${targetUsers.length} devotees via ${selectedChannels.join(', ')}.`);
    setSubject('');
    setMessage('');
    setSelectedEventId('');
    if (recipientMode === 'selected') setSelectedUsers(new Set());
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <div className="page-header-banner bg-gradient-to-r from-sky-50/70 via-background to-emerald-50/70 py-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Campaign Manager</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Send bulk announcements to devotees through SMS, WhatsApp, and Email.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-stagger">
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Devotees</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{mockDevotees.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Target Recipients</p>
          <p className="text-2xl font-bold mt-1 text-blue-700">{targetUsers.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Active Channels</p>
          <p className="text-2xl font-bold mt-1 text-emerald-700">{selectedChannels.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Campaigns</p>
          <p className="text-2xl font-bold mt-1 text-violet-700">{logs.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="section-panel xl:col-span-2">
          <div className="section-panel-header px-6 py-4">
            <h2 className="text-base font-display font-semibold">Create Campaign</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setRecipientMode('all')}
                className={`rounded-xl border-2 px-5 py-4 text-left transition-all duration-300 ${recipientMode === 'all' ? 'border-primary bg-primary/5 shadow-sm transform scale-[1.01]' : 'border-border hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${recipientMode === 'all' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">All Devotees</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Broadcast message to every active devotee in the temple database.</p>
              </button>

              <button
                onClick={() => setRecipientMode('selected')}
                className={`rounded-xl border-2 px-5 py-4 text-left transition-all duration-300 ${recipientMode === 'selected' ? 'border-primary bg-primary/5 shadow-sm transform scale-[1.01]' : 'border-border hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${recipientMode === 'selected' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Selected Devotees</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Choose specific individuals or segments from the devotee list.</p>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-4">
               <div className="flex flex-col md:flex-row gap-4 items-end">
                 <div className="space-y-1.5 flex-1 w-full">
                   <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Event (Optional)</label>
                   <select
                     value={selectedEventId}
                     onChange={e => setSelectedEventId(e.target.value)}
                     className="w-full h-11 rounded-lg border border-input bg-background/60 px-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none hover:border-border"
                   >
                     <option value="">No event selected</option>
                     {mockEvents.map(event => (
                       <option key={event.id} value={event.id}>{event.name} - {formatDateDDMMYYYY(event.date)}</option>
                     ))}
                   </select>
                 </div>
                 <Button variant="outline" className="w-full md:w-auto h-11" onClick={autoFillFromEvent} disabled={!selectedEventId}>
                   <CalendarClock className="h-4 w-4 mr-2" />Auto-Fill Details
                 </Button>
               </div>
            </div>

            <div className="space-y-4">
              <FormField label="Campaign Title / Subject" value={subject} onChange={v => setSubject(v)} placeholder="e.g. Navratri Special Pooja Invitation" />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Message Body</label>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{message.length} chars</span>
                </div>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full min-h-[160px] rounded-lg border border-input bg-background/60 hover:border-border px-4 py-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
                  placeholder="Draft your announcement message here..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Broadcast Channels</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(channelConfig) as ChannelKey[]).map(key => (
                    <button
                      key={key}
                      onClick={() => setChannels(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`h-11 rounded-lg border-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${channels[key] ? `border-${channelConfig[key].colorClass.split(' ')[2].split('-')[1]}-300 ${channelConfig[key].colorClass} shadow-sm` : 'border-border text-muted-foreground hover:bg-muted/40 hover:border-border/80 bg-background'}`}
                    >
                      {channelConfig[key].icon}
                      {channelConfig[key].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {lastStatus && (
              <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 animate-slide-up ${lastStatus.startsWith('Error') ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                {lastStatus.startsWith('Error') ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                {lastStatus}
              </div>
            )}

            <Button className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg" onClick={handleSend}>
              <Send className="h-5 w-5 mr-2" />
              Launch Campaign
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          {recipientMode === 'selected' && (
            <div className="section-panel flex flex-col h-[350px] animate-fade-in">
              <div className="section-panel-header">
                <h2 className="text-sm font-semibold">Select Target Devotees</h2>
              </div>
              <div className="p-4 flex-1 flex flex-col min-h-0">
                <div className="relative mb-3 shrink-0">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border pl-9 pr-3 text-sm transition-all focus:border-primary outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Search by name or phone..."
                  />
                </div>
                <div className="overflow-y-auto space-y-1.5 pr-2 flex-1 scrollbar-thin">
                  {devotees.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleUser(item.id)}
                      className={`w-full text-left rounded-lg border p-3 transition-all duration-200 flex items-center justify-between group ${selectedUsers.has(item.id) ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${selectedUsers.has(item.id) ? 'text-primary' : 'text-foreground'}`}>{item.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{item.phone} • {item.city}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedUsers.has(item.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30 group-hover:border-primary/50'}`}>
                        {selectedUsers.has(item.id) && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  ))}
                  {devotees.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No devotees found.</p>}
                </div>
              </div>
            </div>
          )}

          <div className="section-panel">
            <div className="section-panel-header">
              <h2 className="text-sm font-semibold">Campaign History</h2>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {logs.length === 0 ? (
                <div className="text-center py-6 bg-muted/20 rounded-xl border border-dashed">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs font-medium text-muted-foreground">No campaigns launched yet.</p>
                </div>
              ) : logs.map(log => (
                <div key={log.id} className="rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-foreground leading-tight">{log.title}</p>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-200 shrink-0">{log.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 font-medium">
                     <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"><Users className="h-3.5 w-3.5" />{log.recipientCount}</span>
                     <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"><MessageSquare className="h-3.5 w-3.5" />{log.channels}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 mt-2 text-right">{formatDateDDMMYYYY(log.createdAt.split('T')[0])}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  
import { Check, AlertCircle, CheckCircle2 } from 'lucide-react';
export default CampaignPage;
