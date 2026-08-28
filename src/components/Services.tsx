import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { services } from '../data/content'
import Reveal from './ui/Reveal'
import { ease } from '../lib/motion'

export default function Services() {
  const [active, setActive] = useState(0)

  return (
    <section id="services" className="section-pad !pb-12 relative bg-sand-deep lg:!pb-16">
      <div className="absolute inset-0 mesh-bg opacity-40" />

      <div className="page-container relative">
        <Reveal className="flex flex-col items-start justify-between gap-5 sm:gap-8 lg:flex-row lg:items-end">
          <div>
            <span className="section-eyebrow">
              What We Offer
            </span>
            <h2 className="section-title mt-4">
              Our Services
            </h2>
          </div>
          <p className="max-w-md text-sm text-body sm:text-base">
            Comprehensive investment services designed to align with your financial goals — delivering
            sustainable growth and lasting value.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-2 lg:col-span-4">
            {services.map((service, i) => (
              <motion.button
                key={service.title}
                onClick={() => setActive(i)}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-xl px-4 py-4 text-left transition-all duration-300 sm:px-6 sm:py-5 ${
                  active === i
                    ? 'glass glow-teal border-chelsea/20'
                    : 'hover:bg-white/50'
                }`}
              >
                <span className={`text-sm font-bold tracking-widest ${active === i ? 'text-chelsea' : 'text-gray-dark'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={`mt-1 font-display text-lg sm:text-xl ${active === i ? 'text-ink' : 'text-body'}`}>
                  {service.title}
                </h3>
                {active === i && (
                  <motion.div
                    layoutId="serviceIndicator"
                    className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-chelsea via-gold to-chelsea-light"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-ocean/15 lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
                transition={{ duration: 0.55, ease }}
                className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]"
              >
                <motion.img
                  src={services[active].image}
                  alt={services[active].title}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, ease }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chelsea/92 via-charcoal/55 to-chelsea/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-chelsea/30 to-transparent" />

                <div className="relative flex h-full min-h-[280px] flex-col justify-end p-5 sm:min-h-[360px] sm:p-8 lg:min-h-[420px] lg:p-10">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-accent text-xs font-semibold tracking-[0.3em] uppercase text-gold-light"
                  >
                    Service
                  </motion.span>
                  <motion.h3
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="font-display mt-2 text-2xl font-light text-ivory sm:text-3xl lg:text-4xl"
                  >
                    {services[active].title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:mt-4 sm:text-base"
                  >
                    {services[active].description}
                  </motion.p>
                  <motion.a
                    href="#contact"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    whileHover={{ scale: 1.04 }}
                    className="btn-shine mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-chelsea via-chelsea-mid to-gold px-7 py-3 text-sm font-semibold text-white"
                  >
                    Explore <span>→</span>
                  </motion.a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
