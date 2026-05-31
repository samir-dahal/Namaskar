import type { DailyResponse } from './storage';

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export async function fetchDaily(): Promise<DailyResponse> {
  const res = await fetch(`${BASE}/v1/daily`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<DailyResponse>;
}
