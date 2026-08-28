import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { testimonials } from '../data/content'
import Reveal from './ui/Reveal'
import { ease } from '../lib/motion'

export default function Testimonials() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % testimonials.length),
    []
  )
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="section-pad relative overflow-hidden bg-white">
      <div className="absolute top-0 left-1/4 h-48 w-48 rounded-full bg-chelsea/8 blur-[100px] animate-pulse-glow sm:h-72 sm:w-72" />
      <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-gold/8 blur-[100px] animate-pulse-glow sm:h-72 sm:w-72" />

      <div className="page-container relative">
        <Reveal className="text-center">
          <span className="section-eyebrow">
            Testimonials
          </span>
          <h2 className="section-title mx-auto mt-4 max-w-3xl">
            Client Testimonials for Neela Capital Investments
          </h2>
        </Reveal>

        <div className="relative mx-auto mt-10 max-w-4xl sm:mt-14">
          <motion.div
            className="pointer-events-none absolute -top-4 left-2 font-display text-[4.5rem] leading-none text-chelsea/8 select-none sm:-top-8 sm:left-6 sm:text-[6.5rem] lg:text-[8rem]"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            "
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -30, rotateX: 8 }}
              transition={{ duration: 0.6, ease }}
              className="gradient-border rounded-2xl p-[1px]"
            >
              <div className="glass rounded-2xl p-5 glow-teal sm:p-8 lg:p-10">
                <blockquote className="font-display text-lg leading-relaxed text-ink font-light italic sm:text-xl lg:text-2xl xl:text-3xl">
                  "{testimonials[current].quote}"
                </blockquote>

                <div className="mt-8 flex items-center gap-3 sm:mt-10 sm:gap-4">
                  <motion.div
                    key={testimonials[current].name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-chelsea via-chelsea-mid to-gold text-sm font-bold text-white shadow-lg sm:h-14 sm:w-14 sm:text-base"
                  >
                    {testimonials[current].name.charAt(0)}
                  </motion.div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink sm:whitespace-normal">{testimonials[current].name}</p>
                    <p className="text-sm text-gray-dark">{testimonials[current].role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex justify-center gap-2 sm:justify-start">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="relative h-2.5 overflow-hidden rounded-full bg-sand-line transition-all"
                  style={{ width: i === current ? 40 : 10 }}
                  aria-label={`Go to testimonial ${i + 1}`}
                >
                  {i === current && (
                    <motion.div
                      layoutId="testimonialProgress"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-chelsea to-gold"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3 sm:justify-end">
              {[
                { action: prev, label: 'Previous testimonial', icon: '←' },
                { action: next, label: 'Next testimonial', icon: '→' },
              ].map(({ action, label, icon }) => (
                <motion.button
                  key={label}
                  onClick={action}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-line glass text-gray-dark transition-colors hover:border-chelsea/30 hover:text-chelsea"
                  aria-label={label}
                >
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.button
              key={t.name}
              onClick={() => setCurrent(i)}
              whileHover={{ y: -4 }}
              className={`rounded-xl p-4 text-left transition-all duration-300 sm:p-5 ${
                current === i
                  ? 'glass glow-teal border-chelsea/20'
                  : 'border border-sand-line hover:bg-chelsea-pale/50'
              }`}
            >
              <p className="text-sm text-body line-clamp-3 sm:line-clamp-2">"{t.quote}"</p>
              <p className="mt-3 text-xs font-semibold text-ink">{t.name}</p>
              <p className="text-[10px] text-gray-dark">{t.role}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
