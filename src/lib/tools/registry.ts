export type ToolCategory =
  | "Formatters"
  | "Encoders & Decoders"
  | "Generators"
  | "Web & Time"
  | "Security";

export type ToolDefinition = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  badge?: string;
};

export const tools: ToolDefinition[] = [
  // Formatters
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, minify, validate, and inspect JSON documents.",
    category: "Formatters",
    icon: "{}",
    keywords: ["json", "format", "minify", "validate", "prettify", "indent"],
    badge: "Bi-directional",
  },
  {
    id: "json-diff",
    name: "JSON Diff",
    description: "Compare two JSON documents with line-by-line diff.",
    category: "Formatters",
    icon: "⇄",
    keywords: ["json", "compare", "diff", "delta", "changes"],
    badge: "Swap A ⇄ B",
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    description: "Format and beautify standard SQL queries with clean indentation.",
    category: "Formatters",
    icon: "SQL",
    keywords: ["sql", "database", "query", "format", "beautify", "postgres", "mysql"],
    badge: "Beautify",
  },
  {
    id: "css-unit-converter",
    name: "CSS Unit Converter",
    description: "Convert between PX, REM, EM, PT, VW, VH, and percentages.",
    category: "Formatters",
    icon: "px",
    keywords: ["css", "px", "rem", "em", "unit", "viewport", "style", "convert"],
    badge: "PX ⇄ REM",
  },
  {
    id: "markdown-preview",
    name: "Markdown Previewer",
    description: "Live Markdown rendering with HTML preview, tables, and word stats.",
    category: "Formatters",
    icon: "M↓",
    keywords: ["markdown", "md", "preview", "html", "render", "documentation"],
    badge: "Live HTML",
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions with flags and capture group extraction.",
    category: "Formatters",
    icon: ".*",
    keywords: ["regex", "regexp", "pattern", "match", "flags", "test"],
    badge: "Pattern Test",
  },

  // Encoders & Decoders
  {
    id: "base64",
    name: "Base64",
    description: "Encode UTF-8 text to Base64 and decode Base64 back to plain text.",
    category: "Encoders & Decoders",
    icon: "64",
    keywords: ["base64", "encode", "decode", "btoa", "atob", "binary"],
    badge: "Bi-directional",
  },
  {
    id: "url-encoder",
    name: "URL Encoder",
    description: "Encode URI components and decode encoded query parameters.",
    category: "Encoders & Decoders",
    icon: "%",
    keywords: ["url", "uri", "encode", "decode", "percent", "escape"],
    badge: "Bi-directional",
  },
  {
    id: "html-entities",
    name: "HTML Entities",
    description: "Escape HTML characters into entities and unescape entities back.",
    category: "Encoders & Decoders",
    icon: "<>",
    keywords: ["html", "escape", "entities", "unescape", "special characters"],
    badge: "Bi-directional",
  },
  {
    id: "curl-to-fetch",
    name: "cURL to Fetch & Axios",
    description: "Transform raw cURL terminal requests into modern JavaScript code.",
    category: "Encoders & Decoders",
    icon: "⚡",
    keywords: ["curl", "fetch", "axios", "http", "api", "request", "javascript"],
    badge: "Fetch & Axios",
  },

  // Generators
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate random UUID v4 identifiers in lowercase or uppercase.",
    category: "Generators",
    icon: "ID",
    keywords: ["uuid", "guid", "random", "v4", "unique", "identifier"],
    badge: "Crypto v4",
  },
  {
    id: "lorem-ipsum",
    name: "Lorem & Mock Data",
    description: "Generate dummy paragraphs, sentences, words, or mock JSON records.",
    category: "Generators",
    icon: "¶",
    keywords: ["lorem", "ipsum", "dummy", "mock", "text", "placeholder", "generator"],
    badge: "Text & JSON",
  },

  // Web & Time
  {
    id: "timestamp",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps (seconds/ms) and human times (e.g. 4pm).",
    category: "Web & Time",
    icon: "◷",
    keywords: ["unix", "timestamp", "date", "time", "epoch", "4pm", "calendar"],
    badge: "Time ⇄ Unix",
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "Interactive color picker and converter for HEX, RGB, HSL, and CMYK.",
    category: "Web & Time",
    icon: "◉",
    keywords: ["color", "hex", "rgb", "hsl", "picker", "swatch", "cmyk", "palette"],
    badge: "Picker & Swatch",
  },
  {
    id: "cron-parser",
    name: "Cron Parser & Schedule",
    description: "Translate cron expressions into human words and calculate upcoming runs.",
    category: "Web & Time",
    icon: "⏱",
    keywords: ["cron", "schedule", "timer", "interval", "expression", "crontab"],
    badge: "Human Cron",
  },
  {
    id: "url-parser",
    name: "URL & Query Params",
    description: "Deconstruct URLs into protocol, host, pathname, query parameters and hash.",
    category: "Web & Time",
    icon: "🔗",
    keywords: ["url", "params", "query", "search", "domain", "parse", "host"],
    badge: "Query Inspector",
  },

  // Security
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Inspect token header, payload claims, and expiration date status.",
    category: "Security",
    icon: "JWT",
    keywords: ["jwt", "token", "decode", "claims", "bearer", "auth"],
    badge: "Claims & Exp",
  },
  {
    id: "hash-generator",
    name: "Cryptographic Hash",
    description: "Generate SHA-256, SHA-512, and SHA-1 digests using Web Crypto.",
    category: "Security",
    icon: "#",
    keywords: ["hash", "sha256", "sha512", "sha1", "crypto", "digest"],
    badge: "WebCrypto",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate high-entropy secure passwords with length and character filters.",
    category: "Security",
    icon: "⚿",
    keywords: ["password", "security", "crypto", "entropy", "random", "passphrase"],
    badge: "High Entropy",
  },
];
