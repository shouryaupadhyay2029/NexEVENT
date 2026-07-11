import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firestore";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { RevealSection, RevealItem, StandaloneReveal } from "../../../components/ui/RevealSection";

export const Statistics = () => {
  const [stats, setStats] = useState({
    students: "--",
    events: "--",
    clubs: "--",
    registrations: "--"
  });

  useEffect(() => {
    const fetchStats = async () => {
      let studentsVal = "--";
      let eventsVal = "--";
      let clubsVal = "--";
      let registrationsVal = "--";

      // 1. Fetch Clubs (Publicly readable)
      try {
        const clubsSnap = await getDocs(collection(db, "clubs"));
        clubsVal = clubsSnap.size;
      } catch (err) {
        console.warn("Could not fetch clubs count:", err);
      }

      // 2. Fetch Events (Publicly readable)
      try {
        const eventsSnap = await getDocs(collection(db, "events"));
        const eventsList = [];
        eventsSnap.forEach(d => eventsList.push(d.data()));
        const nonDeleted = eventsList.filter(e => e.status !== "deleted");
        // Count of all hosted (published or completed) events
        eventsVal = nonDeleted.filter(e => e.status === "published" || e.status === "open" || e.status === "closed" || e.status === "completed").length;
      } catch (err) {
        console.warn("Could not fetch events count:", err);
      }

      // 3. Fetch Users (Requires Authentication)
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const usersList = [];
        usersSnap.forEach(d => usersList.push(d.data()));
        studentsVal = usersList.filter(u => (u.role || "").toLowerCase().trim() === "student").length;
      } catch (err) {
        console.warn("Could not fetch students count (unauthenticated):", err);
      }

      // 4. Fetch Registrations (Requires Authentication)
      try {
        const regsSnap = await getDocs(collection(db, "registrations"));
        registrationsVal = regsSnap.size;
      } catch (err) {
        console.warn("Could not fetch registrations count (unauthenticated):", err);
      }

      setStats({
        students: studentsVal,
        events: eventsVal,
        clubs: clubsVal,
        registrations: registrationsVal
      });
    };

    fetchStats();
  }, []);

  const statsItems = [
    { value: stats.students, label: "Active Students", ref: "FIG. 06" },
    { value: stats.events, label: "Events Hosted", ref: "FIG. 07" },
    { value: stats.clubs, label: "Campus Clubs", ref: "FIG. 08" },
    { value: stats.registrations, label: "Total Registrations", ref: "FIG. 09" },
  ];

  return (
    <section className="w-full flex flex-col mb-32 pt-24">
      <StandaloneReveal margin="-5%">
        <AxisMarker index="05" label="Volume Metrics" />
      </StandaloneReveal>

      <RevealSection margin="-5%" staggerDelay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-8 max-w-[1200px] w-full justify-between">
          {statsItems.map((stat, index) => (
            <RevealItem key={stat.label} delay={index * 0.08}>
              <div className="flex flex-col text-left pr-4 relative group select-none">
                <span className="text-micro border-b border-border pb-4 mb-8">
                  {stat.ref}
                </span>
                <div className="text-display-l text-primary mb-6 font-light">
                  {stat.value}
                </div>
                <span className="text-micro">
                  {stat.label}
                </span>
              </div>
            </RevealItem>
          ))}
        </div>
      </RevealSection>
    </section>
  );
};
