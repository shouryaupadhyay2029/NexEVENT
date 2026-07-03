import React from "react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { HeroHeadline } from "../../../components/ui/HeroHeadline";
import { FeaturedEventCard } from "../../../components/ui/FeaturedEventCard";
import { EASE_OUT_EXPO } from "../../../animations/scrollReveal";

// Hero has its own choreography — not viewport triggered, runs on mount
const heroItem = (delay = 0) => ({
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: EASE_OUT_EXPO, delay }
  }
});

const heroCard = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.45 }
  }
};

export const Hero = ({ event, loading }) => {
  return (
    <section className="min-h-[85vh] flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-16 w-full items-center">
        
        {/* Left Typography — staggered on mount */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="col-span-1 lg:col-span-7 flex flex-col items-start"
        >
          {/* Status pill */}
          <motion.div
            variants={heroItem(0)}
            className="flex items-center gap-3 mb-10"
          >
            <span className="w-1.5 h-1.5 bg-accent rounded-none animate-pulse" />
            <span className="text-micro text-primary opacity-75">
              Status // Online
            </span>
          </motion.div>
 
          {/* Headline — its own internal stagger */}
          <motion.div variants={heroItem(0.08)} className="w-full">
            <HeroHeadline />
          </motion.div>
 
          {/* Body copy */}
          <motion.p
            variants={heroItem(0.22)}
            className="text-body-l text-secondary mb-14"
          >
            A quiet, architectural foundation designed exclusively for the sophisticated
            management and discovery of premium campus experiences.
          </motion.p>
 
          {/* CTA row */}
          <motion.div
            variants={heroItem(0.34)}
            className="flex flex-wrap items-center gap-8"
          >
            <Button variant="primary" size="lg">Explore</Button>
            <Button variant="ghost" size="lg">Learn More</Button>
          </motion.div>
        </motion.div>
 
        {/* Right card — slightly delayed, heavier reveal */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroCard}
          className="col-span-1 lg:col-span-5"
        >
          <FeaturedEventCard event={event} loading={loading} />
        </motion.div>
      </div>
    </section>
  );
};
