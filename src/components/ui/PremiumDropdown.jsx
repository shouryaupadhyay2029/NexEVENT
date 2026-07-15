import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

export const PremiumDropdown = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="flex items-center gap-2 relative z-30" ref={dropdownRef}>
      <span className="text-[0.6rem] font-technical uppercase tracking-wider text-white/30">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#111] border border-white/10 text-white/80 px-3 py-1.5 rounded-none focus:outline-none focus:border-accent cursor-pointer hover:bg-white/[0.02] flex items-center justify-between gap-4 text-xs font-ui min-w-[120px]"
      >
        <span>{selectedLabel}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/40"
        >
          <ChevronDown className="w-3 h-3" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-[#141414] border border-white/10 z-40 max-h-60 overflow-y-auto rounded-none shadow-[0_12px_24px_rgba(0,0,0,0.5)] scrollbar-none"
            style={{ minWidth: '150px' }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 text-xs text-white/80 hover:bg-[#C96A2B]/[0.04] hover:text-white cursor-pointer flex items-center justify-between transition-colors duration-180"
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="text-accent"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </motion.span>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
