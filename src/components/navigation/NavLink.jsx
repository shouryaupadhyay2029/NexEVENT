import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

export const NavLink = ({ to, children, className, onClick }) => {
  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "relative py-1 text-sm font-ui transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-none",
          isActive ? "text-primary font-medium" : "text-secondary hover:text-primary hover:opacity-80",
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          {children}
          <span 
            className={cn(
              "absolute -bottom-[2px] left-0 w-full h-[1px] bg-accent transform origin-left transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 bg-primary/20"
            )}
          />
        </>
      )}
    </RouterNavLink>
  );
};
