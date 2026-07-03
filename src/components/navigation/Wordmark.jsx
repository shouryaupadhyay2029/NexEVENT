import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const Wordmark = ({ className }) => {
  return (
    <Link
      to="/"
      className={cn(
        "flex flex-col focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 rounded-none select-none group",
        className
      )}
    >
      {/* Primary logotype */}
      <motion.span
        initial={{ opacity: 0.9 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="font-display text-primary text-[1.125rem] leading-none mb-[3px] tracking-[0.08em] origin-left"
        style={{ letterSpacing: "0.09em" }}
      >
        NEXEVENT
      </motion.span>

      {/* Tagline — very soft, fades up on hover */}
      <motion.span
        initial={{ opacity: 0.38 }}
        whileHover={{ opacity: 0.58 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-[0.5rem] tracking-[0.32em] font-technical font-medium leading-none uppercase text-primary"
      >
        Campus Archive
      </motion.span>
    </Link>
  );
};
