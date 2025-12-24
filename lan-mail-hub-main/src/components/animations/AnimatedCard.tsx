import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard = ({ children, className, delay = 0 }: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
