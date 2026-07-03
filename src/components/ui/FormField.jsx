import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { ValidationMessage } from './ValidationMessage';

export const FormField = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  helperText,
  className,
  containerClassName,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value || props.defaultValue;
  const isFloating = isFocused || hasValue;

  return (
    <div className={cn("relative w-full mb-6", containerClassName)}>
      <div 
        className={cn(
          "relative border-b border-border bg-surface transition-colors duration-300",
          isFocused ? "border-accent" : "hover:border-primary/30",
          error && "border-red-500"
        )}
      >
        <label
          htmlFor={id}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none transition-all duration-300 origin-left z-10"
          style={{
            transform: isFloating 
              ? 'translateY(-140%) scale(0.75)' 
              : 'translateY(-50%) scale(1)',
            color: error 
              ? 'rgb(239 68 68)' 
              : isFocused 
                ? 'var(--accent)' 
                : 'inherit'
          }}
        >
          {label}
        </label>
        
        <input
          ref={ref}
          id={id}
          type={type}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "w-full bg-transparent px-4 pb-2 pt-6 text-primary outline-none placeholder-transparent",
            "font-ui text-body selection:bg-accent/30 selection:text-primary",
            className
          )}
          {...props}
        />
        
        {/* Soft focus ring effect */}
        <motion.div
          initial={false}
          animate={{
            opacity: isFocused ? 1 : 0,
          }}
          className={cn(
            "absolute bottom-0 left-0 h-[1px] w-full bg-accent shadow-[0_0_8px_0_var(--accent)]",
            error && "bg-red-500 shadow-[0_0_8px_0_rgba(239,68,68,1)]"
          )}
        />
      </div>

      <ValidationMessage message={error} type="error" />
      {!error && helperText && <ValidationMessage message={helperText} type="helper" />}
    </div>
  );
});

FormField.displayName = 'FormField';
