import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, MessageSquare, MessageCircle, Mail, Phone, MapPin, Calendar, Search, Users, ShieldCheck, HeartHandshake, History, CreditCard, Clock, CheckCircle2, Maximize2, UserPlus, Crown, Award, Medal } from 'lucide-react';
import { mockDevotees, mockDonations, mockBookings, mockEvents } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';
import { sendCampaignEmails } from '@/lib/emailService';

const emptyForm = {
  name: '', phone: '', email: '', address: '',
  city: '', state: '', country: 'India',
  status: 'Active', totalDonations: 0, lastVisit: '',
  dob: '', gender: '', occupation: '',
  nakshatra: '', rasi: '', gothram: '',
  spouse: '', children: '',
  familyMembers: '',
  volunteerInterest: '', membershipType: 'Regular Devotee',
  notificationSms: true, notificationEmail: true, notificationWhatsApp: true,
  reminderBirthday: true, reminderNakshatra: true, reminderFestivalGreetings: true, reminderDonationAnniversary: true,
};

const emptyFamilyMemberForm: FamilyMemberFormState = {
  id: null,
  name: '',
  relation: '',
  dob: '',
  gender: '',
  occupation: '',
  phone: '',
  rasi: '',
  nakshatra: '',
  parentId: 'root',
  isPrimary: false,
};

function buildLegacyFamilyMembers(devotee: Devotee): FamilyMember[] {
  const legacyMembers: FamilyMember[] = [];

  if (devotee.spouse?.trim()) {
    legacyMembers.push({ id: 'legacy-spouse', name: devotee.spouse.trim(), relation: 'Spouse', parentId: null });
  }

  const childTokens = (devotee.children || '')
    .split(',')
    .map(token => token.trim())
    .filter(Boolean);
  const parsedChildren = childTokens.length === 1 && /^\d+$/.test(childTokens[0])
    ? Array.from({ length: Number(childTokens[0]) }, (_, index) => `Child ${index + 1}`)
    : childTokens;

  parsedChildren.forEach((child, index) => {
    legacyMembers.push({ id: `legacy-child-${index + 1}`, name: child, relation: 'Child', parentId: null });
  });

  const rawFamilyMembers = (devotee.familyMembers || '')
    .split(',')
    .map(token => token.trim())
    .filter(Boolean);

  rawFamilyMembers.forEach((member, index) => {
    const [relationRaw, ...nameParts] = member.split(':');
    if (nameParts.length === 0) {
      legacyMembers.push({ id: `legacy-family-${index + 1}`, relation: 'Family', name: relationRaw.trim(), parentId: null });
      return;
    }
    legacyMembers.push({
      id: `legacy-family-${index + 1}`,
      relation: relationRaw.trim() || 'Family',
      name: nameParts.join(':').trim() || 'N/A',
      parentId: null,
    });
  });

  return legacyMembers;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function fmtAmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function fmtDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString('en-GB');
  return dateStr;
}

const bookingBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    Confirmed: 'bg-success/15 text-success border-success/25',
    Pending: 'bg-warning/15 text-warning border-warning/25',
    Completed: 'bg-primary/15 text-foreground border-primary/30',
    Cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return map[status] ?? 'bg-muted text-muted-foreground';
}

const REL_COLORS: Record<string, { rc: string; rb: string; rt: string }> = {
  spouse: { rc: 'hsl(var(--primary))', rb: 'hsl(var(--primary)/0.1)', rt: 'hsl(var(--primary))' },
  father: { rc: 'hsl(var(--primary))', rb: 'hsl(var(--primary)/0.1)', rt: 'hsl(var(--primary))' },
  mother: { rc: 'hsl(280 80% 60%)', rb: 'hsl(280 80% 60% / 0.1)', rt: 'hsl(280 80% 60%)' },
  brother: { rc: 'hsl(140 80% 40%)', rb: 'hsl(140 80% 40% / 0.1)', rt: 'hsl(140 80% 40%)' },
  sister: { rc: 'hsl(0 80% 60%)', rb: 'hsl(0 80% 60% / 0.1)', rt: 'hsl(0 80% 60%)' },
  son: { rc: 'hsl(var(--secondary))', rb: 'hsl(var(--secondary)/0.1)', rt: 'hsl(var(--secondary))' },
  daughter: { rc: 'hsl(330 80% 60%)', rb: 'hsl(330 80% 60% / 0.1)', rt: 'hsl(330 80% 60%)' },
  child: { rc: 'hsl(100 60% 50%)', rb: 'hsl(100 60% 50% / 0.1)', rt: 'hsl(100 60% 50%)' },
  family: { rc: 'hsl(var(--muted-foreground))', rb: 'hsl(var(--muted))', rt: 'hsl(var(--foreground))' },
};
const DEFAULT_REL_COLOR = { rc: 'hsl(var(--primary)/0.8)', rb: 'hsl(var(--primary)/0.1)', rt: 'hsl(var(--primary))' };

function getRelColor(rel: string) {
  return REL_COLORS[rel.toLowerCase().trim()] ?? DEFAULT_REL_COLOR;
}

type Devotee = Omit<(typeof mockDevotees)[number], 'familyTreeMembers'> & {
  dob?: string;
  gender?: string;
  occupation?: string;
  nakshatra?: string;
  rasi?: string;
  gothram?: string;
  spouse?: string;
  children?: string;
  familyMembers?: string;
  familyTreeMembers?: FamilyMember[];
  volunteerInterest?: string;
  membershipType?: string;
  notificationSms?: boolean;
  notificationEmail?: boolean;
  notificationWhatsApp?: boolean;
  reminderBirthday?: boolean;
  reminderNakshatra?: boolean;
  reminderFestivalGreetings?: boolean;
  reminderDonationAnniversary?: boolean;
};

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  dob?: string;
  gender?: string;
  occupation?: string;
  phone?: string;
  rasi?: string;
  nakshatra?: string;
  parentId?: string | null;
  isPrimary?: boolean;
};

type FamilyMemberFormState = {
  id: string | null;
  name: string;
  relation: string;
  dob: string;
  gender: string;
  occupation: string;
  phone: string;
  rasi: string;
  nakshatra: string;
  parentId: string;
  isPrimary: boolean;
};
type TabName = 'info' | 'bookings' | 'donations' | 'family' | 'notify';
type ReminderTemplateKey = 'birthday' | 'nakshatra' | 'festival' | 'donationAnniversary';

type Donation = typeof mockDonations[0];
type Booking = typeof mockBookings[0];

