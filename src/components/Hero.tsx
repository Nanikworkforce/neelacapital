import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { hero } from '../data/content'
import FloatingOrbs from './ui/FloatingOrbs'
import { ease, staggerContainer, fadeUp } from '../lib/motion'

const words = ['Strategic', 'Real Estate', 'Investments']

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} id="home" className="relative min-h-[100svh] overflow-hidden bg-chelsea-soft sm:min-h-[92vh]">
      <div className="absolute inset-0 aurora-bg" />
      <div className="absolute inset-0 mesh-bg opacity-80" />
      <div className="absolute inset-0 grid-overlay opacity-40" />
      <FloatingOrbs />

      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <motion.img
          src="/images/hero-about.jpg"
          alt=""
          className="h-[115%] w-full object-cover opacity-50"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-chelsea-pale/60 to-chelsea-soft" />
        <div className="absolute inset-0 bg-gradient-to-r from-chelsea-soft/75 via-white/45 to-chelsea-pale/70" />
        <div className="absolute inset-0 bg-gradient-to-tr from-chelsea/12 via-transparent to-gold/6" />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity }}
        className="page-container relative flex min-h-[100svh] flex-col justify-center pt-24 pb-28 sm:min-h-[92vh] sm:pt-28 sm:pb-20"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease }}
            className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-chelsea/15 glass px-3 py-2 backdrop-blur-md sm:mb-6 sm:px-5"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chelsea opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-chelsea" />
            </span>
            <span className="section-eyebrow text-gray-dark">
              Houston Real Estate Excellence
            </span>
          </motion.div>

          <h1 className="font-display text-[2.35rem] font-light leading-[1.05] tracking-tight text-ink min-[400px]:text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
            {words.map((word, i) => (
              <motion.span
                key={word}
                variants={fadeUp}
                transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.1 }}
                className={`mr-[0.25em] inline-block ${i === 1 ? 'text-shimmer italic' : ''}`}
              >
                {word}
                {i < 2 && <br />}
              </motion.span>
            ))}
          </h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.8, ease }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-body sm:mt-6 sm:text-lg lg:text-xl"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease }}
            className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <a
              href="#contact"
              className="btn-shine group inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-chelsea via-chelsea-mid to-gold px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-xl shadow-chelsea/20 transition-all hover:shadow-chelsea/35 hover:scale-[1.03] sm:px-9 sm:py-4"
            >
              {hero.cta}
            </a>
            <a
              href="#services"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-chelsea/25 bg-white/60 px-7 py-3.5 text-sm font-medium text-chelsea backdrop-blur-sm transition-all hover:border-chelsea/40 hover:bg-white hover:scale-[1.02] sm:px-9 sm:py-4"
            >
              Explore Services
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease }}
          className="mt-10 max-w-3xl rounded-2xl glass-ivory p-4 sm:mt-14 sm:p-7"
        >
          <p className="text-base leading-relaxed text-body lg:text-lg">
            At <strong className="font-medium text-ink">Neela Capital Investments</strong>, we deliver
            superior risk-adjusted returns by transforming properties into high-performing assets. Through
            strategic market analysis, value-add strategies, and hands-on management, we maximize
            profitability while mitigating risk. Committed to{' '}
            <em className="text-chelsea not-italic font-medium">Innovation, Sustainability,</em> and{' '}
            <em className="text-gold not-italic font-medium">Community impact,</em> we create lasting value
            and long-term wealth for our investors.
          </p>
        </motion.div>

        <motion.a
          href="#about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-gray-dark transition-colors hover:text-chelsea sm:bottom-10 sm:flex"
        >
          <span className="font-accent text-[10px] tracking-[0.35em] uppercase">Discover</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-10 w-6 items-start justify-center rounded-full border border-sand-line p-1.5"
          >
            <div className="h-2 w-1 rounded-full bg-gradient-to-b from-chelsea to-gold" />
          </motion.div>
        </motion.a>
      </motion.div>
    </section>
  )
}
