import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Building2, Save, Settings as SettingsIcon, LogOut, ShieldCheck, Database, Bell } from 'lucide-react';

const SettingsPage: React.FC = () => {
   const { user, logout } = useAuth();

   return (
      <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in">
         <div className="page-header-banner bg-gradient-to-r from-slate-100 via-background to-slate-50">
            <div>
               <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-slate-600" /> Preference & Configuration</h1>
               <p className="text-sm text-muted-foreground mt-1">Manage user session, temple institution details, and system preferences.</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" className="shadow-sm border-border/80"><Save className="h-4 w-4 mr-2" />Save Settings</Button>
               <Button variant="outline" onClick={logout} className="shadow-sm border-rose-200 text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4 mr-2" />End Session</Button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">

            {/* Profile Card */}
            <section className="section-panel shadow-sm">
               <div className="section-panel-header gap-3 border-b border-border/60 pb-3 bg-gradient-to-b from-blue-50/50 to-background">
                  <h2 className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-blue-600" /> Active Session Profile</h2>
               </div>
               <div className="p-5 flex flex-col items-center border-b border-border/40 pb-6 pt-8">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-background shadow-sm mb-3">
                     <span className="text-3xl font-display font-bold text-blue-700">{user?.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                  <span className="mt-3 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
                     {user?.role} Access
                  </span>
               </div>
               <div className="p-5 space-y-1">
                  <div className="flex justify-between items-center py-2.5 border-b border-border/60">
                     <span className="text-sm text-muted-foreground font-medium">Session Active</span>
                     <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Secure</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                     <span className="text-sm text-muted-foreground font-medium">Last Login</span>
                     <span className="text-sm font-medium text-foreground">Just now</span>
                  </div>
               </div>
            </section>

            <section className="section-panel shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />
               <div className="section-panel-header gap-3 border-b border-border/60 pb-3 bg-gradient-to-b from-amber-50/50 to-background">
                  <h2 className="text-sm font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-amber-600" /> Institution Identity</h2>
               </div>
               <div className="p-5 space-y-4 relative z-10">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered Trust Name</label>
                     <input className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all focus:ring-2 focus:ring-amber-500/20 outline-none shadow-sm font-semibold" defaultValue="OMG Temple Foundation" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Contact Email</label>
                     <input className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all focus:ring-2 focus:ring-amber-500/20 outline-none shadow-sm font-medium" defaultValue="admin@omgtemple.org" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Address</label>
                     <textarea className="w-full min-h-[80px] p-3 rounded-lg border border-input bg-background/80 hover:border-border text-sm transition-all focus:ring-2 focus:ring-amber-500/20 outline-none shadow-sm font-medium resize-none" defaultValue="Temple Road, Inner Circle\nDivine District, 403001" />
                  </div>
               </div>
            </section>

            <section className="section-panel shadow-sm">
               <div className="section-panel-header gap-3 border-b border-border/60 pb-3 bg-gradient-to-b from-slate-100/50 to-background">
                  <h2 className="text-sm font-semibold flex items-center gap-2"><Database className="w-4 h-4 text-slate-600" /> System Properties</h2>
               </div>
               <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                     <div>
                        <p className="font-semibold text-sm text-foreground">Operating Version</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">ERP v1.0 Enterprise</p>
                     </div>
                     <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-widest">Up to Date</span>
                  </div>

                  <div className="space-y-1.5 pt-2">
                     <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Database Backup Target</label>
                     <select className="w-full h-11 rounded-lg border border-input bg-background/80 hover:border-border px-3 text-sm transition-all outline-none shadow-sm font-medium">
                        <option>AWS Regional (Asia Pacific)</option>
                        <option>Local Mirror Sync</option>
                     </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4 cursor-pointer group">
                     <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Bell className="w-5 h-5 opacity-70" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-foreground">Notification Preferences</p>
                        <p className="text-xs text-muted-foreground font-medium">Configure email and push alerts</p>
                     </div>
                  </div>
               </div>
            </section>

         </div>
      </div>
   );
};

export default SettingsPage;
