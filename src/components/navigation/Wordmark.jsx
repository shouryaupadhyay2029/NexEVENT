import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const Wordmark = ({ className }) => {
  return (
    <Link 
      to="/" 
      className={cn(
        "flex flex-col focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-none select-none group",
        className
      )}
    >
      <motion.span 
        initial="rest"
        whileHover="hover"
        variants={{
          rest: { filter: "brightness(1)", letterSpacing: "0.1em" },
          hover: { filter: "brightness(1.15)", letterSpacing: "0.11em" }
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-primary text-xl leading-none mb-1 origin-left"
      >
        NEXEVENT
      </motion.span>
      <motion.span 
        initial="rest"
        whileHover="hover"
        variants={{
          rest: { filter: "brightness(1)", color: "rgba(255,255,255,0.45)" },
          hover: { filter: "brightness(1.1)", color: "rgba(255,255,255,0.65)" }
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-[0.55rem] tracking-[0.3em] font-medium leading-none uppercase origin-left"
      >
        Campus Archive
      </motion.span>
    </Link>
  );
};
