import { motion } from 'framer-motion'
import { navLinks, footer } from '../data/content'
import { staggerContainer, fadeUp } from '../lib/motion'
import { SocialIcon } from './ui/SocialIcons'

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/' },
  { label: 'Twitter', href: 'https://twitter.com/' },
  { label: 'Instagram', href: 'https://instagram.com/' },
] as const

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-chelsea/20">
      <div className="absolute inset-0 bg-gradient-to-br from-chelsea via-chelsea-mid to-charcoal" />
      <motion.div
        className="absolute -top-24 left-1/2 h-48 w-full max-w-[600px] -translate-x-1/2 rounded-full bg-gold/15 blur-[80px]"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="page-container relative py-10 sm:py-12 lg:py-14">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <motion.div variants={fadeUp}>
            <img
              src="/images/footer-logo.png"
              alt="Neela Capital Investments"
              className="h-16 w-16 object-contain opacity-90"
            />
            <h3 className="font-display mt-5 text-xl text-white">About us</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              {footer.description}
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h3 className="font-display text-xl text-white">Our Address</h3>
            <p className="mt-3 text-sm text-white/70">{footer.address}</p>
            <motion.a
              href="#contact"
              whileHover={{ x: 4 }}
              className="mt-5 inline-flex text-sm font-semibold text-gold-light"
            >
              Contact Us →
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 flex flex-col gap-5 border-t border-white/15 pt-6 sm:mt-10 sm:gap-6 sm:pt-8 lg:flex-row lg:items-center lg:justify-between"
        >
          <nav aria-label="Footer menu">
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-3 sm:gap-x-2">
              {navLinks.map((link, index) => (
                <li key={link.href} className="flex items-center">
                  {index > 0 && (
                    <span className="mx-3 hidden h-3 w-px bg-white/25 sm:inline-block" aria-hidden />
                  )}
                  <a
                    href={link.href}
                    className="font-accent text-sm font-medium tracking-wide text-white/75 transition-colors hover:text-gold-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.05 }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:border-gold/40 hover:bg-white/15 hover:text-white"
                aria-label={social.label}
              >
                <SocialIcon name={social.label} className="h-[18px] w-[18px]" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className="max-w-prose text-center text-[11px] leading-relaxed text-white/50 sm:text-left sm:text-xs">
              Copyright © 2026 Neela Capital Investments | Powered by Neela Capital Investments
            </p>
            <nav aria-label="Portal login" className="flex items-center gap-x-3 text-[11px] sm:text-xs">
              {[
                { label: 'Admin', href: '/admin' },
                { label: 'Manager', href: '/manager/login' },
                { label: 'Tenant', href: '/portal/tenant' },
              ].map((item, index) => (
                <span key={item.href} className="flex items-center gap-x-3">
                  {index > 0 && <span className="text-white/25" aria-hidden>·</span>}
                  <a
                    href={item.href}
                    className="font-accent tracking-wide text-white/45 transition-colors hover:text-gold-light"
                  >
                    {item.label}
                  </a>
                </span>
              ))}
            </nav>
          </div>
          <p className="font-accent text-xs tracking-widest text-white/50 uppercase">Houston, Texas</p>
        </div>
      </div>
    </footer>
  )
}
