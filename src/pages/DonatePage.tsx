import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Check } from 'lucide-react';
import omgLogo from '@/assets/omg-logo.png';

const quickAmounts = [100, 500, 1000, 2500, 5000];

const DonatePage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', email: '', amount: 0, customAmount: '', method: '' });

  const amount = form.customAmount ? Number(form.customAmount) : form.amount;

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  if (step === 4) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center erp-card max-w-md mx-auto animate-slide-up">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-1">Your donation of <span className="font-bold text-foreground">₹{amount.toLocaleString()}</span> has been received.</p>
          <p className="text-sm text-muted-foreground">Thank you for supporting OMG Temple.</p>
          <Button onClick={() => { setStep(1); setForm({ name: '', phone: '', email: '', amount: 0, customAmount: '', method: '' }); }} className="mt-6">
            Make Another Donation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Make a Donation</h1>
        <p className="text-muted-foreground">Support OMG Temple with your generous contribution</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{s}</div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="erp-card animate-slide-up">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Donor Details</h3>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Enter your name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="+91" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="email@example.com" />
            </div>
            <Button onClick={next} className="w-full mt-2" disabled={!form.name}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Donation Amount</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map(a => (
                <button
                  key={a}
                  onClick={() => setForm(p => ({ ...p, amount: a, customAmount: '' }))}
                  className={`h-14 rounded-lg border-2 text-base font-semibold transition-all ${form.amount === a && !form.customAmount ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-primary/50'}`}
                >
                  ₹{a.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Custom Amount</label>
              <input
                type="number"
                value={form.customAmount}
                onChange={e => setForm(p => ({ ...p, customAmount: e.target.value, amount: 0 }))}
                className="w-full h-12 rounded-md border border-input bg-background px-3 text-lg font-display"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={prev} className="flex-1">Back</Button>
              <Button onClick={next} className="flex-1" disabled={!amount}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
            <div className="space-y-3">
              {['UPI', 'Card', 'Cash'].map(m => (
                <button
                  key={m}
                  onClick={() => setForm(p => ({ ...p, method: m }))}
                  className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${form.method === m ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-muted-foreground">Donation Summary</p>
              <p className="text-2xl font-display font-bold text-foreground">₹{amount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">by {form.name}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={prev} className="flex-1">Back</Button>
              <Button onClick={next} className="flex-1" disabled={!form.method}>
                <Heart className="h-4 w-4 mr-2" />Donate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonatePage;
