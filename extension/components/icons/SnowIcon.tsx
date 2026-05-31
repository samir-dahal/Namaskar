export function SnowIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="10" y1="2" x2="10" y2="18" />
      <line x1="2" y1="10" x2="18" y2="10" />
      <line x1="4.34" y1="4.34" x2="15.66" y2="15.66" />
      <line x1="15.66" y1="4.34" x2="4.34" y2="15.66" />
      <polyline points="7.5,4.5 10,2 12.5,4.5" />
      <polyline points="7.5,15.5 10,18 12.5,15.5" />
      <polyline points="4.5,7.5 2,10 4.5,12.5" />
      <polyline points="15.5,7.5 18,10 15.5,12.5" />
    </svg>
  );
}
