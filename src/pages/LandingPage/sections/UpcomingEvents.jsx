import React from "react";
import { motion } from "framer-motion";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { Button } from "../../../components/ui/Button";
import { EditorialImage } from "../../../components/ui/EditorialImage";

const ease = [0.16, 1, 0.3, 1];

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
      <AxisMarker index="04" label="Global Schedule" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-6 max-w-[1200px]">
        <h2 className="text-[3rem] leading-[0.9] font-display text-primary tracking-tight">Upcoming Events</h2>
        <Button variant="ghost" className="hidden md:flex">View Calendar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 max-w-[1200px]">
        {upcoming.map((event, index) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1, delay: index * 0.15, ease }}
            className="flex flex-col group cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-8 focus-visible:ring-offset-background"
            tabIndex={0}
          >
            {/* Image framed by alignment */}
            <div className="w-full relative mb-8">
              <EditorialImage 
                src={event.image} 
                alt={event.title}
                aspectRatio="aspect-[4/5]"
                grayscale={true}
              />
              <div className="absolute -bottom-0 left-0 w-full flex justify-between items-center text-[0.55rem] text-muted tracking-[0.25em] font-technical uppercase border-t border-border pt-2 pb-2 px-2 bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30">
                <span>FIG. 0{index + 3}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[0.65rem] text-primary uppercase font-technical tracking-[0.25em]">{event.category}</span>
                <span className="w-4 h-[1px] bg-border" />
                <div className="flex items-center gap-2">
                  {event.status === "Open" && <span className="w-1 h-1 rounded-none bg-accent animate-pulse" />}
                  <span className={event.status === "Open" ? "text-[0.65rem] text-primary uppercase font-technical tracking-[0.25em]" : "text-[0.65rem] text-muted font-technical uppercase tracking-[0.25em]"}>
                    {event.status}
                  </span>
                </div>
              </div>
              
              <h3 className="text-3xl leading-[0.9] font-display text-primary mb-8 group-hover:text-secondary transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] tracking-tight">
                {event.title}
              </h3>
              
              <div className="flex justify-between items-center text-[0.65rem] text-muted tracking-[0.25em] font-technical uppercase border-t border-border pt-6">
                <span>{event.date}</span>
                <span>{event.venue}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-20 flex justify-start md:hidden">
        <Button variant="ghost">View Calendar</Button>
      </div>
    </section>
  );
};
