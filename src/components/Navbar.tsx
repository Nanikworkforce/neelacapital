import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { navLinks } from '../data/content'
import { ease } from '../lib/motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('#home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)

    const sections = navLinks.map((l) => document.querySelector(l.href))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`)
        })
      },
      { threshold: 0.35 }
    )
    sections.forEach((s) => s && observer.observe(s))

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong py-2 shadow-sm' : 'bg-transparent py-3 sm:py-4'
      }`}
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <nav className="page-container flex items-center justify-between">
        <motion.a
          href="#home"
          whileHover={{ scale: 1.04 }}
          onClick={closeMenu}
          className="group flex shrink-0 items-center gap-3"
        >
          <img
            src="/images/logo.png"
            alt="Neela Capital Investments"
            className="h-8 w-auto brightness-0 opacity-80 transition-opacity group-hover:opacity-100 sm:h-10"
          />
        </motion.a>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href} className="relative">
              <a
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium tracking-wide transition-colors xl:px-4 ${
                  activeSection === link.href ? 'text-ink' : 'text-gray-dark hover:text-ink'
                }`}
              >
                {link.label}
                {activeSection === link.href && (
                  <motion.span
                    layoutId="navIndicator"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-chelsea to-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            </li>
          ))}
          <li>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="btn-shine ml-3 inline-flex min-h-10 items-center rounded-full bg-gradient-to-r from-chelsea via-chelsea-mid to-gold px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-chelsea/20 xl:ml-4 xl:px-6"
            >
              Get Started
            </motion.a>
          </li>
        </ul>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-0.5 w-6 bg-ink transition-all duration-300 ${
                menuOpen && i === 0 ? 'translate-y-2 rotate-45' : ''
              } ${menuOpen && i === 1 ? 'opacity-0' : ''} ${
                menuOpen && i === 2 ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          ))}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-strong overflow-hidden border-t border-sand-line/50 md:hidden"
          >
            <ul className="page-container flex flex-col gap-1 py-4">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className={`block min-h-11 rounded-xl px-4 py-3 text-base font-medium transition-colors sm:text-lg ${
                      activeSection === link.href
                        ? 'bg-chelsea-pale/80 text-ink'
                        : 'text-body hover:bg-sand-deep/60 hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.06 }}
                className="mt-2"
              >
                <a
                  href="#contact"
                  onClick={closeMenu}
                  className="btn-shine flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-chelsea via-chelsea-mid to-gold px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-chelsea/20"
                >
                  Get Started
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
