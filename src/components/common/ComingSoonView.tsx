import React from 'react';
import { motion } from 'motion/react';
import { Construction } from 'lucide-react';

interface ComingSoonViewProps {
  title: string;
}

export function ComingSoonView({ title }: ComingSoonViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center"
      >
        <Construction className="w-12 h-12 text-blue-500" />
      </motion.div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
          We are currently building this module to provide you with the best GRC experience. Stay tuned for updates!
        </p>
      </div>
      <div className="flex gap-2">
        <div className="px-4 py-2 bg-slate-200 dark:bg-aegis-surface rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
          Module in Development
        </div>
      </div>
    </div>
  );
}
