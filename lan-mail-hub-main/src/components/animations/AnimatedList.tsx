import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

interface AnimatedListItemProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
};

export const AnimatedList = ({ children, className }: AnimatedListProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedListItem = ({ children, className }: AnimatedListItemProps) => {
  return (
    <motion.div
      variants={itemVariants}
      className={className}
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};
