import React from 'react';
import { cn } from '../../utils/cn';

export const AuthInput = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "w-full h-12 rounded-[14px] bg-[#1a1a1a] border border-white/5",
        "px-4 text-primary font-ui text-body transition-all duration-300",
        "placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

AuthInput.displayName = 'AuthInput';
