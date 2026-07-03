import React from "react";
import { Wordmark } from "../navigation/Wordmark";
import { cn } from "../../utils/cn";

export const Footer = ({ className }) => {
  return (
    <footer className={cn("w-full border-t border-border bg-background relative z-10", className)}>
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-16">
        <div className="flex flex-col gap-8">
          <Wordmark />
          <div className="flex flex-col gap-2">
            <p className="text-[0.65rem] text-secondary tracking-[0.2em] uppercase max-w-xs leading-relaxed">
              Main Campus Hub
            </p>
            <p className="text-[0.55rem] text-muted tracking-[0.2em] uppercase max-w-xs leading-relaxed">
              LAT. 37.4275 — QUAD. NORTH
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-12 md:flex-row md:gap-24 text-[0.7rem] uppercase tracking-[0.15em] font-ui">
          <div className="flex flex-col gap-5">
            <span className="text-primary font-medium mb-4 border-b border-border pb-2">Archive</span>
            <a href="#" className="text-secondary hover:text-primary hover:-translate-y-[1px] transition-all duration-300 ease-out-expo">Events</a>
            <a href="#" className="text-secondary hover:text-primary hover:-translate-y-[1px] transition-all duration-300 ease-out-expo">Organizations</a>
            <a href="#" className="text-secondary hover:text-primary hover:-translate-y-[1px] transition-all duration-300 ease-out-expo">Calendar</a>
          </div>
          <div className="flex flex-col gap-5">
            <span className="text-primary font-medium mb-4 border-b border-border pb-2">Legal</span>
            <a href="#" className="text-secondary hover:text-primary hover:-translate-y-[1px] transition-all duration-300 ease-out-expo">Privacy</a>
            <a href="#" className="text-secondary hover:text-primary hover:-translate-y-[1px] transition-all duration-300 ease-out-expo">Terms</a>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-[0.55rem] text-muted uppercase tracking-[0.2em]">
        <span>&copy; {new Date().getFullYear()} NexEvent // Vol. 01</span>
        <span className="mt-4 md:mt-0">Designed with intention.</span>
      </div>
    </footer>
  );
};
