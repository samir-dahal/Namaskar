export function RainIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 7.5a3.5 3.5 0 0 0-6.95-.75A2.75 2.75 0 1 0 7 12h7a2.5 2.5 0 1 0 0-5Z"
        fill="currentColor"
      />
      <line x1="6.5" y1="14.5" x2="5.5" y2="17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="14.5" x2="9" y2="17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13.5" y1="14.5" x2="12.5" y2="17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
