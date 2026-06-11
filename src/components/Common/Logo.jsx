export default function Logo({ size = 32 }) {
  const id = `lg-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-a`} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="16" y1="26" x2="16" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="32" height="32" rx="7" fill="#060d1e" />
      <rect width="32" height="32" rx="7" stroke={`url(#${id}-a)`} strokeOpacity="0.35" strokeWidth="1" />

      {/* Shark fin — filled area */}
      <path
        d="M4 26 C4 13 10 4 15 4 C19 9 27 21 28 26 Z"
        fill={`url(#${id}-b)`}
      />
      {/* Shark fin — stroke only (open path, no bottom edge) */}
      <path
        d="M4 26 C4 13 10 4 15 4 C19 9 27 21 28 26"
        stroke={`url(#${id}-a)`}
        strokeWidth="1.9"
        strokeLinecap="round"
      />

      {/* Waveform bars — bell-curve heights, base at y=26 */}
      <rect x="6"   y="22.5" width="2.5" height="3.5" rx="1.25" fill="#00d4ff" fillOpacity="0.35" />
      <rect x="10"  y="19.5" width="2.5" height="6.5" rx="1.25" fill="#00d4ff" fillOpacity="0.6"  />
      <rect x="14"  y="17"   width="2.5" height="9"   rx="1.25" fill={`url(#${id}-a)`}            />
      <rect x="18"  y="19.5" width="2.5" height="6.5" rx="1.25" fill="#00d4ff" fillOpacity="0.6"  />
      <rect x="22"  y="22.5" width="2.5" height="3.5" rx="1.25" fill="#00d4ff" fillOpacity="0.35" />
    </svg>
  );
}
