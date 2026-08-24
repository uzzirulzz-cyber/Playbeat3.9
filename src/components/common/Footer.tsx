import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  MessageCircle,
  Mail,
  Send,
  CreditCard,
  Lock,
  ExternalLink,
  BadgeCheck
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { categories, setSelectedCategory, setIsWhatsAppModalOpen, setActiveView, addToast, brandingLogoUrl, currentUser } = useStore();

  const directChannels = [
    {
      label: 'WeChat @playbeatdigital',
      href: 'https://weixin.qq.com/',
      icon: BadgeCheck,
      className: 'bg-[#0ea5e9]/10 text-[#7dd3fc] border border-[#0ea5e9]/30',
    },
    {
      label: 'WhatsApp @playbeatdigital1',
      href: 'https://wa.me/923000000000?text=Hello%20PlayBeat%20Digital%20Team!',
      icon: MessageCircle,
      className: 'bg-[#22c55e]/10 text-[#86efac] border border-[#22c55e]/30',
    },
    {
      label: 'Telegram @playbeatdigital',
      href: 'https://t.me/playbeatdigital',
      icon: Send,
      className: 'bg-[#38bdf8]/10 text-[#7dd3fc] border border-[#38bdf8]/30',
    },
  ];

  return (
    <footer className="w-full bg-[#070709] border-t border-white/10 text-zinc-300 relative overflow-hidden">
      {/* 4% Subtle Red Gradient Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-red-600/[0.04] blur-[120px] pointer-events-none" />

      {/* 1. TRUST BADGES / ASSURANCE BAR */}
      <div className="border-b border-white/10 bg-[#09090C] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl modern-card">
            <div className="w-11 h-11 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white font-display">Instant Delivery</div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Digital keys revealed in 5s 24/7</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl modern-card">
            <div className="w-11 h-11 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white font-display">100% Genuine Licenses</div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Authorized source & warranty</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl modern-card">
            <div className="w-11 h-11 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white font-display">Tracked Shipping</div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">DHL & FedEx for Projectors</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl modern-card">
            <div className="w-11 h-11 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white font-display">256-Bit SSL Encrypted</div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Stripe, PayPal, Crypto</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Col 1: Brand & Bio */}
        <div className="lg:col-span-2 space-y-4">
          <img src={brandingLogoUrl} alt="PlayBeat Digital" className="w-56 sm:w-64 h-auto object-contain object-left" />

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm">
            PlayBeat Digital is a premier international marketplace delivering instant digital CD keys, software licenses, gaming accounts, IPTV servers, and flagship 4K Smart Laser Projectors worldwide with bank-grade buyer protection.
          </p>

          <div className="footer-admin-profile flex items-center gap-3 w-fit rounded-xl border border-[#26334A] bg-[#0b1426] px-3 py-2">
            <img src={brandingLogoUrl} alt="Super Admin" className="h-9 w-9 rounded-full border border-[#1769FF]/50 bg-[#071d58] object-contain p-1" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#60a5fa]">Super Admin</div>
              <div className="text-xs font-semibold text-white">{currentUser.id === 'guest' ? 'PlayBeat Digital' : currentUser.name}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="btn-glossy btn-glossy-blue btn-glossy-sm flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp VIP</span>
            </button>

            {directChannels.map(({ label, href, icon: Icon, className }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={() => addToast('info', 'Direct Support', `${label} opened in a new tab.`)}
                className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all hover:brightness-110 ${className}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </a>
            ))}

            <a
              href="mailto:support@playbeat.digital"
              className="btn-glossy btn-glossy-dark btn-glossy-circle"
              aria-label="Email Support"
            >
              <Mail className="w-4 h-4 text-zinc-300" />
            </a>
          </div>
        </div>

        {/* Col 2: Digital Categories */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-[0.15em] font-mono">Digital Catalog</div>
          <ul className="space-y-2 text-xs sm:text-sm">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setSelectedCategory(c.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Hardware & Subscriptions */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-[0.15em] font-mono">Hardware & Media</div>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <button
                onClick={() => {
                  setSelectedCategory('smart-projectors');
                  const el = document.getElementById('projectors-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1.5"
              >
                <span>4K Laser UST Projectors</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedCategory('iptv')}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Ultra IPTV 16K Channels
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedCategory('streaming')}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Netflix 4K & Spotify
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedCategory('saas-tools')}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Canva Pro & Adobe Suite
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedCategory('software')}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Windows 11 Pro Keys
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Operations & System */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-[0.15em] font-mono">Platform & Admin</div>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <button
                onClick={() => setActiveView('admin')}
                className="text-zinc-200 hover:text-red-400 font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <span>Admin Panel</span>
                <ExternalLink className="w-3.5 h-3.5 text-red-400" />
              </button>
            </li>
            <li>
              <span className="text-zinc-400 font-mono text-xs">G2G Engine: <span className="text-emerald-400 font-bold">ONLINE</span></span>
            </li>
            <li>
              <span className="text-zinc-400 font-mono text-xs">Variant Engine: <span className="text-emerald-400 font-bold">ACTIVE</span></span>
            </li>
            <li>
              <span className="text-zinc-400 font-mono text-xs">Delivery Latency: <span className="text-white font-bold">&lt; 5.2s</span></span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. BOTTOM COPYRIGHT & PAYMENT METHODS */}
      <div className="border-t border-white/10 bg-[#050507] py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            © {new Date().getFullYear()} PlayBeat Digital (playbeat.digital). All Rights Reserved.
          </div>

          <a
            href="https://playbeat.digital/policy"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-300 hover:text-white transition-colors underline underline-offset-4"
          >
            Privacy Policy
          </a>

          <a
            href="https://playbeat.digital/terms"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-300 hover:text-white transition-colors underline underline-offset-4"
          >
            Terms of Service
          </a>

          <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px] tracking-wider uppercase">
            <span>STRIPE</span>
            <span>•</span>
            <span>LEMON SQUEEZY</span>
            <span>•</span>
            <span>PAYPAL</span>
            <span>•</span>
            <span>JAZZCASH</span>
            <span>•</span>
            <span>EASYPAISA</span>
            <span>•</span>
            <span>USDT / WEB3</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
