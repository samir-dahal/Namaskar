/** Returns a time-of-day greeting based on Nepal Standard Time (UTC+5:45). */
export function getGreeting(): string {
  const nstNow = new Date(Date.now() + (5 * 60 + 45) * 60_000);
  const hour = nstNow.getUTCHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}
