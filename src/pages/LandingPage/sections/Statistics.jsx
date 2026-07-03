import React from "react";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { RevealSection, RevealItem, StandaloneReveal } from "../../../components/ui/RevealSection";

const stats = [
  { value: "1,250+", label: "Active Students", ref: "FIG. 06" },
  { value: "75", label: "Events Hosted", ref: "FIG. 07" },
  { value: "24", label: "Campus Clubs", ref: "FIG. 08" },
  { value: "96%", label: "Participation", ref: "FIG. 09" },
];

export const Statistics = () => {
  return (
    <section className="w-full flex flex-col mb-32 pt-24">
      <StandaloneReveal margin="-5%">
        <AxisMarker index="05" label="Volume Metrics" />
      </StandaloneReveal>

      <RevealSection margin="-5%" staggerDelay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-8 max-w-[1200px] w-full justify-between">
          {stats.map((stat, index) => (
            <RevealItem key={stat.label} delay={index * 0.08}>
              <div className="flex flex-col text-left pr-4 relative group">
                <span className="text-micro border-b border-border pb-4 mb-8">
                  {stat.ref}
                </span>
                <h3 className="text-display-l text-primary mb-6 font-light">
                  {stat.value}
                </h3>
                <span className="text-micro">
                  {stat.label}
                </span>
              </div>
            </RevealItem>
          ))}
        </div>
      </RevealSection>
    </section>
  );
};
