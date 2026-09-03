// Shared visual for the "maintenance"-toned error states (not-found.tsx,
// error.tsx) — a soft badge + wrench instead of a bare "404" so these pages
// read as "we're on it" rather than a dead end. Built from plain shapes
// (not a hand-authored path) so it renders predictably, and themes
// correctly via CSS variables in dark mode.
export default function MaintenanceIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="60" fill="var(--color-accent)" fillOpacity="0.14" />
      <circle cx="60" cy="60" r="42" fill="var(--color-accent)" fillOpacity="0.18" />

      {/* Wrench: rotated handle + ring "head" */}
      <g transform="rotate(-45 60 60)">
        <rect x="55" y="46" width="10" height="46" rx="5" fill="var(--color-accent-strong)" />
        <circle cx="60" cy="42" r="15" fill="none" stroke="var(--color-accent-strong)" strokeWidth="7" />
      </g>

      {/* Small bolt accents */}
      <circle cx="34" cy="82" r="4" fill="var(--color-accent-strong)" fillOpacity="0.55" />
      <circle cx="88" cy="36" r="3" fill="var(--color-accent-strong)" fillOpacity="0.55" />
    </svg>
  );
}
