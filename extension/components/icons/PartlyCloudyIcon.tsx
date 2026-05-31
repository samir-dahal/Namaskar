export function PartlyCloudyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      {/* Sun rays behind cloud */}
      <circle cx="7" cy="7" r="3" fill="currentColor" opacity="0.9" />
      <line x1="7" y1="1" x2="7" y2="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="11.5" x2="7" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="7" x2="2.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.5" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2.93" y1="2.93" x2="4" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="10" x2="11.07" y2="11.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Cloud */}
      <path d="M15 10.5a3 3 0 0 0-5.6-1.5H9a3 3 0 1 0 0 6h6a2.5 2.5 0 1 0 0-5Z" fill="currentColor" />
    </svg>
  );
}
