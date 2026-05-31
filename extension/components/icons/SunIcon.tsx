export function SunIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="3.5" />
      <line x1="10" y1="1.5" x2="10" y2="3.5" />
      <line x1="10" y1="16.5" x2="10" y2="18.5" />
      <line x1="1.5" y1="10" x2="3.5" y2="10" />
      <line x1="16.5" y1="10" x2="18.5" y2="10" />
      <line x1="3.99" y1="3.99" x2="5.4" y2="5.4" />
      <line x1="14.6" y1="14.6" x2="16.01" y2="16.01" />
      <line x1="3.99" y1="16.01" x2="5.4" y2="14.6" />
      <line x1="14.6" y1="5.4" x2="16.01" y2="3.99" />
    </svg>
  );
}
