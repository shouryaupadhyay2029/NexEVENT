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
          
          {/* THE EVENT AXIS */}
          <div className="absolute left-6 md:left-10 top-0 bottom-0 w-[1px] bg-border hidden md:block" />
          
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
