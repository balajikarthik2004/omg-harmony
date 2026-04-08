import React, { useState, useEffect, useCallback } from 'react';

// Types

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';
type FlowStep = 'method' | 'details' | 'confirm' | 'processing' | 'success';

export type SevaBooking = {
  id: string;
  bookingCode: string;
  devoteeName: string;
  poojaType: string;
  date: string;
  slot: string;
  priestName: string;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  bookingStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  receiptNumber: string;
  notes: string;
};

interface SevaPaymentModalProps {
  booking: SevaBooking;
  amount: number;
  onClose: () => void;
  onPaid: (booking: SevaBooking) => void;
  onViewEsevaPass: (booking: SevaBooking) => void;
}

// Helpers

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}
function formatDate(d: string) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[parseInt(m, 10) - 1]} ${y}`;
}
function fmtCardNum(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function fmtExpiry(v: string) {
  const c = v.replace(/\D/g, '').slice(0, 4);
  return c.length >= 3 ? c.slice(0, 2) + ' / ' + c.slice(2) : c;
}
function genTxnId() {
  return 'TXN-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Icons

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const IconCheck = ({ size = 10, color = '#fff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <path d="M1.5 5l2.5 2.5L8.5 2" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 3L4 7l5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const IconShield = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M6 1L1.5 3v3c0 2.5 2 4.5 4.5 5.5C8.5 10.5 10.5 8.5 10.5 6V3L6 1z" stroke="currentColor" strokeWidth="1" />
  </svg>
);
const IconCard = ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <rect x="1" y="4" width="16" height="11" rx="2" stroke={color} strokeWidth="1.2" />
    <path d="M1 7.5h16" stroke={color} strokeWidth="1.2" />
    <rect x="3" y="10" width="4" height="1.5" rx="0.5" fill={color} />
  </svg>
);

// Progress

const STEPS: { key: FlowStep; label: string }[] = [
  { key: 'method', label: 'Method' },
  { key: 'details', label: 'Details' },
  { key: 'confirm', label: 'Confirm' },
  { key: 'success', label: 'Done' },
];

const ProgressBar: React.FC<{ step: FlowStep }> = ({ step }) => {
  const activeIdx = step === 'processing' ? 2 : STEPS.findIndex((s) => s.key === step);
  return (
    <div style={styles.progBar}>
      {STEPS.map((s, i) => {
        const isDone = i < activeIdx;
        const isActive = i === activeIdx;
        return (
          <React.Fragment key={s.key}>
            <div style={styles.progStep}>
              <div
                style={{
                  ...styles.progDot,
                  background: isDone || isActive ? '#635bff' : 'var(--color-background-primary, hsl(var(--card)))',
                  borderColor: isDone || isActive ? '#635bff' : 'var(--color-border-secondary, hsl(var(--border)))',
                  color: isDone || isActive ? '#fff' : 'var(--color-text-secondary, hsl(var(--muted-foreground)))',
                }}
              >
                {isDone ? <IconCheck size={10} color="#fff" /> : i + 1}
              </div>
              <div
                style={{
                  ...styles.progLabel,
                  color: isActive ? 'var(--color-text-primary, hsl(var(--foreground)))' : 'var(--color-text-secondary, hsl(var(--muted-foreground)))',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {s.label}
              </div>
            </div>
            {i < STEPS.length - 1 && <div style={{ ...styles.progLine, background: isDone ? '#635bff' : 'var(--color-border-tertiary, hsl(var(--border)))' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OrderBar: React.FC<{ booking: SevaBooking; total: number }> = ({ booking, total }) => (
  <div style={styles.orderBar}>
    <div style={styles.orderIcon}>🙏</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={styles.orderName}>{booking.poojaType}</div>
      <div style={styles.orderMeta}>
        {booking.devoteeName} · {formatDate(booking.date)}
      </div>
    </div>
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div style={styles.orderAmount}>{formatINR(total)}</div>
      <div style={styles.orderGst}>incl. 5% GST</div>
    </div>
  </div>
);

const METHOD_DEFS: {
  id: PaymentMethod;
  label: string;
  sub: string;
  popular?: boolean;
  iconBg: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'card',
    label: 'Card',
    sub: 'Visa, Mastercard, RuPay',
    popular: true,
    iconBg: '#eeedfe',
    icon: <IconCard color="#635bff" />,
  },
  {
    id: 'upi',
    label: 'UPI',
    sub: 'GPay, PhonePe, Paytm',
    iconBg: '#f0fdf4',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="#16a34a" strokeWidth="1.2" />
        <path d="M6 9l2.5 2.5L12 6" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'netbanking',
    label: 'Net banking',
    sub: 'SBI, HDFC, ICICI...',
    iconBg: '#fff7ed',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="8" width="14" height="7" rx="1" stroke="#d97706" strokeWidth="1.2" />
        <path d="M5 8V6a4 4 0 0 1 8 0v2" stroke="#d97706" strokeWidth="1.2" />
        <rect x="8" y="11" width="2" height="2" rx="0.5" fill="#d97706" />
      </svg>
    ),
  },
  {
    id: 'wallet',
    label: 'Wallet',
    sub: 'Paytm, Amazon Pay...',
    iconBg: '#fdf4ff',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="5" width="16" height="10" rx="2" stroke="#a21caf" strokeWidth="1.2" />
        <circle cx="13.5" cy="10" r="1.5" fill="#a21caf" />
        <path d="M1 8.5h16" stroke="#a21caf" strokeWidth="1.2" />
      </svg>
    ),
  },
];

const MethodSelector: React.FC<{
  selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  onContinue: () => void;
}> = ({ selected, onSelect, onContinue }) => (
  <div style={styles.body}>
    <div style={styles.sectionLabel}>Choose payment method</div>
    <div style={styles.methodGrid}>
      {METHOD_DEFS.map((m) => (
        <button key={m.id} style={{ ...styles.methodCard, ...(selected === m.id ? styles.methodCardActive : {}) }} onClick={() => onSelect(m.id)}>
          {m.popular && <div style={styles.methodPopular}>Most popular</div>}
          {selected === m.id && (
            <div style={styles.methodCheck}>
              <IconCheck size={10} color="#fff" />
            </div>
          )}
          <div style={{ ...styles.methodIconWrap, background: m.iconBg }}>{m.icon}</div>
          <div>
            <div style={styles.methodName}>{m.label}</div>
            <div style={styles.methodSub}>{m.sub}</div>
          </div>
        </button>
      ))}
    </div>
    <button style={styles.payBtn} onClick={onContinue}>
      Continue <IconArrowRight />
    </button>
    <TrustRow />
  </div>
);

const CardVisual: React.FC<{ num: string; name: string; expiry: string }> = ({ num, name, expiry }) => {
  const displayNum = (() => {
    const raw = num.replace(/\s/g, '');
    let d = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) d += ' ';
      d += i < raw.length ? raw[i] : '•';
    }
    return d;
  })();
  return (
    <div style={styles.cardVisual}>
      <div style={styles.cardChip} />
      <div style={styles.cardNetwork}>
        <span style={{ ...styles.cardNetCircle, background: '#eb001b' }} />
        <span style={{ ...styles.cardNetCircle, background: '#f79e1b', marginLeft: -8 }} />
      </div>
      <div style={styles.cardNum}>{displayNum}</div>
      <div style={styles.cardRow}>
        <div>
          <div style={styles.cardLbl}>Card holder</div>
          <div style={styles.cardVal}>{name.toUpperCase() || 'YOUR NAME'}</div>
        </div>
        <div>
          <div style={styles.cardLbl}>Expires</div>
          <div style={styles.cardVal}>{expiry || 'MM/YY'}</div>
        </div>
      </div>
    </div>
  );
};

const UpiQR: React.FC = () => {
  const pattern = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
  ];
  return (
    <div style={styles.upiWrap}>
      <div style={styles.upiQrGrid}>
        {pattern.map((row, ri) =>
          row.map((cell, ci) => <div key={`${ri}-${ci}`} style={{ ...styles.upiQrCell, background: cell ? '#1a1a2e' : 'transparent' }} />)
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))', marginBottom: 10 }}>Scan with any UPI app</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
          <div key={app} style={styles.upiAppPill}>
            {app}
          </div>
        ))}
      </div>
    </div>
  );
};

const CardDetails: React.FC<{
  cardNum: string;
  setCardNum: (v: string) => void;
  cardName: string;
  setCardName: (v: string) => void;
  expiry: string;
  setExpiry: (v: string) => void;
  cvv: string;
  setCvv: (v: string) => void;
  saveCard: boolean;
  setSaveCard: (v: boolean) => void;
}> = ({ cardNum, setCardNum, cardName, setCardName, expiry, setExpiry, cvv, setCvv, saveCard, setSaveCard }) => (
  <>
    <CardVisual num={cardNum} name={cardName} expiry={expiry} />
    <FormGroup label="Cardholder name">
      <input style={styles.input} placeholder="Name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} />
    </FormGroup>
    <FormGroup label="Card number">
      <input style={styles.input} placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric" value={cardNum} onChange={(e) => setCardNum(fmtCardNum(e.target.value))} />
    </FormGroup>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <FormGroup label="Expiry">
        <input style={styles.input} placeholder="MM / YY" maxLength={7} inputMode="numeric" value={expiry} onChange={(e) => setExpiry(fmtExpiry(e.target.value))} />
      </FormGroup>
      <FormGroup label="CVV">
        <input style={styles.input} placeholder="•••" maxLength={4} type="password" inputMode="numeric" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} />
      </FormGroup>
    </div>
    <label style={styles.saveCardRow}>
      <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} style={{ accentColor: '#635bff', width: 14, height: 14 }} />
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))' }}>Save card for future payments</span>
    </label>
  </>
);

const UpiDetails: React.FC<{ upiId: string; setUpiId: (v: string) => void }> = ({ upiId, setUpiId }) => (
  <>
    <UpiQR />
    <div style={styles.upiOr}>or enter UPI ID</div>
    <FormGroup label="Your UPI ID">
      <input style={styles.input} placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
    </FormGroup>
  </>
);

const BANKS = [
  { id: 'sbi', name: 'SBI', type: 'State Bank', bg: '#e8f5e9', fg: '#2e7d32' },
  { id: 'hdfc', name: 'HDFC', type: 'Private', bg: '#e3f2fd', fg: '#1565c0' },
  { id: 'icici', name: 'ICICI', type: 'Private', bg: '#fff3e0', fg: '#e65100' },
  { id: 'axis', name: 'Axis', type: 'Private', bg: '#fce4ec', fg: '#c62828' },
  { id: 'kotak', name: 'Kotak', type: 'Private', bg: '#f3e5f5', fg: '#6a1b9a' },
  { id: 'pnb', name: 'PNB', type: 'Govt', bg: '#e0f2f1', fg: '#00695c' },
];
const NetBankingDetails: React.FC<{ bank: string; setBank: (v: string) => void }> = ({ bank, setBank }) => (
  <>
    <div style={styles.sectionLabel}>Select your bank</div>
    <div style={styles.bankGrid}>
      {BANKS.map((b) => (
        <button key={b.id} style={{ ...styles.bankCard, ...(bank === b.id ? styles.bankCardActive : {}) }} onClick={() => setBank(b.id)}>
          <div style={{ ...styles.bankDot, background: b.bg, color: b.fg }}>{b.name.slice(0, 4)}</div>
          <div>
            <div style={styles.bankName}>{b.name}</div>
            <div style={styles.bankType}>{b.type}</div>
          </div>
          {bank === b.id && (
            <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <div style={styles.miniCheck}>
                <IconCheck size={8} color="#fff" />
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
    <div style={styles.moreLink}>+ More banks</div>
  </>
);

const WALLETS = [
  { id: 'paytm', name: 'Paytm', bal: '₹1,240', ok: true, emoji: '🔵' },
  { id: 'amazon', name: 'Amazon Pay', bal: '₹420', ok: true, emoji: '🟠' },
  { id: 'mobikwik', name: 'Mobikwik', bal: '₹0', ok: false, emoji: '🟣' },
  { id: 'freecharge', name: 'Freecharge', bal: '₹85', ok: false, emoji: '🟢' },
];
const WalletDetails: React.FC<{ wallet: string; setWallet: (v: string) => void }> = ({ wallet, setWallet }) => (
  <>
    <div style={styles.sectionLabel}>Select wallet</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {WALLETS.map((w) => (
        <button key={w.id} style={{ ...styles.walletRow, ...(wallet === w.id ? styles.walletRowActive : {}) }} onClick={() => setWallet(w.id)}>
          <div style={styles.walletRadio}>{wallet === w.id && <div style={styles.walletRadioDot} />}</div>
          <div style={styles.walletEmoji}>{w.emoji}</div>
          <div>
            <div style={styles.walletName}>{w.name}</div>
            <div style={{ ...styles.walletBal, color: w.ok ? '#16a34a' : '#dc2626' }}>
              Balance {w.bal} · {w.ok ? 'Sufficient' : 'Insufficient'}
            </div>
          </div>
          {wallet === w.id && (
            <div style={{ marginLeft: 'auto' }}>
              <div style={styles.miniCheck}>
                <IconCheck size={8} color="#fff" />
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  </>
);

const ConfirmStep: React.FC<{
  booking: SevaBooking;
  amount: number;
  tax: number;
  total: number;
  method: PaymentMethod;
  cardNum: string;
  upiId: string;
  bank: string;
  wallet: string;
  onBack: () => void;
  onPay: () => void;
}> = ({ booking, amount, tax, total, method, cardNum, upiId, bank, wallet, onBack, onPay }) => {
  const methodLabel = method === 'card' ? `Card ending ···· ${cardNum.replace(/\s/g, '').slice(-4) || '4242'}` : method === 'upi' ? `UPI · ${upiId || 'yourname@upi'}` : method === 'netbanking' ? `Net banking · ${bank.toUpperCase()}` : `${wallet.charAt(0).toUpperCase() + wallet.slice(1)} wallet`;

  return (
    <div style={styles.body}>
      <button style={styles.backBtn} onClick={onBack}>
        <IconArrowLeft /> Back
      </button>
      <div style={styles.sectionLabel}>Order summary</div>
      <div style={styles.summaryCard}>
        {[
          ['Seva', booking.poojaType],
          ['Devotee', booking.devoteeName],
          ['Date & slot', `${formatDate(booking.date)} · ${booking.slot}`],
          ['Priest', booking.priestName],
        ].map(([k, v]) => (
          <div key={k} style={styles.receiptRow}>
            <span style={styles.receiptKey}>{k}</span>
            <span style={styles.receiptVal}>{v}</span>
          </div>
        ))}
        <div style={styles.divider} />
        <div style={styles.receiptRow}>
          <span style={styles.receiptKey}>Seva dakshina</span>
          <span style={styles.receiptVal}>{formatINR(amount)}</span>
        </div>
        <div style={styles.receiptRow}>
          <span style={styles.receiptKey}>GST (5%)</span>
          <span style={styles.receiptVal}>{formatINR(tax)}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.receiptRow}>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' }}>Total</span>
          <span style={{ fontSize: 19, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' }}>{formatINR(total)}</span>
        </div>
      </div>

      <div style={styles.methodPill}>
        <IconCard color="#635bff" size={16} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' }}>{methodLabel}</span>
        <button style={{ background: 'none', border: 'none', fontSize: 12, color: '#635bff', cursor: 'pointer', padding: 0 }} onClick={onBack}>
          Change
        </button>
      </div>

      <button style={styles.payBtn} onClick={onPay}>
        <IconLock />
        Pay {formatINR(total)} securely
      </button>
      <TrustRow />
    </div>
  );
};

type ProcStep = { label: string; state: 'waiting' | 'active' | 'done' };

const ProcessingStep: React.FC<{ booking: SevaBooking; onDone: () => void }> = ({ booking: _booking, onDone }) => {
  const [pct, setPct] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Connecting to gateway...');
  const [steps, setSteps] = useState<ProcStep[]>([
    { label: 'Verifying devotee details', state: 'active' },
    { label: 'Processing seva booking', state: 'waiting' },
    { label: 'Confirming with temple ledger', state: 'waiting' },
  ]);

  const markStep = useCallback((idx: number, nextActiveIdx: number | null) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i === idx) return { ...s, state: 'done' };
        if (nextActiveIdx !== null && i === nextActiveIdx) return { ...s, state: 'active' };
        return s;
      })
    );
  }, []);

  useEffect(() => {
    const timeline = [
      { t: 400, pct: 18, msg: 'Verifying devotee details...' },
      { t: 1100, pct: 36, msg: 'Processing seva booking...', step: 0, nextActive: 1 },
      { t: 1900, pct: 58, msg: 'Contacting payment gateway...' },
      { t: 2600, pct: 76, msg: 'Authorising transaction...', step: 1, nextActive: 2 },
      { t: 3300, pct: 92, msg: 'Updating temple ledger...' },
      { t: 3900, pct: 100, msg: 'Payment confirmed!', step: 2, nextActive: null },
    ];
    const timers = timeline.map(({ t, pct: p, msg, step, nextActive }) =>
      setTimeout(() => {
        setPct(p);
        setStatusMsg(msg);
        if (step !== undefined) markStep(step, nextActive ?? null);
        if (p === 100) setTimeout(onDone, 600);
      }, t)
    );
    return () => timers.forEach(clearTimeout);
  }, [markStep, onDone]);

  const circumference = 2 * Math.PI * 32;
  const dashArray = (pct / 100) * circumference;

  return (
    <div style={styles.procWrap}>
      <div style={styles.procRingWrap}>
        <svg width="76" height="76" viewBox="0 0 76 76" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="38" cy="38" r="32" fill="none" stroke="var(--color-border-tertiary, hsl(var(--border)))" strokeWidth="4" />
        </svg>
        <svg width="76" height="76" viewBox="0 0 76 76" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#635bff" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <circle
            cx="38"
            cy="38"
            r="32"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dashArray} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.55s ease' }}
          />
        </svg>
        <div style={styles.procPct}>{pct}%</div>
      </div>
      <div style={styles.procTitle}>Authorising payment</div>
      <div style={styles.procStatus}>{statusMsg}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 270 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: s.state === 'waiting' ? 'var(--color-text-secondary, hsl(var(--muted-foreground)))' : 'var(--color-text-primary, hsl(var(--foreground)))' }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `0.5px solid ${s.state === 'done' ? '#635bff' : s.state === 'active' ? '#635bff' : 'var(--color-border-secondary, hsl(var(--border)))'}`,
                background: s.state === 'done' ? '#635bff' : 'transparent',
                transition: 'all 0.3s',
              }}
            >
              {s.state === 'done' ? (
                <IconCheck size={10} color="#fff" />
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.state === 'active' ? '#635bff' : 'var(--color-border-secondary, hsl(var(--border)))' }} />
              )}
            </div>
            {s.label}
          </div>
        ))}
      </div>
      <div style={styles.procSecure}>
        <IconShield /> 256-bit TLS · PCI-DSS Level 1 · RBI Certified
      </div>
    </div>
  );
};

const SuccessStep: React.FC<{
  booking: SevaBooking;
  amount: number;
  tax: number;
  total: number;
  method: PaymentMethod;
  txnId: string;
  onClose: () => void;
  onViewPass: () => void;
}> = ({ booking, amount, tax, total, method, txnId, onClose, onViewPass }) => {
  const methodLabel = { card: 'Credit/Debit Card', upi: 'UPI', netbanking: 'Net Banking', wallet: 'Mobile Wallet' }[method];
  return (
    <div style={styles.successWrap}>
      <div style={styles.successRing}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M4 13l6 6 12-12" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={styles.successTitle}>Seva confirmed</div>
      <div style={styles.successSub}>Payment received · Receipt ready</div>

      <div style={styles.receiptCard}>
        <div style={styles.receiptCardHead}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' }}>E-Seva Pass · {booking.receiptNumber}</span>
          <span style={styles.paidBadge}>Paid</span>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['Devotee', booking.devoteeName],
            ['Seva', booking.poojaType],
            ['Date & slot', `${formatDate(booking.date)} · ${booking.slot}`],
            ['Priest', booking.priestName],
          ].map(([k, v]) => (
            <div key={k} style={styles.receiptRow}>
              <span style={styles.receiptKey}>{k}</span>
              <span style={styles.receiptVal}>{v}</span>
            </div>
          ))}
          <div style={styles.divider} />
          <div style={styles.receiptRow}>
            <span style={styles.receiptKey}>Seva dakshina</span>
            <span style={styles.receiptVal}>{formatINR(amount)}</span>
          </div>
          <div style={styles.receiptRow}>
            <span style={styles.receiptKey}>GST (5%)</span>
            <span style={styles.receiptVal}>{formatINR(tax)}</span>
          </div>
          <div style={styles.receiptRow}>
            <span style={styles.receiptKey}>Method</span>
            <span style={styles.receiptVal}>{methodLabel}</span>
          </div>
          <div style={styles.receiptRow}>
            <span style={styles.receiptKey}>Transaction ID</span>
            <span style={{ ...styles.receiptVal, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))' }}>{txnId}</span>
          </div>
        </div>
        <div style={styles.receiptTotal}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' }}>Total paid</span>
          <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' }}>{formatINR(total)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 16 }}>
        <button style={styles.btnGhost} onClick={onClose}>
          Close
        </button>
        <button style={styles.btnGhost} onClick={() => window.print()}>
          Print pass
        </button>
        <button style={styles.btnSolid} onClick={onViewPass}>
          E-Seva pass
        </button>
      </div>
    </div>
  );
};

const FormGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))', letterSpacing: '0.04em' }}>{label}</div>
    {children}
  </div>
);

const TrustRow: React.FC = () => (
  <div style={styles.trustRow}>
    {[
      [<IconShield key="s" />, 'PCI-DSS'],
      [
        <svg key="c" width="11" height="11" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
          <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>,
        '3D Secure',
      ],
      [
        <svg key="r" width="11" height="11" viewBox="0 0 12 12" fill="none">
          <rect x="1" y="3" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
          <path d="M1 6h10" stroke="currentColor" strokeWidth="1" />
        </svg>,
        'RBI regulated',
      ],
    ].map(([icon, label]) => (
      <div key={label as string} style={styles.trustItem}>
        {icon}
        {label}
      </div>
    ))}
  </div>
);

const SevaPaymentModal: React.FC<SevaPaymentModalProps> = ({ booking, amount, onClose, onPaid, onViewEsevaPass }) => {
  const tax = Math.round(amount * 0.05);
  const total = amount + tax;

  const [step, setStep] = useState<FlowStep>('method');
  const [method, setMethod] = useState<PaymentMethod>('card');

  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const [upiId, setUpiId] = useState('');
  const [bank, setBank] = useState('sbi');
  const [wallet, setWallet] = useState('paytm');

  const [txnId] = useState(genTxnId);
  const [paidBooking, setPaidBooking] = useState<SevaBooking>(booking);

  const handleProcessingDone = useCallback(() => {
    const updated: SevaBooking = { ...booking, paymentStatus: 'Paid', bookingStatus: 'Confirmed' };
    setPaidBooking(updated);
    onPaid(updated);
    setStep('success');
  }, [booking, onPaid]);

  const [animKey, setAnimKey] = useState(0);
  const navigate = (next: FlowStep) => {
    setStep(next);
    setAnimKey((k) => k + 1);
  };

  return (
    <>
      <style>{MODAL_STYLES}</style>
      <div style={styles.overlay} className="spm-overlay-inner" onClick={step !== 'processing' ? onClose : undefined}>
        <div style={styles.modal} className="spm-modal-inner" onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHead}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={styles.headIconWrap}>
                <IconLock />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' }}>Secure payment</div>
                <div style={styles.headSecure}>
                  <IconShield /> 256-bit SSL · Shri Temple Trust
                </div>
              </div>
            </div>
            {step !== 'processing' && (
              <button style={styles.closeBtn} onClick={onClose}>
                <IconX />
              </button>
            )}
          </div>

          {step !== 'success' && <OrderBar booking={booking} total={total} />}
          {step !== 'processing' && <ProgressBar step={step} />}

          <div key={animKey} className="spm-slide-in">
            {step === 'method' && <MethodSelector selected={method} onSelect={setMethod} onContinue={() => navigate('details')} />}

            {step === 'details' && (
              <div style={styles.body}>
                <button style={styles.backBtn} onClick={() => navigate('method')}>
                  <IconArrowLeft /> Back
                </button>
                {method === 'card' && (
                  <CardDetails
                    cardNum={cardNum}
                    setCardNum={setCardNum}
                    cardName={cardName}
                    setCardName={setCardName}
                    expiry={expiry}
                    setExpiry={setExpiry}
                    cvv={cvv}
                    setCvv={setCvv}
                    saveCard={saveCard}
                    setSaveCard={setSaveCard}
                  />
                )}
                {method === 'upi' && <UpiDetails upiId={upiId} setUpiId={setUpiId} />}
                {method === 'netbanking' && <NetBankingDetails bank={bank} setBank={setBank} />}
                {method === 'wallet' && <WalletDetails wallet={wallet} setWallet={setWallet} />}
                <button style={{ ...styles.payBtn, marginTop: 16 }} onClick={() => navigate('confirm')}>
                  Review & pay <IconArrowRight />
                </button>
              </div>
            )}

            {step === 'confirm' && (
              <ConfirmStep
                booking={booking}
                amount={amount}
                tax={tax}
                total={total}
                method={method}
                cardNum={cardNum}
                upiId={upiId}
                bank={bank}
                wallet={wallet}
                onBack={() => navigate('details')}
                onPay={() => navigate('processing')}
              />
            )}

            {step === 'processing' && <ProcessingStep booking={booking} onDone={handleProcessingDone} />}

            {step === 'success' && (
              <SuccessStep
                booking={paidBooking}
                amount={amount}
                tax={tax}
                total={total}
                method={method}
                txnId={txnId}
                onClose={onClose}
                onViewPass={() => {
                  onClose();
                  onViewEsevaPass(paidBooking);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const MODAL_STYLES = `
  @keyframes spm-slide-in {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .spm-slide-in {
    animation: spm-slide-in 0.28s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @media (max-width: 480px) {
    .spm-modal-inner {
      border-radius: 22px 22px 0 0 !important;
      max-height: 92vh !important;
    }
    .spm-overlay-inner {
      align-items: flex-end !important;
      padding: 0 !important;
    }
  }
`;

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9900,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '92vh',
    overflowY: 'auto',
    borderRadius: 22,
    background: 'var(--color-background-primary, hsl(var(--card)))',
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    scrollbarWidth: 'none',
  },
  modalHead: {
    padding: '18px 20px 16px',
    borderBottom: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    background: '#635bff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  },
  headSecure: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    background: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))',
  },
  orderBar: {
    margin: '16px 20px',
    padding: '13px 15px',
    background: 'var(--color-background-secondary, hsl(var(--muted)))',
    borderRadius: 14,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  orderIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: '#635bff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  orderName: { fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))', lineHeight: 1.3 },
  orderMeta: { fontSize: 12, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))', marginTop: 2 },
  orderAmount: { fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))', letterSpacing: '-0.01em' },
  orderGst: { fontSize: 11, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))' },
  progBar: { padding: '0 20px 14px', display: 'flex', alignItems: 'flex-start', gap: 0 },
  progStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 },
  progDot: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 500,
    border: '0.5px solid',
    transition: 'all 0.25s',
    flexShrink: 0,
  },
  progLine: { flex: 1, height: 0.5, marginTop: 12, transition: 'background 0.25s' },
  progLabel: { fontSize: 10, textAlign: 'center', whiteSpace: 'nowrap' },
  body: { padding: '0 20px 20px' },
  sectionLabel: { fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' },
  methodGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
  methodCard: {
    padding: '14px 13px',
    borderRadius: 14,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    background: 'var(--color-background-primary, hsl(var(--card)))',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    position: 'relative',
    textAlign: 'left',
    transition: 'border-color 0.18s, background 0.18s',
  },
  methodCardActive: { border: '1.5px solid #635bff', background: '#f5f4ff' },
  methodPopular: {
    position: 'absolute',
    top: -1,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 9,
    fontWeight: 500,
    background: '#635bff',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '0 0 6px 6px',
    whiteSpace: 'nowrap',
  },
  methodCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#635bff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconWrap: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  methodName: { fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' },
  methodSub: { fontSize: 11, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))', marginTop: 2 },
  cardVisual: {
    height: 160,
    borderRadius: 16,
    background: '#1a1a2e',
    padding: '18px 20px 16px',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardChip: { width: 30, height: 22, background: '#c9a84c', borderRadius: 4 },
  cardNetwork: { position: 'absolute', top: 18, right: 18, display: 'flex' },
  cardNetCircle: { width: 24, height: 24, borderRadius: '50%' },
  cardNum: { fontSize: 15, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)', marginTop: 18, fontFamily: 'monospace' },
  cardRow: { display: 'flex', gap: 28, marginTop: 10 },
  cardLbl: { fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  cardVal: { fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace', letterSpacing: '0.05em' },
  input: {
    width: '100%',
    padding: '10px 13px',
    borderRadius: 10,
    border: '0.5px solid var(--color-border-secondary, hsl(var(--border)))',
    background: 'var(--color-background-primary, hsl(var(--card)))',
    fontSize: 14,
    color: 'var(--color-text-primary, hsl(var(--foreground)))',
    outline: 'none',
    fontFamily: 'inherit',
  },
  saveCardRow: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 4 },
  upiWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    background: 'var(--color-background-secondary, hsl(var(--muted)))',
    borderRadius: 14,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    marginBottom: 14,
  },
  upiQrGrid: {
    width: 96,
    height: 96,
    background: '#fff',
    borderRadius: 10,
    padding: 8,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 1.5,
    marginBottom: 10,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
  },
  upiQrCell: { borderRadius: 1 },
  upiAppPill: {
    fontSize: 11,
    padding: '3px 9px',
    borderRadius: 20,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))',
    background: 'var(--color-background-primary, hsl(var(--card)))',
  },
  upiOr: { textAlign: 'center', fontSize: 11, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))', margin: '14px 0 12px', position: 'relative' },
  bankGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 },
  bankCard: {
    padding: '11px 13px',
    borderRadius: 12,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    background: 'var(--color-background-primary, hsl(var(--card)))',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'border-color 0.15s',
    textAlign: 'left',
  },
  bankCardActive: { border: '1.5px solid #635bff', background: '#f5f4ff' },
  bankDot: { width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, flexShrink: 0 },
  bankName: { fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' },
  bankType: { fontSize: 11, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))' },
  moreLink: {
    fontSize: 12,
    color: '#635bff',
    textAlign: 'center',
    cursor: 'pointer',
    padding: 8,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    borderRadius: 10,
    marginBottom: 14,
  },
  miniCheck: { width: 18, height: 18, borderRadius: '50%', background: '#635bff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  walletRow: {
    padding: '12px 14px',
    borderRadius: 12,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    background: 'var(--color-background-primary, hsl(var(--card)))',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    transition: 'border-color 0.15s',
    textAlign: 'left',
    width: '100%',
  },
  walletRowActive: { border: '1.5px solid #635bff', background: '#f5f4ff' },
  walletRadio: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '0.5px solid var(--color-border-secondary, hsl(var(--border)))',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletRadioDot: { width: 8, height: 8, borderRadius: '50%', background: '#635bff' },
  walletEmoji: { width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  walletName: { fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' },
  walletBal: { fontSize: 11 },
  summaryCard: {
    background: 'var(--color-background-secondary, hsl(var(--muted)))',
    borderRadius: 14,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    padding: '14px 16px',
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  methodPill: {
    padding: '11px 14px',
    borderRadius: 12,
    border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    background: 'var(--color-background-secondary, hsl(var(--muted)))',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  procWrap: { padding: '36px 20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' },
  procRingWrap: { position: 'relative', width: 76, height: 76 },
  procPct: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-primary, hsl(var(--foreground)))',
  },
  procTitle: { fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' },
  procStatus: { fontSize: 12, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))', minHeight: 18 },
  procSecure: { display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 11, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))' },
  successWrap: { padding: '28px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  successRing: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: '#f0fdf4',
    border: '0.5px solid #bbf7d0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: { fontSize: 19, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))', marginBottom: 4 },
  successSub: { fontSize: 13, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))', marginBottom: 20 },
  receiptCard: { width: '100%', borderRadius: 16, border: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))', overflow: 'hidden' },
  receiptCardHead: {
    padding: '11px 15px',
    background: 'var(--color-background-secondary, hsl(var(--muted)))',
    borderBottom: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paidBadge: {
    fontSize: 11,
    fontWeight: 500,
    background: '#f0fdf4',
    color: '#166534',
    border: '0.5px solid #bbf7d0',
    padding: '2px 10px',
    borderRadius: 20,
  },
  receiptRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  receiptKey: { fontSize: 12, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))' },
  receiptVal: { fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary, hsl(var(--foreground)))' },
  receiptTotal: {
    padding: '11px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '0.5px solid var(--color-border-tertiary, hsl(var(--border)))',
  },
  divider: { height: 0.5, background: 'var(--color-border-tertiary, hsl(var(--border)))' },
  payBtn: {
    width: '100%',
    padding: 13,
    borderRadius: 12,
    border: 'none',
    background: '#635bff',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))',
    fontSize: 13,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: 0,
    marginBottom: 16,
  },
  btnGhost: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: '0.5px solid var(--color-border-secondary, hsl(var(--border)))',
    background: 'none',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-primary, hsl(var(--foreground)))',
    cursor: 'pointer',
  },
  btnSolid: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: 'none',
    background: '#635bff',
    fontSize: 13,
    fontWeight: 500,
    color: '#fff',
    cursor: 'pointer',
  },
  trustRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12 },
  trustItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-secondary, hsl(var(--muted-foreground)))' },
};

export default SevaPaymentModal;
