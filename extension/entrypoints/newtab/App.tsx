import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { BottomBar } from '../../components/BottomBar';
import { WeatherWidget } from '../../components/WeatherWidget';
import { SetupOverlay } from '../../components/SetupOverlay';
import {
  userSettings,
  dailyCache,
  CACHE_TTL_MS,
  type UserSettings,
  type DailyResponse,
} from '../../utils/storage';
import { fetchDaily } from '../../utils/api';
import { fetchWeather, type WeatherResult } from '../../utils/weather';
import { getGreeting } from '../../utils/greeting';

type AppState = 'loading' | 'setup' | 'ready' | 'refreshing';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [settings, setSettings] = useState<UserSettings>(userSettings.fallback!);
  const [dailyData, setDailyData] = useState<DailyResponse | null>(null);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [bgReady, setBgReady] = useState(false);
  const [greeting] = useState(getGreeting);

  // Preload background image and apply it to the document
  const applyBackground = useCallback((url: string) => {
    if (!url) return;
    const img = new Image();
    img.onload = () => {
      document.documentElement.style.setProperty(
        '--bg-image',
        `url("${url.replace(/"/g, '%22')}")`,
      );
      setBgReady(true);
    };
    img.onerror = () => setBgReady(true); // still reveal even if image fails
    img.src = url;
  }, []);

  const doFetch = useCallback(async (s: UserSettings) => {
    try {
      const [data, w] = await Promise.allSettled([
        fetchDaily(),
        fetchWeather(s.latitude, s.longitude),
      ]);

      if (data.status === 'fulfilled') {
        const resolved = data.value;
        await dailyCache.setValue({ data: resolved, cachedAt: Date.now() });
        setDailyData(resolved);
        applyBackground(resolved.background.url);
        setIsOffline(false);
      }
      if (w.status === 'fulfilled') {
        setWeather(w.value);
      }
    } catch {
      setIsOffline(true);
    } finally {
      setAppState('ready');
    }
  }, [applyBackground]);

  // Boot sequence
  useEffect(() => {
    Promise.all([
      userSettings.getValue(),
      dailyCache.getValue(),
    ]).then(([s, cached]) => {
      setSettings(s);

      if (!s.isSetupComplete) {
        setAppState('setup');
        return;
      }

      const isFresh = cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS;

      if (isFresh && cached) {
        setDailyData(cached.data);
        applyBackground(cached.data.background.url);
        setAppState('ready');
        // Refresh weather in background
        fetchWeather(s.latitude, s.longitude)
          .then(setWeather)
          .catch(() => setIsOffline(true));
      } else {
        // Show stale data while fetching
        if (cached) {
          setDailyData(cached.data);
          applyBackground(cached.data.background.url);
        }
        setAppState('loading');
        doFetch(s);
      }
    });
  }, [applyBackground, doFetch]);

  const handleRefresh = useCallback(async () => {
    setAppState('refreshing');
    await dailyCache.setValue(null);
    setBgReady(false);
    await doFetch(settings);
  }, [doFetch, settings]);

  const handleSetupComplete = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    setAppState('loading');
    doFetch(newSettings);
  }, [doFetch]);

  const bg = dailyData?.background;
  const isLoading = appState === 'loading' || appState === 'refreshing';

  return (
    <>
      {/* Background fade — hides dark body until image loads */}
      <div
        className={`bg-fade${bgReady ? ' bg-fade--hidden' : ''}`}
        aria-hidden="true"
      />

      {/* Gradient overlay */}
      <div className="gradient-overlay" aria-hidden="true" />

      {/* Top-center greeting */}
      {(settings.name || appState === 'ready') && (
        <div className="top-center">
          <p className="greeting">
            {greeting}{settings.name ? <span className="greeting-name">, {settings.name}.</span> : '.'}
          </p>
        </div>
      )}

      {/* Top-right weather */}
      {settings.showWeather && weather && (
        <div className="top-bar">
          <WeatherWidget weather={weather} city={settings.city} isOffline={isOffline} />
        </div>
      )}

      {/* Bottom-left date display (Windows lock screen style) */}
      <div className="content-block">
        <GlassCard
          greeting=""
          name=""
          nepaliDate={dailyData?.nepali_date ?? null}
          gregorianDate={dailyData?.gregorian_date ?? null}
          events={dailyData?.events ?? []}
          showTithi={settings.showTithi}
          dateLanguage={settings.dateLanguage}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom bar — attribution left, buttons right */}
      <BottomBar
        location={bg?.location ?? ''}
        photographer={bg?.photographer ?? ''}
        source={bg?.source ?? ''}
        sourceUrl={bg?.source_url ?? ''}
        isRefreshing={appState === 'refreshing'}
        isOffline={isOffline}
        onRefresh={handleRefresh}
      />

      {/* First-run setup */}
      {appState === 'setup' && (
        <SetupOverlay onComplete={handleSetupComplete} />
      )}
    </>
  );
}
