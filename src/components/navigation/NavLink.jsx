import React from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const NavLink = ({ to, children, className, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={cn(
        "relative py-2 px-1 text-sm font-ui outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-none flex items-center justify-center group",
        className
      )}
    >
      <motion.span
        initial="rest"
        whileHover="hover"
        animate={isActive ? "active" : "rest"}
        variants={{
          rest: { 
            y: 0, 
            color: "rgba(255,255,255,0.6)", 
            letterSpacing: "0em",
            fontWeight: 400
          },
          hover: { 
            y: -1, 
            color: "rgba(255,255,255,0.9)", 
            letterSpacing: "0.01em",
            fontWeight: 400
          },
          active: { 
            y: 0, 
            color: "rgba(255,255,255,1)", 
            letterSpacing: "0em",
            fontWeight: 500
          }
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        {children}
      </motion.span>

      {/* Hover Underline (Grows from center) */}
      {!isActive && (
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white/20 origin-center"
          initial={{ scaleX: 0, opacity: 0 }}
          whileHover={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {/* Premium Active Indicator (Magic Move) */}
      {isActive && (
        <motion.div
          layoutId="navbar-active-indicator"
          className="absolute -bottom-1 left-0 right-0 h-[1px] bg-accent shadow-[0_0_8px_rgba(255,107,0,0.4)]"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30
          }}
        />
      )}
    </RouterNavLink>
  );
};
