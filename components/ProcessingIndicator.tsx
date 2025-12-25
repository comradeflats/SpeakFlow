'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface ProcessingIndicatorProps {
  isActive: boolean;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Brain className="text-ocean-600" size={24} />
      </motion.div>

      <motion.span
        className="text-sm font-medium text-slate-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        AI is thinking...
      </motion.span>
    </div>
  );
};
