import React, { useEffect, useState } from 'react';
import {
  ReceiptText,
  CheckCircle2,
  Lock,
  CreditCard,
  Shield,
  ChevronRight,
  Building2,
  X,
  Printer,
} from 'lucide-react';
import { cn, formatDateDDMMYYYY } from '@/lib/utils';

type PaymentStep = 'method' | 'card' | 'processing' | 'receipt';
type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

export type SevaPaymentFlowBooking = {
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

interface PoojaSevaPaymentFlowProps {
  booking: SevaPaymentFlowBooking;
  amount: number;
  onClose: () => void;
  onPaid: (booking: SevaPaymentFlowBooking) => void;
  onViewEsevaPass: (booking: SevaPaymentFlowBooking) => void;
}

const METHOD_OPTIONS: {
  id: PaymentMethod;
  label: string;
  sub: string;
  icon: React.ReactNode;
  badge?: string;
}[] = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    sub: 'Visa, Mastercard, RuPay',
    badge: 'Most Popular',
    icon: (
      <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none">
        <rect width="38" height="24" rx="4" fill="#1A1F71" />
        <rect x="0" y="8" width="38" height="6" fill="#F7B600" />
        <circle cx="14" cy="12" r="5" fill="#EB001B" fillOpacity="0.9" />
        <circle cx="24" cy="12" r="5" fill="#F79E1B" fillOpacity="0.9" />
        <path d="M19 8.5a5 5 0 0 1 0 7 5 5 0 0 1 0-7z" fill="#FF5F00" />
      </svg>
    ),
  },
  {
    id: 'upi',
    label: 'UPI Payment',
    sub: 'GPay, PhonePe, Paytm, BHIM',
    icon: (
      <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none">
        <rect
          width="38"
          height="24"
          rx="4"
          fill="#F5F5F5"
          stroke="#e0e0e0"
          strokeWidth="0.5"
        />
        <text
          x="4"
          y="16"
          fontSize="9"
          fontWeight="900"
          fill="#097939"
          fontFamily="sans-serif"
        >
          UPI
        </text>
        <circle cx="28" cy="12" r="6" fill="#FF6B35" />
        <path
          d="M25 12l3 3 5-5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    sub: 'SBI, HDFC, ICICI, Axis & more',
    icon: (
      <span className="w-8 h-5 flex items-center justify-center bg-blue-700 rounded-sm">
        <Building2 className="w-3.5 h-3.5 text-white" />
      </span>
    ),
  },
  {
    id: 'wallet',
    label: 'Mobile Wallet',
    sub: 'Paytm, Amazon Pay, Mobikwik',
    icon: (
      <svg viewBox="0 0 38 24" className="w-8 h-5" fill="none">
        <rect width="38" height="24" rx="4" fill="#00BAF2" />
        <text
          x="5"
          y="16"
          fontSize="10"
          fontWeight="900"
          fill="#fff"
          fontFamily="sans-serif"
        >
          Pay
        </text>
        <text
          x="20"
          y="16"
          fontSize="10"
          fontWeight="700"
          fill="#fff"
          fontFamily="sans-serif"
        >
          tm
        </text>
      </svg>
    ),
  },
];

const NET_BANK_OPTIONS = [
  { id: 'sbi', name: 'SBI', sub: 'State Bank of India', short: 'SBI' },
  { id: 'hdfc', name: 'HDFC', sub: 'HDFC Bank', short: 'HDFC' },
  { id: 'icici', name: 'ICICI', sub: 'ICICI Bank', short: 'ICICI' },
  { id: 'axis', name: 'Axis', sub: 'Axis Bank', short: 'AXIS' },
  { id: 'kotak', name: 'Kotak', sub: 'Kotak Mahindra', short: 'KOT' },
  { id: 'pnb', name: 'PNB', sub: 'Punjab National Bank', short: 'PNB' },
];

const WALLET_OPTIONS = [
  { id: 'paytm', name: 'Paytm', sub: 'Paytm Wallet', badge: 'Fast' },
  { id: 'amazon-pay', name: 'Amazon Pay', sub: 'Amazon Pay Balance' },
  { id: 'mobikwik', name: 'Mobikwik', sub: 'Mobikwik Wallet' },
];

