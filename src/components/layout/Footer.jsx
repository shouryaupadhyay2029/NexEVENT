import React from "react";
import { Link } from "react-router-dom";
import { Wordmark } from "../navigation/Wordmark";
import { cn } from "../../utils/cn";

export const Footer = ({ className }) => {
  return (
    <footer className={cn("w-full border-t border-white/[0.06] bg-background relative z-10", className)}>
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-16">
        
        {/* Left Creator Branding */}
        <div className="flex flex-col gap-8">
          <Wordmark />
          <div className="flex flex-col gap-2.5 group/creator text-left">
            <span className="text-[0.58rem] text-white/40 tracking-[0.25em] uppercase font-mono select-none">
              Created & Designed By
            </span>
            <span className="text-[1.35rem] font-light text-white/80 tracking-tight transition-colors duration-300 group-hover/creator:text-white select-all">
              Shourya Upadhyay
            </span>
            <span className="text-[0.72rem] text-white/40 font-light select-none">
              Building premium digital experiences.
            </span>
          </div>
        </div>
        
        {/* Right Navigation Lists */}
        <div className="flex flex-col gap-12 md:flex-row md:gap-24 text-[0.65rem] uppercase tracking-[0.2em] font-mono select-none">
          <div className="flex flex-col gap-4">
            <span className="text-white font-medium border-b border-white/[0.06] pb-2 tracking-[0.25em]">Platform</span>
            <Link to="/" className="text-white/40 hover:text-white/80 transition-all duration-300 relative group/link flex items-center hover:translate-x-1 pb-1">
              <span>Discover</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover/link:w-full" />
            </Link>
            <Link to="/events" className="text-white/40 hover:text-white/80 transition-all duration-300 relative group/link flex items-center hover:translate-x-1 pb-1">
              <span>Events</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover/link:w-full" />
            </Link>
            <Link to="/organizer" className="text-white/40 hover:text-white/80 transition-all duration-300 relative group/link flex items-center hover:translate-x-1 pb-1">
              <span>Organizer Studio</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover/link:w-full" />
            </Link>
            <Link to="/admin" className="text-white/40 hover:text-white/80 transition-all duration-300 relative group/link flex items-center hover:translate-x-1 pb-1">
              <span>Admin Console</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover/link:w-full" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <span className="text-white font-medium border-b border-white/[0.06] pb-2 tracking-[0.25em]">Resources</span>
            <Link to="/about" className="text-white/40 hover:text-white/80 transition-all duration-300 relative group/link flex items-center hover:translate-x-1 pb-1">
              <span>About</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover/link:w-full" />
            </Link>
            <a href="https://github.com/shouryaupadhyay2029/NexEVENT" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/80 transition-all duration-300 relative group/link flex items-center hover:translate-x-1 pb-1">
              <span>GitHub</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover/link:w-full" />
            </a>
            <a href="mailto:upadhyayshourya352@gmail.com" className="text-white/40 hover:text-white/80 transition-all duration-300 relative group/link flex items-center hover:translate-x-1 pb-1">
              <span>Contact</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover/link:w-full" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar Credits */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center text-[0.55rem] text-white/30 uppercase tracking-[0.2em] font-mono select-none">
        <span>&copy; {new Date().getFullYear()} NEXEVENT // VOL. 01</span>
        <span className="mt-4 md:mt-0 hover:text-white/60 transition-colors duration-500">
          Designed & Developed by Shourya Upadhyay
        </span>
      </div>
    </footer>
  );
};
