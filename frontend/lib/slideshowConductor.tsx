"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

// Coordinates the automatic photo slideshows of the product cards inside
// one carousel row: instead of every visible card changing photo at the
// same instant (visually heavy), the row hands a "turn" to one card at a
// time, left to right. Each tick, exactly one card in the row advances.
//
// On a phone a row usually has a single card in focus, so that card simply
// gets every turn — same behavior as before for "En solde"/"Populaires".

const TICK_MS = 2200;

interface Entry {
  element: HTMLElement;
  advance: () => void;
  eligible: boolean;
}

interface Conductor {
  /** Returns the unregister function. */
  register: (id: string, element: HTMLElement, advance: () => void) => () => void;
  /** Only eligible cards (in view, several photos) get turns. */
  setEligible: (id: string, eligible: boolean) => void;
}

const ConductorContext = createContext<Conductor | null>(null);

export function SlideshowConductor({ children }: { children: ReactNode }) {
  const entries = useRef(new Map<string, Entry>());
  const currentId = useRef<string | null>(null);

  const conductor = useMemo<Conductor>(
    () => ({
      register(id, element, advance) {
        entries.current.set(id, { element, advance, eligible: false });
        return () => {
          entries.current.delete(id);
        };
      },
      setEligible(id, eligible) {
        const entry = entries.current.get(id);
        if (entry) entry.eligible = eligible;
      },
    }),
    []
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      // Visual left-to-right order, read fresh each tick (the row scrolls).
      const ordered = [...entries.current]
        .filter(([, entry]) => entry.eligible)
        .map(([id, entry]) => ({ id, entry, left: entry.element.getBoundingClientRect().left }))
        .sort((a, b) => a.left - b.left);
      if (ordered.length === 0) return;

      const position = ordered.findIndex((item) => item.id === currentId.current);
      const next = ordered[(position + 1) % ordered.length];
      currentId.current = next.id;
      next.entry.advance();
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, []);

  return <ConductorContext.Provider value={conductor}>{children}</ConductorContext.Provider>;
}

export function useSlideshowConductor(): Conductor | null {
  return useContext(ConductorContext);
}
