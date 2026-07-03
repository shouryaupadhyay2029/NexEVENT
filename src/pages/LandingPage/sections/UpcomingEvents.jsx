import React from "react";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { Button } from "../../../components/ui/Button";
import { EventCard } from "../../../components/ui/EventCard";
import { RevealSection, RevealItem, StandaloneReveal } from "../../../components/ui/RevealSection";

const upcoming = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop",
    category: "Technical",
    title: "Global AI Hackathon",
    date: "Dec 01",
    venue: "Block A",
    status: "Open"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1475721025505-c31074285741?q=80&w=2070&auto=format&fit=crop",
    category: "Cultural",
    title: "Symphony Night",
    date: "Dec 15",
    venue: "Theatre",
    status: "Waitlist"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1523580494112-071dcb85170d?q=80&w=2070&auto=format&fit=crop",
    category: "Workshop",
    title: "Architecture Series",
    date: "Jan 10",
    venue: "Studio 4",
    status: "Open"
  }
];

export const UpcomingEvents = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 max-w-[1200px]">
            {upcoming.map((event, index) => (
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
        </RevealItem>
      </RevealSection>

      <div className="mt-20 flex justify-start md:hidden">
        <Button variant="ghost">View Calendar</Button>
      </div>
    </section>
  );
};
