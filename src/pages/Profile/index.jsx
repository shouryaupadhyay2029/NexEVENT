import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../../services/analyticsService';
import { useAuth } from '../../hooks/useAuth';
import { updateUser } from '../../services/userService';
import { getUserRegistrations } from '../../services/registrationService';
import { getAllEvents } from '../../services/eventService';
import { getUserActivities } from '../../services/notificationService';
import { PageTransition } from '../../components/layout/PageTransition';
import { PageContainer } from '../../components/layout/PageContainer';
import { SectionWrapper } from '../../components/layout/SectionWrapper';
import { AxisMarker } from '../../components/layout/AxisMarker';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, MapPin, Calendar, Clock, ChevronRight, X, User } from 'lucide-react';
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa';
import { cn } from '../../utils/cn';

// Easing curves
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
    const duration = 1200; // 1.2s transition
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Quad ease out transition
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

export const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    trackEvent("profile_view");
  }, []);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    college: '',
    branch: '',
    year: '',
    city: '',
    github: '',
    linkedin: '',
    portfolio: '',
    avatar: '',
    interests: '', // handled as comma-separated in form
  });

  const [formError, setFormError] = useState('');

  // Fetch registrations & resolve event details
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.uid) return;
      setLoadingEvents(true);
      try {
        const [regs, events, activeLogs] = await Promise.all([
          getUserRegistrations(user.uid),
          getAllEvents(),
          getUserActivities(user.uid, 20)
        ]);
        setRegistrations(regs);
        setActivities(activeLogs);

        const regIds = new Set(regs.map(r => r.eventId));
        const filtered = events.filter(e => regIds.has(e.id));
        // Sort by date descending (newest activity first)
        filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setRegisteredEvents(filtered);
      } catch (err) {
        console.error("Failed to load profile registrations: ", err);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Sync edit form with profile data when modal opens
  useEffect(() => {
    if (profile) {
      setEditForm({
        displayName: profile.displayName || user?.displayName || '',
        bio: profile.bio || '',
        college: profile.college || '',
        branch: profile.branch || '',
        year: profile.year || '',
        city: profile.city || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        portfolio: profile.portfolio || '',
        avatar: profile.avatar || user?.photoURL || '',
        interests: Array.isArray(profile.interests) ? profile.interests.join(', ') : '',
      });
    }
  }, [profile, user, isEditOpen]);

  // Calculate completeness progress percentage
  const getCompleteness = () => {
    if (!profile) return 0;
    const fields = [
      profile.avatar || profile.photoURL,
      profile.bio,
      profile.college,
      profile.branch,
      profile.year,
      profile.city,
      profile.github,
      profile.linkedin,
      profile.portfolio,
      Array.isArray(profile.interests) && profile.interests.length > 0
    ];
    const filledCount = fields.filter(Boolean).length;
    return filledCount * 10; // 10 fields = 10% each
  };

  // Calculate account age in days
  const getAccountAge = () => {
    if (!profile?.createdAt) return 0;
    const created = new Date(profile.createdAt);
    const diff = Math.abs(new Date() - created);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days || 1;
  };

  // Split date into human readable joined format
  const getJoinedDate = () => {
    if (!profile?.createdAt) return "October 2026";
    const d = new Date(profile.createdAt);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Form submit handler
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.displayName.trim()) {
      setFormError("Name is required.");
      return;
    }
    setIsSaving(true);
    setFormError('');
    try {
      const interestsArray = editForm.interests
        ? editForm.interests.split(',').map(item => item.trim()).filter(Boolean)
        : [];

      const payload = {
        displayName: editForm.displayName,
        bio: editForm.bio,
        college: editForm.college,
        branch: editForm.branch,
        year: editForm.year,
        city: editForm.city,
        github: editForm.github,
        linkedin: editForm.linkedin,
        portfolio: editForm.portfolio,
        avatar: editForm.avatar,
        interests: interestsArray,
      };

      await updateUser(user.uid, payload);
      await refreshProfile(user.uid);
      setIsEditOpen(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setFormError("Unable to save details. Connection refused.");
    } finally {
      setIsSaving(false);
    }
  };

  const completeness = getCompleteness();
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingCount = registeredEvents.filter(e => e.date && e.date >= todayStr).length;
  const completedCount = registeredEvents.filter(e => e.date && e.date < todayStr).length;

  return (
    <PageTransition>
      <PageContainer>
        <SectionWrapper className="max-w-5xl py-12 md:py-20 flex flex-col gap-16 relative">
          
          {/* PROFILE HEADER: Spacious, Editorial Stack */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start relative pb-12 border-b border-white/5">
            {/* Avatar block with magnetic trigger */}
            <div className="relative group/avatar cursor-pointer shrink-0" onClick={() => setIsOpen(false) || setIsEditOpen(true)}>
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border border-white/10 bg-[#141414] relative transition-all duration-500 group-hover/avatar:border-white/30">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-display text-white/20 uppercase">
                    {profile?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </div>
                )}
                {/* Dark premium hover mask */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white/80" />
                </div>
              </div>
              
              {/* Pulsing online marker */}
              <div className="absolute bottom-1 right-2 w-4.5 h-4.5 rounded-full bg-green-500 border-[3.5px] border-[#090909] shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
            </div>

            {/* Profile Core Data */}
            <div className="flex-grow flex flex-col gap-5 text-left font-ui">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-display-md font-light text-primary tracking-tight leading-none">{profile?.displayName || "Campus Student"}</h1>
                  <span className="text-[0.52rem] font-technical uppercase px-1.5 py-0.5 border border-white/10 bg-white/5 text-white/40 tracking-wider">
                    {profile?.role || "Student"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-micro text-white/30 tracking-wide uppercase">
                  <span>{user?.email}</span>
                  <span>•</span>
                  <span>Joined {getJoinedDate()}</span>
                </div>
              </div>

              {/* Bio & Details Grid */}
              <p className="text-body-s text-secondary/80 max-w-xl font-light leading-relaxed">
                {profile?.bio || "No description provided yet. Update your credentials to complete your campus profile."}
              </p>

              {/* Quick info row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-micro text-white/30 uppercase tracking-wider">
                {profile?.college && <span>{profile.college}</span>}
                {profile?.branch && <span>{profile.branch}</span>}
                {profile?.year && <span>Year {profile.year}</span>}
                {profile?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-white/20" />
                    {profile.city}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Profile Quick Trigger */}
            <Button variant="secondary" onClick={() => setIsEditOpen(true)} size="sm" className="md:ml-auto select-none">
              Edit Profile
            </Button>
          </div>

          {/* DYNAMIC PROGRESS / COMPLETENESS BAR */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="flex flex-col text-left">
              <span className="text-[0.65rem] font-technical uppercase tracking-[0.2em] text-white/30">Profile Status</span>
              <span className="text-body font-light text-secondary mt-1">Completeness Index</span>
            </div>
            <div className="col-span-3 flex items-center gap-6">
              <div className="flex-grow h-[2px] bg-white/5 relative overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-accent"
                  initial={{ width: '0%' }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 1.2, ease: EASE }}
                />
              </div>
              <span className="text-display-s font-light text-primary tracking-tighter w-12 text-right">
                {completeness}%
              </span>
            </div>
          </div>

          {/* STATISTICS ROW: Pure typographic horizontal columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/5 text-left font-ui">
            <div className="flex flex-col gap-1.5">
              <span className="text-micro text-white/30 uppercase tracking-widest">Registered</span>
              <span className="text-display-md font-light text-primary">
                <CountingNumber value={registrations.length} />
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-micro text-white/30 uppercase tracking-widest">Upcoming</span>
              <span className="text-display-md font-light text-primary">
                <CountingNumber value={upcomingCount} />
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-micro text-white/30 uppercase tracking-widest">Completed</span>
              <span className="text-display-md font-light text-primary">
                <CountingNumber value={completedCount} />
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-micro text-white/30 uppercase tracking-widest">Account Age</span>
              <span className="text-display-md font-light text-primary">
                <CountingNumber value={getAccountAge()} />
                <span className="text-body-s text-secondary ml-1 lowercase font-light">days</span>
              </span>
            </div>
          </div>

          {/* EDITORIAL SECTIONS BLOCK */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left font-ui">
            
            {/* Column 1: Academic & Social info */}
            <div className="flex flex-col gap-12">
              {/* Section: Academic */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.65rem] font-technical uppercase tracking-[0.2em] text-white/20">Section // 02.A</span>
                  <h3 className="text-body font-medium text-primary uppercase tracking-wider">Academic Record</h3>
                </div>
                <div className="flex flex-col gap-4 text-body-s text-secondary/80 font-light leading-relaxed">
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-white/30 uppercase tracking-widest mb-0.5">Institution</span>
                    <span>{profile?.college || "Unassigned"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-white/30 uppercase tracking-widest mb-0.5">Department / Branch</span>
                    <span>{profile?.branch || "Unassigned"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-white/30 uppercase tracking-widest mb-0.5">Year of Study</span>
                    <span>{profile?.year ? `Year ${profile.year}` : "Unassigned"}</span>
                  </div>
                </div>
              </div>

              {/* Section: Social links */}
              {(profile?.github || profile?.linkedin || profile?.portfolio) && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.65rem] font-technical uppercase tracking-[0.2em] text-white/20">Section // 02.B</span>
                    <h3 className="text-body font-medium text-primary uppercase tracking-wider">Social Grid</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {profile.github && (
                      <a
                        href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-body-s text-secondary hover:text-white transition-colors duration-200"
                      >
                        <FaGithub className="w-4 h-4 text-white/30" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-body-s text-secondary hover:text-white transition-colors duration-200"
                      >
                        <FaLinkedin className="w-4 h-4 text-white/30" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {profile.portfolio && (
                      <a
                        href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-body-s text-secondary hover:text-white transition-colors duration-200"
                      >
                        <FaGlobe className="w-4 h-4 text-white/30" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Column 2 & 3: Bio Details & Recent Activity */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-12">
              {/* Section: Bio / About */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.65rem] font-technical uppercase tracking-[0.2em] text-white/20">Section // 02.C</span>
                  <h3 className="text-body font-medium text-primary uppercase tracking-wider">Biography / Executive Summary</h3>
                </div>
                <p className="text-body-l font-light text-secondary/80 leading-relaxed whitespace-pre-wrap">
                  {profile?.bio || "No summary written yet. Click 'Edit Profile' to add a custom bio highlighting your goals, skills, and academic pursuits."}
                </p>
                
                {/* Interests chips */}
                {Array.isArray(profile?.interests) && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 border border-white/5 bg-white/[0.02] text-[0.6rem] font-technical text-white/50 uppercase tracking-wider rounded-none"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Section: Recent Activity */}
              <div className="flex flex-col gap-5 pt-8 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.65rem] font-technical uppercase tracking-[0.2em] text-white/20">Section // 02.D</span>
                  <h3 className="text-body font-medium text-primary uppercase tracking-wider">Recent Activity Feed</h3>
                </div>

                {loadingEvents ? (
                  <div className="h-16 w-full bg-white/5 animate-pulse" />
                ) : activities.length === 0 ? (
                  <p className="text-body-s text-white/30 font-light">No recent event activity logged in this archive.</p>
                ) : (
                  <div className="flex flex-col border border-white/5 divide-y divide-white/5">
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        onClick={() => act.metadata?.eventId && navigate(`/events/${act.metadata.eventId}`)}
                        className={cn(
                          "group flex items-center justify-between p-4.5 hover:bg-white/[0.02] transition-all duration-300",
                          act.metadata?.eventId ? "cursor-pointer" : "cursor-default"
                        )}
                      >
                        <div className="flex flex-col gap-1 text-left">
                          <span className="text-[0.55rem] text-white/30 font-technical uppercase tracking-wider">
                            {act.createdAt ? new Date(act.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                          <h4 className="text-body-s font-light text-primary group-hover:text-white transition-colors duration-200">
                            {act.action}
                          </h4>
                        </div>
                        {act.metadata?.eventId && (
                          <div className="flex items-center gap-2">
                            <span className="text-[0.52rem] text-accent font-technical uppercase tracking-wider">
                              View Event
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all duration-300" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* EDIT PROFILE MODAL: Premium Glassmorphic Overlay */}
          <AnimatePresence>
            {isEditOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !isSaving && setIsEditOpen(false)}
                  className="absolute inset-0 bg-[#090909]/80 backdrop-blur-md"
                />

                {/* Modal box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="bg-[#141414]/90 border border-white/10 backdrop-blur-2xl w-full max-w-xl h-auto max-h-[85vh] overflow-y-auto z-10 flex flex-col rounded-none shadow-[0_32px_60px_-16px_rgba(0,0,0,0.8)] relative font-ui"
                >
                  {/* Grain layer */}
                  <div
                    className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
                  />

                  {/* Header */}
                  <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex flex-col text-left">
                      <span className="text-[0.6rem] font-technical uppercase tracking-[0.25em] text-white/30">Action // Edit Profile</span>
                      <h2 className="text-body-l font-light text-primary mt-1">Configure Credentials</h2>
                    </div>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setIsEditOpen(false)}
                      className="p-1 text-white/40 hover:text-white focus:outline-none transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleEditSave} className="p-6 flex flex-col gap-6 text-left relative z-10">
                    {formError && (
                      <div className="text-xs text-red-400 font-technical uppercase border border-red-500/20 bg-red-950/20 px-4 py-2">
                        {formError}
                      </div>
                    )}

                    {/* Input: Display Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-micro text-primary">Full Name</label>
                      <input
                        type="text"
                        value={editForm.displayName}
                        onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                        className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                        required
                        disabled={isSaving}
                      />
                    </div>

                    {/* Input: Profile Avatar URL */}
                    <div className="flex flex-col gap-2">
                      <label className="text-micro text-primary">Profile Picture URL</label>
                      <input
                        type="url"
                        value={editForm.avatar}
                        onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                        disabled={isSaving}
                      />
                    </div>

                    {/* Input: Bio */}
                    <div className="flex flex-col gap-2">
                      <label className="text-micro text-primary">Biography Summary</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={3}
                        className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors resize-none"
                        disabled={isSaving}
                      />
                    </div>

                    {/* Grid: Academic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-micro text-primary">College / Institution</label>
                        <input
                          type="text"
                          value={editForm.college}
                          onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-micro text-primary">Department / Branch</label>
                        <input
                          type="text"
                          value={editForm.branch}
                          onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    {/* Grid: Study Year & City */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-micro text-primary">Year of Study</label>
                        <input
                          type="text"
                          value={editForm.year}
                          onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                          placeholder="e.g. 3"
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-micro text-primary">City Location</label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          placeholder="e.g. New Delhi"
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    {/* Social links */}
                    <div className="flex flex-col gap-4 pt-3 border-t border-white/5">
                      <span className="text-micro text-white/30 uppercase tracking-widest">Web / Social URLs</span>
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={editForm.github}
                          onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                          placeholder="GitHub handle or full URL"
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                          disabled={isSaving}
                        />
                        <input
                          type="text"
                          value={editForm.linkedin}
                          onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                          placeholder="LinkedIn handle or full URL"
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                          disabled={isSaving}
                        />
                        <input
                          type="text"
                          value={editForm.portfolio}
                          onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })}
                          placeholder="Portfolio personal site URL"
                          className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    {/* Input: Interests/Skills */}
                    <div className="flex flex-col gap-2">
                      <label className="text-micro text-primary">Interests / Skills (Comma-separated)</label>
                      <input
                        type="text"
                        value={editForm.interests}
                        onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                        placeholder="e.g. UX Design, AI, Web Development"
                        className="w-full bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
                        disabled={isSaving}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditOpen(false)}
                        disabled={isSaving}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving}
                        size="sm"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>

                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </SectionWrapper>
      </PageContainer>
    </PageTransition>
  );
};
