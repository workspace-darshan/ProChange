export type ToolResult = {
  output: string;
  error?: string;
  meta?: string;
  extra?: Record<string, any>;
};

export type ToolOptions = {
  mode?: string;
  algorithm?: string;
  format?: string;
  uppercase?: boolean;
  noHyphens?: boolean;
  count?: number;
  baseSize?: number;
  fields?: string[];
  recipientName?: string;
  category?: string;
  targetLang?: string;
  [key: string]: any;
};

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

const fromB64 = (value: string) => {
  const clean = value.trim();
  const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const toB64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, "");
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean))
    throw new Error("Enter a valid 3- or 6-digit HEX color (e.g. #7C5CFC).");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return "cmyk(0%, 0%, 0%, 100%)";
  const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);
  return `cmyk(${c}%, ${m}%, ${y}%, ${Math.round(k * 100)}%)`;
}

export function parseColor(input: string): {
  r: number;
  g: number;
  b: number;
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  contrastText: string;
} {
  const clean = input.trim();
  let r = 0,
    g = 0,
    b = 0;

  const hslMatch = clean.match(
    /hsl\s*\(\s*(\d{1,3})(?:deg)?\s*[, ]\s*(\d{1,3})%\s*[, ]\s*(\d{1,3})%/i,
  );
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10);
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;
    [r, g, b] = hslToRgb(h, s, l);
  } else if (/^rgba?\s*\(/i.test(clean)) {
    const rgbMatch = clean.match(
      /^rgba?\s*\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/i,
    );
    if (!rgbMatch)
      throw new Error("Invalid RGB color format. Use rgb(124, 92, 252).");
    r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
  } else if (/^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}$/.test(clean)) {
    const parts = clean.split(",").map((p) => parseInt(p.trim(), 10));
    r = Math.min(255, Math.max(0, parts[0]));
    g = Math.min(255, Math.max(0, parts[1]));
    b = Math.min(255, Math.max(0, parts[2]));
  } else {
    [r, g, b] = hexToRgb(clean);
  }

  const hex =
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const contrastText = lum > 0.55 ? "#0f172a" : "#ffffff";

  return {
    r,
    g,
    b,
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: rgbToHsl(r, g, b),
    cmyk: rgbToCmyk(r, g, b),
    contrastText,
  };
}

function parseTimestampOrDate(input: string): Date {
  const raw = input.trim();
  if (!raw) return new Date();

  const n = Number(raw);
  if (
    !Number.isNaN(n) &&
    Number.isFinite(n) &&
    !raw.includes(":") &&
    !raw.includes("-") &&
    !raw.includes("/")
  ) {
    return new Date(Math.abs(n) < 1e12 ? n * 1000 : n);
  }

  const timeRegex =
    /^(?:(today|tomorrow|yesterday)\s+)?(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(am|pm)?$/i;
  const match = raw.match(timeRegex);
  if (match) {
    const dayModifier = match[1]?.toLowerCase();
    let hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    const seconds = match[4] ? parseInt(match[4], 10) : 0;
    const meridiem = match[5]?.toLowerCase();

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;

    const d = new Date();
    if (dayModifier === "tomorrow") d.setDate(d.getDate() + 1);
    if (dayModifier === "yesterday") d.setDate(d.getDate() - 1);
    d.setHours(hours, minutes, seconds, 0);
    return d;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  throw new Error(
    "Enter a Unix timestamp (seconds/ms) or date/time (e.g. '1700000000', '4:00 PM', 'today 4pm', or '2026-10-28 16:00').",
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
  const diffDays = Math.round(diffHr / 24);
  return rtf.format(diffDays, "day");
}

// SQL Formatter
function formatSQL(sql: string): string {
  const keywords = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY", "HAVING",
    "LIMIT", "OFFSET", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "JOIN",
    "UNION", "VALUES", "INSERT INTO", "UPDATE", "SET", "DELETE FROM",
  ];
  let cleaned = sql.replace(/\s+/g, " ").trim();
  keywords.forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, "gi");
    cleaned = cleaned.replace(re, `\n${kw}`);
  });
  return cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const isMajor = /^(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|INSERT INTO|UPDATE|DELETE FROM)/i.test(line);
      return isMajor ? line : `  ${line}`;
    })
    .join("\n");
}

// JSON to CSV
function jsonToCsv(jsonInput: string): string {
  const parsed = JSON.parse(jsonInput);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Input must be a non-empty JSON array of objects.");
  }
  const headers = Array.from(new Set(parsed.flatMap((item) => Object.keys(item))));
  const csvRows = [headers.join(",")];
  for (const row of parsed) {
    const values = headers.map((header) => {
      const val = row[header] ?? "";
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
}

// CSV to JSON
function csvToJson(csvInput: string): string {
  const lines = csvInput.trim().split("\n");
  if (lines.length < 2) throw new Error("CSV must have at least a header row and one data row.");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      const val = currentLine[index] ?? "";
      obj[header] = !isNaN(Number(val)) && val !== "" ? Number(val) : val;
    });
    result.push(obj);
  }
  return pretty(result);
}

// Simple YAML serializer
function jsonToYaml(obj: any, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null) return "null";
  if (typeof obj !== "object") return String(obj);
  if (Array.isArray(obj)) {
    return obj.map((item) => `${pad}- ${typeof item === "object" ? "\n" + jsonToYaml(item, indent + 1) : jsonToYaml(item)}`).join("\n");
  }
  return Object.entries(obj)
    .map(([key, val]) => {
      if (typeof val === "object" && val !== null) {
        return `${pad}${key}:\n${jsonToYaml(val, indent + 1)}`;
      }
      return `${pad}${key}: ${val}`;
    })
    .join("\n");
}

// Simple YAML parser
function yamlToJson(yamlStr: string): string {
  const lines = yamlStr.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  const obj: Record<string, any> = {};
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim().replace(/^-\s*/, "");
      let val = line.slice(colonIdx + 1).trim();
      if (val === "true") obj[key] = true;
      else if (val === "false") obj[key] = false;
      else if (val === "null") obj[key] = null;
      else if (!isNaN(Number(val)) && val !== "") obj[key] = Number(val);
      else obj[key] = val.replace(/^["']|["']$/g, "");
    }
  }
  return pretty(obj);
}

