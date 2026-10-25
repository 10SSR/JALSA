'use client';

import confetti from 'canvas-confetti';

/**
 * Fires celebratory festival confetti/diya sparkles.
 * Strictly respects prefers-reduced-motion.
 */
export function fireCelebrationConfetti(reduceMotion = false) {
  if (reduceMotion) return;

  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#CF335C', '#EA580C', '#CFA838', '#0A9060', '#FAF6EC'],
    });
  } catch {
    // Graceful fallback if canvas is unsupported
  }
}
