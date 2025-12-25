'use client';

import { motion } from 'framer-motion';

interface AgentSpeakingIndicatorProps {
  isActive: boolean;
}

export const AgentSpeakingIndicator: React.FC<AgentSpeakingIndicatorProps> = ({
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {/* Animated pulsing circles */}
      <motion.div
        className="w-4 h-4 rounded-full bg-gradient-to-r from-ocean-400 to-ocean-600"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-400 to-pink-600"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      />

      {/* Text label */}
      <motion.span
        className="text-sm font-medium text-slate-dark ml-2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        AI is speaking...
      </motion.span>
    </div>
  );
};
