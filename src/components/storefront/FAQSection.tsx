import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const { content, setIsWhatsAppModalOpen } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full py-16 px-4 sm:px-6 bg-[var(--pb-ink)] border-b border-[var(--pb-line)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="pb-eyebrow justify-center">
            <HelpCircle className="w-3 h-3" />
            Buyer Assurance & FAQs
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[var(--pb-silver-3)] max-w-md mx-auto">
            Everything you need to know regarding digital delivery, projector shipping warranties, and license verification.
          </p>
        </div>

        <div className="space-y-3">
          {content.faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl overflow-hidden transition-all pb-card ${
                  isOpen ? 'border-[var(--pb-red-line)]' : ''
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 flex items-center justify-between text-left gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-white font-display leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`p-2 rounded-xl border transition-all duration-200 ${
                      isOpen
                        ? 'rotate-180 text-[var(--pb-red-bright)] bg-[var(--pb-red-soft)] border-[var(--pb-red-line)]'
                        : 'text-[var(--pb-silver-2)] bg-white/[0.04] border-[var(--pb-line)]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-[var(--pb-silver-2)] leading-relaxed border-t border-[var(--pb-line)] pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="p-6 rounded-2xl pb-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white font-display">Have a question not answered here?</div>
            <div className="text-xs text-[var(--pb-silver-3)] mt-0.5">
              Our VIP specialists are available 24/7 on WhatsApp.
            </div>
          </div>

          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-xl border border-emerald-300/40 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 px-4 py-2.5 text-xs font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:shadow-[0_14px_30px_rgba(16,185,129,0.34)]"
          >
            <span className="absolute inset-x-0 top-0 h-px bg-white/70" />
            <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Chat with VIP Support</span>
          </button>
        </div>
      </div>
    </section>
  );
};
