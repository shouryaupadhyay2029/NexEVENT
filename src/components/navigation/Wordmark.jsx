import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import logoImg from "../../assets/logo.png";

export const Wordmark = ({ className }) => {
  // Easing curve for luxurious and understated feel
  const easeOutQuart = [0.25, 1, 0.5, 1];

  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-3.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 rounded-none select-none group",
        className
      )}
    >
      {/* 1. Transparent cropped logo with hover rotation & brightness boost */}
      <motion.img
        src={logoImg}
        alt="NexEvent Mark"
        width={31}
        height={31}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 0.96, scale: 1 }}
        whileHover={{
          rotate: 2.5,
          opacity: 1,
          scale: 1.015,
          filter: "brightness(1.08)"
        }}
        whileTap={{ scale: 0.985 }}
        transition={{
          default: { duration: 0.3, ease: easeOutQuart },
          opacity: { duration: 0.5, ease: "easeOut" } // Fade in once on initial page load
        }}
        className="h-[26px] md:h-[28px] lg:h-[31px] w-auto object-contain [image-rendering:-webkit-optimize-contrast] origin-center"
      />

      {/* Vertical subtle separator */}
      <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

      {/* 2. Redesigned Premium Wordmark Stack */}
      <div className="flex flex-col text-left justify-center">
        {/* Title: NEXEVENT */}
        <motion.span
          initial={{ color: "rgba(255, 255, 255, 0.88)" }}
          whileHover={{ color: "rgba(255, 255, 255, 1)" }}
          transition={{ duration: 0.3, ease: easeOutQuart }}
          className="font-display text-[0.875rem] md:text-[0.9375rem] font-medium tracking-[0.14em] leading-none mb-1 text-primary/90 transition-colors group-hover:text-white"
        >
          NEXEVENT
        </motion.span>

        {/* Subtitle: Campus Archive */}
        <span className="text-[0.52rem] md:text-[0.56rem] tracking-[0.24em] font-technical uppercase leading-none text-white/35 opacity-90">
          Campus Archive
        </span>
      </div>
    </Link>
  );
};
