import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getEvent } from '../../services/eventService';
import { 
  subscribeToEventRegistrations, 
  checkInAttendee, 
  cancelRegistration,
  checkInByTicket,
  checkInByPassToken
} from '../../services/registrationService';
import { trackEvent } from '../../services/analyticsService';
import { PageTransition } from '../../components/layout/PageTransition';
import { PageContainer } from '../../components/layout/PageContainer';
import { SectionWrapper } from '../../components/layout/SectionWrapper';
import { AxisMarker } from '../../components/layout/AxisMarker';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, ArrowLeft, Download, 
  Printer, CheckCircle2, ChevronLeft, ChevronRight, UserCheck,
  Camera, XCircle
} from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';

const PAGE_SIZE = 10;

export const Attendees = () => {
  const { eventId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();

  // Main State
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All | Checked In | Not Checked In
  const [sortOrder, setSortOrder] = useState('Newest'); // Newest | Oldest
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set()); // Sets of registrant userId
  // Scanner State
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(''); // 'Invalid Ticket' | 'Already Checked In' | 'Wrong Event' | 'Registration Not Found'
  const [scannedAttendee, setScannedAttendee] = useState(null); // success scan record
  const [cameraLoading, setCameraLoading] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadJsQR = () => {
    return new Promise((resolve) => {
      if (window.jsQR) {
        resolve(window.jsQR);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
      script.onload = () => resolve(window.jsQR);
      document.body.appendChild(script);
    });
  };

  const startScanner = async () => {
    setScanning(true);
    setScanError('');
    setScannedAttendee(null);
    setCameraLoading(true);

    try {
      const jsQR = await loadJsQR();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        await videoRef.current.play();
      }
      setCameraLoading(false);

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      const scanLoop = () => {
        if (!streamRef.current || !videoRef.current) return;

        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            handleScanResult(code.data);
            return;
          }
        }
        if (streamRef.current && streamRef.current.active) {
          requestAnimationFrame(scanLoop);
        }
      };

      requestAnimationFrame(scanLoop);
    } catch (err) {
      console.error("Camera startup failed:", err);
      setScanError("Camera access denied or device unsupported.");
      setCameraLoading(false);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
    setScanError('');
    setScannedAttendee(null);
  };

  const handleScanResult = async (data) => {
    let ticketId = "";
    let scannedUserId = "";
    let scannedEventId = "";
    let passToken = "";

    // ── PRIMARY PATH: new secure passToken QR format ─────────────────────────
    // QR payload: { v: 1, type: "nexevent_pass", token: "nxp_<UUID>" }
    try {
      const payload = JSON.parse(data);

      if (payload.type === "nexevent_pass" && payload.token) {
        passToken = payload.token;

        if (!passToken.startsWith("nxp_")) {
          setScanError("MALFORMED_QR");
          return;
        }

        try {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }

          const result = await checkInByPassToken(passToken, eventId, user.uid);
          const matchedAttendee = attendees.find(a => a.passToken === passToken) ||
            attendees.find(a => a.userId === result.userId) ||
            { ...result, studentName: result.userName || result.userId };
          setScannedAttendee(matchedAttendee);
          triggerToast('success', `${matchedAttendee.studentName || 'Attendee'} checked in present.`);
        } catch (e) {
          const msg = e.message || "";
          if (msg.startsWith("WRONG_EVENT")) setScanError("Wrong Event");
          else if (msg.startsWith("CANCELLED_PASS")) setScanError("Cancelled Pass");
          else if (msg.startsWith("ALREADY_CHECKED_IN")) setScanError("Already Checked In");
          else if (msg.startsWith("UNKNOWN_TOKEN")) setScanError("Registration Not Found");
          else if (msg.startsWith("MALFORMED_QR")) setScanError("Invalid Ticket");
          else setScanError(e.message || "Check-in failed.");
        }
        return;
      }

      // ── LEGACY PATH: old QR format { ticketId, eventId, userId } ─────────
      ticketId = payload.ticketId;
      scannedEventId = payload.eventId;
      scannedUserId = payload.userId;
    } catch {
      // ── LEGACY STRING FALLBACK: "userId_eventId" format ──────────────────
      const parts = data.split('_');
      if (parts.length === 2) {
        scannedUserId = parts[0];
        scannedEventId = parts[1];
      } else {
        setScanError("Invalid Ticket");
        return;
      }
    }

    // ── LEGACY VALIDATION ────────────────────────────────────────────────────
    if (scannedEventId !== eventId) {
      setScanError("Wrong Event");
      return;
    }

    const attendee = attendees.find(a =>
      (ticketId && a.ticketId === ticketId) ||
      (!ticketId && a.userId === scannedUserId)
    );

    if (!attendee) {
      setScanError("Registration Not Found");
      return;
    }

    if (attendee.checkedIn) {
      setScanError("Already Checked In");
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (ticketId) {
        await checkInByTicket(scannedUserId, eventId, ticketId, user.uid);
      } else {
        await checkInAttendee(scannedUserId, eventId, user.uid);
      }
      setScannedAttendee(attendee);
      triggerToast('success', `${attendee.studentName} checked in present.`);
    } catch (e) {
      console.error("Checkin fail:", e);
      setScanError(e.message || "Failed to update check-in status.");
    }
  };

  // Load Event and check authorization
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const eventData = await getEvent(eventId);
        if (!eventData) {
          triggerToast('error', "Target event could not be found.");
          setLoading(false);
          return;
        }

        const isCreator = eventData.creatorId === user?.uid;
        const isAdmin = profile?.role === 'admin';
        
        if (!isCreator && !isAdmin) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setEvent(eventData);
        setAuthorized(true);

        // Subscribe to registrations
        const unsubscribe = subscribeToEventRegistrations(eventId, (list) => {
          setAttendees(list);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Access verification error:", err);
        setAuthorized(false);
        setLoading(false);
      }
    };

    if (user?.uid && profile) {
      verifyAccess();
    }
  }, [eventId, user, profile]);

  // Dynamic Live Counts
  const stats = useMemo(() => {
    const registered = attendees.length;
    const checkedIn = attendees.filter(a => a.checkedIn).length;
    const capacity = event?.capacity || 0;
    const remaining = Math.max(capacity - registered, 0);
    const attendanceRate = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;

    return { registered, checkedIn, remaining, capacity, attendanceRate };
  }, [attendees, event]);

  // Search & Filter Operations
  const filteredAttendees = useMemo(() => {
    let list = [...attendees];

    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a => 
        (a.studentName || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.branch || '').toLowerCase().includes(q) ||
        (a.college || '').toLowerCase().includes(q) ||
        `${a.userId}_${eventId}`.toLowerCase().includes(q)
      );
    }

    // 2. Status Filters
    if (statusFilter === 'Checked In') {
      list = list.filter(a => a.checkedIn);
    } else if (statusFilter === 'Not Checked In') {
      list = list.filter(a => !a.checkedIn);
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortOrder === 'Newest') {
        return (b.registeredAt || '').localeCompare(a.registeredAt || '');
      } else {
        return (a.registeredAt || '').localeCompare(b.registeredAt || '');
      }
    });

    return list;
  }, [attendees, searchQuery, statusFilter, sortOrder, eventId]);

  // Paginated List
  const paginatedAttendees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAttendees.slice(start, start + PAGE_SIZE);
  }, [filteredAttendees, currentPage]);

  const totalPages = Math.ceil(filteredAttendees.length / PAGE_SIZE) || 1;

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOrder]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopScanner();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Table Row Selection Helper
  const handleSelectRow = (userId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedAttendees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedAttendees.map(a => a.userId)));
    }
  };

  // 1. Check-in Single Attendee
  const handleCheckIn = async (userId) => {
    try {
      await checkInAttendee(userId, eventId, user.uid);
      triggerToast('success', "Attendee check-in verified successfully.");
    } catch (e) {
      console.error("[Attendees] Failed to check in attendee:", e);
      triggerToast('error', "Failed to check in attendee.");
    }
  };

  // 2. Bulk Check-in
  const handleBulkCheckIn = async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map(uid => checkInAttendee(uid, eventId, user.uid))
      );
      setSelectedIds(new Set());
      triggerToast('success', `Checked in ${selectedIds.size} attendees.`);
    } catch (e) {
      console.error("[Attendees] Failed to bulk check-in:", e);
      triggerToast('error', "Some check-in updates failed.");
    }
  };

  const handleBulkRemove = async () => {
    if (selectedIds.size === 0) return;
    await confirm({
      title: 'Cancel Registrations',
      message: `Warning: Are you sure you want to cancel registrations for the ${selectedIds.size} selected students? This will reclaim seat capacity.`,
      variant: 'danger',
      confirmText: 'Cancel Registrations',
      cancelText: 'Keep Registrations',
      onConfirm: async () => {
        try {
          const uids = Array.from(selectedIds);
          await Promise.all(
            uids.map(uid => cancelRegistration(`${uid}_${eventId}`, "organizer"))
          );
          uids.forEach(_uid => {
            trackEvent("registration_cancelled", {
              event_id: eventId,
              actor_role: "organizer"
            });
          });
          setSelectedIds(new Set());
          triggerToast('success', "Selected registrations removed.");
        } catch (e) {
          console.error("[Attendees] Failed to remove bookings:", e);
          triggerToast('error', "Failed to remove some bookings.");
          throw e;
        }
      }
    });
  };

  // 4. Export CSV
  const handleExportCSV = () => {
    if (filteredAttendees.length === 0) {
      triggerToast('error', "No attendee logs to export.");
      return;
    }

    const headers = ["Student Name", "Email", "College", "Branch", "Ticket ID", "Registration Time", "Check-in Status"];
    const rows = filteredAttendees.map(att => [
      `"${(att.studentName || 'Unknown Student').replace(/"/g, '""')}"`,
      `"${(att.email || '').replace(/"/g, '""')}"`,
      `"${(att.college || 'N/A').replace(/"/g, '""')}"`,
      `"${(att.branch || 'N/A').replace(/"/g, '""')}"`,
      `"${(att.ticketId || 'N/A').replace(/"/g, '""')}"`,
      `"${new Date(att.registeredAt).toLocaleString()}"`,
      att.checkedIn ? "Present" : "Absent"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendee_registry_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('success', "CSV export completed successfully.");
  };

  // 5. Print List (Future-ready browser native)
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border border-white/20 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <PageTransition>
        <PageContainer>
          <SectionWrapper className="min-h-[85vh] flex flex-col items-center justify-center text-center font-ui py-24">
            <div className="border border-white/10 p-12 max-w-xl bg-[#111] flex flex-col items-center relative select-none">
              <span className="text-micro text-accent font-technical uppercase tracking-widest mb-4">403 Access Denied</span>
              <h2 className="text-display-md text-primary font-light mb-6">Unauthorized Action</h2>
              <p className="text-body-s text-secondary leading-relaxed mb-8">
                You are not mapped as the coordinator for this event assignment. Attempting unauthorized retrieval is logged.
              </p>
              <Button variant="secondary" onClick={() => navigate('/organizer')} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Studio</span>
              </Button>
            </div>
          </SectionWrapper>
        </PageContainer>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageContainer>
        <SectionWrapper className="max-w-7xl py-12 md:py-20 flex flex-col gap-12 text-left relative font-ui">
          
          {/* HEADER BAR */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => navigate('/organizer')}
                className="text-micro text-accent uppercase tracking-widest font-technical flex items-center gap-1.5 focus:outline-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Studio</span>
              </button>
              <AxisMarker index="05" label="Attendee Registry CRM" />
              <h1 className="text-display-lg font-light tracking-tight mt-2 text-primary">{event?.title}</h1>
              <p className="text-body-m text-secondary max-w-xl font-light">
                Monitor attendee registrations, execute digital badge check-ins, and export CSV logs.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={startScanner} 
                className="flex items-center gap-2 border-accent/20 bg-accent/5 hover:bg-accent/10 text-accent"
              >
                <Camera className="w-4 h-4" />
                <span>Scan QR</span>
              </Button>
              <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                <span>Print Registry</span>
              </Button>
              <Button onClick={handleExportCSV} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* LIVE COUNTERS PANEL */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/5 font-ui">
            <div className="flex flex-col gap-1">
              <span className="text-micro text-white/30 uppercase tracking-widest">Registered</span>
              <span className="text-display-md font-light text-primary">{stats.registered}</span>
              <span className="text-[10px] text-white/20 font-technical uppercase">Capacity Cap: {stats.capacity}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-micro text-white/30 uppercase tracking-widest">Checked In</span>
              <span className="text-display-md font-light text-green-400">{stats.checkedIn}</span>
              <span className="text-[10px] text-white/20 font-technical uppercase">Attendees Present</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-micro text-white/30 uppercase tracking-widest">Remaining Seats</span>
              <span className="text-display-md font-light text-accent">{stats.remaining}</span>
              <span className="text-[10px] text-white/20 font-technical uppercase">Open Entry slots</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-micro text-white/30 uppercase tracking-widest">Attendance %</span>
              <span className="text-display-md font-light text-primary">{stats.attendanceRate}%</span>
              <span className="text-[10px] text-white/20 font-technical uppercase">Conversion Rate</span>
            </div>
          </div>

          {/* SEARCH & FILTERS CONTROLS */}
          <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between pb-2">
            
            {/* Search inputs */}
            <div className="relative flex-grow max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, college, branch, reg ID..."
                className="w-full bg-[#111]/80 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent rounded-none"
              />
            </div>

            {/* Filter actions */}
            <div className="flex flex-wrap items-center gap-4 text-xs select-none">
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-technical uppercase tracking-wider text-white/30">Check-in Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#111] border border-white/10 text-white/80 px-3 py-1.5 rounded-none focus:outline-none cursor-pointer hover:bg-white/[0.02]"
                >
                  <option value="All">All Registrants</option>
                  <option value="Checked In">Checked In Only</option>
                  <option value="Not Checked In">Not Checked In Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-technical uppercase tracking-wider text-white/30">Registry Sort</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-[#111] border border-white/10 text-white/80 px-3 py-1.5 rounded-none focus:outline-none cursor-pointer hover:bg-white/[0.02]"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                </select>
              </div>
            </div>

          </div>

          {/* BULK OPERATIONS PANEL */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex flex-col sm:flex-row items-center justify-between p-4 bg-accent/5 border border-accent/20 text-xs gap-4"
              >
                <span className="font-technical uppercase text-accent tracking-wider font-semibold">
                  [{selectedIds.size}] Attendees Selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkCheckIn}
                    className="px-3 py-1.5 bg-green-950/20 border border-green-500/20 hover:bg-green-950/40 text-green-400 font-technical uppercase transition-colors"
                  >
                    Mark Present
                  </button>
                  <button
                    onClick={handleBulkRemove}
                    className="px-3 py-1.5 bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 text-red-400 font-technical uppercase transition-colors"
                  >
                    Remove Selected
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="px-3 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 text-white/70 font-technical uppercase transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TABLE LOGS REGISTRY */}
          <div className="flex flex-col border border-white/5 divide-y divide-white/5">
            {/* Header row */}
            <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white/[0.01] text-micro font-technical uppercase tracking-wider text-white/30 select-none">
              <div className="w-[5%] flex items-center">
                <input 
                  type="checkbox"
                  checked={paginatedAttendees.length > 0 && selectedIds.size === paginatedAttendees.length}
                  onChange={handleSelectAll}
                  className="rounded-none border-white/20 bg-[#111] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </div>
              <span className="w-[18%]">Student Name</span>
              <span className="w-[18%]">Email Address</span>
              <span className="w-[12%]">College Campus</span>
              <span className="w-[12%]">Branch / Dept</span>
              <span className="w-[15%]">Ticket ID</span>
              <span className="w-[10%]">Reg Date</span>
              <span className="w-[10%] text-right">Verification Gate</span>
            </div>

            {filteredAttendees.length === 0 ? (
              <div className="py-24 text-center text-secondary text-body-s font-light border-white/5">
                No matching attendee logs found in this registry.
              </div>
            ) : (
              paginatedAttendees.map((att) => {
                const isSelected = selectedIds.has(att.userId);
                return (
                  <div key={att.userId} className="flex flex-col lg:flex-row lg:items-center justify-between p-6 hover:bg-white/[0.01] gap-4 lg:gap-0 font-ui">
                    
                    {/* Selector Column */}
                    <div className="w-full lg:w-[5%] flex items-center">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(att.userId)}
                        className="rounded-none border-white/20 bg-[#111] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                    </div>

                    {/* Name column */}
                    <div className="w-full lg:w-[18%] flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-white/10 flex items-center justify-center font-display text-xs uppercase text-primary overflow-hidden shrink-0">
                        {att.avatar ? <img src={att.avatar} alt={att.studentName} className="w-full h-full object-cover" /> : att.studentName[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-body-s text-primary font-light truncate">{att.studentName}</span>
                        <span className="text-[8px] text-white/25 font-mono truncate lg:hidden">{att.userId}_{eventId}</span>
                      </div>
                    </div>

                    {/* Email */}
                    <span className="w-full lg:w-[18%] text-xs text-white/50 font-light truncate select-all">{att.email}</span>

                    {/* College */}
                    <span className="w-full lg:w-[12%] text-xs text-white/50 font-light truncate">{att.college}</span>

                    {/* Branch */}
                    <span className="w-full lg:w-[12%] text-xs text-white/50 font-light truncate">{att.branch}</span>

                    {/* Ticket ID */}
                    <span className="w-full lg:w-[15%] text-xs font-mono text-white/40 truncate select-all">{att.ticketId || "N/A"}</span>

                    {/* Reg Date */}
                    <span className="w-full lg:w-[10%] text-xs text-white/30 font-technical uppercase">
                      {new Date(att.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>

                    {/* Check In Actions */}
                    <div className="w-full lg:w-[10%] flex items-center justify-start lg:justify-end gap-3.5">
                      {att.checkedIn ? (
                        <span className="text-[10px] font-technical uppercase tracking-wider text-green-400 bg-green-950/20 border border-green-500/20 px-2 py-1 flex items-center gap-1 leading-none select-none">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(att.userId)}
                          className="text-[10px] font-technical uppercase tracking-widest text-accent hover:text-white bg-accent/5 border border-accent/15 hover:bg-accent hover:border-accent px-3 py-1.5 transition-all select-none focus:outline-none"
                        >
                          Verify Entry
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* PAGINATION PANEL */}
          {filteredAttendees.length > 0 && (
            <div className="flex items-center justify-between text-xs font-technical uppercase tracking-wider select-none pt-4 border-t border-white/5">
              <span className="text-white/30">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredAttendees.length)} of {filteredAttendees.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 border border-white/5 bg-white/[0.02]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TOAST FEEDBACK NOTIFICATIONS */}
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
                <span className="text-[0.65rem] font-technical uppercase tracking-wider text-white/40">{toast.type}</span>
                <span className="text-xs font-ui tracking-wide">{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* QR CHECK-IN SCANNER MODAL */}
          <AnimatePresence>
            {scanning && (() => {
              const EASE = [0.16, 1, 0.3, 1];
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={stopScanner}
                    className="absolute inset-0 bg-[#090909]/90 backdrop-blur-md"
                  />

                  {/* Scanner Content container */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="bg-[#141414]/95 border border-white/10 w-full max-w-md p-6 z-10 flex flex-col gap-6 rounded-none shadow-[0_32px_60px_-16px_rgba(0,0,0,0.8)] relative font-ui text-center"
                  >
                    {/* Style Injector */}
                    <style>{`
                      @keyframes scanLaser {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                    `}</style>

                    {/* Grain Layer */}
                    <div
                      className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
                    />

                    {/* Header */}
                    <div className="flex justify-between items-center relative z-10 border-b border-white/5 pb-4">
                      <div className="flex flex-col text-left">
                        <span className="text-[0.55rem] font-technical uppercase tracking-[0.2em] text-accent">Verify Gate // Camera active</span>
                        <h3 className="text-body-l font-light text-primary mt-0.5">Attendee QR Verification</h3>
                      </div>
                      <button
                        type="button"
                        onClick={stopScanner}
                        className="p-1 text-white/40 hover:text-white transition-colors focus:outline-none"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Scanner body */}
                    <div className="relative aspect-square w-full bg-black border border-white/5 overflow-hidden flex items-center justify-center">
                      
                      {/* Video Camera */}
                      <video 
                        ref={videoRef}
                        className={cn(
                          "w-full h-full object-cover",
                          (scannedAttendee || scanError || cameraLoading) ? "opacity-20" : "opacity-90"
                        )}
                      />

                      {/* Scanning Target Box indicator */}
                      {!scannedAttendee && !scanError && !cameraLoading && (
                        <div className="absolute inset-12 border border-white/10 flex items-center justify-center select-none pointer-events-none">
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent" />
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent" />
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent" />
                          
                          {/* Laser pulse line */}
                          <div className="w-full h-[1.5px] bg-accent/80 absolute" style={{ animation: 'scanLaser 2s linear infinite' }} />
                          <span className="text-[9px] font-technical uppercase text-white/30 tracking-widest bg-black/60 px-2 py-0.5">Align Ticket QR</span>
                        </div>
                      )}

                      {/* Camera Loading Overlay */}
                      {cameraLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-6 h-6 border border-white/20 border-t-transparent rounded-full animate-spin" />
                          <span className="text-micro font-technical uppercase text-white/30 tracking-widest">Initializing Lens...</span>
                        </div>
                      )}

                      {/* Error screen check */}
                      {scanError && (
                        <div className="absolute inset-0 bg-red-950/20 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none">
                          <XCircle className="w-12 h-12 text-red-500 mb-4 animate-bounce" strokeWidth={1.5} />
                          <h4 className="text-body-m font-medium text-red-400 font-technical uppercase tracking-wider">{scanError}</h4>
                          <p className="text-xs text-white/40 max-w-xs mt-2 font-light">
                            {scanError === "Wrong Event" && "Scanned ticket registry belongs to a different schedule configuration."}
                            {scanError === "Invalid Ticket" && "QR payload does not hold a verifiable NEX-PASS format sequence."}
                            {scanError === "Registration Not Found" && "No registration matches found for this student user ID."}
                            {scanError === "Already Checked In" && "Verification canceled. Ticket was already scanned for present gate admission."}
                          </p>
                          <button
                            onClick={startScanner}
                            className="mt-6 px-4 py-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-technical uppercase text-micro tracking-widest transition-colors focus:outline-none"
                          >
                            Rescan QR
                          </button>
                        </div>
                      )}

                      {/* Success screen check */}
                      {scannedAttendee && (
                        <div className="absolute inset-0 bg-green-950/20 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none">
                          <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" strokeWidth={1.5} />
                          <span className="text-micro text-green-400 font-technical uppercase tracking-widest border border-green-500/20 bg-green-950/30 px-2 py-0.5 mb-3 leading-none">
                            Entry Verified
                          </span>
                          <h4 className="text-body-l font-light text-primary">{scannedAttendee.studentName}</h4>
                          <span className="text-[10px] text-white/40 font-mono mt-1">
                            {scannedAttendee.email}
                          </span>
                          <div className="flex flex-col gap-0.5 mt-4 text-[10px] text-white/40">
                            <span>Campus: {scannedAttendee.college}</span>
                            <span>Dept: {scannedAttendee.branch}</span>
                          </div>
                          <button
                            onClick={startScanner}
                            className="mt-6 px-4 py-2 border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-technical uppercase text-micro tracking-widest transition-colors focus:outline-none"
                          >
                            Scan Next
                          </button>
                        </div>
                      )}

                    </div>

                    <div className="flex justify-center border-t border-white/5 pt-4">
                      <Button variant="secondary" onClick={stopScanner} size="sm">
                        Close Scanner
                      </Button>
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
