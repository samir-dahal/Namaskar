import type { WeatherResult } from '../utils/weather';
import {
  SunIcon,
  MoonIcon,
  CloudIcon,
  PartlyCloudyIcon,
  RainIcon,
  SnowIcon,
  ThunderstormIcon,
} from './icons';

interface WeatherWidgetProps {
  weather: WeatherResult;
  city: string;
  isOffline: boolean;
}

function getWeatherIcon(code: number): React.ReactElement {
  const nstHour = new Date(Date.now() + (5 * 60 + 45) * 60_000).getUTCHours();
  const isNight = nstHour < 6 || nstHour >= 19;

  if (code === 0) return isNight ? <MoonIcon size={18} /> : <SunIcon size={18} />;
  if (code >= 1 && code <= 3) return <PartlyCloudyIcon size={18} />;
  if (code === 45 || code === 48) return <CloudIcon size={18} />;
  if (code >= 51 && code <= 67) return <RainIcon size={18} />;
  if (code >= 71 && code <= 77) return <SnowIcon size={18} />;
  if (code >= 80 && code <= 82) return <RainIcon size={18} />;
  if (code === 95 || code === 96 || code === 99) return <ThunderstormIcon size={18} />;
  return isNight ? <MoonIcon size={18} /> : <SunIcon size={18} />;
}

export function WeatherWidget({ weather, city, isOffline }: WeatherWidgetProps) {
  return (
    <div className="weather-widget">
      <div className="weather-top-row">
        <span className="weather-icon">{getWeatherIcon(weather.weatherCode)}</span>
        <span className="weather-temp">{weather.temperature}°</span>
      </div>
      <span className="weather-city">
        {city.toUpperCase()}
        {isOffline && <span className="weather-offline"> · Offline</span>}
      </span>
    </div>
  );
}