function formatCardNumber(val: string) {
  return val
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(val: string) {
  const c = val.replace(/\D/g, '').slice(0, 4);
  return c.length >= 3 ? c.slice(0, 2) + '/' + c.slice(2) : c;
}

const ProcessingScreen: React.FC<{ onDone: () => void; pooja: string }> = ({
  onDone,
  pooja,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(
    'Initialising secure session...',
  );

  useEffect(() => {
    const steps = [
      { at: 200, text: 'Connecting to payment gateway...', val: 12 },
      { at: 800, text: 'Verifying devotee details...', val: 34 },
      { at: 1400, text: 'Processing seva booking...', val: 56 },
      { at: 2000, text: 'Authorising payment...', val: 74 },
      { at: 2700, text: 'Confirming with temple ledger...', val: 90 },
      { at: 3300, text: 'Booking confirmed! 🙏', val: 100 },
    ];
    const timers = steps.map((s) =>
      setTimeout(() => {
        setProgress(s.val);
        setStatusText(s.text);
      }, s.at),
    );
    const done = setTimeout(onDone, 3800);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="pseva-processing">
      <div className="pseva-processing__om" aria-hidden="true">
        ॐ
      </div>
      <div className="pseva-processing__ring">
        <svg viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="rgba(41,48,136,0.1)"
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="url(#pgGrad2)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.136} 213.6`}
            strokeDashoffset="53.4"
            style={{
              transition: 'stroke-dasharray 0.55s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
          <defs>
            <linearGradient id="pgGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#293088" />
              <stop offset="100%" stopColor="#E22E26" />
            </linearGradient>
          </defs>
        </svg>
        <div className="pseva-processing__pct">{progress}%</div>
      </div>
      <p className="pseva-processing__pooja">{pooja}</p>
      <p className="pseva-processing__status">{statusText}</p>
      <div className="pseva-processing__bar">
        <div className="pseva-processing__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="pseva-processing__badges">
        <span>
          <Shield className="w-3 h-3" /> 256-bit SSL
        </span>
        <span>
          <Lock className="w-3 h-3" /> PCI-DSS Level 1
        </span>
        <span>
          <CheckCircle2 className="w-3 h-3" /> 3D Secure
        </span>
      </div>
    </div>
  );
};

const SevaReceipt: React.FC<{
  booking: SevaPaymentFlowBooking;
  method: PaymentMethod;
  amount: number;
  onClose: () => void;
  onViewReceipt: () => void;
}> = ({ booking, method, amount, onClose, onViewReceipt }) => {
  const txId = `TXN-${Date.now().toString(36).toUpperCase()}`;
  const authCode = `AUTH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const tax = +(amount * 0.05).toFixed(2);
  const total = +(amount + tax).toFixed(2);
  const now = new Date();
  const methodLabel = METHOD_OPTIONS.find((m) => m.id === method)?.label ?? 'Card';

  return (
    <div className="pseva-receipt-wrap">
      <div className="pseva-receipt-confetti" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="pseva-receipt-confetti__dot"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.7}s`,
              background: ['#293088', '#E22E26', '#4F58CA', '#E55C52', '#F7B600', '#FF6B35', '#00C9A7'][i % 7],
            }}
          />
        ))}
      </div>

      <div className="pseva-receipt">
        <div className="pseva-receipt__head">
          <div className="pseva-receipt__success-ring">
            <span className="pseva-receipt__om-icon">🙏</span>
          </div>
          <h2 className="pseva-receipt__title">Seva Booking Confirmed</h2>
          <p className="pseva-receipt__sub">
            Payment received ·{' '}
            {now.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="pseva-receipt__amount-hero">
          <span className="pseva-receipt__currency">INR</span>
          <span className="pseva-receipt__amount">₹{total.toLocaleString('en-IN')}</span>
        </div>

        <div className="pseva-receipt__divider">
          <span className="pseva-receipt__paid-stamp">PAID</span>
        </div>

        <div className="pseva-receipt__details">
          {[
            { label: 'Receipt No.', value: booking.receiptNumber, mono: true },
            { label: 'Booking Code', value: booking.bookingCode, mono: true },
            { label: 'Devotee', value: booking.devoteeName },
            { label: 'Pooja / Seva', value: booking.poojaType },
            { label: 'Date of Seva', value: formatDateDDMMYYYY(booking.date) },
            { label: 'Time Slot', value: booking.slot },
            { label: 'Payment Via', value: methodLabel },
            { label: 'Transaction ID', value: txId, mono: true },
            { label: 'Auth Code', value: authCode, mono: true },
          ].map((row) => (
            <div key={row.label} className="pseva-receipt__row">
              <span className="pseva-receipt__label">{row.label}</span>
              <span
                className={cn('pseva-receipt__value', row.mono && 'pseva-receipt__value--mono')}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="pseva-receipt__breakdown">
          <div className="pseva-receipt__brow">
            <span>Seva Dakshina</span>
            <span>₹{amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="pseva-receipt__brow">
            <span>GST (5%)</span>
            <span>₹{tax.toLocaleString('en-IN')}</span>
          </div>
          <div className="pseva-receipt__brow pseva-receipt__brow--total">
            <span>Total Paid</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="pseva-receipt__temple">
          <span className="text-lg">🛕</span>
          <div>
            <p className="pseva-receipt__temple-name">Shri Temple Trust</p>
            <p className="pseva-receipt__temple-sub">Official Seva Booking · Digital Receipt</p>
          </div>
        </div>

        <div className="pseva-receipt__perf" aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        <div className="pseva-receipt__barcode">
          <div className="pseva-receipt__bars">
            {Array.from({ length: 44 }).map((_, i) => (
              <span
                key={i}
                style={{ height: `${8 + Math.sin(i * 1.3) * 8 + Math.random() * 8}px` }}
              />
            ))}
          </div>
          <p className="pseva-receipt__barcode-text">{txId}</p>
        </div>

        <div className="pseva-receipt__security">
          <Shield className="w-3.5 h-3.5" />
          <span>Secured by 256-bit TLS · GST Compliant · PCI-DSS Certified</span>
        </div>

        <div className="pseva-receipt__actions">
          <button className="pseva-receipt__btn pseva-receipt__btn--outline" onClick={onClose}>
            <X className="w-4 h-4" /> Close
          </button>
          <button
            className="pseva-receipt__btn pseva-receipt__btn--outline"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="pseva-receipt__btn pseva-receipt__btn--solid" onClick={onViewReceipt}>
            <ReceiptText className="w-4 h-4" /> E-Seva Pass
          </button>
        </div>
      </div>
    </div>
  );
};

const PoojaSevaPaymentFlow: React.FC<PoojaSevaPaymentFlowProps> = ({
  booking,
  amount,
  onClose,
  onPaid,
  onViewEsevaPass,
}) => {
  const [step, setStep] = useState<PaymentStep>('method');
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [selectedWallet, setSelectedWallet] = useState('paytm');
  const [saveCard, setSaveCard] = useState(false);
  const [paidBooking, setPaidBooking] = useState<SevaPaymentFlowBooking>(booking);

  const tax = +(amount * 0.05).toFixed(2);
  const total = +(amount + tax);

  const handleProcessingDone = () => {
    const updated = {
      ...booking,
      paymentStatus: 'Paid' as const,
      bookingStatus: 'Confirmed' as const,
    };
    setPaidBooking(updated);
    onPaid(updated);
    setStep('receipt');
  };

  const canProceedCard =
    method !== 'card' ||
    (cardNum.length >= 19 &&
      expiry.length >= 5 &&
      cvv.length >= 3 &&
      name.trim().length > 1);
  const canProceedUpi = method !== 'upi' || upiId.includes('@');
  const canProceedNetBanking = method !== 'netbanking' || !!selectedBank;
  const canProceedWallet = method !== 'wallet' || !!selectedWallet;
  const canProceed =
    canProceedCard && canProceedUpi && canProceedNetBanking && canProceedWallet;

  return (
    <>
      <style>{sevaPayStyles}</style>
      <div className="pseva-overlay" onClick={step !== 'processing' ? onClose : undefined}>
        <div className="pseva-modal" onClick={(e) => e.stopPropagation()}>
          {step === 'method' && (
            <div className="pseva-panel pseva-panel--enter">
              <div className="pseva-panel__header">
                <div className="pseva-panel__brand">
                  <Lock className="w-4 h-4" />
                  <span>Secure Seva Payment</span>
                </div>
                <button className="pseva-panel__close" onClick={onClose}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="pseva-summary">
                <div className="pseva-summary__service">
                  <div className="pseva-summary__icon">
                    <span className="text-lg">🙏</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="pseva-summary__name">{booking.poojaType}</p>
                    <p className="pseva-summary__devotee">
                      {booking.devoteeName} · {formatDateDDMMYYYY(booking.date)}
                    </p>
                  </div>
                  <div className="pseva-summary__amount">₹{total.toLocaleString('en-IN')}</div>
                </div>
                <div className="pseva-summary__breakdown">
                  <span>Seva ₹{amount.toLocaleString('en-IN')}</span>
                  <span>·</span>
                  <span>GST ₹{tax.toLocaleString('en-IN')}</span>
                  <span>·</span>
                  <span>{booking.slot}</span>
                </div>
              </div>

              <p className="pseva-section-label">Select payment method</p>
              <div className="pseva-methods">
                {METHOD_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    className={cn('pseva-method', method === m.id && 'pseva-method--active')}
                    onClick={() => setMethod(m.id)}
                  >
                    <span className="pseva-method__radio">
                      <span
                        className={cn(
                          'pseva-method__radio-dot',
                          method === m.id && 'pseva-method__radio-dot--active',
                        )}
                      />
                    </span>
                    {m.icon}
                    <span className="pseva-method__info">
                      <span className="pseva-method__label">{m.label}</span>
                      <span className="pseva-method__sub">{m.sub}</span>
                    </span>
                    {m.badge && <span className="pseva-method__badge">{m.badge}</span>}
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
                  </button>
                ))}
              </div>

              <button
                className="pseva-cta"
                onClick={() => setStep('card')}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
              <p className="pseva-secure-note">
                <Shield className="w-3 h-3" /> SSL encrypted · RBI regulated · Funds go directly to temple trust
              </p>
            </div>
          )}

          {step === 'card' && (
            <div className="pseva-panel pseva-panel--enter">
              <div className="pseva-panel__header">
                <button className="pseva-panel__back" onClick={() => setStep('method')}>
                  ← Back
                </button>
                <span className="pseva-panel__step-title">
                  {method === 'upi'
                    ? 'UPI Payment'
                    : method === 'netbanking'
                      ? 'Net Banking'
                      : method === 'wallet'
                        ? 'Mobile Wallet'
                        : 'Card Details'}
                </span>
                <button className="pseva-panel__close" onClick={onClose}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {method === 'card' ? (
                <>
                  <div className="pseva-card-visual">
                    <div className="pseva-card-visual__chip">
                      <svg viewBox="0 0 30 22" className="w-7 h-5">
                        <rect width="30" height="22" rx="3" fill="#D4AF37" />
                        <rect x="7" y="0" width="2" height="22" fill="#B8941F" opacity="0.5" />
                        <rect x="21" y="0" width="2" height="22" fill="#B8941F" opacity="0.5" />
                        <rect x="0" y="7" width="30" height="2" fill="#B8941F" opacity="0.5" />
                        <rect x="0" y="13" width="30" height="2" fill="#B8941F" opacity="0.5" />
                      </svg>
                    </div>
                    <div className="pseva-card-visual__network">
                      <svg viewBox="0 0 52 32" className="w-12">
                        <circle cx="18" cy="16" r="12" fill="#EB001B" opacity="0.9" />
                        <circle cx="34" cy="16" r="12" fill="#F79E1B" opacity="0.9" />
                        <path d="M26 7a12 12 0 0 1 0 18 12 12 0 0 1 0-18z" fill="#FF5F00" />
                      </svg>
                    </div>
                    <p className="pseva-card-visual__number">
                      {cardNum ? cardNum.padEnd(19, '·').slice(0, 19) : '•••• •••• •••• ••••'}
                    </p>
                    <div className="pseva-card-visual__bottom">
                      <div>
                        <p className="pseva-card-visual__sub">Card Holder</p>
                        <p className="pseva-card-visual__val">{name || 'YOUR NAME'}</p>
                      </div>
                      <div>
                        <p className="pseva-card-visual__sub">Expires</p>
                        <p className="pseva-card-visual__val">{expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pseva-form">
                    <div className="pseva-form__group">
                      <label className="pseva-form__label">Cardholder Name</label>
                      <input
                        className="pseva-form__input"
                        placeholder="Name on card"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="pseva-form__group">
                      <label className="pseva-form__label">Card Number</label>
                      <div className="pseva-form__input-wrap">
                        <input
                          className="pseva-form__input"
                          placeholder="0000 0000 0000 0000"
                          value={cardNum}
                          onChange={(e) => setCardNum(formatCardNumber(e.target.value))}
                          maxLength={19}
                          inputMode="numeric"
                        />
                        <CreditCard className="pseva-form__input-icon w-4 h-4" />
                      </div>
                    </div>
                    <div className="pseva-form__row">
                      <div className="pseva-form__group">
                        <label className="pseva-form__label">Expiry</label>
                        <input
                          className="pseva-form__input"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                          inputMode="numeric"
                        />
                      </div>
                      <div className="pseva-form__group">
                        <label className="pseva-form__label">CVV</label>
                        <div className="pseva-form__input-wrap">
                          <input
                            className="pseva-form__input"
                            placeholder="•••"
                            value={cvv}
                            onChange={(e) =>
                              setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                            }
                            maxLength={4}
                            type="password"
                            inputMode="numeric"
                          />
                          <Shield className="pseva-form__input-icon w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                    <label className="pseva-save-card">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="pseva-save-card__check"
                      />
                      <span>Save card for future seva payments</span>
                    </label>
                  </div>
                </>
              ) : method === 'upi' ? (
                <div className="pseva-upi-form">
                  <div className="pseva-upi-hero">
                    <div className="pseva-upi-hero__icon">
                      <svg viewBox="0 0 60 60" className="w-14 h-14">
                        <circle cx="30" cy="30" r="30" fill="#F5F5F5" />
                        <text
                          x="8"
                          y="38"
                          fontSize="18"
                          fontWeight="900"
                          fill="#097939"
                          fontFamily="sans-serif"
                        >
                          UPI
                        </text>
                      </svg>
                    </div>
                    <p className="pseva-upi-hero__text">Pay instantly using UPI</p>
                    <p className="pseva-upi-hero__sub">Enter your UPI ID or scan QR below</p>
                  </div>

                  <div className="pseva-upi-qr">
                    <svg viewBox="0 0 120 120" className="w-28 h-28">
                      <rect width="120" height="120" fill="white" />
                      {Array.from({ length: 10 }).map((_, row) =>
                        Array.from({ length: 10 }).map((_, col) =>
                          Math.random() > 0.5 ? (
                            <rect
                              key={`${row}-${col}`}
                              x={col * 12}
                              y={row * 12}
                              width="11"
                              height="11"
                              fill="#1a1a2e"
                              rx="1"
                            />
                          ) : null,
                        ),
                      )}
                      <rect
                        x="40"
                        y="40"
                        width="40"
                        height="40"
                        fill="white"
                        stroke="#1a1a2e"
                        strokeWidth="2"
                        rx="4"
                      />
                      <text x="60" y="66" textAnchor="middle" fontSize="16" fill="#293088">
                        🛕
                      </text>
                    </svg>
                    <p className="pseva-upi-qr__label">Scan with any UPI app</p>
                  </div>
                  <div className="pseva-upi-divider">
                    <span>or enter UPI ID</span>
                  </div>
                  <div className="pseva-form">
                    <div className="pseva-form__group">
                      <label className="pseva-form__label">Your UPI ID</label>
                      <input
                        className="pseva-form__input"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : method === 'netbanking' ? (
                <div className="pseva-options-wrap">
                  <p className="pseva-options-title">Choose your bank</p>
                  <div className="pseva-options-grid">
                    {NET_BANK_OPTIONS.map((bank) => (
                      <button
                        key={bank.id}
                        className={cn(
                          'pseva-option-card',
                          selectedBank === bank.id && 'pseva-option-card--active',
                        )}
                        onClick={() => setSelectedBank(bank.id)}
                      >
                        <span className="pseva-option-logo">{bank.short}</span>
                        <span className="pseva-option-copy">
                          <span className="pseva-option-name">{bank.name}</span>
                          <span className="pseva-option-sub">{bank.sub}</span>
                        </span>
                        {selectedBank === bank.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pseva-options-wrap">
                  <p className="pseva-options-title">Choose mobile wallet</p>
                  <div className="pseva-options-stack">
                    {WALLET_OPTIONS.map((wallet) => (
                      <button
                        key={wallet.id}
                        className={cn(
                          'pseva-option-card',
                          selectedWallet === wallet.id &&
                            'pseva-option-card--active',
                        )}
                        onClick={() => setSelectedWallet(wallet.id)}
                      >
                        <span className="pseva-option-logo pseva-option-logo--wallet">
                          {wallet.name === 'Paytm'
                            ? 'Paytm'
                            : wallet.name === 'Amazon Pay'
                              ? 'Amz'
                              : 'Mobi'}
                        </span>
                        <span className="pseva-option-copy">
                          <span className="pseva-option-name">{wallet.name}</span>
                          <span className="pseva-option-sub">{wallet.sub}</span>
                        </span>
                        {wallet.badge && (
                          <span className="pseva-option-badge">{wallet.badge}</span>
                        )}
                        {selectedWallet === wallet.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                className={cn('pseva-cta', !canProceed && 'pseva-cta--disabled')}
                onClick={() => setStep('processing')}
                disabled={!canProceed}
              >
                <Lock className="w-4 h-4" />
                Pay ₹{total.toLocaleString('en-IN')}
              </button>
              <p className="pseva-secure-note">
                <Shield className="w-3 h-3" /> 3D Secure · PCI-DSS Level 1 · RBI Certified
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="pseva-panel pseva-panel--center">
              <ProcessingScreen onDone={handleProcessingDone} pooja={booking.poojaType} />
            </div>
          )}

          {step === 'receipt' && (
            <SevaReceipt
              booking={paidBooking}
              method={method}
              amount={amount}
              onClose={onClose}
              onViewReceipt={() => {
                onClose();
                onViewEsevaPass(paidBooking);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

const sevaPayStyles = `
.pseva-overlay {
  position: fixed; inset: 0; z-index: 9900;
  background: rgba(4,8,20,0.65);
  backdrop-filter: blur(8px) saturate(1.5);
  -webkit-backdrop-filter: blur(8px) saturate(1.5);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
  animation: pseva-overlay-in 0.2s ease;
}
@keyframes pseva-overlay-in { from { opacity:0 } to { opacity:1 } }

.pseva-modal {
  width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto;
  border-radius: 22px; background: #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.06), 0 28px 72px -12px rgba(0,0,0,0.46), 0 8px 24px -6px rgba(41,48,136,0.2);
  scrollbar-width: none;
  animation: pseva-modal-in 0.34s cubic-bezier(0.34,1.56,0.64,1);
}
.pseva-modal::-webkit-scrollbar { display:none; }
@keyframes pseva-modal-in {
  from { opacity:0; transform: scale(0.9) translateY(24px) }
  to   { opacity:1; transform: scale(1) translateY(0) }
}

.pseva-panel { padding: 1.5rem; }
.pseva-panel--center { display:flex; align-items:center; justify-content:center; min-height:380px; }
.pseva-panel--enter { animation: pseva-panel-slide 0.24s ease both; }
@keyframes pseva-panel-slide { from { opacity:0; transform:translateX(14px) } to { opacity:1; transform:translateX(0) } }

.pseva-panel__header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; }
.pseva-panel__brand { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:#293088; letter-spacing:0.01em; }
.pseva-panel__close, .pseva-panel__back { background:none; border:none; cursor:pointer; color:#999; transition:color 0.18s; display:flex; align-items:center; font-size:13px; }
.pseva-panel__close:hover, .pseva-panel__back:hover { color:#111; }
.pseva-panel__step-title { font-size:15px; font-weight:700; color:#1a1a2e; }

.pseva-summary { border-radius:14px; background:linear-gradient(135deg,#f0f1fb 0%,#fff8f5 100%); border:1px solid rgba(41,48,136,0.14); padding:14px 16px; margin-bottom:1.25rem; }
.pseva-summary__service { display:flex; align-items:center; gap:12px; }
.pseva-summary__icon { width:40px; height:40px; border-radius:12px; flex-shrink:0; background:linear-gradient(135deg,#293088 0%,#E22E26 100%); display:flex; align-items:center; justify-content:center; }
.pseva-summary__name { font-size:14px; font-weight:700; color:#1a1a2e; }
.pseva-summary__devotee { font-size:11px; color:#888; margin-top:2px; }
.pseva-summary__amount { font-size:20px; font-weight:900; color:#293088; margin-left:auto; font-variant-numeric:tabular-nums; }
.pseva-summary__breakdown { margin-top:8px; font-size:11px; color:#aaa; display:flex; gap:6px; flex-wrap:wrap; }

.pseva-section-label { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#bbb; margin-bottom:10px; }

.pseva-methods { display:flex; flex-direction:column; gap:8px; margin-bottom:1.25rem; }
.pseva-method { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; border:1.5px solid #e8e9f3; background:#fff; cursor:pointer; text-align:left; transition:border-color 0.18s, background 0.18s, box-shadow 0.18s; }
.pseva-method:hover { border-color:#293088; background:#f8f9ff; }
.pseva-method--active { border-color:#293088; background:linear-gradient(135deg,#f0f1fb 0%,#fff 100%); box-shadow:0 0 0 3px rgba(41,48,136,0.1); }
.pseva-method__radio { width:18px; height:18px; border-radius:50%; border:2px solid #ccc; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:border-color 0.18s; }
.pseva-method--active .pseva-method__radio { border-color:#293088; }
.pseva-method__radio-dot { width:8px; height:8px; border-radius:50%; background:#293088; transform:scale(0); transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1); }
.pseva-method__radio-dot--active { transform:scale(1); }
.pseva-method__info { display:flex; flex-direction:column; gap:1px; flex:1; min-width:0; }
.pseva-method__label { font-size:13px; font-weight:600; color:#1a1a2e; }
.pseva-method__sub { font-size:11px; color:#aaa; }
.pseva-method__badge { font-size:9px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; background:linear-gradient(135deg,#293088,#E22E26); color:#fff; padding:2px 8px; border-radius:99px; white-space:nowrap; }

.pseva-card-visual { height:168px; border-radius:16px; background:linear-gradient(135deg,#1a1f71 0%,#293088 40%,#4F58CA 75%,#E22E26 100%); padding:18px 20px 16px; position:relative; margin-bottom:1.25rem; box-shadow:0 16px 40px -12px rgba(41,48,136,0.55),0 4px 12px -4px rgba(0,0,0,0.3); overflow:hidden; }
.pseva-card-visual::before { content:''; position:absolute; top:-40px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.07); }
.pseva-card-visual::after { content:''; position:absolute; bottom:-60px; left:-20px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.04); }
.pseva-card-visual__chip { margin-bottom:16px; }
.pseva-card-visual__network { position:absolute; top:18px; right:18px; }
.pseva-card-visual__number { font-size:17px; font-weight:600; letter-spacing:0.18em; color:rgba(255,255,255,0.92); font-variant-numeric:tabular-nums; margin-bottom:14px; position:relative; z-index:1; font-family:'Courier New',monospace; }
.pseva-card-visual__bottom { display:flex; gap:32px; position:relative; z-index:1; }
.pseva-card-visual__sub { font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.55); margin-bottom:2px; }
.pseva-card-visual__val { font-size:12px; font-weight:600; color:rgba(255,255,255,0.92); letter-spacing:0.04em; text-transform:uppercase; }

.pseva-form { display:flex; flex-direction:column; gap:14px; margin-bottom:1.25rem; }
.pseva-form__row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.pseva-form__group { display:flex; flex-direction:column; gap:5px; }
.pseva-form__label { font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#aaa; }
.pseva-form__input-wrap { position:relative; }
.pseva-form__input { width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid #e2e4f0; background:#fafbff; font-size:14px; color:#1a1a2e; transition:border-color 0.2s, box-shadow 0.2s; outline:none; font-variant-numeric:tabular-nums; }
.pseva-form__input:focus { border-color:#293088; box-shadow:0 0 0 3px rgba(41,48,136,0.1); background:#fff; }
.pseva-form__input-wrap .pseva-form__input { padding-right:38px; }
.pseva-form__input-icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#ccc; pointer-events:none; }
.pseva-save-card { display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; color:#666; }
.pseva-save-card__check { accent-color:#293088; }

.pseva-upi-form { margin-bottom:1.25rem; }
.pseva-upi-hero { text-align:center; padding:16px 0 8px; }
.pseva-upi-hero__icon { display:flex; justify-content:center; margin-bottom:8px; }
.pseva-upi-hero__text { font-size:16px; font-weight:700; color:#1a1a2e; }
.pseva-upi-hero__sub { font-size:12px; color:#aaa; margin-top:4px; }
.pseva-upi-qr { display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; margin:12px auto; background:#f8f9ff; border:1.5px dashed #c0c3e0; border-radius:14px; width:fit-content; }
.pseva-upi-qr__label { font-size:11px; color:#aaa; font-weight:600; }
.pseva-upi-divider { text-align:center; font-size:12px; color:#bbb; font-weight:600; margin:12px 0; position:relative; }
.pseva-upi-divider::before, .pseva-upi-divider::after { content:''; position:absolute; top:50%; width:38%; height:1px; background:#e8e9f3; }
.pseva-upi-divider::before { left:0; } .pseva-upi-divider::after { right:0; }

.pseva-options-wrap { margin-bottom:1.1rem; }
.pseva-options-title { font-size:12px; font-weight:700; color:#4b5078; margin-bottom:10px; }
.pseva-options-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.pseva-options-stack { display:flex; flex-direction:column; gap:8px; }
.pseva-option-card { display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:10px 11px; border-radius:11px; border:1.5px solid #e2e4f0; background:#fff; transition:border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
.pseva-option-card:hover { border-color:#b9bfe8; transform:translateY(-1px); }
.pseva-option-card--active { border-color:#293088; box-shadow:0 0 0 3px rgba(41,48,136,0.12); background:#f7f8ff; }
.pseva-option-logo { min-width:42px; height:30px; padding:0 8px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:#eef1ff; color:#293088; font-size:10px; font-weight:900; letter-spacing:0.02em; }
.pseva-option-logo--wallet { min-width:52px; }
.pseva-option-copy { display:flex; flex-direction:column; min-width:0; }
.pseva-option-name { font-size:12px; font-weight:700; color:#1a1a2e; line-height:1.2; }
.pseva-option-sub { font-size:10px; color:#8a8fab; line-height:1.2; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pseva-option-badge { font-size:9px; font-weight:800; letter-spacing:0.04em; text-transform:uppercase; background:#e22e26; color:#fff; padding:2px 7px; border-radius:999px; }

.pseva-cta { width:100%; padding:14px; border-radius:12px; border:none; cursor:pointer; font-size:15px; font-weight:800; letter-spacing:0.02em; color:#fff; display:flex; align-items:center; justify-content:center; gap:8px; background:linear-gradient(135deg,#293088 0%,#4F58CA 50%,#E22E26 100%); box-shadow:0 8px 24px -6px rgba(41,48,136,0.5),0 2px 8px -2px rgba(226,46,38,0.25); transition:transform 0.2s, box-shadow 0.2s, filter 0.2s; margin-bottom:10px; }
.pseva-cta:hover { transform:translateY(-2px); box-shadow:0 14px 32px -8px rgba(41,48,136,0.6),0 4px 12px -2px rgba(226,46,38,0.32); filter:brightness(1.06); }
.pseva-cta:active { transform:translateY(0); }
.pseva-cta--disabled { opacity:0.6; }

.pseva-secure-note { display:flex; align-items:center; justify-content:center; gap:5px; font-size:11px; color:#ccc; text-align:center; }

.pseva-processing { display:flex; flex-direction:column; align-items:center; gap:16px; padding:2rem; text-align:center; }
.pseva-processing__om { font-size:36px; animation:pseva-om-pulse 2s ease-in-out infinite; }
@keyframes pseva-om-pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.12);opacity:1} }
.pseva-processing__ring { position:relative; width:84px; height:84px; }
.pseva-processing__ring svg { transform:rotate(-90deg); width:84px; height:84px; }
.pseva-processing__pct { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; color:#293088; }
.pseva-processing__pooja { font-size:14px; font-weight:700; color:#1a1a2e; }
.pseva-processing__status { font-size:12px; color:#888; min-height:18px; }
.pseva-processing__bar { width:220px; height:4px; border-radius:99px; background:#f0f1fb; overflow:hidden; }
.pseva-processing__fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#293088,#E22E26); transition:width 0.55s cubic-bezier(0.4,0,0.2,1); }
.pseva-processing__badges { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:8px; }
.pseva-processing__badges span { display:flex; align-items:center; gap:4px; font-size:10px; color:#bbb; font-weight:600; }

.pseva-receipt-wrap { position:relative; overflow:hidden; }
.pseva-receipt-confetti { position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:0; }
.pseva-receipt-confetti__dot { position:absolute; top:-10px; width:7px; height:7px; border-radius:2px; animation:pseva-conf-fall 1.3s ease-in both; }
@keyframes pseva-conf-fall { from{transform:translateY(-10px) rotate(0deg);opacity:1} to{transform:translateY(460px) rotate(600deg);opacity:0} }
.pseva-receipt { padding:1.75rem 1.5rem 1.5rem; position:relative; z-index:1; }
.pseva-receipt__head { text-align:center; margin-bottom:1.25rem; }
.pseva-receipt__success-ring { width:66px; height:66px; border-radius:50%; margin:0 auto 12px; background:linear-gradient(135deg,#FF6B35,#E22E26); display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 8px rgba(226,46,38,0.12),0 10px 28px -8px rgba(226,46,38,0.5); animation:pseva-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
@keyframes pseva-pop { from{transform:scale(0.3);opacity:0} to{transform:scale(1);opacity:1} }
.pseva-receipt__om-icon { font-size:30px; }
.pseva-receipt__title { font-size:20px; font-weight:800; color:#1a1a2e; }
.pseva-receipt__sub { font-size:12px; color:#aaa; margin-top:4px; }

.pseva-receipt__amount-hero { text-align:center; margin:1.25rem 0 1rem; display:flex; align-items:baseline; justify-content:center; gap:6px; }
.pseva-receipt__currency { font-size:14px; font-weight:700; color:#aaa; }
.pseva-receipt__amount { font-size:44px; font-weight:900; color:#1a1a2e; font-variant-numeric:tabular-nums; letter-spacing:-0.02em; animation:pseva-amount-in 0.5s ease 0.35s both; }
@keyframes pseva-amount-in { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }

.pseva-receipt__divider { display:flex; align-items:center; gap:12px; margin:1rem 0; }
.pseva-receipt__divider::before, .pseva-receipt__divider::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,transparent,#e2e4f0,transparent); }
.pseva-receipt__paid-stamp { font-size:10px; font-weight:900; letter-spacing:0.18em; color:#00a88e; border:2px solid #00c9a7; border-radius:6px; padding:2px 10px; transform:rotate(-1deg); }

.pseva-receipt__details { background:#f8f9ff; border-radius:12px; border:1px solid #e8e9f5; padding:12px 14px; display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
.pseva-receipt__row { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.pseva-receipt__label { font-size:11px; color:#bbb; font-weight:600; white-space:nowrap; }
.pseva-receipt__value { font-size:12px; font-weight:700; color:#1a1a2e; text-align:right; }
.pseva-receipt__value--mono { font-family:'Courier New',monospace; font-size:11px; color:#666; }

.pseva-receipt__breakdown { border-radius:12px; border:1px solid #e8e9f5; padding:12px 14px; display:flex; flex-direction:column; gap:7px; margin-bottom:12px; }
.pseva-receipt__brow { display:flex; justify-content:space-between; font-size:12px; color:#888; }
.pseva-receipt__brow--total { font-size:14px; font-weight:800; color:#1a1a2e; padding-top:7px; border-top:1px solid #e8e9f5; margin-top:2px; }

.pseva-receipt__temple { display:flex; align-items:center; gap:10px; background:linear-gradient(135deg,#f0f1fb,#fff5f5); border:1px solid rgba(41,48,136,0.12); border-radius:12px; padding:10px 14px; margin-bottom:12px; }
.pseva-receipt__temple-name { font-size:13px; font-weight:700; color:#1a1a2e; }
.pseva-receipt__temple-sub { font-size:10px; color:#aaa; font-weight:600; }

.pseva-receipt__perf { display:flex; justify-content:space-between; margin:14px -1.5rem; padding:0 4px; overflow:hidden; }
.pseva-receipt__perf span { width:12px; height:12px; border-radius:50%; background:#fff; border:1px solid #e8e9f5; flex-shrink:0; margin:0 -4px; }

.pseva-receipt__barcode { display:flex; flex-direction:column; align-items:center; gap:6px; padding:14px 0 8px; }
.pseva-receipt__bars { display:flex; align-items:flex-end; gap:2px; height:40px; }
.pseva-receipt__bars span { display:block; width:2px; border-radius:1px; background:linear-gradient(180deg,#1a1a2e,#666); flex-shrink:0; }
.pseva-receipt__barcode-text { font-size:9px; letter-spacing:0.12em; color:#ccc; font-family:'Courier New',monospace; }

.pseva-receipt__security { display:flex; align-items:center; justify-content:center; gap:5px; font-size:10px; color:#ccc; padding:8px 0; text-align:center; }
.pseva-receipt__actions { display:flex; gap:8px; margin-top:10px; }
.pseva-receipt__btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:11px 12px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; transition:transform 0.18s, box-shadow 0.18s; }
.pseva-receipt__btn:hover { transform:translateY(-1px); }
.pseva-receipt__btn--outline { border:1.5px solid #e2e4f0; background:#fff; color:#666; }
.pseva-receipt__btn--outline:hover { border-color:#c0c3e0; box-shadow:0 4px 12px -4px rgba(0,0,0,0.1); }
.pseva-receipt__btn--solid { border:none; background:linear-gradient(135deg,#293088 0%,#E22E26 100%); color:#fff; box-shadow:0 6px 18px -6px rgba(41,48,136,0.45); }
.pseva-receipt__btn--solid:hover { box-shadow:0 10px 24px -6px rgba(41,48,136,0.55); }

@media (max-width:480px) {
  .pseva-modal { max-width:100%; border-radius:22px 22px 0 0; }
  .pseva-overlay { align-items:flex-end; padding:0; }
  .pseva-receipt__amount { font-size:36px; }
}
`;

export default PoojaSevaPaymentFlow;
