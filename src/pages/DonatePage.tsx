import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Check, CreditCard, Smartphone, Banknote, ArrowRight, ArrowLeft } from 'lucide-react';
import omgLogo from '@/assets/omg-logo.png';

const quickAmounts = [100, 500, 1000, 2500, 5000];

const paymentMethods = [
  { key: 'UPI', label: 'UPI Payment', desc: 'Secure Google Pay, PhonePe, Paytm', icon: Smartphone },
  { key: 'Card', label: 'Credit/Debit Card', desc: 'Encrypted Gateway Processing', icon: CreditCard },
  { key: 'Cash', label: 'Physical Cash', desc: 'Tendered in person at Temple Desk', icon: Banknote },
];

const DonatePage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', email: '', amount: 0, customAmount: '', method: '' });

  const amount = form.customAmount ? Number(form.customAmount) : form.amount;

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  if (step === 4) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fade-in relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <HeartHandshake className="w-96 h-96 text-rose-500 blur-3xl" />
        </div>
        <div className="text-center section-panel max-w-lg mx-auto animate-slide-up p-12 w-full border-2 border-emerald-100 bg-gradient-to-b from-white via-emerald-50/10 to-white/80 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)]">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-100 shadow-[inset_0_4px_10px_rgba(16,185,129,0.2)] relative">
            <Check className="h-10 w-10 text-emerald-600" />
            <div className="absolute -inset-4 border-2 border-emerald-200 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-3 tracking-tight">Offering Accepted</h2>
          <p className="text-lg text-muted-foreground mb-4">Your generous contribution of <span className="font-display font-bold text-emerald-700 text-2xl">₹{amount.toLocaleString()}</span> has been securely routed.</p>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground bg-muted/40 py-2.5 rounded-lg border border-border/40 mx-auto w-3/4 mb-8">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Receipt dispached via {form.email ? 'Email' : 'SMS'}
          </div>
          <Button onClick={() => { setStep(1); setForm({ name: '', phone: '', email: '', amount: 0, customAmount: '', method: '' }); }} className="mt-2 h-14 w-full gap-2 text-base font-bold shadow-lg hover:shadow-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl">
            <Heart className="h-5 w-5" /> Execute Another Contribution
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full pointer-events-none -z-10" />
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Make a Digital Offering</h1>
        <p className="text-muted-foreground text-sm font-medium mt-3 max-w-sm mx-auto">Support Temple Harmony logistics, infrastructure, and anndanam services via secure portal.</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-muted -translate-y-1/2 -z-10 rounded-full" />
        <div className="absolute top-1/2 left-0 h-[3px] bg-rose-500 -translate-y-1/2 -z-10 rounded-full transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }} />

        {[
          { num: 1, label: 'Identity Vector' },
          { num: 2, label: 'Offering Sum' },
          { num: 3, label: 'Payment Node' },
        ].map((s, idx) => (
          <div key={s.num} className="flex flex-col items-center gap-2 relative bg-background px-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-500 shadow-sm border-4 ${step === s.num ? 'bg-rose-600 text-white border-white ring-4 ring-rose-200 scale-110' :
                step > s.num ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-muted text-muted-foreground border-transparent'
              }`}>
              {step > s.num ? <Check className="h-5 w-5" /> : s.num}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.num ? 'text-rose-700' : 'text-muted-foreground'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="section-panel !p-10 !rounded-3xl border-border/80 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] bg-card border-t-4 border-t-rose-500/50">
        {step === 1 && (
          <div className="space-y-6 animate-slide-in-right">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground">Donor Identity Protocol</h3>
              <p className="text-xs text-muted-foreground mt-1">This data ensures proper tax-exempt receipting.</p>
            </div>
            <div className="space-y-2 relative">
              <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Legal Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full h-14 rounded-xl border border-input bg-background/80 px-4 text-base font-bold text-foreground transition-all duration-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none shadow-sm hover:border-border" placeholder="e.g. Ramesh Kumar" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Mobile Contact Signal</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full h-14 rounded-xl border border-input bg-background/80 px-4 text-base font-bold text-foreground transition-all duration-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none shadow-sm hover:border-border" placeholder="+91 9000 000 111" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Digital Post (Email)</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full h-14 rounded-xl border border-input bg-background/80 px-4 text-base font-bold text-foreground transition-all duration-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none shadow-sm hover:border-border" placeholder="name@domain.com" />
            </div>
            <div className="pt-4">
              <Button onClick={next} className="w-full h-14 gap-2 text-base font-bold rounded-xl shadow-lg bg-rose-600 hover:bg-rose-700 text-white" disabled={!form.name}>
                Confirm Identity <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-in-right">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground">Specify Offering Sum</h3>
              <p className="text-xs text-muted-foreground mt-1">Donations are utilized universally unless specified.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickAmounts.map(a => (
                <button
                  key={a}
                  onClick={() => setForm(p => ({ ...p, amount: a, customAmount: '' }))}
                  className={`h-16 rounded-xl border-[2.5px] text-lg font-display font-bold transition-all duration-300 flex items-center justify-center ${form.amount === a && !form.customAmount ? 'border-rose-500 bg-rose-50/50 text-rose-700 shadow-md scale-105' : 'border-border/60 text-muted-foreground hover:border-rose-300 hover:bg-muted/30 hover:text-foreground'}`}
                >
                  ₹{a.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-6">
              <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Custom Denomination (₹)</label>
              <input
                type="number"
                value={form.customAmount}
                onChange={e => setForm(p => ({ ...p, customAmount: e.target.value, amount: 0 }))}
                className="w-full h-12 rounded-lg border border-input bg-background px-3 text-lg font-display transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={prev} className="flex-1 gap-2"><ArrowLeft className="h-4 w-4" />Back</Button>
              <Button onClick={next} className="flex-1 gap-2" disabled={!amount}>Continue<ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map(m => (
                <button
                  key={m.key}
                  onClick={() => setForm(p => ({ ...p, method: m.key }))}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${form.method === m.key ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${form.method === m.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-muted/40 rounded-xl p-4 mt-4">
              <p className="text-xs text-muted-foreground mb-1">Donation Summary</p>
              <p className="text-2xl font-display font-bold text-foreground">₹{amount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">by {form.name}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={prev} className="flex-1 gap-2"><ArrowLeft className="h-4 w-4" />Back</Button>
              <Button onClick={next} className="flex-1 gap-2" disabled={!form.method}>
                <Heart className="h-4 w-4" />Donate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonatePage;
