import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../../services/analyticsService';
import { useAuth } from '../../hooks/useAuth';
import { getAllEvents } from '../../services/eventService';
import { registerForEvent, getUserRegistrations } from '../../services/registrationService';
import { PageTransition } from '../../components/layout/PageTransition';
import { PageContainer } from '../../components/layout/PageContainer';
import { SectionWrapper } from '../../components/layout/SectionWrapper';
import { AxisMarker } from '../../components/layout/AxisMarker';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Calendar, Clock, MapPin, Search, Share2, Eye, X, Users } from 'lucide-react';
import { Image } from '../../components/ui/Image';

const CATEGORIES = [
  "Hackathons",
  "Technical",
  "Workshop",
  "Seminar",
  "Sports",
  "Culture",
  "Networking",
  "Guest Lecture"
];

// Easing curves
const EASE = [0.16, 1, 0.3, 1];

const EventThumbnail = ({ event, onPreview }) => {
  return (
    <div onClick={onPreview} className="w-full h-full cursor-pointer">
      <Image
        src={event.image}
        alt={event.title || 'Event cover'}
        aspectRatio="aspect-square"
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
      />
    </div>
  );
};

export const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State lists
  const [events, setEvents] = useState([]);
  const [userRegIds, setUserRegIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Toast notifications state
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Search & Filter Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');

  // Preview Modal State
  const [previewEvent, setPreviewEvent] = useState(null);

  // Load events and user metadata
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [eventsList, regs] = await Promise.all([
        getAllEvents(),
        user?.uid ? getUserRegistrations(user.uid) : Promise.resolve([])
      ]);

      setEvents(eventsList);
      setUserRegIds(new Set(regs.map(r => r.eventId)));
    } catch (err) {
      console.error("Failed to load events discovery logs:", err);
      setError("Failed to retrieve campus event directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPreviewEvent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track page view
  useEffect(() => {
    trackEvent("archive_view");
  }, []);

  // Debounced search logging
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      trackEvent("event_search", {
        search_length: searchQuery.trim().length,
        results_count: processedEvents.length
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery, processedEvents.length]);

  // Track filter selections
  const isInitialFilterMount = useRef(true);
  useEffect(() => {
    if (isInitialFilterMount.current) {
      isInitialFilterMount.current = false;
      return;
    }
    trackEvent("event_filter", {
      category: selectedCategory,
      status: selectedStatus,
      date_range: selectedDate,
      results_count: processedEvents.length
    });
  }, [selectedCategory, selectedStatus, selectedDate, processedEvents.length]);

  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Instant Card Registration Handler
  const handleRegister = async (eventId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      triggerToast('error', 'You must be logged in to register.');
      return;
    }
    try {
      await registerForEvent(user.uid, eventId);
      // Immediately reflect in local state
      setUserRegIds(prev => new Set([...prev, eventId]));
      // Update events count locally without full refetch
      setEvents(prevEvents => prevEvents.map(evt => {
        if (evt.id === eventId) {
          const cap = parseInt(evt.capacity) || 0;
          const currentCount = (parseInt(evt.registeredCount) || 0) + 1;
          return {
            ...evt,
            registeredCount: currentCount,
            status: currentCount >= cap ? 'closed' : evt.status
          };
        }
        return evt;
      }));
      triggerToast('success', 'Successfully registered for this event.');
      const matchedEvent = events.find(evt => evt.id === eventId);
      trackEvent("event_registration", {
        event_id: eventId,
        event_category: matchedEvent?.category || "General",
        registration_source: "directory"
      });
    } catch (err) {
      console.error("[Events] Failed to register for event.", err);
      triggerToast('error', err.message || 'Registration transaction failed.');
    }
  };



  // Card Share Handler
  const handleShare = (eventId, eventTitle, e) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(url).then(() => {
      triggerToast('success', `Copied link for "${eventTitle}" to clipboard.`);
    }).catch(() => {
      triggerToast('error', 'Clipboard access denied.');
    });
  };

  // Date operations helper
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const nextWeekStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, []);

  // Filter & Sort Calculation (Memoized)
  const processedEvents = useMemo(() => {
    let list = [...events];

    // 0. Filter out drafts and archived events from public view
    list = list.filter(e => e.status !== 'draft' && e.status !== 'archived');

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(e => 
        (e.title || '').toLowerCase().includes(q) ||
        (e.organizer || '').toLowerCase().includes(q) ||
        (e.venue || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      list = list.filter(e => (e.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Status Filter
    if (selectedStatus !== 'All') {
      list = list.filter(e => (e.status || '').toLowerCase() === selectedStatus.toLowerCase());
    }

    // 4. Date Timeline Filter
    if (selectedDate !== 'All') {
      const today = new Date();
      list = list.filter(e => {
        if (!e.date) return false;
        if (selectedDate === 'Today') {
          return e.date === todayStr;
        }
        if (selectedDate === 'This Week') {
          return e.date >= todayStr && e.date <= nextWeekStr;
        }
        if (selectedDate === 'This Month') {
          const eDate = new Date(e.date);
          return eDate.getFullYear() === today.getFullYear() && eDate.getMonth() === today.getMonth();
        }
        if (selectedDate === 'Upcoming') {
          return e.date >= todayStr;
        }
        return true;
      });
    }

    // 5. Sort selector logic
    list.sort((a, b) => {
      // Prioritize Live status above all other parameters
      const isLiveA = a.status === 'live' ? 1 : 0;
      const isLiveB = b.status === 'live' ? 1 : 0;
      if (isLiveA !== isLiveB) {
        return isLiveB - isLiveA;
      }

      if (selectedSort === 'Newest') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (selectedSort === 'Oldest') {
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      }
      if (selectedSort === 'Deadline') {
        return (a.registrationDeadline || '').localeCompare(b.registrationDeadline || '');
      }
      if (selectedSort === 'Soonest') {
        return (a.date || '').localeCompare(b.date || '');
      }
      if (selectedSort === 'Seats') {
        const seatsA = (parseInt(a.capacity) || 0) - (parseInt(a.registeredCount) || 0);
        const seatsB = (parseInt(b.capacity) || 0) - (parseInt(b.registeredCount) || 0);
        return seatsB - seatsA; // descending remaining seats
      }
      if (selectedSort === 'Alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return list;
  }, [events, searchQuery, selectedCategory, selectedStatus, selectedDate, selectedSort, todayStr, nextWeekStr]);

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
        <SectionWrapper className="max-w-7xl py-12 md:py-20 flex flex-col gap-12 relative">
          
          {/* HEADER */}
          <div className="relative">
            <AxisMarker index="03" label="Discovery Engine" />
            <h1 className="text-display-lg font-light tracking-tight mt-6 text-primary">Events</h1>
            <p className="text-body-lg text-secondary max-w-xl mt-4 font-light leading-relaxed">
              Curated directory of campus hackathons, workshops, conferences, and technical exhibitions.
            </p>
          </div>

          {/* DYNAMIC FILTER DASHBOARD BAR */}
          <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between pb-8 border-b border-white/5 font-ui">
            {/* Input: Search */}
            <div className="relative flex-grow max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, organizer, or venue..."
                className="w-full bg-[#111]/80 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent rounded-none transition-colors"
              />
            </div>

            {/* Selector Filters Grid */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs select-none">
              {/* Filter: Category */}
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-technical uppercase tracking-wider text-white/30">Category</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#111] border border-white/10 text-white/80 px-3 py-1.5 rounded-none focus:outline-none focus:border-accent cursor-pointer hover:bg-white/[0.02]"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Filter: Status */}
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-technical uppercase tracking-wider text-white/30">Status</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#111] border border-white/10 text-white/80 px-3 py-1.5 rounded-none focus:outline-none focus:border-accent cursor-pointer hover:bg-white/[0.02]"
                >
                  <option value="All">All States</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Filter: Date Timeline */}
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-technical uppercase tracking-wider text-white/30">Timeline</span>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#111] border border-white/10 text-white/80 px-3 py-1.5 rounded-none focus:outline-none focus:border-accent cursor-pointer hover:bg-white/[0.02]"
                >
                  <option value="All">Any Time</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="Upcoming">Upcoming Only</option>
                </select>
              </div>

              {/* Selector: Sort */}
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-technical uppercase tracking-wider text-white/30">Sort</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-[#111] border border-white/10 text-white/80 px-3 py-1.5 rounded-none focus:outline-none focus:border-accent cursor-pointer hover:bg-white/[0.02]"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Deadline">Registration Deadline</option>
                  <option value="Soonest">Soonest Event</option>
                  <option value="Seats">Seats Remaining</option>
                  <option value="Alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* EVENTS ARCHIVE GRID CONTAINER */}
          <div className="min-h-[40vh]">
            {loading ? (
              // Premium editorial line skeleton loaders (no spinner placeholders)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 font-ui">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex flex-col gap-5">
                    <div className="w-full aspect-[16/10] bg-white/5 animate-pulse rounded-none" />
                    <div className="h-4 w-1/4 bg-white/5 animate-pulse rounded-none" />
                    <div className="h-6 w-3/4 bg-white/5 animate-pulse rounded-none" />
                    <div className="h-3 w-1/2 bg-white/5 animate-pulse rounded-none" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-body text-red-400 font-technical uppercase tracking-wider text-center py-16 border border-dashed border-white/5">
                {error}
              </div>
            ) : processedEvents.length === 0 ? (
              // Minimal typographic empty state (no illustration)
              <div className="flex flex-col py-24 border border-dashed border-white/5 items-center justify-center text-center select-none font-ui">
                <span className="text-[0.6rem] font-technical text-white/20 uppercase tracking-[0.25em] mb-4">
                  Discovery Engine // Empty Results
                </span>
                <p className="text-body-m text-secondary max-w-sm">
                  No active events match the specified search parameters. Adjust filters to broaden your lookup.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                    setSelectedDate('All');
                  }}
                  className="text-micro font-technical text-accent uppercase tracking-wider mt-6 hover:text-accent/80 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              // Render Grid of Events
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16"
              >
                {processedEvents.map((event) => {
                  const registered = userRegIds.has(event.id);
                  const capacity = parseInt(event.capacity) || 0;
                  const currentReg = parseInt(event.registeredCount) || 0;
                  const seatsRemaining = Math.max(capacity - currentReg, 0);
                  const isClosed = event.status?.toLowerCase() === 'closed' || seatsRemaining <= 0;

                  return (
                    <motion.div
                      key={event.id}
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
                      }}
                      className="group flex flex-col gap-5 text-left select-none relative"
                    >
                      {/* 1. Large Image container with preview trigger */}
                      <div className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-[#111] cursor-pointer">
                        <EventThumbnail event={event} onPreview={() => setPreviewEvent(event)} />

                        {/* Top quick badges overlay */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                          <span className="text-[0.52rem] font-technical uppercase tracking-wider px-2 py-0.5 border border-white/10 bg-[#0a0a0a]/90 text-secondary">
                            {event.category || "General"}
                          </span>
                          <span className={cn(
                            "text-[0.52rem] font-technical uppercase tracking-wider px-2 py-0.5 border",
                            isClosed 
                              ? "border-red-500/20 bg-red-950/90 text-red-400" 
                              : "border-green-500/20 bg-green-950/90 text-green-400"
                          )}>
                            {isClosed ? "Closed" : "Open"}
                          </span>
                        </div>


                        {/* HOVER ACTIONS OVERLAY (Fade-in on desktop hover) */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
                          {/* Details Router */}
                          <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="p-3 bg-[#111] border border-white/10 hover:border-white/30 text-white transition-all transform hover:-translate-y-0.5"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Register Button */}
                          <button
                            onClick={(e) => !registered && !isClosed && handleRegister(event.id, e)}
                            disabled={registered || isClosed}
                            className={cn(
                              "px-4 py-2.5 text-[0.65rem] font-technical uppercase tracking-wider font-semibold transition-all transform hover:-translate-y-0.5",
                              registered 
                                ? "bg-green-900/30 border border-green-500/30 text-green-400" 
                                : isClosed 
                                  ? "bg-red-950/20 border border-red-500/10 text-red-500 cursor-not-allowed"
                                  : "bg-white text-black hover:bg-white/90"
                            )}
                          >
                            {registered ? "Registered ✓" : isClosed ? "Closed" : "Register Now"}
                          </button>

                          {/* Share link trigger */}
                          <button
                            onClick={(e) => handleShare(event.id, event.title, e)}
                            className="p-3 bg-[#111] border border-white/10 hover:border-white/30 text-white transition-all transform hover:-translate-y-0.5"
                            title="Share link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 2. Text Content & Metadata */}
                      <div className="flex flex-col gap-2 relative">
                        {/* Title and Share */}
                        <div className="flex items-start justify-between">
                          <h3 
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="text-body-l font-light text-primary group-hover:text-white cursor-pointer transition-colors duration-200"
                          >
                            {event.title}
                          </h3>
                        </div>

                        {/* Organizer & Venue */}
                        <div className="text-[0.68rem] text-white/30 uppercase tracking-widest font-technical flex flex-wrap gap-x-2 gap-y-1">
                          <span>{event.organizer || "NexEvent Organizer"}</span>
                          <span>•</span>
                          <span>{event.venue || "Campus Venue"}</span>
                        </div>

                        {/* Short Description */}
                        <p className="text-body-s text-secondary/80 line-clamp-2 font-light mt-1.5 leading-relaxed">
                          {event.description || "Explore and join this educational experience hosted in the campus archive halls."}
                        </p>

                        {/* Registration Stats & Badge */}
                        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/5 text-micro font-technical uppercase">
                          <div className="flex justify-between text-white/40">
                            <span>Remaining: {seatsRemaining}</span>
                            <span>Registered: {currentReg}</span>
                          </div>
                          {event.registrationDeadline && (
                            <span className="text-[10px] text-white/35 font-technical lowercase first-letter:uppercase">
                              Deadline: {formatDate(event.registrationDeadline)}
                            </span>
                          )}
                          <div className="flex justify-between items-center mt-2 gap-3">
                            <div className="flex flex-wrap gap-1.5">
                              {registered && (
                                <span className="px-2 py-0.5 border border-green-500/20 bg-green-950/20 text-green-400 text-[9px] font-technical uppercase leading-tight select-none">
                                  Already Registered
                                </span>
                              )}
                              {isClosed && (
                                <span className="px-2 py-0.5 border border-red-500/20 bg-red-950/20 text-red-400 text-[9px] font-technical uppercase leading-tight select-none">
                                  Capacity Full
                                </span>
                              )}
                            </div>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (registered) {
                                  navigate(`/my-events`);
                                } else if (isClosed) {
                                  navigate(`/events/${event.id}`);
                                } else {
                                  handleRegister(event.id, e);
                                }
                              }}
                              className={cn(
                                "px-3 py-1.5 text-[0.6rem] font-technical uppercase tracking-wider font-semibold border transition-all select-none focus:outline-none",
                                registered
                                  ? "border-green-500/30 bg-green-950/10 text-green-400 hover:bg-green-950/25"
                                  : isClosed
                                    ? "border-red-500/20 bg-red-950/10 text-red-400 cursor-not-allowed"
                                    : "border-accent bg-accent/5 text-accent hover:bg-accent hover:text-black"
                              )}
                              disabled={isClosed && !registered}
                            >
                              {registered ? "View Ticket" : isClosed ? "Closed" : "Register"}
                            </button>
                          </div>
                        </div>

                        {/* Logistics info */}
                        <div className="flex items-center justify-between text-micro text-white/30 pt-3 mt-1.5 border-t border-white/5 font-ui">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-white/20" strokeWidth={1.5} />
                            {formatDate(event.date)}
                          </span>
                          <span className="truncate max-w-[150px]">{event.venue}</span>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* LIGHTWEIGHT EVENT PREVIEW MODAL */}
          <AnimatePresence>
            {previewEvent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setPreviewEvent(null)}
                  className="absolute inset-0 bg-[#090909]/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="bg-[#141414]/95 border border-white/10 w-full max-w-2xl h-auto z-10 rounded-none shadow-[0_32px_60px_-16px_rgba(0,0,0,0.8)] relative font-ui flex flex-col md:flex-row overflow-hidden"
                >
                  {/* Grain Layer */}
                  <div
                    className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
                  />

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setPreviewEvent(null)}
                    className="absolute top-4 right-4 z-30 p-1 bg-black/60 border border-white/10 hover:bg-black text-white/55 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Left Column: Image */}
                  <div className="w-full md:w-1/2 aspect-[16/10] md:aspect-auto md:min-h-[400px] relative bg-[#111]">
                    <Image
                      src={previewEvent.image}
                      alt={previewEvent.title}
                      aspectRatio="aspect-auto"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Right Column: Text & Actions */}
                  <div className="w-full md:w-1/2 p-6 flex flex-col justify-between text-left relative z-20">
                    <div className="flex flex-col gap-4">
                      {/* Meta header */}
                      <div className="flex flex-wrap items-center justify-between text-[0.6rem] font-technical uppercase tracking-widest text-white/30 border-b border-white/5 pb-3">
                        <span>{previewEvent.category || "General"}</span>
                        <span>{previewEvent.status || "Open"}</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-body-xl font-light text-primary">{previewEvent.title}</h2>
                      
                      {/* Meta list */}
                      <div className="flex flex-col gap-2.5 text-micro text-white/40">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-white/20" strokeWidth={1.5} />
                          {formatDate(previewEvent.date)}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-white/20" strokeWidth={1.5} />
                          {previewEvent.venue || "TBA"}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-white/20" strokeWidth={1.5} />
                          {previewEvent.time || "TBA"}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-body-s text-secondary leading-relaxed mt-2 line-clamp-4 font-light">
                        {previewEvent.description || "Join us for this premium event hosted by our campus organization."}
                      </p>
                    </div>

                    {/* Actions footer */}
                    <div className="flex flex-col gap-3 pt-6 border-t border-white/5 mt-6">
                      <div className="flex items-center justify-between text-[0.62rem] font-technical text-white/30 uppercase tracking-wider">
                        <span>Capacity Seats</span>
                        <span>
                          {Math.max((parseInt(previewEvent.capacity) || 0) - (parseInt(previewEvent.registeredCount) || 0), 0)} / {previewEvent.capacity || 0} remaining
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setPreviewEvent(null);
                            navigate(`/events/${previewEvent.id}`);
                          }}
                          size="sm"
                          className="flex-grow"
                        >
                          Open Details
                        </Button>
                        <Button
                          onClick={() => {
                            handleRegister(previewEvent.id);
                            // Close modal on success
                            setPreviewEvent(null);
                          }}
                          disabled={userRegIds.has(previewEvent.id) || (parseInt(previewEvent.capacity) || 0) <= (parseInt(previewEvent.registeredCount) || 0)}
                          size="sm"
                          className="flex-grow"
                        >
                          {userRegIds.has(previewEvent.id) ? "Registered ✓" : "Register"}
                        </Button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* TOAST NOTIFIER */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-4 py-3 bg-[#111] border border-white/10"
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  toast.type === 'success' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                )} />
                <span className="text-[0.65rem] font-technical uppercase tracking-wider text-white/40">
                  {toast.type}
                </span>
                <span className="text-xs font-ui tracking-wide">{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

        </SectionWrapper>
      </PageContainer>
    </PageTransition>
  );
};
