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
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';

export const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'registered' | 'past'
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);
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

                    <div className="flex items-center justify-end mt-4 md:mt-0 gap-4">
                      {/* Badge indicating status */}
                      <span className="text-[0.6rem] font-technical uppercase px-2 py-0.5 border border-white/10 bg-white/5 text-white/50 tracking-wider">
                        Registered
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionWrapper>
      </PageContainer>
    </PageTransition>
  );
};
