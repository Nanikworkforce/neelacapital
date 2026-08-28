import { motion } from 'framer-motion'
import { coreValues } from '../data/content'
import Reveal from './ui/Reveal'
import { cardReveal, staggerSlow } from '../lib/motion'

export default function CoreValues() {
  return (
    <section className="section-pad relative overflow-hidden bg-white">
      <div className="absolute inset-0 aurora-bg opacity-60" />

      <div className="page-container relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">
            What Drives Us
          </span>
          <h2 className="section-title mt-4">
            {coreValues.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-body sm:mt-5 sm:text-lg">
            {coreValues.description}
          </p>
        </Reveal>

        <motion.div
          variants={staggerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 md:grid-cols-3"
        >
          {coreValues.values.map((value, i) => (
            <motion.div
              key={value.title}
              variants={cardReveal}
              whileHover={{ y: -12, rotateX: 2, rotateY: i === 1 ? 0 : i === 0 ? -2 : 2 }}
              className="group relative overflow-hidden rounded-2xl glass p-6 transition-shadow duration-500 hover:glow-teal sm:p-7"
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            >
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-chelsea/8 to-gold/8 transition-transform duration-700 group-hover:scale-125" />

              <motion.span
                className="font-display text-5xl text-gold/40"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: i * 0.8 }}
              >
                {value.icon}
              </motion.span>
              <h3 className="font-display mt-6 text-2xl font-medium text-ink">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-body">{value.description}</p>
              <div className="mt-6 h-0.5 w-0 rounded-full bg-gradient-to-r from-chelsea to-gold transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
