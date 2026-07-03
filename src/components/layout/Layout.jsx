import React, { useEffect } from "react";
import { NoiseOverlay } from "./NoiseOverlay";
import { GridOverlay } from "./GridOverlay";
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
      <NoiseOverlay />
      
      {/* Subtle ambient lighting vignette */}
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-background to-background opacity-40 z-0" />
      <GridOverlay />
      <Navbar />
      
      {/* Main Content Area framed with the Event Axis */}
      <div className="flex-grow flex flex-col w-full relative z-10 pt-32">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 relative flex">
          
          {/* THE EVENT AXIS */}
          <div className="absolute left-6 md:left-10 top-0 bottom-0 w-[1px] bg-border/40 hidden md:block" />
          
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
