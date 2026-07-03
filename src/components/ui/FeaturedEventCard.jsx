import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const easeOutExpo = [0.16, 1, 0.3, 1];

export const FeaturedEventCard = () => {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mouse tracking for parallax and lighting
  const mouseX = useMotionValue(0.5); // Center relative (0 to 1)
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset to center smoothly
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // Parallax transforms for the image (max movement 6px)
  const imageX = useTransform(smoothX, [0, 1], [6, -6]);
  const imageY = useTransform(smoothY, [0, 1], [6, -6]);

  // Lighting transforms (gradient mask moving with cursor)
  const spotlightX = useTransform(smoothX, [0, 1], ['0%', '100%']);
  const spotlightY = useTransform(smoothY, [0, 1], ['0%', '100%']);

  // Staggered Entrance Variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(8px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: easeOutExpo }
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      className="col-span-1 lg:col-span-5 relative w-full aspect-[3/4] group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98, transition: { duration: 0.2, ease: easeOutExpo } }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Card Container */}
      <div className="w-full h-full overflow-hidden relative rounded-none shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-shadow duration-700 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        
        {/* Animated Ultra-Thin Border */}
        <div className="absolute inset-0 border border-border z-30 pointer-events-none transition-colors duration-700 group-hover:border-white/20" />

        {/* Cinematic Image Layer */}
        <motion.div 
          className="absolute inset-[-12px] w-[calc(100%+24px)] h-[calc(100%+24px)]" // Slightly oversized to accommodate parallax
          style={{ x: imageX, y: imageY }}
        >
          <motion.img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
            alt="Stanford Design Symposium"
            onLoad={() => setIsLoaded(true)}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.8, ease: easeOutExpo }}
            className={`w-full h-full object-cover transition-all duration-[700ms] ease-out-expo
              ${isLoaded ? 'opacity-90 blur-0 contrast-[1.05]' : 'opacity-0 blur-[10px] contrast-75'}
              group-hover:opacity-100 group-hover:contrast-110
            `}
          />
        </motion.div>

        {/* Layer 1: Dark Vignette / Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-100 z-10" />

        {/* Layer 2: Subtle Film Grain */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay z-10 pointer-events-none" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
        />

        {/* Layer 3: Cursor-Reactive Radial Highlight */}
        <motion.div 
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay"
          style={{
            background: useTransform(
              [spotlightX, spotlightY],
              ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.15) 0%, transparent 60%)`
            )
          }}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 z-20">
          <div className="flex flex-col gap-6 w-full">
            
            {/* Metadata Labels */}
            <motion.div variants={itemVariants} className="flex items-center justify-between w-full border-b border-white/10 pb-4 transition-colors duration-700 group-hover:border-white/20">
              <span className="text-[0.6rem] text-secondary uppercase font-technical tracking-[0.25em] transition-colors duration-700 group-hover:text-white/80">Registration Open</span>
              <span className="text-[0.6rem] text-primary uppercase font-technical tracking-[0.25em]">Free Entry</span>
            </motion.div>
            
            {/* Title Block */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <h3 className="text-[1.75rem] md:text-3xl text-primary font-display tracking-tight leading-[1] drop-shadow-sm">
                Stanford Design Symposium '26
              </h3>
            </motion.div>

          </div>
        </div>
      </div>
      
      {/* External Footer */}
      <motion.div 
        variants={itemVariants}
        className="absolute -bottom-8 left-0 w-full flex flex-col gap-3 pt-3"
      >
        <div className="w-8 h-[1px] bg-white/20 transition-all duration-700 ease-out-expo group-hover:w-full group-hover:bg-white/40" />
        <div className="flex justify-between items-center text-[0.6rem] text-muted tracking-[0.25em] font-technical uppercase">
          <span className="flex items-center gap-3">
            <span className="text-white/70 font-medium">FIG. 01</span>
            <span>—</span>
            <span>Architecture Showcase</span>
          </span>
          <div className="flex items-center gap-3">
            <span>Oct 14</span>
            <span className="w-[1px] h-2 bg-white/20" />
            <span>Auditorium</span>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};