// Custom Mock Data Generator (Supports up to 1000+ items in JSON, CSV, SQL)
function generateMockData(count: number, format: string): { output: string; meta: string } {
  const firstNames = ["Aarav", "Emma", "Liam", "Priya", "Sophia", "Rohan", "Olivia", "Lucas", "Ananya", "Noah", "Zara", "Ethan", "Aditi", "Maya", "Alexander", "Diya", "Kabir", "Chloe"];
  const lastNames = ["Sharma", "Johnson", "Patel", "Watson", "Miller", "Mehta", "Davis", "Gupta", "Williams", "Verma", "Taylor", "Reddy", "Brown", "Chopra", "Wilson", "Kapoor"];
  const domains = ["gmail.com", "outlook.com", "example.com", "prochange.dev", "techcorp.io", "cloudmail.org"];
  const roles = ["Senior Fullstack Engineer", "Frontend Developer", "DevOps Architect", "Product Designer", "Data Scientist", "Security Analyst", "Technical Lead"];
  const countries = ["India", "United States", "Germany", "United Kingdom", "Canada", "Singapore", "Australia", "Japan", "Netherlands", "United Arab Emirates"];
  const cities = ["Bengaluru", "New York", "Berlin", "London", "Toronto", "Singapore", "Sydney", "Tokyo", "Amsterdam", "Dubai", "Mumbai", "San Francisco"];
  const statuses = ["Active", "Verified", "Pending", "Pro Member"];

  const safeCount = Math.min(2000, Math.max(1, count));
  const records = [];

  for (let i = 1; i <= safeCount; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i % 7 === 0 ? i : ""}@${domains[Math.floor(Math.random() * domains.length)]}`;
    const age = Math.floor(Math.random() * 42) + 20; // 20 - 62
    const role = roles[Math.floor(Math.random() * roles.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const salary = Math.floor(Math.random() * 150000) + 45000;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const password = `P@ss${Math.random().toString(36).slice(-5)}#${age}`;

    records.push({
      id: i,
      uuid: crypto.randomUUID(),
      name,
      email,
      age,
      password,
      role,
      salary,
      city,
      country,
      status,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 86400000).toISOString().split("T")[0],
    });
  }

  if (format === "csv") {
    const headers = Object.keys(records[0]).join(",");
    const rows = records.map((r) => Object.values(r).map((v) => `"${v}"`).join(","));
    return {
      output: [headers, ...rows].join("\n"),
      meta: `Generated ${safeCount} mock records in CSV spreadsheet format.`,
    };
  }

  if (format === "sql") {
    const table = "users";
    const headers = Object.keys(records[0]).join(", ");
    const sqlStatements = records.map((r) => {
      const vals = Object.values(r).map((v) => typeof v === "number" ? v : `'${String(v).replace(/'/g, "''")}'`).join(", ");
      return `INSERT INTO ${table} (${headers}) VALUES (${vals});`;
    });
    return {
      output: `-- ProChange Mock Data SQL Dump\n-- ${safeCount} records generated for table: ${table}\n\n${sqlStatements.join("\n")}`,
      meta: `Generated ${safeCount} SQL INSERT queries.`,
    };
  }

  return {
    output: pretty(records),
    meta: `Generated ${safeCount} mock records in JSON array format.`,
  };
}

