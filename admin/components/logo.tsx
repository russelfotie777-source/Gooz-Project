export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M41 6v27.5C41 42.06 34.06 49 25.5 49S10 42.06 10 33.5 16.94 18 25.5 18c5.6 0 10.5 2.96 13.24 7.4"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="19" cy="58" r="4.5" fill="currentColor" />
      <circle cx="35" cy="58" r="4.5" fill="currentColor" />
    </svg>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className ?? ""}`}>
      <LogoMark className="h-7 w-7 -mb-0.5 text-brand-orange" />
      <span className="text-xl font-extrabold tracking-tight">
        shopitech
        <span className="text-brand-orange">.</span>
      </span>
    </span>
  );
}
