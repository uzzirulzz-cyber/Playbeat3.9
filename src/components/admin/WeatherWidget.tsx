import React, { useState, useEffect, useRef } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  MapPin,
  Search,
  X,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================================================
// WeatherWidget — Live clock + current weather + 4-day forecast
// ----------------------------------------------------------------------------
// Uses the free Open-Meteo API (no API key required):
//   Geocoding:  https://geocoding-api.open-meteo.com/v1/search?name={city}
//   Forecast:   https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current_weather=true&daily=..
//
// State:
//   - Current time updates every second
//   - Weather data fetched on mount + every 10 minutes
//   - City persisted to localStorage so the user's choice is remembered
// ============================================================================

interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    isDay: number;
  };
  daily: {
    time: string[];
    weatherCode: number[];
    tempMax: number[];
    tempMin: number[];
  };
  cityName: string;
  country: string;
}

// Map WMO weather codes to lucide icons + human-readable labels
function getWeatherInfo(code: number, isDay: number = 1): { icon: React.ReactNode; label: string; color: string } {
  const dayNight = isDay === 1;
  if (code === 0) return { icon: <Sun className={dayNight ? 'text-yellow-400' : 'text-blue-300'} />, label: dayNight ? 'Clear sky' : 'Clear night', color: 'text-yellow-400' };
  if (code === 1) return { icon: <Sun className={dayNight ? 'text-yellow-300' : 'text-blue-300'} />, label: 'Mainly clear', color: 'text-yellow-300' };
  if (code === 2) return { icon: <Cloud className="text-slate-300" />, label: 'Partly cloudy', color: 'text-slate-300' };
  if (code === 3) return { icon: <Cloud className="text-slate-400" />, label: 'Overcast', color: 'text-slate-400' };
  if (code === 45 || code === 48) return { icon: <CloudFog className="text-slate-300" />, label: 'Foggy', color: 'text-slate-300' };
  if (code >= 51 && code <= 57) return { icon: <CloudDrizzle className="text-blue-300" />, label: 'Drizzle', color: 'text-blue-300' };
  if (code >= 61 && code <= 67) return { icon: <CloudRain className="text-blue-400" />, label: 'Rainy', color: 'text-blue-400' };
  if (code >= 71 && code <= 77) return { icon: <CloudSnow className="text-blue-200" />, label: 'Snowy', color: 'text-blue-200' };
  if (code >= 80 && code <= 82) return { icon: <CloudRain className="text-blue-500" />, label: 'Rain showers', color: 'text-blue-500' };
  if (code === 85 || code === 86) return { icon: <CloudSnow className="text-blue-200" />, label: 'Snow showers', color: 'text-blue-200' };
  if (code >= 95 && code <= 99) return { icon: <CloudLightning className="text-yellow-400" />, label: 'Thunderstorm', color: 'text-yellow-400' };
  return { icon: <Cloud className="text-slate-400" />, label: 'Unknown', color: 'text-slate-400' };
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m}:${s} ${ampm}`;
}

function formatDate(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

interface WeatherWidgetProps {
  /** Optional className for custom positioning */
  className?: string;
  /** Compact mode — only shows clock + current weather (no forecast) */
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '', compact = false }) => {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState('');
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [searching, setSearching] = useState(false);

  // Load saved city from localStorage on mount
  const savedCity = useRef<string>('');
  useEffect(() => {
    try {
      savedCity.current = localStorage.getItem('playbeat-weather-city') || 'Karachi';
    } catch {
      savedCity.current = 'Karachi';
    }
    setCityInput(savedCity.current);
  }, []);

  // Tick the clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather data — called on mount + every 10 minutes
  // Tries Open-Meteo first, falls back to wttr.in if the daily limit is hit.
  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      // Try Open-Meteo first
      try {
        await fetchFromOpenMeteo(cityName);
        return;
      } catch (openMeteoErr: any) {
        console.warn('[WeatherWidget] Open-Meteo failed, falling back to wttr.in:', openMeteoErr?.message?.substring(0, 100));
      }

      // Fallback: wttr.in (no API key required, returns JSON via ?format=j1)
      await fetchFromWttrIn(cityName);
    } catch (err: any) {
      setError(err?.message || 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  // Open-Meteo API — geocoding + forecast (free, no API key)
  const fetchFromOpenMeteo = async (cityName: string) => {
    // Step 1: geocode the city name to lat/lon
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) throw new Error('Geocoding failed');
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City "${cityName}" not found`);
    }
    const geo = geoData.results[0];

    // Step 2: fetch the weather forecast
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}` +
      `&current_weather=true` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto` +
      `&forecast_days=5`
    );
    if (!weatherRes.ok) throw new Error('Weather API failed');
    const weatherData = await weatherRes.json();

    // Check if the API returned an error object (e.g., daily limit exceeded)
    if (weatherData.error) {
      throw new Error(weatherData.reason || 'Weather API error');
    }

    setWeather({
      current: {
        temperature: Math.round(weatherData.current_weather.temperature),
        weatherCode: weatherData.current_weather.weathercode,
        windSpeed: Math.round(weatherData.current_weather.windspeed),
        isDay: weatherData.current_weather.is_day,
      },
      daily: {
        time: weatherData.daily.time,
        weatherCode: weatherData.daily.weathercode,
        tempMax: weatherData.daily.temperature_2m_max,
        tempMin: weatherData.daily.temperature_2m_min,
      },
      cityName: geo.name,
      country: geo.country || '',
    });
  };

  // wttr.in fallback — returns JSON via ?format=j1 (free, no API key)
  // Used when Open-Meteo hits its daily request limit.
  const fetchFromWttrIn = async (cityName: string) => {
    const res = await fetch(
      `https://wttr.in/${encodeURIComponent(cityName)}?format=j1`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) throw new Error('Weather API failed (both Open-Meteo and wttr.in)');
    const data = await res.json();

    const current = data.current_condition?.[0];
    if (!current) throw new Error('No current weather data');

    // Map wttr.in weather codes (WMO) to our weather code system
    const wttrCode = parseInt(current.weatherCode, 10);
    const weatherCode = mapWttrCode(wttrCode);

    // Build 5-day forecast from wttr.in's `weather` array
    const daily = data.weather?.slice(0, 5).map((d: any) => ({
      date: d.date,
      maxTemp: parseFloat(d.maxtempC),
      minTemp: parseFloat(d.mintempC),
      weatherCode: mapWttrCode(parseInt(d.hourly?.[4]?.weatherCode || '113', 10)),
    })) || [];

    const areaName = data.nearest_area?.[0]?.areaName?.[0]?.value || cityName;
    const country = data.nearest_area?.[0]?.country?.[0]?.value || '';

    setWeather({
      current: {
        temperature: Math.round(parseFloat(current.temp_C)),
        weatherCode,
        windSpeed: Math.round(parseFloat(current.windspeedKmph)),
        isDay: 1, // wttr.in doesn't provide is_day; assume day
      },
      daily: {
        time: daily.map((d: any) => d.date),
        weatherCode: daily.map((d: any) => d.weatherCode),
        tempMax: daily.map((d: any) => d.maxTemp),
        tempMin: daily.map((d: any) => d.minTemp),
      },
      cityName: areaName,
      country,
    });
  };

  // Map wttr.in weather codes to WMO codes (used by Open-Meteo)
  // wttr.in uses a different code set; we normalize to WMO.
  // Reference: https://www.worldweatheronline.com/weather/api/
  const mapWttrCode = (code: number): number => {
    if (code === 113) return 0;        // Clear/Sunny
    if (code === 116) return 2;        // Partly cloudy
    if (code === 119 || code === 122) return 3; // Cloudy/Overcast
    if (code === 143) return 45;       // Mist
    if (code === 176) return 51;       // Patchy rain nearby → drizzle
    if (code === 179) return 71;       // Patchy snow nearby
    if (code === 182 || code === 185) return 71; // Patchy sleet
    if (code === 200) return 45;       // Fog
    if (code === 227 || code === 230) return 75; // Light snow / Heavy snow
    if (code === 248 || code === 260) return 45; // Fog
    if (code === 263 || code === 266) return 51; // Light drizzle
    if (code === 281 || code === 284) return 53; // Heavy drizzle
    if (code === 293 || code === 296) return 61; // Light rain
    if (code === 299 || code === 302) return 63; // Heavy rain
    if (code === 305 || code === 308) return 65; // Very heavy rain
    if (code === 311 || code === 314 || code === 317) return 66; // Sleet
    if (code === 320 || code === 323 || code === 326) return 71; // Light snow
    if (code === 329 || code === 332 || code === 335 || code === 338) return 75; // Heavy snow
    if (code === 350 || code === 353 || code === 356) return 80; // Light showers
    if (code === 359 || code === 362 || code === 365) return 81; // Heavy showers
    if (code === 368 || code === 371) return 73; // Light snow showers
    if (code === 374 || code === 377) return 75; // Heavy snow showers
    if (code === 386 || code === 389) return 95; // Thunderstorm
    if (code === 392 || code === 395) return 96; // Thunderstorm with snow
    return 3; // Default: overcast
  };

  // Fetch on mount when savedCity is set
  useEffect(() => {
    if (savedCity.current) {
      fetchWeather(savedCity.current);
    }
  }, [savedCity.current]);

  // Refresh every 10 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      if (savedCity.current) fetchWeather(savedCity.current);
    }, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCitySearch = async () => {
    if (!cityInput.trim()) return;
    setSearching(true);
    savedCity.current = cityInput.trim();
    try {
      localStorage.setItem('playbeat-weather-city', cityInput.trim());
    } catch {
      // ignore localStorage errors
    }
    await fetchWeather(cityInput.trim());
    setSearching(false);
    setShowCitySearch(false);
  };

  const currentWeather = weather ? getWeatherInfo(weather.current.weatherCode, weather.current.isDay) : null;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E1626] via-[#10182A] to-[#0E1626] border border-[var(--pb-line)] shadow-xl ${className}`}>
      {/* Subtle ambient glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[var(--pb-red)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[var(--pb-blue)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-4">
        {/* ===== HEADER: Clock + Location ===== */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Clock + Date */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--pb-silver-3)] mb-0.5">
              <Clock className="w-3 h-3" />
              <span>Local Time</span>
            </div>
            <div className="text-2xl font-black text-white font-mono leading-none tracking-tight">
              {formatTime(now)}
            </div>
            <div className="text-[11px] text-[var(--pb-silver-3)] mt-1 font-mono">
              {formatDate(now)}
            </div>
          </div>

          {/* Location + settings button */}
          <div className="text-right shrink-0">
            <button
              onClick={() => setShowCitySearch(!showCitySearch)}
              className="flex items-center gap-1 text-[11px] font-mono text-[var(--pb-silver-2)] hover:text-white transition-colors ml-auto"
              aria-label="Change city"
              title="Change city"
            >
              <MapPin className="w-3 h-3 text-[var(--pb-red-bright)]" />
              <span className="max-w-[100px] truncate">
                {weather ? `${weather.cityName}${weather.country ? ', ' + weather.country : ''}` : savedCity.current || '—'}
              </span>
            </button>
            <button
              onClick={() => savedCity.current && fetchWeather(savedCity.current)}
              className="mt-1.5 p-1 rounded-md text-[var(--pb-silver-4)] hover:text-white hover:bg-white/5 transition-colors ml-auto"
              aria-label="Refresh weather"
              title="Refresh weather"
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ===== CITY SEARCH (collapsible) ===== */}
        <AnimatePresence>
          {showCitySearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="flex gap-1.5 p-2 rounded-lg bg-[var(--pb-ink)] border border-[var(--pb-line)]">
                <Search className="w-3.5 h-3.5 text-[var(--pb-silver-4)] self-center ml-1" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCitySearch();
                    if (e.key === 'Escape') setShowCitySearch(false);
                  }}
                  placeholder="Enter city name..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-[var(--pb-silver-4)] focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleCitySearch}
                  disabled={searching || !cityInput.trim()}
                  className="px-2 py-1 rounded-md bg-[var(--pb-red)]/20 text-[var(--pb-red-bright)] hover:bg-[var(--pb-red)]/30 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {searching ? '...' : 'Set'}
                </button>
                <button
                  onClick={() => setShowCitySearch(false)}
                  className="p-1 text-[var(--pb-silver-4)] hover:text-white"
                  aria-label="Close search"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== CURRENT WEATHER ===== */}
        {loading && !weather ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="w-5 h-5 animate-spin text-[var(--pb-silver-4)]" />
            <span className="ml-2 text-xs text-[var(--pb-silver-3)] font-mono">Loading weather...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-4 text-center">
            <div>
              <p className="text-xs text-[var(--pb-red-bright)] font-mono mb-1">{error}</p>
              <button
                onClick={() => savedCity.current && fetchWeather(savedCity.current)}
                className="text-[10px] text-[var(--pb-silver-3)] hover:text-white underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : weather && currentWeather ? (
          <>
            {/* Current conditions */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--pb-ink)]/60 border border-[var(--pb-line)] mb-3">
              <div className="flex items-center gap-3">
                {/* Weather icon (large) */}
                <div className="w-12 h-12 flex items-center justify-center">
                  {React.cloneElement(currentWeather.icon as React.ReactElement<{ className?: string }>, { className: 'w-10 h-10 ' + currentWeather.color })}
                </div>
                <div>
                  <div className="text-3xl font-black text-white font-mono leading-none">
                    {weather.current.temperature}°<span className="text-base text-[var(--pb-silver-3)]">C</span>
                  </div>
                  <div className={`text-xs font-medium ${currentWeather.color}`}>
                    {currentWeather.label}
                  </div>
                </div>
              </div>

              {/* Wind speed */}
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-[var(--pb-silver-4)] tracking-wider">Wind</div>
                <div className="text-sm font-bold text-white font-mono">{weather.current.windSpeed} km/h</div>
              </div>
            </div>

            {/* 4-day forecast (hidden in compact mode) */}
            {!compact && weather.daily && (
              <div className="grid grid-cols-4 gap-2">
                {weather.daily.time.slice(1, 5).map((dateStr: string, i: number) => {
                  const d = new Date(dateStr);
                  const info = getWeatherInfo(weather.daily.weatherCode[i + 1], 1);
                  return (
                    <div
                      key={dateStr}
                      className="flex flex-col items-center p-2 rounded-lg bg-[var(--pb-ink)]/40 border border-[var(--pb-line)]/50 hover:border-[var(--pb-red-line)] transition-colors"
                    >
                      <div className="text-[10px] font-mono uppercase text-[var(--pb-silver-3)] tracking-wider">
                        {DAY_NAMES[d.getDay()]}
                      </div>
                      <div className="my-1">
                        {React.cloneElement(info.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5 ' + info.color })}
                      </div>
                      <div className="text-[11px] font-mono font-bold text-white">
                        {Math.round(weather.daily.tempMax[i + 1])}°
                      </div>
                      <div className="text-[10px] font-mono text-[var(--pb-silver-4)]">
                        {Math.round(weather.daily.tempMin[i + 1])}°
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
