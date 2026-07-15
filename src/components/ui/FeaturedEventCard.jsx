import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { resolveEventImage } from '../../utils/eventImage';
import { getParticipationHours } from '../../utils/clubHours';

const Counter = () => {
  const [count, setCount] = useState("00");
  useEffect(() => {
    const timer = setTimeout(() => {
      setCount("01");
    }, 450);
    return () => clearTimeout(timer);
  }, []);
  return <span>{count} / 01</span>;
};

const easeOutExpo = [0.16, 1, 0.3, 1];

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
};

// Ambient light sweep — moves across every 10–15s, almost invisible
const SweepLight = () => {
  return (
    <motion.div
      className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
      initial={false}
    >
      <motion.div
        className="absolute top-0 bottom-0 w-[40%] left-0 opacity-[0.04]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '350%'] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          repeatDelay: 11,
          ease: [0.4, 0, 0.6, 1],
        }}
      />
    </motion.div>
  );
};

export const FeaturedEventCard = ({ event, loading }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);


  // Use dynamic event data or clean fallbacks if none published yet
  const title = event?.title || "Stanford Design Symposium '26";
  const resolvedImage = resolveEventImage(event);

  const [imgState, setImgState] = useState(() => ({
    currentImage: resolvedImage,
    isLoaded: false,
    fallbackAttempted: false,
  }));

  // Sync state on event prop changes
  useEffect(() => {
    const resImg = resolveEventImage(event);
    setImgState({ currentImage: resImg, isLoaded: false, fallbackAttempted: false });
  }, [event]); // eslint-disable-line react-hooks/exhaustive-deps

  // StrictMode rescue: no-dep effect runs after every render.
  // Corrects isLoaded=false if StrictMode re-ran useEffect([event]) after onLoad fired.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0 && !imgState.isLoaded) {
      setImgState((prev) => ({ ...prev, isLoaded: true }));
    }
  });

  const { currentImage, isLoaded } = imgState;

  const category = event?.category || "Featured";
  const venue = event?.venue || "Auditorium";
  const dateText = event?.date ? formatDate(event.date) : "Oct 14, 2026";
  const isOpen = event ? (event.status?.toLowerCase() === "open") : true;

  const [_progress, setProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Cursor tracking (normalized 0-1)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { damping: 60, stiffness: 300, mass: 1 });
  const smoothY = useSpring(mouseY, { damping: 60, stiffness: 300, mass: 1 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // Ambient glow follows cursor — subtle only, no flashlight
  const glowX = useTransform(smoothX, [0, 1], [0.3, 0.7]);
  const glowY = useTransform(smoothY, [0, 1], [0.3, 0.7]);

  const transformX = useTransform(glowX, (gx) => `calc(${gx * 100}% - 180px)`);
  const transformY = useTransform(glowY, (gy) => `calc(${gy * 100}% - 180px)`);

  // Parallax Shifts (restrained: image 8px, title 3px, meta 2px)
  const rawImgParallaxX = useTransform(smoothX, [0, 1], [-8, 8]);
  const rawImgParallaxY = useTransform(smoothY, [0, 1], [-8, 8]);
  const rawTitleParallaxX = useTransform(smoothX, [0, 1], [-3, 3]);
  const rawTitleParallaxY = useTransform(smoothY, [0, 1], [-3, 3]);
  const rawMetaParallaxX = useTransform(smoothX, [0, 1], [-2, 2]);
  const rawMetaParallaxY = useTransform(smoothY, [0, 1], [-2, 2]);

  const imgParallaxX = shouldReduceMotion ? 0 : rawImgParallaxX;
  const imgParallaxY = shouldReduceMotion ? 0 : rawImgParallaxY;
  const titleParallaxX = shouldReduceMotion ? 0 : rawTitleParallaxX;
  const titleParallaxY = shouldReduceMotion ? 0 : rawTitleParallaxY;
  const metaParallaxX = shouldReduceMotion ? 0 : rawMetaParallaxX;
  const metaParallaxY = shouldReduceMotion ? 0 : rawMetaParallaxY;

  // Image lift on hover (using transform only for GPU accel)
  const cardY = useSpring(isHovered ? -5 : 0, { damping: 30, stiffness: 200 });

  // Bottom progress indicator — fills on hover
  useEffect(() => {
    let timeout;
    if (isHovered) {
      timeout = setTimeout(() => setProgress(100), 50);
    } else {
      setProgress(0);
    }
    return () => clearTimeout(timeout);
  }, [isHovered]);

  // Staggered entrance
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.15 }
    }
  };

  const infoItemVariants = (index) => ({
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: easeOutExpo,
        delay: 0.15 + index * 0.07 // 70ms spacing
      }
    }
  });

  if (loading) {
    return (
      <div className="w-full aspect-[3/4] bg-white/5 animate-pulse border border-white/5" />
    );
  }

  const handleCardClick = () => {
    if (event?.id) {
      navigate(`/events/${event.id}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="col-span-1 lg:col-span-5 relative w-full aspect-[3/4] group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{ y: cardY }}
      whileTap={{ scale: 0.985, transition: { duration: 0.2, ease: easeOutExpo } }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── CARD SHELL ── */}
      <div
        className="w-full h-full overflow-hidden relative rounded-none will-change-transform isolate"
        style={{
          boxShadow: isHovered
            ? '0 24px 60px rgba(0,0,0,0.75), 0 4px 16px rgba(0,0,0,0.4)'
            : '0 10px 40px rgba(0,0,0,0.5)',
          transition: 'box-shadow 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── LAYER 0: Ultra-thin border ── */}
        <div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{
            border: isHovered ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.07)',
            transition: 'border-color 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        {/* ── LAYER 1: Background image (scale on hover, GPU only) ── */}
        <motion.img
          ref={imgRef}
          src={currentImage}
          alt={title}
          onLoad={() => {
            setImgState((prev) => ({ ...prev, isLoaded: true }));
          }}
          onError={() => {
            setImgState((prev) => {
              if (!prev.fallbackAttempted) {
                return {
                  currentImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop&fm=webp',
                  isLoaded: false,
                  fallbackAttempted: true,
                };
              }
              return { ...prev, isLoaded: true }; // terminal: remove black veil
            });
          }}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{
            scale: isHovered ? 1.04 : 1,
            opacity: isLoaded ? 1 : 0,
          }}
          transition={{
            scale: {
              duration: isHovered ? 5 : 0.9, // 5s slow zoom, 900ms restore
              ease: isHovered ? "linear" : easeOutExpo
            },
            opacity: { duration: 0.9, ease: "easeOut" }
          }}
          style={{
            x: imgParallaxX,
            y: imgParallaxY,
          }}
          className="absolute inset-[-12px] w-[calc(100%+24px)] h-[calc(100%+24px)] object-cover origin-center [image-rendering:-webkit-optimize-contrast] contrast-[1.06] brightness-[0.94]"
        />

        {/* ── LAYER 2: Dark cinematic gradient (vignette + lift) ── */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: isHovered
              ? 'linear-gradient(to top, rgba(7,7,7,0.95) 0%, rgba(7,7,7,0.25) 50%, rgba(7,7,7,0.08) 100%)'
              : 'linear-gradient(to top, rgba(7,7,7,0.92) 0%, rgba(7,7,7,0.35) 55%, rgba(7,7,7,0.05) 100%)',
            transition: 'background 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        {/* ── LAYER 3: Film grain ── */}
        <div
          className="absolute inset-0 z-10 mix-blend-overlay pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* ── LAYER 4: Ambient cursor glow using GPU Translation (No layout repaints) ── */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden mix-blend-overlay">
          <motion.div
            className="absolute w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)]"
            style={{
              x: transformX,
              y: transformY,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ opacity: { duration: 0.6, ease: 'easeOut' } }}
          />
        </div>

        {/* ── LAYER 4b: Sweeping ambient light (every ~15s) ── */}
        <SweepLight />

        {/* ── LAYER 5: Typography / Content ── */}
        <div className="absolute inset-0 flex flex-col justify-end z-20 p-8 md:p-10">

          {/* Top badge */}
          <motion.div
            variants={infoItemVariants(0)}
            style={{ x: metaParallaxX, y: metaParallaxY }}
            className="flex items-center gap-4 mb-auto mt-7"
          >
            <span
              className="inline-flex items-center gap-2 text-micro"
              style={{
                color: isHovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.5s ease',
              }}
            >
              <span
                className="w-1.5 h-1.5 bg-accent"
                style={{ boxShadow: isHovered ? '0 0 6px rgba(201,106,43,0.6)' : 'none', transition: 'box-shadow 0.5s ease' }}
              />
              {category}
            </span>
            {getParticipationHours(event) > 0 && (
              <>
                <span className="w-4 h-[1px] bg-white/20" />
                <span className="text-micro text-accent font-technical uppercase tracking-wider">
                  {getParticipationHours(event)} HRS // CLUB CREDIT
                </span>
              </>
            )}
          </motion.div>

          {/* Bottom content block */}
          <div className="flex flex-col gap-0">

            {/* Registration + Free Entry row */}
            <motion.div
              variants={infoItemVariants(0)}
              className="flex items-center justify-between mb-5"
            >
              <span
                className="text-micro"
                style={{
                  color: isHovered ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.4)',
                  transition: 'color 0.5s ease',
                }}
              >
                {isOpen ? "Registration Open" : "Registration Closed"}
              </span>
              <span
                className="text-micro"
                style={{
                  color: isHovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)',
                  transition: 'color 0.5s ease',
                }}
              >
                Free Entry
              </span>
            </motion.div>

            {/* Event title */}
            <motion.h3
              variants={infoItemVariants(1)}
              style={{ 
                x: titleParallaxX, 
                y: titleParallaxY,
                color: isHovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.95)',
                transition: 'color 0.5s ease',
              }}
              className="text-display-m mb-7 font-light"
            >
              {title}
            </motion.h3>

            {/* Date + Location metadata */}
            <div className="flex items-end justify-between w-full">
              <motion.div
                variants={infoItemVariants(2)}
                style={{ x: metaParallaxX, y: metaParallaxY }}
                className="flex flex-col gap-1.5"
              >
                <span
                  className="text-micro"
                  style={{ color: 'rgba(255,255,255,0.47)' }}
                >
                  Date
                </span>
                <span
                  className="text-body-s"
                  style={{
                    color: isHovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)',
                    transition: 'color 0.5s ease',
                  }}
                >
                  {dateText}
                </span>
              </motion.div>
              <motion.div
                variants={infoItemVariants(3)}
                style={{ x: metaParallaxX, y: metaParallaxY }}
                className="flex flex-col gap-1.5 text-right"
              >
                <span
                  className="text-micro"
                  style={{ color: 'rgba(255,255,255,0.47)' }}
                >
                  Venue
                </span>
                <span
                  className="text-body-s"
                  style={{
                    color: isHovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)',
                    transition: 'color 0.5s ease',
                  }}
                >
                  {venue}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── EXTERNAL FOOTER: Progress indicator + caption ── */}
      <motion.div
        variants={infoItemVariants(4)}
        className="absolute -bottom-10 left-0 w-full flex flex-col gap-2.5 pt-3"
      >
        {/* Premium progress bar */}
        <div className="relative w-full h-[1px] bg-white/10 overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full w-full bg-white/50 origin-left"
            initial={{ scaleX: 0.12 }}
            animate={{ scaleX: isHovered ? 1 : 0.12 }}
            transition={{ duration: isHovered ? 0.8 : 0.5, ease: easeOutExpo }}
          />
        </div>

        {/* Caption row */}
        <div
          className="flex justify-between items-center text-micro"
          style={{
            color: isHovered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.47)',
            transition: 'color 0.5s ease',
          }}
        >
          <span className="flex items-center gap-2.5">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.3 }}
              style={{ color: isHovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)', transition: 'color 0.5s ease' }}
            >
              FIG. 01
            </motion.span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.45 }}
            >
              Architecture Showcase
            </motion.span>
          </span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.6 }}
            className="text-micro"
          >
            <Counter />
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
};
