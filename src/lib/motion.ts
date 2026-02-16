import { type Variants, type Transition } from "framer-motion";

// Shared easing — refined ease-out, editorial feel
const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

export const editorial = {
  /** Standard entrance: elegant ease-out, 400ms */
  enter: { duration: 0.4, ease } satisfies Transition,
  /** Fast: 250ms, micro-interactions */
  fast: { duration: 0.25, ease } satisfies Transition,
  /** Slow reveal: 600ms, hero sections */
  slow: { duration: 0.6, ease } satisfies Transition,
  /** Spring for tap feedback */
  spring: { type: "spring", stiffness: 400, damping: 25 } satisfies Transition,
};

/** Fade + slide up — cards, sections, widget entrances */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: editorial.enter },
};

/** Simple fade */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: editorial.enter },
};

/** Scale in from 0.95 — widget reveal, badges */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: editorial.enter },
};

/** Slide from left — assistant chat messages */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: editorial.enter },
};

/** Slide from right — user chat messages */
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: editorial.enter },
};

/** Stagger container — apply to parent, children use fadeUp etc */
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/** Landing page stagger — slower, more dramatic */
export const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

/** Onboarding step slide (directional) */
export const stepSlide: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: editorial.enter },
  exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0, transition: editorial.fast }),
};

/** Collapse/expand reveal — MoodReframe, ObstacleReframe, etc */
export const collapseReveal: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: "hidden" },
  expanded: {
    height: "auto",
    opacity: 1,
    overflow: "hidden",
    transition: { duration: 0.35, ease },
  },
};

/** Tap/press feedback */
export const tapScale = { scale: 0.97 };
