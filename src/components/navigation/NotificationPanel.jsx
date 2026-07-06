import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService';
import { X, CheckCircle, AlertTriangle, RefreshCw, XCircle, Clock, Info, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

// Easing
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
  switch (type) {
    case 'registration_success': 
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'registration_closed': 
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    case 'event_updated': 
      return <RefreshCw className="w-4 h-4 text-accent" />;
    case 'event_cancelled': 
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'event_reminder': 
      return <Clock className="w-4 h-4 text-amber-500" />;
    default: 
      return <Info className="w-4 h-4 text-white/30" />;
  }
};

export const NotificationPanel = ({ isOpen, onClose, notifications, userId }) => {
  const navigate = useNavigate();

  // Group notifications
  const groupNotifications = (list) => {
    const today = [];
    const yesterday = [];
    const earlier = [];

    const todayDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const todayStr = todayDate.toDateString();
    const yesterdayStr = yesterdayDate.toDateString();

    list.forEach(notif => {
      if (!notif.createdAt) {
        earlier.push(notif);
        return;
      }
      const d = new Date(notif.createdAt);
      const dStr = d.toDateString();
      
      if (dStr === todayStr) {
        today.push(notif);
      } else if (dStr === yesterdayStr) {
        yesterday.push(notif);
      } else {
        earlier.push(notif);
      }
    });

    return { today, yesterday, earlier };
  };

  const { today, yesterday, earlier } = groupNotifications(notifications);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    if (notif.eventId) {
      onClose();
      navigate(`/events/${notif.eventId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(userId);
  };

  const renderNotificationItem = (notif) => {
    return (
      <div
        key={notif.id}
        onClick={() => handleNotificationClick(notif)}
        className={cn(
          "flex gap-4 p-4 border-b border-white/5 cursor-pointer transition-all duration-300 hover:bg-white/[0.02] text-left select-none relative font-ui",
          notif.isRead ? "opacity-40" : "opacity-100 bg-white/[0.01]"
        )}
      >
        {/* Left: Icon status indicator */}
        <div className="shrink-0 pt-0.5">
          {getNotificationIcon(notif.type)}
        </div>

        {/* Center content */}
        <div className="flex-grow flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-body-s font-medium text-primary leading-tight">
              {notif.title}
            </h4>
            <span className="text-[0.6rem] font-technical uppercase tracking-wider text-white/20 shrink-0">
              {getRelativeTime(notif.createdAt)}
            </span>
          </div>
          <p className="text-xs text-secondary leading-relaxed font-light">
            {notif.message}
          </p>
        </div>

        {/* Dot for unread */}
        {!notif.isRead && (
          <div className="absolute right-4 bottom-4 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(255,87,34,0.6)]" />
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-pointer"
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ duration: 0.45, ease: EASE }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0e0e0e]/95 border-l border-white/10 backdrop-blur-2xl flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)]"
      >
        {/* Editorial Grain Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10 font-ui">
          <div className="flex flex-col text-left">
            <span className="text-[0.6rem] font-technical uppercase tracking-[0.25em] text-white/30">Panel // Notifications</span>
            <h2 className="text-body-l font-light text-primary mt-1">Inbox</h2>
          </div>
          <div className="flex items-center gap-3">
            {notifications.some(n => !n.isRead) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[0.6rem] font-technical uppercase tracking-wider text-accent hover:text-accent/80 transition-colors mr-2 focus:outline-none"
              >
                Mark All Read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-white/40 hover:text-white transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-grow overflow-y-auto relative z-10">
          {notifications.length === 0 ? (
            // Minimal Typographic Empty State
            <div className="flex flex-col py-24 items-center justify-center text-center select-none font-ui px-6">
              <span className="text-[0.6rem] font-technical text-white/20 uppercase tracking-[0.25em] mb-3">
                Notification center // Empty
              </span>
              <p className="text-body-s text-secondary">
                You have no notifications yet. Announcements will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Today Group */}
              {today.length > 0 && (
                <div>
                  <div className="px-6 py-2 bg-white/[0.02] border-y border-white/5 text-[0.55rem] font-technical text-white/30 uppercase tracking-[0.2em] text-left">
                    Today
                  </div>
                  {today.map(renderNotificationItem)}
                </div>
              )}

              {/* Yesterday Group */}
              {yesterday.length > 0 && (
                <div>
                  <div className="px-6 py-2 bg-white/[0.02] border-y border-white/5 text-[0.55rem] font-technical text-white/30 uppercase tracking-[0.2em] text-left">
                    Yesterday
                  </div>
                  {yesterday.map(renderNotificationItem)}
                </div>
              )}

              {/* Earlier Group */}
              {earlier.length > 0 && (
                <div>
                  <div className="px-6 py-2 bg-white/[0.02] border-y border-white/5 text-[0.55rem] font-technical text-white/30 uppercase tracking-[0.2em] text-left">
                    Earlier
                  </div>
                  {earlier.map(renderNotificationItem)}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};
