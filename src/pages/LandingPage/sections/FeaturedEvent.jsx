import React from "react";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { Button } from "../../../components/ui/Button";
import { EditorialImage } from "../../../components/ui/EditorialImage";
import { RevealSection, RevealItem } from "../../../components/ui/RevealSection";

export const FeaturedEvent = () => {
  return (
    <section className="w-full flex flex-col mb-32 pt-24">
      <RevealSection margin="-5%">
        <RevealItem>
          <AxisMarker index="01" label="Featured Focus" />
        </RevealItem>
      </RevealSection>

      <RevealSection margin="-5%" staggerDelay={0.14}>
        <RevealItem>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 max-w-[1200px] gap-8">
            <h2 className="text-display-l text-primary font-light">
              The Annual Tech<br className="hidden md:block" /> Innovation Summit.
            </h2>
            <div className="hidden lg:flex flex-col text-left gap-1 opacity-50 pr-8 pb-2">
              <span className="text-micro text-primary">NEX-EV-01 // FEAT</span>
              <span className="text-micro text-secondary">SUBSECTION // 01.Focus</span>
              <span className="text-micro text-secondary">ARCHIVE // AUTUMN.26</span>
            </div>
          </div>
        </RevealItem>

        {/* Image — slower reveal */}
        <RevealItem image>
          <div className="w-full relative mb-24 group cursor-pointer select-none">
            <EditorialImage
              src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=2070&auto=format&fit=crop"
              alt="Tech Summit Stage"
              aspectRatio="aspect-[21/9]"
              grayscale={true}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-background/20 backdrop-blur-sm ease-[cubic-bezier(0.16,1,0.3,1)] z-30">
              <Button variant="primary" className="pointer-events-none transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                Register Now
              </Button>
            </div>
            <div className="absolute -bottom-8 left-0 w-full flex justify-between items-center text-micro border-t border-border pt-2">
              <span>FIG. 02 — Main Stage Panel</span>
              <span>CS DEPT.</span>
            </div>
          </div>
        </RevealItem>

        {/* Description + Metadata */}
        <RevealItem>
          <div className="flex flex-col md:flex-row justify-between w-full items-start md:items-center gap-16 text-left mt-8">
            <p className="text-body-l text-secondary">
              A three-day exploration of artificial intelligence, architectural software design,
              and the future of human-computer interaction, presented by the Computer Science department.
            </p>
            <div className="flex flex-col gap-6 min-w-[280px] w-full md:w-auto">
              <div className="flex justify-between items-center text-micro border-b border-border pb-4">
                <span>Date</span>
                <span className="text-primary font-medium text-[0.75rem] tracking-normal uppercase-none">Nov 12 — 14</span>
              </div>
              <div className="flex justify-between items-center text-micro">
                <span>Venue</span>
                <span className="text-primary font-medium text-[0.75rem] tracking-normal uppercase-none">Main Campus Hub</span>
              </div>
            </div>
          </div>
        </RevealItem>
      </RevealSection>
    </section>
  );
};
