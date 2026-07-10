import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaExclamationTriangle, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { cn } from '../../utils/cn';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel
}) => {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const isLogout = variant === 'logout';

  // Esc key closes, Enter key confirms
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
      if (e.key === 'Enter' && !loading) {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onConfirm, onCancel]);

  // Trap focus
  useEffect(() => {
    if (!isOpen) return;

    // Focus confirm button by default
    setTimeout(() => {
      if (confirmBtnRef.current) {
        confirmBtnRef.current.focus();
      }
    }, 50);

    const handleFocus = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        e.stopPropagation();
        confirmBtnRef.current?.focus();
      }
    };

    document.addEventListener('focus', handleFocus, true);
    return () => document.removeEventListener('focus', handleFocus, true);
  }, [isOpen]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Variant helper mapping
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: FaTrash,
          iconClass: 'text-red-400 bg-red-950/20 border border-red-500/20',
          accentLine: 'bg-red-500',
          confirmBtn: 'bg-red-950/40 border border-red-500/30 text-red-200 hover:bg-red-900/40 focus:ring-red-500/20'
        };
      case 'warning':
        return {
          icon: FaExclamationTriangle,
          iconClass: 'text-amber-400 bg-amber-950/20 border border-amber-500/20',
          accentLine: 'bg-amber-500',
          confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500/20'
        };
      case 'success':
        return {
          icon: FaCheck,
          iconClass: 'text-emerald-400 bg-emerald-950/20 border border-emerald-500/20',
          accentLine: 'bg-emerald-500',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500/20'
        };
      default:
        return {
          icon: FaInfoCircle,
          iconClass: 'text-accent bg-accent/10 border border-accent/20',
          accentLine: 'bg-accent',
          confirmBtn: 'bg-[#E96B24] hover:bg-[#F27C38] text-white focus:ring-accent/20'
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = styles.icon;

  // Staggered Framer Motion Animation Variants for logout panel
  const logoutPanelVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 15 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      y: 15,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with Heavy Blur, Subtle Vignette & Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              if (!loading) onCancel();
            }}
            className={cn(
              "absolute inset-0 bg-black/65",
              isLogout 
                ? "backdrop-blur-[22px] bg-gradient-to-b from-black/45 via-black/65 to-black/85 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]" 
                : "backdrop-blur-[3px]"
            )}
          />

          {/* Modal Panel Container */}
          <motion.div
            ref={dialogRef}
            initial={isLogout ? "hidden" : { opacity: 0, scale: 0.95, y: 10 }}
            animate={isLogout ? "visible" : { opacity: 1, scale: 1, y: 0 }}
            exit={isLogout ? "exit" : { opacity: 0, scale: 0.95, y: 10 }}
            variants={isLogout ? logoutPanelVariants : undefined}
            transition={isLogout ? undefined : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden z-10", 
              isLogout 
                ? "max-w-[480px] bg-gradient-to-b from-[#121212] to-[#0A0A0A] border border-white/[0.08] rounded-[20px] group/modal" 
                : "max-w-[440px] bg-[#0E0E0E] border border-white/[0.06] rounded-[16px]"
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Top Accent Strip (1px only for logout) */}
            <div className={cn("w-full", isLogout ? "h-[1px] bg-accent" : "h-[3px] styles.accentLine bg-accent")} />

            {/* Subtle Grain Texture Overlay */}
            {isLogout && (
              <div
                className="absolute inset-0 opacity-[0.012] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
              />
            )}

            {isLogout ? (
              <div className="p-8 md:p-10 flex flex-col gap-6 text-left relative z-10">
                {/* Header protocol label */}
                <motion.div variants={itemVariants} className="text-[0.58rem] font-mono uppercase tracking-[0.3em] text-white/50 select-none">
                  SESSION // TERMINATION PROTOCOL
                </motion.div>

                {/* Main Heading & Subtitle */}
                <motion.div variants={itemVariants} className="flex flex-col gap-2.5">
                  <h3 className="text-display-m font-light text-primary tracking-tight leading-none">
                    Terminate Session
                  </h3>
                  <p className="text-body-s text-secondary leading-relaxed font-light">
                    {message || "You are about to end your current authenticated session."}
                  </p>
                </motion.div>

                {/* Warning details architecture grid */}
                <motion.div variants={itemVariants} className="flex flex-col select-none font-mono">
                  {/* Divider line 1 */}
                  <div className="h-[1px] w-full bg-white/[0.06]" />
                  
                  {/* Row 1 */}
                  <div className="py-3.5 flex flex-col gap-1">
                    <span className="text-[0.6rem] tracking-[0.2em] text-accent uppercase font-medium">CURRENT SESSION</span>
                    <span className="text-[0.72rem] text-white/45 font-light leading-relaxed font-sans">Your authenticated session registry will immediately expire.</span>
                  </div>
                  
                  {/* Divider line 2 */}
                  <div className="h-[1px] w-full bg-white/[0.06]" />
                  
                  {/* Row 2 */}
                  <div className="py-3.5 flex flex-col gap-1">
                    <span className="text-[0.6rem] tracking-[0.2em] text-accent uppercase font-medium">UNSAVED CHANGES</span>
                    <span className="text-[0.72rem] text-white/45 font-light leading-relaxed font-sans">Any uncommitted form inputs or draft caches may be discarded.</span>
                  </div>
                  
                  {/* Divider line 3 */}
                  <div className="h-[1px] w-full bg-white/[0.06]" />
                  
                  {/* Row 3 */}
                  <div className="py-3.5 flex flex-col gap-1">
                    <span className="text-[0.6rem] tracking-[0.2em] text-accent uppercase font-medium">AUTHENTICATION</span>
                    <span className="text-[0.72rem] text-white/45 font-light leading-relaxed font-sans">You can securely authenticate and log back in at any time.</span>
                  </div>
                  
                  {/* Divider line 4 */}
                  <div className="h-[1px] w-full bg-white/[0.06]" />
                </motion.div>

                {/* Extra Premium Detail: Thin divider with SESSION ACTIONS */}
                <motion.div variants={itemVariants} className="flex items-center justify-between mt-1 select-none">
                  <span className="text-[0.55rem] font-mono uppercase tracking-[0.25em] text-white/20">SESSION ACTIONS</span>
                  <div className="h-[1px] flex-1 bg-white/[0.06] ml-4" />
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex gap-4 items-center mt-1">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onCancel}
                    className="flex-[0.35] h-[54px] rounded-[12px] bg-transparent border border-white/10 group-hover/modal:border-white/20 text-white/40 hover:text-white text-[0.65rem] font-mono uppercase tracking-[0.24em] hover:bg-white/[0.03] hover:border-white/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    ref={confirmBtnRef}
                    type="button"
                    disabled={loading}
                    onClick={onConfirm}
                    className="flex-[0.65] h-[54px] rounded-[12px] bg-[#d86b2d] border border-[#f27c38]/20 hover:bg-[#e27334] hover:border-[#f27c38]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-white font-mono uppercase tracking-[0.22em] text-[0.68rem] flex items-center justify-center gap-3 shadow-[0_2px_8px_rgba(216,107,45,0.06)] hover:shadow-[0_4px_16px_rgba(216,107,45,0.12)] transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none group/btn"
                  >
                    {loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Terminate</span>
                        <svg className="w-3.5 h-3.5 stroke-white transform transition-transform duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] translate-x-0 group-hover/btn:translate-x-[6px] group-hover/modal:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </motion.div>
              </div>
            ) : (
              <div className="p-6 md:p-7 flex flex-col gap-5">
                {/* Header section with Icon & Title */}
                <div className="flex gap-4 items-start">
                  <div className={cn("p-3 rounded-xl flex-shrink-0 flex items-center justify-center", styles.iconClass)}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <h3 className="text-base font-semibold text-white tracking-wide text-left">
                      {title}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed text-left">
                      {message}
                    </p>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="flex gap-3 justify-end items-center border-t border-white/[0.05] pt-5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onCancel}
                    className="px-4.5 h-[38px] rounded-[8px] bg-transparent border border-white/10 text-white text-xs hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all select-none focus:outline-none focus:ring-1 focus:ring-white/20"
                  >
                    {cancelText}
                  </button>
                  <button
                    ref={confirmBtnRef}
                    type="button"
                    disabled={loading}
                    onClick={onConfirm}
                    className={cn(
                      "px-5 h-[38px] rounded-[8px] text-xs font-medium flex items-center justify-center gap-2 transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1",
                      styles.confirmBtn
                    )}
                  >
                    {loading && (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    <span>{confirmText}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
