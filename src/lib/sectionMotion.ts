import type { Variants } from 'framer-motion'
import { ease } from './motion'

export type SectionTransitionType =
  | 'flow-up'
  | 'flow-left'
  | 'flow-right'
  | 'door'
  | 'curtain-down'
  | 'curtain-up'
  | 'rise'

const enterEase = ease
const exitEase = [0.55, 0, 0.85, 0.2] as const

const exitBase = {
  opacity: 0,
  filter: 'blur(6px)',
  transition: { duration: 0.55, ease: exitEase },
}

const contentVariants: Record<SectionTransitionType, Variants> = {
  'flow-up': {
    hidden: { opacity: 0, y: 80, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.85, ease: enterEase, delay: 0.15 },
    },
    exit: { ...exitBase, y: -50, scale: 0.98 },
  },
  'flow-left': {
    hidden: { opacity: 0, x: -90, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.85, ease: enterEase, delay: 0.15 },
    },
    exit: { ...exitBase, x: 60, scale: 0.98 },
  },
  'flow-right': {
    hidden: { opacity: 0, x: 90, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.85, ease: enterEase, delay: 0.15 },
    },
    exit: { ...exitBase, x: -60, scale: 0.98 },
  },
  door: {
    hidden: { opacity: 0, y: 30, scale: 0.96, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: enterEase, delay: 0.45 },
    },
    exit: { ...exitBase, y: -30, scale: 0.97, transition: { duration: 0.5, ease: exitEase } },
  },
  'curtain-down': {
    hidden: { opacity: 0, clipPath: 'inset(0 0 100% 0)', filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      clipPath: 'inset(0 0 0% 0)',
      filter: 'blur(0px)',
      transition: { duration: 1, ease: enterEase, delay: 0.1 },
    },
    exit: {
      opacity: 0.4,
      filter: 'blur(4px)',
      clipPath: 'inset(100% 0 0 0)',
      transition: { duration: 0.65, ease: exitEase },
    },
  },
  'curtain-up': {
    hidden: { opacity: 0, clipPath: 'inset(100% 0 0 0)', filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      clipPath: 'inset(0 0 0% 0)',
      filter: 'blur(0px)',
      transition: { duration: 1, ease: enterEase, delay: 0.1 },
    },
    exit: {
      opacity: 0.4,
      filter: 'blur(4px)',
      clipPath: 'inset(0 0 100% 0)',
      transition: { duration: 0.65, ease: exitEase },
    },
  },
  rise: {
    hidden: { opacity: 0, y: 120, scale: 0.9, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 1, ease: enterEase },
    },
    exit: { opacity: 0, y: -70, scale: 0.94, filter: 'blur(8px)', transition: { duration: 0.6, ease: exitEase } },
  },
}

const doorOpenEase = [0.22, 1, 0.36, 1] as const
const doorCloseEase = [0.55, 0, 0.75, 0.15] as const

const doorLeft: Variants = {
  closed: {
    x: '0%',
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.85, ease: doorCloseEase },
  },
  open: {
    x: '-102%',
    rotateY: -12,
    opacity: 1,
    transition: { duration: 1.05, ease: doorOpenEase },
  },
}

const doorRight: Variants = {
  closed: {
    x: '0%',
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.85, ease: doorCloseEase },
  },
  open: {
    x: '102%',
    rotateY: 12,
    opacity: 1,
    transition: { duration: 1.05, ease: doorOpenEase },
  },
}

export function getSectionVariants(type: SectionTransitionType) {
  return {
    content: contentVariants[type],
    doorLeft,
    doorRight,
  }
}
