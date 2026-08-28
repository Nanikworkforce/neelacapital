import { motion } from 'framer-motion'
import { stats } from '../data/content'
import { useCountUp } from '../hooks/useCountUp'
import Reveal from './ui/Reveal'
import { ease, staggerContainer, fadeUp } from '../lib/motion'

function StatCard({ value, label, index }: { value: string; label: string; index: number }) {
  const match = value.match(/^([^\d]*)(\d+)(.*)$/)
  const prefix = match?.[1] ?? ''
  const num = parseInt(match?.[2] ?? '0', 10)
  const suffix = match?.[3] ?? ''
  const { ref, count } = useCountUp(num, 2200)

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      transition={{ duration: 0.7, ease, delay: index * 0.12 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border border-chelsea/10 glass p-6 text-center transition-shadow hover:glow-teal sm:p-7"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-chelsea/8 via-transparent to-gold/8 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative font-display text-4xl font-light min-[400px]:text-5xl sm:text-6xl">
        <span className="text-ink">{prefix}</span>
        <span className="text-shimmer">{count}</span>
        <span className="text-ink">{suffix}</span>
      </div>
      <p className="relative mt-3 font-accent text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-dark sm:mt-4 sm:text-xs sm:tracking-[0.2em]">
        {label}
      </p>
    </motion.div>
  )
}

export default function Stats() {
  return (
    <section className="section-pad !pt-12 relative overflow-hidden bg-sand-panel lg:!pt-16">
      <div className="absolute inset-0 bg-gradient-to-r from-chelsea/6 via-white/50 to-gold/8" />
      <motion.div
        className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-chelsea/30 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3], scaleX: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="page-container relative">
        <Reveal className="mb-8 text-center sm:mb-10">
          <span className="section-eyebrow">
            Expertise
          </span>
          <h2 className="section-title mt-4 text-3xl sm:text-4xl">
            Numbers That Speak
          </h2>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-3 sm:gap-6"
        >
          {stats.map((stat, i) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
