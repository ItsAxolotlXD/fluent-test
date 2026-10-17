// Staggered slide up variant for cascading entrance animation from top to bottom
export const slideUpVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: [0.16, 1, 0.3, 1],
      delay: Math.min(i * 0.046, 1.1),
    },
  }),
};
