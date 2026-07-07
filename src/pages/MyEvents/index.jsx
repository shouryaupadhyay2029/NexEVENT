import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserRegistrations } from '../../services/registrationService';
import { getAllEvents } from '../../services/eventService';
import { PageTransition } from '../../components/layout/PageTransition';
import { PageContainer } from '../../components/layout/PageContainer';
import { SectionWrapper } from '../../components/layout/SectionWrapper';
import { AxisMarker } from '../../components/layout/AxisMarker';
import { cn } from '../../utils/cn';
import { Calendar, Clock, MapPin, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'registered' | 'past'
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [regs, setRegs] = useState({});
  const [selectedEventForPass, setSelectedEventForPass] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user?.uid) return;
      setLoading(true);
      setError('');
      try {
        // Fetch user registrations and all events
        const [registrations, events] = await Promise.all([
          getUserRegistrations(user.uid),
          getAllEvents()
        ]);

        const registeredIds = new Set(registrations.map(r => r.eventId));
        
        const regsMap = {};
        registrations.forEach(r => {
          regsMap[r.eventId] = r;
        });
        setRegs(regsMap);

        // Filter events that user has registered for
        const filteredReg = events.filter(e => registeredIds.has(e.id));
        // Sort by date ascending (soonest first)
        filteredReg.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

        setRegisteredEvents(filteredReg);
      } catch (err) {
        console.error("Failed to load user events:", err);
        setError("Unable to retrieve events list.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedEventForPass(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredEvents = registeredEvents.filter(event => {
    if (activeTab === 'registered') return true;
    const isUpcoming = event.date && event.date >= todayStr;
    if (activeTab === 'upcoming') return isUpcoming;
    if (activeTab === 'past') return !isUpcoming;
    return false;
  });

  const displayEvents = filteredEvents;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <PageTransition>
      <PageContainer>
        <SectionWrapper className="max-w-4xl py-12 md:py-20 flex flex-col gap-12">
          {/* Header */}
          <div className="relative">
            <AxisMarker index="02" label="Registration Log" />
            <h1 className="text-display-lg font-light mt-6 text-primary">My Events</h1>
            <p className="text-body-lg text-secondary max-w-xl mt-4 font-light leading-relaxed">
              Track your upcoming bookings, complete event log, and past academic archives.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-6 border-b border-white/5 pb-2 mt-8">
            {['upcoming', 'registered', 'past'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-micro font-technical uppercase tracking-wider pb-2 focus:outline-none transition-colors border-b",
                  activeTab === tab 
                    ? "border-accent text-accent" 
                    : "border-transparent text-white/40 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List Area */}
          <div className="flex flex-col gap-1.5 min-h-[30vh]">
            {loading ? (
              // Premium minimal skeleton loader
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 w-full bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-body-s text-red-400 font-technical uppercase tracking-wider py-8">
                {error}
              </div>
            ) : displayEvents.length === 0 ? (
              // Graceful minimal empty state
              <div className="flex flex-col py-16 border border-dashed border-white/5 items-center justify-center text-center select-none font-ui">
                <span className="text-[0.6rem] font-technical text-white/20 uppercase tracking-[0.25em] mb-3">
                  Archive Status // Empty
                </span>
                <p className="text-body-s text-secondary">
                  No events found in this category.
                </p>
                <button
                  onClick={() => navigate('/events')}
                  className="text-micro font-technical text-accent uppercase tracking-wider mt-5 hover:text-accent/80 transition-colors"
                >
                  Discover Events →
                </button>
              </div>
            ) : (
              // Events List Layout
              <div className="flex flex-col border border-white/5 divide-y divide-white/5 rounded-none overflow-hidden font-ui">
                {displayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-white/[0.02] cursor-pointer transition-all duration-300"
                  >
                    <div className="flex flex-col gap-2.5">
                      {/* Top Row: Category */}
                      <span className="text-micro text-accent font-technical uppercase tracking-widest">
                        {event.category || "General"}
                      </span>
                      
                      {/* Event Title */}
                      <h3 className="text-body-l font-light text-primary group-hover:text-white transition-colors duration-200">
                        {event.title}
                      </h3>
                      
                      {/* Details Meta */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-micro text-white/40">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {event.time || "TBA"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {event.venue || "TBA"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end mt-4 md:mt-0 gap-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedEventForPass(event)}
                        className="px-3 py-1.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-technical uppercase tracking-wider transition-all select-none focus:outline-none"
                      >
                        View Pass
                      </button>
                      <span className="text-[0.6rem] font-technical uppercase px-2 py-0.5 border border-white/10 bg-white/5 text-white/50 tracking-wider">
                        Registered
                      </span>
                      <ChevronRight 
                        className="w-4 h-4 text-white/20 hover:text-white/60 cursor-pointer" 
                        onClick={() => navigate(`/events/${event.id}`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DIGITAL TICKET / EVENT PASS MODAL */}
          <AnimatePresence>
            {selectedEventForPass && (() => {
              const eventItem = selectedEventForPass;
              const regDoc = regs[eventItem.id] || {};
              const regNo = regDoc.registrationNumber || "PENDING";
              const isCheckedIn = regDoc.checkedIn || false;
              const qrPayload = `${user.uid}_${eventItem.id}`;
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrPayload)}&color=ffffff&bgcolor=141414`;
              const EASE = [0.16, 1, 0.3, 1];

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedEventForPass(null)}
                    className="absolute inset-0 bg-[#090909]/80 backdrop-blur-md"
                  />

                  {/* Boarding Pass Container */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="bg-[#141414]/95 border border-white/10 w-full max-w-2xl h-auto z-10 flex flex-col md:flex-row rounded-none shadow-[0_32px_60px_-16px_rgba(0,0,0,0.8)] relative font-ui overflow-hidden"
                  >
                    {/* Perforated Grain Overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
                    />

                    {/* Close Trigger */}
                    <button
                      type="button"
                      onClick={() => setSelectedEventForPass(null)}
                      className="absolute top-4 right-4 z-20 p-1 text-white/40 hover:text-white transition-colors focus:outline-none"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Left: Event Details Side */}
                    <div className="flex-1 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 relative">
                      <div className="flex flex-col gap-6 text-left">
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.52rem] font-technical uppercase tracking-[0.25em] text-accent">NEX-PASS // VERIFIED ENTRY</span>
                          <h2 className="text-display-md font-light text-primary tracking-tight mt-1">{eventItem.title}</h2>
                        </div>

                        {/* Banner image snapshot */}
                        {eventItem.image && (
                          <div className="w-full aspect-[16/7] border border-white/5 overflow-hidden bg-black mb-1">
                            <img src={eventItem.image} alt={eventItem.title} className="w-full h-full object-cover opacity-80 animate-fadeIn" />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs text-secondary font-light">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-micro text-white/20 uppercase tracking-widest">Date</span>
                            <span>{formatDate(eventItem.date)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-micro text-white/20 uppercase tracking-widest">Time</span>
                            <span>{eventItem.time || "TBA"}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 col-span-2">
                            <span className="text-micro text-white/20 uppercase tracking-widest">Venue</span>
                            <span className="truncate">{eventItem.venue || "TBA"}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 col-span-2">
                            <span className="text-micro text-white/20 uppercase tracking-widest">Organizer</span>
                            <span className="truncate uppercase font-mono tracking-wider">{eventItem.organizer}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px] text-white/20 font-technical uppercase tracking-widest pt-8">
                        NEXEVENT Stage Entry Code Pass
                      </div>
                    </div>

                    {/* Right: QR Code & Student Info Side */}
                    <div className="w-full md:w-60 p-8 bg-black/40 flex flex-col justify-between items-center relative text-center min-w-[240px]">
                      {/* Ticket Cut notch circles (boarding pass aesthetic) */}
                      <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#141414] hidden md:block" />
                      <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#141414] hidden md:block" />

                      <div className="flex flex-col items-center gap-6 w-full">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-micro text-white/30 uppercase tracking-widest">Registrant</span>
                          <span className="text-body-s font-light text-primary truncate max-w-[200px]">
                            {user.displayName || user.email.split('@')[0]}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono select-all uppercase mt-0.5">
                            {regNo}
                          </span>
                        </div>

                        {/* QR Box */}
                        <div className="p-3 border border-white/10 bg-[#141414] flex items-center justify-center shrink-0 w-[160px] h-[160px]">
                          <img src={qrUrl} alt="Event QR Verification" className="w-full h-full object-contain" />
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-micro text-white/30 uppercase tracking-widest">Status</span>
                          <span className={cn(
                            "text-micro font-technical uppercase tracking-widest px-2.5 py-0.5 border leading-tight",
                            isCheckedIn 
                              ? "border-green-500/20 bg-green-950/20 text-green-400" 
                              : "border-accent/25 bg-accent/5 text-accent"
                          )}>
                            {isCheckedIn ? "Checked In" : "Confirmed"}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] text-white/20 font-mono uppercase tracking-wider pt-6">
                        FIG. 04 — SECURE TICKET
                      </span>
                    </div>

                  </motion.div>
                </div>
              );
            })()}
          </AnimatePresence>
        </SectionWrapper>
      </PageContainer>
    </PageTransition>
  );
};
