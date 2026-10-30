"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MousePointer,
  Hand,
  Pencil,
  Highlighter,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  Minus,
  Type,
  StickyNote,
  Eraser,
  Undo2,
  Redo2,
  Download,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Sun,
  Moon,
  Layers,
  Database,
  Cloud,
  Server,
  Shield,
  Terminal,
  Cpu,
  Globe,
  Box,
  Flame,
  Code2,
  FileText,
  Split,
  Eye,
  Maximize2,
  List,
  CheckSquare,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet,
  Layout,
  Search,
  X,
  Lock,
  Wifi,
  HardDrive,
  Bell,
  Mail,
  ShoppingCart,
  CreditCard,
  Folder,
  GitBranch,
  Key,
  Activity,
} from "lucide-react";
import {
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiNodedotjs,
  SiTypescript,
  SiJavascript,
  SiPython,
  SiGo,
  SiRust,
  SiTailwindcss,
  SiDocker,
  SiKubernetes,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiGraphql,
  SiSupabase,
  SiFirebase,
  SiGithub,
  SiGitlab,
  SiVercel,
  SiFigma,
  SiNotion,
  SiDiscord,
  SiCloudflare,
  SiNginx,
  SiLinux,
  SiGooglecloud,
  SiStripe,
  SiPostman,
  SiNpm,
  SiWebpack,
  SiVite,
  SiHtml5,
  SiCss,
  SiPrisma,
  SiJest,
  SiApachekafka,
  SiRabbitmq,
  SiElasticsearch,
  SiUbuntu,
} from "react-icons/si";
import {
  FaAws,
  FaSlack,
  FaServer,
  FaDatabase,
  FaMicrochip,
  FaShieldHalved,
  FaMobileScreen,
  FaDesktop,
  FaNetworkWired,
  FaHardDrive,
  FaUserCheck,
  FaCartShopping,
  FaCreditCard,
  FaEnvelope,
} from "react-icons/fa6";
import { TbBrandOpenai, TbBrandAzure } from "react-icons/tb";
import { renderToStaticMarkup } from "react-dom/server";

type ToolType =
  | "select"
  | "hand"
  | "pen"
  | "highlighter"
  | "rectangle"
  | "circle"
  | "diamond"
  | "arrow"
  | "line"
  | "text"
  | "sticky"
  | "icon"
  | "frame"
  | "eraser";

type FillType = "none" | "subtle" | "solid";
type GridType = "dots" | "grid" | "plain";
type ViewMode = "canvas" | "split" | "notes";
type AnchorSide = "top" | "right" | "bottom" | "left";
type FrameType = "desktop" | "mobile" | "tablet" | "presentation";

interface BoardElement {
  id: string;
  type: ToolType | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  dashed?: boolean;
  iconName?: string;
  stickyColor?: string;
  fontSize?: number;
  // Frame layout support
  frameType?: FrameType;
  frameLabel?: string;
  // Pasted Image support
  src?: string;
  // Flexible connector attachments
  startElementId?: string;
  startAnchor?: AnchorSide;
  endElementId?: string;
  endAnchor?: AnchorSide;
}

const colorPalette = [
  { name: "Emerald", hex: "#10B981" },
  { name: "Violet", hex: "#7C5CFC" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Rose", hex: "#F43F5E" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Slate", hex: "#94A3B8" },
];

// 50+ Popular Tech Logos, Cloud Brands, & Developer Icons (Real Official Vector SVGs)
const allTechIcons = [
  // Cloud & Infrastructure
  { name: "AWS Cloud", category: "Cloud", symbol: "AWS", icon: FaAws, color: "#FF9900" },
  { name: "Google Cloud", category: "Cloud", symbol: "GCP", icon: SiGooglecloud, color: "#4285F4" },
  { name: "Azure", category: "Cloud", symbol: "AZR", icon: TbBrandAzure, color: "#0078D4" },
  { name: "Cloudflare", category: "Cloud", symbol: "CF", icon: SiCloudflare, color: "#F38020" },
  { name: "Kubernetes", category: "Cloud", symbol: "K8S", icon: SiKubernetes, color: "#326CE5" },
  { name: "Docker", category: "Cloud", symbol: "DOC", icon: SiDocker, color: "#2496ED" },
  { name: "Linux Server", category: "Cloud", symbol: "LNX", icon: SiLinux, color: "#FCC624" },
  { name: "Ubuntu", category: "Cloud", symbol: "UBT", icon: SiUbuntu, color: "#E95420" },
  { name: "Nginx", category: "Cloud", symbol: "NGX", icon: SiNginx, color: "#009639" },
  { name: "Backend Server", category: "Cloud", symbol: "SRV", icon: FaServer, color: "#10B981" },

  // Languages & Frameworks
  { name: "React", category: "Frameworks", symbol: "RCT", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", category: "Frameworks", symbol: "NXT", icon: SiNextdotjs, color: "#FFFFFF" },
  { name: "Vue.js", category: "Frameworks", symbol: "VUE", icon: SiVuedotjs, color: "#4FC08D" },
  { name: "Node.js", category: "Frameworks", symbol: "ND", icon: SiNodedotjs, color: "#339933" },
  { name: "TypeScript", category: "Frameworks", symbol: "TS", icon: SiTypescript, color: "#3178C6" },
  { name: "JavaScript", category: "Frameworks", symbol: "JS", icon: SiJavascript, color: "#F7DF1E" },
  { name: "Python", category: "Frameworks", symbol: "PY", icon: SiPython, color: "#3776AB" },
  { name: "Go / Golang", category: "Frameworks", symbol: "GO", icon: SiGo, color: "#00ADD8" },
  { name: "Rust", category: "Frameworks", symbol: "RST", icon: SiRust, color: "#DEA584" },
  { name: "Tailwind CSS", category: "Frameworks", symbol: "TW", icon: SiTailwindcss, color: "#38B2AC" },
  { name: "HTML5", category: "Frameworks", symbol: "HTM", icon: SiHtml5, color: "#E34F26" },
  { name: "CSS3", category: "Frameworks", symbol: "CSS", icon: SiCss, color: "#1572B6" },
  { name: "Vite", category: "Frameworks", symbol: "VIT", icon: SiVite, color: "#646CFF" },
  { name: "Webpack", category: "Frameworks", symbol: "WP", icon: SiWebpack, color: "#8DD6F9" },

  // Databases & Storage
  { name: "PostgreSQL", category: "Databases", symbol: "PG", icon: SiPostgresql, color: "#336791" },
  { name: "MySQL", category: "Databases", symbol: "SQL", icon: SiMysql, color: "#4479A1" },
  { name: "MongoDB", category: "Databases", symbol: "MDB", icon: SiMongodb, color: "#47A248" },
  { name: "Redis Cache", category: "Databases", symbol: "RDS", icon: SiRedis, color: "#DC382D" },
  { name: "GraphQL", category: "Databases", symbol: "GQL", icon: SiGraphql, color: "#E10098" },
  { name: "Supabase", category: "Databases", symbol: "SUP", icon: SiSupabase, color: "#3ECF8E" },
  { name: "Firebase", category: "Databases", symbol: "FB", icon: SiFirebase, color: "#FFCA28" },
  { name: "Prisma", category: "Databases", symbol: "PRS", icon: SiPrisma, color: "#5A67D8" },
  { name: "Apache Kafka", category: "Databases", symbol: "KFK", icon: SiApachekafka, color: "#FFFFFF" },
  { name: "RabbitMQ", category: "Databases", symbol: "RMQ", icon: SiRabbitmq, color: "#FF6600" },
  { name: "Elasticsearch", category: "Databases", symbol: "ELS", icon: SiElasticsearch, color: "#005571" },
  { name: "Database Engine", category: "Databases", symbol: "DB", icon: FaDatabase, color: "#06B6D4" },

  // Developer Tools & Brands
  { name: "GitHub", category: "Tools", symbol: "GH", icon: SiGithub, color: "#FFFFFF" },
  { name: "GitLab", category: "Tools", symbol: "GL", icon: SiGitlab, color: "#FC6D26" },
  { name: "Vercel", category: "Tools", symbol: "VCL", icon: SiVercel, color: "#FFFFFF" },
  { name: "Figma", category: "Tools", symbol: "FIG", icon: SiFigma, color: "#F24E1E" },
  { name: "Notion", category: "Tools", symbol: "NOT", icon: SiNotion, color: "#FFFFFF" },
  { name: "Slack", category: "Tools", symbol: "SLK", icon: FaSlack, color: "#ECB22E" },
  { name: "Discord", category: "Tools", symbol: "DSC", icon: SiDiscord, color: "#5865F2" },
  { name: "OpenAI", category: "Tools", symbol: "AI", icon: TbBrandOpenai, color: "#10A37F" },
  { name: "Postman", category: "Tools", symbol: "PST", icon: SiPostman, color: "#FF6C37" },
  { name: "NPM", category: "Tools", symbol: "NPM", icon: SiNpm, color: "#CB3837" },
  { name: "Jest", category: "Tools", symbol: "JST", icon: SiJest, color: "#C21325" },
  { name: "Stripe", category: "Tools", symbol: "STP", icon: SiStripe, color: "#635BFF" },

  // Hardware & Network
  { name: "Microservice", category: "Hardware", symbol: "uS", icon: FaMicrochip, color: "#7C5CFC" },
  { name: "API Gateway", category: "Hardware", symbol: "GW", icon: FaNetworkWired, color: "#10B981" },
  { name: "Security Shield", category: "Hardware", symbol: "SEC", icon: FaShieldHalved, color: "#3B82F6" },
  { name: "Hard Drive", category: "Hardware", symbol: "HDD", icon: FaHardDrive, color: "#94A3B8" },
  { name: "Client User", category: "Hardware", symbol: "USR", icon: FaUserCheck, color: "#F43F5E" },
  { name: "Smartphone", category: "Hardware", symbol: "MOB", icon: FaMobileScreen, color: "#10B981" },
  { name: "Laptop / PC", category: "Hardware", symbol: "PC", icon: FaDesktop, color: "#7C5CFC" },
  { name: "Shopping Cart", category: "Hardware", symbol: "BUY", icon: FaCartShopping, color: "#3B82F6" },
  { name: "Credit Card / Pay", category: "Hardware", symbol: "PAY", icon: FaCreditCard, color: "#10B981" },
  { name: "Email Service", category: "Hardware", symbol: "MSG", icon: FaEnvelope, color: "#F59E0B" },
];

function getBrandIconSvgUri(IconComponent: any, color: string, size = 64): string {
  try {
    const markup = renderToStaticMarkup(
      React.createElement(IconComponent, { color, size, width: size, height: size })
    );
    return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
  } catch {
    return "";
  }
}

// Preset Device Frames (Figma-style)
const framePresets = [
  { type: "desktop", label: "Desktop (1280 × 800)", width: 960, height: 600, icon: Monitor },
  { type: "mobile", label: "iPhone 15 (390 × 844)", width: 340, height: 680, icon: Smartphone },
  { type: "tablet", label: "iPad (820 × 1180)", width: 560, height: 760, icon: Tablet },
  { type: "presentation", label: "Slide 16:9 (960 × 540)", width: 800, height: 450, icon: Layout },
];

function getElementAnchors(el: BoardElement): Record<AnchorSide, { x: number; y: number }> {
  const w = el.width || 170;
  const h = el.height || 85;
  return {
    top: { x: el.x + w / 2, y: el.y },
    right: { x: el.x + w, y: el.y + h / 2 },
    bottom: { x: el.x + w / 2, y: el.y + h },
    left: { x: el.x, y: el.y + h / 2 },
  };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const result: string[] = [];
  const safeMaxWidth = Math.max(20, maxWidth);
  const paragraphs = text.split("\n");

  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push("");
      continue;
    }

    const words = para.split(" ");
    let line = "";

    for (const rawWord of words) {
      // If a single continuous word/URL is wider than maxWidth, break it into smaller character segments
      const wordSegments: string[] = [];
      if (ctx.measureText(rawWord).width > safeMaxWidth) {
        let chunk = "";
        for (const char of rawWord) {
          if (ctx.measureText(chunk + char).width > safeMaxWidth && chunk) {
            wordSegments.push(chunk);
            chunk = char;
          } else {
            chunk += char;
          }
        }
        if (chunk) wordSegments.push(chunk);
      } else {
        wordSegments.push(rawWord);
      }

      for (const word of wordSegments) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > safeMaxWidth) {
          if (line) result.push(line);
          line = word;
        } else {
          line = test;
        }
      }
    }

    if (line) {
      result.push(line);
    }
  }

  return result;
}

