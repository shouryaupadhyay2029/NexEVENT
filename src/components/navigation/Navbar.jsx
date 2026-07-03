import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wordmark } from "./Wordmark";
import { NavLink } from "./NavLink";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { AuthModal } from "../auth/AuthModal";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { isAuthenticated, user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ease-out ${
          scrolled 
            ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">
          
          <div className="flex items-center gap-12">
            <Wordmark />
            
            {/* Editorial Volume Marker */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="w-4 h-[1px] bg-border" />
              <span className="text-[0.55rem] text-muted tracking-[0.25em] uppercase">VOL. 01</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/">Discover</NavLink>
            <NavLink to="/events">Events</NavLink>
            <NavLink to="/about">Archive</NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsAuthModalOpen(true)}>Login</Button>
                <Button size="sm" onClick={() => setIsAuthModalOpen(true)}>Get Started</Button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-display text-lg uppercase focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                >
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col py-2"
                    >
                      <div className="px-4 py-3 border-b border-white/10 mb-1">
                        <p className="text-body text-primary font-medium truncate">
                          {user?.displayName || 'User'}
                        </p>
                        <p className="text-small text-secondary truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button className="text-left px-4 py-2.5 text-body text-secondary hover:text-primary hover:bg-white/5 transition-colors">Profile</button>
                      <button className="text-left px-4 py-2.5 text-body text-secondary hover:text-primary hover:bg-white/5 transition-colors">Settings</button>
                      <button className="text-left px-4 py-2.5 text-body text-secondary hover:text-primary hover:bg-white/5 transition-colors">My Events</button>
                      <div className="h-[1px] bg-white/10 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="text-left px-4 py-2.5 text-body text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            className="md:hidden p-2 text-secondary hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            aria-label="Open Mobile Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </motion.header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
