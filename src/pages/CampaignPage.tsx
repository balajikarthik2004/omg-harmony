import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Users, UserCheck, Search, MessageSquare, Mail, MessageCircle, CalendarClock, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import { mockDevotees, mockEvents } from '@/data/mockData';
import { useVolunteerStore } from '@/hooks/useVolunteerStore';
import { formatDateDDMMYYYY } from '@/lib/utils';
import FormField from '@/components/FormField';
import { sendCampaignEmails } from '@/lib/emailService';

type ChannelKey = 'sms' | 'email' | 'whatsapp';
type RecipientMode = 'all' | 'selected' | 'volunteers';

type CampaignLog = {
  id: string;
  title: string;
  createdAt: string;
  recipientCount: number;
  channels: string;
  status: 'Sent' | 'Draft';
};

const channelConfig: Record<ChannelKey, { label: string; icon: React.ReactNode; activeClass: string }> = {
  sms: { label: 'SMS', icon: <MessageSquare className="h-4 w-4" />, activeClass: 'text-primary bg-primary/20 border-primary/30 shadow-sm' },
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" />, activeClass: 'text-emerald-500 bg-emerald-500/20 border-emerald-500/30 shadow-sm' },
  email: { label: 'Email', icon: <Mail className="h-4 w-4" />, activeClass: 'text-sky-500 bg-sky-500/20 border-sky-500/30 shadow-sm' },
};

