import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Users, UserCheck, Search, MessageSquare, Mail, MessageCircle, CalendarClock } from 'lucide-react';
import { mockDevotees, mockEvents } from '@/data/mockData';
import { formatDateDDMMYYYY } from '@/lib/utils';

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

const channelConfig: Record<ChannelKey, { label: string; icon: React.ReactNode }> = {
  sms: { label: 'SMS', icon: <MessageSquare className="h-4 w-4" /> },
  email: { label: 'Email', icon: <Mail className="h-4 w-4" /> },
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" /> },
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
    const draftMessage = `Dear Devotee,\n\nYou are invited to ${selectedEvent.name} on ${formatDateDDMMYYYY(selectedEvent.date)} at ${selectedEvent.time}.\nLocation: ${selectedEvent.location}\n\n${selectedEvent.description}\n\n- Temple Harmony`;
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
      setLastStatus('Enter title and message before sending campaign.');
      return;
    }
    if (selectedChannels.length === 0) {
      setLastStatus('Select at least one notification channel.');
      return;
    }
    if (recipientMode === 'selected' && targetUsers.length === 0) {
      setLastStatus('Select at least one devotee for selected-user campaigns.');
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
    setLastStatus(`Campaign sent to ${targetUsers.length} devotees via ${selectedChannels.join(', ')}.`);
    setSubject('');
    setMessage('');
    setSelectedEventId('');
    if (recipientMode === 'selected') setSelectedUsers(new Set());
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <div className="rounded-xl border border-border bg-gradient-to-r from-sky-50/70 via-background to-emerald-50/70 px-4 py-3">
        <h1 className="text-2xl font-display font-bold text-foreground">Campaign Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">Send temple announcements to all devotees or selected devotees with channel-wise targeting.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Devotees</p>
          <p className="text-2xl font-semibold mt-1">{mockDevotees.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Target Recipients</p>
          <p className="text-2xl font-semibold mt-1 text-blue-700">{targetUsers.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active Channels</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-700">{selectedChannels.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Campaigns Sent</p>
          <p className="text-2xl font-semibold mt-1">{logs.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden xl:col-span-2">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <h2 className="text-sm font-semibold">Create Campaign</h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setRecipientMode('all')}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${recipientMode === 'all' ? 'border-blue-300 bg-blue-50/60' : 'border-border hover:bg-muted/30'}`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-700" />
                  <p className="text-sm font-semibold">All Devotees</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Send to every active devotee contact.</p>
              </button>

              <button
                onClick={() => setRecipientMode('selected')}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${recipientMode === 'selected' ? 'border-emerald-300 bg-emerald-50/60' : 'border-border hover:bg-muted/30'}`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-700" />
                  <p className="text-sm font-semibold">Selected Devotees</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Choose specific devotees from list.</p>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Link Event (optional)</label>
                <select
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select event</option>
                  {mockEvents.map(event => (
                    <option key={event.id} value={event.id}>{event.name} - {formatDateDDMMYYYY(event.date)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={autoFillFromEvent} disabled={!selectedEventId}>
                  <CalendarClock className="h-4 w-4 mr-2" />Auto Fill from Event
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Campaign Title</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                placeholder="e.g. Special Pooja Invitation"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full min-h-[130px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Write campaign message for devotees..."
              />
              <p className="text-[11px] text-muted-foreground">{message.length} characters</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Channels</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(channelConfig) as ChannelKey[]).map(key => (
                  <button
                    key={key}
                    onClick={() => setChannels(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`rounded-lg border py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${channels[key] ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-border text-muted-foreground hover:bg-muted/40'}`}
                  >
                    {channelConfig[key].icon}
                    {channelConfig[key].label}
                  </button>
                ))}
              </div>
            </div>

            {lastStatus && (
              <p className="text-xs rounded-md px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200">{lastStatus}</p>
            )}

            <Button className="w-full" onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />Send Campaign
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {recipientMode === 'selected' && (
            <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <h2 className="text-sm font-semibold">Select Devotees</h2>
              </div>
              <div className="p-3 space-y-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background pl-8 pr-2 text-xs"
                    placeholder="Search devotee"
                  />
                </div>
                <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
                  {devotees.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleUser(item.id)}
                      className={`w-full text-left rounded-md border px-2.5 py-2 transition-colors ${selectedUsers.has(item.id) ? 'border-emerald-300 bg-emerald-50/70' : 'border-border hover:bg-muted/30'}`}
                    >
                      <p className="text-xs font-medium">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{item.phone} · {item.city}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <h2 className="text-sm font-semibold">Recent Campaigns</h2>
            </div>
            <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No campaign sent yet.</p>
              ) : logs.map(log => (
                <div key={log.id} className="rounded-md border border-border px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold truncate">{log.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{log.status}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{log.recipientCount} recipients · {log.channels}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDateDDMMYYYY(log.createdAt.split('T')[0])}</p>
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