type ResizeHandle =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "startPoint"
  | "endPoint";

interface ResizeHandleInfo {
  handle: ResizeHandle;
  x: number;
  y: number;
  cursor: string;
}

function getResizeHandles(el: BoardElement): ResizeHandleInfo[] {
  if (el.type === "pen" || el.type === "highlighter") return [];

  if ((el.type === "line" || el.type === "arrow") && el.points && el.points.length >= 2) {
    return [
      { handle: "startPoint", x: el.points[0].x, y: el.points[0].y, cursor: "crosshair" },
      { handle: "endPoint", x: el.points[1].x, y: el.points[1].y, cursor: "crosshair" },
    ];
  }

  const w = el.width || (el.type === "text" ? 180 : 160);
  const h = el.height || (el.type === "text" ? 48 : 90);
  const left = el.x;
  const top = el.y;
  const right = el.x + w;
  const bottom = el.y + h;
  const midX = el.x + w / 2;
  const midY = el.y + h / 2;

  return [
    { handle: "nw", x: left, y: top, cursor: "nwse-resize" },
    { handle: "n", x: midX, y: top, cursor: "ns-resize" },
    { handle: "ne", x: right, y: top, cursor: "nesw-resize" },
    { handle: "e", x: right, y: midY, cursor: "ew-resize" },
    { handle: "se", x: right, y: bottom, cursor: "nwse-resize" },
    { handle: "s", x: midX, y: bottom, cursor: "ns-resize" },
    { handle: "sw", x: left, y: bottom, cursor: "nesw-resize" },
    { handle: "w", x: left, y: midY, cursor: "ew-resize" },
  ];
}

function findHitResizeHandle(
  x: number,
  y: number,
  element: BoardElement,
  zoom: number
): ResizeHandleInfo | null {
  const handles = getResizeHandles(element);
  const hitDist = Math.max(9, 10 / zoom);
  for (const h of handles) {
    if (Math.hypot(h.x - x, h.y - y) <= hitDist) {
      return h;
    }
  }
  return null;
}

function findNearestAnchor(
  x: number,
  y: number,
  elements: BoardElement[],
  threshold = 36
): { elementId: string; side: AnchorSide; pt: { x: number; y: number } } | null {
  let nearest: { elementId: string; side: AnchorSide; pt: { x: number; y: number } } | null = null;
  let minDist = threshold;

  for (const el of elements) {
    if (el.type === "pen" || el.type === "highlighter" || el.type === "line" || el.type === "arrow" || el.type === "frame") continue;
    const anchors = getElementAnchors(el);
    for (const [side, pt] of Object.entries(anchors)) {
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = { elementId: el.id, side: side as AnchorSide, pt };
      }
    }
  }
  return nearest;
}

