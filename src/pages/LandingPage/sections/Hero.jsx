import React from "react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { HeroHeadline } from "../../../components/ui/HeroHeadline";
import { FeaturedEventCard } from "../../../components/ui/FeaturedEventCard";

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

          <HeroHeadline />
          
          <p className="text-body-lg text-secondary max-w-lg mb-14 font-ui font-light leading-relaxed tracking-wide">
            A quiet, architectural foundation designed exclusively for the sophisticated management and discovery of premium campus experiences.
          </p>
          
          <div className="flex flex-wrap items-center gap-8">
            <Button variant="primary" size="lg">Explore</Button>
            <Button variant="ghost" size="lg">Learn More</Button>
          </div>
        </motion.div>

        {/* Right Editorial Showcase framed purely by alignment */}
        <FeaturedEventCard />
      </div>
    </section>
  );
};
