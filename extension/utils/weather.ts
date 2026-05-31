export interface WeatherResult {
  temperature: number;
  weatherCode: number;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResult> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&current=temperature_2m,weather_code` +
    `&timezone=Asia%2FKathmandu`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');

  const json = await res.json() as {
    current: { temperature_2m: number; weather_code: number };
  };

  return {
    temperature: Math.round(json.current.temperature_2m),
    weatherCode: json.current.weather_code,
  };
}
