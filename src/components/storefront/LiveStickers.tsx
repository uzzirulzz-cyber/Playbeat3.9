import React from 'react'
import { motion } from 'motion/react'
import products from '../../../data/products.json'

// A small helper to choose "premium" products. Priority: title contains VIP/Premium, price >= 20, otherwise first N
const selectPremium = (items: any[], count = 8) => {
  const byKeyword = items.filter((p) => /vip|premium|pro/i.test(p.title))
  const byPrice = items.filter((p) => typeof p.price === 'number' && p.price >= 20)
  const merged = [...new Map([...byKeyword, ...byPrice, ...items].map(i => [i.sku || i.title, i])).values()]
  return merged.slice(0, count)
}

const premium = selectPremium(products as any[])

const LiveStickers: React.FC = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl px-4">
        <div className="relative p-3 rounded-3xl bg-gradient-to-r from-black/60 via-transparent to-black/40 border border-yellow-400/20 shadow-2xl">
          {/* Premium header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm shadow">VIP STICKERS</span>
              <span className="text-sm text-yellow-200/90">Live • Limited • Premium</span>
            </div>
            <div className="text-xs text-yellow-100/70 font-mono">Exclusive</div>
          </div>

          {/* Sticker list: horizontal, scrollable on small screens, animate with motion */}
          <motion.ul className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {premium.map((p, idx) => (
              <motion.li
                key={p.sku || idx}
                className="flex-none w-36 md:w-44 h-44 md:h-48 rounded-2xl bg-gradient-to-b from-white/5 to-black/30 border border-white/10 shadow-xl relative flex items-center justify-center p-2"
                whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? -2 : 2 }}
                whileTap={{ scale: 0.98 }}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="absolute -top-3 right-3 bg-amber-400 text-black px-2 py-1 rounded-full font-bold text-xs shadow-[0_6px_20px_rgba(250,204,21,0.15)]">VIP</div>
                <div className="w-full h-full flex items-center justify-center">
                  {/* image: prefer product.image, fallback to public stickers */}
                  <img
                    src={p.image && p.image.length ? p.image : `/assets/stickers/sticker${(idx % 3) + 1}.png`}
                    alt={p.title}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg"
                  />
                </div>

                {/* caption */}
                <div className="absolute left-3 bottom-3 right-3 text-center">
                  <div className="text-xs text-yellow-100 font-semibold truncate">{p.description}</div>
                  <div className="text-[11px] text-yellow-200/80 font-mono">{p.price !== null && p.price !== undefined ? `$${p.price}` : p.priceRaw}</div>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          {/* subtle floating glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-yellow-600/4 via-transparent to-white/2 blur-xl" />
        </div>
      </div>
    </div>
  )
}

export default LiveStickers
