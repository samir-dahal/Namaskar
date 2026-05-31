import { storage } from "wxt/utils/storage";

export interface UserSettings {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  showWeather: boolean;
  showTithi: boolean;
  dateLanguage: "en" | "ne";
  isSetupComplete: boolean;
}

export interface DailyResponse {
  generated_at: string;
  nepali_date: {
    year: number;
    month: number;
    day: number;
    month_name: string;
    month_name_ne: string;
    day_ne: string;
    year_ne: string;
    weekday: string;
    weekday_ne: string;
    full_display: string;
    tithi_ne: string;
    tithi_en: string;
  };
  gregorian_date: {
    year: number;
    month: number;
    day: number;
    weekday: string;
    formatted: string;
  };
  events: Array<{
    name_en: string;
    name_ne: string;
    type: "national" | "religious" | "observance";
    is_public_holiday: boolean;
  }>;
  background: {
    url: string;
    url_4k: string;
    photographer: string;
    source: string;
    source_url: string;
    location: string;
  };
  cache_ttl_seconds: number;
}

export interface DailyCache {
  data: DailyResponse;
  cachedAt: number;
}

export const userSettings = storage.defineItem<UserSettings>(
  "local:userSettings",
  {
    fallback: {
      name: "",
      city: "Kathmandu",
      latitude: 27.7172,
      longitude: 85.324,
      showWeather: true,
      showTithi: true,
      dateLanguage: "en" as const,
      isSetupComplete: false,
    },
  },
);

export const dailyCache = storage.defineItem<DailyCache | null>(
  "local:dailyCache",
  {
    fallback: null,
  },
);

export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
