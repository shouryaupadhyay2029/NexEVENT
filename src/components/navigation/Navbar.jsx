import React, { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Wordmark } from "./Wordmark";
import { NavLink } from "./NavLink";
import { Button } from "../ui/Button";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
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
          <Button variant="ghost" size="sm">Sign In</Button>
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
  );
};
