import { motion } from 'framer-motion';
import { OrbState } from '../types';

interface VoiceOrbProps {
  state: OrbState;
}

export default function VoiceOrb({ state }: VoiceOrbProps) {
  const isIdle = state === 'idle';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-gray-900"
        initial={{ opacity: 0.5, scale: 1 }}
        animate={{ 
          opacity: isIdle ? [0.4, 0.6, 0.4] : [0.8, 1, 0.8],
          scale: isIdle ? [1, 1.05, 1] : [1, 1.2, 1],
          boxShadow: isIdle 
            ? ['0 0 10px rgba(245, 158, 11, 0.2)', '0 0 20px rgba(245, 158, 11, 0.4)', '0 0 10px rgba(245, 158, 11, 0.2)']
            : ['0 0 20px rgba(245, 158, 11, 0.5)', '0 0 50px rgba(245, 158, 11, 0.8)', '0 0 20px rgba(245, 158, 11, 0.5)']
        }}
        transition={{ 
          duration: isIdle ? 4 : 0.6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
    </div>
  );
}
