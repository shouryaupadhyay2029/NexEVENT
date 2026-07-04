import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Bookmark, Calendar, Settings, LogOut, Sliders } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMagnet } from '../../hooks/useMagnet';

const EASE = [0.16, 1, 0.3, 1];

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [ringActive, setRingActive] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Avatar magnetic pull (stronger — 8px, it's a small target)
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
    await logout();
  };

  const getInitial = () => user?.displayName?.[0] || user?.email?.[0] || 'U';

  const menuItems = [
    { icon: User, label: 'Profile', onClick: () => { setIsOpen(false); navigate('/profile'); } },
    { icon: Bookmark, label: 'Saved Events', onClick: () => { setIsOpen(false); navigate('/my-events'); } },
    { icon: Calendar, label: 'My Events', onClick: () => { setIsOpen(false); navigate('/my-events'); } },
    { icon: Sliders, label: 'Organizer Studio', onClick: () => { setIsOpen(false); navigate('/organizer'); } },
    { icon: Settings, label: 'Settings', onClick: () => { setIsOpen(false); navigate('/settings'); } },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <motion.button
        ref={avatarRef}
        style={{ x: avatarX, y: avatarY }}
        {...avatarHandlers}
        whileTap={{ scale: 0.93, transition: { duration: 0.13, ease: [0.16, 1, 0.3, 1] } }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setRingActive(true)}
        onMouseLeave={() => setRingActive(false)}
        className="w-9 h-9 rounded-full bg-[#111] border border-white/[0.09] text-white flex items-center justify-center font-display text-base uppercase focus:outline-none relative z-50 will-change-transform"
      >
        {/* Rotating arc — one clean revolution on hover in, fades on hover out */}
        <motion.span
          className="absolute inset-[-3px] rounded-full"
          style={{
            border: '1px solid rgba(255,255,255,0.28)',
            borderTopColor: 'rgba(255,255,255,0.0)',
          }}
          animate={ringActive
            ? { rotate: 360, opacity: 1 }
            : { rotate: 360, opacity: 0 }
          }
          initial={{ rotate: 0, opacity: 0 }}
          transition={ringActive
            ? { rotate: { duration: 0.75, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2 } }
            : { opacity: { duration: 0.35, ease: 'easeOut' } }
          }
        />
        {/* Soft inner glow on hover */}
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{ opacity: ringActive ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }}
        />
        <span className="relative z-10 text-white/80 group-hover:text-white transition-colors duration-200">{getInitial()}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(16px)", scale: 0.97 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, y: 14, filter: "blur(16px)", scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute right-0 top-[calc(100%+12px)] w-[280px] rounded-[20px] bg-[#141414]/95 backdrop-blur-2xl border border-white/10 shadow-[0_24px_40px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col z-50 group/panel"
          >
            {/* Micro grain */}
            <div
              className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
            />

            {/* Radial header glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)' }}
            />

            {/* Header: Profile Card */}
            <div className="px-5 py-5 flex items-center gap-4 relative z-10">
              <div className="relative w-12 h-12 rounded-full bg-[#1c1c1c] border border-white/10 flex items-center justify-center text-xl font-display text-primary shadow-inner">
                {getInitial()}
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#141414] shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              </div>
              <div className="flex flex-col">
                <p className="text-body text-primary font-medium tracking-tight truncate max-w-[160px]">
                  {user?.displayName || 'Campus User'}
                </p>
                <p className="text-metadata text-muted truncate max-w-[160px]">
                  {user?.email}
                </p>
                <div className="mt-1">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[0.6rem] font-technical tracking-widest text-secondary uppercase">
                    Student
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[1px] w-full bg-white/5 relative z-10" />

            {/* Menu Items */}
            <div className="py-2 flex flex-col relative z-10">
              {menuItems.map((item, index) => (
                <MenuItem key={index} icon={item.icon} label={item.label} onClick={item.onClick} />
              ))}

              <div className="h-[1px] w-full bg-white/5 my-2" />

              <MenuItem icon={LogOut} label="Logout" onClick={handleLogout} isDanger />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#111111]/50 border-t border-white/5 relative z-10">
              <div className="flex justify-between items-center text-technical text-[0.6rem] text-muted uppercase tracking-widest">
                <span>NexEvent</span>
                <span>Build 0.1</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// MenuItem — 2–3px magnetic drift toward cursor, spring return on exit
const MenuItem = ({ icon: Icon, label, onClick, isDanger }) => {
  const { ref, x, y, handlers } = useMagnet({ maxDelta: 3, damping: 35, stiffness: 350 });

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      style={{ x, y }}
      {...handlers}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="relative flex items-center w-full px-5 py-2.5 outline-none group text-left cursor-pointer will-change-transform"
    >
      {/* Background interpolation */}
      <motion.div
        className="absolute inset-0 bg-white/0 z-0 pointer-events-none"
        variants={{
          rest: { backgroundColor: "rgba(255,255,255,0)" },
          hover: { backgroundColor: "rgba(255,255,255,0.03)" },
          tap: { backgroundColor: "rgba(255,255,255,0.01)" }
        }}
        transition={{ duration: 0.18, ease: EASE }}
      />

      {/* Left accent line */}
      <motion.div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full ${isDanger ? 'bg-red-400' : 'bg-primary'}`}
        variants={{
          rest: { opacity: 0, scaleY: 0 },
          hover: { opacity: 1, scaleY: 1 }
        }}
        transition={{ duration: 0.18, ease: EASE }}
      />

      <div className="relative z-10 flex items-center gap-3 w-full">
        {/* Icon */}
        <motion.div
          variants={{
            rest: { x: 0, color: isDanger ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.45)' },
            hover: { x: 4, color: isDanger ? 'rgba(248,113,113,1)' : 'rgba(255,255,255,1)' }
          }}
          transition={{ duration: 0.18, ease: EASE }}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </motion.div>

        {/* Text */}
        <motion.span
          variants={{
            rest: { x: 0, color: isDanger ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.75)' },
            hover: { x: 2, color: isDanger ? 'rgba(248,113,113,1)' : 'rgba(255,255,255,1)' }
          }}
          transition={{ duration: 0.18, ease: EASE }}
          className="font-ui text-[0.9375rem] font-medium tracking-tight"
        >
          {label}
        </motion.span>
      </div>
    </motion.button>
  );
};
