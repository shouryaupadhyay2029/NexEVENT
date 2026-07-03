import React from "react";
import { motion } from "framer-motion";
import { AxisMarker } from "../../../components/layout/AxisMarker";

const ease = [0.16, 1, 0.3, 1];

const stats = [
  { value: "1,250+", label: "Active Students", ref: "FIG. 06" },
  { value: "75", label: "Events Hosted", ref: "FIG. 07" },
  { value: "24", label: "Campus Clubs", ref: "FIG. 08" },
  { value: "96%", label: "Participation", ref: "FIG. 09" },
];

export const Statistics = () => {
  return (
    <section className="w-full flex flex-col mb-32 pt-24">
      <AxisMarker index="05" label="Volume Metrics" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-8 max-w-[1200px] w-full justify-between">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 1, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: index * 0.1, ease }}
            className="flex flex-col text-left pr-4 relative group"
          >
            <span className="text-[0.65rem] text-border tracking-[0.25em] font-technical uppercase border-b border-border/30 pb-4 mb-8">
              {stat.ref}
            </span>
            <h3 className="text-[3.5rem] md:text-[4.5rem] font-display text-primary leading-[0.9] tracking-[-0.05em] mb-6">
              {stat.value}
            </h3>
            <span className="text-[0.65rem] text-secondary font-technical uppercase tracking-[0.25em]">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
