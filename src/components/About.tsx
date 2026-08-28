import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { about } from '../data/content'
import Reveal from './ui/Reveal'
import { ease, staggerContainer, fadeUp } from '../lib/motion'

export default function About() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96])

  return (
    <section ref={ref} id="about" className="section-pad relative overflow-hidden bg-sand-deep">
      <div className="absolute inset-0 mesh-bg opacity-50" />

      <div className="page-container relative">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease } } }}>
            <motion.div style={{ scale: imageScale }} className="relative">
              <div className="gradient-border overflow-hidden rounded-2xl p-[1px]">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="/images/about.jpg"
                    alt="Neela Capital Investments"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-8 -right-8 hidden lg:block"
              >
                <img
                  src="/images/design-element.png"
                  alt=""
                  className="h-44 w-44 object-contain drop-shadow-2xl"
                />
              </motion.div>

              <div className="absolute -top-3 -left-3 h-14 w-14 rounded-2xl border border-chelsea/20 bg-chelsea/5 backdrop-blur-sm animate-float sm:-top-5 sm:-left-5 sm:h-20 sm:w-20" />
            </motion.div>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
              className="section-eyebrow"
            >
              Who We Are
            </motion.span>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.7, ease }}
              className="section-title mt-4"
            >
              {about.title}
            </motion.h2>
            <motion.div variants={fadeUp} className="mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-chelsea via-gold to-chelsea-light" />

            <motion.p variants={fadeUp} transition={{ duration: 0.7, ease }} className="mt-5 text-base leading-relaxed text-body sm:mt-6 sm:text-lg">
              {about.description}
            </motion.p>
            <motion.p variants={fadeUp} transition={{ duration: 0.7, ease }} className="mt-5 text-sm leading-relaxed text-body sm:mt-6 sm:text-base">
              {about.extended}
            </motion.p>

            <motion.div variants={staggerContainer} className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
              {['Proven Expertise', 'Tailored Solutions', 'Commitment to Excellence'].map((item) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="flex items-center gap-3 rounded-xl border border-chelsea/10 glass p-4 text-left transition-shadow hover:shadow-md hover:shadow-chelsea/10 sm:block sm:text-center"
                >
                  <div className="mb-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-chelsea/15 to-gold/15 sm:mx-auto sm:mb-3 sm:h-11 sm:w-11">
                    <span className="text-gold text-lg">✦</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug text-ink sm:text-xs">{item}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.a
              variants={fadeUp}
              href="#contact"
              whileHover={{ x: 6 }}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-chelsea"
            >
              {about.cta} <span>→</span>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
