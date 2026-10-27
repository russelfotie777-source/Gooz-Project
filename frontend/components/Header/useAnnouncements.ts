"use client";

import { useEffect, useState } from "react";
import { getAnnouncements } from "@/lib/api";
import type { Announcement } from "@/lib/types";

// Dismissing the announcement bar hides it for the rest of the browser
// session (not forever) — sessionStorage, not localStorage.
const ANNOUNCEMENT_DISMISSED_KEY = "shopitech-announcement-dismissed";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsDismissed, setAnnouncementsDismissed] = useState(false);

  useEffect(() => {
    getAnnouncements().then(setAnnouncements).catch(() => {});
    setAnnouncementsDismissed(sessionStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY) === "1");
  }, []);

  function dismissAnnouncements() {
    setAnnouncementsDismissed(true);
    sessionStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, "1");
  }

  return { announcements, announcementsDismissed, dismissAnnouncements };
}
