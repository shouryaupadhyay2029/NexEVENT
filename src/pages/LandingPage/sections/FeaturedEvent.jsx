import React from "react";
import { useNavigate } from "react-router-dom";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { Button } from "../../../components/ui/Button";
import { EditorialImage } from "../../../components/ui/EditorialImage";
import { RevealSection, RevealItem } from "../../../components/ui/RevealSection";
import { cn } from "../../../utils/cn";
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  } catch (err) {
    return dateStr;
  }
};

const FeaturedEventSkeleton = () => (
  <section className="w-full flex flex-col mb-32 pt-24 animate-pulse">
    <div className="h-6 w-32 bg-white/5 mb-16" />
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
      <div className="h-16 w-full max-w-[600px] bg-white/5" />
      <div className="hidden lg:flex flex-col gap-2 w-48">
        <div className="h-3 w-full bg-white/5" />
        <div className="h-3 w-3/4 bg-white/5" />
      </div>
    </div>
    <div className="w-full aspect-[21/9] bg-white/5 mb-24" />
    <div className="flex flex-col md:flex-row justify-between w-full items-start md:items-center gap-16 mt-8">
      <div className="h-12 w-full max-w-[600px] bg-white/5" />
      <div className="h-24 w-[280px] bg-white/5" />
    </div>
  </section>
);

export const FeaturedEvent = ({ event, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <FeaturedEventSkeleton />;
  }

  if (!event) {
    return (
      <section className="w-full flex flex-col mb-32 pt-24">
        <RevealSection margin="-5%">
          <RevealItem>
            <AxisMarker index="01" label="Featured Focus" />
          </RevealItem>
        </RevealSection>
        <RevealSection margin="-5%">
          <RevealItem>
            <div className="w-full border border-dashed border-white/10 py-24 flex flex-col items-center justify-center text-center relative select-none">
              <span className="text-[0.65rem] font-technical text-white/30 uppercase tracking-[0.25em] mb-4">ARCHIVE // VACANT</span>
              <h3 className="text-display-md text-primary/80 mb-4 font-light">No events have been published yet.</h3>
              <p className="text-body-s text-secondary max-w-sm mb-8">
                The campus archive is currently empty. Initialize a new creative or academic event.
              </p>
              <Button variant="secondary" onClick={() => navigate("/create-event")}>
                Create Event
              </Button>
            </div>
          </RevealItem>
        </RevealSection>
      </section>
    );
  }

  const isLive = event.status?.toLowerCase() === "live";
  const isOpen = event.status?.toLowerCase() === "open";
  const isClosed = event.status?.toLowerCase() === "closed";
  const isCompleted = event.status?.toLowerCase() === "completed";

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
              {event.title}
            </h2>
            <div className="hidden lg:flex flex-col text-left gap-1 opacity-50 pr-8 pb-2">
              <span className="text-micro text-primary">NEX-EV-01 // FEAT</span>
              <span className="text-micro text-secondary">SUBSECTION // 01.Focus</span>
              <span className="text-micro text-secondary">ARCHIVE // {event.category?.toUpperCase() || ""}</span>
            </div>
          </div>
        </RevealItem>

        {/* Image — slower reveal */}
        <RevealItem image>
          <div className="w-full relative mb-24 group cursor-pointer select-none">
            <EditorialImage
              src={event.image}
              alt={event.title}
              aspectRatio="aspect-[21/9]"
              grayscale={true}
            />
            {/* Live Now overlay badge */}
            {isLive && (
              <div className="absolute top-4 right-4 z-40 bg-red-600 border border-red-500 px-3 py-1 text-micro text-white tracking-widest font-technical uppercase flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-none bg-white animate-ping" />
                Live Now
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-background/20 backdrop-blur-sm ease-[cubic-bezier(0.16,1,0.3,1)] z-30">
              <Button 
                variant="primary" 
                disabled={!isOpen}
                className="pointer-events-none transform -translate-y-4 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                {isOpen ? "Register Now" : "Registration Closed"}
              </Button>
            </div>
            <div className="absolute -bottom-8 left-0 w-full flex justify-between items-center text-micro border-t border-border pt-2">
              <span>FIG. 02 — Main Stage Panel</span>
              <span>{event.organizer?.toUpperCase()}</span>
            </div>
          </div>
        </RevealItem>

        {/* Description + Metadata */}
        <RevealItem>
          <div className="flex flex-col md:flex-row justify-between w-full items-start md:items-center gap-16 text-left mt-8">
            <p className="text-body-l text-secondary max-w-[650px]">
              {event.description}
            </p>
            <div className="flex flex-col gap-6 min-w-[280px] w-full md:w-auto">
              <div className="flex justify-between items-center text-micro border-b border-border pb-4">
                <span>Date</span>
                <span className="text-primary font-medium text-[0.75rem] tracking-normal uppercase-none">
                  {formatDate(event.date)}
                </span>
              </div>
              <div className="flex justify-between items-center text-micro border-b border-border pb-4">
                <span>Venue</span>
                <span className="text-primary font-medium text-[0.75rem] tracking-normal uppercase-none">
                  {event.venue}
                </span>
              </div>
              <div className="flex justify-between items-center text-micro">
                <span>Status</span>
                <span className={cn(
                  "font-medium text-[0.75rem] tracking-normal flex items-center gap-1.5",
                  isLive ? "text-red-500 animate-pulse font-semibold" :
                  isOpen ? "text-green-400" :
                  isClosed ? "text-orange-400" :
                  isCompleted ? "text-white/40" : "text-white/30"
                )}>
                  {isLive && <span className="w-1.5 h-1.5 rounded-none bg-red-500 animate-pulse" />}
                  {isLive ? "LIVE NOW" :
                   isOpen ? "Open" :
                   isClosed ? "Closed" :
                   isCompleted ? "Completed" : event.status}
                </span>
              </div>
            </div>
          </div>
        </RevealItem>
      </RevealSection>
    </section>
  );
};
