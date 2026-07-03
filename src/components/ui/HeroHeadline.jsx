import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const HeroHeadline = () => {
  const containerRef = useRef(null);
  
  // Mouse position values for the proximity highlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth the mouse position to avoid jitter
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const [isHovered, setIsHovered] = useState(false);

  // Handle mouse movement within the proximity zone
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate relative mouse position inside the container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };



  // Staggered reveal animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 40, 
      filter: "blur(12px)",
      letterSpacing: "-0.01em"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      letterSpacing: "-0.03em",
      transition: { 
        duration: 1.0, 
        ease: [0.16, 1, 0.3, 1] // easeOutExpo
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mb-10 w-fit"
    >
      {/* 
        Idle "Breathing" Container 
        Wraps the entire staggered text to add the extremely slow 10s interpolation.
      */}
      <motion.div
        animate={{
          opacity: [0.98, 1, 0.98],
          filter: ["brightness(1)", "brightness(1.02)", "brightness(1)"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`relative z-10 transition-all duration-700 ${isHovered ? 'contrast-125' : 'contrast-100'}`}
      >
        <motion.h1 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-display leading-[0.95] flex flex-col"
        >
          {/* Base Text Layer (Default view) */}
          <div className="flex flex-col relative z-0">
            <motion.span variants={itemVariants} className="text-primary tracking-[-0.03em] font-medium">Every Campus</motion.span>
            <motion.span variants={itemVariants} className="text-primary tracking-[-0.03em] font-medium">Event.</motion.span>
            <motion.span variants={itemVariants} className="text-secondary font-light tracking-[-0.03em]">One Platform.</motion.span>
          </div>

          {/* Highlight/Hover GPU Spotlight Layer (No expensive CSS masking) */}
          <motion.div 
            className="absolute pointer-events-none z-20 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28)_0%,transparent_70%)] mix-blend-overlay"
            style={{ 
              x: useTransform(smoothX, (x) => x - 150),
              y: useTransform(smoothY, (y) => y - 150),
              opacity: isHovered ? 1 : 0
            }}
          />
        </motion.h1>
      </motion.div>
    </div>
  );
};
