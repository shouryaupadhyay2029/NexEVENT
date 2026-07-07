import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import { Wordmark } from "./Wordmark";
import { NavGroup, NavLink } from "./NavLink";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { AuthModal } from "../auth/AuthModal";
import { ProfileDropdown } from "./ProfileDropdown";
import { Bell } from "lucide-react";
import { NotificationPanel } from "./NotificationPanel";
import { subscribeToNotifications } from "../../services/notificationService";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const { isAuthenticated, user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setNotifications([]);
      return;
    }
    const unsubscribe = subscribeToNotifications(user.uid, (list) => {
      setNotifications(list);
    });
    return () => unsubscribe();
  }, [isAuthenticated, user]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  // Continuous scroll-driven values — no binary state flip
  // Background opacity: 0 at top → 0.72 after 300px
  const rawBgOpacity = useTransform(scrollY, [0, 300], [0, 0.72]);
  const bgOpacity = useSpring(rawBgOpacity, { damping: 30, stiffness: 120, mass: 0.5 });

  // Border opacity: 0 → 0.07
  const borderOpacity = useTransform(scrollY, [0, 250], [0, 0.07]);

  // Padding compression: 1.5rem → 0.875rem
  const paddingY = useTransform(scrollY, [0, 200], [1.5, 0.875]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 w-full z-40 border-b will-change-transform"
        style={{
          // Pure motion-value driven — no React state, fully continuous
          backgroundColor: useTransform(
            bgOpacity,
            (o) => `rgba(9,9,9,${o})`
          ),
          backdropFilter: scrolled ? "blur(12px) saturate(1.2)" : "blur(0px) saturate(1.0)",
          WebkitBackdropFilter: scrolled ? "blur(12px) saturate(1.2)" : "blur(0px) saturate(1.0)",
          borderBottomColor: useTransform(
            borderOpacity,
            (o) => `rgba(255,255,255,${o})`
          ),
          paddingTop: useTransform(paddingY, (p) => `${p}rem`),
          paddingBottom: useTransform(paddingY, (p) => `${p}rem`),
        }}
      >
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">

          {/* Left: Logo + editorial marker */}
          <div className="flex items-center gap-10">
            <Wordmark />

            {/* Thin editorial separator + volume marker */}
            <div className="hidden lg:flex items-center gap-3 opacity-30">
              <span className="w-5 h-[1px] bg-white/60" />
              <span className="text-[0.48rem] text-white/70 tracking-[0.28em] uppercase font-technical">
                VOL. 01
              </span>
            </div>
          </div>

          {/* Center: Navigation links wrapped in NavGroup for shared layoutId scope */}
          <NavGroup>
            <NavLink to="/">Discover</NavLink>
            <NavLink to="/events">Events</NavLink>
            <NavLink to="/about">Archive</NavLink>
          </NavGroup>

          {/* Right: Auth / Profile */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                {/* Notification Bell */}
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-2 text-white/40 hover:text-white transition-colors focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
                  )}
                </button>
                <ProfileDropdown />
              </div>
            )}
          </div>

          {/* Mobile burger (only shown if not authenticated or in tandem) */}
          {!isAuthenticated && (
            <button
              className="md:hidden p-2 text-white/50 hover:text-white/90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/60 transition-colors duration-200"
              aria-label="Open navigation"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="8"  x2="21" y2="8" />
                <line x1="3" y1="16" x2="21" y2="16" />
              </svg>
            </button>
          )}
        </div>
      </motion.header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Premium Notification Panel Drawer */}
      <NotificationPanel 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        notifications={notifications}
        userId={user?.uid}
      />
    </>
  );
};
