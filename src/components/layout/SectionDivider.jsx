import React from "react";
import { motion } from "framer-motion";

export const SectionDivider = ({ index, label }) => {
  return (
    <div className="w-full relative flex items-center justify-between border-t border-border/40 pt-4 pb-16">
      <div className="flex items-center gap-6">
        <span className="text-[0.65rem] text-primary font-medium tracking-[0.25em] uppercase">
          INDEX {index}
        </span>
        <span className="text-[0.65rem] text-muted tracking-[0.25em] uppercase">
          {label}
        </span>
      </div>
      <span className="text-[0.55rem] text-border tracking-[0.2em]">
        VOL. 01
      </span>
    </div>
  );
};
