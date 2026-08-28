import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { getSectionVariants, type SectionTransitionType } from '../../lib/sectionMotion'

type SectionTransitionProps = {
  children: ReactNode
  type?: SectionTransitionType
  className?: string
  once?: boolean
}

export default function SectionTransition({
  children,
  type = 'flow-up',
  className = '',
  once = true,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { amount: 0.12, margin: '0px 0px -5% 0px', once })
  const variants = getSectionVariants(type)
  const isDoor = type === 'door'
  const doorState = isInView ? 'open' : 'closed'

  return (
    <div
      ref={ref}
      className={`section-transition relative ${className}`}
      style={isDoor ? { perspective: 1400 } : undefined}
    >
      {isDoor && (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" style={{ perspective: 1400 }}>
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 origin-right border-r border-gold/40 bg-gradient-to-br from-chelsea via-chelsea-mid to-charcoal shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
            initial="closed"
            animate={doorState}
            variants={variants.doorLeft}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 origin-left border-l border-gold/40 bg-gradient-to-bl from-chelsea via-chelsea-mid to-charcoal shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
            initial="closed"
            animate={doorState}
            variants={variants.doorRight}
          />
          <motion.div
            className="absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-gradient-to-b from-gold/0 via-gold/80 to-gold/0"
            animate={isInView ? { opacity: 0, scaleY: 0.4 } : { opacity: 1, scaleY: 1 }}
            transition={{ duration: isInView ? 0.55 : 0.75, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}

      <motion.div
        className="relative z-10"
        initial="hidden"
        animate={isInView ? 'visible' : 'exit'}
        variants={variants.content}
      >
        {children}
      </motion.div>
    </div>
  )
}