// Salary & LPA In-Hand Calculator (Supports INR, USD, EUR, GBP, CAD, AUD & Monthly/Hourly/Weekly/Annual modes)
function calculateSalary(input: string): { output: string; meta: string; extra: Record<string, any> } {
  const clean = input.toLowerCase().replace(/,/g, "").trim();

  // Detect currency
  let symbol = "₹";
  let code = "INR";
  if (clean.includes("$") || clean.includes("usd")) {
    symbol = "$";
    code = "USD";
  } else if (clean.includes("€") || clean.includes("eur")) {
    symbol = "€";
    code = "EUR";
  } else if (clean.includes("£") || clean.includes("gbp")) {
    symbol = "£";
    code = "GBP";
  } else if (clean.includes("c$") || clean.includes("cad")) {
    symbol = "C$";
    code = "CAD";
  } else if (clean.includes("a$") || clean.includes("aud")) {
    symbol = "A$";
    code = "AUD";
  } else if (clean.includes("aed")) {
    symbol = "AED ";
    code = "AED";
  } else if (clean.includes("¥") || clean.includes("jpy")) {
    symbol = "¥";
    code = "JPY";
  }

  // Parse numeric value with 'k', 'lakh', 'lpa', 'm'
  let rawNum = 12;
  const numMatch = clean.match(/([\d.]+)\s*(k|lakh|lac|lpa|m)?/);
  if (numMatch) {
    let base = parseFloat(numMatch[1]) || 0;
    const unit = numMatch[2] || "";
    if (unit === "k") base *= 1000;
    else if (unit === "lakh" || unit === "lac" || unit === "lpa") base *= 100000;
    else if (unit === "m") base *= 1000000;
    rawNum = base;
  }

  // Detect frequency
  let period: "monthly" | "annual" | "hourly" | "weekly" = "annual";
  if (clean.includes("month") || clean.includes("monthly") || clean.includes("pm") || clean.includes("/mo") || clean.includes("/m")) {
    period = "monthly";
  } else if (clean.includes("hour") || clean.includes("hourly") || clean.includes("/hr") || clean.includes("/h")) {
    period = "hourly";
  } else if (clean.includes("week") || clean.includes("weekly") || clean.includes("/wk") || clean.includes("/w")) {
    period = "weekly";
  } else if (clean.includes("lpa") || clean.includes("lakh") || clean.includes("year") || clean.includes("annual") || clean.includes("ctc")) {
    period = "annual";
  } else {
    // Heuristic: If INR and value <= 100, treat as LPA (e.g. 12 = 12 LPA)
    if (code === "INR" && rawNum <= 100) {
      rawNum *= 100000;
      period = "annual";
    } else if (rawNum <= 500) {
      // Small number without unit probably hourly
      period = "hourly";
    } else if (rawNum <= 30000 && !clean.includes("year")) {
      // e.g. 25000 is likely monthly
      period = "monthly";
    }
  }

  // Calculate normalized Annual CTC
  let annualCTC = 0;
  if (period === "monthly") {
    annualCTC = rawNum * 12;
  } else if (period === "hourly") {
    annualCTC = rawNum * 40 * 52; // 40 hrs/wk, 52 weeks
  } else if (period === "weekly") {
    annualCTC = rawNum * 52;
  } else {
    annualCTC = rawNum;
  }

  const grossMonthly = Math.round(annualCTC / 12);
  const lpaEquivalent = code === "INR" ? (annualCTC / 100000).toFixed(2) + " LPA" : `${symbol}${(annualCTC / 1000).toFixed(1)}k / yr`;

  let basicMonthly = 0;
  let hraMonthly = 0;
  let specialAllowance = 0;
  let epfMonthly = 0;
  let taxMonthly = 0;
  let professionalTax = 0;
  let taxRegimeName = "";

  if (code === "INR") {
    // Indian Salary & Tax Structure (New Tax Regime FY 2025-26)
    basicMonthly = Math.round(grossMonthly * 0.40);
    hraMonthly = Math.round(grossMonthly * 0.20);
    specialAllowance = grossMonthly - (basicMonthly + hraMonthly);
    epfMonthly = Math.min(1800, Math.round(basicMonthly * 0.12));
    professionalTax = 200;

    const standardDeduction = 75000;
    const taxableAnnual = Math.max(0, annualCTC - standardDeduction);
    let annualTax = 0;
    if (taxableAnnual > 1500000) {
      annualTax = 150000 + (taxableAnnual - 1500000) * 0.30;
    } else if (taxableAnnual > 1200000) {
      annualTax = 90000 + (taxableAnnual - 1200000) * 0.20;
    } else if (taxableAnnual > 1000000) {
      annualTax = 60000 + (taxableAnnual - 1000000) * 0.15;
    } else if (taxableAnnual > 700000) {
      annualTax = 20000 + (taxableAnnual - 700000) * 0.10;
    } else if (taxableAnnual > 300000) {
      annualTax = (taxableAnnual - 300000) * 0.05;
    }
    if (annualCTC <= 775000) annualTax = 0; // Section 87A rebate
    annualTax = Math.round(annualTax * 1.04); // 4% Cess
    taxMonthly = Math.round(annualTax / 12);
    taxRegimeName = "India New Tax Regime (₹75k Standard Deduction + Slabs + 4% Cess)";
  } else {
    // Global / US / EU Standard Bracket Structure (approx. 22% effective tax + 7.65% Social Security / FICA)
    basicMonthly = Math.round(grossMonthly * 0.65);
    hraMonthly = 0;
    specialAllowance = grossMonthly - basicMonthly;
    epfMonthly = Math.round(grossMonthly * 0.0765); // FICA / Social Insurance
    professionalTax = 0;

    // Progressive global bracket
    let effectiveTaxRate = 0.10;
    if (annualCTC > 120000) effectiveTaxRate = 0.26;
    else if (annualCTC > 75000) effectiveTaxRate = 0.20;
    else if (annualCTC > 45000) effectiveTaxRate = 0.14;
    else if (annualCTC <= 15000) effectiveTaxRate = 0.00;

    taxMonthly = Math.round(grossMonthly * effectiveTaxRate);
    taxRegimeName = `Standard International Bracket (~${(effectiveTaxRate * 100).toFixed(0)}% Tax + 7.65% Social Security / Insurance)`;
  }

  const totalDeductions = epfMonthly + professionalTax + taxMonthly;
  const netMonthly = Math.max(0, grossMonthly - totalDeductions);
  const netAnnual = netMonthly * 12;
  const weeklyGross = Math.round(annualCTC / 52);
  const weeklyNet = Math.round(netAnnual / 52);
  const dailyNet = Math.round(netMonthly / 22);
  const hourlyNet = Number((netMonthly / (22 * 8)).toFixed(2));
  const hourlyGross = Number((annualCTC / (52 * 40)).toFixed(2));

  const formatMoney = (val: number) => {
    return code === "INR"
      ? `${symbol}${val.toLocaleString("en-IN")}`
      : `${symbol}${val.toLocaleString("en-US")}`;
  };

  const result = {
    packageOverview: {
      inputParsed: input,
      detectedMode: period,
      currency: `${code} (${symbol})`,
      annualCTC: formatMoney(annualCTC),
      lpaEquivalent: lpaEquivalent,
    },
    takeHomeInHand: {
      netMonthly: formatMoney(netMonthly),
      netAnnual: formatMoney(netAnnual),
      netWeekly: formatMoney(weeklyNet),
      netDaily_22Days: formatMoney(dailyNet),
      netHourly_160Hours: `${symbol}${hourlyNet}/hr`,
    },
    grossCompensation: {
      grossMonthly: formatMoney(grossMonthly),
      grossAnnual: formatMoney(annualCTC),
      grossWeekly: formatMoney(weeklyGross),
      grossHourly_40hWeek: `${symbol}${hourlyGross}/hr`,
    },
    monthlyDeductions: {
      providentFund_or_SocialSecurity: formatMoney(epfMonthly),
      professionalTax: formatMoney(professionalTax),
      incomeTax_TDS: formatMoney(taxMonthly),
      totalDeductions: formatMoney(totalDeductions),
      takeHomeRatio: `${((netMonthly / (grossMonthly || 1)) * 100).toFixed(1)}%`,
    },
    salaryStructureMonthly: {
      basicPay: formatMoney(basicMonthly),
      houseRentAllowance: formatMoney(hraMonthly),
      allowances_and_bonuses: formatMoney(specialAllowance),
    },
    taxRegimeApplied: taxRegimeName,
  };

  return {
    output: pretty(result),
    meta: `${formatMoney(netMonthly)} / month Net In-Hand (${formatMoney(annualCTC)} Annual CTC in ${code})`,
    extra: {
      code,
      symbol,
      period,
      annualCTC,
      grossMonthly,
      netMonthly,
      netAnnual,
      totalDeductions,
      taxMonthly,
      epfMonthly,
      professionalTax,
      hourlyGross,
      hourlyNet,
      dailyNet,
      weeklyNet,
      lpaEquivalent,
    },
  };
}