function useFamilyConnectors(
  containerRef: React.RefObject<HTMLDivElement>,
  members: FamilyMember[],
  collapsedNodes: Set<string>,
  dep?: unknown,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll('.ftree-svg-overlay').forEach(el => el.remove());

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('ftree-svg-overlay');
    container.style.position = 'relative';
    container.appendChild(svg);

    const containerRect = container.getBoundingClientRect();

    function relRect(el: Element) {
      const r = el.getBoundingClientRect();
      return {
        cx: r.left - containerRect.left + r.width / 2,
        top: r.top - containerRect.top,
        bottom: r.top - containerRect.top + r.height,
      };
    }

    const rootEl = container.querySelector('.ftree-root-node');

    members.forEach(member => {
      const parentId = member.parentId ?? null;

      if (parentId && collapsedNodes.has(parentId)) return;

      const parentEl = parentId
        ? container.querySelector(`[data-ftree-id="${parentId}"]`)
        : rootEl;
      const childEl = container.querySelector(`[data-ftree-id="${member.id}"]`);

      if (!parentEl || !childEl) return;

      const p = relRect(parentEl);
      const c = relRect(childEl);

      const x1 = p.cx;
      const y1 = p.bottom;
      const x2 = c.cx;
      const y2 = c.top;
      const my = (y1 + y2) / 2;
      const snap = (value: number) => Math.round(value) + 0.5;

      const col = getRelColor(member.relation);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', `ftree-connector-path${member.isPrimary ? ' ftree-connector-primary' : ''}`);
      path.setAttribute('d', `M${snap(x1)},${snap(y1)} V${snap(my)} H${snap(x2)} V${snap(y2)}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', col.rc);
      path.setAttribute('stroke-width', member.isPrimary ? '2.2' : '1.6');
      path.setAttribute('stroke-opacity', member.isPrimary ? '0.7' : '0.42');
      path.setAttribute('stroke-dasharray', member.isPrimary ? '0' : '6 3');
      path.setAttribute('stroke-linecap', 'square');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);

      const endpoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      endpoint.setAttribute('class', 'ftree-connector-dot');
      endpoint.setAttribute('cx', `${snap(x2)}`);
      endpoint.setAttribute('cy', `${snap(y2)}`);
      endpoint.setAttribute('r', member.isPrimary ? '2.3' : '1.8');
      endpoint.setAttribute('fill', col.rc);
      endpoint.setAttribute('fill-opacity', member.isPrimary ? '0.78' : '0.54');
      svg.appendChild(endpoint);
    });
  }, [containerRef, members, collapsedNodes, dep]);
}

function deriveDevoteeProfile(devotee: Devotee, donations: Donation[], bookings: Booking[]) {
  const seed = devotee.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const year = 1970 + (seed % 25);
  const month = (seed % 12) + 1;
  const day = ((seed * 7) % 28) + 1;
  const dateOfBirth = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

  const memberSince = donations.length > 0
    ? donations.map(d => d.date).sort()[0]
    : devotee.lastVisit || 'N/A';

  const serviceCount: Record<string, number> = {};
  bookings.forEach(b => { serviceCount[b.serviceName] = (serviceCount[b.serviceName] || 0) + 1; });
  const preferredSeva = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General Temple Visit';

  const lastDonation = donations.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const offeringSummary = lastDonation
    ? `${fmtAmt(lastDonation.amount)} on ${fmtDate(lastDonation.date)}`
    : 'No recent offerings';

  return { dateOfBirth, memberSince: fmtDate(memberSince), preferredSeva, offeringSummary };
}

function getDonationTier(total: number) {
  if (total >= 100000) return { label: 'Platinum', icon: Crown, color: 'text-primary bg-primary/10 border-primary/20', fill: 'fill-primary/20' };
  if (total >= 50000) return { label: 'Gold', icon: Award, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20', fill: 'fill-amber-500/20' };
  if (total >= 10000) return { label: 'Silver', icon: Medal, color: 'text-muted-foreground bg-muted border-border', fill: 'fill-muted-foreground/20' };
  return { label: 'Devotee', icon: HeartHandshake, color: 'text-success bg-success/15 border-success/25', fill: 'fill-success/20' };
}

const profileMetaIconClass = 'w-4 h-4 text-foreground/80';

const DevoteesPage: React.FC = () => {
  const { items, add, update, remove } = useStore<Devotee>(mockDevotees as any[]);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDevotee, setSelectedDevotee] = useState<Devotee | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('info');

  const [notifSubject, setNotifSubject] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [channels, setChannels] = useState({ sms: true, email: true, whatsapp: true });
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [notifSent, setNotifSent] = useState('');
  const [notifSending, setNotifSending] = useState(false);

  const [familyMemberForm, setFamilyMemberForm] = useState<FamilyMemberFormState>(emptyFamilyMemberForm);
  const [familyFormOpen, setFamilyFormOpen] = useState(false);
  const [familyFullViewOpen, setFamilyFullViewOpen] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const fullTreeRef = useRef<HTMLDivElement>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  const selectedEventDetails = useMemo(
    () => mockEvents.filter(event => selectedEvents.has(event.id)),
    [selectedEvents]
  );

  useEffect(() => {
    if (!selectedDevotee || selectedEventDetails.length === 0) return;

    const title = selectedEventDetails.length === 1
      ? `Invitation: ${selectedEventDetails[0].name}`
      : `Temple Event Updates (${selectedEventDetails.length} Events)`;

    const eventLines = selectedEventDetails
      .map(event => `- ${event.name} | Date: ${fmtDate(event.date)} | Time: ${event.time}`)
      .join('\n');

    const message = `Dear ${selectedDevotee.name},\n\nGreetings from OMG Temple Governance. We are pleased to invite you to the following upcoming temple event${selectedEventDetails.length > 1 ? 's' : ''}:\n\n${eventLines}\n\nYour participation and blessings are deeply valued. If you need any assistance with booking or timing, please contact the temple office.\n\nWith prayers and regards,\nTemple Governance`;

    setNotifSubject(title);
    setNotifMessage(message);
  }, [selectedDevotee, selectedEventDetails]);

  useEffect(() => {
    if (!selectedDevotee) return;
    const updatedDevotee = items.find(item => item.id === selectedDevotee.id);
    if (updatedDevotee) setSelectedDevotee(updatedDevotee as Devotee);
  }, [items, selectedDevotee]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/\s/g, '');
    if (!q) return items;
    return items.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.phone.replace(/\s/g, '').includes(q) ||
      d.email.toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalDevotees = items.length;
  const activeDevotees = items.filter(d => d.status === 'Active').length;
  const recentVisits = items.filter(d => {
    if (!d.lastVisit) return false;
    const visitDate = new Date(d.lastVisit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return visitDate >= thirtyDaysAgo;
  }).length;
  const majorDonors = items.filter(d => d.totalDonations > 50000).length;


  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (e: React.MouseEvent, item: Devotee) => {
    e.stopPropagation();
    setForm({
      name: item.name,
      phone: item.phone,
      email: item.email,
      address: item.address,
      city: item.city,
      state: item.state,
      country: item.country,
      status: item.status,
      totalDonations: item.totalDonations,
      lastVisit: item.lastVisit,
      dob: item.dob || '',
      gender: item.gender || '',
      occupation: item.occupation || '',
      nakshatra: item.nakshatra || '',
      rasi: item.rasi || '',
      gothram: item.gothram || '',
      spouse: item.spouse || '',
      children: item.children || '',
      familyMembers: item.familyMembers || '',
      volunteerInterest: item.volunteerInterest || '',
      membershipType: item.membershipType || 'Regular Devotee',
      notificationSms: item.notificationSms ?? true,
      notificationEmail: item.notificationEmail ?? true,
      notificationWhatsApp: item.notificationWhatsApp ?? true,
      reminderBirthday: item.reminderBirthday ?? true,
      reminderNakshatra: item.reminderNakshatra ?? true,
      reminderFestivalGreetings: item.reminderFestivalGreetings ?? true,
      reminderDonationAnniversary: item.reminderDonationAnniversary ?? true,
    });
    setEditId(item.id);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editId) update(editId, form);
    else add(form as Omit<Devotee, 'id'>);
    setModalOpen(false);
  };

  const setFormField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const setFormToggleField = (key: string, val: boolean) => setForm(prev => ({ ...prev, [key]: val }));

  const openDrawer = (item: Devotee) => {
    setSelectedDevotee(item);
    setActiveTab('info');
    setNotifSent('');
    setNotifSubject('');
    setNotifMessage('');
    setChannels({ sms: true, email: true, whatsapp: true });
    setSelectedEvents(new Set());
    setFamilyMemberForm(emptyFamilyMemberForm);
    setFamilyFormOpen(false);
    setFamilyFullViewOpen(false);
    setCollapsedNodes(new Set());
    setHoveredMemberId(null);
    setDrawerOpen(true);
  };

  // Sync effect to ensure static mock data updates show up in development
  useEffect(() => {
    if (selectedDevotee && (!selectedDevotee.familyTreeMembers || selectedDevotee.familyTreeMembers.length === 0)) {
      const mockVer = (mockDevotees as any[]).find(d => d.id === selectedDevotee.id);
      if (mockVer && mockVer.familyTreeMembers && mockVer.familyTreeMembers.length > 0) {
        update(selectedDevotee.id, { familyTreeMembers: mockVer.familyTreeMembers });
      }
    }
  }, [selectedDevotee?.id, update]);

  const toggleEvent = (id: string) => {
    setSelectedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendNotification = async () => {
    if (!notifSubject.trim() || !notifMessage.trim()) return;
    if (!selectedDevotee) return;
    const enabledChannels = [channels.sms && 'SMS', channels.email && 'Email', channels.whatsapp && 'WhatsApp'].filter(Boolean);
    if (enabledChannels.length === 0) return;

    setNotifSending(true);
    const channelSummaries: string[] = [];

    if (channels.email) {
      if (!selectedDevotee.email?.trim()) {
        channelSummaries.push('Email skipped (no email address)');
      } else {
        try {
          const result = await sendCampaignEmails({
            subject: notifSubject.trim(),
            message: notifMessage.trim(),
            recipients: [{ name: selectedDevotee.name, email: selectedDevotee.email }],
          });

          if (result.sent > 0) {
            channelSummaries.push(`Email sent (${result.sent}/${result.attempted || 1})`);
          } else {
            const reason = result.errors[0] || 'unknown reason';
            channelSummaries.push(`Email failed (${reason})`);
          }
        } catch (error) {
          channelSummaries.push(`Email failed (${error instanceof Error ? error.message : 'unexpected error'})`);
        }
      }
    }

    if (channels.sms) channelSummaries.push('SMS queued');
    if (channels.whatsapp) channelSummaries.push('WhatsApp queued');

    const summary = channelSummaries.length ? channelSummaries.join(' | ') : 'No channel dispatched';
    setNotifSent(`Dispatch for ${selectedDevotee.name}: ${summary}`);
    setNotifSubject('');
    setNotifMessage('');
    setSelectedEvents(new Set());
    setNotifSending(false);
  };

  const applyReminderAutofill = (template: ReminderTemplateKey) => {
    if (!selectedDevotee) return;

    const devoteeName = selectedDevotee.name;
    const donationAmount = fmtAmt(selectedDevotee.totalDonations || 0);

    const templateMap: Record<ReminderTemplateKey, { subject: string; message: string }> = {
      birthday: {
        subject: `Birthday blessings for ${devoteeName}`,
        message: `Dear ${devoteeName},\n\nWarm birthday wishes from Temple Governance. May this year bring health, peace, and divine grace to you and your family.\n\nYou are always welcome to visit the temple for special blessings on your birthday.\n\nWith prayers,\nTemple Governance `,
      },
      nakshatra: {
        subject: `Nakshatra reminder for ${devoteeName}`,
        message: `Dear ${devoteeName},\n\nThis is a gentle reminder for your Nakshatra observance and pooja planning.\n\nIf you would like to book an archana or special seva for your star day, our team will be happy to assist.\n\nWith prayers,\nTemple Governance `,
      },
      festival: {
        subject: `Festival greetings from Temple Governance`,
        message: `Dear ${devoteeName},\n\nFestival greetings to you and your family from Temple Governance. May this sacred occasion bring prosperity, joy, and spiritual wellbeing.\n\nJoin us at the temple for upcoming celebrations and special sevas.\n\nWith prayers,\nTemple Governance `,
      },
      donationAnniversary: {
        subject: `Donation anniversary gratitude note`,
        message: `Dear ${devoteeName},\n\nThank you for your continued support and devotion to Temple Governance.\n\nOn your donation anniversary, we express our heartfelt gratitude for your contribution of ${donationAmount}. Your support helps us sustain temple services and community activities.\n\nWith gratitude and prayers,\nTemple Governance`,
      },
    };

    setNotifSubject(templateMap[template].subject);
    setNotifMessage(templateMap[template].message);
    setNotifSent('');
  };

  const devDonations = selectedDevotee ? mockDonations.filter(d => d.donorName === selectedDevotee.name) : [];
  const devBookings = selectedDevotee ? mockBookings.filter(b => b.devoteeName === selectedDevotee.name) : [];
  const devoteeProfile = selectedDevotee ? deriveDevoteeProfile(selectedDevotee, devDonations, devBookings) : null;

  const profileDob = selectedDevotee?.dob || devoteeProfile?.dateOfBirth || 'N/A';
  const profileGender = selectedDevotee?.gender || 'N/A';
  const profileOccupation = selectedDevotee?.occupation || 'N/A';
  const profileNakshatra = selectedDevotee?.nakshatra || 'N/A';
  const profileRasi = selectedDevotee?.rasi || 'N/A';
  const profileGothram = selectedDevotee?.gothram || 'N/A';
  const profileSpouse = selectedDevotee?.spouse || 'N/A';
  const profileChildren = selectedDevotee?.children || 'N/A';
  const profileVolunteerInterest = selectedDevotee?.volunteerInterest || 'N/A';
  const profileMembershipType = selectedDevotee?.membershipType || 'Regular Devotee';

  const familyMembersData = useMemo(() => {
    if (!selectedDevotee) return [] as FamilyMember[];
    const treeMembers = selectedDevotee.familyTreeMembers || [];
    const legacyMembers = buildLegacyFamilyMembers(selectedDevotee);

    // Combine and remove duplicates by name
    const combined = [...treeMembers];
    legacyMembers.forEach(lm => {
      if (!combined.some(c => c.name.toLowerCase() === lm.name.toLowerCase())) {
        combined.push(lm);
      }
    });
    return combined;
  }, [selectedDevotee]);

  const familyMembersByParent = useMemo(() => {
    return familyMembersData.reduce<Record<string, FamilyMember[]>>((acc, member) => {
      const key = member.parentId || 'root';
      if (!acc[key]) acc[key] = [];
      acc[key].push(member);
      return acc;
    }, {});
  }, [familyMembersData]);

  const familyNodeCount = familyMembersData.length;
  const toggleNodeCollapse = useCallback((id: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useFamilyConnectors(treeContainerRef, familyMembersData, collapsedNodes, selectedDevotee?.id);
  useFamilyConnectors(fullTreeRef, familyMembersData, collapsedNodes, familyFullViewOpen ? selectedDevotee?.id : 'closed');

  const persistFamilyMembers = (members: FamilyMember[]) => {
    if (!selectedDevotee) return;

    const normalizedMembers = members.map(member => ({
      ...member,
      parentId: member.parentId === 'root' ? null : (member.parentId || null),
    }));

    const familyMembersSummary = normalizedMembers
      .filter(member => member.relation.toLowerCase() !== 'spouse' && member.relation.toLowerCase() !== 'child')
      .map(member => `${member.relation}: ${member.name}`)
      .join(', ');
    const spouseMember = normalizedMembers.find(member => member.relation.toLowerCase() === 'spouse');
    const childrenSummary = normalizedMembers
      .filter(member => member.relation.toLowerCase() === 'child')
      .map(member => member.name)
      .join(', ');

    update(selectedDevotee.id, {
      familyTreeMembers: normalizedMembers as any,
      familyMembers: familyMembersSummary,
      spouse: spouseMember?.name || selectedDevotee.spouse || '',
      children: childrenSummary || selectedDevotee.children || '',
    });
  };

  const openAddFamilyMember = () => {
    setFamilyFullViewOpen(false);
    setFamilyMemberForm(emptyFamilyMemberForm);
    setFamilyFormOpen(true);
  };

  const openEditFamilyMember = (member: FamilyMember) => {
    setFamilyFullViewOpen(false);
    setFamilyMemberForm({
      id: member.id,
      name: member.name,
      relation: member.relation,
      dob: member.dob || '',
      gender: member.gender || '',
      occupation: member.occupation || '',
      phone: member.phone || '',
      rasi: member.rasi || '',
      nakshatra: member.nakshatra || '',
      parentId: member.parentId || 'root',
      isPrimary: member.isPrimary === true,
    });
    setFamilyFormOpen(true);
  };

  const saveFamilyMember = () => {
    if (!familyMemberForm.name.trim() || !familyMemberForm.relation.trim()) return;

    const payload: FamilyMember = {
      id: familyMemberForm.id || crypto.randomUUID(),
      name: familyMemberForm.name.trim(),
      relation: familyMemberForm.relation.trim(),
      dob: familyMemberForm.dob || undefined,
      gender: familyMemberForm.gender || undefined,
      occupation: familyMemberForm.occupation || undefined,
      phone: familyMemberForm.phone || undefined,
      rasi: familyMemberForm.rasi || undefined,
      nakshatra: familyMemberForm.nakshatra || undefined,
      parentId: familyMemberForm.parentId === 'root' ? null : familyMemberForm.parentId,
      isPrimary: familyMemberForm.isPrimary,
    };

    const withoutCurrent = familyMembersData.filter(member => member.id !== payload.id).map(member => ({
      ...member,
      isPrimary: payload.isPrimary ? false : member.isPrimary,
    }));
    const nextMembers = [payload, ...withoutCurrent];
    persistFamilyMembers(nextMembers);
    setFamilyMemberForm(emptyFamilyMemberForm);
    setFamilyFormOpen(false);
  };

  const removeFamilyMember = (memberId: string) => {
    const nextMembers = familyMembersData
      .filter(member => member.id !== memberId)
      .map(member => member.parentId === memberId ? { ...member, parentId: null } : member);
    persistFamilyMembers(nextMembers);
  };

  const relationPriority = (relation: string) => {
    const normalized = relation.trim().toLowerCase();
    const table: Record<string, number> = {
      spouse: 1,
      father: 2,
      mother: 3,
      brother: 4,
      sister: 5,
      son: 6,
      daughter: 7,
      child: 8,
      family: 9,
    };
    return table[normalized] ?? 50;
  };

  const openAddRelatedMember = (parentId: string, relation = 'Child') => {
    setFamilyFullViewOpen(false);
    setFamilyMemberForm({
      ...emptyFamilyMemberForm,
      relation,
      parentId,
    });
    setFamilyFormOpen(true);
  };

  const renderFamilyNodesNew = (parentId: string, depth = 0): React.ReactNode => {
    const nodes = [...(familyMembersByParent[parentId] || [])]
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        const priorityDelta = relationPriority(a.relation) - relationPriority(b.relation);
        if (priorityDelta !== 0) return priorityDelta;
        return a.name.localeCompare(b.name);
      });
    if (!nodes.length) return null;

    return (
      <div className="ftree-tier" style={{ animationDelay: `${depth * 0.06}s` }}>
        {nodes.map((member, idx) => {
          const col = getRelColor(member.relation);
          const hasChildren = (familyMembersByParent[member.id]?.length ?? 0) > 0;
          const isCollapsed = collapsedNodes.has(member.id);
          const animDelay = `${depth * 0.06 + idx * 0.04}s`;
          return (
            <div key={member.id} className="ftree-item">
              <div
                className="ftree-node"
                data-ftree-id={member.id}
                data-rel={member.relation.toLowerCase().trim()}
                style={{ animationDelay: animDelay }}
                onMouseEnter={() => {
                  setHoveredMemberId(member.id);
                }}
                onMouseLeave={() => {
                  setHoveredMemberId(prev => (prev === member.id ? null : prev));
                }}
              >
                <div className="ftree-rel-badge">{member.relation}</div>

                {member.isPrimary && (
                  <div className="ftree-crown">
                    <Crown className="h-3.5 w-3.5" style={{ color: col.rc }} />
                  </div>
                )}

                <div className="ftree-name" title={member.name}>{member.name}</div>

                <div className="ftree-meta">
                  {member.dob && <p>DOB <span>{fmtDate(member.dob)}</span></p>}
                  {member.gender && <p>Gender <span>{member.gender}</span></p>}
                  {member.occupation && <p className="ftree-meta-full">Works as <span>{member.occupation}</span></p>}
                  {member.phone && <p>Phone <span>{member.phone}</span></p>}
                  {member.rasi && <p>Rasi <span>{member.rasi}</span></p>}
                  {member.nakshatra && <p>Star <span>{member.nakshatra}</span></p>}
                </div>

                <div className={`ftree-actions ${hoveredMemberId === member.id ? 'ftree-actions-visible' : ''}`}>
                  <button className="ftree-act" onClick={e => { e.stopPropagation(); openAddRelatedMember(member.id, 'Child'); }}>
                    + Child
                  </button>
                  <button className="ftree-act" onClick={e => { e.stopPropagation(); openEditFamilyMember(member); }}>
                    Edit
                  </button>
                  <button className="ftree-act ftree-act-del" onClick={e => { e.stopPropagation(); removeFamilyMember(member.id); }}>
                    Remove
                  </button>
                </div>

                {hasChildren && (
                  <div className="ftree-toggle" title={isCollapsed ? 'Expand children' : 'Collapse children'} onClick={e => { e.stopPropagation(); toggleNodeCollapse(member.id); }}>
                    {isCollapsed ? '+' : '-'}
                  </div>
                )}
              </div>

              {!isCollapsed && renderFamilyNodesNew(member.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const profileNotificationPrefs = [
    selectedDevotee?.notificationSms !== false && 'SMS',
    selectedDevotee?.notificationEmail !== false && 'Email',
    selectedDevotee?.notificationWhatsApp !== false && 'WhatsApp',
  ].filter(Boolean).join(', ') || 'No channels selected';

  const profileReminderPrefs = [
    selectedDevotee?.reminderBirthday !== false && 'Birthday reminders',
    selectedDevotee?.reminderNakshatra !== false && 'Nakshatra reminders',
    selectedDevotee?.reminderFestivalGreetings !== false && 'Festival greetings',
    selectedDevotee?.reminderDonationAnniversary !== false && 'Donation anniversary reminders',
  ].filter(Boolean).join(', ') || 'No reminders selected';

  return (
    <div className="devotees-premium max-w-[1500px] mx-auto animate-fade-in pb-8">
      <div className="devotees-header flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5 px-5 py-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Devotees</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage devotee records, analyze donation trends, and coordinate engagements.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={openAdd} className="devotees-cta shadow-sm"><Plus className="h-4 w-4 mr-2" />Add Devotee</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <div className="stat-card devotees-stat-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Total Members</p>
          <p className="text-2xl font-bold mt-2 text-foreground">{totalDevotees.toLocaleString()}</p>
        </div>
        <div className="stat-card devotees-stat-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Active Members</p>
          <p className="text-2xl font-bold mt-2 text-primary">{activeDevotees.toLocaleString()}</p>
        </div>
        <div className="stat-card devotees-stat-card">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5"><HeartHandshake className="w-3.5 h-3.5" /> Major Donors</p>
          <p className="text-2xl font-bold mt-2 text-foreground">{majorDonors.toLocaleString()}</p>
        </div>
        <div className="stat-card devotees-stat-card border-primary/20 bg-primary/5">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Visited this Month</p>
          <p className="text-2xl font-bold mt-2 text-primary">{recentVisits.toLocaleString()}</p>
        </div>
      </div>

      <div className="devotees-table-shell bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden flex flex-col relative z-10 mt-4">
        <div className="devotees-table-toolbar p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="relative max-w-sm w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="devotees-search-input w-full pl-9 pr-4 h-9 rounded-md border border-input bg-background text-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm"
                placeholder="Search by name, phone, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <span className="devotees-record-chip text-sm font-medium text-muted-foreground whitespace-nowrap bg-muted px-2.5 py-1 rounded-md border border-border/50 shadow-sm">{filtered.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-muted-foreground">Devotee Name</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Contact Info</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Location</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Last Visit Date</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground font-medium">No results found for your search.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="devotees-row border-b border-border/60 cursor-pointer transition-colors hover:bg-muted/40 group" onClick={() => openDrawer(d)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="devotees-avatar-chip w-9 h-9 rounded-full bg-primary/20 text-foreground flex items-center justify-center text-xs font-bold shrink-0 border border-primary/30 shadow-sm">
                        {getInitials(d.name)}
                      </div>
                      <p className="devotees-row-name font-semibold text-foreground group-hover:text-primary transition-colors">{d.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <p className="font-semibold text-foreground text-xs">{d.phone}</p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{d.email}</p>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    <span className="font-semibold">{d.city}</span>{d.state && `, ${d.state}`}
                  </td>
                  <td className="p-4"><StatusBadge status={d.status} /></td>
                  <td className="p-4 text-muted-foreground text-xs font-medium">
                    <div className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-60" /> {fmtDate(d.lastVisit)}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/80 hover:text-foreground text-muted-foreground" onClick={e => openEdit(e, d)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground" onClick={e => { e.stopPropagation(); setDeleteId(d.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Devotee Details' : 'Add New Devotee'}>
        <div className="devotees-form-shell space-y-4 px-1 py-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Section 1: Contact Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" value={form.name} onChange={v => setFormField('name', v)} required />
            <FormField label="Phone Number" value={form.phone} onChange={v => setFormField('phone', v)} placeholder="+91" />
          </div>
          <FormField label="Email Address" value={form.email} onChange={v => setFormField('email', v)} type="email" placeholder="email@example.com" />
          <FormField label="Street Address" value={form.address} onChange={v => setFormField('address', v)} placeholder="Plot, Street, Area" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="City" value={form.city} onChange={v => setFormField('city', v)} />
            <FormField label="State" value={form.state} onChange={v => setFormField('state', v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Country" value={form.country} onChange={v => setFormField('country', v)} />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Status</label>
              <select value={form.status} onChange={e => setFormField('status', e.target.value)} className="devotees-form-select w-full h-10 rounded-md border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Section 2: Personal Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="DOB" value={form.dob} onChange={v => setFormField('dob', v)} type="date" />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Gender</label>
              <select value={form.gender} onChange={e => setFormField('gender', e.target.value)} className="devotees-form-select w-full h-10 rounded-md border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <FormField label="Occupation" value={form.occupation} onChange={v => setFormField('occupation', v)} placeholder="Teacher, Engineer..." />
          </div>

          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Section 3: Spiritual Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Nakshatra" value={form.nakshatra} onChange={v => setFormField('nakshatra', v)} />
            <FormField label="Rasi" value={form.rasi} onChange={v => setFormField('rasi', v)} />
            <FormField label="Gothram" value={form.gothram} onChange={v => setFormField('gothram', v)} />
          </div>

          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Section 4: Family Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Spouse" value={form.spouse} onChange={v => setFormField('spouse', v)} />
            <FormField label="Children" value={form.children} onChange={v => setFormField('children', v)} placeholder="Names (comma separated) or count" />
          </div>

          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Section 5: Family Relationship Map</h3>
          <FormField label="Hierarchy Members" value={form.familyMembers} onChange={v => setFormField('familyMembers', v)} placeholder="Father: Raghavan, Mother: Lakshmi, Brother: Karthik" textarea />
          <p className="text-[11px] text-muted-foreground -mt-2">Use format Relation: Name for each member, separated by commas.</p>

          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Section 6: Engagement Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Volunteer Interest</label>
              <select value={form.volunteerInterest} onChange={e => setFormField('volunteerInterest', e.target.value)} className="devotees-form-select w-full h-10 rounded-md border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="">Select</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
                <option>Not Interested</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Membership Type</label>
              <select value={form.membershipType} onChange={e => setFormField('membershipType', e.target.value)} className="devotees-form-select w-full h-10 rounded-md border border-input bg-background px-3 text-sm transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option>Trust Member</option>
                <option>Committee Member</option>
                <option>Volunteer</option>
                <option>Donor</option>
                <option>VIP Devotee</option>
                <option>Regular Devotee</option>
                <option>Staff Member</option>
              </select>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Section 7: Preferences</h3>
          <div className="space-y-4 rounded-xl border border-border/60 p-4 bg-muted/10">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notifications toggles</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={form.notificationSms} onChange={e => setFormToggleField('notificationSms', e.target.checked)} className="h-4 w-4 accent-primary" /> SMS
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={form.notificationEmail} onChange={e => setFormToggleField('notificationEmail', e.target.checked)} className="h-4 w-4 accent-primary" /> Email
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={form.notificationWhatsApp} onChange={e => setFormToggleField('notificationWhatsApp', e.target.checked)} className="h-4 w-4 accent-primary" /> WhatsApp
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Auto reminders (CRM)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={form.reminderBirthday} onChange={e => setFormToggleField('reminderBirthday', e.target.checked)} className="h-4 w-4 accent-primary" /> Birthday reminders
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={form.reminderNakshatra} onChange={e => setFormToggleField('reminderNakshatra', e.target.checked)} className="h-4 w-4 accent-primary" /> Nakshatra reminders
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={form.reminderFestivalGreetings} onChange={e => setFormToggleField('reminderFestivalGreetings', e.target.checked)} className="h-4 w-4 accent-primary" /> Festival greetings
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={form.reminderDonationAnniversary} onChange={e => setFormToggleField('reminderDonationAnniversary', e.target.checked)} className="h-4 w-4 accent-primary" /> Donation anniversary reminders
                </label>
              </div>
            </div>
          </div>

          <div className="devotees-form-actions flex gap-3 pt-5 border-t border-border/60">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 shadow-sm">Save Details</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Devotee Account" message="Are you sure you want to permanently delete this devotee account? Related history and logs might be retained for audit purposes." />

      {drawerOpen && createPortal(
        <div className="fixed inset-0 z-[90] flex items-center justify-end" onClick={() => setDrawerOpen(false)}>
          <div className="devotees-drawer-overlay absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity" />
          <div className="devotees-drawer relative h-[100vh] w-full max-w-[600px] bg-background shadow-[0_0_60px_rgba(0,0,0,0.3)] flex flex-col animate-slide-in-right overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* Header / Profile Hero */}
            <div className="devotees-drawer-hero px-6 py-8 border-b border-border/80 flex-shrink-0 relative">
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-9 w-9 rounded-full bg-background border border-border/60 hover:bg-muted text-muted-foreground shadow-sm" onClick={() => setDrawerOpen(false)}><X className="h-5 w-5" /></Button>

              <div className="flex items-center gap-5">
                <div className="devotees-drawer-avatar w-20 h-20 rounded-full bg-primary/20 border-4 border-card shadow-lg flex items-center justify-center text-foreground font-display font-bold text-3xl shrink-0">
                  {selectedDevotee && getInitials(selectedDevotee.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="text-2xl font-bold font-display text-foreground leading-tight tracking-tight">{selectedDevotee?.name}</h2>
                    {selectedDevotee && (() => {
                      const tier = getDonationTier(selectedDevotee.totalDonations);
                      const TierIcon = tier.icon;
                      return (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${tier.color}`}>
                          <TierIcon className={`h-3 w-3 ${tier.fill}`} />
                          {tier.label}
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {selectedDevotee?.city}, {selectedDevotee?.state}</p>
                  <div className="flex gap-2 mt-3 items-center">
                    <StatusBadge status={selectedDevotee?.status || 'Active'} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shadow-sm flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {selectedDevotee?.membershipType || 'Regular Devotee'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-8">
                <div className="devotees-drawer-stat bg-card rounded-xl p-4 border border-border/60 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-[3px] bg-emerald-500" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Total Donations</p>
                  <p className="text-xl font-bold text-foreground font-display">{fmtAmt(selectedDevotee?.totalDonations ?? 0)}</p>
                </div>
                <div className="devotees-drawer-stat bg-card rounded-xl p-4 border border-border/60 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-[3px] bg-primary" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Donations</p>
                  <p className="text-xl font-bold text-foreground font-display">{devDonations.length}</p>
                </div>
                <div className="devotees-drawer-stat bg-card rounded-xl p-4 border border-border/60 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-[3px] bg-secondary" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Bookings</p>
                  <p className="text-xl font-bold text-foreground font-display">{devBookings.length}</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="devotees-drawer-tabs flex p-4 px-6 border-b border-border/60 gap-3 shrink-0 bg-background">
              {([{ key: 'info', label: 'Info' }, { key: 'donations', label: 'Donations', count: devDonations.length }, { key: 'bookings', label: 'Bookings', count: devBookings.length }, { key: 'family', label: 'Lineage', count: familyNodeCount }, { key: 'notify', label: 'Message' }] as Array<{ key: TabName; label: string; count?: number }>).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`devotees-drawer-tab flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-bold rounded-xl transition-all border-2 active:scale-[0.98] ${activeTab === tab.key ? 'devotees-drawer-tab-active bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 transform scale-105' : 'bg-background text-muted-foreground border-input hover:border-primary/40 hover:bg-muted/30 hover:text-foreground'}`}
                >
                  <span className="truncate">{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[11px] font-extrabold ${activeTab === tab.key ? 'bg-background/25 text-white' : 'bg-muted border border-border text-muted-foreground'}`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto bg-card relative">
              {activeTab === 'info' && selectedDevotee && (
                <div className="p-6 space-y-8 pb-10 animate-fade-in">
                  {/* Contact Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Direct Contact</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background shadow-sm group hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 group-hover:scale-110 transition-transform"><Phone className="w-4 h-4 text-foreground" /></div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Mobile Contact</p>
                          <p className="text-sm font-bold mt-0.5 text-foreground">{selectedDevotee.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background shadow-sm group hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 group-hover:scale-110 transition-transform"><Mail className="w-4 h-4 text-foreground" /></div>
                        <div className="min-w-0">
                          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Email Address</p>
                          <p className="text-sm font-bold mt-0.5 truncate text-foreground">{selectedDevotee.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background shadow-sm group hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30 mt-1 group-hover:scale-110 transition-transform"><MapPin className="w-4 h-4 text-foreground" /></div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Registered Address</p>
                          <p className="text-sm font-medium mt-1 leading-relaxed text-foreground">{selectedDevotee.address || 'Address not listed'}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-1.5 bg-muted/50 px-2 py-0.5 rounded border border-border inline-block">{selectedDevotee.city}{selectedDevotee.state && `, ${selectedDevotee.state}`} {selectedDevotee.country && ` - ${selectedDevotee.country}`}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Demographics Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Profile Meta</h3>
                    <div className="bg-muted/10 rounded-2xl border border-border/60 p-1">
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2"><Calendar className={profileMetaIconClass} /> Date of Birth</span>
                        <span className="text-sm font-bold text-foreground">{profileDob ? fmtDate(profileDob) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Gender</span>
                        <span className="text-xs font-bold text-foreground bg-background px-2.5 py-1 rounded shadow-sm border border-border">{profileGender}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Occupation</span>
                        <span className="text-xs font-bold text-foreground max-w-[180px] break-words text-right">{profileOccupation}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2"><Users className={profileMetaIconClass} /> Joint Date</span>
                        <span className="text-xs font-bold text-foreground bg-background px-2.5 py-1 rounded shadow-sm border border-border">{devoteeProfile?.memberSince ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center p-4">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2"><HeartHandshake className={profileMetaIconClass} /> Preferred Seva</span>
                        <span className="text-xs font-bold text-foreground max-w-[180px] break-words text-right">{devoteeProfile?.preferredSeva}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Spiritual & Family</h3>
                    <div className="bg-muted/10 rounded-2xl border border-border/60 p-1">
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Nakshatra</span>
                        <span className="text-xs font-bold text-foreground">{profileNakshatra}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Rasi</span>
                        <span className="text-xs font-bold text-foreground">{profileRasi}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Gothram</span>
                        <span className="text-xs font-bold text-foreground">{profileGothram}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Spouse</span>
                        <span className="text-xs font-bold text-foreground">{profileSpouse}</span>
                      </div>
                      <div className="flex justify-between items-center p-4">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Children</span>
                        <span className="text-xs font-bold text-foreground">{profileChildren}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Engagement & Reminders</h3>
                    <div className="bg-muted/10 rounded-2xl border border-border/60 p-1">
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Volunteer Interest</span>
                        <span className="text-xs font-bold text-foreground">{profileVolunteerInterest}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 border-b border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Membership Type</span>
                        <span className="text-xs font-bold text-foreground">{profileMembershipType}</span>
                      </div>
                      <div className="p-4 border-b border-border/40">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1.5">Notification Channels</p>
                        <p className="text-xs font-bold text-foreground leading-relaxed">{profileNotificationPrefs}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1.5">Auto Reminder Setup</p>
                        <p className="text-xs font-bold text-foreground leading-relaxed">{profileReminderPrefs}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'family' && selectedDevotee && (
                <div className="p-6 space-y-5 pb-10 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Family Hierarchy</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{familyNodeCount} member{familyNodeCount !== 1 ? 's' : ''} linked</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="h-8 px-3 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors" onClick={() => openAddRelatedMember('root', 'Child')}>+ Child</button>
                      <button className="h-8 px-3 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors" onClick={openAddFamilyMember}>+ Add Member</button>
                      <button className="h-8 px-3 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={() => setFamilyFullViewOpen(true)}>Full View</button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-muted/30 p-5 shadow-sm overflow-auto">
                    <div ref={treeContainerRef} className="min-w-max mx-auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="ftree-root-node">
                        <div className="ftree-root-label">Primary Devotee</div>
                        <div className="ftree-root-name">{selectedDevotee.name}</div>
                        <div className="ftree-root-sub">
                          {selectedDevotee.city}
                          {selectedDevotee.state && `, ${selectedDevotee.state}`}
                          {selectedDevotee.membershipType && ` · ${selectedDevotee.membershipType}`}
                        </div>
                        {(selectedDevotee.rasi || selectedDevotee.nakshatra) && (
                          <div className="mt-2 pt-2 border-t border-primary/20 flex flex-col items-center gap-1">
                            {selectedDevotee.rasi && <p className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Rasi: {selectedDevotee.rasi}</p>}
                            {selectedDevotee.nakshatra && <p className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Star: {selectedDevotee.nakshatra}</p>}
                          </div>
                        )}
                      </div>

                      {familyMembersData.length > 0 ? (
                        renderFamilyNodesNew('root', 0)
                      ) : (
                        <div className="ftree-empty mt-12 w-64">
                          <p className="text-xs font-semibold text-muted-foreground">No members added yet</p>
                          <p className="text-[11px] text-muted-foreground mt-1">Click Add Member to start building the family tree.</p>
                        </div>
                      )}
                    </div>

                    {familyMembersData.length > 0 && (
                      <div className="ftree-legend mt-4">
                        {Array.from(new Map(familyMembersData.map(m => [m.relation.toLowerCase().trim(), { rel: m.relation, col: getRelColor(m.relation) }])).values()).map(({ rel, col }) => (
                          <div key={rel} className="ftree-legend-item">
                            <div className="ftree-legend-dot" style={{ background: col.rc, opacity: 0.75 }} />
                            {rel}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {activeTab === 'donations' && (
                <div className="p-6 space-y-4 animate-fade-in bg-muted/5 min-h-full">
                  {devDonations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><HeartHandshake className="w-8 h-8 text-muted-foreground/40" /></div>
                      <p className="text-base font-bold text-foreground">No Donations Found</p>
                      <p className="text-sm text-muted-foreground mt-1">There are no financial logs for this devotee.</p>
                    </div>
                  ) : devDonations.map(dn => (
                    <div key={dn.id} className="rounded-xl border border-border/80 bg-background p-5 shadow-sm hover:border-success/35 transition-all hover:shadow-md relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-success/15 to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <p className="text-sm font-bold text-foreground">{dn.category}</p>
                          <p className="text-xs font-mono font-semibold text-muted-foreground mt-1 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> ID: {dn.id}</p>
                        </div>
                        <p className="text-2xl font-bold font-display text-success">{fmtAmt(dn.amount)}</p>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/40 relative z-10">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded"><Calendar className="w-3.5 h-3.5" />{fmtDate(dn.date)}</span>
                        <span className="text-[10px] uppercase font-bold text-success bg-success/15 px-2 py-1 rounded border border-success/25">{dn.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="p-6 space-y-4 animate-fade-in bg-muted/5 min-h-full">
                  {devBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><History className="w-8 h-8 text-muted-foreground/40" /></div>
                      <p className="text-base font-bold text-foreground">No Services Booked</p>
                      <p className="text-sm text-muted-foreground mt-1">There are no service bookings or history.</p>
                    </div>
                  ) : devBookings.map(bk => (
                    <div key={bk.id} className="rounded-xl border border-border/80 bg-background p-5 shadow-sm hover:border-primary/35 transition-all hover:shadow-md relative overflow-hidden grid">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/25" />
                      <div className="flex justify-between items-start mb-4 relative z-10 pl-2">
                        <p className="text-sm font-bold text-foreground max-w-[70%] leading-relaxed">{bk.serviceName}</p>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${bookingBadgeClass(bk.bookingStatus)}`}>{bk.bookingStatus}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-4 border-t border-border/40 relative z-10 pl-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded"><Calendar className="w-3.5 h-3.5" />{fmtDate(bk.date)}</span>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-foreground/75" />{bk.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notify' && selectedDevotee && (
                <div className="p-6 space-y-6 pb-[100px] animate-fade-in">
                  <div className="space-y-4 border border-border/60 bg-background p-5 rounded-xl shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground pb-2">Delivery Channels</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => setChannels(p => ({ ...p, sms: !p.sms }))} className={`flex flex-col items-center justify-center gap-2.5 p-3 rounded-lg font-bold transition-all border-2 ${channels.sms ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-background border-border text-muted-foreground hover:bg-muted/40'}`}>
                        <MessageSquare className="w-5 h-5" /> <span className="text-[10px]">SMS</span>
                      </button>
                      <button onClick={() => setChannels(p => ({ ...p, email: !p.email }))} className={`flex flex-col items-center justify-center gap-2.5 p-3 rounded-lg font-bold transition-all border-2 ${channels.email ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-background border-border text-muted-foreground hover:bg-muted/40'}`}>
                        <Mail className="w-5 h-5" /> <span className="text-[10px]">EMAIL</span>
                      </button>
                      <button onClick={() => setChannels(p => ({ ...p, whatsapp: !p.whatsapp }))} className={`flex flex-col items-center justify-center gap-2.5 p-3 rounded-lg font-bold transition-all border-2 ${channels.whatsapp ? 'bg-success/15 text-success border-success/25 shadow-sm' : 'bg-background border-border text-muted-foreground hover:bg-muted/40'}`}>
                        <MessageCircle className="w-5 h-5" /> <span className="text-[10px]">WHATSAPP</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 border border-border/60 bg-background p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Message Autofill</h3>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">Reminder Templates</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <button
                        onClick={() => applyReminderAutofill('birthday')}
                        className="text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all border bg-background border-border text-foreground hover:bg-muted/30 hover:border-primary/40"
                      >
                        Birthday reminders
                      </button>
                      <button
                        onClick={() => applyReminderAutofill('nakshatra')}
                        className="text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all border bg-background border-border text-foreground hover:bg-muted/30 hover:border-primary/40"
                      >
                        Nakshatra reminders
                      </button>
                      <button
                        onClick={() => applyReminderAutofill('festival')}
                        className="text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all border bg-background border-border text-foreground hover:bg-muted/30 hover:border-primary/40"
                      >
                        Festival greetings
                      </button>
                      <button
                        onClick={() => applyReminderAutofill('donationAnniversary')}
                        className="text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all border bg-background border-border text-foreground hover:bg-muted/30 hover:border-primary/40"
                      >
                        Donation anniversary reminders
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 border border-border/60 bg-background p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Attach Events</h3>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">Optional</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mockEvents.map(ev => (
                        <button key={ev.id} onClick={() => toggleEvent(ev.id)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedEvents.has(ev.id) ? 'bg-muted border-foreground/30 text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]' : 'bg-background border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30'}`}>
                          {ev.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground px-1">Message Detail</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Subject / Header</label>
                        <input value={notifSubject} onChange={e => setNotifSubject(e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background/50 hover:bg-background px-4 text-sm font-semibold transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none shadow-sm" placeholder="Subject line..." />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5 px-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notification Body</label>
                          <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase bg-muted/60 border border-border/50 px-2 py-0.5 rounded shadow-sm">{notifMessage.length} characters</span>
                        </div>
                        <textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)} className="w-full rounded-xl border border-input bg-background/50 hover:bg-background p-5 text-base min-h-[220px] resize-y transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none shadow-sm placeholder:text-muted-foreground/60 leading-7 font-medium" placeholder={`Type your message...`} />
                      </div>
                    </div>

                    {notifSent && (
                      <div className="p-4 rounded-xl bg-success/15 border border-success/25 text-success text-sm font-bold text-center shadow-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> {notifSent}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            {activeTab === 'notify' && (
              <div className="absolute bottom-0 left-0 w-full p-5 bg-card/90 backdrop-blur-md border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <Button className="w-full h-12 text-sm font-bold rounded-xl shadow-lg border-b-4 border-black/10 active:border-b-0 active:translate-y-1 transition-all" onClick={sendNotification} disabled={notifSending || !notifSubject.trim() || !notifMessage.trim() || (!channels.sms && !channels.email && !channels.whatsapp)}>
                  {notifSending ? 'Dispatching...' : `Execute Dispatch (${Number(channels.sms) + Number(channels.email) + Number(channels.whatsapp)} Routes)`}
                </Button>
              </div>
            )}

          </div>
        </div>,
        document.body,
      )}

      <Modal
        open={familyFormOpen}
        onClose={() => { setFamilyMemberForm(emptyFamilyMemberForm); setFamilyFormOpen(false); }}
        title={familyMemberForm.id ? 'Edit Family Member' : 'Add Family Member'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField label="Member Name" value={familyMemberForm.name} onChange={v => setFamilyMemberForm(prev => ({ ...prev, name: v }))} />
            <FormField label="Relation" value={familyMemberForm.relation} onChange={v => setFamilyMemberForm(prev => ({ ...prev, relation: v }))} placeholder="Father, Mother, Sibling..." />
            <FormField label="Date of Birth" value={familyMemberForm.dob} onChange={v => setFamilyMemberForm(prev => ({ ...prev, dob: v }))} type="date" />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Gender</label>
              <select value={familyMemberForm.gender} onChange={e => setFamilyMemberForm(prev => ({ ...prev, gender: e.target.value }))} className="devotees-form-select w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <FormField label="Occupation" value={familyMemberForm.occupation} onChange={v => setFamilyMemberForm(prev => ({ ...prev, occupation: v }))} />
            <FormField label="Phone" value={familyMemberForm.phone} onChange={v => setFamilyMemberForm(prev => ({ ...prev, phone: v }))} />
            <FormField label="Rasi" value={familyMemberForm.rasi} onChange={v => setFamilyMemberForm(prev => ({ ...prev, rasi: v }))} />
            <FormField label="Nakshatra" value={familyMemberForm.nakshatra} onChange={v => setFamilyMemberForm(prev => ({ ...prev, nakshatra: v }))} />
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Parent Node</label>
              <select value={familyMemberForm.parentId} onChange={e => setFamilyMemberForm(prev => ({ ...prev, parentId: e.target.value }))} className="devotees-form-select w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="root">Primary Devotee</option>
                {familyMembersData.filter(member => member.id !== familyMemberForm.id).map(member => (
                  <option key={member.id} value={member.id}>{member.relation}: {member.name}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" checked={familyMemberForm.isPrimary} onChange={e => setFamilyMemberForm(prev => ({ ...prev, isPrimary: e.target.checked }))} className="h-4 w-4 accent-primary" />
            Mark as primary family member
          </label>

          <div className="flex gap-2 pt-2">
            <Button onClick={saveFamilyMember}>Save Member</Button>
            <Button variant="outline" onClick={() => { setFamilyMemberForm(emptyFamilyMemberForm); setFamilyFormOpen(false); }}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {familyFullViewOpen && selectedDevotee && !familyFormOpen && createPortal(
        <div className="modal-overlay z-[120]" onClick={() => setFamilyFullViewOpen(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-[min(94vw,1200px)] h-[min(90vh,850px)] border border-border/60 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border/70">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Hierarchy View</p>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{selectedDevotee.name} Family Tree</h3>
              </div>
              <Button variant="outline" onClick={() => setFamilyFullViewOpen(false)}>
                <X className="h-4 w-4 mr-1" /> Close
              </Button>
            </div>

            <div className="p-6 overflow-auto h-[calc(100%-77px)]">
              <div ref={fullTreeRef} className="min-w-max mx-auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="ftree-root-node mb-2">
                  <div className="ftree-root-label">Primary Devotee</div>
                  <div className="ftree-root-name">{selectedDevotee.name}</div>
                  <div className="ftree-root-sub">Total linked members: {familyNodeCount}</div>
                </div>

                {familyMembersData.length > 0 ? (
                  renderFamilyNodesNew('root', 0)
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-background px-3 py-8 text-center">
                    <p className="text-sm font-semibold text-muted-foreground">No hierarchy members added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default DevoteesPage;
