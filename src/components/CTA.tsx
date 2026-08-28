import { motion } from 'framer-motion'
import Reveal from './ui/Reveal'
import { ease } from '../lib/motion'

export default function CTA() {
  return (
    <section className="relative bg-white pt-6 pb-10 sm:pt-8 lg:pt-10 lg:pb-12">
      <div className="page-container">
        <Reveal>
          <motion.div
            whileInView={{ scale: [0.97, 1] }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="gradient-border relative overflow-hidden rounded-2xl shadow-2xl shadow-chelsea/15 sm:rounded-3xl"
          >
            <img
              src="/images/hero-about.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-chelsea/88 via-chelsea-mid/80 to-charcoal/85" />
            <motion.div
              className="absolute inset-0 opacity-50"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(200,162,74,0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(200,162,74,0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            <div className="relative px-5 py-10 text-center sm:px-10 sm:py-14 lg:px-14 lg:py-20">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease }}
                className="font-display text-3xl font-light text-white text-balance sm:text-4xl lg:text-5xl xl:text-6xl"
              >
                Interested in Partnering with Us
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease }}
                className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:mt-6 sm:text-lg"
              >
                Transform your real estate portfolio with strategic investments designed for superior
                returns and long-term wealth creation.
              </motion.p>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                className="btn-shine mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-gold via-gold-light to-white px-8 py-3.5 text-sm font-bold tracking-wide text-charcoal shadow-xl glow-copper sm:mt-10 sm:px-11 sm:py-4"
              >
                Get Started Today
              </motion.a>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}
