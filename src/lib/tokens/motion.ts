export const motionVariants = {
  card: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -24 },
    transition: { duration: 0.45, ease: "easeOut" }
  },
  hero: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  floating: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  button: {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  },
  inputGlow: {
    focus: { boxShadow: "0 0 0 2px #6D4CFF" }
  }
};
