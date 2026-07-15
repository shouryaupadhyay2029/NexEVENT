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
  setPreviewEvent,
  cardIndex = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const creditBadgeRef = useRef(null);
  const [creditPulsed, setCreditPulsed] = useState(false);

  // Viewport observer â€” single-pulse on credit badge when it enters view
  useEffect(() => {
    const hours = getParticipationHours(event);
    if (!hours || creditPulsed) return;
    const el = creditBadgeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !creditPulsed) {
          setCreditPulsed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [creditPulsed, event, getParticipationHours]);

  // Ambient light for parallax
  const { ref, lightX, lightY, handlers } = useAmbientLight({ damping: 55, stiffness: 280 });
  const transformX = useTransform(lightX, (lx) => `calc(${lx * 100}% - 130px)`);
  const transformY = useTransform(lightY, (ly) => `calc(${ly * 100}% - 130px)`);

  // Image parallax â€” max 6px
  const rawImgX = useTransform(lightX, [0, 1], [-6, 6]);
  const rawImgY = useTransform(lightY, [0, 1], [-6, 6]);
  // Badge parallax â€” max 1px
  const rawBadgeX = useTransform(lightX, [0, 1], [-1, 1]);
  const rawBadgeY = useTransform(lightY, [0, 1], [-1, 1]);

  const imgX = shouldReduceMotion ? 0 : rawImgX;
  const imgY = shouldReduceMotion ? 0 : rawImgY;
  const badgeX = shouldReduceMotion ? 0 : rawBadgeX;
  const badgeY = shouldReduceMotion ? 0 : rawBadgeY;

  const figNum = String(cardIndex + 1).padStart(2, '0');
  const hours = getParticipationHours(event);

  return (
    <motion.div
      ref={ref}
      {...handlers}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ y: isHovered && !shouldReduceMotion ? -4 : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col text-left select-none relative"
    >
      {/* Hover atmosphere */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.45 }}
        className="absolute -inset-6 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,106,43,0.028) 0%, transparent 70%)'
        }}
      />

      {/* Card border â€” idles at 4% white, tints orange on hover */}
      <motion.div
        animate={{
          borderColor: isHovered ? 'rgba(201,106,43,0.16)' : 'rgba(255,255,255,0.04)'
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 border pointer-events-none z-30"
      />

      {/* â”€â”€ IMAGE SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        style={{ x: imgX, y: imgY, aspectRatio: '16/9' }}
        className="relative overflow-hidden bg-[#0e0e0e] cursor-pointer z-10"
        onClick={() => setPreviewEvent(event)}
      >
        <EditorialImage
          src={resolveEventImage(event)}
          alt={event.title || 'Event cover'}
          aspectRatio="aspect-video"
          grayscale={true}
          isHovered={isHovered}
        />

        {/* Bottom readability gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 100%)' }}
        />

        {/* Top badges â€” inset 16px from every edge */}
        <motion.div
          style={{ x: badgeX, y: badgeY }}
          className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none"
        >
          <motion.span
            animate={{
              letterSpacing: isHovered ? '0.13em' : '0.09em',
              opacity: isHovered ? 0.92 : 0.72,
            }}
            transition={{ duration: 0.18 }}
            className={cn(
              'text-[0.46rem] font-technical uppercase px-2.5 py-1 border bg-[#080808]/95',
              isHovered ? 'border-accent/22 text-accent/75' : 'border-white/10 text-white/50'
            )}
          >
            {event.category || 'General'}
          </motion.span>

          <motion.span
            animate={{ opacity: isHovered ? 1 : 0.72 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'text-[0.46rem] font-technical uppercase tracking-wider px-2.5 py-1 border',
              isClosed
                ? 'border-red-500/20 bg-red-950/90 text-red-400'
                : 'border-green-500/20 bg-green-950/90 text-green-400'
            )}
          >
            {isClosed ? 'Closed' : 'Open'}
          </motion.span>
        </motion.div>

        {/* Cursor-tracked ambient light */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-overlay">
          <motion.div
            className="absolute w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.09)_0%,transparent_70%)]"
            style={{
              x: transformX,
              y: transformY,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
          />
        </div>

        {/* â”€â”€ QUICK ACTIONS â€” centered editorial control strip â”€â”€ */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black/52 flex flex-col items-center justify-center z-20"
            >
              {/* Control strip â€” three equal-width buttons */}
              <div className="flex items-stretch gap-0 w-[72%]">
                {/* VIEW */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, delay: 0, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => navigate(`/events/${event.id}`)}
                  whileTap={{ scale: 0.97 }}
                  title="View Details"
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 border border-white/10 bg-[#0e0e0e]/85 text-white/65 hover:text-white/90 hover:border-white/22 hover:bg-[#151515]/90 transition-colors duration-150 focus:outline-none"
                >
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-[0.44rem] font-technical uppercase tracking-[0.14em] leading-none">View</span>
                </motion.button>

                {/* REGISTER */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => !registered && !isClosed && handleRegister(event.id, e)}
                  disabled={registered || isClosed}
                  whileTap={registered || isClosed ? {} : { scale: 0.97 }}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 border-y transition-colors duration-150 focus:outline-none',
                    registered
                      ? 'border-y-green-500/22 bg-green-950/25 text-green-400/80 cursor-default'
                      : isClosed
                        ? 'border-y-red-500/15 bg-red-950/20 text-red-400/65 cursor-not-allowed'
                        : 'border-y-white/10 bg-[#0e0e0e]/85 text-white/65 hover:text-white/90 hover:bg-[#151515]/90 hover:border-y-white/22'
                  )}
                >
                  <span className="text-[0.55rem] font-technical uppercase tracking-[0.12em] leading-none font-semibold">
                    {registered ? 'âœ“' : isClosed ? 'â€”' : '+'}
                  </span>
                  <span className="text-[0.44rem] font-technical uppercase tracking-[0.14em] leading-none">
                    {registered ? 'Registered' : isClosed ? 'Closed' : 'Register'}
                  </span>
                </motion.button>

                {/* SHARE */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => handleShare(event.id, event.title, e)}
                  whileTap={{ scale: 0.97 }}
                  title="Share"
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 border border-white/10 bg-[#0e0e0e]/85 text-white/65 hover:text-white/90 hover:border-white/22 hover:bg-[#151515]/90 transition-colors duration-150 focus:outline-none"
                >
                  <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-[0.44rem] font-technical uppercase tracking-[0.14em] leading-none">Share</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* â”€â”€ TEXT BODY â€” 28â€“32px horizontal padding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex flex-col relative z-10 px-7 pt-7 pb-6">

        {/* Title */}
        <motion.h3
          onClick={() => navigate(`/events/${event.id}`)}
          animate={{
            y: isHovered ? -2 : 0,
            color: isHovered ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.84)',
          }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="text-body-l font-light cursor-pointer leading-snug"
        >
          {event.title}
        </motion.h3>

        {/* Organizer â€” generous gap below title */}
        <motion.div
          animate={{ opacity: isHovered ? 0.52 : 0.34 }}
          transition={{ duration: 0.22 }}
          className="text-[0.6rem] text-white uppercase tracking-[0.1em] font-technical flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-4"
        >
          <span>{event.organizer || 'NexEvent Organizer'}</span>
          <span className="text-white/20 text-[0.45rem]">â—†</span>
          <span>{event.venue || 'Campus'}</span>
        </motion.div>

        {/* Description â€” more line height, generous top spacing */}
        <p className="text-[0.7rem] text-white/32 line-clamp-2 font-light leading-[1.75] mt-5">
          {event.description || 'Explore and join this educational experience hosted in the campus archive halls.'}
        </p>

        {/* â”€â”€ DATA BLOCKS â€” Remaining Â· Registered Â· Deadline â”€â”€â”€â”€ */}
        <div className="grid grid-cols-3 gap-0 mt-8">
          <div className="flex flex-col gap-2">
            <span className="text-[0.46rem] font-technical uppercase tracking-[0.14em] text-white/22">Remaining</span>
            <motion.span
              animate={{ color: isHovered ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.52)' }}
              transition={{ duration: 0.22 }}
              className="text-[0.88rem] font-light tabular-nums leading-none"
            >
              {seatsRemaining}
            </motion.span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-[0.46rem] font-technical uppercase tracking-[0.14em] text-white/22">Registered</span>
            <motion.span
              animate={{ color: isHovered ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.52)' }}
              transition={{ duration: 0.22 }}
              className="text-[0.88rem] font-light tabular-nums leading-none"
            >
              {currentReg}
            </motion.span>
          </div>
          {event.registrationDeadline ? (
            <div className="flex flex-col gap-2 items-end">
              <span className="text-[0.46rem] font-technical uppercase tracking-[0.14em] text-white/22">Deadline</span>
              <span className="text-[0.7rem] font-light text-white/48 leading-none tabular-nums">
                {formatDate(event.registrationDeadline)}
              </span>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* â”€â”€ STATUS MICRO-BADGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {(registered || (isClosed && !registered) || hours > 0) && (
          <div className="flex flex-wrap gap-2 mt-6">
            {registered && (
              <span className="px-2.5 py-1 border border-green-500/16 bg-green-950/12 text-green-400/75 text-[0.44rem] font-technical uppercase tracking-wider leading-none">
                Registered
              </span>
            )}
            {isClosed && !registered && (
              <span className="px-2.5 py-1 border border-red-500/16 bg-red-950/12 text-red-400/70 text-[0.44rem] font-technical uppercase tracking-wider leading-none">
                Capacity Full
              </span>
            )}
            {hours > 0 && (
              <motion.span
                ref={creditBadgeRef}
                animate={creditPulsed ? {
                  borderColor: ['rgba(201,106,43,0.35)', 'rgba(201,106,43,0.65)', 'rgba(201,106,43,0.22)'],
                  backgroundColor: ['rgba(201,106,43,0.04)', 'rgba(201,106,43,0.10)', 'rgba(201,106,43,0.04)'],
                } : {}}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="px-2.5 py-1 border border-accent/22 bg-accent/[0.04] text-accent text-[0.44rem] font-technical uppercase tracking-wider leading-none"
              >
                {hours}h Â· Club Credit
              </motion.span>
            )}
          </div>
        )}

        {/* â”€â”€ PRIMARY BUTTON â€” centered, full-width, generous â”€â”€â”€â”€ */}
        <motion.button
          type="button"
          whileTap={!isClosed || registered ? { scale: 0.98 } : {}}
          onClick={(e) => {
            e.stopPropagation();
            if (registered) navigate('/my-events');
            else if (isClosed) navigate(`/events/${event.id}`);
            else handleRegister(event.id, e);
          }}
          animate={{
            letterSpacing: isHovered && !registered && !isClosed ? '0.1em' : '0.07em',
            borderColor: isHovered && !registered && !isClosed
              ? 'rgba(201,106,43,0.65)'
              : registered
                ? 'rgba(74,222,128,0.22)'
                : isClosed
                  ? 'rgba(239,68,68,0.14)'
                  : 'rgba(201,106,43,0.35)',
            backgroundColor: isHovered && !registered && !isClosed
              ? 'rgba(201,106,43,0.07)'
              : undefined,
          }}
          transition={{ duration: 0.22 }}
          className={cn(
            'w-full mt-6 py-3 text-[0.54rem] font-technical uppercase font-semibold border transition-colors duration-200 select-none focus:outline-none',
            registered
              ? 'border-green-500/22 bg-green-950/08 text-green-400/75 hover:bg-green-950/16'
              : isClosed
                ? 'border-red-500/14 bg-red-950/08 text-red-400/65 cursor-not-allowed'
                : 'border-accent/35 bg-transparent text-accent'
          )}
          disabled={isClosed && !registered}
        >
          {registered ? 'View Ticket' : isClosed ? 'Registration Closed' : 'Register for Event'}
        </motion.button>

        {/* â”€â”€ FOOTER â€” date + venue â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.52 : 0.28,
          }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between text-[0.56rem] pt-5 mt-5 border-t border-white/[0.05] font-ui gap-6"
        >
          <span className="flex items-center gap-2 flex-shrink-0">
            <Calendar className="w-3 h-3 flex-shrink-0" strokeWidth={1.25} />
            <span className="text-white">{formatDate(event.date)}</span>
          </span>
          <span className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.25} />
            <span className="truncate text-white">{event.venue || 'â€”'}</span>
          </span>
        </motion.div>

        {/* Editorial fig number */}
        <div className="absolute bottom-5 right-7 pointer-events-none select-none">
          <span className="text-[0.36rem] font-technical uppercase tracking-widest text-white/08">
            FIG. {figNum}
          </span>
        </div>
      </div>
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

  const publishedCount = useMemo(() => {
    return events.filter(e => e.status !== 'draft' && e.status !== 'archived').length;
  }, [events]);

  const completedCount = useMemo(() => {
    return events.filter(e => e.status === 'completed' || e.status === 'closed').length;
  }, [events]);

  const verifiedClubHours = useMemo(() => {
    return events
      .filter(e => e.status === 'completed' || e.status === 'closed')
      .reduce((acc, e) => acc + (getParticipationHours(e) * (parseInt(e.registeredCount) || 0)), 0);
  }, [events]);

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

          {/* ── SYSTEM HEADER / ARCHIVE HERO ── */}
          <div className="relative flex flex-col gap-8 md:gap-12 select-none">
            {/* Catalog Reference & Axis Marker */}
            <div className="flex items-start justify-between w-full">
              <AxisMarker index="03" label="Discovery Engine" />
              <div className="text-[0.42rem] font-technical uppercase tracking-[0.2em] text-white/20 text-right leading-relaxed select-none">
                CATALOG REF.<br />
                <span className="text-white/30">ARC-2026-001</span>
              </div>
            </div>

            {/* Subtle warm orange atmospheric glow to increase depth slightly */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[250px] bg-accent/[0.045] rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />

            {/* Archive Identifier & Headline & Supporting Paragraph */}
            <div className="flex flex-col gap-6 max-w-3xl">
              {/* small archive identifier */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-[0.52rem] font-technical uppercase tracking-[0.25em] text-accent/80"
              >
                ARCHIVE // VOLUME 01
              </motion.div>

              {/* Large headline */}
              <h1 className="overflow-hidden">
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-display-lg font-light tracking-tight text-primary leading-[1.1]"
                >
                  Campus history,<br />preserved.
                </motion.span>
              </h1>

              {/* Supporting paragraph */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-body-lg text-secondary/70 max-w-xl font-light leading-relaxed mt-2"
              >
                Every workshop, hackathon, conference and competition becomes part of the permanent university archive.
              </motion.p>
            </div>

            {/* Three archival statistics */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.08 }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-3xl w-full mt-4"
            >
              {[
                { label: 'Published Events', value: loading ? '—' : publishedCount },
                { label: 'Completed Events', value: loading ? '—' : completedCount },
                { label: 'Verified Club Hours', value: loading ? '—' : `${verifiedClubHours}h` }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  className="flex flex-col gap-2.5"
                >
                  <span className="text-[0.46rem] font-technical uppercase tracking-[0.18em] text-white/20">
                    {stat.label}
                  </span>
                  <span className="text-display-md font-light tracking-tight text-white/70 leading-none tabular-nums">
                    {stat.value}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Thin architectural divider */}
            <div className="relative w-full pt-4 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="h-px bg-white/[0.06] origin-left"
              />
            </div>
          </div>

          {/* â”€â”€ DISCOVERY CONSOLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex flex-col border border-white/[0.06] bg-[#0c0c0c] font-ui">

            {/* â”€â”€ Console system bar â”€â”€â”€â”€ */}
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
                    <span className="text-white/30">{loading ? 'â€”' : events.filter(e => e.status !== 'draft' && e.status !== 'archived').length}</span>
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

            {/* â”€â”€ Main input row â”€â”€â”€â”€ */}
            <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-white/[0.05]">

              {/* Search â€” ~45% width on xl */}
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
                  placeholder="Search title, organizer, venueâ€¦"
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

              {/* Filter strip â€” four identical pills */}
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

            {/* â”€â”€ Active filter pill strip â”€â”€â”€â”€ */}
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

          {/* â”€â”€ Live result footer â”€â”€â”€â”€ */}
          <div className="flex items-center justify-between -mt-8">
            <motion.span
              key={`${processedEvents.length}-${selectedCategory}-${selectedStatus}-${selectedDate}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-[0.5rem] font-technical uppercase tracking-widest text-white/22"
            >
              {loading ? 'Loading directoryâ€¦' : (
                <>
                  <span className="text-white/40">{processedEvents.length}</span>
                  &nbsp;Events Found
                  {[selectedCategory !== 'All', selectedStatus !== 'All', selectedDate !== 'All', !!searchQuery.trim()].filter(Boolean).length > 0 && (
                    <>
                      &nbsp;â€¢&nbsp;
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
              // Skeleton cards â€” poster + title + metadata rows + button
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14 md:gap-x-12 md:gap-y-16 font-ui">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex flex-col gap-0">
                    <div className="w-full aspect-[16/10] bg-white/[0.04] skeleton-shimmer rounded-none" />
                    <div className="pt-4 pb-1 flex flex-col gap-3">
                      <div className="h-5 w-4/5 bg-white/[0.04] skeleton-shimmer rounded-none" />
                      <div className="h-3 w-2/5 bg-white/[0.03] skeleton-shimmer rounded-none" />
                      <div className="h-3 w-full bg-white/[0.03] skeleton-shimmer rounded-none" />
                      <div className="h-3 w-3/4 bg-white/[0.03] skeleton-shimmer rounded-none" />
                      <div className="h-px w-full bg-white/[0.04] mt-1" />
                      <div className="flex justify-between mt-1">
                        <div className="h-6 w-1/4 bg-white/[0.03] skeleton-shimmer rounded-none" />
                        <div className="h-6 w-1/5 bg-white/[0.04] skeleton-shimmer rounded-none" />
                      </div>
                    </div>
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
              // Render Grid of Events â€” row-by-row reveal, 80ms stagger, 600ms
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.08 }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14 md:gap-x-12 md:gap-y-16"
              >
                {processedEvents.map((event, idx) => {
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
                        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } }
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
                        cardIndex={idx}
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
                          {userRegIds.has(previewEvent.id) ? "Registered âœ“" : "Register"}
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
