import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useMagnet } from '../../hooks/useMagnet';

const variants = {
  primary: 'border border-primary text-primary hover:bg-white/5 hover:text-white hover:border-white/20',
  secondary: 'border border-border text-secondary hover:text-primary hover:border-primary/40',
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
  onClick,
  ...props
}, ref) => {
  // Magnetic pull: buttons move 4–6px toward the cursor
  const { ref: magnetRef, x, y, handlers } = useMagnet({ maxDelta: 4, damping: 24, stiffness: 260 });

  return (
    <motion.button
      ref={(el) => {
        magnetRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ x, y }}
      {...handlers}
      whileHover={!disabled ? { scale: 1.015, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } } : {}}
      whileTap={!disabled ? { scale: 0.985, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } } : {}}
      className={cn(
        'inline-flex items-center justify-center rounded-none font-ui font-medium tracking-[0.05em] uppercase transition-colors duration-180 ease-out-expo select-none will-change-transform',
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
          {/* Subtle underline slide for ghost buttons */}
          <motion.span
            className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary origin-left"
            initial={{ scaleX: 0, opacity: 0 }}
            whileHover={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          />
        </>
      ) : (
        children
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
