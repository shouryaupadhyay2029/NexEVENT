import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const EditorialImage = ({ 
  src, 
  alt = 'Editorial Image', 
  className, 
  wrapperClassName,
  aspectRatio = 'aspect-video',
  grayscale = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn(
      "relative overflow-hidden w-full border border-white/5 bg-[#0e0e0e] group select-none",
      aspectRatio,
      wrapperClassName
    )}>
      {/* 1. Vignette layer for soft shadows at edges */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.45)_100%)] transition-opacity duration-700 group-hover:opacity-80" />

      {/* 2. Micro SVG Film Grain for premium printed look */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 3. The actual Image with fade and zoom physics */}
      <motion.img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        initial={{ 
          opacity: 0, 
          scale: 1.05
        }}
        animate={isLoaded ? { 
          opacity: 1, 
          scale: 1
        } : {}}
        whileHover={{
          scale: 1.03,
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "w-full h-full object-cover origin-center [image-rendering:-webkit-optimize-contrast] filter contrast-[1.05] brightness-[0.98] transition-all duration-[700ms] ease-out-expo group-hover:contrast-[1.10] group-hover:brightness-[0.96]",
          grayscale ? "grayscale mix-blend-luminosity group-hover:grayscale-0 group-hover:mix-blend-normal" : "",
          className
        )}
      />

      {/* 4. Fine white outline boundary for layered depth */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 z-20" />
    </div>
  );
};
