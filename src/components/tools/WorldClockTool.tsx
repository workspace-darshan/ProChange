"use client";

import React, { useState, useEffect, useMemo } from "react";
import AnalogClock from "./world-clock/AnalogClock";
import {
  fetchAllCountries,
  ApiCountry,
  getAccurateDateForOffset,
} from "@/lib/services/countriesApi";

const DEFAULT_PINNED = ["IN", "US", "GB", "JP", "AE", "FR", "AU", "DE"];

export default function WorldClockTool() {
  const [countries, setCountries] = useState<ApiCountry[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");
  const [pinnedCodes, setPinnedCodes] = useState<string[]>(DEFAULT_PINNED);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [use24Hour, setUse24Hour] = useState<boolean>(false);
  const [timeOffsetMinutes, setTimeOffsetMinutes] = useState<number>(0);
  const [now, setNow] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);

  // Live ticking clock (every second)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all 250 countries live
  useEffect(() => {
    fetchAllCountries()
      .then((data) => {
        setCountries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedCountry = useMemo(() => {
    return (
      countries.find((c) => c.alpha2Code === selectedCountryCode) ||
      countries[0] ||
      null
    );
  }, [countries, selectedCountryCode]);

  // Compute live accurate time for a country with time scrubber offset
  const getCountryDate = (country: ApiCountry, offsetMins: number = 0) => {
    const base = new Date(now.getTime() + offsetMins * 60 * 1000);
    const tzStr = country.timezones?.[0] || "UTC";
    return getAccurateDateForOffset(base, tzStr);
  };

  // Format digital time
  const formatTime = (date: Date, is24h: boolean) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    let period = "";

    if (!is24h) {
      period = hours >= 12 ? " PM" : " AM";
      hours = hours % 12 || 12;
    }

    const hoursStr = hours.toString().padStart(2, "0");
    return {
      timeStr: `${hoursStr}:${minutes}:${seconds}`,
      period,
      dayStr: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  };

  // Relative time difference string
  const getTimeDiffString = (targetDate: Date) => {
    const localMs = now.getTime();
    const targetMs = targetDate.getTime();
    const diffHours = Math.round(((targetMs - localMs) / (1000 * 60 * 60)) * 10) / 10;

    if (diffHours === 0) return "Same time as your local time";
    if (diffHours > 0) return `+${diffHours} hrs ahead of your time`;
    return `${diffHours} hrs behind your time`;
  };

  const isDaytime = (d: Date) => {
    const h = d.getHours();
    return h >= 6 && h < 19;
  };

  // Toggle pin
  const togglePin = (code: string) => {
    setPinnedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Filter countries
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return countries.filter((c) => {
      const matchRegion = selectedRegion === "All" || c.region === selectedRegion;
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.alpha2Code.toLowerCase().includes(q) ||
        c.capital?.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [countries, searchQuery, selectedRegion]);

  const selectedDate = selectedCountry
    ? getCountryDate(selectedCountry, timeOffsetMinutes)
    : now;
  const digitalTime = formatTime(selectedDate, use24Hour);
  const isDay = isDaytime(selectedDate);
  const diffStr = getTimeDiffString(selectedDate);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 font-sans text-slate-100">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#101424] to-slate-900 p-6 sm:p-8 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🕒</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                World Clock & Accurate Timezones
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold font-mono">
                Live 250 Countries API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Accurate live international clocks, UTC offsets, day/night cycles, and interactive meeting scrubber.
            </p>
          </div>

          {/* 12h / 24h Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setUse24Hour(!use24Hour)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm flex items-center gap-2"
            >
              <span>{use24Hour ? "24-Hour Military" : "12-Hour AM/PM"}</span>
              <span className="text-sky-400">⇄</span>
            </button>
          </div>
        </div>

        {/* Search & Regions */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country, capital, or code (e.g. India, Tokyo, London)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-xs text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {["All", "Asia", "Europe", "Africa", "Americas", "Oceania"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  selectedRegion === r
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                    : "bg-slate-800/60 text-slate-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Search Dropdown Results */}
        {searchQuery && filteredCountries.length > 0 && (
          <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {filteredCountries.slice(0, 20).map((c) => (
              <button
                key={c.alpha2Code}
                onClick={() => {
                  setSelectedCountryCode(c.alpha2Code);
                  setSearchQuery("");
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-xs text-white"
              >
                {c.flags?.svg && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.flags.svg}
                    alt={c.name}
                    className="w-4 h-3 object-cover rounded-sm"
                  />
                )}
                <span>{c.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {c.capital}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Quick Country Bar */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Quick Jump:
          </span>
          {countries.slice(0, 12).map((c) => (
            <button
              key={c.alpha2Code}
              onClick={() => setSelectedCountryCode(c.alpha2Code)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                selectedCountryCode === c.alpha2Code
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/50"
                  : "bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              {c.flags?.svg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.flags.svg}
                  alt={c.name}
                  className="w-3.5 h-2.5 object-cover rounded-xs"
                />
              )}
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">Loading accurate live timezones from countries.dev API...</span>
        </div>
      )}

      {selectedCountry && !loading && (
        <div className="space-y-6">
          {/* Main Selected Clock Hero Card */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#101422] to-slate-900 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Side: Country facts & Big Digital Clock */}
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  {selectedCountry.flags?.svg && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedCountry.flags.svg}
                      alt={selectedCountry.name}
                      className="w-12 h-8 object-cover rounded-md border border-slate-700 shadow-md"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {selectedCountry.capital || selectedCountry.name}, {selectedCountry.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Timezone: <span className="font-mono text-sky-400 font-bold">{selectedCountry.timezones?.[0] || "UTC"}</span> • {diffStr}
                    </p>
                  </div>
                </div>

                {/* Big Digital Clock Box */}
                <div className="inline-flex flex-col items-center lg:items-start p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl sm:text-7xl font-black font-mono text-white tracking-wider">
                      {digitalTime.timeStr}
                    </span>
                    {digitalTime.period && (
                      <span className="text-2xl sm:text-3xl font-bold font-mono text-sky-400">
                        {digitalTime.period}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400 font-medium mt-1">
                    {digitalTime.dayStr}
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs">
                  <span
                    className={`px-3 py-1.5 rounded-full border font-bold flex items-center gap-1.5 ${
                      isDay
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                    }`}
                  >
                    <span>{isDay ? "☀️ Daytime" : "🌙 Nighttime"}</span>
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Calling: <strong className="font-mono text-emerald-400">+{selectedCountry.callingCodes?.[0]}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Currency: <strong className="text-amber-300">{selectedCountry.currencies?.[0]?.code}</strong> ({selectedCountry.currencies?.[0]?.symbol})
                  </span>
                </div>
              </div>

              {/* Right Side: Luxury Analog Clock */}
              <div className="flex-shrink-0">
                <AnalogClock
                  date={selectedDate}
                  size={210}
                  label={`${selectedCountry.capital || selectedCountry.name} Standard Time`}
                  sublabel={selectedCountry.timezones?.[0] || "UTC"}
                  isDaytime={isDay}
                />
              </div>
            </div>

            {/* Interactive Time Scrubber / Meeting Planner Slider */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎚️</span>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Interactive Time Scrubber / Meeting Planner
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-sky-400 font-mono font-bold">
                    {timeOffsetMinutes === 0
                      ? "LIVE Real-Time"
                      : `${timeOffsetMinutes > 0 ? "+" : ""}${Math.round(
                          timeOffsetMinutes / 60
                        )} hours offset`}
                  </span>
                  {timeOffsetMinutes !== 0 && (
                    <button
                      onClick={() => setTimeOffsetMinutes(0)}
                      className="px-2.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      Reset to Live
                    </button>
                  )}
                </div>
              </div>

              <input
                type="range"
                min="-720"
                max="720"
                step="30"
                value={timeOffsetMinutes}
                onChange={(e) => setTimeOffsetMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>-12 Hours</span>
                <span>-6 Hours</span>
                <span className="text-sky-400 font-bold">Now (0h)</span>
                <span>+6 Hours</span>
                <span>+12 Hours</span>
              </div>
            </div>
          </div>

          {/* Multi-City Pinned World Clocks Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📌</span>
                <h3 className="text-base font-bold text-white">
                  Pinned International Clocks ({pinnedCodes.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Click any clock to focus
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {countries
                .filter((c) => pinnedCodes.includes(c.alpha2Code))
                .map((country) => {
                  const cDate = getCountryDate(country, timeOffsetMinutes);
                  const cDig = formatTime(cDate, use24Hour);
                  const cIsDay = isDaytime(cDate);
                  const isCurrent = country.alpha2Code === selectedCountryCode;

                  return (
                    <div
                      key={country.alpha2Code}
                      onClick={() => setSelectedCountryCode(country.alpha2Code)}
                      className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                        isCurrent
                          ? "bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/20"
                          : "bg-slate-900/60 hover:bg-slate-800/60 border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          {country.flags?.svg && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={country.flags.svg}
                              alt={country.name}
                              className="w-6 h-4 object-cover rounded-xs"
                            />
                          )}
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>{country.capital || country.name}</span>
                              {isCurrent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {country.name}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(country.alpha2Code);
                          }}
                          className="text-xs text-slate-500 hover:text-rose-400 p-1"
                          title="Unpin"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Digital Time & Day Indicator */}
                      <div className="flex items-baseline justify-between mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold font-mono text-white">
                            {cDig.timeStr.substring(0, 5)}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            :{cDig.timeStr.substring(6, 8)}
                          </span>
                          {cDig.period && (
                            <span className="text-xs font-semibold text-sky-400 font-mono ml-0.5">
                              {cDig.period}
                            </span>
                          )}
                        </div>

                        <span className={`text-sm ${cIsDay ? "text-amber-400" : "text-indigo-400"}`}>
                          {cIsDay ? "☀️" : "🌙"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                        <span>{cDig.dayStr.split(",")[0]}</span>
                        <span className="font-mono text-slate-500">
                          {country.timezones?.[0] || "UTC"}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
