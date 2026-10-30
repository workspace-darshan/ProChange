"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import {
  fetchAllCountries,
  fetchCountryByCode,
  fetchCitiesByCountry,
  ApiCountry,
  ApiCity,
} from "@/lib/services/countriesApi";

export default function WorldExplorerTool() {
  const [countries, setCountries] = useState<ApiCountry[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");
  const [countryDetail, setCountryDetail] = useState<ApiCountry | null>(null);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  // Load all 250 countries live on mount
  useEffect(() => {
    let isCancelled = false;
    setLoadingList(true);
    fetchAllCountries()
      .then((data) => {
        if (!isCancelled) {
          setCountries(data);
          setLoadingList(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setLoadingList(false);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  // When selected country code changes, fetch country details & cities
  useEffect(() => {
    let isCancelled = false;
    setLoadingDetail(true);

    Promise.all([
      fetchCountryByCode(selectedCountryCode),
      fetchCitiesByCountry(selectedCountryCode),
    ])
      .then(([detail, cityList]) => {
        if (!isCancelled) {
          setCountryDetail(detail);
          setCities(cityList);
          setLoadingDetail(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setLoadingDetail(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCountryCode]);

  // Leaflet Map Initialization & Updates (client-side dynamic)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;

    import("leaflet").then((leafletModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      const L = (leafletModule.default || leafletModule) as any;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [20, 0],
          zoom: 3,
          zoomControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersGroupRef.current = markersGroup;
        mapInstanceRef.current = map;

        setTimeout(() => map.invalidateSize(), 100);
        setTimeout(() => map.invalidateSize(), 300);
      }

      const map = mapInstanceRef.current;
      const markersGroup = markersGroupRef.current;
      if (!map || !markersGroup || !countryDetail) return;

      markersGroup.clearLayers();

      const lat = countryDetail.latlng?.[0] ?? 20;
      const lng = countryDetail.latlng?.[1] ?? 77;

      // Capital Marker
      const capitalIcon = L.divIcon({
        className: "capital-marker",
        html: `
          <div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(59,130,246,0.6);"></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const capMarker = L.marker([lat, lng], { icon: capitalIcon }).addTo(markersGroup);
      capMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 13px; font-weight: bold; color: #0f172a;">
          ★ ${countryDetail.capital || countryDetail.name} (Capital)
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          ${countryDetail.name} • ${countryDetail.population.toLocaleString()} people
        </div>
      `);

      // Add Top City Markers
      cities.slice(0, 10).forEach((city) => {
        const cityIcon = L.divIcon({
          className: "city-marker",
          html: `
            <div style="background: #6366f1; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const cm = L.marker([city.latitude, city.longitude], { icon: cityIcon }).addTo(markersGroup);
        cm.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; font-weight: bold; color: #0f172a;">
            ${city.name}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            Population: ${city.population.toLocaleString()}
          </div>
        `);
      });

      map.flyTo([lat, lng], 4, { duration: 1 });
    });

    return () => {
      isCancelled = true;
    };
  }, [countryDetail, cities]);

  // Compute World Ranks
  const ranks = useMemo(() => {
    if (!countryDetail || countries.length === 0) {
      return { popRank: "-", areaRank: "-", densRank: "-" };
    }
    const sortedPop = [...countries].sort((a, b) => (b.population || 0) - (a.population || 0));
    const popRank = sortedPop.findIndex((c) => c.alpha2Code === countryDetail.alpha2Code) + 1;

    const sortedArea = [...countries].sort((a, b) => (b.area || 0) - (a.area || 0));
    const areaRank = sortedArea.findIndex((c) => c.alpha2Code === countryDetail.alpha2Code) + 1;

    const sortedDens = [...countries].sort((a, b) => (b.populationDensity || 0) - (a.populationDensity || 0));
    const densRank = sortedDens.findIndex((c) => c.alpha2Code === countryDetail.alpha2Code) + 1;

    return {
      popRank: popRank > 0 ? `#${popRank}` : "-",
      areaRank: areaRank > 0 ? `#${areaRank}` : "-",
      densRank: densRank > 0 ? `#${densRank}` : "-",
    };
  }, [countryDetail, countries]);

  // Filter countries for search dropdown
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return countries.filter((c) => {
      const matchRegion = selectedRegion === "All" || c.region === selectedRegion;
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.alpha2Code?.toLowerCase().includes(q) ||
        c.alpha3Code?.toLowerCase().includes(q) ||
        c.capital?.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [countries, searchQuery, selectedRegion]);

  // Generate natural language intro summary
  const generateSummary = (c: ApiCountry) => {
    const langs = c.languages?.map((l) => l.name).filter(Boolean).join(" and ") || "multiple languages";
    const cur = c.currencies?.[0]?.name ? `the ${c.currencies[0].name} (${c.currencies[0].code})` : "its national currency";
    const callCode = c.callingCodes?.[0] ? `+${c.callingCodes[0]}` : "";
    const popFormatted = c.population ? c.population.toLocaleString() : "many";
    const areaFormatted = c.area ? `${c.area.toLocaleString()} km²` : "its territory";
    const dens = c.populationDensity ? `roughly ${Math.round(c.populationDensity)} people per km²` : "";

    return `${c.name} is a sovereign country in ${c.subregion || c.region}. Its capital is ${c.capital || "its principal administrative hub"}. It has a population of about ${popFormatted} across ${areaFormatted}${dens ? ` — ${dens}` : ""}. The currency is ${cur}. Official languages include ${langs}. Its ISO 3166 codes are ${c.alpha2Code}, ${c.alpha3Code}, and the international calling code is ${callCode}.`;
  };

  // Border countries mapped with details
  const borderCountries = useMemo(() => {
    if (!countryDetail?.borders || countries.length === 0) return [];
    return countryDetail.borders
      .map((borderCode) => countries.find((c) => c.alpha3Code === borderCode))
      .filter(Boolean) as ApiCountry[];
  }, [countryDetail, countries]);

  // FAQs
  const faqs = useMemo(() => {
    if (!countryDetail) return [];
    return [
      {
        q: `What is the capital of ${countryDetail.name}?`,
        a: `The capital of ${countryDetail.name} is ${countryDetail.capital || "N/A"}.`,
      },
      {
        q: `What is the population of ${countryDetail.name}?`,
        a: `${countryDetail.name} has a population of approximately ${countryDetail.population.toLocaleString()} people (ranked ${ranks.popRank} globally).`,
      },
      {
        q: `What currency is used in ${countryDetail.name}?`,
        a: countryDetail.currencies?.map((c) => `${c.name} (${c.code}${c.symbol ? ` - ${c.symbol}` : ""})`).join(", ") || "Information not available.",
      },
      {
        q: `What languages are spoken in ${countryDetail.name}?`,
        a: countryDetail.languages?.map((l) => l.name).filter(Boolean).join(", ") || "Information not available.",
      },
      {
        q: `What is the international calling code for ${countryDetail.name}?`,
        a: countryDetail.callingCodes?.map((code) => `+${code}`).join(", ") || "N/A",
      },
      {
        q: `Which countries border ${countryDetail.name}?`,
        a: borderCountries.length > 0 ? borderCountries.map((b) => b.name).join(", ") : `${countryDetail.name} has no direct land borders (island nation or maritime territory).`,
      },
    ];
  }, [countryDetail, ranks, borderCountries]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 font-sans text-slate-100">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="relative flex-1 max-w-lg">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 250 countries live (e.g. India, Japan, Germany, US)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-xs text-white placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {["All", "Asia", "Europe", "Africa", "Americas", "Oceania"].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedRegion === reg
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Countries Selector Pills */}
      {searchQuery && filteredCountries.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {filteredCountries.slice(0, 30).map((c) => (
            <button
              key={c.alpha2Code}
              onClick={() => {
                setSelectedCountryCode(c.alpha2Code);
                setSearchQuery("");
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 hover:border-sky-500/40 border border-slate-700 text-xs text-white transition-all"
            >
              {c.flags?.svg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.flags.svg}
                  alt={c.name}
                  className="w-4 h-3 object-cover rounded-sm"
                />
              )}
              <span className="font-semibold">{c.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {c.alpha2Code}
              </span>
            </button>
          ))}
        </div>
      )}

      {loadingDetail && !countryDetail && (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">Fetching live country data from countries.dev API...</span>
        </div>
      )}

      {countryDetail && (
        <div className="space-y-6">
          {/* Main White/Dark Card Container matching countries.dev layout */}
          <div className="rounded-3xl border border-slate-800 bg-[#0e121b] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header: Flag, Country Code, Name, Subtitle, and Top-Right Meta Box */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-800/80">
              <div className="flex items-start gap-5">
                {/* Large Flag */}
                <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden shadow-lg border border-slate-700 flex-shrink-0 bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/w320/${countryDetail.alpha2Code.toLowerCase()}.png`}
                    alt={countryDetail.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (countryDetail.flags?.svg) {
                        (e.target as HTMLImageElement).src = countryDetail.flags.svg;
                      }
                    }}
                  />
                </div>

                {/* Country Title & Region Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    COUNTRY
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xl font-mono font-bold text-slate-400">
                      {countryDetail.alpha2Code}
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {countryDetail.name}
                    </h1>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Native: <span className="text-slate-200">{countryDetail.nativeName || countryDetail.name}</span>
                  </div>

                  {/* Breadcrumb / Region Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                    <span>{countryDetail.region}</span>
                    <span>•</span>
                    <span>{countryDetail.subregion || "Global"}</span>
                    {countryDetail.demonym && (
                      <>
                        <span>•</span>
                        <span className="text-sky-400 font-medium">{countryDetail.demonym}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Top-Right Quick Codes Box (matching user's screenshot) */}
              <div className="w-full md:w-auto p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs font-mono space-y-1.5 text-slate-300 min-w-[210px]">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-500 text-[10px]">ISO</span>
                  <span className="text-white font-bold">
                    {countryDetail.alpha2Code} • {countryDetail.alpha3Code} • {countryDetail.numericCode || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-500 text-[10px]">LAT, LNG</span>
                  <span className="text-slate-300">
                    {countryDetail.latlng?.[0]?.toFixed(2) ?? "-"}, {countryDetail.latlng?.[1]?.toFixed(2) ?? "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-500 text-[10px]">TEL</span>
                  <span className="text-emerald-400 font-bold">
                    +{countryDetail.callingCodes?.[0] || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Natural Language Intro Paragraph */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {generateSummary(countryDetail)}
            </p>

            {/* Interactive Leaflet Map Centered on Country */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 relative">
              <div ref={mapContainerRef} className="w-full h-80 z-0" />
              <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Capital: {countryDetail.capital}</span>
                <span className="text-slate-500">•</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>{cities.length} Major Cities Mapped</span>
              </div>
            </div>

            {/* 4 Key Statistics Cards with World Ranks (matching screenshot) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Capital */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>🏛️ CAPITAL</span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {countryDetail.capital || "N/A"}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Seat of government
                  </div>
                </div>
              </div>

              {/* Population */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>👥 POPULATION</span>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {ranks.popRank}
                  </span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {countryDetail.population.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Inhabitants
                  </div>
                </div>
              </div>

              {/* Area */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>📐 AREA</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {ranks.areaRank}
                  </span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {countryDetail.area ? countryDetail.area.toLocaleString() : "-"} km²
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Total land & water
                  </div>
                </div>
              </div>

              {/* Density */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>⚡ DENSITY</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {ranks.densRank}
                  </span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {countryDetail.populationDensity
                      ? `${Math.round(countryDetail.populationDensity)} /km²`
                      : "-"}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    People per km²
                  </div>
                </div>
              </div>
            </div>

            {/* KEY FACTS ABOUT [COUNTRY] (9-Box Grid matching screenshot) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  KEY FACTS ABOUT {countryDetail.name.toUpperCase()}
                </h3>
                <span className="text-[10px] text-sky-400 font-mono">
                  api: countries.dev
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Calling Code */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      CALLING CODE
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      +{countryDetail.callingCodes?.[0] || "N/A"}
                    </span>
                  </div>
                  <span className="text-lg">📞</span>
                </div>

                {/* 2. Currency */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      CURRENCY
                    </span>
                    <span className="text-sm font-bold text-white">
                      {countryDetail.currencies?.[0]?.code || "N/A"}
                      {countryDetail.currencies?.[0]?.symbol
                        ? ` (${countryDetail.currencies[0].symbol})`
                        : ""}
                    </span>
                  </div>
                  <span className="text-lg">💰</span>
                </div>

                {/* 3. Languages */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      LANGUAGES
                    </span>
                    <span className="text-sm font-bold text-white line-clamp-1">
                      {countryDetail.languages?.map((l) => l.name).filter(Boolean).join(", ") || "N/A"}
                    </span>
                  </div>
                  <span className="text-lg">🗣️</span>
                </div>

                {/* 4. Demonym */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      DEMONYM
                    </span>
                    <span className="text-sm font-bold text-white">
                      {countryDetail.demonym || "N/A"}
                    </span>
                  </div>
                  <span className="text-lg">👤</span>
                </div>

                {/* 5. Time Zones */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      TIME ZONES
                    </span>
                    <span className="text-sm font-bold font-mono text-sky-400">
                      {countryDetail.timezones?.join(", ") || "UTC"}
                    </span>
                  </div>
                  <span className="text-lg">🕒</span>
                </div>

                {/* 6. Driving Side */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      DRIVING SIDE
                    </span>
                    <span className="text-sm font-bold text-white capitalize">
                      {countryDetail.drivingSide || "right"}
                    </span>
                  </div>
                  <span className="text-lg">🚗</span>
                </div>

                {/* 7. Internet TLD */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      TOP-LEVEL DOMAIN
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {countryDetail.topLevelDomain?.join(", ") || "N/A"}
                    </span>
                  </div>
                  <span className="text-lg">🌐</span>
                </div>

                {/* 8. Coordinates */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      COORDINATES
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {countryDetail.latlng?.[0] ?? "-"}°, {countryDetail.latlng?.[1] ?? "-"}°
                    </span>
                  </div>
                  <span className="text-lg">📍</span>
                </div>

                {/* 9. Capital City */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      CAPITAL
                    </span>
                    <span className="text-sm font-bold text-white">
                      {countryDetail.capital || "N/A"}
                    </span>
                  </div>
                  <span className="text-lg">🏛️</span>
                </div>
              </div>
            </div>

            {/* OTHER NAMES FOR [COUNTRY] */}
            {countryDetail.altSpellings && countryDetail.altSpellings.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  OTHER NAMES FOR {countryDetail.name.toUpperCase()}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {countryDetail.altSpellings.map((alt) => (
                    <span
                      key={alt}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300"
                    >
                      {alt}
                    </span>
                  ))}
                  {countryDetail.translations &&
                    Object.values(countryDetail.translations).slice(0, 6).map((trans) => (
                      <span
                        key={trans}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs font-medium text-slate-400"
                      >
                        {trans}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* LARGEST CITIES IN [COUNTRY] (matching screenshot) */}
            {cities.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    LARGEST CITIES IN {countryDetail.name.toUpperCase()} ({cities.length})
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Live Geonames API
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cities.slice(0, 12).map((city, idx) => (
                    <div
                      key={city.geonameId}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between hover:border-sky-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {city.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {city.population.toLocaleString()} people
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {city.timezone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COUNTRIES BORDERING [COUNTRY] */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                COUNTRIES BORDERING {countryDetail.name.toUpperCase()} ({borderCountries.length})
              </h3>

              {borderCountries.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {borderCountries.map((border) => (
                    <button
                      key={border.alpha2Code}
                      onClick={() => setSelectedCountryCode(border.alpha2Code)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-sky-500/20 border border-slate-800 hover:border-sky-500/50 text-xs text-white transition-all shadow-sm group"
                    >
                      {border.flags?.svg && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={border.flags.svg}
                          alt={border.name}
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                      )}
                      <span className="font-semibold group-hover:text-sky-300">
                        {border.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({border.alpha2Code})
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  No land borders (island nation or sovereign island territory).
                </div>
              )}
            </div>

            {/* FREQUENTLY ASKED QUESTIONS ABOUT [COUNTRY] (Accordion matching screenshot) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                FREQUENTLY ASKED QUESTIONS ABOUT {countryDetail.name.toUpperCase()}
              </h3>

              <div className="space-y-2">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={faq.q}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-white hover:bg-slate-800/40 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <span className="text-slate-400 text-sm">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 text-xs text-slate-300 border-t border-slate-800/60 pt-2 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUERY [COUNTRY] FROM THE API (Dev query snippets matching screenshot) */}
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    QUERY {countryDetail.name.toUpperCase()} FROM THE API
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Free REST API without API keys — endpoints used to dynamically fetch this country:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">GET</span>
                    <span className="text-slate-300">countries.dev/alpha/{countryDetail.alpha2Code}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">2-letter ISO</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">GET</span>
                    <span className="text-slate-300">countries.dev/alpha/{countryDetail.alpha3Code}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">3-letter ISO</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">GET</span>
                    <span className="text-slate-300">countries.dev/cities?country={countryDetail.alpha2Code}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Largest cities</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">GET</span>
                    <span className="text-slate-300">countries.dev/countries</span>
                  </div>
                  <span className="text-[10px] text-slate-500">All 250 countries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
