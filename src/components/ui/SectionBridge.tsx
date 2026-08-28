import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ease } from '../../lib/motion'

type SectionBridgeProps = {
  variant?: 'wave' | 'sweep' | 'fold'
}

export default function SectionBridge({ variant = 'wave' }: SectionBridgeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { amount: 0.6, once: false })

  if (variant === 'sweep') {
    return (
      <div ref={ref} className="relative z-10 -my-px h-10 overflow-hidden sm:h-16">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-chelsea/20 to-transparent"
          initial={{ x: '-100%', opacity: 0 }}
          animate={isInView ? { x: '100%', opacity: [0, 1, 0] } : { x: '-100%', opacity: 0 }}
          transition={{ duration: 1.4, ease, repeat: isInView ? Infinity : 0, repeatDelay: 2.5 }}
        />
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>
    )
  }

  if (variant === 'fold') {
    return (
      <div ref={ref} className="relative z-10 -my-px h-8 overflow-hidden sm:h-10" style={{ perspective: 900 }}>
        <motion.div
          className="h-full origin-top bg-gradient-to-b from-chelsea/10 to-transparent"
          initial={{ rotateX: -90, opacity: 0 }}
          animate={isInView ? { rotateX: 0, opacity: 1 } : { rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.9, ease }}
        />
      </div>
    )
  }

  return (
    <div ref={ref} className="relative z-10 -my-px h-10 overflow-hidden sm:h-14">
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <motion.path
          fill="url(#bridgeGrad)"
          initial={{ d: 'M0,56 L0,40 Q360,56 720,32 T1440,40 L1440,56 Z', opacity: 0.5 }}
          animate={
            isInView
              ? {
                  d: [
                    'M0,56 L0,40 Q360,56 720,32 T1440,40 L1440,56 Z',
                    'M0,56 L0,28 Q360,48 720,20 T1440,28 L1440,56 Z',
                    'M0,56 L0,40 Q360,56 720,32 T1440,40 L1440,56 Z',
                  ],
                  opacity: 1,
                }
              : { opacity: 0.35 }
          }
          transition={{ duration: 4, ease: 'easeInOut', repeat: isInView ? Infinity : 0 }}
        />
        <defs>
          <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#034694" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#c8a24a" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#034694" stopOpacity="0.08" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
