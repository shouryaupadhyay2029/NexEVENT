import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserRegistrations, cancelRegistration } from '../../services/registrationService';
import { getAllEvents } from '../../services/eventService';
import { PageTransition } from '../../components/layout/PageTransition';
import { PageContainer } from '../../components/layout/PageContainer';
import { SectionWrapper } from '../../components/layout/SectionWrapper';
import { AxisMarker } from '../../components/layout/AxisMarker';
import { cn } from '../../utils/cn';
import { Calendar, Clock, MapPin, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfirm } from '../../context/ConfirmContext';

export const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'cancelled' | 'completed'
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [regs, setRegs] = useState({});
  const [selectedEventForPass, setSelectedEventForPass] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUserEvents = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError('');
    try {
      // Fetch user registrations and all events
      const [registrations, events] = await Promise.all([
        getUserRegistrations(user.uid),
        getAllEvents()
      ]);

      const regsMap = {};
      registrations.forEach(r => {
        regsMap[r.eventId] = r;
      });
      setRegs(regsMap);

      const registeredIds = new Set(registrations.map(r => r.eventId));
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
  }, [user]);

  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

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
    const reg = regs[event.id] || {};
    
    // Cancelled Registrations tab
    if (activeTab === 'cancelled') {
      return reg.status === 'cancelled';
    }
    
    // Hide cancelled registrations from all other tabs
    if (reg.status === 'cancelled') {
      return false;
    }

    // Completed Registrations tab
    if (activeTab === 'completed') {
      return reg.status === 'completed' || event.date < todayStr;
    }

    // Upcoming Registrations tab
    const isUpcoming = event.date && event.date >= todayStr;
    if (activeTab === 'upcoming') {
      return isUpcoming && reg.status !== 'completed';
    }

    // Past Registrations tab
    if (activeTab === 'past') {
      return !isUpcoming;
    }

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

  const handleCancelBooking = async (eventId, eventTitle) => {
    const regId = `${user.uid}_${eventId}`;
    await confirm({
      title: 'Cancel Registration',
      message: `Are you sure you want to cancel your registration for "${eventTitle}"? This cannot be undone.`,
      variant: 'danger',
      confirmText: 'Cancel Registration',
      cancelText: 'Keep Registration',
      onConfirm: async () => {
        try {
          await cancelRegistration(regId, "student");
          triggerToast('success', `Cancelled registration for: "${eventTitle}".`);
          await fetchUserEvents();
        } catch (err) {
          console.error("Cancellation failure: ", err);
          triggerToast('error', err.message || "Failed to cancel booking.");
          throw err;
        }
      }
    });
  };

  return (
    <PageTransition>
      <PageContainer>
        <SectionWrapper className="max-w-4xl py-12 md:py-20 flex flex-col gap-12 text-left relative">
          
          {/* TOAST FEEDBACK NOTIFICATIONS */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                className={`fixed top-6 right-6 z-50 px-6 py-4 border backdrop-blur-md flex items-center gap-4 shadow-lg min-w-[300px] ${
                  toast.type === 'success' 
                    ? 'border-green-500/20 bg-green-950/80 text-green-200' 
                    : 'border-red-500/20 bg-red-950/80 text-red-200'
                }`}
              >
                <span className="text-[0.6rem] font-technical uppercase border border-current px-1.5 py-0.5">
                  {toast.type}
                </span>
                <span className="text-xs font-ui tracking-wide">{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="relative">
            <AxisMarker index="02" label="Registration Log" />
            <h1 className="text-display-lg font-light mt-6 text-primary">My Registrations</h1>
            <p className="text-body-lg text-secondary max-w-xl mt-4 font-light leading-relaxed">
              Track your upcoming bookings, cancelled tickets, and past academic event archives.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="w-full overflow-x-auto scrollbar-none snap-x snap-mandatory flex gap-6 border-b border-white/5 pb-2 mt-8 px-1">
            {['upcoming', 'past', 'cancelled', 'completed'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={(e) => {
                  setActiveTab(tab);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={cn(
                  "text-micro font-technical uppercase tracking-wider pb-2 focus:outline-none transition-colors border-b snap-center whitespace-nowrap",
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
                {displayEvents.map((event) => {
                  const reg = regs[event.id] || {};
                  const isCancelled = reg.status === 'cancelled';
                  const qrPayload = reg.ticketQR || JSON.stringify({ ticketId: reg.ticketId, eventId: event.id, userId: user.uid });
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrPayload)}&color=ffffff&bgcolor=141414`;

                  return (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-white/[0.02] cursor-pointer transition-all duration-300 gap-4"
                    >
                      <div className="flex items-start gap-5 flex-grow min-w-0">
                        {/* Mini QR Preview on the left */}
                        {!isCancelled && reg.ticketId && (
                          <div className="w-16 h-16 shrink-0 border border-white/10 bg-black flex items-center justify-center p-1 group-hover:border-accent/40 transition-colors">
                            <img src={qrUrl} alt="QR Mini" className="w-full h-full object-contain" />
                          </div>
                        )}

                        <div className="flex flex-col gap-2.5 min-w-0">
                          {/* Top Row: Category + Status Badge */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-micro text-secondary font-technical uppercase tracking-widest">
                              {event.category || "General"}
                            </span>
                            <span className={cn(
                              "text-[0.55rem] font-technical uppercase px-2 py-0.5 border leading-tight",
                              reg.status === 'cancelled'
                                ? "border-red-500/20 bg-red-950/20 text-red-400"
                                : reg.checkedIn
                                  ? "border-green-500/20 bg-green-950/20 text-green-400"
                                  : "border-accent/25 bg-accent/5 text-accent"
                            )}>
                              {reg.status === 'cancelled' ? "Cancelled" : reg.checkedIn ? "Checked In" : "Confirmed"}
                            </span>
                          </div>

                          {/* Event Title */}
                          <h3 className="text-body-l font-light text-primary group-hover:text-white transition-colors duration-200 truncate">
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

                          {/* Ticket ID Display */}
                          {reg.ticketId && (
                            <span className="text-[10px] text-white/30 font-mono tracking-wider">
                              Ticket ID: <span className="text-white/60 select-all font-bold">{reg.ticketId}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-4 md:mt-0 gap-4" onClick={(e) => e.stopPropagation()}>
                        {!isCancelled && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedEventForPass(event)}
                              className="px-3 py-1.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-technical uppercase tracking-wider transition-all select-none focus:outline-none"
                            >
                              View Pass
                            </button>
                            {/* Cancel Button only for upcoming confirmed bookings */}
                            {event.date && event.date >= todayStr && reg.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleCancelBooking(event.id, event.title)}
                                className="px-3 py-1.5 border border-red-500/10 hover:border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-xs font-technical uppercase tracking-wider transition-all text-red-400 select-none focus:outline-none"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                        <ChevronRight 
                          className="w-4 h-4 text-white/20 hover:text-white/60 cursor-pointer" 
                          onClick={() => navigate(`/events/${event.id}`)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DIGITAL TICKET / EVENT PASS MODAL */}
          <AnimatePresence>
            {selectedEventForPass && (() => {
              const eventItem = selectedEventForPass;
              const regDoc = regs[eventItem.id] || {};
              const regNo = regDoc.ticketId || "PENDING";
              const isCheckedIn = regDoc.checkedIn || false;
              const qrPayload = regDoc.ticketQR || JSON.stringify({ ticketId: regDoc.ticketId, eventId: eventItem.id, userId: user.uid });
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
