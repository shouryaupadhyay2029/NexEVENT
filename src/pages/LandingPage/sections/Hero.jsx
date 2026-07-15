import React, { useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HeroHeadline } from "../../../components/ui/HeroHeadline";
import { FeaturedEventCard } from "../../../components/ui/FeaturedEventCard";

// Hero elements stagger helpers
const heroItem = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }
  }
});

const heroCard = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }
  }
};

const DustParticles = () => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  const particles = Array.from({ length: 12 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((_, i) => {
        const size = Math.random() * 2 + 1; // 1px to 3px
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const duration = Math.random() * 25 + 20; // 20s to 45s
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: size,
              height: size,
              left: `${startX}%`,
              top: `${startY}%`,
            }}
            animate={{
              x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20],
              y: [0, Math.random() * -60 - 20, Math.random() * -40 - 10],
              opacity: [0, 0.4, 0.4, 0],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * -20,
            }}
          />
        );
      })}
    </div>
  );
};

const EditorialGrid = () => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '120px 120px',
      }}
      animate={shouldReduceMotion ? {} : {
        y: [0, -12, 0],
      }}
      transition={{
        duration: 50,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

const StatusLabel = () => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-3 mb-10 select-none cursor-default"
    >
      {/* Orange square */}
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          rotate: isHovered && !shouldReduceMotion ? 45 : 0 
        }}
        transition={{
          scale: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
          rotate: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
        }}
        className="w-1.5 h-1.5 bg-accent rounded-none block shrink-0"
      />
      
      {/* Text segments staggered */}
      <div className="text-micro text-primary flex items-center gap-1.5 font-technical">
        <motion.span
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
          animate={{ opacity: 0.75, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
        >
          STATUS
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
          animate={{ opacity: 0.35, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          className="text-white/40 font-ui"
        >
          //
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
          animate={{ opacity: 0.75, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
        >
          ONLINE
        </motion.span>
      </div>
    </div>
  );
};

const HeroButton = ({ variant, children, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isPrimary = variant === "primary";
  
  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      animate={{
        borderColor: isPrimary 
          ? (isHovered ? "rgba(255, 255, 255, 0.96)" : "rgba(201, 106, 43, 0.6)") 
          : (isHovered ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.08)"),
        backgroundColor: isHovered 
          ? "rgba(255, 255, 255, 0.04)" 
          : "rgba(255, 255, 255, 0)",
        color: isHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.82)",
      }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center justify-center rounded-none font-ui font-medium tracking-[0.05em] uppercase select-none will-change-transform border h-12 px-8 text-sm gap-2 relative overflow-hidden focus:outline-none cursor-pointer"
    >
      {/* Arrow sliding in from left */}
      <motion.span
        initial={{ width: 0, opacity: 0, x: -6 }}
        animate={{ 
          width: isHovered ? "auto" : 0, 
          opacity: isHovered ? 1 : 0, 
          x: isHovered ? 0 : -6 
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </motion.span>

      {/* Button Text */}
      <motion.span
        animate={{
          letterSpacing: isHovered && !shouldReduceMotion ? "0.08em" : "0.05em",
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

export const Hero = ({ event, loading }) => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Scroll-linked cinematic fade-outs and transformations
  const headlineOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const imageScaleScroll = useTransform(scrollY, [0, 500], [1, 0.96]);
  const ambienceOpacity = useTransform(scrollY, [0, 450], [1, 0]);

  return (
    <section className="min-h-[85vh] flex flex-col justify-center relative overflow-hidden">
      {/* Background Atmosphere Layers */}
      <motion.div 
        style={{ opacity: ambienceOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(214,123,42,0.035)_0%,transparent_70%)] pointer-events-none z-0 mix-blend-screen"
      />
      <EditorialGrid />
      <DustParticles />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-16 w-full items-center relative z-10 py-12">
        {/* Left Typography — staggered on mount, fades on scroll */}
        <motion.div
          initial="hidden"
          animate="visible"
          style={{ opacity: headlineOpacity }}
          className="col-span-1 lg:col-span-7 flex flex-col items-start"
        >
          {/* Status pill */}
          <StatusLabel />
  
          {/* Headline — internal stagger */}
          <div className="w-full">
            <HeroHeadline />
          </div>
  
          {/* Body copy */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: {
                opacity: 0.82,
                y: 0,
                transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.58 }
              }
            }}
            className="text-body-l text-secondary mb-14"
          >
            A quiet, architectural foundation designed exclusively for the sophisticated
            management and discovery of premium campus experiences.
          </motion.p>
  
          {/* CTA row */}
          <motion.div
            variants={heroItem(0.7)}
            className="flex flex-wrap items-center gap-8"
          >
            <HeroButton variant="primary" onClick={() => navigate("/events")}>Explore</HeroButton>
            <HeroButton variant="ghost" onClick={() => navigate("/about")}>Learn More</HeroButton>
          </motion.div>
        </motion.div>
  
        {/* Right card — slightly delayed, heavier reveal, scales on scroll */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroCard}
          style={{ scale: imageScaleScroll }}
          className="col-span-1 lg:col-span-5"
        >
          <FeaturedEventCard event={event} loading={loading} />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 select-none pointer-events-none">
        <span className="text-[0.52rem] font-technical tracking-[0.25em] text-white/30 uppercase">Scroll</span>
        <motion.div
          animate={{
            height: [18, 30, 18],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-[1px] bg-accent/40"
        />
      </div>
    </section>
  );
};
