import { storage } from 'wxt/utils/storage';

const ALARM_NAME = 'hourlyRefresh';
const CACHE_KEY = 'local:dailyCache' as const;

export default defineBackground(() => {
  // Pre-fetch on install and browser startup
  browser.runtime.onInstalled.addListener(() => {
    browser.alarms.create(ALARM_NAME, { periodInMinutes: 60 });
    prefetch();
  });

  browser.runtime.onStartup.addListener(() => {
    prefetch();
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) prefetch();
  });
});

async function prefetch(): Promise<void> {
  try {
    const base = import.meta.env.VITE_API_BASE_URL as string;
    const res = await fetch(`${base}/v1/daily`);
    if (!res.ok) return;
    const data = await res.json();
    await storage.setItem(CACHE_KEY, { data, cachedAt: Date.now() });
  } catch {
    // Silently ignore — user will fetch on next tab open
  }
}
