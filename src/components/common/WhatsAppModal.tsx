import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WhatsAppModal: React.FC = () => {
  const { isWhatsAppModalOpen, setIsWhatsAppModalOpen, createSupportTicket } = useStore();
  const [topic, setTopic] = useState('Product Inquiry / Key Delivery');
  const [message, setMessage] = useState('');

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    createSupportTicket({
      subject: topic,
      message: message.trim() || 'I would like assistance with a digital key or smart projector order.',
    });
    setIsWhatsAppModalOpen(false);
    setMessage('');
  };

  return (
    <AnimatePresence>
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsWhatsAppModalOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl bg-[#0F111A] border border-white/10 shadow-2xl p-6 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">PlayBeat Live Chat</h3>
                  <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Agents Online
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleStartChat} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Support Subject</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#141622] rounded-xl border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="Product Inquiry / Key Delivery">Instant Digital Key / License Support</option>
                  <option value="Smart Projector Specifications & Shipping">4K Smart Projector Consultation</option>
                  <option value="Bulk B2B Purchase / Reseller">Wholesale / B2B Bulk Order</option>
                  <option value="Custom Payment Method Assistance">Payment Gateway Assistance (JazzCash/Crypto/Bank)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Direct Message / Order # (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="How can our technical team assist you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#141622] rounded-xl border border-white/10 p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Your message goes directly to the PlayBeat admin support inbox. Response time: &lt; 2 minutes.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold font-display flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message to Support</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