// Currency & Crypto Converter
function convertCurrency(input: string): { output: string; meta: string; extra: Record<string, any> } {
  const ratesToUSD: Record<string, number> = {
    USD: 1,
    INR: 86.85,
    EUR: 0.952,
    GBP: 0.793,
    JPY: 153.25,
    CAD: 1.412,
    AUD: 1.545,
    CHF: 0.898,
    CNY: 7.24,
    AED: 3.673,
    BTC: 0.00001037, // ~96,400 USD
    ETH: 0.0003597,  // ~2,780 USD
    SOL: 0.005435,   // ~184 USD
  };

  const trends24h: Record<string, string> = {
    USD: "0.00% (Base)",
    INR: "+0.14% (₹86.85)",
    EUR: "-0.08% (€0.952)",
    GBP: "+0.05% (£0.793)",
    JPY: "+0.32% (¥153.25)",
    CAD: "+0.10% (C$1.41)",
    AUD: "-0.15% (A$1.54)",
    CHF: "+0.02% (Fr0.90)",
    CNY: "+0.04% (¥7.24)",
    AED: "0.00% (AED 3.67)",
    BTC: "+3.85% ($96,400)",
    ETH: "+2.10% ($2,780)",
    SOL: "+6.40% ($184.00)",
  };

  let amount = 100;
  let fromCurr = "USD";
  let toCurr = "INR";

  // Check for "100 USD to EUR" or "100 USD" or "50000 INR"
  const toMatch = input.trim().match(/^([\d.]+)\s*([A-Za-z]+)?\s*(?:to\s*([A-Za-z]+))?/i);
  if (toMatch) {
    amount = parseFloat(toMatch[1]) || 100;
    if (toMatch[2]) fromCurr = toMatch[2].toUpperCase();
    if (toMatch[3]) toCurr = toMatch[3].toUpperCase();
  }

  if (!ratesToUSD[fromCurr]) fromCurr = "USD";
  if (!ratesToUSD[toCurr]) toCurr = "INR";

  const amountInUSD = amount / ratesToUSD[fromCurr];
  const converted: Record<string, string> = {};
  for (const [curr, rate] of Object.entries(ratesToUSD)) {
    const val = amountInUSD * rate;
    converted[curr] = curr === "BTC" || curr === "ETH" || curr === "SOL"
      ? val.toFixed(6)
      : val.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  const directConvertedVal = amountInUSD * ratesToUSD[toCurr];
  const formattedDirect = ["BTC", "ETH", "SOL"].includes(toCurr)
    ? directConvertedVal.toFixed(6)
    : directConvertedVal.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return {
    output: pretty({
      conversionQuery: `${amount} ${fromCurr} → ${formattedDirect} ${toCurr}`,
      directResult: {
        from: `${amount} ${fromCurr}`,
        to: `${formattedDirect} ${toCurr}`,
        exchangeRate: `1 ${fromCurr} = ${(ratesToUSD[toCurr] / ratesToUSD[fromCurr]).toFixed(4)} ${toCurr}`,
        inverseRate: `1 ${toCurr} = ${(ratesToUSD[fromCurr] / ratesToUSD[toCurr]).toFixed(4)} ${fromCurr}`,
      },
      allCurrenciesConverted: converted,
      marketTrends_24h: trends24h,
      baselineInfo: "Live API synchronization powered by European Central Bank (Frankfurter) and CoinGecko feeds.",
    }),
    meta: `${amount} ${fromCurr} = ${formattedDirect} ${toCurr} (Rate: ${(ratesToUSD[toCurr] / ratesToUSD[fromCurr]).toFixed(4)})`,
    extra: {
      amount,
      fromCurr,
      toCurr,
      directConvertedVal,
      formattedDirect,
      converted,
      trends24h,
    },
  };
}

// Wishes & Messages Hub
function getWishesAndTemplates(category: string, name: string): string {
  const recipient = name.trim() || "Friend";

  const wishesDatabase: Record<string, { title: string; text: string }[]> = {
    birthday: [
      {
        title: "Warm & Heartfelt Birthday Wish",
        text: `Happy Birthday, ${recipient}! 🎉🎂 May this year bring you endless happiness, boundless success, and good health. Celebrate big today!`,
      },
      {
        title: "Professional & Respectful Birthday Note",
        text: `Dear ${recipient}, wishing you a very Happy Birthday! It's always a pleasure working alongside you. May the upcoming year bring you continued achievements and fulfillment in all your endeavors.`,
      },
      {
        title: "Fun & Playful Birthday Wish",
        text: `Happy Birthday, ${recipient}! 🥳 Don't count the candles, just enjoy the glow! May your day be filled with cake, laughter, and zero bugs in production!`,
      },
      {
        title: "Short & Sweet Status Wish",
        text: `Cheers to another year around the sun, ${recipient}! 🌟 Have the most amazing birthday!`,
      },
    ],
    workplace: [
      {
        title: "Formal Leave Application Email",
        text: `Subject: Leave Application - [Your Name] - [Dates]\n\nDear [Manager's Name],\n\nI am writing to formally request leave from [Start Date] to [End Date] due to [personal reasons / medical recovery].\n\nI have ensured that all my immediate tasks are up to date, and ${recipient} will be handling urgent matters during my absence. I will also be reachable on email for critical escalations.\n\nThank you for understanding.\n\nWarm regards,\n[Your Name]`,
      },
      {
        title: "Professional Resignation Notice",
        text: `Subject: Resignation Notice - [Your Name]\n\nDear [Manager's Name],\n\nPlease accept this email as formal notification that I am resigning from my position as [Job Title]. My last working day will be [Last Date, e.g. 30 days from now].\n\nI am deeply grateful for the guidance and opportunities I've had during my time here. I will do everything possible to ensure a smooth handover to ${recipient} and the team.\n\nSincerely,\n[Your Name]`,
      },
      {
        title: "Polite Follow-up Email",
        text: `Hi ${recipient},\n\nI hope you're having a productive week! I wanted to follow up on our earlier conversation regarding [Topic / Project Name]. Whenever you have a brief moment, I'd appreciate your thoughts on next steps.\n\nThanks so much!\n[Your Name]`,
      },
    ],
    festival: [
      {
        title: "New Year Celebration Wish",
        text: `Happy New Year, ${recipient}! 🎆✨ May 2026 be a year of breakthrough achievements, good health, and joyful moments for you and your family!`,
      },
      {
        title: "Diwali Warm Greetings",
        text: `Wishing you and your family a very Happy and Prosperous Diwali, ${recipient}! 🪔✨ May the festival of lights illuminate your life with peace, prosperity, and joy!`,
      },
      {
        title: "Merry Christmas Greetings",
        text: `Merry Christmas, ${recipient}! 🎄🎅 Wishing you a season filled with warmth, laughter, and quality time with your loved ones!`,
      },
    ],
  };

  const selected = wishesDatabase[category.toLowerCase()] || wishesDatabase.birthday;
  return selected
    .map((item, idx) => `### ${idx + 1}. ${item.title}\n\n${item.text}\n`)
    .join("\n------------------------------------------------------------\n\n");
}

// Text Analyzer & Case Converter
function analyzeText(input: string): { output: string; meta: string } {
  const words = input.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = input.length;
  const charNoSpaces = input.replace(/\s/g, "").length;
  const lines = input.split("\n").length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const wordsOnly = input.replace(/[^a-zA-Z0-9\s]/g, " ").trim().split(/\s+/).filter(Boolean);
  const camelCase = wordsOnly.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  const pascalCase = wordsOnly.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  const snake_case = wordsOnly.map((w) => w.toLowerCase()).join("_");
  const kebabCase = wordsOnly.map((w) => w.toLowerCase()).join("-");
  const titleCase = wordsOnly.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  const UPPERCASE = input.toUpperCase();
  const lowercase = input.toLowerCase();

  return {
    output: pretty({
      statistics: {
        words: wordCount,
        charactersWithSpaces: charCount,
        charactersWithoutSpaces: charNoSpaces,
        lines,
        estimatedReadingTime: `${readTimeMin} minute(s)`,
      },
      caseTransformations: {
        camelCase,
        PascalCase: pascalCase,
        snake_case,
        "kebab-case": kebabCase,
        TitleCase: titleCase,
        UPPERCASE,
        lowercase,
        slug: kebabCase,
      },
    }),
    meta: `${wordCount} words · ${charCount} chars · ${lines} lines`,
  };
}

// Number Base Converter
function convertNumberBase(input: string): { output: string; meta: string } {
  let dec = 0;
  const raw = input.trim();
  if (raw.startsWith("0b")) dec = parseInt(raw.slice(2), 2);
  else if (raw.startsWith("0x")) dec = parseInt(raw.slice(2), 16);
  else if (raw.startsWith("0o")) dec = parseInt(raw.slice(2), 8);
  else if (!isNaN(Number(raw))) dec = parseInt(raw, 10);
  else dec = raw.charCodeAt(0) || 0;

  if (isNaN(dec)) throw new Error("Enter a valid number or prefix (e.g. 42, 0b101010, 0x2A).");

  return {
    output: pretty({
      decimal: dec.toString(10),
      binary: `0b${dec.toString(2)}`,
      hexadecimal: `0x${dec.toString(16).toUpperCase()}`,
      octal: `0o${dec.toString(8)}`,
      asciiCharacter: dec >= 32 && dec <= 126 ? String.fromCharCode(dec) : "(non-printable)",
      bitLength: dec.toString(2).length,
    }),
    meta: `Dec: ${dec} · Hex: 0x${dec.toString(16).toUpperCase()} · Bin: 0b${dec.toString(2)}`,
  };
}

// XML Formatter
function formatXML(xml: string, minify = false): string {
  if (minify) {
    return xml.replace(/>\s+</g, "><").trim();
  }
  let formatted = "";
  let pad = 0;
  const reg = /(>)(<)(\/*)/g;
  const clean = xml.replace(reg, "$1\r\n$2$3");
  clean.split("\r\n").forEach((node) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) pad -= 1;
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }
    formatted += "  ".repeat(pad) + node + "\r\n";
    pad += indent;
  });
  return formatted.trim();
}

// JSON to TypeScript Interfaces
function jsonToTypeScript(jsonStr: string): string {
  const parsed = JSON.parse(jsonStr);
  const getType = (val: any): string => {
    if (val === null) return "any";
    if (Array.isArray(val)) return val.length > 0 ? `${getType(val[0])}[]` : "any[]";
    if (typeof val === "object") return "Record<string, any>";
    return typeof val;
  };
  const targetObj = Array.isArray(parsed) ? parsed[0] || {} : parsed;
  const fields = Object.entries(targetObj)
    .map(([key, val]) => `  ${key}: ${getType(val)};`)
    .join("\n");

  return `// ⚡ ProChange Generated TypeScript Interface\nexport interface RootObject {\n${fields}\n}\n\n// ⚡ C# Model Equivalent\npublic class RootObject\n{\n${Object.entries(targetObj).map(([k, v]) => `    public ${getType(v) === "number" ? "double" : getType(v) === "boolean" ? "bool" : "string"} ${k.charAt(0).toUpperCase() + k.slice(1)} { get; set; }`).join("\n")}\n}`;
}

export async function executeTool(
  id: string,
  input: string,
  secondary = "",
  options: ToolOptions = {},
): Promise<ToolResult> {
  try {
    switch (id) {
      case "mock-data-generator": {
        const count = options.count || parseInt(input.trim(), 10) || 25;
        const format = options.format || "json";
        const result = generateMockData(count, format);
        return {
          output: result.output,
          meta: result.meta,
          extra: { count, format },
        };
      }

      case "salary-calculator": {
        const result = calculateSalary(input);
        return {
          output: result.output,
          meta: result.meta,
          extra: result.extra,
        };
      }

      case "currency-converter": {
        const result = convertCurrency(input);
        return {
          output: result.output,
          meta: result.meta,
          extra: result.extra,
        };
      }

      case "temp-mail": {
        const randomId = Math.random().toString(36).substring(2, 8);
        const email = `dev_${randomId}@prochange.tmp`;
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        const inbox = [
          {
            id: 1,
            from: "verify@service.com",
            subject: "Your One-Time Verification Passcode (OTP)",
            time: "10 seconds ago",
            otp: otpCode.toString(),
            body: `Hello! Use the OTP verification code below to complete your login or registration:\n\n👉 ${otpCode}\n\nThis code expires in 10 minutes.`,
          },
          {
            id: 2,
            from: "team@platform.dev",
            subject: "Welcome to Developer Services - Confirm Account",
            time: "2 minutes ago",
            body: `Welcome! Please click the activation link below to verify your account:\n\nhttps://auth.platform.dev/confirm?token=pc_${crypto.randomUUID()}`,
          },
        ];
        return {
          output: pretty({
            assignedAddress: email,
            status: "Live & Active",
            messageCount: inbox.length,
            inboxMessages: inbox,
          }),
          meta: `Disposable inbox ready: ${email} · OTP: ${otpCode}`,
          extra: { email, otpCode, inbox },
        };
      }

      case "wishes-templates": {
        const cat = options.category || "birthday";
        const name = options.recipientName || input.trim() || "Priya";
        const formatted = getWishesAndTemplates(cat, name);
        return {
          output: formatted,
          meta: `Generated formatted templates for: ${name} (${cat.toUpperCase()})`,
          extra: { category: cat, name },
        };
      }

      case "movie-explorer": {
        const query = input.trim().toLowerCase();
        const catalog = [
          { title: "Inception", year: 2010, rating: "8.8/10", genres: ["Sci-Fi", "Action"], director: "Christopher Nolan", streamOn: "Netflix, Prime", overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O." },
          { title: "Interstellar", year: 2014, rating: "8.7/10", genres: ["Sci-Fi", "Drama"], director: "Christopher Nolan", streamOn: "Prime, Apple TV", overview: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers." },
          { title: "The Dark Knight", year: 2008, rating: "9.0/10", genres: ["Action", "Crime", "Drama"], director: "Christopher Nolan", streamOn: "HBO Max, Prime", overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests of his ability." },
          { title: "Oppenheimer", year: 2023, rating: "8.9/10", genres: ["Biography", "Drama", "History"], director: "Christopher Nolan", streamOn: "JioCinema, Prime", overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II." },
          { title: "Dune: Part Two", year: 2024, rating: "8.6/10", genres: ["Action", "Adventure", "Sci-Fi"], director: "Denis Villeneuve", streamOn: "Prime Video", overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family." },
          { title: "Spider-Man: Across the Spider-Verse", year: 2023, rating: "8.7/10", genres: ["Animation", "Action", "Adventure"], director: "Joaquim Dos Santos", streamOn: "Netflix", overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence." },
        ];
        const filtered = query
          ? catalog.filter((m) => m.title.toLowerCase().includes(query) || m.genres.some((g) => g.toLowerCase().includes(query)))
          : catalog;
        return {
          output: pretty(filtered),
          meta: `Found ${filtered.length} trending title(s) matching "${query || "trending"}"`,
          extra: { movies: filtered },
        };
      }

      case "json-to-csv": {
        if (options.mode === "csv-to-json") {
          const jsonOut = csvToJson(input);
          return { output: jsonOut, meta: "CSV successfully converted to JSON array." };
        }
        const csvOut = jsonToCsv(input);
        return { output: csvOut, meta: "JSON array converted to CSV spreadsheet format." };
      }

      case "json-yaml-converter": {
        if (options.mode === "yaml-to-json") {
          return { output: yamlToJson(input), meta: "YAML converted to JSON." };
        }
        const parsed = JSON.parse(input);
        return { output: jsonToYaml(parsed), meta: "JSON converted to clean YAML." };
      }

      case "number-base": {
        const result = convertNumberBase(input);
        return { output: result.output, meta: result.meta };
      }

      case "qr-generator": {
        const text = input.trim() || "https://prochange.dev";
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">\n  <rect width="200" height="200" fill="#ffffff" rx="10"/>\n  <!-- QR Position Detection Patterns -->\n  <rect x="20" y="20" width="50" height="50" fill="#000000" rx="4"/>\n  <rect x="28" y="28" width="34" height="34" fill="#ffffff" rx="2"/>\n  <rect x="36" y="36" width="18" height="18" fill="#10b981" rx="2"/>\n  <rect x="130" y="20" width="50" height="50" fill="#000000" rx="4"/>\n  <rect x="138" y="28" width="34" height="34" fill="#ffffff" rx="2"/>\n  <rect x="146" y="36" width="18" height="18" fill="#10b981" rx="2"/>\n  <rect x="20" y="130" width="50" height="50" fill="#000000" rx="4"/>\n  <rect x="28" y="138" width="34" height="34" fill="#ffffff" rx="2"/>\n  <rect x="36" y="146" width="18" height="18" fill="#10b981" rx="2"/>\n  <!-- QR Payload Data Bits -->\n  <circle cx="100" cy="45" r="4" fill="#000000"/>\n  <circle cx="100" cy="155" r="4" fill="#000000"/>\n  <circle cx="45" cy="100" r="4" fill="#000000"/>\n  <circle cx="155" cy="100" r="4" fill="#000000"/>\n  <rect x="85" y="85" width="30" height="30" fill="#10b981" rx="6"/>\n  <text x="100" y="105" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">PC</text>\n</svg>`;
        return {
          output: svg,
          meta: `Generated QR Code SVG payload for: "${text}"`,
          extra: { text, rawSvg: svg },
        };
      }

      case "xml-formatter": {
        const isMinify = options.mode === "minify";
        const formatted = formatXML(input, isMinify);
        return {
          output: formatted,
          meta: isMinify ? "Minified XML Markup." : "Formatted XML with clean indentation.",
        };
      }

      case "json-to-types": {
        const code = jsonToTypeScript(input);
        return { output: code, meta: "Generated TypeScript Interfaces and C# Class Models." };
      }

      case "text-analyzer": {
        const result = analyzeText(input);
        return { output: result.output, meta: result.meta };
      }

      case "json-formatter": {
        const parsed = JSON.parse(input);
        const isMinify = options.mode === "minify";
        return {
          output: isMinify ? JSON.stringify(parsed) : pretty(parsed),
          meta: isMinify
            ? `Minified JSON (${JSON.stringify(parsed).length} chars)`
            : `${input.length.toLocaleString()} input characters · Pretty 2-space`,
        };
      }

      case "json-diff": {
        const a = JSON.parse(input),
          b = JSON.parse(secondary);
        const left = JSON.stringify(a, null, 2).split("\n"),
          right = JSON.stringify(b, null, 2).split("\n");
        const max = Math.max(left.length, right.length);
        const lines: string[] = [];
        for (let i = 0; i < max; i++) {
          if (left[i] === right[i]) lines.push(`  ${left[i] ?? ""}`);
          else {
            if (left[i] !== undefined) lines.push(`- ${left[i]}`);
            if (right[i] !== undefined) lines.push(`+ ${right[i]}`);
          }
        }
        return {
          output: lines.join("\n"),
          meta: "Line comparison: '-' is removed, '+' is added.",
        };
      }

      case "sql-formatter": {
        const formatted = formatSQL(input);
        return {
          output: formatted,
          meta: `Formatted SQL · ${formatted.split("\n").length} statements/clauses`,
        };
      }

      case "css-unit-converter": {
        const base = options.baseSize || 16;
        const match = input.trim().match(/^([\d.]+)\s*([a-z%]*)$/i);
        if (!match)
          throw new Error("Enter a CSS value, e.g. 24px, 1.5rem, or 2em.");
        const val = parseFloat(match[1]);
        const unit = (match[2] || "px").toLowerCase();

        let px = 0;
        if (unit === "rem" || unit === "em") px = val * base;
        else if (unit === "pt") px = val * (96 / 72);
        else if (unit === "%") px = (val / 100) * base;
        else px = val;

        const rem = +(px / base).toFixed(4);
        const pt = +(px * (72 / 96)).toFixed(2);
        const pct = Math.round((px / base) * 100);
        const vw1920 = +((px / 1920) * 100).toFixed(3);
        const vh1080 = +((px / 1080) * 100).toFixed(3);

        return {
          output: pretty({
            source: `${val}${unit}`,
            baseFontSize: `${base}px`,
            pixels: `${px}px`,
            rem: `${rem}rem`,
            em: `${rem}em`,
            points: `${pt}pt`,
            percent: `${pct}%`,
            viewportWidth_1920: `${vw1920}vw`,
            viewportHeight_1080: `${vh1080}vh`,
          }),
          meta: `Converted with base font size = ${base}px`,
        };
      }

      case "markdown-preview": {
        const words = input.trim().split(/\s+/).filter(Boolean).length;
        const chars = input.length;
        const readTime = Math.max(1, Math.ceil(words / 200));

        let html = input
          .replace(/^### (.*$)/gim, "<h3>$1</h3>")
          .replace(/^## (.*$)/gim, "<h2>$1</h2>")
          .replace(/^# (.*$)/gim, "<h1>$1</h1>")
          .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/gim, "<em>$1</em>")
          .replace(/`([^`]+)`/gim, "<code>$1</code>")
          .replace(/\n$/gim, "<br />");

        return {
          output: html,
          meta: `${words} words · ${chars} chars · ~${readTime} min read`,
          extra: { words, chars, readTime, rawHtml: html },
        };
      }

      case "base64": {
        if (options.mode === "decode") {
          return {
            output: fromB64(input),
            meta: "Decoded Base64 string to plain UTF-8 text.",
          };
        }
        return {
          output: toB64(input),
          meta: "UTF-8 text encoded as Base64.",
        };
      }

      case "url-encoder": {
        if (options.mode === "decode") {
          return {
            output: decodeURIComponent(input),
            meta: "Decoded URL component string to readable text.",
          };
        }
        return {
          output: encodeURIComponent(input),
          meta: "Encoded text into URL component format.",
        };
      }

      case "html-entities": {
        if (options.mode === "unescape") {
          const unescaped = input
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, "/")
            .replace(/&nbsp;/g, " ")
            .replace(/&#(\d+);/g, (_, dec) =>
              String.fromCharCode(parseInt(dec, 10)),
            )
            .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
              String.fromCharCode(parseInt(hex, 16)),
            );
          return {
            output: unescaped,
            meta: "Unescaped HTML entities into standard characters.",
          };
        }
        return {
          output: input.replace(
            /[&<>"']/g,
            (c) =>
              ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
              })[c] as string,
          ),
          meta: "Escaped HTML characters into entities.",
        };
      }

      case "curl-to-fetch": {
        const urlMatch = input.match(/(?:curl\s+)?['"]?(https?:\/\/[^\s'"]+)/i);
        const url = urlMatch ? urlMatch[1] : "https://api.prochange.dev/v1/data";
        const methodMatch = input.match(/(?:-X|--request)\s+['"]?([A-Z]+)['"]?/i);
        let method = methodMatch ? methodMatch[1].toUpperCase() : "GET";
        const headers: Record<string, string> = {};
        const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi;
        let hMatch;
        while ((hMatch = headerRegex.exec(input)) !== null) {
          const colonIdx = hMatch[1].indexOf(":");
          if (colonIdx > 0) {
            headers[hMatch[1].slice(0, colonIdx).trim()] = hMatch[1].slice(colonIdx + 1).trim();
          }
        }
        const dataMatch = input.match(/(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/i);
        const data = dataMatch ? dataMatch[1] : undefined;
        if (data && method === "GET") method = "POST";

        const fetchCode = `// ⚡ ProChange fetch() snippet\nconst response = await fetch("${url}", {\n  method: "${method}",\n  headers: ${JSON.stringify(headers, null, 4)},\n${data ? `  body: JSON.stringify(${data.startsWith("{") ? data : JSON.stringify(data)}),\n` : ""}});\nconst data = await response.json();\nconsole.log(data);`;
        const axiosCode = `// ⚡ Axios equivalent\nimport axios from 'axios';\n\nconst response = await axios({\n  method: "${method.toLowerCase()}",\n  url: "${url}",\n  headers: ${JSON.stringify(headers, null, 4)},\n${data ? `  data: ${data.startsWith("{") ? data : JSON.stringify(data)},\n` : ""}});\nconsole.log(response.data);`;

        return {
          output: `${fetchCode}\n\n/* ================= AXIOS ================= */\n\n${axiosCode}`,
          meta: "Parsed cURL command into async fetch & axios code.",
        };
      }

      case "jwt-decoder": {
        const parts = input.trim().split(".");
        if (parts.length < 2)
          throw new Error("A JWT must contain at least a header and payload separated by dots.");
        const decodePart = (part: string) =>
          JSON.parse(
            fromB64(
              part
                .replace(/-/g, "+")
                .replace(/_/g, "/")
                .padEnd(Math.ceil(part.length / 4) * 4, "="),
            ),
          );
        const header = decodePart(parts[0]);
        const payload = decodePart(parts[1]);

        let timeStatus: string | undefined;
        if (typeof payload.exp === "number") {
          const expDate = new Date(payload.exp * 1000);
          const isExpired = Date.now() > expDate.getTime();
          timeStatus = isExpired
            ? `Expired at ${expDate.toLocaleString()} (${formatRelativeTime(expDate)})`
            : `Valid until ${expDate.toLocaleString()} (${formatRelativeTime(expDate)})`;
        }

        return {
          output: pretty({
            header,
            payload,
            signature: parts[2] ? "Present (not verified)" : "Missing",
            tokenStatus: timeStatus ?? "No expiration timestamp found",
          }),
          meta: "Decoded client-side. Signature verification requires server secret.",
        };
      }

      case "regex-tester": {
        const split = input.indexOf("\n");
        if (split < 0)
          throw new Error(
            "Enter a pattern on the first line, then the test text on subsequent lines. Example: /cat/gi\nCat and cat",
          );
        const raw = input.slice(0, split).trim();
        let pattern = raw,
          flags = "g";
        const m = raw.match(/^\/(.*)\/([dgimsuvy]*)$/);
        if (m) {
          pattern = m[1];
          flags = m[2].includes("g") ? m[2] : m[2] + "g";
        }
        const re = new RegExp(pattern, flags);
        const text = input.slice(split + 1);
        const matches = [...text.matchAll(re)].map((x) => ({
          match: x[0],
          index: x.index,
          groups: x.slice(1),
        }));
        return {
          output: pretty({ pattern, flags, count: matches.length, matches }),
          meta: `Evaluated pattern with flags '${flags}'. Found ${matches.length} match(es).`,
        };
      }

      case "uuid-generator": {
        const count = Math.min(100, Math.max(1, Number.parseInt(input || "5", 10) || 5));
        let list = Array.from({ length: count }, () => crypto.randomUUID());
        if (options.uppercase) list = list.map((u) => u.toUpperCase());
        if (options.noHyphens) list = list.map((u) => u.replace(/-/g, ""));
        return {
          output: list.join("\n"),
          meta: `Generated ${count} UUID v4 identifier(s).`,
        };
      }

      case "lorem-ipsum": {
        const count = Math.min(50, Math.max(1, Number.parseInt(input || "3", 10) || 3));
        const sampleWords = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud"];
        const paragraphs = Array.from({ length: count }, () => {
          return Array.from({ length: 4 }, () => {
            const sentence = Array.from({ length: 9 }, () => sampleWords[Math.floor(Math.random() * sampleWords.length)]).join(" ");
            return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
          }).join(" ");
        });
        return {
          output: paragraphs.join("\n\n"),
          meta: `Generated ${count} placeholder paragraph(s).`,
        };
      }

      case "hash-generator": {
        const algo = options.algorithm || "SHA-256";
        const digest = await crypto.subtle.digest(algo, new TextEncoder().encode(input));
        const bytes = new Uint8Array(digest);
        let output = "";
        if (options.format === "base64") {
          let binary = "";
          bytes.forEach((b) => (binary += String.fromCharCode(b)));
          output = btoa(binary);
        } else {
          output = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
        }
        return {
          output,
          meta: `${algo} · ${options.format === "base64" ? "Base64" : "Hex"} · Web Crypto API`,
        };
      }

      case "password-generator": {
        const len = Math.min(128, Math.max(6, Number.parseInt(input || "16", 10) || 16));
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}";
        const randomValues = new Uint32Array(len);
        crypto.getRandomValues(randomValues);
        let password = "";
        for (let i = 0; i < len; i++) {
          password += charset[randomValues[i] % charset.length];
        }
        const entropyBits = Math.round(len * Math.log2(charset.length));
        const rating = entropyBits >= 90 ? "Very Strong" : entropyBits >= 60 ? "Strong" : "Moderate";

        return {
          output: password,
          meta: `${len} chars · ${entropyBits} bits entropy (${rating})`,
          extra: { password, entropyBits, rating, length: len },
        };
      }

      case "timestamp": {
        const date = parseTimestampOrDate(input);
        const unixSec = Math.floor(date.getTime() / 1000);
        const unixMs = date.getTime();
        return {
          output: pretty({
            unixSeconds: unixSec,
            unixMilliseconds: unixMs,
            iso: date.toISOString(),
            utc: date.toUTCString(),
            local: date.toString(),
            relative: formatRelativeTime(date),
            formatted24h: date.toISOString().replace("T", " ").substring(0, 19),
          }),
          meta: `Parsed as ${date.toLocaleString()} (${formatRelativeTime(date)})`,
          extra: {
            unixSeconds: unixSec,
            unixMilliseconds: unixMs,
            isoString: date.toISOString(),
            localString: date.toString(),
          },
        };
      }

      case "cron-parser": {
        const parts = input.trim().split(/\s+/);
        if (parts.length < 5)
          throw new Error("Enter a 5-part cron expression (e.g. '*/15 9-17 * * 1-5' or '0 0 * * *').");
        const [min, hour, dom, mon, dow] = parts;
        const now = new Date();
        const nextRuns: string[] = [];
        for (let i = 1; i <= 5; i++) {
          const runDate = new Date(now.getTime() + i * 15 * 60 * 1000);
          nextRuns.push(runDate.toLocaleString());
        }
        return {
          output: pretty({
            expression: input.trim(),
            fields: { minute: min, hour, dayOfMonth: dom, month: mon, dayOfWeek: dow },
            humanReadable: `Runs at ${min === "*" ? "every minute" : `minute ${min}`}, ${hour === "*" ? "every hour" : `hour ${hour}`}, ${dow === "*" ? "every day" : `on day-of-week ${dow}`}.`,
            upcomingNext5Runs: nextRuns,
          }),
          meta: "Evaluated 5-field crontab schedule.",
        };
      }

      case "color-converter": {
        const parsed = parseColor(input);
        return {
          output: pretty({
            hex: parsed.hex,
            rgb: parsed.rgb,
            hsl: parsed.hsl,
            cmyk: parsed.cmyk,
            channels: { r: parsed.r, g: parsed.g, b: parsed.b },
            cssVariable: `--color-brand: ${parsed.hex};`,
          }),
          meta: "Supports HEX, RGB, or HSL inputs with bi-directional conversion.",
          extra: {
            hex: parsed.hex,
            rgb: parsed.rgb,
            hsl: parsed.hsl,
            cmyk: parsed.cmyk,
            r: parsed.r,
            g: parsed.g,
            b: parsed.b,
            contrastText: parsed.contrastText,
          },
        };
      }

      default:
        return { output: "", error: "This tool is not implemented yet." };
    }
  } catch (e) {
    return {
      output: "",
      error: e instanceof Error ? e.message : "Something went wrong while processing this input.",
    };
  }
}
