import { motion } from 'framer-motion'
import { rentalsMessage } from '../data/rentals'
import { useTenantPortal } from '../hooks/useTenantPortal'
import { useTenantProperties } from '../hooks/useTenantProperties'
import PropertyLensViewer from './ui/PropertyLensViewer'
import { ease, fadeUp, staggerContainer } from '../lib/motion'

export default function Rentals() {
  const { title, portalUrl } = useTenantPortal()
  const { properties, loading, error } = useTenantProperties()

  return (
    <section id="rentals" className="section-pad !pb-8 relative overflow-hidden bg-chelsea-pale sm:!pb-10 lg:!pb-12">
      <div className="absolute inset-0 bg-gradient-to-br from-chelsea/5 via-white/60 to-gold/5" />
      <div className="absolute -right-20 top-10 h-56 w-56 rounded-full bg-chelsea/10 blur-[80px]" />
      <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-gold/10 blur-[70px]" />

      <div className="page-container relative">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-chelsea/15 bg-white/70 px-3 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chelsea opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-chelsea" />
            </span>
            <span className="section-eyebrow">Neela Tenant Portal</span>
          </motion.div>

          <motion.h2 variants={fadeUp} className="section-title mt-5">
            {title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-body sm:text-base">
            {rentalsMessage}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease }}
          className="mt-8 flex flex-col items-center gap-2 sm:mt-10 sm:gap-3"
        >
          <PropertyLensViewer properties={properties} loading={loading} error={error} />
          <motion.a
            href={portalUrl}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ ease }}
            className="btn-shine inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-chelsea/20 bg-gradient-to-r from-chelsea via-chelsea-mid to-gold px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-chelsea/20 sm:px-9 sm:py-4"
          >
            Browse Available Rentals
            <span aria-hidden className="text-white/90">
              →
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
