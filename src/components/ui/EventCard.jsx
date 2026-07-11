import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useTransform } from 'framer-motion';
import { EditorialImage } from './EditorialImage';
import { useAmbientLight } from '../../hooks/useMagnet';
import { cn } from '../../utils/cn';

/**
 * EventCard — individual upcoming event card with ambient light shift on cursor movement.
 * The light is not a spotlight — it's a very low-opacity atmospheric depth effect.
 */
export const EventCard = ({ event, index, className }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { ref, lightX, lightY, handlers } = useAmbientLight({ damping: 55, stiffness: 280 });

  const transformX = useTransform(lightX, (lx) => `calc(${lx * 100}% - 130px)`);
  const transformY = useTransform(lightY, (ly) => `calc(${ly * 100}% - 130px)`);



  const resolveCountdown = (eVal) => {
    const status = (eVal.status || 'open').toLowerCase();
    if (status === 'draft') return 'Draft';
    if (status === 'archived') return 'Archived';
    if (status === 'completed') return 'Completed';
    if (status === 'live') return 'LIVE NOW';

    if (eVal.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(eVal.date);
      eventDate.setHours(0, 0, 0, 0);
      
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Starts Today';
      if (diffDays === 1) return 'Starts Tomorrow';
      if (diffDays > 1) return `Starts In ${diffDays} Days`;
    }
    return 'Upcoming';
  };

  return (
    <div
      ref={ref}
      {...handlers}
      onClick={() => navigate(`/events/${event.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex flex-col group cursor-pointer relative',
        event.status?.toLowerCase() === 'completed' ? 'opacity-35 hover:opacity-70 transition-opacity duration-500' : '',
        className
      )}
    >
      {/* Image */}
      <div className="w-full relative mb-8">
        <EditorialImage
          src={event.image}
          alt={event.title}
          aspectRatio="aspect-[4/5]"
          grayscale={true}
          width={400}
          height={500}
        />

        {/* Ambient light overlay on the image using GPU translation (No layout repaints) */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-overlay">
          <motion.div
            className="absolute w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,transparent_70%)]"
            style={{
              x: transformX,
              y: transformY,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
          />
        </div>

        {/* Figure label on hover */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between items-center text-micro border-t border-border pt-2 pb-2 px-2 bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30">
          <span>FIG. 0{index + 3}</span>
        </div>
      </div>

      {/* Text content */}
      <div className="flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <span
            className="text-micro text-primary transition-colors duration-500"
            style={{ color: isHovered ? 'rgba(255,255,255,0.9)' : undefined }}
          >
            {event.category}
          </span>
          <span className="w-4 h-[1px] bg-border" />
          <div className="flex items-center gap-2">
            {event.status?.toLowerCase() === "live" && <span className="w-1 h-1 rounded-none bg-red-500 animate-pulse" />}
            <span className={cn(
              "text-micro font-technical uppercase tracking-wider",
              event.status?.toLowerCase() === "live" ? "text-red-400" :
              event.status?.toLowerCase() === "open" ? "text-green-400" :
              event.status?.toLowerCase() === "closed" ? "text-orange-400" :
              event.status?.toLowerCase() === "completed" ? "text-white/40" :
              "text-white/30"
            )}>
              {resolveCountdown(event)}
            </span>
          </div>
        </div>

        {/* Heading with brightness response */}
        <h3
          className="text-display-m mb-8 font-light transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            color: isHovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.88)',
          }}
        >
          {event.title}
        </h3>

        <div
          className="flex justify-between items-center text-micro border-t border-border pt-6 transition-colors duration-500"
          style={{ color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)' }}
        >
          <span>
            {(() => {
              if (!event.date) return "";
              try {
                const d = new Date(event.date);
                if (isNaN(d.getTime())) return event.date;
                return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
              } catch {
                return event.date;
              }
            })()}
          </span>
          <span>{event.venue}</span>
        </div>
      </div>
    </div>
  );
};
