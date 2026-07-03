import React from "react";
import { motion } from "framer-motion";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { Button } from "../../../components/ui/Button";

const ease = [0.16, 1, 0.3, 1];

export const FeaturedEvent = () => {
  return (
    <section className="w-full flex flex-col mb-32 pt-24">
      <AxisMarker index="01" label="Featured Focus" />
      
      <motion.article 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1.2, ease }}
        className="flex flex-col w-full max-w-[1200px]"
      >
        <h2 className="text-[4rem] md:text-[6rem] leading-[0.9] tracking-tight font-display text-primary mb-20 max-w-4xl">
          The Annual Tech<br className="hidden md:block"/> Innovation Summit.
        </h2>

        {/* Image framed by axis alignment */}
        <div className="w-full relative mb-24 group cursor-pointer select-none">
          <div className="w-full aspect-[21/9] relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=2070&auto=format&fit=crop" 
              alt="Tech Summit Stage"
              className="w-full h-full object-cover transition-all duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01] opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-background/20 backdrop-blur-sm ease-[cubic-bezier(0.16,1,0.3,1)]">
               <Button variant="primary" className="pointer-events-none transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                 Register Now
               </Button>
            </div>
          </div>
          
          <div className="absolute -bottom-8 left-0 w-full flex justify-between items-center text-[0.65rem] text-muted tracking-[0.25em] font-technical uppercase border-t border-border/30 pt-2">
            <span>FIG. 02 — Main Stage Panel</span>
            <span>CS DEPT.</span>
          </div>
        </div>

        {/* Minimal Description and Metadata */}
        <div className="flex flex-col md:flex-row justify-between w-full items-start md:items-center gap-16 text-left mt-8">
          <p className="text-xl md:text-2xl text-secondary max-w-lg font-light leading-relaxed tracking-wide">
            A three-day exploration of artificial intelligence, architectural software design, and the future of human-computer interaction, presented by the Computer Science department.
          </p>
          
          <div className="flex flex-col gap-6 min-w-[280px] w-full md:w-auto">
            <div className="flex justify-between items-center text-[0.65rem] uppercase font-technical tracking-[0.25em] text-muted border-b border-border/30 pb-4">
              <span>Date</span>
              <span className="text-primary font-medium">Nov 12 — 14</span>
            </div>
            <div className="flex justify-between items-center text-[0.65rem] uppercase font-technical tracking-[0.25em] text-muted">
              <span>Venue</span>
              <span className="text-primary font-medium">Main Campus Hub</span>
            </div>
          </div>
        </div>
      </motion.article>
    </section>
  );
};
