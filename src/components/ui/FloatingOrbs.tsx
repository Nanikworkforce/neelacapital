import { motion } from 'framer-motion'

const orbs = [
  { size: 420, x: '8%', y: '12%', color: 'bg-chelsea/12', delay: 0 },
  { size: 320, x: '78%', y: '18%', color: 'bg-gold/10', delay: 1.2 },
  { size: 280, x: '62%', y: '68%', color: 'bg-chelsea-light/10', delay: 0.6 },
  { size: 200, x: '18%', y: '72%', color: 'bg-white/40', delay: 2 },
]

export default function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[60px] sm:blur-[90px] ${orb.color}`}
          style={{
            width: `min(${orb.size}px, 70vw)`,
            height: `min(${orb.size}px, 70vw)`,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            y: [0, -28, 12, 0],
            x: [0, 18, -10, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: 14 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  )
}