const CampaignPage: React.FC = () => {
  const { items: volunteerItems } = useVolunteerStore();
  const [viewMode, setViewMode] = useState<'devotees' | 'volunteers'>('devotees');
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('all');
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedEventId, setSelectedEventId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState<Record<ChannelKey, boolean>>({ sms: true, email: true, whatsapp: true });
  const [lastStatus, setLastStatus] = useState('');
  const [logs, setLogs] = useState<CampaignLog[]>([]);
  const [isSending, setIsSending] = useState(false);

  const selectedEvent = useMemo(() => mockEvents.find(event => event.id === selectedEventId), [selectedEventId]);

  const devotees = useMemo(() => {
    // If volunteers mode, use volunteer store items, otherwise use devotee mock data
    const base = viewMode === 'volunteers' 
      ? volunteerItems.map(v => ({ id: v.id, name: v.name, phone: v.contact, email: v.email, city: v.preferredArea || 'N/A' }))
      : mockDevotees;
      
    const q = search.toLowerCase().trim();
    if (!q) return base;
    return base.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      (item.city && item.city.toLowerCase().includes(q))
    );
  }, [search, viewMode, volunteerItems]);

  const targetUsers = useMemo(() => {
    const base = viewMode === 'volunteers' 
      ? volunteerItems.map(v => ({ id: v.id, name: v.name, phone: v.contact, email: v.email, city: v.preferredArea || 'N/A' }))
      : mockDevotees;

    if (recipientMode === 'all' || (viewMode === 'volunteers' && recipientMode === 'volunteers')) return base;
    return base.filter(item => selectedUsers.has(item.id));
  }, [recipientMode, selectedUsers, viewMode, volunteerItems]);

  const selectedChannels = useMemo(
    () => (Object.keys(channels) as ChannelKey[]).filter(key => channels[key]).map(key => channelConfig[key].label),
    [channels]
  );

  const autoFillFromEvent = () => {
    if (!selectedEvent) return;
    const draftSubject = `Invitation: ${selectedEvent.name}`;
    const draftMessage = `Dear Devotee,\n\nWarm greetings from OMG Temple Governance System.\n\nYou are cordially invited to participate in ${selectedEvent.name}. Your presence and blessings will make this occasion even more meaningful for the entire temple community.\n\nEvent Details:\n- Date: ${formatDateDDMMYYYY(selectedEvent.date)}\n- Time: ${selectedEvent.time}\n- Venue: ${selectedEvent.location}\n\nAbout the Event:\n${selectedEvent.description}\n\nImportant Notes:\n- Please arrive at least 15 minutes early for smooth arrangements.\n- Families and children are warmly welcome.\n- Kindly share this invitation with fellow devotees.\n\nIf you need any assistance or additional information, please contact the temple office.\n\nWith prayers and best regards,\nOMG Temple Governance System`;
    setSubject(draftSubject);
    setMessage(draftMessage);
  };

  const autoFillVolunteerInvite = () => {
    if (!selectedEvent) return;
    const draftSubject = `Volunteer Invitation: ${selectedEvent.name}`;
    const draftMessage = `Dear Volunteer,\n\nWarm greetings from OMG Temple Governance System.\n\nWe invite you to support and serve during ${selectedEvent.name}. Your time and dedication are valuable to our temple community.\n\nEvent Details:\n- Date: ${formatDateDDMMYYYY(selectedEvent.date)}\n- Time: ${selectedEvent.time}\n- Venue: ${selectedEvent.location}\n\nVolunteer Notes:\n- Please report 30 minutes before start time.\n- Wear volunteer ID and follow coordinator instructions.\n- Contact the temple office if your availability changes.\n\nWith gratitude,\nOMG Temple Volunteer Coordination `;
    setSubject(draftSubject);
    setMessage(draftMessage);
  };

  const autoFillBySection = () => {
    if (viewMode === 'volunteers') {
      autoFillVolunteerInvite();
      return;
    }
    autoFillFromEvent();
  };

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
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

    setIsSending(true);

    if (channels.email) {
      try {
        const emailResult = await sendCampaignEmails({
          subject,
          message,
          recipients: targetUsers.map(user => ({ name: user.name, email: user.email })),
        });

        if (emailResult.attempted === 0) {
          setLastStatus('Error: Email channel is enabled, but no recipients have a valid email address.');
          setIsSending(false);
          return;
        }

        if (emailResult.failed > 0) {
          const detail = emailResult.errors[0] ? ` First error: ${emailResult.errors[0]}` : '';
          setLastStatus(`Error: Email sent to ${emailResult.sent}/${emailResult.attempted} recipients. ${emailResult.failed} failed.${detail}`);
          setIsSending(false);
          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error while sending email.';
        setLastStatus(`Error: ${message}`);
        setIsSending(false);
        return;
      }
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
    setIsSending(false);
  };

  return (
    <div className="campaign-premium space-y-6 max-w-[1500px] mx-auto">
      <div className="page-header-banner campaign-header bg-gradient-to-r from-primary/10 via-background to-primary/5 py-4 mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Campaign Manager</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Send bulk announcements to devotees and volunteers through SMS, WhatsApp, and Email.</p>
          </div>
          <div className="campaign-view-toggle-wrap">
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border/60 gap-1">
            <button
              onClick={() => { setViewMode('devotees'); setRecipientMode('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'devotees' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
            >
              <Users className="h-4.5 w-4.5" />
              Devotees
            </button>
            <button
              onClick={() => { setViewMode('volunteers'); setRecipientMode('volunteers'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'volunteers' ? 'bg-emerald-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
            >
              <UserCheck className="h-4.5 w-4.5" />
              Volunteers
            </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-stagger">
        <div className={`stat-card campaign-stat-card border-l-4 border-l-primary transition-all duration-300 transform`}>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Focus Population</p>
          <p className={`text-2xl font-bold mt-1 text-foreground`}>
            {viewMode === 'volunteers' ? volunteerItems.length : mockDevotees.length}
          </p>
        </div>
        <div className="stat-card campaign-stat-card border-l-4 border-l-primary shadow-sm">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Target Recipients</p>
          <p className="text-2xl font-bold mt-1 text-foreground font-display">{targetUsers.length}</p>
        </div>
        <div className="stat-card campaign-stat-card border-l-4 border-l-primary shadow-sm">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Active Channels</p>
          <p className="text-2xl font-bold mt-1 text-foreground font-display">{selectedChannels.length}</p>
        </div>
        <div className="stat-card campaign-stat-card border-l-4 border-l-primary shadow-sm">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Campaigns Executed</p>
          <p className="text-2xl font-bold mt-1 text-foreground font-display">{logs.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="section-panel campaign-main-panel xl:col-span-2">
          <div className="section-panel-header px-6 py-4">
            <h2 className="text-base font-display font-semibold">Create Campaign</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setRecipientMode(viewMode === 'volunteers' ? 'volunteers' : 'all')}
                className={`campaign-mode-card rounded-xl border-2 px-5 py-4 text-left transition-all duration-300 ${recipientMode === (viewMode === 'volunteers' ? 'volunteers' : 'all') ? 'border-primary bg-primary/5 shadow-sm transform scale-[1.01]' : 'border-border hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${recipientMode === (viewMode === 'volunteers' ? 'volunteers' : 'all') ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {viewMode === 'volunteers' ? 'All Volunteers' : 'All Devotees'}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Broadcast to every active {viewMode === 'volunteers' ? 'volunteer' : 'devotee'} in the database.
                </p>
              </button>

              <button
                onClick={() => setRecipientMode('selected')}
                className={`campaign-mode-card rounded-xl border-2 px-5 py-4 text-left transition-all duration-300 ${recipientMode === 'selected' ? 'border-primary bg-primary/5 shadow-sm transform scale-[1.01]' : 'border-border hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${recipientMode === 'selected' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Selected Individuals</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Choose specific {viewMode === 'volunteers' ? 'volunteers' : 'individuals'} from the list.
                </p>
              </button>
            </div>

            <div className="campaign-event-box p-4 rounded-xl border border-border bg-muted/10 space-y-4">
               <div className="flex flex-col md:flex-row gap-4 items-end">
                 <div className="space-y-1.5 flex-1 w-full">
                   <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Event (Optional)</label>
                   <select
                     value={selectedEventId}
                     onChange={e => setSelectedEventId(e.target.value)}
                    className="campaign-field w-full h-11 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none hover:border-border"
                   >
                     <option value="">No event selected</option>
                     {mockEvents.map(event => (
                       <option key={event.id} value={event.id}>{event.name} - {formatDateDDMMYYYY(event.date)}</option>
                     ))}
                   </select>
                 </div>
                 <Button variant="outline" className="w-full md:w-auto h-11" onClick={autoFillBySection} disabled={!selectedEventId}>
                   <CalendarClock className="h-4 w-4 mr-2" />
                   {viewMode === 'volunteers' ? 'Auto-Fill Volunteer Invite' : 'Auto-Fill Devotee Invite'}
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
                  className="campaign-field w-full min-h-[160px] rounded-lg border border-input bg-background/60 hover:border-border px-4 py-3 text-sm text-foreground transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
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
                      className={`campaign-channel-btn h-11 rounded-lg border-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${channels[key] ? channelConfig[key].activeClass : 'border-border text-muted-foreground hover:bg-muted/40 hover:border-border/80 bg-background'}`}
                    >
                      {channelConfig[key].icon}
                      {channelConfig[key].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {lastStatus && (
              <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 animate-slide-up ${lastStatus.startsWith('Error') ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'}`}>
                {lastStatus.startsWith('Error') ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                {lastStatus}
              </div>
            )}

            <Button className="campaign-send-btn w-full h-12 text-base font-semibold" onClick={handleSend} disabled={isSending}>
              <Send className="h-5 w-5 mr-2" />
              {isSending ? 'Sending...' : 'Launch Campaign'}
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          {recipientMode === 'selected' && (
            <div className="section-panel campaign-side-panel flex flex-col h-[350px] animate-fade-in">
              <div className="section-panel-header">
                <h2 className="text-sm font-semibold">Select Target Devotees</h2>
              </div>
              <div className="p-4 flex-1 flex flex-col min-h-0">
                <div className="relative mb-3 shrink-0">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="campaign-field w-full h-10 rounded-lg border border-input bg-background/60 hover:border-border pl-9 pr-3 text-sm text-foreground transition-all focus:border-primary outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Search by name or phone..."
                  />
                </div>
                <div className="overflow-y-auto space-y-1.5 pr-2 flex-1 scrollbar-thin">
                  {devotees.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleUser(item.id)}
                      className={`campaign-user-item w-full text-left rounded-lg border p-3 transition-all duration-200 flex items-center justify-between group ${selectedUsers.has(item.id) ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
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

          <div className="section-panel campaign-side-panel">
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
                <div key={log.id} className="campaign-log-item rounded-xl border border-border bg-card p-3 hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-foreground leading-tight">{log.title}</p>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">{log.status}</span>
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
export default CampaignPage;
