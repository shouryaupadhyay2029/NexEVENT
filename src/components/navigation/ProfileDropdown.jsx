import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bookmark, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
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
    { icon: User, label: 'Profile', onClick: () => setIsOpen(false) },
    { icon: Bookmark, label: 'Saved Events', onClick: () => setIsOpen(false) },
    { icon: Calendar, label: 'My Events', onClick: () => setIsOpen(false) },
    { icon: Settings, label: 'Settings', onClick: () => setIsOpen(false) },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-[#111111] border border-white/10 text-white flex items-center justify-center font-display text-lg uppercase focus:outline-none relative group z-50"
      >
        {/* Soft rotating illuminated orange ring on hover */}
        <motion.span 
          className="absolute inset-0 rounded-full ring-2 ring-accent opacity-0 group-hover:opacity-60 blur-[3px]"
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 15 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        />
        <span className="relative z-10 transition-colors duration-200 group-hover:text-primary">{getInitial()}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(16px)", scale: 0.97 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, y: 14, filter: "blur(16px)", scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // easeOutExpo approx
            className="absolute right-0 top-[calc(100%+12px)] w-[280px] rounded-[20px] bg-[#141414]/95 backdrop-blur-2xl border border-white/10 shadow-[0_24px_40px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col z-50 group/panel"
          >
            {/* Extremely subtle grain mask for the panel */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
            
            {/* Soft radial lighting responsive to overall hover */}
            <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)' }}></div>

            {/* Header: Profile Card */}
            <div className="px-5 py-5 flex items-center gap-4 relative z-10">
              <div className="relative w-12 h-12 rounded-full bg-[#1c1c1c] border border-white/10 flex items-center justify-center text-xl font-display text-primary shadow-inner">
                {getInitial()}
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#141414] shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
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
              
              <MenuItem 
                icon={LogOut} 
                label="Logout" 
                onClick={handleLogout} 
                isDanger 
              />
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

// Sub-component for individual menu rows
const MenuItem = ({ icon: Icon, label, onClick, isDanger }) => {
  return (
    <motion.button
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="relative flex items-center w-full px-5 py-2.5 outline-none group text-left cursor-pointer"
    >
      {/* Background Interpolation */}
      <motion.div 
        className="absolute inset-0 bg-white/0 z-0 pointer-events-none"
        variants={{
          rest: { backgroundColor: "rgba(255,255,255,0)" },
          hover: { backgroundColor: "rgba(255,255,255,0.03)" },
          tap: { backgroundColor: "rgba(255,255,255,0.01)" }
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      />
      
      {/* Left Accent Line */}
      <motion.div 
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full ${isDanger ? 'bg-red-400' : 'bg-primary'}`}
        variants={{
          rest: { opacity: 0, scaleY: 0 },
          hover: { opacity: 1, scaleY: 1 }
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative z-10 flex items-center gap-3 w-full">
        {/* Icon Animation */}
        <motion.div
          variants={{
            rest: { x: 0, color: isDanger ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.45)' }, // muted
            hover: { x: 4, color: isDanger ? 'rgba(248,113,113,1)' : 'rgba(255,255,255,1)' } // primary
          }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </motion.div>

        {/* Text Animation */}
        <motion.span
          variants={{
            rest: { x: 0, color: isDanger ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.75)' }, // secondary
            hover: { x: 2, color: isDanger ? 'rgba(248,113,113,1)' : 'rgba(255,255,255,1)' } // primary
          }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="font-ui text-[0.9375rem] font-medium tracking-tight"
        >
          {label}
        </motion.span>
      </div>
    </motion.button>
  );
};
