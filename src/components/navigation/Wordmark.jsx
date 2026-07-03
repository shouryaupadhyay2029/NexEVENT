import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

export const Wordmark = ({ className }) => {
  return (
    <Link 
      to="/" 
      className={cn(
        "flex flex-col transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-none select-none",
        className
      )}
    >
      <span className="font-display text-primary text-xl tracking-[0.1em] leading-none mb-1">
        NEXEVENT
      </span>
      <span className="text-[0.55rem] text-secondary tracking-[0.3em] font-medium leading-none uppercase">
        Campus Archive
      </span>
    </Link>
  );
};
