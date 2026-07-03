import React, { useEffect } from "react";
import { LivingBackground } from "./LivingBackground";
import { Navbar } from "../navigation/Navbar";
import { Footer } from "./Footer";
import { initLenis } from "../../lib/lenis";

export const Layout = ({ children }) => {
  useEffect(() => {
    const lenis = initLenis();
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden text-primary font-ui flex flex-col">
      <LivingBackground />
      <Navbar />
      
      {/* Main Content Area framed with the Event Axis */}
      <div className="flex-grow flex flex-col w-full relative z-10 pt-32">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 relative flex">
          
          {/* THE EVENT AXIS WITH DETAILED EDITORIAL MARKINGS */}
          <div className="absolute left-6 md:left-10 top-0 bottom-0 w-[1px] bg-border hidden md:block">
            {/* Top Anchor: coordinates */}
            <div className="absolute top-[12%] -left-[140px] w-[280px] flex items-center justify-center pointer-events-none select-none rotate-90 origin-center">
              <span className="text-micro text-primary font-light whitespace-nowrap">
                LOC [ 37.4275° N, 122.1697° W ]
              </span>
            </div>

            {/* Mid Anchor 1: term marker */}
            <div className="absolute top-[35%] -left-[140px] w-[280px] flex items-center justify-center pointer-events-none select-none rotate-90 origin-center">
              <span className="text-micro text-primary font-light whitespace-nowrap">
                EDITION // 2026.AUTUMN
              </span>
            </div>

            {/* Mid Anchor 2: alignment crosshair */}
            <div className="absolute top-[62%] -left-[140px] w-[280px] flex items-center justify-center pointer-events-none select-none rotate-90 origin-center">
              <span className="text-micro text-primary font-light whitespace-nowrap">
                ALIGN.INDEX.REF // 01
              </span>
            </div>

            {/* Bottom Anchor: term status */}
            <div className="absolute top-[85%] -left-[140px] w-[280px] flex items-center justify-center pointer-events-none select-none rotate-90 origin-center">
              <span className="text-micro text-accent opacity-60 font-light whitespace-nowrap">
                TERM.01 // ACTIVE
              </span>
            </div>
          </div>
          
          {/* Content Column (shifted right to give axis space) */}
          <div className="w-full md:pl-24 flex flex-col pb-32">
            {children}
          </div>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
};
