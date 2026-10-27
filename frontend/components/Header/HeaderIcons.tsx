// Pure presentational icons used across Header's desktop account/language
// menus — no state, nothing Header-specific beyond living next to its only
// caller.

export function FranceFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20">
      <clipPath id="flag-circle-fr">
        <circle cx="10" cy="10" r="10" />
      </clipPath>
      <g clipPath="url(#flag-circle-fr)">
        <rect width="20" height="20" fill="#ED2939" />
        <rect width="13.3" height="20" fill="#FFFFFF" />
        <rect width="6.7" height="20" fill="#002395" />
      </g>
    </svg>
  );
}

export function UkFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20">
      <clipPath id="flag-circle-uk">
        <circle cx="10" cy="10" r="10" />
      </clipPath>
      <g clipPath="url(#flag-circle-uk)">
        <rect width="20" height="20" fill="#00247D" />
        <path d="M0 0L20 20M20 0L0 20" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M0 0L20 20M20 0L0 20" stroke="#CF142B" strokeWidth="1.5" />
        <path d="M10 0V20M0 10H20" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M10 0V20M0 10H20" stroke="#CF142B" strokeWidth="3.5" />
      </g>
    </svg>
  );
}

export function LoginIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <path
        d="M8 2H4.5A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18H8M13 14l4-4-4-4M17 10H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" style={{ transform: "scaleX(-1)" }}>
      <path
        d="M8 2H4.5A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18H8M13 14l4-4-4-4M17 10H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SignupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <path
        d="M8 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 18c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5M16 7v6M13 10h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.8 7.8a2.2 2.2 0 1 1 3.3 1.9c-.7.4-1.1.8-1.1 1.6v.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="14.2" r="0.9" fill="currentColor" />
    </svg>
  );
}
