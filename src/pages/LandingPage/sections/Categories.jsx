import React from "react";
import { motion } from "framer-motion";
import { AxisMarker } from "../../../components/layout/AxisMarker";

const categories = [
  "Technical", "Hackathons", "Workshops", "Sports", "Cultural", "Seminars", "Competitions", "Networking", "Guest Lectures"
];

const ease = [0.16, 1, 0.3, 1];

export const Categories = () => {
  return (
    <section className="w-full flex flex-col mb-32 pt-24">
      <AxisMarker index="03" label="Academic Domains" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease }}
        className="w-full max-w-[1200px] mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
      >
        <h2 className="text-display-l text-primary font-light">
          Explore by academic<br />and cultural domains.
        </h2>
        <div className="hidden lg:flex flex-col text-left gap-1 opacity-50 pr-8 pb-2">
          <span className="text-micro text-primary">NEX-EV-03 // DOMAINS</span>
          <span className="text-micro text-secondary">CLASSIFIED // ALL.CATEGORIES</span>
          <span className="text-micro text-secondary">TOTAL GROUPS // 09</span>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-4 w-full max-w-[1200px] pb-8">
        {categories.map((category, index) => (
          <motion.button
            key={category}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, delay: index * 0.05, ease }}
            className="px-6 py-3 border-b border-border bg-transparent hover:border-primary transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] text-sm tracking-wide font-ui rounded-none focus:outline-none relative group"
          >
            {category}
            <span className="absolute -bottom-[1px] left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          </motion.button>
        ))}
      </div>
    </section>
  );
};
