import { motion } from 'framer-motion'
import { useState } from 'react'
import { contact } from '../data/content'
import Reveal from './ui/Reveal'
import { ease, staggerContainer, fadeUp } from '../lib/motion'

const INQUIRIES_API =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'https://neela-backend-96ia.onrender.com'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    first: '',
    last: '',
    email: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      const response = await fetch(`${INQUIRIES_API}/api/inquiries/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first.trim(),
          last_name: form.last.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          source: 'website',
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || data.detail || 'Could not send your message')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message')
    } finally {
      setSending(false)
    }
  }

  const fields = [
    { id: 'first' as const, label: 'First Name', type: 'text', placeholder: 'John', half: true },
    { id: 'last' as const, label: 'Last Name', type: 'text', placeholder: 'Evans', half: true },
    { id: 'email' as const, label: 'Email', type: 'email', placeholder: 'you@example.com', half: false },
  ]

  const inputClass =
    'w-full rounded-xl border border-sand-line bg-white px-4 py-3.5 text-ink placeholder-gray-dark outline-none transition-colors focus:border-chelsea/50'

  return (
    <section id="contact" className="section-pad !pt-12 relative bg-chelsea-pale lg:!pt-16">
      <div className="absolute inset-0 aurora-bg opacity-50" />

      <div className="page-container relative">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.span variants={fadeUp} transition={{ ease }} className="section-eyebrow">
              Contact
            </motion.span>
            <motion.h2 variants={fadeUp} transition={{ ease }} className="section-title mt-4">
              {contact.title}
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ ease }} className="mt-5 text-base leading-relaxed text-body sm:mt-6 sm:text-lg">
              {contact.description}
            </motion.p>

            <motion.div variants={staggerContainer} className="mt-10 space-y-5">
              {[
                { icon: '📍', title: 'Our Address', lines: [contact.address, contact.city] },
                { icon: '📞', title: 'Phone', lines: [], phone: contact.phone, sub: contact.cta },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{ x: 6 }}
                  className="flex items-start gap-4 rounded-xl border border-chelsea/10 glass p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-chelsea/10 to-gold/10 text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    {item.lines.map((line) => (
                      <p key={line} className="mt-1 text-body">{line}</p>
                    ))}
                    {item.phone && (
                      <a href={`tel:${item.phone.replace(/\D/g, '')}`} className="mt-1 block font-medium text-chelsea">
                        Tel: {item.phone}
                      </a>
                    )}
                    {item.sub && <p className="mt-2 text-sm text-body">{item.sub}</p>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <Reveal>
            <div className="gradient-border rounded-2xl p-[1px]">
              <div className="glass rounded-2xl p-5 sm:p-8 lg:p-10">
                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="flex min-h-[280px] flex-col items-center justify-center text-center sm:min-h-[360px] lg:min-h-[400px]"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring' }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-chelsea via-chelsea-mid to-gold text-2xl text-white"
                    >
                      ✓
                    </motion.div>
                    <h3 className="font-display mt-6 text-2xl text-ink">Message Sent</h3>
                    <p className="mt-2 text-body">Thank you for reaching out. We'll be in touch shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      {fields.map((field) => (
                        <div key={field.id} className={field.half ? '' : 'sm:col-span-2'}>
                          <label className="mb-2 block font-accent text-xs font-semibold tracking-wide text-gray-dark uppercase">
                            {field.label}
                          </label>
                          <motion.div
                            animate={{
                              boxShadow:
                                focused === field.id
                                  ? '0 0 0 3px rgba(3, 70, 148, 0.12)'
                                  : '0 0 0 0px rgba(3, 70, 148, 0)',
                            }}
                          >
                            <input
                              type={field.type}
                              required
                              value={form[field.id]}
                              onChange={(e) => setForm((prev) => ({ ...prev, [field.id]: e.target.value }))}
                              onFocus={() => setFocused(field.id)}
                              onBlur={() => setFocused(null)}
                              className={inputClass}
                              placeholder={field.placeholder}
                            />
                          </motion.div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="mb-2 block font-accent text-xs font-semibold tracking-wide text-gray-dark uppercase">
                        Message
                      </label>
                      <motion.div
                        animate={{
                          boxShadow:
                            focused === 'message'
                              ? '0 0 0 3px rgba(3, 70, 148, 0.12)'
                              : '0 0 0 0px rgba(3, 70, 148, 0)',
                        }}
                      >
                        <textarea
                          required
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                          onFocus={() => setFocused('message')}
                          onBlur={() => setFocused(null)}
                          className={`${inputClass} resize-none`}
                          placeholder="Tell us about your investment goals..."
                        />
                      </motion.div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-600" role="alert">
                        {error}
                      </p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={sending}
                      whileHover={{ scale: sending ? 1 : 1.02 }}
                      whileTap={{ scale: sending ? 1 : 0.98 }}
                      className="btn-shine w-full rounded-xl bg-gradient-to-r from-chelsea via-chelsea-mid to-gold py-4 text-sm font-semibold tracking-wide text-white shadow-lg shadow-chelsea/15 disabled:opacity-70"
                    >
                      {sending ? 'Sending...' : 'Submit'}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
