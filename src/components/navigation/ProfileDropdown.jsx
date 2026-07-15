import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMagnet } from '../../hooks/useMagnet';
import { useConfirm } from '../../context/ConfirmContext';

const EASE = [0.16, 1, 0.3, 1];

export const ProfileDropdown = () => {
  const { user, profile, logout } = useAuth();
  const confirm = useConfirm();
  const [isOpen, setIsOpen] = useState(false);
  const [ringActive, setRingActive] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Avatar magnetic pull (stronger — 7px, it's a small target)
  const { ref: avatarRef, x: avatarX, y: avatarY, handlers: avatarHandlers } = useMagnet({
    maxDelta: 7,
    damping: 22,
    stiffness: 240,
  });

  // Close on outside click / Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    const confirmed = await confirm({
      title: 'Sign Out',
      message: 'You are about to end your current NexEvent session.',
      variant: 'logout',
      confirmText: 'Sign Out',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      await logout();
    }
  };

  const getInitial = () => user?.displayName?.[0] || user?.email?.[0] || 'U';

  const role = (profile?.role || 'student').toLowerCase().trim();
  const showStudio = role === 'organizer' || role === 'admin';
  const showFaculty = role === 'faculty' || role === 'admin';
  const showAdmin = role === 'admin';

  const baseItems = [
    { label: 'PROFILE', to: '/profile' },
    { label: 'MY REGISTRATIONS', to: '/my-events' },
    { label: 'MY CLUB HOURS', to: '/club-hours' },
    ...(showStudio ? [{ label: 'ORGANIZER STUDIO', to: '/organizer' }] : []),
    ...(showFaculty ? [{ label: 'FACULTY DESK', to: '/faculty' }] : []),
    ...(showAdmin ? [{ label: 'ADMIN CONSOLE', to: '/admin' }] : []),
    { label: 'SETTINGS', to: '/settings' },
  ];

  const menuItems = baseItems.map((item, idx) => ({
    index: String(idx + 1).padStart(2, '0'),
    label: item.label,
    to: item.to
  }));

  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: EASE,
        when: "beforeChildren",
        staggerChildren: 0.04
      }
    },
    exit: {
      opacity: 0,
      y: 8,
      transition: {
        duration: 0.18,
        ease: EASE
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.25, ease: EASE }
    }
  };

  const isAcmUser = profile?.clubId === 'bUV2wixWWSV61cUexUY7' || (profile?.clubName && profile.clubName.toLowerCase().trim() === 'acm');
  const avatarUrl = isAcmUser ? '/club-logos/acm-logo.png' : (profile?.avatar || user?.photoURL);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <motion.button
        ref={avatarRef}
        style={{ x: avatarX, y: avatarY }}
        {...avatarHandlers}
        whileTap={{ scale: 0.93, transition: { duration: 0.13, ease: EASE } }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setRingActive(true)}
        onMouseLeave={() => setRingActive(false)}
        animate={{
          boxShadow: ringActive ? '0 4px 12px rgba(0,0,0,0.5)' : '0 0px 0px rgba(0,0,0,0)'
        }}
        transition={{ duration: 0.22, ease: EASE }}
        className="w-9 h-9 rounded-full bg-[#111] border border-white/[0.09] text-white flex items-center justify-center font-display text-base uppercase focus:outline-none relative z-50 will-change-transform"
        aria-label="Open profile menu"
      >
        {/* Thin orange ring fades in */}
        <motion.span
          className="absolute inset-[-3px] rounded-full border border-accent"
          animate={{ opacity: ringActive ? 0.6 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        />
        {/* Soft inner glow on hover */}
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{ opacity: ringActive ? 1 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }}
        />
        {avatarUrl ? (
          <motion.img
            src={avatarUrl}
            alt={profile?.displayName || user?.displayName || "User"}
            width={36}
            height={36}
            animate={{ scale: ringActive ? 1.05 : 1 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="w-full h-full object-cover rounded-full relative z-10"
          />
        ) : (
          <motion.span 
            animate={{ scale: ringActive ? 1.05 : 1 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="relative z-10 text-white/80 group-hover:text-white transition-colors duration-200"
          >
            {getInitial()}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-[calc(100%+14px)] w-[360px] rounded-[4px] bg-[#0a0a0a]/95 border border-white/[0.08] backdrop-blur-[16px] shadow-[0_24px_50px_-16px_rgba(0,0,0,0.85)] flex flex-col z-50 overflow-hidden"
          >
            {/* Matte orange 1px structural accent marker at the top */}
            <div className="w-full h-[1px] bg-accent absolute top-0 left-0 z-[15] pointer-events-none" />

            {/* Subtle internal top light highlight line / tonal layer */}
            <div className="absolute inset-[1px] border-t border-white/[0.04] bg-white/[0.01] pointer-events-none z-[2]" />

            {/* Global stationary noise texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none z-[1]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Actual Content Container (renders above the grain overlay & tonal layer) */}
            <div className="relative z-[10] flex flex-col w-full h-full">

              {/* Top Micro Header */}
              <div className="px-5 pt-5 pb-3 flex items-center justify-between text-[0.55rem] font-mono tracking-[0.25em] text-white/45 uppercase shrink-0 border-b border-white/[0.07] select-none">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent shrink-0" />
                  <span>[USR.01]</span>
                </div>
                <span>IDENTITY REGISTRY</span>
              </div>

              {/* Identity Composition Section */}
              <motion.div variants={itemVariants} className="px-5 py-5 flex items-center gap-5 shrink-0 text-left">
                {/* Frame with Corner markers */}
                <div className="relative w-16 h-16 border border-white/10 p-1 bg-[#111] shrink-0 select-none">
                  <span className="absolute -top-[1px] -left-[1px] w-1.5 h-[1px] bg-accent" />
                  <span className="absolute -top-[1px] -left-[1px] w-[1px] h-1.5 bg-accent" />
                  <span className="absolute -bottom-[1px] -right-[1px] w-1.5 h-[1px] bg-accent" />
                  <span className="absolute -bottom-[1px] -right-[1px] w-[1px] h-1.5 bg-accent" />
                  
                  <div className="w-full h-full overflow-hidden bg-black flex items-center justify-center font-display text-lg uppercase text-primary relative">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={profile?.displayName || user?.displayName || "User"} 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover grayscale" 
                      />
                    ) : (
                      getInitial()
                    )}
                    {/* Status Indicator */}
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-500 shrink-0" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-col min-w-0">
                  <p className="text-body-lg text-white/96 font-light tracking-tight truncate max-w-[220px]">
                    {profile?.displayName || user?.displayName || 'Campus User'}
                  </p>
                  <p className="text-[0.68rem] text-white/45 truncate max-w-[220px] font-mono mt-0.5 select-all">
                    {profile?.email || user?.email}
                  </p>
                  <div className="mt-2.5">
                    <span className="inline-block px-2 py-0.5 border border-white/10 bg-white/[0.02] text-[0.52rem] font-mono tracking-[0.2em] text-white/60 uppercase">
                      {user?.email && user.email.toLowerCase().trim() === "upadhyayshourya352@gmail.com"
                        ? "ACCESS // SYSTEM OWNER"
                        : `PRIVILEGE // ${role}`}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Structural Divider */}
              <div className="px-5 py-2.5 flex items-center justify-between text-[0.52rem] font-mono tracking-[0.22em] text-white/28 uppercase border-y border-white/[0.07] bg-[#111111]/40 select-none">
                <span>ACCESS DIRECTORY</span>
                <span>{menuItems.length.toString().padStart(2, '0')} // REG</span>
              </div>

              {/* Directory Links */}
              <div className="flex flex-col font-ui">
                {menuItems.map((item) => (
                  <motion.div key={item.index} variants={itemVariants}>
                    <MenuItem 
                      index={item.index} 
                      label={item.label} 
                      onClick={() => { setIsOpen(false); navigate(item.to); }} 
                    />
                  </motion.div>
                ))}

                <motion.div variants={itemVariants} className="border-t border-white/[0.07] mt-1 pt-1">
                  <LogoutItem onClick={handleLogout} />
                </motion.div>
              </div>

              {/* Registry Footer */}
              <div className="px-5 py-4 bg-[#090909]/40 border-t border-white/[0.07] flex items-center justify-between text-[0.52rem] font-mono tracking-[0.2em] text-white/28 uppercase shrink-0 select-none">
                <div className="flex flex-col gap-0.5 text-left">
                  <span>REGISTRY // NEXEVENT</span>
                  <span>AUTHENTICATED NODE</span>
                </div>
                <div className="flex items-center gap-2 text-white/45">
                  <span className="w-1.5 h-1.5 bg-green-500 shrink-0" />
                  <span>ACTIVE</span>
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// MenuItem
const MenuItem = ({ index, label, onClick }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="relative flex items-center w-full px-5 py-3 outline-none group text-left cursor-pointer transition-all duration-300 font-mono text-[0.72rem] tracking-[0.18em] uppercase overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-white/0 pointer-events-none"
        variants={{
          rest: { backgroundColor: "rgba(255,255,255,0)" },
          hover: { backgroundColor: "rgba(255,255,255,0.03)" }
        }}
        transition={{ duration: 0.3, ease: EASE }}
      />

      <motion.div
        className="absolute bottom-0 left-0 h-[1px] bg-accent origin-left"
        initial={{ scaleX: 0 }}
        variants={{
          rest: { scaleX: 0 },
          hover: { scaleX: 1 }
        }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ width: "100%" }}
      />

      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-6">
          <motion.span
            variants={{
              rest: { color: "rgba(255,255,255,0.45)" },
              hover: { color: "var(--color-accent, #e96b24)" }
            }}
            transition={{ duration: 0.3, ease: EASE }}
            className="text-[0.62rem]"
          >
            {index}
          </motion.span>

          <motion.span
            variants={{
              rest: { x: 0, color: "rgba(255,255,255,0.82)" },
              hover: { x: 4, color: "rgba(255,255,255,0.96)" }
            }}
            transition={{ duration: 0.3, ease: EASE }}
            className="font-ui font-light"
          >
            {label}
          </motion.span>
        </div>

        <motion.span
          variants={{
            rest: { rotate: 0, x: 0, y: 0, color: "rgba(255,255,255,0.45)" },
            hover: { x: 2, y: -2, color: "rgba(255,255,255,0.82)" }
          }}
          transition={{ duration: 0.3, ease: EASE }}
          className="text-[0.72rem]"
        >
          ↗
        </motion.span>
      </div>
    </motion.button>
  );
};

// LogoutItem
const LogoutItem = ({ onClick }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="relative flex items-center w-full px-5 py-3 outline-none group text-left cursor-pointer transition-all duration-300 font-mono text-[0.72rem] tracking-[0.18em] uppercase overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-red-500/0 pointer-events-none"
        variants={{
          rest: { backgroundColor: "rgba(239,68,68,0)" },
          hover: { backgroundColor: "rgba(239,68,68,0.02)" }
        }}
        transition={{ duration: 0.3, ease: EASE }}
      />

      <motion.div
        className="absolute bottom-0 left-0 h-[1px] bg-red-500/50 origin-left"
        initial={{ scaleX: 0 }}
        variants={{
          rest: { scaleX: 0 },
          hover: { scaleX: 1 }
        }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ width: "100%" }}
      />

      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-6">
          <motion.span
            variants={{
              rest: { color: "rgba(255,255,255,0.45)" },
              hover: { color: "rgba(239,68,68,0.8)" }
            }}
            transition={{ duration: 0.3, ease: EASE }}
            className="text-[0.62rem]"
          >
            [ ! ]
          </motion.span>

          <motion.span
            variants={{
              rest: { x: 0, color: "rgba(255,255,255,0.82)" },
              hover: { x: 4, color: "rgba(255,255,255,0.96)" }
            }}
            transition={{ duration: 0.3, ease: EASE }}
            className="font-ui font-light"
          >
            TERMINATE SESSION
          </motion.span>
        </div>

        <motion.span
          variants={{
            rest: { x: 0, color: "rgba(255,255,255,0.45)" },
            hover: { x: 3, color: "rgba(239,68,68,0.8)" }
          }}
          transition={{ duration: 0.3, ease: EASE }}
          className="text-[0.72rem]"
        >
          →
        </motion.span>
      </div>
    </motion.button>
  );
};
