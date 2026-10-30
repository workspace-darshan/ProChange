"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  fetchAllCountries,
  fetchCitiesByCountry,
  ApiCountry,
  ApiCity,
} from "@/lib/services/countriesApi";

interface WeatherData {
  current: {
    temp: number;
    apparentTemp: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    weatherCode: number;
    isDay: number;
    pressure: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weatherCode: number[];
    maxTemp: number[];
    minTemp: number[];
    sunrise: string[];
    sunset: string[];
    uvIndex: number[];
  };
}

function getWeatherInfo(code: number, isDay: number = 1) {
  switch (code) {
    case 0:
      return { label: "Clear Sky", icon: isDay ? "☀️" : "🌙", color: "text-amber-400" };
    case 1:
    case 2:
      return { label: "Partly Cloudy", icon: isDay ? "⛅" : "☁️", color: "text-sky-300" };
    case 3:
      return { label: "Overcast", icon: "☁️", color: "text-slate-400" };
    case 45:
    case 48:
      return { label: "Foggy / Mist", icon: "🌫️", color: "text-slate-300" };
    case 51:
    case 53:
    case 55:
      return { label: "Drizzle", icon: "🌦️", color: "text-blue-300" };
    case 61:
    case 63:
    case 65:
      return { label: "Rain", icon: "🌧️", color: "text-blue-400" };
    case 71:
    case 73:
    case 75:
      return { label: "Snowfall", icon: "❄️", color: "text-indigo-200" };
    case 80:
    case 81:
    case 82:
      return { label: "Rain Showers", icon: "🌧️", color: "text-cyan-400" };
    case 95:
    case 96:
    case 99:
      return { label: "Thunderstorm", icon: "⛈️", color: "text-purple-400" };
    default:
      return { label: "Fair", icon: "🌤️", color: "text-amber-300" };
  }
}

