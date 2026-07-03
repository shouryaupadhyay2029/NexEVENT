import React from "react";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { Button } from "../../../components/ui/Button";
import { EventCard } from "../../../components/ui/EventCard";
import { RevealSection, RevealItem, StandaloneReveal } from "../../../components/ui/RevealSection";

const EventCardSkeleton = () => (
  <div className="flex flex-col animate-pulse w-full">
    <div className="w-full aspect-[4/5] bg-white/5 mb-8" />
    <div className="h-4 w-1/3 bg-white/5 mb-6" />
    <div className="h-6 w-3/4 bg-white/5 mb-8" />
    <div className="h-4 w-full bg-white/5" />
  </div>
);

const UpcomingSkeleton = () => (
  <section className="w-full flex flex-col mb-32 pt-24">
    <StandaloneReveal margin="-5%">
      <AxisMarker index="04" label="Global Schedule" />
    </StandaloneReveal>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-6 max-w-[1200px] animate-pulse">
      <div className="h-12 w-64 bg-white/5" />
      <div className="h-10 w-32 bg-white/5 hidden md:block" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 max-w-[1200px]">
      {[1, 2, 3].map((n) => (
        <EventCardSkeleton key={n} />
      ))}
    </div>
  </section>
);

export const UpcomingEvents = ({ events, loading }) => {
  if (loading) {
    return <UpcomingSkeleton />;
  }

  // If no additional upcoming events are found, display a subtle placeholder message
  const hasEvents = events && events.length > 0;

  return (
    <section className="w-full flex flex-col mb-32 pt-24">
      <StandaloneReveal margin="-5%">
        <AxisMarker index="04" label="Global Schedule" />
      </StandaloneReveal>

      <RevealSection margin="-5%" staggerDelay={0.1}>
        <RevealItem>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-6 max-w-[1200px]">
            <h2 className="text-display-l text-primary font-light">Upcoming Events</h2>
            <Button variant="ghost" className="hidden md:flex">View Calendar</Button>
          </div>
        </RevealItem>

        <RevealItem>
          {hasEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 max-w-[1200px]">
              {events.map((event, index) => (
                <RevealSection
                  key={event.id}
                  margin="-5%"
                  staggerDelay={0.12}
                  delay={index * 0.1}
                >
                  <RevealItem image>
                    <EventCard event={event} index={index} />
                  </RevealItem>
                </RevealSection>
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-12 border border-dashed border-white/5 select-none">
              <span className="text-[0.6rem] font-technical text-white/20 uppercase tracking-[0.2em]">
                No other upcoming events scheduled
              </span>
            </div>
          )}
        </RevealItem>
      </RevealSection>

      <div className="mt-20 flex justify-start md:hidden">
        <Button variant="ghost">View Calendar</Button>
      </div>
    </section>
  );
};
