import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'border border-primary text-primary hover:bg-primary hover:text-background',
  secondary: 'border border-border text-secondary hover:text-primary hover:border-primary/50',
  ghost: 'bg-transparent text-secondary hover:text-primary relative group',
  icon: 'p-2 bg-transparent text-secondary hover:text-primary rounded-none border border-transparent hover:border-border',
  text: 'p-0 h-auto bg-transparent text-secondary hover:text-primary',
};

const sizes = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-10 px-6 text-sm',
  lg: 'h-12 px-8 text-sm',
  icon: 'h-10 w-10 flex items-center justify-center',
};

export const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children,
  disabled,
  type = 'button',
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-none font-ui font-medium tracking-[0.05em] uppercase transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        variant !== 'icon' && variant !== 'text' && sizes[size],
        variant === 'icon' && sizes.icon,
        className
      )}
      {...props}
    >
      {variant === 'ghost' ? (
        <>
          {children}
          {/* Strict interaction underline expanding from 0 to 100% */}
          <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';
