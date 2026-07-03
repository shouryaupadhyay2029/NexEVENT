import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const AuthInput = React.forwardRef(({ className, type = 'text', placeholder, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative w-full">
      <input
        type={type}
        onFocus={(e) => {
          setIsFocused(true);
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (props.onBlur) props.onBlur(e);
        }}
        placeholder={isFocused ? '' : placeholder}
        className={cn(
          "w-full h-12 rounded-[14px] bg-[#1a1a1a] border border-white/5",
          "px-4 text-primary font-ui text-body transition-colors duration-220 ease-in-out-cubic",
          "placeholder:text-muted placeholder:transition-opacity focus:outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
      
      {/* Animated Focus Ring Border */}
      <motion.div 
        className="absolute inset-0 rounded-[14px] border border-accent pointer-events-none"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isFocused ? { opacity: 0.6, scale: 1 } : { opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      />
      
      {/* Absolute Placeholder Animation (when not using native placeholder) */}
      {isFocused && (
        <motion.span 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 0.5, x: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none font-ui text-body"
        >
          {placeholder}
        </motion.span>
      )}
    </div>
  );
});

AuthInput.displayName = 'AuthInput';
