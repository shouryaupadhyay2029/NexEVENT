import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService';
import { 
  X, Compass, Ticket, Shield, Clock, Megaphone, UserCheck, 
  Settings, CheckSquare, XCircle 
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Easing curve
const EASE = [0.16, 1, 0.3, 1];

const getRelativeTime = (isoStr) => {
  if (!isoStr) return "";
  try {
    const past = new Date(isoStr);
    const diffMs = new Date() - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
};

const getNotificationIcon = (type) => {
  const iconProps = { 
    className: "w-4 h-4 transition-transform duration-200 group-hover:rotate-6 group-hover:-translate-y-0.5", 
    strokeWidth: 1.5 
  };
  switch (type) {
    case 'registration_success': 
      return <Ticket {...iconProps} />;
    case 'registration_closed': 
      return <Clock {...iconProps} />;
    case 'event_updated': 
      return <Clock {...iconProps} />;
    case 'event_published': 
      return <Compass {...iconProps} />;
    case 'event_cancelled': 
      return <XCircle {...iconProps} />;
    case 'event_reminder': 
      return <Clock {...iconProps} />;
    case 'approval_success': 
    case 'approval_pending':
      return <Shield {...iconProps} />;
    case 'club_hours_verified':
      return <CheckSquare {...iconProps} />;
    case 'announcement':
      return <Megaphone {...iconProps} />;
    case 'verification':
      return <UserCheck {...iconProps} />;
    default: 
      return <Compass {...iconProps} />;
  }
};

export const NotificationPanel = ({ isOpen, onClose, notifications, userId }) => {
  const navigate = useNavigate();
  const [syncTime, setSyncTime] = useState("Just now");

  // Keep last synchronized time updated
  useEffect(() => {
    if (!isOpen) return;
    setSyncTime("Just now");
    const interval = setInterval(() => {
      setSyncTime("2m ago"); // Mocking relative synchronization
    }, 120000);
    return () => clearInterval(interval);
  }, [isOpen, notifications]);

  // Group notifications
  const groupNotifications = (list) => {
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const older = [];

    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    list.forEach(notif => {
      if (!notif.createdAt) {
        older.push(notif);
        return;
      }
      const d = new Date(notif.createdAt);
      const dStr = d.toDateString();
      
      if (dStr === todayStr) {
        today.push(notif);
      } else if (dStr === yesterdayStr) {
        yesterday.push(notif);
      } else if (d > oneWeekAgo) {
        thisWeek.push(notif);
      } else {
        older.push(notif);
      }
    });

    return { today, yesterday, thisWeek, older };
  };

  const { today, yesterday, thisWeek, older } = groupNotifications(notifications);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id, userId);
    }
    if (notif.eventId) {
      onClose();
      navigate(`/events/${notif.eventId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(userId);
  };

  const renderNotificationRow = (notif) => {
    // Resolve metadata representation
    let statusText = "SYSTEM LOG";
    let categoryText = "General Event";
    let initiator = notif.organizer || notif.metadata?.organizer || notif.metadata?.club || "NexEvent Engine";

    switch (notif.type) {
      case 'registration_success':
        statusText = "REGISTRATION COMPLETED";
        categoryText = "Club Event";
        break;
      case 'registration_closed':
        statusText = "REGISTRATION CLOSED";
        categoryText = "Closed Event";
        break;
      case 'event_updated':
        statusText = "EVENT CONFIG UPDATED";
        categoryText = "Update Log";
        break;
      case 'event_published':
        statusText = "NEW EVENT PUBLISHED";
        categoryText = "Technical Event";
        break;
      case 'event_cancelled':
        statusText = "EVENT CANCELLED";
        categoryText = "Cancellation Log";
        break;
      case 'event_reminder':
        statusText = "EVENT TIMELINE REMINDER";
        categoryText = "Reminder Log";
        break;
      case 'approval_success':
      case 'approval_pending':
        statusText = "FACULTY APPROVAL";
        categoryText = "Verification Log";
        break;
      case 'club_hours_verified':
        statusText = "CLUB HOURS VERIFIED";
        categoryText = "Credit Ledger";
        break;
      case 'announcement':
        statusText = "CAMPUS ANNOUNCEMENT";
        categoryText = "Broadcast";
        break;
      default:
        break;
    }

    return (
      <motion.div
        key={notif.id}
        variants={{
          closed: { opacity: 0, y: 12 },
          open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }
        }}
        onClick={() => handleNotificationClick(notif)}
        className={cn(
          "group relative flex gap-5 p-6 border-b border-white/[0.03] cursor-pointer transition-colors duration-200 text-left select-none overflow-hidden",
          notif.isRead 
            ? "bg-transparent text-white/50 hover:bg-[#131313]" 
            : "bg-white/[0.015] text-white hover:bg-[#161616]"
        )}
      >
        {/* Grow-from-left unread indicator bar */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-[2.5px] bg-accent origin-left transition-transform duration-200",
            !notif.isRead ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          )}
        />

        {/* Left Status Icon */}
        <div className={cn(
          "shrink-0 p-2.5 border transition-all duration-200 flex items-center justify-center",
          !notif.isRead 
            ? "border-accent/25 text-accent bg-accent/[0.03]" 
            : "border-white/10 text-white/40 bg-white/[0.02] group-hover:text-white/80 group-hover:border-white/20 group-hover:bg-white/[0.04]"
        )}>
          {getNotificationIcon(notif.type)}
        </div>

        {/* Center content */}
        <div className="flex-grow flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between gap-3 text-[0.46rem] font-technical uppercase tracking-widest leading-none">
            <span className={cn(
              "transition-colors duration-200",
              !notif.isRead ? "text-accent/90" : "text-white/30 group-hover:text-accent/80"
            )}>
              {statusText}
            </span>
            <span className={cn(
              "tabular-nums transition-colors duration-200",
              !notif.isRead ? "text-accent/90" : "text-white/20 group-hover:text-white/60"
            )}>
              {getRelativeTime(notif.createdAt)}
            </span>
          </div>

          <h4 className={cn(
            "text-body-s font-light leading-snug transition-colors duration-200",
            !notif.isRead ? "text-white font-normal" : "text-white/70 group-hover:text-white/90"
          )}>
            {notif.title}
          </h4>

          <p className={cn(
            "text-[0.68rem] font-light leading-relaxed transition-colors duration-200",
            !notif.isRead ? "text-white/50" : "text-white/35 group-hover:text-white/50"
          )}>
            {notif.message}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[0.52rem] font-technical uppercase tracking-wider text-white/20 group-hover:text-white/35 transition-colors duration-200 pt-0.5">
            <span>By {initiator}</span>
            <span>·</span>
            <span>{categoryText}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGroupHeader = (label) => (
    <motion.div 
      variants={{
        closed: { opacity: 0, y: 8 },
        open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }
      }}
      className="flex items-center gap-3 px-6 py-4 select-none"
    >
      <span className="text-[0.45rem] font-technical uppercase tracking-[0.25em] text-white/22">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/[0.04]" />
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - overlay fades */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={onClose} 
            className="fixed inset-0 z-40 bg-black/65 cursor-pointer"
          />

          {/* Drawer - slides from right 24px */}
          <motion.div
            variants={{
              closed: { x: 'calc(100% + 24px)', opacity: 0 },
              open: { 
                x: 0, 
                opacity: 1,
                transition: {
                  type: 'spring',
                  stiffness: 280,
                  damping: 30,
                  mass: 0.8,
                  staggerChildren: 0.04,
                  delayChildren: 0.08
                }
              }
            }}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0e0e0e] border-l border-white/10 flex flex-col overflow-hidden"
          >
            {/* Architectural blueprint grid background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay z-0" 
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px), 
                                  linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), 
                                  linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                backgroundPosition: 'center'
              }}
            />

            {/* Header - Sticky */}
            <motion.div 
              variants={{
                closed: { opacity: 0, y: -8 },
                open: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } }
              }}
              className="px-6 py-6 border-b border-white/[0.05] bg-[#0e0e0e]/98 flex items-start justify-between relative z-10 font-ui"
            >
              <div className="flex flex-col text-left gap-1">
                <span className="text-[0.45rem] font-technical uppercase tracking-[0.25em] text-accent/80">SYSTEM LOG</span>
                <h2 className="text-body-l font-light text-primary leading-none">ACTIVITY FEED</h2>
                <p className="text-[0.64rem] font-light text-white/30 leading-relaxed max-w-xs mt-1">
                  Live updates across registrations, approvals, club hours and campus events.
                </p>
              </div>
              <div className="flex items-center gap-4 pt-1">
                {notifications.some(n => !n.isRead) && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[0.52rem] font-technical uppercase tracking-widest text-accent hover:text-accent/80 transition-colors focus:outline-none relative group/btn"
                  >
                    MARK ALL READ
                    <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-accent scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-200" />
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/settings');
                  }}
                  className="text-white/40 hover:text-white transition-colors focus:outline-none"
                  title="Notification Settings"
                >
                  <Settings className="w-3.5 h-3.5 transition-transform duration-300 hover:rotate-45" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-white/40 hover:text-white transition-colors focus:outline-none"
                  aria-label="Close activity feed"
                >
                  <X className="w-4 h-4 transition-transform duration-300 hover:rotate-90" />
                </button>
              </div>
            </motion.div>

            {/* List Content - Custom Scrollbar */}
            <div className="flex-grow overflow-y-auto relative z-10 scrollbar-custom">
              {notifications.length === 0 ? (
                // Minimal premium console empty state
                <motion.div 
                  variants={{
                    closed: { opacity: 0 },
                    open: { opacity: 1, transition: { delay: 0.15 } }
                  }}
                  className="flex flex-col py-36 items-center justify-center text-center select-none font-ui px-6"
                >
                  <div className="p-3 border border-white/5 bg-white/[0.01] text-white/20 mb-4 flex items-center justify-center">
                    <Compass className="w-5 h-5 animate-pulse" style={{ animationDuration: '6s' }} />
                  </div>
                  <span className="text-[0.52rem] font-technical text-white/35 uppercase tracking-[0.25em] mb-2 leading-none">
                    SYSTEM SILENT
                  </span>
                  <p className="text-[0.7rem] text-white/25 max-w-[200px] leading-relaxed">
                    No recent activity has been recorded. Awaiting future campus events.
                  </p>
                  <span className="text-[0.38rem] font-technical text-white/10 uppercase tracking-widest mt-8">
                    LOG-000
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col pb-6">
                  {/* Today Group */}
                  {today.length > 0 && (
                    <div className="flex flex-col">
                      {renderGroupHeader("TODAY")}
                      <div className="flex flex-col">
                        {today.map(renderNotificationRow)}
                      </div>
                    </div>
                  )}

                  {/* Yesterday Group */}
                  {yesterday.length > 0 && (
                    <div className="flex flex-col">
                      {renderGroupHeader("YESTERDAY")}
                      <div className="flex flex-col">
                        {yesterday.map(renderNotificationRow)}
                      </div>
                    </div>
                  )}

                  {/* This Week Group */}
                  {thisWeek.length > 0 && (
                    <div className="flex flex-col">
                      {renderGroupHeader("THIS WEEK")}
                      <div className="flex flex-col">
                        {thisWeek.map(renderNotificationRow)}
                      </div>
                    </div>
                  )}

                  {/* Older Group */}
                  {older.length > 0 && (
                    <div className="flex flex-col">
                      {renderGroupHeader("OLDER")}
                      <div className="flex flex-col">
                        {older.map(renderNotificationRow)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Section */}
            <motion.div 
              variants={{
                closed: { opacity: 0, y: 8 },
                open: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } }
              }}
              className="px-6 py-4 border-t border-white/[0.05] bg-[#0e0e0e]/98 flex items-center justify-between relative z-10 select-none font-technical text-[0.45rem] uppercase tracking-widest text-white/20"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <span>Last synchronized: {syncTime}</span>
              </div>
              <span className="text-white/10">Refreshes automatically</span>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