export default function WhiteboardCanvasTool() {
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [strokeColor, setStrokeColor] = useState<string>("#10B981");
  const [fillType, setFillType] = useState<FillType>("subtle");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [dashed, setDashed] = useState<boolean>(false);
  const [gridMode, setGridMode] = useState<GridType>("dots");
  const [canvasDark, setCanvasDark] = useState<boolean>(true);

  // Big Canvas Zoom & Pan (Figma-style)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Interactive Resizing States
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizingHandle, setResizingHandle] = useState<ResizeHandle | null>(null);
  const [hoverHandle, setHoverHandle] = useState<ResizeHandle | null>(null);
  const [canvasCursor, setCanvasCursor] = useState<string>("default");

  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    points?: { x: number; y: number }[];
  }>({
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // View Mode: Canvas / Split / Notes
  const [viewMode, setViewMode] = useState<ViewMode>("canvas");
  const [splitRatio, setSplitRatio] = useState<number>(60);
  const [isResizingSplit, setIsResizingSplit] = useState<boolean>(false);

  // Searchable Icons Library Dialog
  const [iconModalOpen, setIconModalOpen] = useState<boolean>(false);
  const [iconSearchQuery, setIconSearchQuery] = useState<string>("");
  const [iconCategory, setIconCategory] = useState<string>("All");

  // Frames Modal
  const [frameModalOpen, setFrameModalOpen] = useState<boolean>(false);

  // Notion Notes
  const [notionDoc, setNotionDoc] = useState<string>("");
  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);

  const [elements, setElements] = useState<BoardElement[]>([]);
  const [history, setHistory] = useState<BoardElement[][]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [startAnchorInfo, setStartAnchorInfo] = useState<{ elementId: string; side: AnchorSide } | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<{ x: number; y: number } | null>(null);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [copiedSS, setCopiedSS] = useState<boolean>(false);

  // Direct In-Place Note / Text Editing (Zero Alerts)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineText, setInlineText] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const splitWrapRef = useRef<HTMLDivElement | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const iconImageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Push to history
  const pushState = useCallback((newElements: BoardElement[]) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyStep + 1);
      return [...upToCurrent, newElements];
    });
    setHistoryStep((prev) => prev + 1);
    setElements(newElements);
    try {
      localStorage.setItem("prochange_whiteboard_data", JSON.stringify(newElements));
    } catch {
      // ignore
    }
  }, [historyStep]);

  // Load Elements & Doc from LocalStorage
  useEffect(() => {
    try {
      const savedDoc = localStorage.getItem("prochange_notion_board_doc");
      if (savedDoc && !savedDoc.includes("# System Architecture & Project Notes")) {
        setNotionDoc(savedDoc);
      } else {
        setNotionDoc("");
        localStorage.removeItem("prochange_notion_board_doc");
      }

      const saved = localStorage.getItem("prochange_whiteboard_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isOldStarter = parsed.some(
            (el) =>
              (el.id === "sticky-1" && el.text?.includes("Real Tech Brand Logos Active")) ||
              el.id === "frame-1" ||
              el.id === "icon-1"
          );
          if (!isOldStarter) {
            setElements(parsed);
            setHistory([parsed]);
            setHistoryStep(0);
            return;
          }
        }
      }
    } catch {
      // ignore
    }

    // Default clean empty whiteboard canvas
    setElements([]);
    setHistory([[]]);
    setHistoryStep(0);
    try {
      localStorage.removeItem("prochange_whiteboard_data");
    } catch {
      // ignore
    }
  }, []);

  // Save Notion doc
  const handleDocChange = (val: string) => {
    setNotionDoc(val);
    try {
      localStorage.setItem("prochange_notion_board_doc", val);
    } catch {
      // ignore
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      const nextStep = historyStep - 1;
      setHistoryStep(nextStep);
      setElements(history[nextStep]);
      localStorage.setItem("prochange_whiteboard_data", JSON.stringify(history[nextStep]));
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setElements(history[nextStep]);
      localStorage.setItem("prochange_whiteboard_data", JSON.stringify(history[nextStep]));
    }
  };

  const clearCanvas = () => {
    if (confirm("Are you sure you want to clear the entire whiteboard?")) {
      pushState([]);
      setSelectedId(null);
      setEditingId(null);
    }
  };

  // Convert Screen Coordinates (Mouse) to World Coordinates (taking Zoom & Pan into account!)
  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left - pan.x) / zoom;
      const y = (clientY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom]
  );

  // CLIPBOARD PASTING (Images & Text)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (
        editingId ||
        (document.activeElement &&
          (document.activeElement.tagName === "TEXTAREA" ||
            document.activeElement.tagName === "INPUT"))
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      // 1. Check Image Paste
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              const img = new window.Image();
              img.onload = () => {
                let w = img.width;
                let h = img.height;
                const maxDim = 460;
                if (w > maxDim || h > maxDim) {
                  const r = Math.min(maxDim / w, maxDim / h);
                  w *= r;
                  h *= r;
                }
                const newEl: BoardElement = {
                  id: "img-" + Date.now(),
                  type: "image",
                  x: (-pan.x + 220) / zoom,
                  y: (-pan.y + 160) / zoom,
                  width: Math.round(w),
                  height: Math.round(h),
                  src: dataUrl,
                  strokeColor: "#FFFFFF",
                  strokeWidth: 1,
                };
                pushState([...elements, newEl]);
                setSelectedId(newEl.id);
              };
              img.src = dataUrl;
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }

      // 2. Check Text Paste
      const text = e.clipboardData?.getData("text");
      if (text) {
        const linesCount = text.split("\n").reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / 24)), 0);
        const calcH = Math.max(125, linesCount * 19 + 40);
        const newEl: BoardElement = {
          id: "sticky-" + Date.now(),
          type: "sticky",
          x: (-pan.x + 220) / zoom,
          y: (-pan.y + 160) / zoom,
          width: Math.min(360, Math.max(190, text.length * 5)),
          height: Math.min(800, calcH),
          text: text,
          strokeColor: "#FEF08A",
          stickyColor: "#FEF08A",
          strokeWidth: 1,
        };
        pushState([...elements, newEl]);
        setSelectedId(newEl.id);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [elements, pan, zoom, editingId, pushState]);

  // Keyboard Shortcuts (Ctrl+Z, Delete, Spacebar Hand)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (editingId) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          const next = elements.filter((el) => el.id !== selectedId);
          pushState(next);
          setSelectedId(null);
        }
      } else if (e.key === " " && !isPanning) {
        // Spacebar to pan
        setActiveTool("hand");
      } else if (e.key.toLowerCase() === "h" && !e.ctrlKey && !e.metaKey) {
        setActiveTool("hand");
      } else if (e.key.toLowerCase() === "v" && !e.ctrlKey && !e.metaKey) {
        setActiveTool("select");
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " && activeTool === "hand") {
        setActiveTool("select");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [editingId, selectedId, elements, historyStep, history, undo, redo, pushState, isPanning, activeTool]);

  // Mouse Wheel Zoom & Pan (Figma-style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom centered around cursor
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoom = Math.min(3.0, Math.max(0.2, zoom * zoomFactor));

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setPan((prev) => ({
          x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
          y: mouseY - (mouseY - prev.y) * (newZoom / zoom),
        }));
        setZoom(newZoom);
      } else {
        // Pan
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [zoom]);

  // Resizable Splitter Logic
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingSplit || !splitWrapRef.current) return;
      const rect = splitWrapRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      if (newRatio >= 25 && newRatio <= 75) {
        setSplitRatio(newRatio);
      }
    };
    const onMouseUp = () => setIsResizingSplit(false);

    if (isResizingSplit) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizingSplit]);

  // Redraw Canvas (with Zoom & Pan transform)
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = canvasDark ? "#0e1015" : "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Apply World Zoom & Pan Transform
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Grid (Dots or Lines in World space)
    const worldLeft = -pan.x / zoom;
    const worldTop = -pan.y / zoom;
    const worldRight = worldLeft + width / zoom;
    const worldBottom = worldTop + height / zoom;

    if (gridMode === "dots") {
      ctx.fillStyle = canvasDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.15)";
      const dotSpacing = 24;
      const startX = Math.floor(worldLeft / dotSpacing) * dotSpacing;
      const startY = Math.floor(worldTop / dotSpacing) * dotSpacing;
      for (let x = startX; x < worldRight; x += dotSpacing) {
        for (let y = startY; y < worldBottom; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (gridMode === "grid") {
      ctx.strokeStyle = canvasDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)";
      ctx.lineWidth = 1;
      const spacing = 32;
      const startX = Math.floor(worldLeft / spacing) * spacing;
      const startY = Math.floor(worldTop / spacing) * spacing;
      ctx.beginPath();
      for (let x = startX; x < worldRight; x += spacing) {
        ctx.moveTo(x, worldTop);
        ctx.lineTo(x, worldBottom);
      }
      for (let y = startY; y < worldBottom; y += spacing) {
        ctx.moveTo(worldLeft, y);
        ctx.lineTo(worldRight, y);
      }
      ctx.stroke();
    }

    // 1. First Render Frames (Background containers)
    elements
      .filter((el) => el.type === "frame")
      .forEach((el) => {
        ctx.save();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = el.id === selectedId ? "#10B981" : "rgba(124, 92, 252, 0.5)";
        ctx.fillStyle = canvasDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.015)";

        const radius = el.frameType === "mobile" ? 28 : 10;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width || 800, el.height || 500, radius);
        ctx.fill();
        ctx.stroke();

        // Frame Label Pill on Top
        ctx.fillStyle = "#7C5CFC";
        ctx.font = "700 12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(el.frameLabel || "Frame", el.x + 8, el.y - 8);

        // Frame Top Bar Header (for Desktop & Phone)
        if (el.frameType === "desktop") {
          ctx.fillStyle = canvasDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width || 800, 32, [10, 10, 0, 0]);
          ctx.fill();

          // 3 Window Dots (Red, Yellow, Green)
          const dots = ["#f87171", "#fbbf24", "#34d399"];
          dots.forEach((dotColor, idx) => {
            ctx.beginPath();
            ctx.arc(el.x + 18 + idx * 14, el.y + 16, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = dotColor;
            ctx.fill();
          });
        } else if (el.frameType === "mobile") {
          // Dynamic Island / Notch
          ctx.fillStyle = canvasDark ? "#000000" : "#1e293b";
          ctx.beginPath();
          ctx.roundRect(el.x + (el.width || 340) / 2 - 40, el.y + 10, 80, 20, 10);
          ctx.fill();

          // Home Bar
          ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
          ctx.beginPath();
          ctx.roundRect(el.x + (el.width || 340) / 2 - 45, el.y + (el.height || 680) - 14, 90, 4, 2);
          ctx.fill();
        }

        ctx.restore();
      });

    // 2. Render All Standard Elements (Shapes, Lines, Icons, Stickies, Images)
    elements
      .filter((el) => el.type !== "frame")
      .forEach((el) => {
        ctx.save();
        ctx.lineWidth = el.strokeWidth;
        ctx.strokeStyle = el.strokeColor;
        ctx.fillStyle = el.fillColor || "transparent";

        if (el.dashed) {
          ctx.setLineDash([8, 6]);
        } else {
          ctx.setLineDash([]);
        }

        if (el.id === selectedId) {
          ctx.shadowColor = "#10B981";
          ctx.shadowBlur = 12;
        }

        if (el.type === "pen" && el.points && el.points.length > 0) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        } else if (el.type === "highlighter" && el.points && el.points.length > 0) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = el.strokeWidth * 3;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
          ctx.restore();
        } else if (el.type === "rectangle" && el.width && el.height) {
          const radius = 8;
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width, el.height, radius);
          if (el.fillColor && el.fillColor !== "transparent") ctx.fill();
          ctx.stroke();
        } else if (el.type === "circle" && el.width && el.height) {
          ctx.beginPath();
          const rx = Math.abs(el.width / 2);
          const ry = Math.abs(el.height / 2);
          const cx = el.x + el.width / 2;
          const cy = el.y + el.height / 2;
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          if (el.fillColor && el.fillColor !== "transparent") ctx.fill();
          ctx.stroke();
        } else if (el.type === "diamond" && el.width && el.height) {
          ctx.beginPath();
          const cx = el.x + el.width / 2;
          const cy = el.y + el.height / 2;
          ctx.moveTo(cx, el.y);
          ctx.lineTo(el.x + el.width, cy);
          ctx.lineTo(cx, el.y + el.height);
          ctx.lineTo(el.x, cy);
          ctx.closePath();
          if (el.fillColor && el.fillColor !== "transparent") ctx.fill();
          ctx.stroke();
        } else if (el.type === "line" && el.points && el.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          ctx.lineTo(el.points[1].x, el.points[1].y);
          ctx.stroke();
        } else if (el.type === "arrow" && el.points && el.points.length >= 2) {
          const p1 = el.points[0];
          const p2 = el.points[1];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Arrowhead
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          const headLen = 14;
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(
            p2.x - headLen * Math.cos(angle - Math.PI / 6),
            p2.y - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            p2.x - headLen * Math.cos(angle + Math.PI / 6),
            p2.y - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = el.strokeColor;
          ctx.fill();
        } else if (el.type === "sticky" && el.width && el.height) {
          // Notion Sticky Note
          const noteW = el.width;
          const noteH = el.height;
          ctx.save();
          ctx.fillStyle = el.stickyColor || "#FEF08A";
          ctx.shadowColor = "rgba(0,0,0,0.22)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, noteW, noteH, 8);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.strokeStyle = el.id === selectedId ? "#10B981" : "rgba(0,0,0,0.18)";
          ctx.lineWidth = el.id === selectedId ? 2 : 1;
          ctx.stroke();

          if (editingId !== el.id && el.text) {
            // Clip strictly inside sticky note with 8px padding so text NEVER overflows
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(el.x + 8, el.y + 8, Math.max(10, noteW - 16), Math.max(10, noteH - 16), 4);
            ctx.clip();

            ctx.fillStyle = "#1e293b";
            const usableWidth = Math.max(30, noteW - 24);

            let fontSize = 13;
            let lineHeight = 18;
            ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
            let lines = wrapText(ctx, el.text, usableWidth);
            const neededHeight = lines.length * lineHeight + 24;

            // Dynamically scale down font if text is long
            if (neededHeight > noteH && noteH >= 60) {
              fontSize = 11;
              lineHeight = 15;
              ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
              lines = wrapText(ctx, el.text, usableWidth);
            }

            lines.forEach((line, idx) => {
              const yPos = el.y + 22 + idx * lineHeight;
              if (yPos <= el.y + noteH - 4) {
                ctx.fillText(line, el.x + 12, yPos);
              }
            });

            ctx.restore();
          }
          ctx.restore();
        } else if (el.type === "text") {
          if (editingId !== el.id && el.text) {
            ctx.fillStyle = el.strokeColor;
            ctx.font = `650 ${el.fontSize || 16}px ui-sans-serif, system-ui, sans-serif`;
            const lines = el.text.split("\n");
            lines.forEach((l, i) => {
              ctx.fillText(l, el.x, el.y + (i + 1) * 22);
            });
          }
        } else if (el.type === "icon" && el.width && el.height) {
          // Architecture Tech Node with REAL Official SVG Brand Logo
          const ic =
            allTechIcons.find(
              (t) => t.name.toLowerCase() === (el.iconName || "").toLowerCase()
            ) ||
            allTechIcons.find(
              (t) =>
                (el.iconName || "").toLowerCase().includes(t.name.toLowerCase()) ||
                t.name.toLowerCase().includes((el.iconName || "").toLowerCase())
            );

          const brandColor = ic?.color || el.strokeColor || "#10B981";

          // 1. Sleek rounded node plate with subtle glass fill
          ctx.save();
          const radius = 12;
          ctx.fillStyle = canvasDark ? "rgba(18, 22, 30, 0.9)" : "rgba(255, 255, 255, 0.95)";
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width, el.height, radius);
          ctx.fill();

          // Subtle border with brand accent
          ctx.strokeStyle = el.id === selectedId ? "#10B981" : `${brandColor}66`;
          ctx.lineWidth = el.id === selectedId ? 2 : 1.2;
          ctx.stroke();

          // Brand color top indicator bar
          ctx.fillStyle = brandColor;
          ctx.beginPath();
          ctx.roundRect(el.x + 8, el.y + 4, Math.max(10, el.width - 16), 2.5, 1.5);
          ctx.fill();

          // 2. Render REAL Official SVG Brand Logo!
          if (ic) {
            const cacheKey = `${ic.name}-${brandColor}`;
            let cachedImg = iconImageCacheRef.current.get(cacheKey);
            if (!cachedImg) {
              const svgUri = getBrandIconSvgUri(ic.icon, brandColor, 80);
              if (svgUri) {
                cachedImg = new window.Image();
                cachedImg.src = svgUri;
                cachedImg.onload = () => drawCanvas();
                iconImageCacheRef.current.set(cacheKey, cachedImg);
              }
            }

            if (cachedImg && cachedImg.complete) {
              const maxLogoW = Math.max(24, el.width - 24);
              const maxLogoH = Math.max(24, el.height - 34);
              const logoSize = Math.min(maxLogoW, maxLogoH, 46);
              const logoX = el.x + (el.width - logoSize) / 2;
              const logoY = el.y + Math.max(10, (el.height - 22 - logoSize) / 2);
              ctx.drawImage(cachedImg, logoX, logoY, logoSize, logoSize);
            }
          }

          // 3. Clean Centered Typography Label
          if (editingId !== el.id) {
            ctx.fillStyle = canvasDark ? "#F3F4F6" : "#111827";
            ctx.font = "700 12px ui-sans-serif, system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const labelText = el.text || el.iconName || "Component";
            const textY = el.y + el.height - 13;
            ctx.fillText(labelText, el.x + el.width / 2, textY);
            ctx.textAlign = "left";
          }

          ctx.restore();
        } else if (el.type === "image" && el.src && el.width && el.height) {
          // Pasted Image from Clipboard
          let cachedImg = imageCacheRef.current.get(el.src);
          if (!cachedImg) {
            cachedImg = new window.Image();
            cachedImg.src = el.src;
            cachedImg.onload = () => drawCanvas();
            imageCacheRef.current.set(el.src, cachedImg);
          }
          if (cachedImg.complete) {
            ctx.drawImage(cachedImg, el.x, el.y, el.width, el.height);
          }
          ctx.strokeRect(el.x, el.y, el.width, el.height);
        }

        ctx.restore();
      });

    // 2.5 Render Selection Bounding Box & 8 Interactive Resize Handles
    if (selectedId) {
      const selectedEl = elements.find((el) => el.id === selectedId);
      if (selectedEl && selectedEl.type !== "pen" && selectedEl.type !== "highlighter") {
        ctx.save();
        const handles = getResizeHandles(selectedEl);
        const handleSize = Math.max(6, 8 / zoom);

        if (selectedEl.type !== "line" && selectedEl.type !== "arrow") {
          const w = selectedEl.width || (selectedEl.type === "text" ? 180 : 160);
          const h = selectedEl.height || (selectedEl.type === "text" ? 48 : 90);
          ctx.strokeStyle = "#10B981";
          ctx.lineWidth = Math.max(1, 1.5 / zoom);
          ctx.setLineDash([5 / zoom, 4 / zoom]);
          ctx.strokeRect(selectedEl.x - 1 / zoom, selectedEl.y - 1 / zoom, w + 2 / zoom, h + 2 / zoom);
          ctx.setLineDash([]);
        }

        handles.forEach((h) => {
          ctx.save();
          const isHovered = hoverHandle === h.handle || resizingHandle === h.handle;
          ctx.fillStyle = isHovered ? "#10B981" : "#FFFFFF";
          ctx.strokeStyle = isHovered ? "#FFFFFF" : "#10B981";
          ctx.lineWidth = Math.max(1.2, 1.8 / zoom);

          ctx.beginPath();
          if (h.handle === "startPoint" || h.handle === "endPoint") {
            ctx.arc(h.x, h.y, handleSize / 1.4, 0, Math.PI * 2);
          } else {
            ctx.rect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
          }
          ctx.fill();
          ctx.stroke();

          if (isHovered) {
            ctx.shadowColor = "#10B981";
            ctx.shadowBlur = 8;
          }
          ctx.restore();
        });

        ctx.restore();
      }
    }

    // 3. Magnetic Connector Anchors on shapes
    if (activeTool === "arrow" || activeTool === "line") {
      elements.forEach((el) => {
        if (el.type === "pen" || el.type === "highlighter" || el.type === "line" || el.type === "arrow" || el.type === "frame") return;
        const anchors = getElementAnchors(el);
        ctx.save();
        Object.values(anchors).forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#10B981";
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
        ctx.restore();
      });
    }

    // Glowing Snap Indicator
    if (hoverAnchor) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(hoverAnchor.x, hoverAnchor.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
      ctx.fill();
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Live Drawing Preview
    if (isDrawing && startPos) {
      ctx.save();
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      if (dashed) ctx.setLineDash([8, 6]);

      if (activeTool === "pen" && currentPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.stroke();
      } else if (activeTool === "highlighter" && currentPoints.length > 1) {
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = strokeWidth * 3;
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore(); // Restore World Transform
  }, [
    elements,
    isDrawing,
    startPos,
    currentPoints,
    activeTool,
    strokeColor,
    strokeWidth,
    dashed,
    gridMode,
    canvasDark,
    selectedId,
    hoverHandle,
    resizingHandle,
    hoverAnchor,
    editingId,
    zoom,
    pan,
  ]);

  // Resize canvas when container size changes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(680, window.innerHeight - 210);
      drawCanvas();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawCanvas, splitRatio, viewMode]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Commit in-place inline text editing
  const commitInlineEdit = () => {
    if (!editingId) return;
    const next = elements.map((item) => {
      if (item.id !== editingId) return item;
      let newH = item.height;
      if (item.type === "sticky") {
        const usableWidth = Math.max(50, (item.width || 180) - 24);
        let lineCount = 1;
        try {
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.font = "600 13px ui-sans-serif, system-ui, sans-serif";
            lineCount = wrapText(tempCtx, inlineText, usableWidth).length;
          } else {
            lineCount = inlineText.split("\n").reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / 20)), 0);
          }
        } catch {
          lineCount = inlineText.split("\n").reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / 20)), 0);
        }
        const neededHeight = lineCount * 19 + 38;
        newH = Math.max(item.height || 125, Math.round(neededHeight));
      }
      return { ...item, text: inlineText, height: newH };
    });
    pushState(next);
    setEditingId(null);
    setInlineText("");
  };

  // Pointer Down (Using World Coordinates)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (editingId) {
      commitInlineEdit();
      return;
    }

    // Middle Mouse or Hand tool -> Start Pan
    if (e.button === 1 || activeTool === "hand") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);

    // 1. Check if clicked on a resize handle of the currently selected element!
    if (activeTool === "select" && selectedId) {
      const selectedEl = elements.find((el) => el.id === selectedId);
      if (selectedEl) {
        const hitHandle = findHitResizeHandle(x, y, selectedEl, zoom);
        if (hitHandle) {
          setIsResizing(true);
          setResizingHandle(hitHandle.handle);
          resizeStartRef.current = {
            mouseX: x,
            mouseY: y,
            x: selectedEl.x,
            y: selectedEl.y,
            width: selectedEl.width || (selectedEl.type === "text" ? 180 : 160),
            height: selectedEl.height || (selectedEl.type === "text" ? 48 : 90),
            fontSize: selectedEl.fontSize || 16,
            points: selectedEl.points ? selectedEl.points.map((p) => ({ ...p })) : undefined,
          };
          return;
        }
      }
    }

    if (activeTool === "select") {
      const found = [...elements].reverse().find((el) => {
        if (el.type === "rectangle" || el.type === "sticky" || el.type === "icon" || el.type === "image") {
          return x >= el.x && x <= el.x + (el.width || 0) && y >= el.y && y <= el.y + (el.height || 0);
        }
        if (el.type === "frame") {
          return (
            (x >= el.x && x <= el.x + (el.width || 0) && y >= el.y - 20 && y <= el.y + 40) ||
            (Math.abs(x - el.x) < 16 && y >= el.y && y <= el.y + (el.height || 0)) ||
            (Math.abs(x - (el.x + (el.width || 0))) < 16 && y >= el.y && y <= el.y + (el.height || 0)) ||
            (Math.abs(y - (el.y + (el.height || 0))) < 16 && x >= el.x && x <= el.x + (el.width || 0))
          );
        }
        if (el.type === "circle") {
          const rx = (el.width || 0) / 2;
          const ry = (el.height || 0) / 2;
          const cx = el.x + rx;
          const cy = el.y + ry;
          return Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2) <= 1;
        }
        if (el.type === "text") {
          const w = el.width || 180;
          const h = el.height || 48;
          return x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h;
        }
        if (el.type === "diamond") {
          const w = el.width || 100;
          const h = el.height || 80;
          return x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h;
        }
        if (el.points && el.points.length > 0) {
          return el.points.some((p) => Math.hypot(p.x - x, p.y - y) < 18);
        }
        return false;
      });

      setSelectedId(found ? found.id : null);
      if (found) {
        setIsDrawing(true);
        setStartPos({ x, y });
      }
      return;
    }

    if (activeTool === "eraser") {
      const next = elements.filter((el) => {
        if (el.type === "rectangle" || el.type === "sticky" || el.type === "icon" || el.type === "frame" || el.type === "image") {
          return !(x >= el.x && x <= el.x + (el.width || 0) && y >= el.y && y <= el.y + (el.height || 0));
        }
        if (el.points) {
          return !el.points.some((p) => Math.hypot(p.x - x, p.y - y) < 20);
        }
        return true;
      });
      if (next.length !== elements.length) {
        pushState(next);
      }
      return;
    }

    // Direct in-place editing when text tool is clicked
    if (activeTool === "text") {
      const newEl: BoardElement = {
        id: "text-" + Date.now(),
        type: "text",
        x,
        y,
        width: 180,
        height: 48,
        text: "",
        strokeColor,
        strokeWidth: 2,
        fontSize: 16,
      };
      pushState([...elements, newEl]);
      setEditingId(newEl.id);
      setInlineText("");
      setActiveTool("select");
      setSelectedId(newEl.id);
      return;
    }

    // Direct in-place sticky note
    if (activeTool === "sticky") {
      const newEl: BoardElement = {
        id: "sticky-" + Date.now(),
        type: "sticky",
        x,
        y,
        width: 180,
        height: 125,
        text: "",
        strokeColor: "#FEF08A",
        stickyColor: "#FEF08A",
        strokeWidth: 1,
      };
      pushState([...elements, newEl]);
      setSelectedId(newEl.id);
      setEditingId(newEl.id);
      setInlineText("");
      setActiveTool("select");
      return;
    }

    // Flexible Arrow Connection Snap
    if (activeTool === "arrow" || activeTool === "line") {
      const nearest = findNearestAnchor(x, y, elements);
      if (nearest) {
        setStartPos(nearest.pt);
        setStartAnchorInfo({ elementId: nearest.elementId, side: nearest.side });
      } else {
        setStartPos({ x, y });
        setStartAnchorInfo(null);
      }
      setIsDrawing(true);
      setCurrentPoints([{ x, y }]);
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPoints([{ x, y }]);
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);

    // 1. Interactive Resizing Drag
    if (isResizing && resizingHandle && selectedId) {
      const start = resizeStartRef.current;
      const dx = x - start.mouseX;
      const dy = y - start.mouseY;

      setElements((prev) => {
        const updated = prev.map((el) => {
          if (el.id !== selectedId) return el;

          // Line / Arrow endpoint resizing
          if ((el.type === "arrow" || el.type === "line") && start.points && start.points.length >= 2) {
            const pts = [...start.points];
            if (resizingHandle === "startPoint") {
              pts[0] = { x, y };
            } else if (resizingHandle === "endPoint") {
              pts[1] = { x, y };
            }
            return {
              ...el,
              x: Math.min(pts[0].x, pts[1].x),
              y: Math.min(pts[0].y, pts[1].y),
              points: pts,
            };
          }

          let newX = start.x;
          let newY = start.y;
          let newW = start.width;
          let newH = start.height;
          const minW = el.type === "frame" ? 180 : 36;
          const minH = el.type === "frame" ? 120 : 28;

          switch (resizingHandle) {
            case "se":
              newW = Math.max(minW, start.width + dx);
              newH = Math.max(minH, start.height + dy);
              break;
            case "e":
              newW = Math.max(minW, start.width + dx);
              break;
            case "s":
              newH = Math.max(minH, start.height + dy);
              break;
            case "nw":
              newW = Math.max(minW, start.width - dx);
              newH = Math.max(minH, start.height - dy);
              newX = start.x + (start.width - newW);
              newY = start.y + (start.height - newH);
              break;
            case "n":
              newH = Math.max(minH, start.height - dy);
              newY = start.y + (start.height - newH);
              break;
            case "ne":
              newW = Math.max(minW, start.width + dx);
              newH = Math.max(minH, start.height - dy);
              newY = start.y + (start.height - newH);
              break;
            case "sw":
              newW = Math.max(minW, start.width - dx);
              newH = Math.max(minH, start.height + dy);
              newX = start.x + (start.width - newW);
              break;
            case "w":
              newW = Math.max(minW, start.width - dx);
              newX = start.x + (start.width - newW);
              break;
          }

          // Scale font size proportionally for text elements
          let fontSize = el.fontSize;
          if (el.type === "text" && start.fontSize && (resizingHandle === "se" || resizingHandle === "nw" || resizingHandle === "ne" || resizingHandle === "sw")) {
            const scale = newW / Math.max(1, start.width);
            fontSize = Math.round(Math.max(12, Math.min(64, start.fontSize * scale)));
          }

          return {
            ...el,
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
            fontSize,
          };
        });

        // Stretch connected arrows dynamically
        const resizedEl = updated.find((el) => el.id === selectedId);
        if (!resizedEl) return updated;
        const anchors = getElementAnchors(resizedEl);

        return updated.map((el) => {
          if (el.type !== "arrow" && el.type !== "line") return el;
          let pts = el.points ? [...el.points] : [];
          let changed = false;

          if (el.startElementId === selectedId && el.startAnchor && anchors[el.startAnchor]) {
            pts[0] = anchors[el.startAnchor];
            changed = true;
          }
          if (el.endElementId === selectedId && el.endAnchor && anchors[el.endAnchor]) {
            pts[1] = anchors[el.endAnchor];
            changed = true;
          }

          return changed ? { ...el, points: pts } : el;
        });
      });
      return;
    }

    // 2. Hover handle detection when not dragging
    if (activeTool === "select" && selectedId && !isDrawing) {
      const selectedEl = elements.find((el) => el.id === selectedId);
      if (selectedEl) {
        const hitHandle = findHitResizeHandle(x, y, selectedEl, zoom);
        if (hitHandle) {
          setHoverHandle(hitHandle.handle);
          setCanvasCursor(hitHandle.cursor);
          return;
        }
      }
    }

    if (hoverHandle) setHoverHandle(null);

    // 3. Hover over element body
    if (activeTool === "select" && selectedId && !isDrawing) {
      const selectedEl = elements.find((el) => el.id === selectedId);
      if (
        selectedEl &&
        x >= selectedEl.x &&
        x <= selectedEl.x + (selectedEl.width || 0) &&
        y >= selectedEl.y &&
        y <= selectedEl.y + (selectedEl.height || 0)
      ) {
        setCanvasCursor("move");
      } else {
        setCanvasCursor("default");
      }
    } else if (activeTool === "hand") {
      setCanvasCursor(isPanning ? "grabbing" : "grab");
    } else if (activeTool === "select") {
      setCanvasCursor("default");
    }

    // Anchor snapping check
    if (activeTool === "arrow" || activeTool === "line") {
      const near = findNearestAnchor(x, y, elements);
      setHoverAnchor(near ? near.pt : null);
    } else {
      if (hoverAnchor) setHoverAnchor(null);
    }

    if (!isDrawing) return;

    if (activeTool === "select" && selectedId && startPos) {
      const dx = x - startPos.x;
      const dy = y - startPos.y;
      setStartPos({ x, y });

      setElements((prev) => {
        // Move target element
        const updated = prev.map((el) => {
          if (el.id !== selectedId) return el;
          if (el.points) {
            return {
              ...el,
              x: el.x + dx,
              y: el.y + dy,
              points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
            };
          }
          return { ...el, x: el.x + dx, y: el.y + dy };
        });

        // Stretch connected arrows dynamically
        const movedEl = updated.find((el) => el.id === selectedId);
        if (!movedEl) return updated;
        const anchors = getElementAnchors(movedEl);

        return updated.map((el) => {
          if (el.type !== "arrow" && el.type !== "line") return el;
          let pts = el.points ? [...el.points] : [];
          let changed = false;

          if (el.startElementId === selectedId && el.startAnchor && anchors[el.startAnchor]) {
            pts[0] = anchors[el.startAnchor];
            changed = true;
          }
          if (el.endElementId === selectedId && el.endAnchor && anchors[el.endAnchor]) {
            pts[1] = anchors[el.endAnchor];
            changed = true;
          }

          return changed ? { ...el, points: pts } : el;
        });
      });
      return;
    }

    if (activeTool === "pen" || activeTool === "highlighter") {
      setCurrentPoints((prev) => [...prev, { x, y }]);
      drawCanvas();
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isResizing) {
      setIsResizing(false);
      setResizingHandle(null);
      pushState(elements);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === "select") {
      pushState(elements);
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);
    if (!startPos) return;

    const fillVal =
      fillType === "none"
        ? "transparent"
        : fillType === "subtle"
        ? `${strokeColor}22`
        : strokeColor;

    let newEl: BoardElement | null = null;
    const id = "elem-" + Date.now();

    if (activeTool === "pen" || activeTool === "highlighter") {
      if (currentPoints.length > 1) {
        newEl = {
          id,
          type: activeTool,
          x: startPos.x,
          y: startPos.y,
          points: currentPoints,
          strokeColor,
          strokeWidth,
        };
      }
    } else if (activeTool === "rectangle" || activeTool === "circle" || activeTool === "diamond") {
      newEl = {
        id,
        type: activeTool,
        x: Math.min(startPos.x, x),
        y: Math.min(startPos.y, y),
        width: Math.abs(x - startPos.x),
        height: Math.abs(y - startPos.y),
        strokeColor,
        fillColor: fillVal,
        strokeWidth,
        dashed,
      };
    } else if (activeTool === "arrow" || activeTool === "line") {
      const endNearest = findNearestAnchor(x, y, elements);
      const endPt = endNearest ? endNearest.pt : { x, y };

      newEl = {
        id,
        type: activeTool,
        x: startPos.x,
        y: startPos.y,
        points: [startPos, endPt],
        strokeColor,
        strokeWidth,
        dashed,
        startElementId: startAnchorInfo?.elementId,
        startAnchor: startAnchorInfo?.side,
        endElementId: endNearest?.elementId,
        endAnchor: endNearest?.side,
      };
    }

    if (newEl) {
      pushState([...elements, newEl]);
    }

    setStartPos(null);
    setStartAnchorInfo(null);
    setCurrentPoints([]);
  };

  // Double click on element to edit in-place
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);

    const found = [...elements].reverse().find((el) => {
      if (el.type === "sticky" || el.type === "text" || el.type === "icon") {
        return x >= el.x && x <= el.x + (el.width || 180) && y >= el.y && y <= el.y + (el.height || 60);
      }
      return false;
    });

    if (found) {
      setEditingId(found.id);
      setInlineText(found.text || "");
      setSelectedId(found.id);
      setTimeout(() => {
        editTextareaRef.current?.focus();
        editTextareaRef.current?.select();
      }, 50);
    }
  };

  // Add Figma Frame Layout
  const addFrameLayout = (frame: (typeof framePresets)[0]) => {
    const center = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
    const newEl: BoardElement = {
      id: "frame-" + Date.now(),
      type: "frame",
      frameType: frame.type as FrameType,
      frameLabel: frame.label,
      x: center.x - frame.width / 2,
      y: center.y - frame.height / 2,
      width: frame.width,
      height: frame.height,
      strokeColor: "#7C5CFC",
      fillColor: "rgba(124, 92, 252, 0.03)",
      strokeWidth: 2,
    };
    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
    setFrameModalOpen(false);
  };

  // Add Icon from Searchable Library
  const addIconFromLibrary = (ic: (typeof allTechIcons)[0]) => {
    const center = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
    const newEl: BoardElement = {
      id: "icon-" + Date.now(),
      type: "icon",
      x: center.x - 60,
      y: center.y - 45,
      width: 120,
      height: 90,
      iconName: ic.name,
      strokeColor: ic.color || "#10B981",
      strokeWidth: 2,
      text: ic.name,
    };
    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
    setIconModalOpen(false);
  };

  // 1-Click Copy Screenshot to Clipboard
  const copyScreenshot = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopiedSS(true);
        setTimeout(() => setCopiedSS(false), 1600);
      }, "image/png");
    } catch {
      alert("Direct screenshot copy failed. You can use Export PNG instead.");
    }
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `prochange-whiteboard-${Date.now()}.png`;
    a.click();
  };

  const exportJPG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `prochange-whiteboard-${Date.now()}.jpg`;
    a.click();
  };

  const copyDoc = async () => {
    await navigator.clipboard.writeText(notionDoc);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 1400);
  };

  // Find currently editing element for inline positioning in screen coordinates
  const editingElement = elements.find((el) => el.id === editingId);
  const editingScreenPos = editingElement
    ? {
        x: editingElement.x * zoom + pan.x,
        y: editingElement.y * zoom + pan.y,
        w: (editingElement.width || 180) * zoom,
        h: (editingElement.height || 100) * zoom,
      }
    : null;

  // Filtered Tech Icons
  const filteredTechIcons = allTechIcons.filter((ic) => {
    const matchesCat = iconCategory === "All" || ic.category === iconCategory;
    const matchesQuery =
      !iconSearchQuery ||
      (ic.name + " " + ic.category).toLowerCase().includes(iconSearchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="workspace home-workspace" style={{ padding: "14px 20px 24px" }}>
      {/* Top Header & View Mode Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={13} style={{ color: "var(--accent)" }} />
            <span>FIGMA, ERASER.IO & NOTION WHITEBOARD CANVAS</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "2px 0 0", letterSpacing: "-0.5px" }}>
            Whiteboard & Architecture Canvas
          </h1>
        </div>

        {/* View Mode Switcher & Export Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Mode Switch: Canvas Only / Split View / Notion Doc */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${viewMode === "canvas" ? "active" : ""}`}
              onClick={() => setViewMode("canvas")}
              title="Full Canvas View"
            >
              <Eye size={13} /> Canvas Only
            </button>
            <button
              className={`mode-btn ${viewMode === "split" ? "active" : ""}`}
              onClick={() => setViewMode("split")}
              title="Split View (Canvas + Notion Notes)"
            >
              <Split size={13} /> Split View
            </button>
            <button
              className={`mode-btn ${viewMode === "notes" ? "active" : ""}`}
              onClick={() => setViewMode("notes")}
              title="Full Notion Document Notes"
            >
              <FileText size={13} /> Notion Notes
            </button>
          </div>

          {/* 1-Click Copy Screenshot & PNG Download */}
          <button
            className="primary-button"
            onClick={copyScreenshot}
            title="Copy high-res screenshot directly to clipboard (paste in Slack, Discord, Notion)"
            style={{ padding: "7px 15px", fontSize: "12.5px" }}
          >
            {copiedSS ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedSS ? "Screenshot Copied!" : "Copy Screenshot"}</span>
          </button>

          <button className="secondary-btn" onClick={exportPNG} title="Download High-Res PNG" style={{ padding: "7px 12px" }}>
            <Download size={13} /> PNG
          </button>

          <button className="subtle-btn" onClick={undo} disabled={historyStep <= 0} title="Undo (Ctrl+Z)">
            <Undo2 size={14} />
          </button>
          <button className="subtle-btn" onClick={redo} disabled={historyStep >= history.length - 1} title="Redo (Ctrl+Y)">
            <Redo2 size={14} />
          </button>
          <button className="subtle-btn" onClick={clearCanvas} title="Clear canvas">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Floating Tool Dock (Shapes, Tools, Frames, 50+ Icons, Zoom) */}
      {viewMode !== "notes" && (
        <div
          className="card-plate"
          style={{
            padding: "6px 12px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            background: "var(--surface)",
          }}
        >
          {/* Main Drawing & Shape Tools */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {/* Primary Navigation & Canvas Mode: Select & Hand (Icon Only) */}
            <button
              className={`mode-btn ${activeTool === "select" ? "active" : ""}`}
              onClick={() => setActiveTool("select")}
              title="Select & Resize (V)"
              style={{
                padding: "6px 9px",
                borderRadius: 6,
                border: activeTool === "select" ? "1px solid var(--accent)" : "1px solid transparent",
                background: activeTool === "select" ? "color-mix(in srgb, var(--accent) 18%, var(--surface-2))" : "transparent",
                color: activeTool === "select" ? "var(--text)" : "var(--muted)",
              }}
            >
              <MousePointer size={15} />
            </button>

            <button
              className={`mode-btn ${activeTool === "hand" ? "active" : ""}`}
              onClick={() => setActiveTool("hand")}
              title="Hand Tool: Pan Canvas (H or hold Space)"
              style={{
                padding: "6px 9px",
                borderRadius: 6,
                border: activeTool === "hand" ? "1px solid #F59E0B" : "1px solid transparent",
                background: activeTool === "hand" ? "rgba(245, 158, 11, 0.22)" : "transparent",
                color: activeTool === "hand" ? "#F59E0B" : "var(--muted)",
              }}
            >
              <Hand size={15} />
            </button>

            <div style={{ width: 1, height: 18, background: "var(--line)", margin: "0 2px" }} />

            {/* Drawing & Shape Tools */}
            {[
              { id: "pen", label: "Pen Brush", icon: Pencil },
              { id: "highlighter", label: "Highlighter", icon: Highlighter },
              { id: "rectangle", label: "Rectangle", icon: Square },
              { id: "circle", label: "Circle / Ellipse", icon: Circle },
              { id: "diamond", label: "Decision Diamond", icon: Diamond },
              { id: "arrow", label: "Flexible Connector Arrow", icon: ArrowRight },
              { id: "line", label: "Line", icon: Minus },
              { id: "text", label: "Text Block", icon: Type },
              { id: "sticky", label: "Notion Sticky Note", icon: StickyNote },
              { id: "eraser", label: "Eraser", icon: Eraser },
            ].map((tool) => {
              const Icon = tool.icon;
              const active = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  className={`mode-btn ${active ? "active" : ""}`}
                  onClick={() => setActiveTool(tool.id as ToolType)}
                  title={tool.label}
                  style={{
                    padding: "6px 9px",
                    borderRadius: 6,
                    border: active ? "1px solid var(--accent)" : "1px solid transparent",
                    background: active ? "color-mix(in srgb, var(--accent) 18%, var(--surface-2))" : "transparent",
                    color: active ? "var(--text)" : "var(--muted)",
                  }}
                >
                  <Icon size={15} />
                </button>
              );
            })}

            <div style={{ width: 1, height: 18, background: "var(--line)", margin: "0 2px" }} />

            {/* Device Frames Button (Icon Only) */}
            <button
              className="subtle-btn"
              onClick={() => setFrameModalOpen(true)}
              style={{
                padding: "6px 9px",
                borderRadius: 6,
                color: "var(--purple)",
                borderColor: "rgba(124, 92, 252, 0.4)",
                background: "rgba(124, 92, 252, 0.1)",
              }}
              title="Add Device Frames (Desktop, iPhone, iPad, Slide)"
            >
              <Layout size={15} />
            </button>

            {/* 50+ Real Tech Logos & Icons Library Button (Icon Only) */}
            <button
              className="subtle-btn"
              onClick={() => setIconModalOpen(true)}
              style={{
                padding: "6px 9px",
                borderRadius: 6,
                color: "var(--accent)",
                borderColor: "rgba(16, 185, 129, 0.4)",
                background: "rgba(16, 185, 129, 0.1)",
              }}
              title="Open 50+ Tech Logos & Developer Icons Library"
            >
              <Cpu size={15} />
            </button>
          </div>

          {/* Customization Options: Colors, Stroke, Zoom Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Color Palette */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {colorPalette.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setStrokeColor(c.hex)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: c.hex,
                    border: strokeColor === c.hex ? "2px solid #ffffff" : "1px solid rgba(0,0,0,0.3)",
                    transform: strokeColor === c.hex ? "scale(1.2)" : "scale(1)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  title={c.name}
                />
              ))}
            </div>

            <div style={{ width: 1, height: 18, background: "var(--line)" }} />

            {/* Stroke Width */}
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {[
                { val: 2, label: "Thin" },
                { val: 4, label: "Med" },
                { val: 7, label: "Bold" },
              ].map((s) => (
                <button
                  key={s.val}
                  className="subtle-btn"
                  onClick={() => setStrokeWidth(s.val)}
                  style={{
                    padding: "3px 6px",
                    fontSize: 10.5,
                    fontWeight: strokeWidth === s.val ? 800 : 500,
                    background: strokeWidth === s.val ? "var(--surface-3)" : "transparent",
                    borderColor: strokeWidth === s.val ? "var(--accent)" : "var(--line)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div style={{ width: 1, height: 18, background: "var(--line)" }} />

            {/* Figma-style Zoom In/Out & Reset Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button
                className="subtle-btn"
                onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.15).toFixed(2))))}
                title="Zoom Out (Ctrl -)"
                style={{ padding: "3px 6px" }}
              >
                <ZoomOut size={13} />
              </button>

              <button
                className="subtle-btn"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                title="Reset Zoom to 100%"
                style={{ padding: "3px 7px", fontSize: 11, fontWeight: 700, minWidth: 44 }}
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                className="subtle-btn"
                onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.15).toFixed(2))))}
                title="Zoom In (Ctrl +)"
                style={{ padding: "3px 6px" }}
              >
                <ZoomIn size={13} />
              </button>
            </div>

            <div style={{ width: 1, height: 18, background: "var(--line)" }} />

            {/* Grid Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {[
                { id: "dots", label: "Dots" },
                { id: "grid", label: "Grid" },
                { id: "plain", label: "Plain" },
              ].map((g) => (
                <button
                  key={g.id}
                  className="subtle-btn"
                  onClick={() => setGridMode(g.id as GridType)}
                  style={{
                    padding: "3px 6px",
                    fontSize: 10.5,
                    background: gridMode === g.id ? "var(--surface-3)" : "transparent",
                    borderColor: gridMode === g.id ? "var(--purple)" : "var(--line)",
                    color: gridMode === g.id ? "var(--purple)" : "var(--muted)",
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <button
              className="subtle-btn"
              onClick={() => setCanvasDark((v) => !v)}
              title={canvasDark ? "Switch to light canvas" : "Switch to dark canvas"}
              style={{ padding: "4px 7px" }}
            >
              {canvasDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>
      )}

      {/* Split Workspace Viewport */}
      <div
        ref={splitWrapRef}
        style={{
          display: "flex",
          width: "100%",
          minHeight: "720px",
          height: "calc(100vh - 180px)",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid var(--line)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          position: "relative",
          userSelect: isResizingSplit ? "none" : "auto",
        }}
      >
        {/* Left Side: Infinite Canvas */}
        {viewMode !== "notes" && (
          <div
            ref={containerRef}
            style={{
              width: viewMode === "split" ? `${splitRatio}%` : "100%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
              background: canvasDark ? "#0e1015" : "#ffffff",
            }}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={handleDoubleClick}
              style={{
                display: "block",
                cursor:
                  activeTool === "hand"
                    ? isPanning
                      ? "grabbing"
                      : "grab"
                    : isResizing || hoverHandle
                    ? canvasCursor
                    : activeTool === "select"
                    ? canvasCursor
                    : activeTool === "eraser"
                    ? "crosshair"
                    : activeTool === "text"
                    ? "text"
                    : "crosshair",
                touchAction: "none",
              }}
            />

            {/* Direct In-Place Note & Text Editor (Zero Alerts!) */}
            {editingElement && editingScreenPos && (
              <textarea
                ref={editTextareaRef}
                autoFocus
                placeholder={editingElement.type === "sticky" ? "Type note here..." : "Type text here..."}
                value={inlineText}
                onChange={(e) => setInlineText(e.target.value)}
                onBlur={commitInlineEdit}
                onKeyDown={(e) => {
                  if (e.key === "Escape") commitInlineEdit();
                }}
                style={{
                  position: "absolute",
                  left: editingScreenPos.x + 8,
                  top: editingScreenPos.y + 8,
                  width: Math.max(140, editingScreenPos.w - 16),
                  height: Math.max(70, editingScreenPos.h - 16),
                  background: editingElement.type === "sticky" ? editingElement.stickyColor : "var(--surface)",
                  color: editingElement.type === "sticky" ? "#1e293b" : "var(--text)",
                  border: "2px solid #10B981",
                  borderRadius: 6,
                  padding: "8px",
                  fontSize: editingElement.type === "text" ? `${(editingElement.fontSize || 16) * zoom}px` : "13px",
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontWeight: 600,
                  resize: "both",
                  zIndex: 50,
                  outline: "none",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                  wordBreak: "break-word",
                  overflowY: "auto",
                }}
              />
            )}

            {/* Canvas Floating Navigation & Hand Tool Bar (Right) */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                background: "rgba(21, 22, 27, 0.94)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--line)",
                borderRadius: 9,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                zIndex: 25,
                boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
              }}
            >
              {/* Hand Pan Tool Button (Icon Only) */}
              <button
                className={`mode-btn ${activeTool === "hand" ? "active" : ""}`}
                onClick={() => setActiveTool(activeTool === "hand" ? "select" : "hand")}
                title={activeTool === "hand" ? "Hand Active (Click to switch to Select [V])" : "Activate Hand Tool (H or hold Space)"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px 7px",
                  borderRadius: 6,
                  border: activeTool === "hand" ? "1px solid #F59E0B" : "1px solid var(--line)",
                  background: activeTool === "hand" ? "rgba(245, 158, 11, 0.25)" : "var(--surface-2)",
                  color: activeTool === "hand" ? "#F59E0B" : "var(--text)",
                  cursor: "pointer",
                }}
              >
                <Hand size={14} />
              </button>

              {/* Select Tool Button (Icon Only) */}
              <button
                className={`mode-btn ${activeTool === "select" ? "active" : ""}`}
                onClick={() => setActiveTool("select")}
                title="Select & Resize Elements (V)"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px 7px",
                  borderRadius: 6,
                  border: activeTool === "select" ? "1px solid var(--accent)" : "1px solid var(--line)",
                  background: activeTool === "select" ? "color-mix(in srgb, var(--accent) 18%, var(--surface-2))" : "var(--surface-2)",
                  color: activeTool === "select" ? "var(--text)" : "var(--muted)",
                  cursor: "pointer",
                }}
              >
                <MousePointer size={14} />
              </button>

              <div style={{ width: 1, height: 18, background: "var(--line)", margin: "0 2px" }} />

              {/* Quick Zoom Buttons */}
              <button
                className="subtle-btn"
                onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.15).toFixed(2))))}
                title="Zoom Out"
                style={{ padding: "4px 7px" }}
              >
                <ZoomOut size={13} />
              </button>
              <button
                className="subtle-btn"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                title="Reset Zoom to 100%"
                style={{ padding: "4px 8px", fontSize: 11, fontWeight: 700, minWidth: 44 }}
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                className="subtle-btn"
                onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.15).toFixed(2))))}
                title="Zoom In"
                style={{ padding: "4px 7px" }}
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Resizable Draggable Splitter Bar */}
        {viewMode === "split" && (
          <div
            onMouseDown={() => setIsResizingSplit(true)}
            style={{
              width: 8,
              height: "100%",
              background: isResizingSplit ? "var(--accent)" : "var(--surface-3)",
              cursor: "col-resize",
              borderLeft: "1px solid var(--line)",
              borderRight: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 30,
              transition: "background 0.15s ease",
            }}
            title="Drag to resize Canvas and Notion Notes split"
          >
            <div style={{ width: 2, height: 28, background: "var(--subtle)", borderRadius: 1 }} />
          </div>
        )}

        {/* Right Side: Notion-Style Document Notes Board */}
        {viewMode !== "canvas" && (
          <div
            style={{
              width: viewMode === "split" ? `${100 - splitRatio}%` : "100%",
              height: "100%",
              background: "var(--surface)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Notion Doc Toolbar */}
            <div
              style={{
                height: 44,
                padding: "0 16px",
                borderBottom: "1px solid var(--line)",
                background: "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700 }}>
                <FileText size={15} style={{ color: "var(--purple)" }} />
                <span>Notion Architecture Notes</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  className="subtle-btn"
                  onClick={() => handleDocChange(notionDoc + "\n- [ ] ")}
                  title="Add checklist item"
                >
                  <CheckSquare size={13} />
                </button>
                <button
                  className="subtle-btn"
                  onClick={() => handleDocChange(notionDoc + "\n- ")}
                  title="Add bullet list item"
                >
                  <List size={13} />
                </button>
                <button
                  className="subtle-btn"
                  onClick={() => handleDocChange(notionDoc + "\n## ")}
                  title="Add H2 header"
                >
                  H2
                </button>
                <button
                  className="subtle-btn"
                  onClick={copyDoc}
                  title="Copy Document Markdown"
                >
                  {copiedDoc ? <Check size={12} /> : <Copy size={12} />} {copiedDoc ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Notion Markdown Textarea */}
            <textarea
              value={notionDoc}
              onChange={(e) => handleDocChange(e.target.value)}
              placeholder="Write your Notion RFC, architecture specs, meeting notes, or checklists here..."
              style={{
                flex: 1,
                width: "100%",
                padding: "20px 24px",
                border: 0,
                outline: "none",
                background: "transparent",
                color: "var(--text)",
                fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
                fontSize: "14px",
                lineHeight: "1.7",
                resize: "none",
                tabSize: 2,
                boxSizing: "border-box",
              }}
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Searchable 50+ Tech Icons & Logos Library Modal */}
      {iconModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setIconModalOpen(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              width: "min(680px, 95vw)",
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <strong style={{ fontSize: 16 }}>50+ Tech Logos & Developer Icons</strong>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Click any icon to place it directly onto your canvas
                </p>
              </div>
              <button className="subtle-btn" onClick={() => setIconModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Search Bar & Category Filter */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--line-soft)", background: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Search size={15} style={{ color: "var(--muted)" }} />
                <input
                  type="text"
                  placeholder="Search 50+ icons (e.g. React, AWS, Docker, Python, PostgreSQL, Redis)..."
                  value={iconSearchQuery}
                  onChange={(e) => setIconSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: 0,
                    outline: "none",
                    color: "var(--text)",
                    fontSize: 13.5,
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["All", "Cloud", "Frameworks", "Databases", "Tools", "Hardware"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setIconCategory(cat)}
                    style={{
                      padding: "3px 9px",
                      borderRadius: 5,
                      fontSize: 11,
                      border: iconCategory === cat ? "1px solid var(--accent)" : "1px solid var(--line)",
                      background: iconCategory === cat ? "var(--surface-3)" : "transparent",
                      color: iconCategory === cat ? "var(--text)" : "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Icons Grid */}
            <div
              style={{
                padding: 16,
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 10,
              }}
            >
              {filteredTechIcons.map((ic) => {
                const Icon = ic.icon;
                return (
                  <button
                    key={ic.name}
                    onClick={() => addIconFromLibrary(ic)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 10px",
                      border: "1px solid var(--line)",
                      borderRadius: 9,
                      background: "var(--surface-2)",
                      color: "var(--text)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = ic.color || "var(--accent)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: `${ic.color || "#10B981"}18`,
                        display: "grid",
                        placeItems: "center",
                        color: ic.color || "var(--accent)",
                        border: `1px solid ${ic.color || "#10B981"}33`,
                      }}
                    >
                      <Icon size={24} color={ic.color} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, textAlign: "center" }}>{ic.name}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{ic.category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Figma Device Frames Modal */}
      {frameModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setFrameModalOpen(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              width: "min(520px, 95vw)",
              padding: 20,
              boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <strong style={{ fontSize: 16 }}>Figma-Style Device Frames</strong>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Add standard layout containers for wireframes & presentations
                </p>
              </div>
              <button className="subtle-btn" onClick={() => setFrameModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {framePresets.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.type}
                    onClick={() => addFrameLayout(f)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 6,
                      padding: 14,
                      border: "1px solid var(--line)",
                      borderRadius: 9,
                      background: "var(--surface-2)",
                      color: "var(--text)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Icon size={20} style={{ color: "var(--purple)" }} />
                    <strong style={{ fontSize: 13 }}>{f.label}</strong>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      Dimensions: {f.width} × {f.height}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
