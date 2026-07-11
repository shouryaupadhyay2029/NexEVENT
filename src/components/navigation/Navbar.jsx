import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Wordmark } from "./Wordmark";
import { NavGroup, NavLink } from "./NavLink";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { AuthModal } from "../auth/AuthModal";
import { ProfileDropdown } from "./ProfileDropdown";
import { Bell, X, LogOut } from "lucide-react";
import { NotificationPanel } from "./NotificationPanel";
import { subscribeToNotifications } from "../../services/notificationService";
import { useConfirm } from "../../context/ConfirmContext";
import { cn } from "../../utils/cn";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const { isAuthenticated, user, logout, profile } = useAuth();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    const confirmed = await confirm({
      title: "Sign Out",
      message: "You are about to end your current NexEvent session.",
      variant: "logout",
      confirmText: "Sign Out",
      cancelText: "Cancel"
    });
    if (confirmed) {
      await logout();
    }
  };

  const role = (profile?.role || "student").toLowerCase().trim();
  const showStudio = role === "organizer" || role === "admin";
  const showAdmin = role === "admin";

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
                <div className="hidden md:block">
                  <ProfileDropdown />
                </div>
              </div>
            )}

            {/* Mobile menu trigger (always visible on mobile view) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-white/50 hover:text-white/90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/60 transition-colors duration-200"
              aria-label="Open navigation"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="8"  x2="21" y2="8" />
                <line x1="3" y1="16" x2="21" y2="16" />
              </svg>
            </button>
          </div>
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

      {/* Mobile Bottom Sheet Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex items-end">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet Panel */}
            <motion.div
              initial={{ y: "100%", filter: "blur(8px)" }}
              animate={{ y: 0, filter: "blur(0px)" }}
              exit={{ y: "100%", filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 350, damping: 38 }}
              className="relative w-full bg-[#0d0d0d]/90 border-t border-white/10 backdrop-blur-2xl rounded-t-[24px] px-6 pb-8 pt-6 flex flex-col gap-6 shadow-[0_-16px_36px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto select-none"
            >
              {/* Grain Texture */}
              <div
                className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none rounded-t-[24px]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
              />

              {/* Drag Handle Indicator */}
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto -mt-2 mb-1 shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
                <Wordmark />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Links Grid / List */}
              <div className="flex flex-col gap-2.5 font-mono text-[0.8rem] uppercase tracking-[0.2em] text-left">
                <span className="text-[0.6rem] text-white/20 font-technical tracking-[0.25em] mb-1">Platform Navigation</span>
                
                {/* Discover Link */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate("/"); }}
                  className={cn(
                    "flex items-center justify-between p-3.5 border transition-all duration-300",
                    location.pathname === "/"
                      ? "border-accent/20 bg-accent/5 text-accent font-medium"
                      : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                  )}
                >
                  <span>Discover</span>
                  {location.pathname === "/" && <span className="w-1.5 h-1.5 bg-accent" />}
                </button>

                {/* Events Link */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate("/events"); }}
                  className={cn(
                    "flex items-center justify-between p-3.5 border transition-all duration-300",
                    location.pathname.startsWith("/events")
                      ? "border-accent/20 bg-accent/5 text-accent font-medium"
                      : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                  )}
                >
                  <span>Events Catalog</span>
                  {location.pathname.startsWith("/events") && <span className="w-1.5 h-1.5 bg-accent" />}
                </button>

                {/* Archive Link */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate("/about"); }}
                  className={cn(
                    "flex items-center justify-between p-3.5 border transition-all duration-300",
                    location.pathname === "/about"
                      ? "border-accent/20 bg-accent/5 text-accent font-medium"
                      : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                  )}
                >
                  <span>Archive</span>
                  {location.pathname === "/about" && <span className="w-1.5 h-1.5 bg-accent" />}
                </button>

                {/* Authenticated Routes */}
                {isAuthenticated ? (
                  <>
                    <div className="h-[1px] w-full bg-white/5 my-2" />
                    <span className="text-[0.6rem] text-white/20 font-technical tracking-[0.25em] mb-1">User Account</span>

                    {/* Profile */}
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); navigate("/profile"); }}
                      className={cn(
                        "flex items-center justify-between p-3.5 border transition-all duration-300",
                        location.pathname === "/profile"
                          ? "border-accent/20 bg-accent/5 text-accent font-medium"
                          : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                      )}
                    >
                      <span>Profile Registry</span>
                      {location.pathname === "/profile" && <span className="w-1.5 h-1.5 bg-accent" />}
                    </button>

                    {/* My Events */}
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); navigate("/my-events"); }}
                      className={cn(
                        "flex items-center justify-between p-3.5 border transition-all duration-300",
                        location.pathname === "/my-events"
                          ? "border-accent/20 bg-accent/5 text-accent font-medium"
                          : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                      )}
                    >
                      <span>My Registrations</span>
                      {location.pathname === "/my-events" && <span className="w-1.5 h-1.5 bg-accent" />}
                    </button>

                    {/* Organizer Studio */}
                    {showStudio && (
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); navigate("/organizer"); }}
                        className={cn(
                          "flex items-center justify-between p-3.5 border transition-all duration-300",
                          location.pathname.startsWith("/organizer")
                            ? "border-accent/20 bg-accent/5 text-accent font-medium"
                            : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                        )}
                      >
                        <span>Organizer Studio</span>
                        {location.pathname.startsWith("/organizer") && <span className="w-1.5 h-1.5 bg-accent" />}
                      </button>
                    )}

                    {/* Admin Console */}
                    {showAdmin && (
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); navigate("/admin"); }}
                        className={cn(
                          "flex items-center justify-between p-3.5 border transition-all duration-300",
                          location.pathname.startsWith("/admin")
                            ? "border-accent/20 bg-accent/5 text-accent font-medium"
                            : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                        )}
                      >
                        <span>Admin Console</span>
                        {location.pathname.startsWith("/admin") && <span className="w-1.5 h-1.5 bg-accent" />}
                      </button>
                    )}

                    {/* Settings */}
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); navigate("/settings"); }}
                      className={cn(
                        "flex items-center justify-between p-3.5 border transition-all duration-300",
                        location.pathname === "/settings"
                          ? "border-accent/20 bg-accent/5 text-accent font-medium"
                          : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                      )}
                    >
                      <span>Settings</span>
                      {location.pathname === "/settings" && <span className="w-1.5 h-1.5 bg-accent" />}
                    </button>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center justify-between p-3.5 border border-red-500/20 bg-red-950/5 text-red-400/80 hover:text-red-400 hover:bg-red-950/10 transition-all duration-300 mt-2"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="h-[1px] w-full bg-white/5 my-2" />
                    {/* Login / SignUp buttons for unauthenticated mobile users */}
                    <div className="flex gap-4 w-full mt-2 font-mono text-[0.7rem]">
                      <Button
                        variant="ghost"
                        className="flex-1 py-3.5"
                        onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                      >
                        Login
                      </Button>
                      <Button
                        className="flex-1 py-3.5 bg-accent text-white"
                        onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                      >
                        Get Started
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
