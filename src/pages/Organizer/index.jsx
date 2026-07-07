import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  subscribeToOrganizerEvents, 
  updateEvent, 
  deleteEvent, 
  duplicateEvent 
} from '../../services/eventService';
import { PageTransition } from '../../components/layout/PageTransition';
import { PageContainer } from '../../components/layout/PageContainer';
import { SectionWrapper } from '../../components/layout/SectionWrapper';
import { AxisMarker } from '../../components/layout/AxisMarker';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { 
  Plus, Edit2, Copy, ToggleRight, Archive, Trash2, 
  Search, X, Users, CheckSquare, Square,
  BarChart2, Globe
} from 'lucide-react';

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

const renderStatusBadge = (status) => {
  const currentStatus = (status || 'draft').toLowerCase();
  
  let styles = "border-white/10 bg-white/5 text-white/40"; // fallback
  let text = status;
  
  if (currentStatus === 'draft') {
    styles = "border-white/10 bg-white/5 text-white/60";
    text = "Draft";
  } else if (currentStatus === 'published') {
    styles = "border-blue-500/20 bg-blue-950/20 text-blue-400";
    text = "Published";
  } else if (currentStatus === 'open') {
    styles = "border-green-500/20 bg-green-950/20 text-green-400";
    text = "Registration Open";
  } else if (currentStatus === 'closed') {
    styles = "border-orange-500/20 bg-orange-950/20 text-orange-400";
    text = "Registration Closed";
  } else if (currentStatus === 'live') {
    styles = "border-red-500/20 bg-red-950/20 text-red-400 animate-pulse";
    text = "Live Now";
  } else if (currentStatus === 'completed') {
    styles = "border-white/20 bg-white/10 text-white";
    text = "Completed";
  } else if (currentStatus === 'archived') {
    styles = "border-white/5 bg-[#141414]/30 text-white/25";
    text = "Archived";
  }

  return (
    <span className={cn(
      "text-[0.48rem] font-technical uppercase tracking-wider px-2 py-0.5 border leading-tight",
      styles
    )}>
      {text}
    </span>
  );
};

const EASE = [0.16, 1, 0.3, 1];

// Count-up helper component for stats
const CountingNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 1000;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * (end - start) + start);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }, [value]);

  return <span>{displayValue}</span>;
};

