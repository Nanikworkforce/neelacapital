import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { ease } from '../../lib/motion'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  variants?: Variants
  once?: boolean
}

export default function Reveal({
  children,
  className = '',
  delay = 0,
  variants,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={
        variants ?? {
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.75, delay, ease },
          },
        }
      }
    >
      {children}
    </motion.div>
  )
}
