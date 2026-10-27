# DevDock — Developer Toolbox

A minimal, local-first developer toolbox built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Lucide icons. The initial implementation includes a registry-driven sidebar/search UI and working browser-side utilities.

## Requirements
- Node.js 20.9 or newer (use a currently supported LTS release)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Implemented tools
- JSON formatter / validator (valid JSON is formatted; invalid JSON displays a useful error)
- JSON diff (line-oriented comparison)
- Base64 encode
- URL component encode
- HTML entity escape
- JWT header/payload decoder (does not verify signatures)
- Regex tester (pattern on first line, test text below)
- UUID v4 generator
- SHA-256 via Web Crypto
- Unix timestamp / date converter
- HEX to RGB/HSL color converter

## Architecture

```text
src/
  app/
    globals.css       App styles and responsive layout
    layout.tsx        Metadata and root layout
    page.tsx          Server-rendered route entry
  components/
    devdock.tsx       Interactive client workspace, sidebar and command search
  lib/
    tools/
      registry.ts     Single source of truth for tools/navigation/search
      execute.ts      Pure/browser-side tool execution functions
```

## Add a tool
1. Add a `ToolDefinition` entry in `src/lib/tools/registry.ts`.
2. Add its implementation to `executeTool()` in `src/lib/tools/execute.ts`.
3. Add a sample input in `samples` in `src/components/devdock.tsx` if useful.

The app intentionally avoids a backend for these utilities. Inputs are processed in the browser. JWT decoding is not validation; SHA-256 is not password hashing; never treat decoded claims as trusted without signature verification.
