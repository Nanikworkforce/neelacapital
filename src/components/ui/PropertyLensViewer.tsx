import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { TenantProperty } from '../../types/tenant'
import { TENANT_PORTAL_URL } from '../../data/rentals'
import { ease } from '../../lib/motion'

type PropertyLensViewerProps = {
  properties: TenantProperty[]
  loading: boolean
  error: boolean
}

function propertyImage(p: TenantProperty) {
  return p.display_image || p.image_url || p.image
}

function formatPrice(price: string) {
  const n = Number.parseFloat(price)
  if (Number.isNaN(n)) return price
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo`
}

function statusLabel(status: string) {
  if (status === 'vacant') return 'Available'
  if (status === 'coming_soon') return 'Coming Soon'
  if (status === 'occupied') return 'Occupied'
  return status.replace(/_/g, ' ')
}

function statusClass(status: string) {
  if (status === 'vacant') return 'bg-emerald-500/90 text-white'
  if (status === 'coming_soon') return 'bg-gold/90 text-charcoal'
  return 'bg-white/20 text-white backdrop-blur-sm'
}

export default function PropertyLensViewer({ properties, loading, error }: PropertyLensViewerProps) {
  const [index, setIndex] = useState(0)
  const count = properties.length
  const current = properties[index]

  useEffect(() => {
    if (count < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5200)
    return () => clearInterval(timer)
  }, [count])

  if (loading) {
    return (
      <div className="lens-tv mx-auto w-full max-w-4xl">
        <div className="lens-tv__bezel">
          <div className="lens-tv__screen flex min-h-[14rem] items-center justify-center sm:min-h-[18rem] lg:min-h-[22rem]">
            <div className="flex flex-col items-center gap-3 text-white/70">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-gold" />
              <p className="font-accent text-xs tracking-[0.25em] uppercase">Tuning live feed…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || count === 0) {
    return (
      <div className="lens-tv mx-auto w-full max-w-4xl text-center">
        <div className="lens-tv__bezel">
          <div className="lens-tv__screen flex min-h-[12rem] flex-col items-center justify-center gap-4 px-6 sm:min-h-[14rem]">
            <p className="text-sm text-white/80">Live listings are loading from the tenant portal.</p>
            <a
              href={TENANT_PORTAL_URL}
              className="text-sm font-semibold text-gold-light underline-offset-4 hover:underline"
            >
              Open Neela Tenant Portal →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lens-tv mx-auto w-full max-w-4xl">
      <div className="lens-tv__bezel">
        <a
          href={TENANT_PORTAL_URL}
          className="lens-tv__screen group relative block min-h-[14rem] overflow-hidden sm:min-h-[18rem] lg:min-h-[22rem]"
        >
          <div className="lens-tv__scanlines pointer-events-none" />
          <div className="lens-tv__vignette pointer-events-none" />
          <div className="lens-tv__glare pointer-events-none" />

          <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="font-accent text-[10px] font-semibold tracking-[0.2em] text-white uppercase">Live</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease }}
              className="absolute inset-0"
            >
              <motion.img
                src={propertyImage(current)}
                alt={current.name}
                className="h-full w-full object-cover"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1.14 }}
                transition={{ duration: 5.2, ease: 'linear' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/25 to-charcoal/10" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.55, ease }}
                className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
              >
                <div className="min-w-0 text-left">
                  <p className="font-display text-xl text-white sm:text-2xl lg:text-3xl">{current.name}</p>
                  <p className="mt-1 text-sm text-white/75">
                    {current.address}, {current.city}, {current.state}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/65 sm:text-sm">
                    <span>{current.bedrooms} bed</span>
                    <span>{current.bathrooms} bath</span>
                    <span>{current.area}</span>
                    <span>{current.furnishing_type}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <span className="font-display text-2xl text-gold-light sm:text-3xl">{formatPrice(current.price)}</span>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide uppercase ${statusClass(current.status)}`}>
                    {statusLabel(current.status)}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </a>

        <div className="lens-tv__filmstrip overflow-hidden border-t border-white/10 bg-charcoal/90">
          <motion.div
            className="flex w-max gap-2 py-2 pl-2"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: Math.max(40, count * 3), ease: 'linear', repeat: Infinity }}
          >
            {[...properties, ...properties].map((p, i) => (
              <button
                key={`${p.id}-${i}`}
                type="button"
                onClick={() => setIndex(i % count)}
                className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-md border transition-all sm:h-16 sm:w-28 ${
                  index === i % count ? 'border-gold/70 ring-1 ring-gold/40' : 'border-white/15 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={propertyImage(p)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
