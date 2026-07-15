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
      <motion.div
        className="flex items-center gap-3.5"
        whileHover="hover"
      >
        {/* 1. Transparent cropped logo with hover rotation & scale */}
        <motion.img
          src={logoImg}
          alt="NexEvent Mark"
          width={31}
          height={31}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 0.96, scale: 1 }}
          variants={{
            hover: {
              rotate: 0.6,
              scale: 1.03,
              opacity: 1,
            }
          }}
          transition={{
            duration: 0.22, // 220ms
            ease: easeOutQuart
          }}
          className="h-[26px] md:h-[28px] lg:h-[31px] w-auto object-contain origin-center"
        />

        {/* Vertical subtle separator */}
        <motion.div 
          className="h-5 w-[1px] bg-white/10 hidden sm:block"
          variants={{
            hover: {
              backgroundColor: "rgba(214, 123, 42, 0.4)" // Faint orange accent
            }
          }}
          transition={{
            duration: 0.22, // 220ms
            ease: easeOutQuart
          }}
        />

        {/* 2. Redesigned Premium Wordmark Stack */}
        <div className="flex flex-col text-left justify-center">
          {/* Title: NEXEVENT */}
          <motion.span
            variants={{
              hover: {
                color: "rgba(255, 255, 255, 1)"
              }
            }}
            transition={{ duration: 0.22, ease: easeOutQuart }}
            className="font-display text-[0.875rem] md:text-[0.9375rem] font-medium tracking-[0.14em] leading-none mb-1 text-white/88"
          >
            NEXEVENT
          </motion.span>

          {/* Subtitle: Campus Archive */}
          <span className="text-[0.52rem] md:text-[0.56rem] tracking-[0.24em] font-technical uppercase leading-none text-white/35 opacity-90">
            Campus Archive
          </span>
        </div>
      </motion.div>
    </Link>
  );
};
