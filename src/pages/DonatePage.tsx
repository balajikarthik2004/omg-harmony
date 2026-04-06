import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Check, CreditCard, Smartphone, Banknote, ArrowRight, ArrowLeft, ShieldCheck, HeartHandshake, User, Mail, Phone, Lock } from 'lucide-react';

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
          <HeartHandshake className="w-[500px] h-[500px] text-emerald-500 blur-[100px]" />
        </div>
        <div className="text-center bg-card max-w-lg mx-auto animate-slide-up p-12 w-full rounded-3xl border border-emerald-100 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-400" />
          
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-[12px] ring-emerald-50/50 relative">
            <Check className="h-10 w-10 text-emerald-600" />
            <div className="absolute -inset-4 border-2 border-emerald-200 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
          </div>
          
          <h2 className="text-3xl font-display font-bold text-foreground mb-2 tracking-tight">Payment Successful</h2>
          <p className="text-lg text-muted-foreground mb-6">Your generous offering of <span className="font-display font-bold text-emerald-600 text-2xl">₹{amount.toLocaleString()}</span> has been securely processed.</p>
          
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-800 bg-emerald-50 py-3 px-6 rounded-xl border border-emerald-100 mx-auto w-fit mb-8 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Receipt sent to {form.email ? 'email inbox' : 'SMS'}
          </div>
          
          <Button onClick={() => { setStep(1); setForm({ name: '', phone: '', email: '', amount: 0, customAmount: '', method: '' }); }} className="h-14 w-full gap-2 text-base font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all hover:shadow-emerald-600/20 hover:-translate-y-0.5">
            <Heart className="h-5 w-5" /> Make Another Donation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in relative pb-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
          <Heart className="w-3.5 h-3.5" /> Secure Giving
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">Make a Donation</h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed">Your generous support helps sustain Temple Governance services, annadanam, and operations.</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-10 relative px-4">
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-muted -translate-y-1/2 -z-10 rounded-full" />
        <div className="absolute top-1/2 left-4 h-1 bg-primary -translate-y-1/2 -z-10 rounded-full transition-all duration-500 ease-out" style={{ width: `calc(${(step - 1) * 50}% - 16px)` }} />

        {[
          { num: 1, label: 'Your Details' },
          { num: 2, label: 'Amount' },
          { num: 3, label: 'Payment' },
        ].map((s, idx) => (
          <div key={s.num} className="flex flex-col items-center gap-2 relative bg-background px-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-500 shadow-sm border-4 ${
              step === s.num ? 'bg-primary text-primary-foreground border-background ring-4 ring-primary/20 scale-110 shadow-lg' :
              step > s.num ? 'bg-primary/10 text-primary border-background ring-4 ring-transparent' : 'bg-muted text-muted-foreground border-background ring-4 ring-transparent'
            }`}>
              {step > s.num ? <Check className="h-5 w-5" /> : s.num}
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${step >= s.num ? 'text-primary' : 'text-muted-foreground opacity-50'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-card p-6 md:p-10 rounded-3xl border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 overflow-hidden">
        {step === 1 && (
          <div className="space-y-6 animate-slide-in-right">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold font-display text-foreground tracking-tight">Donor Information</h3>
              <p className="text-sm text-muted-foreground mt-1.5">Required for tax-exempt receipts & communication.</p>
            </div>
            
            <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Full Legal Name</label>
                 <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                   <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full h-14 rounded-xl border border-input bg-background/50 hover:bg-background pl-12 pr-4 text-base font-semibold text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none shadow-sm" placeholder="Ramesh Kumar" />
                 </div>
               </div>
               
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Mobile Number</label>
                 <div className="relative">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                   <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full h-14 rounded-xl border border-input bg-background/50 hover:bg-background pl-12 pr-4 text-base font-semibold text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none shadow-sm" placeholder="+91 9000 000 111" />
                 </div>
               </div>
               
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Email Address</label>
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                   <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full h-14 rounded-xl border border-input bg-background/50 hover:bg-background pl-12 pr-4 text-base font-semibold text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none shadow-sm" placeholder="ramesh@example.com" />
                 </div>
               </div>
            </div>
            
            <div className="pt-6">
              <Button onClick={next} disabled={!form.name || !form.phone} className="w-full h-14 gap-2 text-base font-bold rounded-xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground group transition-all disabled:opacity-50">
                Continue to Amount <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-in-right">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold font-display text-foreground tracking-tight">Select Amount</h3>
              <p className="text-sm text-muted-foreground mt-1.5">Choose an offering or enter a custom amount.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickAmounts.map(a => (
                <button
                  key={a}
                  onClick={() => setForm(p => ({ ...p, amount: a, customAmount: '' }))}
                  className={`h-16 rounded-xl border-2 text-lg font-display font-bold transition-all flex items-center justify-center shadow-sm ${form.amount === a && !form.customAmount ? 'border-primary bg-primary/10 text-primary transform scale-[1.02]' : 'border-input bg-background/50 text-muted-foreground hover:border-primary/30 hover:bg-accent/50'}`}
                >
                  ₹{a.toLocaleString()}
                </button>
              ))}
            </div>
            
            <div className="relative pt-6">
               <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-border/80"></div>
               </div>
               <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs uppercase tracking-widest font-bold text-muted-foreground">Or</span>
               </div>
            </div>
            
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Custom Amount</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-display font-bold text-muted-foreground">₹</span>
                <input
                  type="number"
                  value={form.customAmount}
                  onChange={e => setForm(p => ({ ...p, customAmount: e.target.value, amount: 0 }))}
                  className="w-full h-16 rounded-xl border-2 border-input bg-background/50 hover:bg-background pl-12 pr-5 text-2xl font-display font-bold text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none shadow-sm placeholder:text-muted-foreground/30"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button variant="outline" onClick={prev} className="flex-[0.3] h-14 gap-2 text-base rounded-xl border-2 font-bold hover:bg-muted/50"><ArrowLeft className="h-5 w-5" /></Button>
              <Button onClick={next} disabled={!amount} className="flex-1 h-14 gap-2 text-base font-bold rounded-xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground group transition-all disabled:opacity-50">
                Proceed to Pay ₹{amount.toLocaleString()} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-slide-in-right">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold font-display text-foreground tracking-tight">Payment Method</h3>
              <p className="text-sm flex items-center justify-center gap-1.5 text-emerald-600 font-medium mt-1.5 bg-emerald-50 w-fit mx-auto px-3 py-1 rounded-full"><Lock className="w-3.5 h-3.5" /> Encrypted & Secure Checkout</p>
            </div>
            
            <div className="space-y-3">
              {paymentMethods.map(m => (
                <button
                  key={m.key}
                  onClick={() => setForm(p => ({ ...p, method: m.key }))}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 group ${form.method === m.key ? 'border-primary bg-primary/5 shadow-sm transform scale-[1.01]' : 'border-border hover:border-primary/40 hover:bg-muted/30 bg-background/50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center shadow-sm transition-colors ${form.method === m.key ? 'bg-primary text-primary-foreground' : 'bg-background border border-border/80 text-muted-foreground group-hover:text-foreground'}`}>
                    <m.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-base tracking-tight ${form.method === m.key ? 'text-primary' : 'text-foreground'}`}>{m.label}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                  {form.method === m.key && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in">
                       <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="bg-muted/30 rounded-2xl p-5 mt-6 border border-border/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Final Summary</p>
                <p className="text-sm font-semibold text-foreground">Donation by {form.name}</p>
              </div>
              <p className="text-3xl font-display font-bold text-foreground">₹{amount.toLocaleString()}</p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={prev} className="flex-[0.2] h-14 gap-2 text-base rounded-xl border-2 font-bold hover:bg-muted/50"><ArrowLeft className="h-5 w-5" /></Button>
              <Button onClick={next} disabled={!form.method} className="flex-1 h-14 gap-2 text-base font-bold rounded-xl shadow-lg bg-foreground text-background hover:bg-foreground/90 transition-all disabled:opacity-50">
                Securely Pay ₹{amount.toLocaleString()} <Lock className="h-4 w-4 opacity-70" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonatePage;