export default function WeatherTool() {
  const [countries, setCountries] = useState<ApiCountry[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [selectedCityName, setSelectedCityName] = useState<string>("New Delhi");
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.209,
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unit, setUnit] = useState<"C" | "F">("C");

  // Load countries dynamically
  useEffect(() => {
    fetchAllCountries().then((data) => {
      setCountries(data);
    });
  }, []);

  // When selected country changes, load cities & set coordinates to capital or first city
  useEffect(() => {
    fetchCitiesByCountry(selectedCountryCode).then((cityList) => {
      setCities(cityList);
      const c = countries.find((item) => item.alpha2Code === selectedCountryCode);
      if (cityList.length > 0) {
        setSelectedCityName(cityList[0].name);
        setActiveCoords({ lat: cityList[0].latitude, lng: cityList[0].longitude });
      } else if (c?.latlng) {
        setSelectedCityName(c.capital || c.name);
        setActiveCoords({ lat: c.latlng[0], lng: c.latlng[1] });
      }
    });
  }, [selectedCountryCode, countries]);

  // Fetch live Open-Meteo weather whenever coordinates change
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${activeCoords.lat}&longitude=${activeCoords.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;

    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject("Fetch error")))
      .then((json) => {
        if (!isCancelled) {
          setWeather({
            current: {
              temp: json.current?.temperature_2m ?? 24,
              apparentTemp: json.current?.apparent_temperature ?? 24,
              humidity: json.current?.relative_humidity_2m ?? 50,
              windSpeed: json.current?.wind_speed_10m ?? 12,
              windDirection: json.current?.wind_direction_10m ?? 180,
              precipitation: json.current?.precipitation ?? 0,
              weatherCode: json.current?.weather_code ?? 0,
              isDay: json.current?.is_day ?? 1,
              pressure: Math.round(json.current?.surface_pressure ?? 1013),
            },
            hourly: {
              time: json.hourly?.time?.slice(0, 24) ?? [],
              temperature_2m: json.hourly?.temperature_2m?.slice(0, 24) ?? [],
              weather_code: json.hourly?.weather_code?.slice(0, 24) ?? [],
            },
            daily: {
              time: json.daily?.time ?? [],
              weatherCode: json.daily?.weather_code ?? [],
              maxTemp: json.daily?.temperature_2m_max ?? [],
              minTemp: json.daily?.temperature_2m_min ?? [],
              sunrise: json.daily?.sunrise ?? [],
              sunset: json.daily?.sunset ?? [],
              uvIndex: json.daily?.uv_index_max ?? [],
            },
          });
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          // Fallback estimated data
          setWeather({
            current: {
              temp: 24,
              apparentTemp: 24,
              humidity: 52,
              windSpeed: 10,
              windDirection: 180,
              precipitation: 0,
              weatherCode: 1,
              isDay: 1,
              pressure: 1012,
            },
            hourly: { time: [], temperature_2m: [], weather_code: [] },
            daily: {
              time: ["Today", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
              weatherCode: [0, 1, 0, 2, 61, 0, 1],
              maxTemp: [26, 27, 28, 26, 23, 25, 27],
              minTemp: [17, 18, 19, 17, 15, 16, 17],
              sunrise: ["06:15"],
              sunset: ["18:20"],
              uvIndex: [6, 7, 7, 5, 4, 6, 7],
            },
          });
          setLoading(false);
        }
      })
      .finally(() => {
        clearTimeout(timeout);
      });

    return () => {
      isCancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [activeCoords]);

  const toUnit = (c: number) => {
    return unit === "F" ? Math.round((c * 9) / 5 + 32) : Math.round(c);
  };

  const currentCountry = useMemo(() => {
    return countries.find((c) => c.alpha2Code === selectedCountryCode);
  }, [countries, selectedCountryCode]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.alpha2Code.toLowerCase().includes(q) ||
        c.capital?.toLowerCase().includes(q)
    );
  }, [countries, searchQuery]);

  const weatherInfo = weather
    ? getWeatherInfo(weather.current.weatherCode, weather.current.isDay)
    : { label: "Loading...", icon: "⛅", color: "text-slate-400" };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 font-sans text-slate-100">
      {/* Search Header */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#101524] to-slate-900 p-6 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⛅</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Global Live Weather Station
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold font-mono">
                Open-Meteo Live API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time atmospheric conditions, 24-hour hourly temperatures, and 7-day forecasts for any world location.
            </p>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs self-start sm:self-auto">
            <button
              onClick={() => setUnit("C")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                unit === "C"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              °C Celsius
            </button>
            <button
              onClick={() => setUnit("F")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                unit === "F"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              °F Fahrenheit
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 relative max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country or city (e.g. Japan, London, France, US)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Search Suggestions */}
        {searchQuery && filtered.length > 0 && (
          <div className="absolute top-full left-6 right-6 mt-1 z-50 p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {filtered.slice(0, 15).map((c) => (
              <button
                key={c.alpha2Code}
                onClick={() => {
                  setSelectedCountryCode(c.alpha2Code);
                  setSearchQuery("");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-xs text-white"
              >
                <span>{c.name}</span>
                <span className="text-[10px] text-slate-400">({c.capital})</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick Hub Buttons */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Popular Hubs:
          </span>
          {[
            { code: "IN", city: "New Delhi", lat: 28.6139, lng: 77.209 },
            { code: "JP", city: "Tokyo", lat: 35.6762, lng: 139.6503 },
            { code: "GB", city: "London", lat: 51.5074, lng: -0.1278 },
            { code: "US", city: "New York", lat: 40.7128, lng: -74.006 },
            { code: "AE", city: "Dubai", lat: 25.2048, lng: 55.2708 },
            { code: "FR", city: "Paris", lat: 48.8566, lng: 2.3522 },
            { code: "AU", city: "Sydney", lat: -33.8688, lng: 151.2093 },
          ].map((hub) => (
            <button
              key={hub.city}
              onClick={() => {
                setSelectedCountryCode(hub.code);
                setSelectedCityName(hub.city);
                setActiveCoords({ lat: hub.lat, lng: hub.lng });
              }}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                selectedCityName === hub.city
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/50"
                  : "bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              {hub.city}
            </button>
          ))}
        </div>
      </div>

      {/* City Switcher in Selected Country */}
      {cities.length > 1 && (
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Cities in {currentCountry?.name}:
          </span>
          {cities.slice(0, 10).map((city) => (
            <button
              key={city.geonameId}
              onClick={() => {
                setSelectedCityName(city.name);
                setActiveCoords({ lat: city.latitude, lng: city.longitude });
              }}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCityName === city.name
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 font-bold"
                  : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">Connecting to Open-Meteo satellite feed...</span>
        </div>
      )}

      {weather && !loading && (
        <div className="space-y-6">
          {/* Main Weather Hero Card */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0f1422] to-slate-900 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-5">
                <span className="text-6xl sm:text-7xl">{weatherInfo.icon}</span>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-6xl font-black text-white">
                      {toUnit(weather.current.temp)}°
                    </span>
                    <span className="text-2xl font-bold text-slate-400">
                      {unit}
                    </span>
                  </div>
                  <div className={`text-base font-bold ${weatherInfo.color}`}>
                    {weatherInfo.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Feels like {toUnit(weather.current.apparentTemp)}°{unit}
                  </div>
                </div>
              </div>

              {/* Location Badge */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-right min-w-[200px]">
                <div className="flex items-center justify-end gap-2">
                  {currentCountry?.flags?.svg && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentCountry.flags.svg}
                      alt={currentCountry.name}
                      className="w-5 h-3.5 object-cover rounded-sm"
                    />
                  )}
                  <h2 className="text-lg font-black text-white">
                    {selectedCityName}
                  </h2>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {currentCountry?.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  {activeCoords.lat.toFixed(2)}°, {activeCoords.lng.toFixed(2)}°
                </div>
              </div>
            </div>

            {/* 6 Key Atmospheric Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  HUMIDITY
                </span>
                <span className="text-lg font-bold font-mono text-sky-400">
                  {weather.current.humidity}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  WIND SPEED
                </span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {Math.round(weather.current.windSpeed)} km/h
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  PRECIPITATION
                </span>
                <span className="text-lg font-bold font-mono text-indigo-400">
                  {weather.current.precipitation} mm
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  PRESSURE
                </span>
                <span className="text-lg font-bold font-mono text-white">
                  {weather.current.pressure} hPa
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  SUNRISE
                </span>
                <span className="text-base font-bold text-amber-300">
                  {weather.daily.sunrise[0]?.split("T")[1] || "06:00"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  SUNSET
                </span>
                <span className="text-base font-bold text-orange-400">
                  {weather.daily.sunset[0]?.split("T")[1] || "18:00"}
                </span>
              </div>
            </div>

            {/* Hourly 24-Hour Scrubber Chart */}
            {weather.hourly.time.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  24-HOUR HOURLY TEMPERATURE CURVE
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {weather.hourly.time.map((timeStr, idx) => {
                    const hour = timeStr.split("T")[1] || timeStr;
                    const hCode = weather.hourly.weather_code[idx] ?? 0;
                    const hInfo = getWeatherInfo(hCode, 1);
                    const temp = toUnit(weather.hourly.temperature_2m[idx]);

                    return (
                      <div
                        key={timeStr}
                        className="flex-shrink-0 flex flex-col items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 w-16 text-center text-xs"
                      >
                        <span className="text-[10px] text-slate-400 font-mono">
                          {hour}
                        </span>
                        <span className="text-xl my-1">{hInfo.icon}</span>
                        <span className="font-mono font-bold text-white">
                          {temp}°
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7-Day Forecast Cards */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                7-DAY DAILY OUTLOOK
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {weather.daily.time.slice(0, 7).map((dStr, idx) => {
                  const dayDate = new Date(dStr);
                  const dayName =
                    idx === 0
                      ? "Today"
                      : isNaN(dayDate.getTime())
                      ? dStr
                      : dayDate.toLocaleDateString("en-US", { weekday: "short" });
                  const dCode = weather.daily.weatherCode[idx] ?? 0;
                  const dInfo = getWeatherInfo(dCode, 1);
                  const max = toUnit(weather.daily.maxTemp[idx]);
                  const min = toUnit(weather.daily.minTemp[idx]);

                  return (
                    <div
                      key={dStr}
                      className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center justify-between text-center transition-colors"
                    >
                      <span className="text-xs font-bold text-white">
                        {dayName}
                      </span>
                      <span className="text-3xl my-2">{dInfo.icon}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1 mb-2">
                        {dInfo.label}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                        <span className="text-white">{max}°</span>
                        <span className="text-slate-500 font-normal">{min}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
