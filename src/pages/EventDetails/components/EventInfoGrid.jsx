import React from 'react';

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch (err) {
    return dateStr;
  }
};

export const EventInfoGrid = ({ event }) => {
  const remainingSeats = Math.max(0, (event.capacity || 0) - (event.registeredCount || 0));

  const infoItems = [
    { label: "Date", value: formatDate(event.date) },
    { label: "Time", value: event.time || "N/A" },
    { label: "Venue", value: event.venue },
    { label: "Organizer", value: event.organizer },
    { label: "Capacity", value: `${event.capacity} seats` },
    { label: "Remaining Seats", value: `${remainingSeats} available` },
    { label: "Deadline", value: formatDate(event.registrationDeadline) }
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      {infoItems.map((item, index) => (
        <div 
          key={index}
          className="flex justify-between items-center py-3.5 border-b border-white/5 text-[0.7rem] md:text-xs font-technical uppercase"
        >
          <span className="text-white/40">{item.label}</span>
          <span className="text-primary font-medium tracking-wide">{item.value || "N/A"}</span>
        </div>
      ))}
    </div>
  );
};
