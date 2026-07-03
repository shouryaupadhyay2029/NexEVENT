import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wordmark } from "./Wordmark";
import { NavLink } from "./NavLink";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { AuthModal } from "../auth/AuthModal";
import { ProfileDropdown } from "./ProfileDropdown";

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
        initial="top"
        animate={scrolled ? "scrolled" : "top"}
        variants={{
          top: {
            y: 0,
            backgroundColor: "rgba(10, 10, 10, 0)",
            backdropFilter: "blur(0px)",
            borderBottomColor: "rgba(255, 255, 255, 0)",
            paddingTop: "1.5rem",
            paddingBottom: "1.5rem",
            boxShadow: "0px 0px 0px rgba(0,0,0,0)"
          },
          scrolled: {
            y: 0,
            backgroundColor: "rgba(14, 14, 14, 0.85)", // deep charcoal
            backdropFilter: "blur(12px)",
            borderBottomColor: "rgba(255, 255, 255, 0.05)",
            paddingTop: "1rem",
            paddingBottom: "1rem",
            boxShadow: "0px 10px 30px rgba(0,0,0,0.5)"
          }
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-40 border-b"
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
              <ProfileDropdown />
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
