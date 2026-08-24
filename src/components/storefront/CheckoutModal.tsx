import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentGateway, Order, OrderItem } from '../../types';
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Truck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  MessageCircle,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  country?: string;
  zip?: string;
  cardNumber?: string;
  cardExp?: string;
  cardCvc?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    cartSubtotal,
    appliedCoupon,
    formatPrice,
    currentUser,
    addToast,
    setIsCustomerPortalOpen,
    currency
  } = useStore();

  const [email, setEmail] = useState(currentUser.email || '');
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [zip, setZip] = useState('');

  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('stripe');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: details, 2: payment, 3: review

  const hasPhysical = cart.some(i => i.product.productType === 'physical_projector');

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? (cartSubtotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  const estimatedTax = Number((cartSubtotal * 0.05).toFixed(2));
  const finalTotal = Math.max(0, Number((cartSubtotal - discountAmount + estimatedTax).toFixed(2)));

  const validateDetails = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Full name is required.';
    if (!email.trim()) next.email = 'Email is required for digital key delivery.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!phone.trim()) next.phone = 'Phone number is required.';

    if (hasPhysical) {
      if (!street.trim()) next.street = 'Street address is required for hardware orders.';
      if (!city.trim()) next.city = 'City is required.';
      if (!country.trim()) next.country = 'Country is required.';
      if (!zip.trim()) next.zip = 'Postal code is required.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validatePayment = (): boolean => {
    if (selectedGateway !== 'stripe') return true;
    const next: FormErrors = {};
    const digitsOnly = cardNumber.replace(/\s/g, '').replace(/•/g, '');
    if (!digitsOnly || digitsOnly.length < 12) next.cardNumber = 'Please enter a valid card number.';
    if (!cardExp || !/^\d{2}\/\d{2}$/.test(cardExp)) next.cardExp = 'Format: MM/YY';
    if (!cardCvc || cardCvc.length < 3) next.cardCvc = 'Invalid CVC.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (validateDetails()) {
        setStep(2);
        setErrors({});
      }
      return;
    }

    if (step === 2) {
      if (validatePayment()) {
        setStep(3);
        setErrors({});
      }
      return;
    }

    // step === 3 → process payment
    setIsProcessing(true);

    setTimeout(() => {
      const orderItems: OrderItem[] = cart.map(item => {
        const unitPrice = item.variation ? item.variation.price : item.product.price;
        const isPhys = item.product.productType === 'physical_projector';
        const generatedKey = isPhys
          ? undefined
          : `PB-${item.product.sku.slice(0, 4)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        return {
          productId: item.productId,
          productTitle: item.product.title,
          productType: item.product.productType,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          variation: item.variation,
          licenseKeys: generatedKey ? [generatedKey] : undefined,
          trackingNumber: isPhys ? `DHL-${Math.floor(100000000 + Math.random() * 900000000)}` : undefined
        };
      });

      const newOrder: Order = {
        id: `PB-ORD-${Date.now().toString().slice(-6)}`,
        userId: currentUser.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        items: orderItems,
        subtotal: cartSubtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        tax: estimatedTax,
        shippingFee: 0,
        total: finalTotal,
        currency: currency.code,
        paymentGateway: selectedGateway,
        paymentStatus: 'paid',
        orderStatus: 'completed',
        digitalDeliveredAt: new Date().toISOString(),
        shippingAddress: hasPhysical ? {
          street,
          city,
          state: '',
          country,
          postalCode: zip
        } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCompletedOrder(newOrder);
      setIsProcessing(false);
      clearCart();
      setStep(1);
      addToast('success', 'Payment Successful!', `Order ${newOrder.id} confirmed. Digital keys are ready.`);
    }, 1200);
  };

  const handleClose = () => {
    if (isProcessing) return;
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
    setStep(1);
    setErrors({});
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    addToast('success', 'Key Copied', 'License key copied to clipboard.');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const gateways: { id: PaymentGateway; name: string; tag: string; badgeColor: string }[] = [
    { id: 'stripe', name: 'Credit Card / Apple Pay', tag: 'Stripe 256-bit', badgeColor: 'text-indigo-400 border-indigo-500/30' },
    { id: 'lemonsqueezy', name: 'Lemon Squeezy', tag: 'Global SaaS Checkout', badgeColor: 'text-amber-400 border-amber-500/30' },
    { id: 'paypal', name: 'PayPal One-Click', tag: 'Buyer Protection', badgeColor: 'text-blue-400 border-blue-500/30' },
    { id: 'jazzcash', name: 'JazzCash Direct', tag: 'Pakistan Mobile Wallet', badgeColor: 'text-red-400 border-red-500/30' },
    { id: 'easypaisa', name: 'Easypaisa Gateway', tag: 'Instant QR / OTC', badgeColor: 'text-emerald-400 border-emerald-500/30' },
    { id: 'crypto', name: 'Crypto (USDT / BTC)', tag: 'Zero-Fee Web3', badgeColor: 'text-cyan-400 border-cyan-500/30' }
  ];

  // Empty-cart safeguard (shouldn't normally happen, but prevent broken UX)
  if (isCheckoutOpen && cart.length === 0 && !completedOrder) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl bg-[#0F111A] border border-white/10 shadow-2xl p-8 text-center z-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white font-display mt-4">Your cart is empty</h2>
            <p className="text-xs text-neutral-400 mt-1.5">Add some products before checking out.</p>
            <button
              onClick={handleClose}
              className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold font-display"
            >
              Back to Store
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            aria-hidden="true"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl rounded-3xl bg-[#0F111A] border border-white/15 shadow-2xl p-4 sm:p-6 lg:p-8 z-10 my-6 max-h-[94vh] overflow-y-auto scrollbar-thin"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            {/* Top Close Button */}
            {!isProcessing && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close checkout"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* ====================================================
                ORDER SUCCESS SCREEN
                ==================================================== */}
            {completedOrder ? (
              <div className="space-y-6 text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                    PAYMENT CONFIRMED · ORDER #{completedOrder.id}
                  </span>
                  <h2 id="checkout-success-title" className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-3">
                    Your Digital Assets Are Ready!
                  </h2>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1.5">
                    A permanent invoice and backup keys have been dispatched to{' '}
                    <span className="text-white font-mono">{completedOrder.customerEmail}</span>.
                  </p>
                </div>

                {/* Digital Key Locker Box */}
                <div className="max-w-2xl mx-auto rounded-2xl bg-[#141622] border border-white/10 p-4 sm:p-5 text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
                    <span className="font-bold text-white font-display flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>Instant Digital Key Vault</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">VERIFIED</span>
                  </div>

                  <div className="space-y-3">
                    {completedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate pr-2">{item.productTitle}</span>
                          <span className="text-xs font-mono text-neutral-400 shrink-0">Qty: {item.quantity}</span>
                        </div>

                        {item.variation && (
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {item.variation.type}: <span className="text-neutral-200">{item.variation.value}</span>
                          </div>
                        )}

                        {item.licenseKeys && item.licenseKeys.map((key, kIdx) => (
                          <div key={kIdx} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#0F111A] border border-white/10 font-mono text-xs text-emerald-400">
                            <span className="font-bold tracking-wider truncate">{key}</span>
                            <button
                              onClick={() => copyToClipboard(key)}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1 shrink-0 transition-colors"
                              aria-label="Copy license key"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedKey === key ? 'COPIED!' : 'COPY'}</span>
                            </button>
                          </div>
                        ))}

                        {item.trackingNumber && (
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-300">
                            <span className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-red-400" />
                              <span>DHL Tracking: <strong className="text-white">{item.trackingNumber}</strong></span>
                            </span>
                            <span className="text-[10px] text-neutral-400">Departing Warehouse</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsCustomerPortalOpen(true);
                    }}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-display transition-colors flex items-center gap-2"
                  >
                    <span>View in Customer Locker</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleClose}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold font-display shadow-lg shadow-red-950/40"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              /* =============================================
                  CHECKOUT FORM VIEW (3-step wizard)
                  ============================================= */
              <div className="space-y-5">
                {/* Header + Step Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 id="checkout-title" className="text-lg sm:text-xl font-bold text-white font-display">
                        Secure Checkout
                      </h2>
                      <p className="text-xs text-neutral-400">
                        Encrypted 256-bit · Instant digital key delivery
                      </p>
                    </div>
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider">
                    {[
                      { n: 1, label: 'Details' },
                      { n: 2, label: 'Payment' },
                      { n: 3, label: 'Review' },
                    ].map((s, idx) => (
                      <React.Fragment key={s.n}>
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-md border ${
                            step === s.n
                              ? 'bg-red-500/15 text-red-300 border-red-500/40'
                              : step > s.n
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'text-neutral-500 border-white/5'
                          }`}
                        >
                          {step > s.n ? <Check className="w-3 h-3" /> : <span>{s.n}</span>}
                          <span>{s.label}</span>
                        </div>
                        {idx < 2 && <span className="text-neutral-600">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
                  {/* LEFT: FORM FIELDS */}
                  <div className="lg:col-span-7 space-y-5">
                    {step === 1 && (
                      <>
                        {/* Customer Details */}
                        <div className="space-y-3">
                          <div className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
                            1. Delivery Recipient Details
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="ck-name" className="block text-[11px] text-neutral-400 mb-1">
                                Full Name
                              </label>
                              <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                                <input
                                  id="ck-name"
                                  type="text"
                                  required
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  disabled={isProcessing}
                                  className={`input-sharp w-full pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 ${
                                    errors.name ? 'input-error' : ''
                                  }`}
                                  placeholder="John Doe"
                                  autoComplete="name"
                                />
                              </div>
                              {errors.name && (
                                <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {errors.name}
                                </p>
                              )}
                            </div>

                            <div>
                              <label htmlFor="ck-email" className="block text-[11px] text-neutral-400 mb-1">
                                Email (For Digital Keys)
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                                <input
                                  id="ck-email"
                                  type="email"
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  disabled={isProcessing}
                                  className={`input-sharp w-full pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 ${
                                    errors.email ? 'input-error' : ''
                                  }`}
                                  placeholder="you@example.com"
                                  autoComplete="email"
                                />
                              </div>
                              {errors.email && (
                                <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {errors.email}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label htmlFor="ck-phone" className="block text-[11px] text-neutral-400 mb-1">
                              Phone (Optional — for delivery updates)
                            </label>
                            <input
                              id="ck-phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              disabled={isProcessing}
                              className={`input-sharp w-full px-3 py-2 text-xs text-white placeholder-neutral-500 ${
                                errors.phone ? 'input-error' : ''
                              }`}
                              placeholder="+1 (555) 000-0000"
                              autoComplete="tel"
                            />
                            {errors.phone && (
                              <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Shipping Address (If Projector is in cart) */}
                        {hasPhysical && (
                          <div className="space-y-3 pt-2">
                            <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5" />
                              <span>2. DHL Insured Shipping Address (Hardware)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] text-neutral-400 mb-1">Street Address</label>
                                <input
                                  type="text"
                                  value={street}
                                  onChange={(e) => setStreet(e.target.value)}
                                  disabled={isProcessing}
                                  className={`input-sharp w-full px-3 py-2 text-xs text-white placeholder-neutral-500 ${
                                    errors.street ? 'input-error' : ''
                                  }`}
                                  placeholder="742 Evergreen Terrace"
                                  autoComplete="street-address"
                                />
                                {errors.street && (
                                  <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.street}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-[11px] text-neutral-400 mb-1">City</label>
                                <input
                                  type="text"
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                  disabled={isProcessing}
                                  className={`input-sharp w-full px-3 py-2 text-xs text-white placeholder-neutral-500 ${
                                    errors.city ? 'input-error' : ''
                                  }`}
                                  placeholder="Beverly Hills"
                                />
                                {errors.city && (
                                  <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.city}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-[11px] text-neutral-400 mb-1">Postal Code</label>
                                <input
                                  type="text"
                                  value={zip}
                                  onChange={(e) => setZip(e.target.value)}
                                  disabled={isProcessing}
                                  className={`input-sharp w-full px-3 py-2 text-xs text-white placeholder-neutral-500 ${
                                    errors.zip ? 'input-error' : ''
                                  }`}
                                  placeholder="90210"
                                  autoComplete="postal-code"
                                />
                                {errors.zip && (
                                  <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.zip}
                                  </p>
                                )}
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-[11px] text-neutral-400 mb-1">Country</label>
                                <input
                                  type="text"
                                  value={country}
                                  onChange={(e) => setCountry(e.target.value)}
                                  disabled={isProcessing}
                                  className={`input-sharp w-full px-3 py-2 text-xs text-white placeholder-neutral-500 ${
                                    errors.country ? 'input-error' : ''
                                  }`}
                                  placeholder="United States"
                                  autoComplete="country-name"
                                />
                                {errors.country && (
                                  <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.country}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {step === 2 && (
                      <>
                        {/* Payment Gateway Selection */}
                        <div className="space-y-3">
                          <div className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
                            Select Payment Method
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {gateways.map((gw) => (
                              <button
                                key={gw.id}
                                type="button"
                                onClick={() => setSelectedGateway(gw.id)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  selectedGateway === gw.id
                                    ? 'bg-red-500/15 border-red-500/50 shadow-md shadow-red-950/30'
                                    : 'bg-[#141622] hover:bg-white/5 border-white/10'
                                }`}
                              >
                                <div className="text-xs font-bold text-white leading-tight font-display">{gw.name}</div>
                                <div className={`text-[10px] mt-1 font-mono ${selectedGateway === gw.id ? 'text-red-400 font-bold' : 'text-neutral-400'}`}>
                                  {gw.tag}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Card fields */}
                        {selectedGateway === 'stripe' && (
                          <div className="p-4 rounded-2xl bg-[#141622] border border-white/5 space-y-3">
                            <div className="flex items-center justify-between text-xs text-neutral-300 font-mono">
                              <span>Card Information</span>
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Test Sandbox Ready
                              </span>
                            </div>

                            <div>
                              <label className="block text-[11px] text-neutral-400 mb-1">Card Number</label>
                              <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                                <input
                                  type="text"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                  disabled={isProcessing}
                                  className={`input-sharp w-full pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-neutral-500 ${
                                    errors.cardNumber ? 'input-error' : ''
                                  }`}
                                  placeholder="4242 4242 4242 4242"
                                  inputMode="numeric"
                                  autoComplete="cc-number"
                                />
                              </div>
                              {errors.cardNumber && (
                                <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {errors.cardNumber}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-neutral-400 mb-1">Expiry (MM/YY)</label>
                                <input
                                  type="text"
                                  value={cardExp}
                                  onChange={(e) => setCardExp(e.target.value)}
                                  disabled={isProcessing}
                                  className={`input-sharp w-full px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 ${
                                    errors.cardExp ? 'input-error' : ''
                                  }`}
                                  placeholder="12/28"
                                  inputMode="numeric"
                                  autoComplete="cc-exp"
                                />
                                {errors.cardExp && (
                                  <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.cardExp}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-[11px] text-neutral-400 mb-1">CVC</label>
                                <input
                                  type="text"
                                  value={cardCvc}
                                  onChange={(e) => setCardCvc(e.target.value)}
                                  disabled={isProcessing}
                                  className={`input-sharp w-full px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 ${
                                    errors.cardCvc ? 'input-error' : ''
                                  }`}
                                  placeholder="888"
                                  inputMode="numeric"
                                  autoComplete="cc-csc"
                                />
                                {errors.cardCvc && (
                                  <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.cardCvc}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedGateway !== 'stripe' && (
                          <div className="p-4 rounded-2xl bg-[#141622] border border-white/5 text-xs text-neutral-400 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            <span>You'll be redirected to {gateways.find(g => g.id === selectedGateway)?.name} to complete payment.</span>
                          </div>
                        )}
                      </>
                    )}

                    {step === 3 && (
                      <div className="space-y-3">
                        <div className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
                          Review & Confirm
                        </div>

                        <div className="p-4 rounded-xl bg-[#141622] border border-white/5 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Name</span>
                            <span className="text-white">{name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Email</span>
                            <span className="text-white font-mono">{email}</span>
                          </div>
                          {hasPhysical && (
                            <div className="flex justify-between gap-4">
                              <span className="text-neutral-400 shrink-0">Ship to</span>
                              <span className="text-white text-right">{street}, {city} {zip}, {country}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Payment</span>
                            <span className="text-white">{gateways.find(g => g.id === selectedGateway)?.name}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          By clicking "Pay", you authorize PlayBeat Digital to charge your selected payment method for the total amount shown. Keys / shipping notifications will be delivered to your email instantly upon confirmation.
                        </p>
                      </div>
                    )}

                    {/* Step navigation */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      {step > 1 ? (
                        <button
                          type="button"
                          onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                          disabled={isProcessing}
                          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold font-display shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Authorizing & Allocating Keys...</span>
                          </>
                        ) : step === 3 ? (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Pay {formatPrice(finalTotal)} & Reveal Keys</span>
                          </>
                        ) : (
                          <>
                            <span>{step === 1 ? 'Continue to Payment' : 'Review Order'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* RIGHT: ORDER SUMMARY (always visible) */}
                  <div className="lg:col-span-5">
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#141622] border border-white/10 space-y-4 lg:sticky lg:top-0">
                      <div className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5 flex items-center justify-between">
                        <span>Order Summary</span>
                        <span className="text-neutral-400">({cart.length} items)</span>
                      </div>

                      {/* Items brief */}
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                        {cart.map((item) => {
                          const unitPrice = item.variation ? item.variation.price : item.product.price;
                          return (
                            <div key={`${item.productId}-${item.variation?.id}`} className="flex items-start gap-2.5 text-xs">
                              <div className="w-10 h-10 rounded-md bg-black/40 overflow-hidden shrink-0">
                                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-medium truncate">{item.product.title}</div>
                                <div className="text-[10px] text-neutral-400 font-mono">
                                  Qty: {item.quantity}
                                  {item.variation && ` · ${item.variation.value}`}
                                </div>
                              </div>
                              <span className="font-mono text-white font-bold shrink-0">{formatPrice(unitPrice * item.quantity)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Totals */}
                      <div className="space-y-1.5 text-xs pt-3 border-t border-white/5">
                        <div className="flex justify-between text-neutral-400">
                          <span>Subtotal</span>
                          <span className="font-mono text-white">{formatPrice(cartSubtotal)}</span>
                        </div>

                        {discountAmount > 0 && (
                          <div className="flex justify-between text-red-400 font-mono">
                            <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                            <span>-{formatPrice(discountAmount)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-neutral-400">
                          <span>Estimated Tax</span>
                          <span className="font-mono text-white">{formatPrice(estimatedTax)}</span>
                        </div>

                        <div className="flex justify-between text-neutral-400">
                          <span>Express Shipping</span>
                          <span className="text-emerald-400 font-mono">FREE</span>
                        </div>

                        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                          <span>Total</span>
                          <span className="text-base text-red-400 font-mono">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>

                      {/* Trust badges */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                        <div className="text-center p-2 rounded-lg bg-black/30">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                          <div className="text-[9px] text-neutral-400 mt-1 font-mono uppercase">Secure</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-black/30">
                          <Zap className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                          <div className="text-[9px] text-neutral-400 mt-1 font-mono uppercase">Instant</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-black/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mx-auto" />
                          <div className="text-[9px] text-neutral-400 mt-1 font-mono uppercase">Verified</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
