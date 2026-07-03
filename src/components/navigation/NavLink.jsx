import React, { createContext, useContext, useId } from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { useMagnet } from "../../hooks/useMagnet";

// Shared context so all NavLinks in the same nav share a single layoutId namespace
const NavIndicatorContext = createContext(null);

export const NavGroup = ({ children, className }) => {
  const id = useId();
  return (
    <NavIndicatorContext.Provider value={id}>
      <nav className={cn("hidden md:flex items-center gap-8", className)}>
        {children}
      </nav>
    </NavIndicatorContext.Provider>
  );
};

export const NavLink = ({ to, children, className, onClick }) => {
  const location = useLocation();
  const indicatorId = useContext(NavIndicatorContext);
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  // Gentle 5px magnetic pull on the text
  const { ref, x, y, handlers } = useMagnet({ maxDelta: 5, damping: 32, stiffness: 320 });

  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={cn(
        "relative py-2 px-0.5 outline-none focus-visible:ring-1 focus-visible:ring-accent/60 rounded-none flex items-center justify-center group",
        className
      )}
    >
      {/* Text layer — magnetic + opacity-based brightness */}
      <motion.span
        ref={ref}
        style={{ x, y }}
        {...handlers}
        animate={{
          color: isActive
            ? "rgba(255,255,255,1)"
            : "rgba(255,255,255,0.52)",
          fontWeight: isActive ? 500 : 400,
        }}
        whileHover={{
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.008em",
        }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 will-change-transform text-[0.8125rem] font-ui tracking-[0.005em]"
      >
        {children}
      </motion.span>

      {/* Active indicator — the ONLY place layoutId lives */}
      {isActive && indicatorId && (
        <motion.span
          layoutId={`nav-indicator-${indicatorId}`}
          className="absolute -bottom-[3px] left-0 right-0 h-[1px] origin-center"
          style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
          initial={false}
          transition={{
            layout: {
              type: "spring",
              stiffness: 380,
              damping: 36,
              mass: 0.8,
            },
          }}
        />
      )}

      {/* Hover underline — only when NOT active, grows from center */}
      {!isActive && (
        <motion.span
          className="absolute -bottom-[3px] left-0 right-0 h-[1px] origin-center bg-white/18"
          initial={{ scaleX: 0, opacity: 0 }}
          whileHover={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      )}
    </RouterNavLink>
  );
};
