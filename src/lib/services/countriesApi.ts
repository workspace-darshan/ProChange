// Free Countries API Service (Dynamic Fetching from https://countries.dev)

export interface ApiCountryCurrency {
  code?: string;
  name?: string;
  symbol?: string;
}

export interface ApiCountryLanguage {
  name?: string;
  iso639_1?: string;
  nativeName?: string;
}

export interface ApiCountryFlags {
  png?: string;
  svg?: string;
}

export interface ApiCountry {
  name: string;
  alpha2Code: string;
  alpha3Code: string;
  numericCode?: string;
  capital?: string;
  region: string;
  subregion?: string;
  population: number;
  area?: number;
  populationDensity?: number;
  latlng?: [number, number];
  demonym?: string;
  borders?: string[];
  flags?: ApiCountryFlags;
  currencies?: ApiCountryCurrency[];
  languages?: ApiCountryLanguage[];
  timezones?: string[];
  callingCodes?: string[];
  topLevelDomain?: string[];
  nativeName?: string;
  altSpellings?: string[];
  translations?: Record<string, string>;
  drivingSide?: "left" | "right";
}

export interface ApiCity {
  geonameId: number;
  name: string;
  asciiName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
}

// Memory caches to avoid repeated network hits
let cachedCountries: ApiCountry[] | null = null;
let countryDetailsCache = new Map<string, ApiCountry>();
let cityCache = new Map<string, ApiCity[]>();

// Fetch all 250 countries live from API
export async function fetchAllCountries(): Promise<ApiCountry[]> {
  if (cachedCountries && cachedCountries.length > 0) {
    return cachedCountries;
  }

  try {
    const res = await fetch("https://countries.dev/countries");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiCountry[] = await res.json();
    cachedCountries = data;
    // Populate individual cache
    data.forEach((c) => {
      if (c.alpha2Code) countryDetailsCache.set(c.alpha2Code.toUpperCase(), c);
      if (c.alpha3Code) countryDetailsCache.set(c.alpha3Code.toUpperCase(), c);
    });
    return data;
  } catch (err) {
    console.error("Error fetching countries from countries.dev:", err);
    // Return cached if available or fallback
    return cachedCountries || [];
  }
}

// Fetch single country details live by 2-letter or 3-letter code
export async function fetchCountryByCode(code: string): Promise<ApiCountry | null> {
  const normalized = code.toUpperCase();
  if (countryDetailsCache.has(normalized)) {
    return countryDetailsCache.get(normalized)!;
  }

  try {
    const res = await fetch(`https://countries.dev/alpha/${normalized}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiCountry = await res.json();
    countryDetailsCache.set(normalized, data);
    if (data.alpha2Code) countryDetailsCache.set(data.alpha2Code.toUpperCase(), data);
    if (data.alpha3Code) countryDetailsCache.set(data.alpha3Code.toUpperCase(), data);
    return data;
  } catch (err) {
    console.error(`Error fetching country ${code}:`, err);
    // Fallback: search in cachedCountries
    if (cachedCountries) {
      return (
        cachedCountries.find(
          (c) =>
            c.alpha2Code?.toUpperCase() === normalized ||
            c.alpha3Code?.toUpperCase() === normalized
        ) || null
      );
    }
    return null;
  }
}

// Fetch largest cities of a country
export async function fetchCitiesByCountry(countryCode: string): Promise<ApiCity[]> {
  const code = countryCode.toUpperCase();
  if (cityCache.has(code)) {
    return cityCache.get(code)!;
  }

  try {
    const res = await fetch(`https://countries.dev/cities?country=${code}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiCity[] = await res.json();
    cityCache.set(code, data);
    return data;
  } catch (err) {
    console.error(`Error fetching cities for ${countryCode}:`, err);
    return [];
  }
}

// Convert UTC offset (e.g., "UTC+05:30" or "UTC-04:00") or city timezone to a live Date
export function getAccurateDateForOffset(
  baseDate: Date,
  offsetStr?: string,
  ianaTimezone?: string
): Date {
  if (ianaTimezone) {
    try {
      const targetStr = baseDate.toLocaleString("en-US", { timeZone: ianaTimezone });
      const d = new Date(targetStr);
      if (!isNaN(d.getTime())) return d;
    } catch {
      // fallback to offset
    }
  }

  if (!offsetStr || !offsetStr.startsWith("UTC")) {
    return baseDate;
  }

  // Parse "UTC+05:30", "UTC-04:00", "UTC"
  const clean = offsetStr.replace("UTC", "").trim();
  if (!clean) {
    // UTC 0
    return new Date(baseDate.getTime() + baseDate.getTimezoneOffset() * 60000);
  }

  const sign = clean.startsWith("-") ? -1 : 1;
  const parts = clean.replace(/^[+-]/, "").split(":");
  const hours = parseInt(parts[0] || "0", 10);
  const minutes = parseInt(parts[1] || "0", 10);
  const totalOffsetMs = sign * (hours * 60 + minutes) * 60 * 1000;

  // UTC time ms
  const utcMs = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000;
  return new Date(utcMs + totalOffsetMs);
}
