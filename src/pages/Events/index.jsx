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
import { motion, AnimatePresence, useReducedMotion, useTransform } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Calendar, Clock, MapPin, Search, Share2, Eye, X, SlidersHorizontal } from 'lucide-react';
import { EditorialImage } from '../../components/ui/EditorialImage';
import { resolveEventImage } from '../../utils/eventImage';
import { getParticipationHours } from '../../utils/clubHours';
import { PremiumDropdown } from '../../components/ui/PremiumDropdown';
import { PremiumEmptyState } from '../../components/ui/PremiumEmptyState';
import { useAmbientLight } from '../../hooks/useMagnet';

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

const EventThumbnail = ({ event, onPreview, isHovered }) => {
  return (
    <div onClick={onPreview} className="w-full h-full cursor-pointer">
      <EditorialImage
        src={resolveEventImage(event)}
        alt={event.title || 'Event cover'}
        aspectRatio="aspect-square"
        grayscale={true}
        isHovered={isHovered}
      />
    </div>
  );
};

const DirectoryEventCard = ({ 
  event, 
  registered, 
  isClosed, 
  seatsRemaining, 
  currentReg, 
  formatDate, 
  getParticipationHours, 
  navigate, 
  handleRegister, 
  handleShare, 
  setPreviewEvent 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { ref, lightX, lightY, handlers } = useAmbientLight({ damping: 55, stiffness: 280 });

  const transformX = useTransform(lightX, (lx) => `calc(${lx * 100}% - 130px)`);
  const transformY = useTransform(lightY, (ly) => `calc(${ly * 100}% - 130px)`);

  const rawCardParallaxX = useTransform(lightX, [0, 1], [-3, 3]);
  const rawCardParallaxY = useTransform(lightY, [0, 1], [-3, 3]);

  const rawImgParallaxX = useTransform(lightX, [0, 1], [-2.4, 2.4]);
  const rawImgParallaxY = useTransform(lightY, [0, 1], [-2.4, 2.4]);

  const rawTextParallaxX = useTransform(lightX, [0, 1], [-1.5, 1.5]);
  const rawTextParallaxY = useTransform(lightY, [0, 1], [-1.5, 1.5]);

  const rawTiltX = useTransform(lightY, [0, 1], [1.5, -1.5]);
  const rawTiltY = useTransform(lightX, [0, 1], [-1.5, 1.5]);

  const cardParallaxX = shouldReduceMotion ? 0 : rawCardParallaxX;
  const cardParallaxY = shouldReduceMotion ? 0 : rawCardParallaxY;
  const imgParallaxX = shouldReduceMotion ? 0 : rawImgParallaxX;
  const imgParallaxY = shouldReduceMotion ? 0 : rawImgParallaxY;
  const textParallaxX = shouldReduceMotion ? 0 : rawTextParallaxX;
  const textParallaxY = shouldReduceMotion ? 0 : rawTextParallaxY;
  const tiltX = shouldReduceMotion ? 0 : rawTiltX;
  const tiltY = shouldReduceMotion ? 0 : rawTiltY;

  return (
    <motion.div
      ref={ref}
      {...handlers}
      style={{
        x: cardParallaxX,
        y: cardParallaxY,
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1000,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col gap-5 text-left select-none relative p-3 transition-shadow duration-[400ms]"
    >
      {/* 2% bg brightness shift */}
      <motion.div
        animate={{
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0)'
        }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Faint border overlay */}
      <motion.div
        animate={{
          borderColor: isHovered ? 'rgba(214, 123, 42, 0.15)' : 'rgba(255, 255, 255, 0.04)'
        }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 border pointer-events-none z-30"
      />

      {/* 1. Large Image container with preview trigger */}
      <motion.div 
        style={{ x: imgParallaxX, y: imgParallaxY }}
        className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-[#111] cursor-pointer z-10"
      >
        <EventThumbnail event={event} onPreview={() => setPreviewEvent(event)} isHovered={isHovered} />

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

        {/* Ambient light overlay on the image using GPU translation */}
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

        {/* HOVER ACTIONS OVERLAY */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="p-3 bg-[#111] border border-white/10 hover:border-white/30 text-white transition-all transform hover:-translate-y-0.5"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

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

          <button
            onClick={(e) => handleShare(event.id, event.title, e)}
            className="p-3 bg-[#111] border border-white/10 hover:border-white/30 text-white transition-all transform hover:-translate-y-0.5"
            title="Share link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* 2. Text Content & Metadata */}
      <motion.div style={{ x: textParallaxX, y: textParallaxY }} className="flex flex-col gap-2 relative z-10">
        <div className="flex items-start justify-between">
          {/* Title translates 2px upward */}
          <motion.h3
            onClick={() => navigate(`/events/${event.id}`)}
            animate={{
              y: isHovered ? -2 : 0,
              color: isHovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.88)',
            }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-body-l font-light cursor-pointer"
          >
            {event.title}
          </motion.h3>
        </div>

        <div className="text-[0.68rem] text-white/30 uppercase tracking-widest font-technical flex flex-wrap gap-x-2 gap-y-1">
          <span>{event.organizer || "NexEvent Organizer"}</span>
          <span>•</span>
          <span>{event.venue || "Campus Venue"}</span>
        </div>

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
              {getParticipationHours(event) > 0 && (
                <span className="px-2 py-0.5 border border-accent/20 bg-accent/5 text-accent text-[9px] font-technical uppercase leading-tight select-none">
                  {getParticipationHours(event)} HRS // CLUB CREDIT
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

        {/* Logistics info (Metadata opacity increases) */}
        <motion.div 
          animate={{
            color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
            borderTopColor: isHovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'
          }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between text-micro pt-3 mt-1.5 border-t font-ui"
        >
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/20" strokeWidth={1.5} />
            {formatDate(event.date)}
          </span>
          <span className="truncate max-w-[150px]">{event.venue}</span>
        </motion.div>
      </motion.div>
    </motion.div>
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');

  // Preview Modal State
  const [previewEvent, setPreviewEvent] = useState(null);

  // Dropdown filter configurations
  const categoryOptions = useMemo(() => [
    { value: 'All', label: 'All Categories' },
    ...CATEGORIES.map(c => ({ value: c, label: c }))
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'All', label: 'All States' },
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' }
  ], []);

  const dateOptions = useMemo(() => [
    { value: 'All', label: 'Any Time' },
    { value: 'Today', label: 'Today' },
    { value: 'This Week', label: 'This Week' },
    { value: 'This Month', label: 'This Month' },
    { value: 'Upcoming', label: 'Upcoming Only' }
  ], []);

  const sortOptions = useMemo(() => [
    { value: 'Newest', label: 'Newest First' },
    { value: 'Oldest', label: 'Oldest First' },
    { value: 'Deadline', label: 'Registration Deadline' },
    { value: 'Soonest', label: 'Soonest Event' },
    { value: 'Seats', label: 'Seats Remaining' },
    { value: 'Alphabetical', label: 'Alphabetical' }
  ], []);

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

          {/* ── SYSTEM HEADER ──────────────────────────────────────────────── */}
          <div className="relative flex flex-col gap-3">
            <AxisMarker index="03" label="Discovery Engine" />

            <div className="flex items-end justify-between mt-6 gap-4 flex-wrap">
              <h1 className="text-display-lg font-light tracking-tight text-primary leading-none">
                Events
              </h1>

              {/* Live status bar */}
              <div className="flex items-center gap-3 pb-1">
                <span className="text-[0.52rem] font-technical uppercase tracking-widest text-white/20">Directory</span>
                <span className="w-px h-3 bg-white/10" />
                <motion.span
                  key={processedEvents.length}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[0.52rem] font-technical uppercase tracking-widest text-accent/70"
                >
                  {loading ? '—' : `${processedEvents.length} Results`}
                </motion.span>
                <span className="w-px h-3 bg-white/10" />
                <span className="text-[0.52rem] font-technical uppercase tracking-widest text-white/20">
                  {loading ? '…' : `${events.filter(e => e.status !== 'draft' && e.status !== 'archived').length} Total`}
                </span>
              </div>
            </div>

            <p className="text-body-lg text-secondary max-w-xl font-light leading-relaxed">
              Curated directory of campus hackathons, workshops, conferences, and technical exhibitions.
            </p>
          </div>

          {/* ── DISCOVERY CONSOLE ──────────────────────────────────────────── */}
          <div className="flex flex-col border border-white/[0.06] bg-[#0c0c0c] font-ui">

            {/* ── Console system bar ──── */}
            <div className="flex items-start justify-between px-5 py-3 border-b border-white/[0.05] select-none">
              {/* Left: label + metadata */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-2.5 h-2.5 text-white/20" strokeWidth={1.5} />
                  <span className="text-[0.5rem] font-technical uppercase tracking-[0.15em] text-white/30">
                    Discovery Console
                  </span>
                </div>
                {/* System metadata */}
                <div className="flex items-center gap-3 pl-[18px]">
                  <span className="text-[0.42rem] font-technical uppercase tracking-widest text-white/15">
                    Indexed &nbsp;
                    <span className="text-white/30">{loading ? '—' : events.filter(e => e.status !== 'draft' && e.status !== 'archived').length}</span>
                  </span>
                  <span className="w-px h-2.5 bg-white/[0.06]" />
                  <span className="text-[0.42rem] font-technical uppercase tracking-widest text-white/15">
                    Active Filters &nbsp;
                    <span className="text-white/30">
                      {[selectedCategory !== 'All', selectedStatus !== 'All', selectedDate !== 'All', selectedSort !== 'Newest', !!searchQuery.trim()].filter(Boolean).length}
                    </span>
                  </span>
                  <span className="w-px h-2.5 bg-white/[0.06]" />
                  <span className="text-[0.42rem] font-technical uppercase tracking-widest text-white/15">
                    Updated &nbsp;<span className="text-white/30">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
              </div>

              {/* Right: Clear all */}
              <AnimatePresence>
                {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedDate !== 'All' || selectedSort !== 'Newest' || searchQuery.trim()) && (
                  <motion.button
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedStatus('All');
                      setSelectedDate('All');
                      setSelectedSort('Newest');
                    }}
                    className="flex items-center gap-1.5 text-[0.48rem] font-technical uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors duration-200 mt-0.5 self-start"
                  >
                    <X className="w-2.5 h-2.5" />
                    Reset
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ── Main input row ──── */}
            <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-white/[0.05]">

              {/* Search — ~45% width on xl */}
              <div className="relative xl:flex-[0_0_45%]">
                <div className="absolute left-5 top-0 bottom-0 flex items-center gap-3 pointer-events-none">
                  <motion.span
                    animate={{
                      rotate: searchFocused ? 8 : 0,
                      opacity: searchFocused ? 0.7 : 0.22,
                    }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    style={{ color: searchFocused ? '#C96A2B' : 'rgba(255,255,255,0.22)' }}
                  >
                    <Search className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </motion.span>
                  <span className="w-px h-4 bg-white/[0.06]" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search title, organizer, venue…"
                  className="w-full bg-transparent pl-[3.25rem] pr-10 py-4 text-[0.78rem] text-white/72 placeholder:text-white/18 focus:outline-none caret-accent font-ui tracking-wide"
                  style={{ caretColor: '#C96A2B' }}
                />

                {/* Inline clear */}
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.15 }}
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/55 transition-colors duration-150"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Orange focus underline */}
                <motion.div
                  animate={{ scaleX: searchFocused ? 1 : 0, opacity: searchFocused ? 1 : 0 }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-0 left-5 right-5 h-px bg-accent/70 origin-left"
                />
              </div>

              {/* Filter strip — four identical pills */}
              <div className="flex flex-1 items-stretch divide-x divide-white/[0.05] overflow-x-auto scrollbar-none">

                <div className="flex-1">
                  <PremiumDropdown
                    label="Category"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={categoryOptions}
                    compact
                  />
                </div>

                <div className="flex-1">
                  <PremiumDropdown
                    label="Status"
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={statusOptions}
                    compact
                  />
                </div>

                <div className="flex-1">
                  <PremiumDropdown
                    label="Timeline"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    options={dateOptions}
                    compact
                  />
                </div>

                <div className="flex-1">
                  <PremiumDropdown
                    label="Sort By"
                    value={selectedSort}
                    onChange={setSelectedSort}
                    options={sortOptions}
                    compact
                  />
                </div>
              </div>
            </div>

            {/* ── Active filter pill strip ──── */}
            <AnimatePresence>
              {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedDate !== 'All') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden border-t border-white/[0.05]"
                >
                  <div className="flex items-center gap-2 px-5 py-2.5 flex-wrap">
                    <span className="text-[0.42rem] font-technical uppercase tracking-widest text-white/18 mr-1">Filtered by</span>

                    {selectedCategory !== 'All' && (
                      <motion.button
                        layout
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 3 }}
                        transition={{ duration: 0.15 }}
                        type="button"
                        onClick={() => setSelectedCategory('All')}
                        className="flex items-center gap-1 px-2 py-0.5 border border-accent/25 bg-accent/[0.04] text-accent text-[0.48rem] font-technical uppercase tracking-wider hover:bg-accent/[0.08] transition-colors duration-150"
                      >
                        <span>{selectedCategory}</span>
                        <X className="w-1.5 h-1.5" />
                      </motion.button>
                    )}

                    {selectedStatus !== 'All' && (
                      <motion.button
                        layout
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 3 }}
                        transition={{ duration: 0.15 }}
                        type="button"
                        onClick={() => setSelectedStatus('All')}
                        className="flex items-center gap-1 px-2 py-0.5 border border-white/12 bg-white/[0.025] text-white/45 text-[0.48rem] font-technical uppercase tracking-wider hover:bg-white/[0.05] transition-colors duration-150"
                      >
                        <span>{selectedStatus}</span>
                        <X className="w-1.5 h-1.5" />
                      </motion.button>
                    )}

                    {selectedDate !== 'All' && (
                      <motion.button
                        layout
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 3 }}
                        transition={{ duration: 0.15 }}
                        type="button"
                        onClick={() => setSelectedDate('All')}
                        className="flex items-center gap-1 px-2 py-0.5 border border-white/12 bg-white/[0.025] text-white/45 text-[0.48rem] font-technical uppercase tracking-wider hover:bg-white/[0.05] transition-colors duration-150"
                      >
                        <span>{selectedDate}</span>
                        <X className="w-1.5 h-1.5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Live result footer ──── */}
          <div className="flex items-center justify-between -mt-8">
            <motion.span
              key={`${processedEvents.length}-${selectedCategory}-${selectedStatus}-${selectedDate}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-[0.5rem] font-technical uppercase tracking-widest text-white/22"
            >
              {loading ? 'Loading directory…' : (
                <>
                  <span className="text-white/40">{processedEvents.length}</span>
                  &nbsp;Events Found
                  {[selectedCategory !== 'All', selectedStatus !== 'All', selectedDate !== 'All', !!searchQuery.trim()].filter(Boolean).length > 0 && (
                    <>
                      &nbsp;•&nbsp;
                      <span className="text-accent/60">
                        {[selectedCategory !== 'All', selectedStatus !== 'All', selectedDate !== 'All', !!searchQuery.trim()].filter(Boolean).length} Filters Active
                      </span>
                    </>
                  )}
                </>
              )}
            </motion.span>
          </div>

          {/* EVENTS ARCHIVE GRID CONTAINER */}
          <div className="min-h-[40vh]">
            {loading ? (
              // Premium editorial line skeleton loaders shimmers slowly over 2s
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 font-ui">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex flex-col gap-5">
                    <div className="w-full aspect-[16/10] bg-white/5 skeleton-shimmer rounded-none" />
                    <div className="h-4 w-1/4 bg-white/5 skeleton-shimmer rounded-none" />
                    <div className="h-6 w-3/4 bg-white/5 skeleton-shimmer rounded-none" />
                    <div className="h-3 w-1/2 bg-white/5 skeleton-shimmer rounded-none" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <PremiumEmptyState 
                type="error"
                subtitle={error}
                action={() => window.location.reload()}
              />
            ) : processedEvents.length === 0 ? (
              searchQuery.trim() ? (
                <PremiumEmptyState 
                  type="search"
                  action={() => setSearchQuery('')}
                />
              ) : (
                <PremiumEmptyState 
                  type="events"
                  action={() => {
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                    setSelectedDate('All');
                    setSearchQuery('');
                  }}
                />
              )
            ) : (
              // Render Grid of Events with 80ms stagger reveal
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.08 }
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
                        hidden: { opacity: 0, y: 24, scale: 0.98 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } }
                      }}
                    >
                      <DirectoryEventCard
                        event={event}
                        registered={registered}
                        isClosed={isClosed}
                        seatsRemaining={seatsRemaining}
                        currentReg={currentReg}
                        formatDate={formatDate}
                        getParticipationHours={getParticipationHours}
                        navigate={navigate}
                        handleRegister={handleRegister}
                        handleShare={handleShare}
                        setPreviewEvent={setPreviewEvent}
                      />
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
                    <EditorialImage
                      src={resolveEventImage(previewEvent)}
                      alt={previewEvent.title}
                      aspectRatio="aspect-auto"
                      grayscale={false}
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
