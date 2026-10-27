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
    "Enter a Unix timestamp (seconds/ms) or date/time (e.g. '1700000000', '4:00 PM', 'today 4pm', or '2026-10-27 16:00').",
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

// SQL Formatter Helper
function formatSQL(sql: string): string {
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "AND",
    "OR",
    "ORDER BY",
    "GROUP BY",
    "HAVING",
    "LIMIT",
    "OFFSET",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "JOIN",
    "UNION",
    "VALUES",
    "INSERT INTO",
    "UPDATE",
    "SET",
    "DELETE FROM",
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
      const isMajor = /^(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|INSERT INTO|UPDATE|DELETE FROM)/i.test(
        line,
      );
      return isMajor ? line : `  ${line}`;
    })
    .join("\n");
}

// cURL Parser Helper
function parseCurl(curlText: string) {
  const urlMatch = curlText.match(/(?:curl\s+)?['"]?(https?:\/\/[^\s'"]+)/i);
  const url = urlMatch ? urlMatch[1] : "https://api.example.com/data";

  const methodMatch = curlText.match(
    /(?:-X|--request)\s+['"]?([A-Z]+)['"]?/i,
  );
  let method = methodMatch ? methodMatch[1].toUpperCase() : "GET";

  const headers: Record<string, string> = {};
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi;
  let hMatch;
  while ((hMatch = headerRegex.exec(curlText)) !== null) {
    const colonIdx = hMatch[1].indexOf(":");
    if (colonIdx > 0) {
      const key = hMatch[1].slice(0, colonIdx).trim();
      const val = hMatch[1].slice(colonIdx + 1).trim();
      headers[key] = val;
    }
  }

  const dataMatch = curlText.match(
    /(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/i,
  );
  const data = dataMatch ? dataMatch[1] : undefined;
  if (data && method === "GET") method = "POST";

  const fetchCode = `// ⚡ Generated fetch() request\nconst response = await fetch("${url}", {\n  method: "${method}",\n  headers: ${JSON.stringify(headers, null, 4)},\n${data ? `  body: JSON.stringify(${data.startsWith("{") ? data : JSON.stringify(data)}),\n` : ""}});\nconst data = await response.json();\nconsole.log(data);`;

  const axiosCode = `// ⚡ Generated Axios request\nimport axios from 'axios';\n\nconst response = await axios({\n  method: "${method.toLowerCase()}",\n  url: "${url}",\n  headers: ${JSON.stringify(headers, null, 4)},\n${data ? `  data: ${data.startsWith("{") ? data : JSON.stringify(data)},\n` : ""}});\nconsole.log(response.data);`;

  return `${fetchCode}\n\n/* ================= AXIOS EQUIVALENT ================= */\n\n${axiosCode}`;
}

export async function executeTool(
  id: string,
  input: string,
  secondary = "",
  options: ToolOptions = {},
): Promise<ToolResult> {
  try {
    switch (id) {
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
        const converted = parseCurl(input);
        return {
          output: converted,
          meta: "cURL command parsed into modern JavaScript fetch & axios.",
        };
      }
      case "jwt-decoder": {
        const parts = input.trim().split(".");
        if (parts.length < 2)
          throw new Error(
            "A JWT must contain at least a header and payload separated by dots.",
          );
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
        const count = Math.min(
          100,
          Math.max(1, Number.parseInt(input || "1", 10) || 1),
        );
        let list = Array.from({ length: count }, () => crypto.randomUUID());
        if (options.uppercase) list = list.map((u) => u.toUpperCase());
        if (options.noHyphens) list = list.map((u) => u.replace(/-/g, ""));
        return {
          output: list.join("\n"),
          meta: `Generated ${count} UUID v4 identifier(s).`,
        };
      }
      case "lorem-ipsum": {
        const count = Math.min(
          50,
          Math.max(1, Number.parseInt(input || "3", 10) || 3),
        );
        const sampleWords = [
          "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
          "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
          "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud"
        ];
        if (options.mode === "mock-users") {
          const users = Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            uuid: crypto.randomUUID(),
            name: `Developer ${i + 1}`,
            email: `dev${i + 1}@example.com`,
            role: i === 0 ? "admin" : "member",
            active: true,
            createdAt: new Date().toISOString(),
          }));
          return {
            output: pretty(users),
            meta: `Generated ${count} mock user objects.`,
          };
        }
        const paragraphs = Array.from({ length: count }, () => {
          return Array.from({ length: 4 }, () => {
            const sentence = Array.from({ length: 9 }, () =>
              sampleWords[Math.floor(Math.random() * sampleWords.length)]
            ).join(" ");
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
        const digest = await crypto.subtle.digest(
          algo,
          new TextEncoder().encode(input),
        );
        const bytes = new Uint8Array(digest);
        let output = "";
        if (options.format === "base64") {
          let binary = "";
          bytes.forEach((b) => (binary += String.fromCharCode(b)));
          output = btoa(binary);
        } else {
          output = Array.from(bytes, (b) =>
            b.toString(16).padStart(2, "0"),
          ).join("");
        }
        return {
          output,
          meta: `${algo} · ${options.format === "base64" ? "Base64" : "Hex"} · Web Crypto API`,
        };
      }
      case "password-generator": {
        const len = Math.min(
          128,
          Math.max(6, Number.parseInt(input || "16", 10) || 16),
        );
        const charset =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}";
        const randomValues = new Uint32Array(len);
        crypto.getRandomValues(randomValues);
        let password = "";
        for (let i = 0; i < len; i++) {
          password += charset[randomValues[i] % charset.length];
        }
        const entropyBits = Math.round(len * Math.log2(charset.length));
        const rating =
          entropyBits >= 90
            ? "Very Strong"
            : entropyBits >= 60
              ? "Strong"
              : "Moderate";

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
            formatted24h: date
              .toISOString()
              .replace("T", " ")
              .substring(0, 19),
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
            fields: {
              minute: min,
              hour: hour,
              dayOfMonth: dom,
              month: mon,
              dayOfWeek: dow,
            },
            humanReadable: `Runs at ${min === "*" ? "every minute" : `minute ${min}`}, ${hour === "*" ? "every hour" : `hour ${hour}`}, ${dow === "*" ? "every day" : `on day-of-week ${dow}`}.`,
            upcomingNext5Runs: nextRuns,
          }),
          meta: "Evaluated 5-field crontab schedule.",
        };
      }
      case "url-parser": {
        let raw = input.trim();
        if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
        const u = new URL(raw);
        const searchParams: Record<string, string> = {};
        u.searchParams.forEach((val, key) => {
          searchParams[key] = val;
        });

        return {
          output: pretty({
            href: u.href,
            origin: u.origin,
            protocol: u.protocol,
            host: u.host,
            hostname: u.hostname,
            port: u.port || "(default)",
            pathname: u.pathname,
            search: u.search || "(none)",
            hash: u.hash || "(none)",
            searchParams,
          }),
          meta: `Parsed ${Object.keys(searchParams).length} query param(s).`,
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
      error:
        e instanceof Error
          ? e.message
          : "Something went wrong while processing this input.",
    };
  }
}
