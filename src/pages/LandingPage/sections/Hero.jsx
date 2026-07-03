import React from "react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";

const ease = [0.16, 1, 0.3, 1];

export const Hero = () => {
  return (
    <section className="min-h-[85vh] flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-16 w-full items-center">
        
        {/* Left Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease }}
          className="col-span-1 lg:col-span-7 flex flex-col items-start"
        >
          <div className="flex items-center gap-3 mb-10">
            <span className="w-1.5 h-1.5 bg-accent rounded-none animate-pulse" />
            <span className="text-[0.65rem] text-primary font-technical tracking-[0.25em] uppercase">Status // Online</span>
          </div>

          <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[6rem] text-primary font-display leading-[0.9] tracking-[-0.03em] mb-10">
            Every Campus Event.<br />
            <span className="text-secondary font-light">One Platform.</span>
          </h1>
          
          <p className="text-body-lg text-secondary max-w-lg mb-14 font-ui font-light leading-relaxed tracking-wide">
            A quiet, architectural foundation designed exclusively for the sophisticated management and discovery of premium campus experiences.
          </p>
          
          <div className="flex flex-wrap items-center gap-8">
            <Button variant="primary" size="lg">Explore</Button>
            <Button variant="ghost" size="lg">Learn More</Button>
          </div>
        </motion.div>

        {/* Right Editorial Showcase framed purely by alignment */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease, delay: 0.2 }}
          className="col-span-1 lg:col-span-5 relative w-full aspect-[3/4] group"
        >
          <div className="w-full h-full overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
              alt="Stanford Design Symposium"
              className="w-full h-full object-cover transition-all duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01] opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80" />
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col gap-6">
              <div className="flex items-center justify-between w-full border-b border-border/40 pb-4">
                <span className="text-[0.65rem] text-secondary uppercase font-technical tracking-[0.25em]">Registration Open</span>
                <span className="text-[0.65rem] text-primary uppercase font-technical tracking-[0.25em]">Free Entry</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl text-primary font-display tracking-tight leading-[0.9]">Stanford Design Symposium '26</h3>
                <div className="flex items-center gap-4 text-[0.65rem] uppercase text-muted font-technical tracking-[0.25em]">
                  <span>Oct 14</span>
                  <span className="w-[1px] h-3 bg-border" />
                  <span>Auditorium</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-6 left-0 w-full flex justify-between items-center text-[0.65rem] text-muted tracking-[0.25em] font-technical uppercase border-t border-border/30 pt-2">
            <span>FIG. 01 — Architecture Showcase</span>
            <span>01 / 05</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