export const OrganizerStudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');

  // Edit Event Modal State
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    date: '',
    time: '',
    capacity: 0,
    status: 'open',
    registrationDeadline: ''
  });
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  // Real-time Firestore Subscription
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    const unsubscribe = subscribeToOrganizerEvents(
      user.uid,
      (list) => {
        setEvents(list);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Memoized stats calculation
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const stats = useMemo(() => {
    const total = events.length;
    const drafts = events.filter(e => e.status === 'draft').length;
    const published = events.filter(e => e.status === 'open' || e.status === 'closed' || e.status === 'published').length;
    const live = events.filter(e => e.status === 'live').length;
    const completed = events.filter(e => e.status === 'completed').length;
    const archived = events.filter(e => e.status === 'archived').length;
    const totalRegs = events.reduce((acc, curr) => acc + (parseInt(curr.registeredCount) || 0), 0);

    return { total, drafts, published, live, completed, archived, totalRegs };
  }, [events]);

  // Bulk selectors
  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEvents.map(e => e.id)));
    }
  };

  // Actions
  const handleEditOpen = (event, e) => {
    if (e) e.stopPropagation();
    setEditingEvent(event);
    setEditForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || '',
      venue: event.venue || '',
      date: event.date || '',
      time: event.time || '',
      capacity: event.capacity ? Number(event.capacity) : 0,
      status: event.status || 'open',
      registrationDeadline: event.registrationDeadline || ''
    });
    setFormError('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.venue.trim() || !editForm.category) {
      setFormError("All required fields must be populated.");
      return;
    }
    setFormSaving(true);
    setFormError('');
    try {
      await updateEvent(editingEvent.id, {
        ...editForm,
        capacity: Number(editForm.capacity)
      });
      triggerToast('success', "Event successfully updated.");
      setEditingEvent(null);
    } catch (err) {
      console.error("[Organizer] Failed to update event:", err);
      setFormError("Failed to update event document.");
    } finally {
      setFormSaving(false);
    }
  };

  const handleDuplicate = async (event, e) => {
    if (e) e.stopPropagation();
    try {
      await duplicateEvent(event);
      triggerToast('success', "Event duplicated successfully.");
    } catch (err) {
      console.error("[Organizer] Failed to duplicate event:", err);
      triggerToast('error', "Failed to duplicate event.");
    }
  };

  const handlePublish = async (event, e) => {
    if (e) e.stopPropagation();
    try {
      await updateEvent(event.id, { 
        status: 'open',
        publishedAt: new Date().toISOString(),
        lastStatusChange: new Date().toISOString()
      });
      triggerToast('success', "Event successfully published to public discovery.");
    } catch (err) {
      console.error("[Organizer] Failed to publish event:", err);
      triggerToast('error', "Failed to publish event.");
    }
  };

  const handleViewAnalytics = (event, e) => {
    if (e) e.stopPropagation();
    const views = event.views || 0;
    const shares = event.shares || 0;
    const registrations = event.registeredCount || 0;
    const checkIns = event.checkIns || 0;
    triggerToast('success', `Analytics Registry // Views: ${views} | Shares: ${shares} | Bookings: ${registrations} | Check-ins: ${checkIns}`);
  };

  const handleToggleClose = async (event, e) => {
    if (e) e.stopPropagation();
    const nextStatus = event.status?.toLowerCase() === 'closed' ? 'open' : 'closed';
    try {
      await updateEvent(event.id, { 
        status: nextStatus,
        lastStatusChange: new Date().toISOString()
      });
      triggerToast('success', `Event registration status updated to ${nextStatus}.`);
    } catch (err) {
      console.error("[Organizer] Failed to toggle event closure:", err);
      triggerToast('error', "Failed to toggle status.");
    }
  };

  const handleArchive = async (event, e) => {
    if (e) e.stopPropagation();
    try {
      await updateEvent(event.id, { 
        status: 'archived',
        archivedAt: new Date().toISOString(),
        lastStatusChange: new Date().toISOString()
      });
      triggerToast('success', "Event moved to archives.");
    } catch (err) {
      console.error("[Organizer] Failed to archive event:", err);
      triggerToast('error', "Failed to archive event.");
    }
  };

  const handleDelete = async (eventId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this event? This action is irreversible.")) return;
    try {
      await deleteEvent(eventId);
      triggerToast('success', "Event permanently deleted.");
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    } catch (err) {
      console.error("[Organizer] Failed to delete event:", err);
      triggerToast('error', "Failed to delete event.");
    }
  };

  // Bulk action triggers
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete the ${selectedIds.size} selected events?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteEvent(id)));
      triggerToast('success', "Selected events deleted.");
      setSelectedIds(new Set());
    } catch (err) {
      console.error("[Organizer] Failed to bulk delete events:", err);
      triggerToast('error', "Failed to complete bulk delete operations.");
    }
  };

  const handleBulkArchive = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => updateEvent(id, { status: 'archived' })));
      triggerToast('success', "Selected events archived.");
      setSelectedIds(new Set());
    } catch (err) {
      console.error("[Organizer] Failed to bulk archive events:", err);
      triggerToast('error', "Failed to archive selected events.");
    }
  };

  const handleBulkClose = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => updateEvent(id, { status: 'closed' })));
      triggerToast('success', "Selected event registrations closed.");
      setSelectedIds(new Set());
    } catch (err) {
      console.error("[Organizer] Failed to bulk close event registrations:", err);
      triggerToast('error', "Failed to close selected events.");
    }
  };

  // Memoized filters
  const filteredEvents = useMemo(() => {
    let list = [...events];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(e => 
        (e.title || '').toLowerCase().includes(q) ||
        (e.venue || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory !== 'All') {
      list = list.filter(e => (e.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // Status
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'published') {
        list = list.filter(e => e.status === 'open' || e.status === 'closed' || e.status === 'published');
      } else {
        list = list.filter(e => (e.status || '').toLowerCase() === selectedStatus.toLowerCase());
      }
    }

    // Date/Timeline
    if (selectedDate !== 'All') {
      list = list.filter(e => {
        if (!e.date) return false;
        if (selectedDate === 'Upcoming') {
          return e.date >= todayStr;
        }
        if (selectedDate === 'Past') {
          return e.date < todayStr;
        }
        return true;
      });
    }

    // Sort default newest
    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    return list;
  }, [events, searchQuery, selectedCategory, selectedStatus, selectedDate, todayStr]);

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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
            <div>
              <AxisMarker index="04" label="Management Studio" />
              <h1 className="text-display-lg font-light tracking-tight mt-6 text-primary">Studio</h1>
              <p className="text-body-lg text-secondary max-w-xl mt-4 font-light leading-relaxed">
                Premium workspace to orchestrate, analyze, and manage your published campus events.
              </p>
            </div>
            {/* Create FAB */}
            <Button onClick={() => navigate('/create-event')} className="select-none flex items-center gap-2">
              <Plus className="w-4.5 h-4.5" />
              <span>Create Event</span>
            </Button>
          </div>

          {/* METADATA STATISTICS ROW (Interactive sections with individual counts) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 py-6 border-y border-white/5 text-left font-ui select-none">
            {/* Drafts */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'draft' ? 'All' : 'draft')}
              className={cn(
                "group flex flex-col gap-1.5 p-4 border border-white/5 bg-[#141414]/10 hover:bg-[#141414]/30 cursor-pointer transition-all duration-300 relative",
                selectedStatus === 'draft' ? "border-accent/40 bg-accent/5" : ""
              )}
            >
              {selectedStatus === 'draft' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />}
              <span className="text-micro text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">Drafts</span>
              <span className="text-display-md font-light text-primary group-hover:text-white transition-colors">
                <CountingNumber value={stats.drafts} />
              </span>
            </div>
            
            {/* Published */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'published' ? 'All' : 'published')}
              className={cn(
                "group flex flex-col gap-1.5 p-4 border border-white/5 bg-[#141414]/10 hover:bg-[#141414]/30 cursor-pointer transition-all duration-300 relative",
                selectedStatus === 'published' ? "border-accent/40 bg-accent/5" : ""
              )}
            >
              {selectedStatus === 'published' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />}
              <span className="text-micro text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">Published</span>
              <span className="text-display-md font-light text-primary group-hover:text-white transition-colors">
                <CountingNumber value={stats.published} />
              </span>
            </div>

            {/* Live */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'live' ? 'All' : 'live')}
              className={cn(
                "group flex flex-col gap-1.5 p-4 border border-white/5 bg-[#141414]/10 hover:bg-[#141414]/30 cursor-pointer transition-all duration-300 relative",
                selectedStatus === 'live' ? "border-accent/40 bg-accent/5" : ""
              )}
            >
              {selectedStatus === 'live' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />}
              <span className="text-micro text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors text-red-400">Live</span>
              <span className="text-display-md font-light text-primary group-hover:text-white transition-colors">
                <CountingNumber value={stats.live} />
              </span>
            </div>

            {/* Completed */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'completed' ? 'All' : 'completed')}
              className={cn(
                "group flex flex-col gap-1.5 p-4 border border-white/5 bg-[#141414]/10 hover:bg-[#141414]/30 cursor-pointer transition-all duration-300 relative",
                selectedStatus === 'completed' ? "border-accent/40 bg-accent/5" : ""
              )}
            >
              {selectedStatus === 'completed' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />}
              <span className="text-micro text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">Completed</span>
              <span className="text-display-md font-light text-primary group-hover:text-white transition-colors">
                <CountingNumber value={stats.completed} />
              </span>
            </div>

            {/* Archived */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'archived' ? 'All' : 'archived')}
              className={cn(
                "group flex flex-col gap-1.5 p-4 border border-white/5 bg-[#141414]/10 hover:bg-[#141414]/30 cursor-pointer transition-all duration-300 relative",
                selectedStatus === 'archived' ? "border-accent/40 bg-accent/5" : ""
              )}
            >
              {selectedStatus === 'archived' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />}
              <span className="text-micro text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">Archived</span>
              <span className="text-display-md font-light text-primary group-hover:text-white transition-colors">
                <CountingNumber value={stats.archived} />
              </span>
            </div>
          </div>

          {/* CONTROL FILTERS BAR */}
          <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between pb-4 font-ui">
            {/* Input Search */}
            <div className="relative flex-grow max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search studio events..."
                className="w-full bg-[#111]/80 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent rounded-none"
              />
            </div>

            {/* Selects group */}
            <div className="flex flex-wrap items-center gap-4 text-xs select-none">
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
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-technical uppercase tracking-wider text-white/30">Timeline</span>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#111] border border-white/10 text-white/80 px-3 py-1.5 rounded-none focus:outline-none focus:border-accent cursor-pointer hover:bg-white/[0.02]"
                >
                  <option value="All">Any Time</option>
                  <option value="Upcoming">Upcoming Only</option>
                  <option value="Past">Past Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* BULK ACTIONS HEADER (Renders if rows are selected) */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-4 bg-accent/10 border border-accent/20 font-ui text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-technical uppercase tracking-wider text-accent">
                    {selectedIds.size} Events Selected
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBulkClose}
                    className="hover:text-accent font-technical uppercase tracking-wider transition-colors"
                  >
                    Close Entry
                  </button>
                  <button
                    onClick={handleBulkArchive}
                    className="hover:text-accent font-technical uppercase tracking-wider transition-colors"
                  >
                    Archive Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="text-red-400 hover:text-red-300 font-technical uppercase tracking-wider transition-colors"
                  >
                    Delete Selected
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MANAGEMENT ROWS GRID */}
          <div className="min-h-[40vh]">
            {loading ? (
              <div className="flex flex-col gap-3 font-ui">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 w-full bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex flex-col py-24 border border-dashed border-white/5 items-center justify-center text-center select-none font-ui">
                <span className="text-[0.6rem] font-technical text-white/20 uppercase tracking-[0.25em] mb-4">
                  Studio // Empty Archive
                </span>
                <p className="text-body-s text-secondary">
                  No events found matching your search. Use the "Create Event" floating button to add events.
                </p>
              </div>
            ) : (
              <div className="flex flex-col border border-white/5 divide-y divide-white/5">
                {/* Select All row */}
                <div className="flex items-center justify-between p-4 bg-white/[0.01] text-micro font-technical uppercase tracking-wider text-white/30 select-none">
                  <button 
                    onClick={handleSelectAll} 
                    className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none"
                  >
                    {selectedIds.size === filteredEvents.length ? (
                      <CheckSquare className="w-4 h-4 text-accent" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    <span>Select All Events ({filteredEvents.length})</span>
                  </button>
                  <span>Metrics & Operations</span>
                </div>

                {filteredEvents.map((event) => {
                  const capacity = parseInt(event.capacity) || 0;
                  const currentReg = parseInt(event.registeredCount) || 0;
                  const seatsRemaining = Math.max(capacity - currentReg, 0);
                  const isSelected = selectedIds.has(event.id);
                  
                  // Fill % analytics
                  const fillPercent = capacity > 0 ? Math.min(Math.round((currentReg / capacity) * 100), 100) : 0;
                  const mockViews = Math.max((currentReg * 3) + (parseInt(event.id.charCodeAt(0)) || 14), 18);

                  return (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className={cn(
                        "group relative flex flex-col lg:flex-row lg:items-center justify-between p-6 hover:bg-white/[0.02] cursor-pointer transition-all duration-300 font-ui text-left gap-6 lg:gap-12",
                        isSelected ? "bg-white/[0.01] border-l-2 border-accent pl-5.5" : ""
                      )}
                    >
                      {/* Left: Checkbox selector + Cover + Title stack */}
                      <div className="flex flex-grow items-start gap-4 lg:gap-6 min-w-0">
                        {/* Selector checkbox */}
                        <button
                          type="button"
                          onClick={(e) => handleSelectRow(event.id, e)}
                          className="shrink-0 p-1 text-white/40 hover:text-white transition-colors focus:outline-none pt-2.5"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4.5 h-4.5 text-accent" />
                          ) : (
                            <Square className="w-4.5 h-4.5" />
                          )}
                        </button>

                        {/* Event Cover Image */}
                        <div className="w-16 h-16 shrink-0 border border-white/10 overflow-hidden bg-[#111]">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10 text-[0.45rem] font-technical uppercase">
                              No image
                            </div>
                          )}
                        </div>

                        {/* Core text stack */}
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-[0.6rem] text-accent font-technical uppercase tracking-wider">
                              {event.category || "General"}
                            </span>
                            {renderStatusBadge(event.status)}
                          </div>
                          <h3 className="text-body-m font-light text-primary group-hover:text-white truncate">
                            {event.title}
                          </h3>
                          <div className="text-[0.62rem] text-white/30 uppercase tracking-widest font-technical flex flex-wrap gap-x-2">
                            <span>{formatDate(event.date)}</span>
                            <span>•</span>
                            <span>{event.venue || "TBA"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Center: Analytics metric widgets (flat typography) */}
                      <div className="flex flex-row md:flex-row md:items-center gap-8 lg:gap-10 shrink-0 text-left">
                        {/* Metrics Group: Fill status */}
                        <div className="flex flex-col gap-1 w-28 md:w-36">
                          <div className="flex justify-between text-micro text-white/30 uppercase tracking-wider font-technical">
                            <span>Fill Rate</span>
                            <span>{fillPercent}%</span>
                          </div>
                          {/* Progress Line */}
                          <div className="h-1 bg-white/5 relative overflow-hidden">
                            <div 
                              className={cn(
                                "absolute left-0 top-0 h-full transition-all duration-500",
                                fillPercent >= 100 ? "bg-red-500" : fillPercent >= 75 ? "bg-orange-400" : "bg-accent"
                              )} 
                              style={{ width: `${fillPercent}%` }} 
                            />
                          </div>
                          <span className="text-[0.6rem] text-white/20 font-technical uppercase">
                            {currentReg} / {capacity} registered
                          </span>
                        </div>

                        {/* Views placeholder */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-micro text-white/30 uppercase tracking-widest">Views</span>
                          <span className="text-body font-light text-primary">{mockViews}</span>
                        </div>

                        {/* Capacity seats remaining */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-micro text-white/30 uppercase tracking-widest">Remaining</span>
                          <span className="text-body font-light text-primary">{seatsRemaining}</span>
                        </div>
                      </div>

                      {/* Right: Quick action toolbar */}
                      <div className="flex items-center gap-2 mt-4 lg:mt-0 justify-end" onClick={(e) => e.stopPropagation()}>
                        {/* Publish (Only for Drafts) */}
                        {event.status === 'draft' && (
                          <button
                            type="button"
                            onClick={(e) => handlePublish(event, e)}
                            className="p-2 bg-accent/15 border border-accent/20 hover:bg-accent/25 hover:border-accent/40 text-accent transition-all rounded-none"
                            title="Publish Event"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit (Drafts, Published, Open, Closed) */}
                        {event.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={(e) => handleEditOpen(event, e)}
                            className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-all rounded-none"
                            title="Edit Event"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={(e) => handleDuplicate(event, e)}
                          className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-all rounded-none"
                          title="Duplicate Event"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* View Attendees */}
                        {event.status !== 'draft' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/organizer/events/${event.id}/attendees`);
                            }}
                            className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-all rounded-none"
                            title="Manage Attendees"
                          >
                            <Users className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Toggle Registration Close/Open (Only for active events) */}
                        {(event.status === 'open' || event.status === 'closed') && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleClose(event, e)}
                            className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-all rounded-none"
                            title={event.status === 'closed' ? "Open Registration" : "Close Registration"}
                          >
                            <ToggleRight className={cn("w-3.5 h-3.5", event.status === 'closed' ? "text-red-400 rotate-180" : "text-green-400")} />
                          </button>
                        )}

                        {/* Archive (Not for already archived events) */}
                        {event.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={(e) => handleArchive(event, e)}
                            className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-all rounded-none"
                            title="Archive Event"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View Analytics */}
                        <button
                          type="button"
                          onClick={(e) => handleViewAnalytics(event, e)}
                          className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-all rounded-none"
                          title="View Event Analytics"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(event.id, e)}
                          className="p-2 bg-red-950/20 border border-red-500/10 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-all rounded-none"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* EDIT EVENT MODAL: Premium Glassmorphism Drawer */}
          <AnimatePresence>
            {editingEvent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !formSaving && setEditingEvent(null)}
                  className="absolute inset-0 bg-[#090909]/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="bg-[#141414]/90 border border-white/10 backdrop-blur-2xl w-full max-w-xl h-auto max-h-[85vh] overflow-y-auto z-10 flex flex-col rounded-none shadow-[0_32px_60px_-16px_rgba(0,0,0,0.8)] relative font-ui"
                >
                  {/* Grain Layer */}
                  <div
                    className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
                  />

                  {/* Header */}
                  <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex flex-col text-left">
                      <span className="text-[0.6rem] font-technical uppercase tracking-[0.25em] text-white/30">Action // Edit Event</span>
                      <h2 className="text-body-l font-light text-primary mt-1">Configure Event Details</h2>
                    </div>
                    <button
                      type="button"
                      disabled={formSaving}
                      onClick={() => setEditingEvent(null)}
                      className="p-1 text-white/40 hover:text-white transition-colors focus:outline-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleEditSave} className="p-6 flex flex-col gap-5 text-left relative z-10">
                    {formError && (
                      <div className="text-xs text-red-400 font-technical uppercase border border-red-500/20 bg-red-950/20 px-4 py-2">
                        {formError}
                      </div>
                    )}

                    {/* Title */}
                    <div className="flex flex-col gap-2">
                      <label className="text-micro text-primary">Event Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent rounded-none transition-colors"
                        required
                        disabled={formSaving}
                      />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-2">
                      <label className="text-micro text-primary">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent rounded-none cursor-pointer"
                        required
                        disabled={formSaving}
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                      <label className="text-micro text-primary">Event Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent rounded-none transition-colors resize-none"
                        disabled={formSaving}
                      />
                    </div>

                    {/* Venue */}
                    <div className="flex flex-col gap-2">
                      <label className="text-micro text-primary">Venue Location</label>
                      <input
                        type="text"
                        value={editForm.venue}
                        onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                        className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent rounded-none transition-colors"
                        required
                        disabled={formSaving}
                      />
                    </div>

                    {/* Grid: Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-micro text-primary">Event Date</label>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent rounded-none transition-colors"
                          required
                          disabled={formSaving}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-micro text-primary">Event Time</label>
                        <input
                          type="time"
                          value={editForm.time}
                          onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent rounded-none transition-colors"
                          required
                          disabled={formSaving}
                        />
                      </div>
                    </div>

                    {/* Grid: Capacity & Deadline */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-micro text-primary">Seat Capacity</label>
                        <input
                          type="number"
                          value={editForm.capacity}
                          onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent rounded-none transition-colors"
                          required
                          disabled={formSaving}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-micro text-primary">Deadline Date</label>
                        <input
                          type="date"
                          value={editForm.registrationDeadline}
                          onChange={(e) => setEditForm({ ...editForm, registrationDeadline: e.target.value })}
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent rounded-none transition-colors"
                          required
                          disabled={formSaving}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-2">
                      <label className="text-micro text-primary">Status Override</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent rounded-none cursor-pointer"
                        required
                        disabled={formSaving}
                      >
                        <option value="draft">Draft</option>
                        <option value="open">Registration Open</option>
                        <option value="closed">Registration Closed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditingEvent(null)}
                        disabled={formSaving}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={formSaving}
                        size="sm"
                      >
                        {formSaving ? "Saving..." : "Save Details"}
                      </Button>
                    </div>
                  </form>
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
