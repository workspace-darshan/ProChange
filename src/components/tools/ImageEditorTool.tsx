"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sliders,
  Sun,
  Contrast,
  Palette,
  Sparkles,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Copy,
  Check,
  Undo2,
  Redo2,
  RotateCcw as ResetIcon,
  Upload,
  Image as ImageIcon,
  Split,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";

// Lightroom Adjustment State Interface
interface Adjustments {
  // Light
  exposure: number; // -100 to 100
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  whites: number; // -100 to 100
  blacks: number; // -100 to 100

  // Color
  temperature: number; // -100 (cool) to 100 (warm)
  tint: number; // -100 (green) to 100 (magenta)
  vibrance: number; // -100 to 100
  saturation: number; // -100 to 100

  // Detail & Effects
  clarity: number; // -100 to 100
  sharpness: number; // 0 to 100
  blur: number; // 0 to 20
  sepia: number; // 0 to 100
  invert: number; // 0 to 100

  // Vignette
  vignetteAmount: number; // -100 (dark) to 100 (light)
  vignetteMidpoint: number; // 10 to 90

  // Color Grading / Split Toning
  shadowTint: string; // hex
  shadowTintAmount: number; // 0 to 100
  highlightTint: string; // hex
  highlightTintAmount: number; // 0 to 100

  // Geometry
  rotation: number; // 0, 90, 180, 270
  fineRotation: number; // -45 to 45
  flipH: boolean;
  flipV: boolean;
}

const defaultAdjustments: Adjustments = {
  exposure: 0,
  brightness: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
  clarity: 0,
  sharpness: 0,
  blur: 0,
  sepia: 0,
  invert: 0,
  vignetteAmount: 0,
  vignetteMidpoint: 50,
  shadowTint: "#00b4d8", // Teal
  shadowTintAmount: 0,
  highlightTint: "#ffb703", // Warm Orange
  highlightTintAmount: 0,
  rotation: 0,
  fineRotation: 0,
  flipH: false,
  flipV: false,
};

// Curated Lightroom Presets
const presets: { id: string; name: string; tag: string; iconBg: string; adjustments: Partial<Adjustments> }[] = [
  {
    id: "natural",
    name: "Natural Clean",
    tag: "Balanced",
    iconBg: "#10B981",
    adjustments: {
      exposure: 5,
      contrast: 8,
      vibrance: 12,
      highlights: -8,
      shadows: 10,
      sharpness: 15,
      vignetteAmount: -10,
    },
  },
  {
    id: "cinematic",
    name: "Teal & Orange",
    tag: "Hollywood",
    iconBg: "#06B6D4",
    adjustments: {
      exposure: 0,
      contrast: 22,
      temperature: 8,
      vibrance: 25,
      highlights: -15,
      shadows: 18,
      shadowTint: "#00b4d8",
      shadowTintAmount: 38,
      highlightTint: "#ff9e00",
      highlightTintAmount: 32,
      vignetteAmount: -25,
      clarity: 20,
    },
  },
  {
    id: "moody-noir",
    name: "Moody B&W Noir",
    tag: "Monochrome",
    iconBg: "#64748B",
    adjustments: {
      saturation: -100,
      vibrance: -100,
      contrast: 45,
      blacks: -30,
      whites: 20,
      clarity: 35,
      sharpness: 25,
      vignetteAmount: -40,
    },
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    tag: "Sunset Warmth",
    iconBg: "#F59E0B",
    adjustments: {
      exposure: 6,
      temperature: 38,
      tint: 10,
      vibrance: 30,
      contrast: 15,
      highlights: -12,
      shadows: 15,
      highlightTint: "#f59e0b",
      highlightTintAmount: 25,
      vignetteAmount: -15,
    },
  },
  {
    id: "vintage-film",
    name: "Kodak 400 Film",
    tag: "Analog Retro",
    iconBg: "#EC4899",
    adjustments: {
      exposure: 4,
      contrast: 10,
      temperature: 15,
      sepia: 18,
      shadows: 22,
      blacks: 15,
      vignetteAmount: -30,
      clarity: -8,
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    tag: "Futuristic",
    iconBg: "#7C5CFC",
    adjustments: {
      contrast: 35,
      vibrance: 55,
      saturation: 30,
      shadowTint: "#7C5CFC",
      shadowTintAmount: 45,
      highlightTint: "#06B6D4",
      highlightTintAmount: 40,
      clarity: 25,
      vignetteAmount: -35,
    },
  },
  {
    id: "hdr-punch",
    name: "Dynamic HDR Pop",
    tag: "Vibrant",
    iconBg: "#EF4444",
    adjustments: {
      exposure: 4,
      contrast: 28,
      highlights: -35,
      shadows: 40,
      vibrance: 45,
      clarity: 30,
      sharpness: 30,
    },
  },
];

// Interactive Crop Bounding Box Interface (0 to 100 percentage coordinates)
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DragHandle = "move" | "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r";

const defaultCrop: CropRect = { x: 0, y: 0, width: 100, height: 100 };


// Top-Level Standalone SliderControl: Ensures React preserves the exact same DOM node and never aborts drag gestures on re-render!
interface SliderControlProps {
  label: string;
  val: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (n: number) => void;
  onCommit?: () => void;
}

const SliderControl = React.memo(function SliderControl({
  label,
  val,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  onCommit,
}: SliderControlProps) {
  const isZero = val === 0;
  const stepDelta = step > 1 ? step : 5;

  // Calculate percentage for visual fill
  const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));

  // Interactive Label Scrubbing (click & drag horizontally on the label to adjust)
  const handleLabelPointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startVal = val;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onPointerMove = (ev: PointerEvent) => {
      const deltaX = ev.clientX - startX;
      const change = Math.round(deltaX / 2) * step;
      const nextVal = Math.max(min, Math.min(max, startVal + change));
      onChange(nextVal);
    };

    const onPointerUp = (ev: PointerEvent) => {
      try {
        target.releasePointerCapture(ev.pointerId);
      } catch {
        // ignore
      }
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerUp);
      if (onCommit) onCommit();
    };

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
    target.addEventListener("pointercancel", onPointerUp);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        {/* Scrubbable Label */}
        <span
          onPointerDown={handleLabelPointerDown}
          title="Drag horizontally to adjust or drag slider below"
          style={{
            fontSize: 12,
            fontWeight: 650,
            color: "var(--muted)",
            cursor: "ew-resize",
            userSelect: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {label}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {/* Quick - Button */}
          <button
            onClick={() => {
              const next = Math.max(min, val - stepDelta);
              onChange(next);
              if (onCommit) onCommit();
            }}
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: "var(--surface-3)",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              userSelect: "none",
            }}
            title={`Step down (-${stepDelta})`}
          >
            -
          </button>

          {/* Direct Editable Number Input */}
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={val}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
            }}
            onBlur={onCommit}
            style={{
              width: 48,
              padding: "2px 4px",
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: "var(--surface-2)",
              color: isZero ? "var(--muted)" : "var(--accent)",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11.5,
              fontWeight: 700,
              textAlign: "center",
              outline: "none",
            }}
          />

          {/* Quick + Button */}
          <button
            onClick={() => {
              const next = Math.min(max, val + stepDelta);
              onChange(next);
              if (onCommit) onCommit();
            }}
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: "var(--surface-3)",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              userSelect: "none",
            }}
            title={`Step up (+${stepDelta})`}
          >
            +
          </button>

          {/* Reset to 0 button */}
          {!isZero && (
            <button
              onClick={() => {
                onChange(0);
                if (onCommit) onCommit();
              }}
              title="Reset to 0"
              style={{
                background: "transparent",
                border: 0,
                color: "var(--subtle)",
                padding: 2,
                display: "flex",
                cursor: "pointer",
                marginLeft: 2,
              }}
            >
              <ResetIcon size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 100% Draggable Range Slider with Native Browser Drag Tracking */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%", height: 22 }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerUp={onCommit}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          onKeyUp={onCommit}
          className="studio-slider-input"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--surface-3) ${pct}%, var(--surface-3) 100%)`,
          }}
        />
      </div>
    </div>
  );
});

export default function ImageEditorTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: string; width: number; height: number } | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustments>(defaultAdjustments);
  const [history, setHistory] = useState<Adjustments[]>([defaultAdjustments]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // UI Views & Toggles
  const [activeTab, setActiveTab] = useState<"light" | "color" | "effects" | "grading" | "crop">("light");
  const [splitCompare, setSplitCompare] = useState<boolean>(false);
  const [splitPos, setSplitPos] = useState<number>(50); // 0 to 100%
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("jpeg");
  const [exportQuality, setExportQuality] = useState<number>(92);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [cropAspect, setCropAspect] = useState<string>("free"); // free, 1:1, 4:5, 16:9, 9:16, 3:2
  const [cropRect, setCropRect] = useState<CropRect>(defaultCrop);
  const [appliedCrop, setAppliedCrop] = useState<CropRect>(defaultCrop);
  const [cropAppliedNotice, setCropAppliedNotice] = useState<boolean>(false);

  // Refs
  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const histogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplitRef = useRef<boolean>(false);

  // Crop Dragging Refs
  const activeDragHandleRef = useRef<DragHandle | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; crop: CropRect } | null>(null);

  // Split Screen Comparison Slider Drag Handling
  const updateSplitFromClientX = useCallback((clientX: number) => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSplitPos(Math.round(pct * 10) / 10);
  }, []);

  const handleSplitPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingSplitRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSplitFromClientX(e.clientX);
  };

  const handleSplitPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSplitRef.current) return;
    updateSplitFromClientX(e.clientX);
  };

  const handleSplitPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSplitRef.current) {
      isDraggingSplitRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Crop Frame Pointer Drag Handling
  const handleCropPointerDown = (handle: DragHandle, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activeDragHandleRef.current = handle;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      crop: { ...cropRect },
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCropPointerMove = (e: React.PointerEvent) => {
    if (!activeDragHandleRef.current || !dragStartRef.current || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const deltaX = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
    const init = dragStartRef.current.crop;
    const handle = activeDragHandleRef.current;

    let newX = init.x;
    let newY = init.y;
    let newW = init.width;
    let newH = init.height;
    const MIN_SIZE = 6;

    if (handle === "move") {
      newX = Math.max(0, Math.min(100 - init.width, init.x + deltaX));
      newY = Math.max(0, Math.min(100 - init.height, init.y + deltaY));
    } else if (handle === "tl") {
      const dX = Math.min(init.width - MIN_SIZE, Math.max(-init.x, deltaX));
      const dY = Math.min(init.height - MIN_SIZE, Math.max(-init.y, deltaY));
      newX = init.x + dX;
      newY = init.y + dY;
      newW = init.width - dX;
      newH = init.height - dY;
    } else if (handle === "tr") {
      const dX = Math.min(100 - (init.x + init.width), Math.max(-(init.width - MIN_SIZE), deltaX));
      const dY = Math.min(init.height - MIN_SIZE, Math.max(-init.y, deltaY));
      newY = init.y + dY;
      newW = init.width + dX;
      newH = init.height - dY;
    } else if (handle === "bl") {
      const dX = Math.min(init.width - MIN_SIZE, Math.max(-init.x, deltaX));
      const dY = Math.min(100 - (init.y + init.height), Math.max(-(init.height - MIN_SIZE), deltaY));
      newX = init.x + dX;
      newW = init.width - dX;
      newH = init.height + dY;
    } else if (handle === "br") {
      const dX = Math.min(100 - (init.x + init.width), Math.max(-(init.width - MIN_SIZE), deltaX));
      const dY = Math.min(100 - (init.y + init.height), Math.max(-(init.height - MIN_SIZE), deltaY));
      newW = init.width + dX;
      newH = init.height + dY;
    } else if (handle === "t") {
      const dY = Math.min(init.height - MIN_SIZE, Math.max(-init.y, deltaY));
      newY = init.y + dY;
      newH = init.height - dY;
    } else if (handle === "b") {
      const dY = Math.min(100 - (init.y + init.height), Math.max(-(init.height - MIN_SIZE), deltaY));
      newH = init.height + dY;
    } else if (handle === "l") {
      const dX = Math.min(init.width - MIN_SIZE, Math.max(-init.x, deltaX));
      newX = init.x + dX;
      newW = init.width - dX;
    } else if (handle === "r") {
      const dX = Math.min(100 - (init.x + init.width), Math.max(-(init.width - MIN_SIZE), deltaX));
      newW = init.width + dX;
    }

    setCropRect({
      x: Math.round(newX * 10) / 10,
      y: Math.round(newY * 10) / 10,
      width: Math.round(newW * 10) / 10,
      height: Math.round(newH * 10) / 10,
    });
  };

  const handleCropPointerUp = (e: React.PointerEvent) => {
    if (activeDragHandleRef.current) {
      activeDragHandleRef.current = null;
      dragStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const applyAspectPreset = (aspectId: string) => {
    setCropAspect(aspectId);
    if (aspectId === "free") return;

    const ratios: Record<string, number> = {
      "1:1": 1,
      "4:5": 4 / 5,
      "16:9": 16 / 9,
      "9:16": 9 / 16,
      "3:2": 3 / 2,
    };
    const targetRatio = ratios[aspectId];
    if (!targetRatio || !imageRef.current) return;

    const img = imageRef.current;
    const isRot = adjustments.rotation % 180 !== 0;
    const imgW = isRot ? img.naturalHeight : img.naturalWidth;
    const imgH = isRot ? img.naturalWidth : img.naturalHeight;
    const currentAspect = imgW / imgH;

    let w = 100;
    let h = 100;

    if (currentAspect > targetRatio) {
      w = (targetRatio / currentAspect) * 100;
      h = 100;
    } else {
      w = 100;
      h = (currentAspect / targetRatio) * 100;
    }

    const x = Math.max(0, (100 - w) / 2);
    const y = Math.max(0, (100 - h) / 2);

    setCropRect({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: Math.round(w * 10) / 10,
      height: Math.round(h * 10) / 10,
    });
  };

  const applyCrop = () => {
    setAppliedCrop({ ...cropRect });
    setCropAppliedNotice(true);
    setTimeout(() => setCropAppliedNotice(false), 2000);
    commitToHistory();
  };

  const resetCrop = () => {
    setCropRect(defaultCrop);
    setAppliedCrop(defaultCrop);
    setCropAspect("free");
    commitToHistory();
  };

  // Push adjustment change with history debouncing
  const updateAdjustment = (key: keyof Adjustments, val: any) => {
    setAdjustments((prev) => {
      const next = { ...prev, [key]: val };
      return next;
    });
  };

  const commitToHistory = useCallback(() => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, adjustments];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [adjustments, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAdjustments(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAdjustments(history[historyIndex + 1]);
    }
  };

  const resetAll = () => {
    setAdjustments(defaultAdjustments);
    commitToHistory();
  };

  const resetSection = (section: "light" | "color" | "effects" | "grading" | "crop") => {
    setAdjustments((prev) => {
      const next = { ...prev };
      if (section === "light") {
        next.exposure = 0;
        next.brightness = 0;
        next.contrast = 0;
        next.highlights = 0;
        next.shadows = 0;
        next.whites = 0;
        next.blacks = 0;
      } else if (section === "color") {
        next.temperature = 0;
        next.tint = 0;
        next.vibrance = 0;
        next.saturation = 0;
      } else if (section === "effects") {
        next.clarity = 0;
        next.sharpness = 0;
        next.blur = 0;
        next.sepia = 0;
        next.invert = 0;
        next.vignetteAmount = 0;
      } else if (section === "grading") {
        next.shadowTintAmount = 0;
        next.highlightTintAmount = 0;
      } else if (section === "crop") {
        next.rotation = 0;
        next.fineRotation = 0;
        next.flipH = false;
        next.flipV = false;
      }
      return next;
    });
  };

  const applyPreset = (presetAdjustments: Partial<Adjustments>) => {
    const updated = {
      ...defaultAdjustments,
      ...presetAdjustments,
      rotation: adjustments.rotation,
      flipH: adjustments.flipH,
      flipV: adjustments.flipV,
    };
    setAdjustments(updated);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), updated]);
    setHistoryIndex((prev) => prev + 1);
  };

  // Handle Image File Loading
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          setImageMeta({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          setImageSrc(dataUrl);
          setAdjustments(defaultAdjustments);
          setCropRect(defaultCrop);
          setAppliedCrop(defaultCrop);
          setCropAspect("free");
          setHistory([defaultAdjustments]);
          setHistoryIndex(0);
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  // Paste Image from Clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) handleFileUpload(file);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Compute CSS Filter String for instant 60fps hardware accelerated preview
  const getFilterStyle = (adj: Adjustments): string => {
    const exp = 1 + adj.exposure / 100;
    const br = Math.max(0, 1 + adj.brightness / 100);
    const ct = Math.max(0, 1 + adj.contrast / 100);
    const sat = Math.max(0, 1 + (adj.saturation + adj.vibrance * 0.7) / 100);
    const sep = adj.sepia / 100;
    const inv = adj.invert / 100;
    const blr = adj.blur;
    const hue = adj.tint * 0.9;

    return `brightness(${br * exp}) contrast(${ct}) saturate(${sat}) sepia(${sep}) invert(${inv}) blur(${blr}px) hue-rotate(${hue}deg)`;
  };

  // Render high-res processed image on Canvas (for export & histogram analysis)
  const renderProcessedCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement, useAdjustments: Adjustments) => {
      const img = imageRef.current;
      if (!img || !img.naturalWidth || !img.naturalHeight) return;

      const isRotated90or270 = useAdjustments.rotation % 180 !== 0;
      const naturalW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const naturalH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      // 1. Render master adjustments to full-resolution offscreen canvas
      const offCanvas = document.createElement("canvas");
      offCanvas.width = naturalW;
      offCanvas.height = naturalH;
      const ctx = offCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, naturalW, naturalH);

      // Transforms (Rotation, Flips)
      ctx.translate(naturalW / 2, naturalH / 2);
      ctx.rotate(((useAdjustments.rotation + useAdjustments.fineRotation) * Math.PI) / 180);
      ctx.scale(useAdjustments.flipH ? -1 : 1, useAdjustments.flipV ? -1 : 1);

      // Base Filters
      ctx.filter = getFilterStyle(useAdjustments);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.filter = "none";
      ctx.restore();

      // Temperature & Tint Overlay (Warm Amber / Cool Blue)
      if (useAdjustments.temperature !== 0) {
        ctx.save();
        if (useAdjustments.temperature > 0) {
          ctx.fillStyle = `rgba(255, 145, 0, ${(useAdjustments.temperature / 100) * 0.28})`;
        } else {
          ctx.fillStyle = `rgba(0, 160, 255, ${(-useAdjustments.temperature / 100) * 0.28})`;
        }
        ctx.globalCompositeOperation = "color";
        ctx.fillRect(0, 0, naturalW, naturalH);
        ctx.restore();
      }

      // Color Grading (Shadow Tint & Highlight Tint)
      if (useAdjustments.shadowTintAmount > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "soft-light";
        ctx.fillStyle = useAdjustments.shadowTint;
        ctx.globalAlpha = (useAdjustments.shadowTintAmount / 100) * 0.45;
        ctx.fillRect(0, 0, naturalW, naturalH);
        ctx.restore();
      }
      if (useAdjustments.highlightTintAmount > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = useAdjustments.highlightTint;
        ctx.globalAlpha = (useAdjustments.highlightTintAmount / 100) * 0.35;
        ctx.fillRect(0, 0, naturalW, naturalH);
        ctx.restore();
      }

      // Lightroom Vignette Overlay
      if (useAdjustments.vignetteAmount !== 0) {
        ctx.save();
        const maxRadius = Math.hypot(naturalW, naturalH) / 2;
        const innerRadius = (maxRadius * useAdjustments.vignetteMidpoint) / 100;
        const grad = ctx.createRadialGradient(
          naturalW / 2,
          naturalH / 2,
          innerRadius * 0.3,
          naturalW / 2,
          naturalH / 2,
          maxRadius
        );

        if (useAdjustments.vignetteAmount < 0) {
          const alpha = (-useAdjustments.vignetteAmount / 100) * 0.85;
          grad.addColorStop(0, "rgba(0, 0, 0, 0)");
          grad.addColorStop(0.5, `rgba(0, 0, 0, ${alpha * 0.3})`);
          grad.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);
        } else {
          const alpha = (useAdjustments.vignetteAmount / 100) * 0.7;
          grad.addColorStop(0, "rgba(255, 255, 255, 0)");
          grad.addColorStop(0.6, `rgba(255, 255, 255, ${alpha * 0.3})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, naturalW, naturalH);
        ctx.restore();
      }

      // 2. Transfer to target canvas: In Crop mode, display full image; outside Crop mode, crop to appliedCrop!
      const tCtx = targetCanvas.getContext("2d", { willReadFrequently: true });
      if (!tCtx) return;

      const activeCrop = activeTab === "crop" ? { x: 0, y: 0, width: 100, height: 100 } : appliedCrop;
      const cropX = Math.round((naturalW * activeCrop.x) / 100);
      const cropY = Math.round((naturalH * activeCrop.y) / 100);
      const cropW = Math.max(10, Math.round((naturalW * activeCrop.width) / 100));
      const cropH = Math.max(10, Math.round((naturalH * activeCrop.height) / 100));

      if (targetCanvas.width !== cropW) targetCanvas.width = cropW;
      if (targetCanvas.height !== cropH) targetCanvas.height = cropH;

      tCtx.clearRect(0, 0, cropW, cropH);
      tCtx.drawImage(offCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    },
    [activeTab, appliedCrop]
  );

  const histTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Fast downscaled histogram calculation (<0.2ms using 100x75 thumbnail)
  const drawHistogramFromCanvas = (sourceCanvas: HTMLCanvasElement) => {
    const histCanvas = histogramCanvasRef.current;
    if (!histCanvas) return;
    const hCtx = histCanvas.getContext("2d");
    if (!hCtx) return;

    try {
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = 100;
      thumbCanvas.height = 75;
      const tCtx = thumbCanvas.getContext("2d");
      if (!tCtx) return;

      tCtx.drawImage(sourceCanvas, 0, 0, 100, 75);
      const imgData = tCtx.getImageData(0, 0, 100, 75).data;

      const rCount = new Array(256).fill(0);
      const gCount = new Array(256).fill(0);
      const bCount = new Array(256).fill(0);

      for (let i = 0; i < imgData.length; i += 4) {
        rCount[imgData[i]]++;
        gCount[imgData[i + 1]]++;
        bCount[imgData[i + 2]]++;
      }

      const maxVal = Math.max(...rCount, ...gCount, ...bCount, 1);
      const hW = histCanvas.width;
      const hH = histCanvas.height;

      hCtx.clearRect(0, 0, hW, hH);
      hCtx.fillStyle = "#111318";
      hCtx.fillRect(0, 0, hW, hH);

      hCtx.strokeStyle = "rgba(255,255,255,0.06)";
      hCtx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach((pos) => {
        hCtx.beginPath();
        hCtx.moveTo(pos * hW, 0);
        hCtx.lineTo(pos * hW, hH);
        hCtx.stroke();
      });

      const channels = [
        { data: rCount, color: "rgba(239, 68, 68, 0.75)" },
        { data: gCount, color: "rgba(16, 185, 129, 0.75)" },
        { data: bCount, color: "rgba(59, 130, 246, 0.75)" },
      ];

      channels.forEach(({ data, color }) => {
        hCtx.fillStyle = color;
        hCtx.beginPath();
        hCtx.moveTo(0, hH);
        for (let i = 0; i < 256; i++) {
          const x = (i / 255) * hW;
          const y = hH - (data[i] / maxVal) * (hH - 4);
          hCtx.lineTo(x, y);
        }
        hCtx.lineTo(hW, hH);
        hCtx.closePath();
        hCtx.fill();
      });
    } catch {
      // ignore
    }
  };

  // 60FPS Hardware-synced Canvas Render (never drops frames or blocks slider dragging)
  useEffect(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

    rafIdRef.current = requestAnimationFrame(() => {
      if (previewCanvasRef.current && imageRef.current?.complete) {
        const activeAdj = isHoldingOriginal ? defaultAdjustments : adjustments;
        renderProcessedCanvas(previewCanvasRef.current, activeAdj);

        // Debounce histogram update so slider dragging is 100% lag-free
        if (histTimerRef.current) clearTimeout(histTimerRef.current);
        histTimerRef.current = setTimeout(() => {
          if (previewCanvasRef.current) {
            drawHistogramFromCanvas(previewCanvasRef.current);
          }
        }, 120);
      }
    });

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [adjustments, imageSrc, isHoldingOriginal, activeTab, appliedCrop, renderProcessedCanvas]);

  // Export & Download
  const handleDownload = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const mime = exportFormat === "png" ? "image/png" : exportFormat === "webp" ? "image/webp" : "image/jpeg";
    const quality = exportFormat === "png" ? undefined : exportQuality / 100;
    const url = canvas.toDataURL(mime, quality);

    const a = document.createElement("a");
    a.href = url;
    a.download = `prochange-edited-${Date.now()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 1-Click Copy Image to Clipboard
  const handleCopyClipboard = async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }, "image/png");
    } catch {
      alert("Direct clipboard image copy not permitted in this browser context. You can use Download button.");
    }
  };



  return (
    <div className="workspace home-workspace" style={{ padding: "16px 20px 28px", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Hidden offscreen image element to read natural dimensions */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={imageSrc || undefined}
        alt="Original asset"
        crossOrigin="anonymous"
        style={{ display: "none" }}
        onLoad={() => {
          if (imageRef.current) {
            setImageMeta((prev) => ({
              name: prev?.name || "Uploaded Photo",
              size: prev?.size || "",
              width: imageRef.current!.naturalWidth,
              height: imageRef.current!.naturalHeight,
            }));
          }
          if (previewCanvasRef.current) {
            renderProcessedCanvas(previewCanvasRef.current, adjustments);
          }
        }}
      />

      {/* Top Header & Quick Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={13} style={{ color: "var(--accent)" }} />
            <span>LIGHTROOM STUDIO & PHOTO ENHANCER</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "2px 0 0", letterSpacing: "-0.5px" }}>
            Lightroom Image Studio
          </h1>
        </div>

        {/* Global Toolbar Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Active Photo Info Badge */}
          {imageMeta && imageSrc && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 6,
                background: "var(--surface-2)",
                border: "1px solid var(--line)",
                fontSize: 11.5,
                color: "var(--muted)",
              }}
            >
              <ImageIcon size={13} style={{ color: "var(--accent)" }} />
              <span style={{ color: "var(--text)", fontWeight: 700, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {imageMeta.name}
              </span>
              <span>•</span>
              <span style={{ fontFamily: "monospace" }}>{imageMeta.width} × {imageMeta.height}</span>
              {imageMeta.size && (
                <>
                  <span>•</span>
                  <span>{imageMeta.size}</span>
                </>
              )}
            </div>
          )}

          {/* Upload / Replace Photo Button */}
          <button
            className="secondary-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo from computer"
            style={{ padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Upload size={13} />
            <span>{imageSrc ? "Replace Photo" : "Upload Photo"}</span>
          </button>

          {/* Undo / Redo */}
          <button
            className="subtle-btn"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo adjustment"
            style={{ padding: "6px 8px", opacity: historyIndex <= 0 ? 0.4 : 1 }}
          >
            <Undo2 size={14} />
          </button>
          <button
            className="subtle-btn"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo adjustment"
            style={{ padding: "6px 8px", opacity: historyIndex >= history.length - 1 ? 0.4 : 1 }}
          >
            <Redo2 size={14} />
          </button>

          {/* Reset All */}
          <button
            className="subtle-btn"
            onClick={resetAll}
            title="Reset all sliders to original"
            style={{ padding: "6px 10px", fontSize: 12 }}
          >
            <ResetIcon size={13} />
            <span>Reset All</span>
          </button>

          <div style={{ width: 1, height: 20, background: "var(--line)", margin: "0 2px" }} />

          {/* 1-Click Copy Image */}
          <button
            className="secondary-btn"
            onClick={handleCopyClipboard}
            title="Copy high-res edited image to clipboard"
            style={{ padding: "6px 12px", fontSize: 12 }}
          >
            {copied ? <Check size={14} style={{ color: "var(--accent)" }} /> : <Copy size={14} />}
            <span>{copied ? "Copied Image!" : "Copy Image"}</span>
          </button>

          {/* Export / Download */}
          <button
            className="primary-button"
            onClick={handleDownload}
            title="Download high-resolution edited photo"
            style={{ padding: "6px 14px", fontSize: 12 }}
          >
            <Download size={14} />
            <span>Export {exportFormat.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* If No Photo Loaded: High-Tech Dropzone Empty State */}
      {!imageSrc ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          style={{
            flex: 1,
            minHeight: 520,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0c0d12",
            border: isDraggingFile ? "2px dashed var(--accent)" : "1.5px dashed var(--line)",
            borderRadius: 14,
            padding: 40,
            textAlign: "center",
            boxShadow: "inset 0 4px 30px rgba(0,0,0,0.5)",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
              marginBottom: 20,
              boxShadow: "0 0 32px rgba(16, 185, 129, 0.2)",
            }}
          >
            <Upload size={38} />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--text)", letterSpacing: "-0.5px" }}>
            Upload Your Photo to Begin
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 460, margin: "0 0 24px", lineHeight: 1.6 }}>
            Drag and drop your image here, paste from your clipboard with{" "}
            <kbd style={{ padding: "2px 7px", borderRadius: 4, background: "var(--surface-3)", border: "1px solid var(--line)", fontFamily: "monospace", fontSize: 12, color: "var(--text)" }}>
              Ctrl + V
            </kbd>
            , or choose a file from your computer.
          </p>

          <button
            className="primary-button"
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: "10px 24px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}
          >
            <Upload size={16} />
            <span>Select Photo from Computer</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 28, fontSize: 12, color: "var(--subtle)" }}>
            <span>JPEG</span>
            <span>•</span>
            <span>PNG</span>
            <span>•</span>
            <span>WEBP</span>
            <span>•</span>
            <span>AVIF</span>
            <span>•</span>
            <span>Full Lossless Processing</span>
          </div>
        </div>
      ) : (
        /* Main Studio Workspace: Left Canvas Viewport + Right Adjustment Inspector */
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 16,
            minHeight: 580,
            maxHeight: "calc(100vh - 170px)",
            overflow: "hidden",
          }}
        >
        {/* Left Column: Canvas Studio Box on Top + Presets Bar Under That Box */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0, overflow: "hidden" }}>
          {/* The Canvas Studio Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingFile(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            style={{
              flex: 1,
              position: "relative",
              background: "#0a0c10",
              border: isDraggingFile ? "2px dashed var(--accent)" : "1px solid var(--line)",
              borderRadius: 12,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              boxShadow: "inset 0 4px 30px rgba(0,0,0,0.6)",
              minHeight: 0,
            }}
          >
            {/* Studio Top Control Strip (Before/After split, Hold compare, Zoom) */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                zIndex: 30,
                background: "rgba(18, 20, 26, 0.88)",
                backdropFilter: "blur(8px)",
                padding: "4px 8px",
                borderRadius: 8,
                border: "1px solid var(--line)",
              }}
            >
              {/* Hold to Compare Original */}
              <button
                className={`mode-btn ${isHoldingOriginal ? "active" : ""}`}
                onMouseDown={() => setIsHoldingOriginal(true)}
                onMouseUp={() => setIsHoldingOriginal(false)}
                onMouseLeave={() => setIsHoldingOriginal(false)}
                title="Hold mouse button down to view unedited original photo"
                style={{ padding: "4px 9px", fontSize: 11.5 }}
              >
                <Eye size={13} />
                <span>{isHoldingOriginal ? "Showing Original" : "Hold: Original"}</span>
              </button>

              {/* Split Comparison Slider Toggle */}
              <button
                className={`mode-btn ${splitCompare ? "active" : ""}`}
                onClick={() => setSplitCompare((s) => !s)}
                title="Toggle Before / After Split Curtain comparison"
                style={{ padding: "4px 9px", fontSize: 11.5 }}
              >
                <Split size={13} />
                <span>Split Compare</span>
              </button>

              {/* Zoom Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 4 }}>
                <button
                  className="subtle-btn"
                  onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.2).toFixed(1))))}
                  title="Zoom Out"
                  style={{ padding: "3px 6px" }}
                >
                  <ZoomOut size={12} />
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, minWidth: 36, textAlign: "center", color: "var(--muted)" }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  className="subtle-btn"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                  title="Zoom In"
                  style={{ padding: "3px 6px" }}
                >
                  <ZoomIn size={12} />
                </button>
                <button
                  className="subtle-btn"
                  onClick={() => setZoomLevel(1)}
                  title="Reset Zoom"
                  style={{ padding: "3px 6px", fontSize: 10.5 }}
                >
                  100%
                </button>
              </div>
            </div>

            {/* Central Image Canvas (Clean & Uncovered!) */}
            <div
              ref={canvasContainerRef}
              onClick={(e) => {
                if (splitCompare) {
                  updateSplitFromClientX(e.clientX);
                }
              }}
              style={{
                position: "relative",
                maxWidth: "100%",
                maxHeight: "100%",
                transform: `scale(${zoomLevel})`,
                transition: "transform 0.15s ease",
                boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                borderRadius: 6,
                overflow: "hidden",
                cursor: splitCompare ? "ew-resize" : "default",
                userSelect: "none",
              }}
            >
              {/* The Processed Master Canvas */}
              <canvas
                ref={previewCanvasRef}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "calc(100vh - 290px)",
                  objectFit: "contain",
                }}
              />

              {/* Split Comparison Curtain Overlay */}
              {splitCompare && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Original compare"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  {/* Badge Indicator */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      padding: "3px 8px",
                      background: "rgba(0,0,0,0.7)",
                      borderRadius: 4,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                      color: "#ffffff",
                    }}
                  >
                    ORIGINAL
                  </div>
                </div>
              )}

              {/* Split Drag Divider Line (100% Draggable & Clickable) */}
              {splitCompare && (
                <div
                  onPointerDown={handleSplitPointerDown}
                  onPointerMove={handleSplitPointerMove}
                  onPointerUp={handleSplitPointerUp}
                  onPointerCancel={handleSplitPointerUp}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${splitPos}%`,
                    width: 32,
                    transform: "translateX(-50%)",
                    cursor: "ew-resize",
                    zIndex: 25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    touchAction: "none",
                    userSelect: "none",
                  }}
                  title="Drag left or right to compare original vs edited"
                >
                  {/* Vertical white divider line */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: "50%",
                      width: 2,
                      transform: "translateX(-50%)",
                      background: "#ffffff",
                      boxShadow: "0 0 10px rgba(0,0,0,0.8)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Circular Draggable Knob Badge */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 900,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.9)",
                      cursor: "ew-resize",
                      pointerEvents: "none",
                      transition: "transform 0.1s ease",
                    }}
                  >
                    ⇄
                  </div>
                </div>
              )}

              {/* Interactive Crop Frame Overlay (Active in Crop Mode) */}
              {activeTab === "crop" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                  }}
                >
                  {/* Draggable Bounding Crop Box with Outer Mask */}
                  <div
                    onPointerDown={(e) => handleCropPointerDown("move", e)}
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                    onPointerCancel={handleCropPointerUp}
                    style={{
                      position: "absolute",
                      left: `${cropRect.x}%`,
                      top: `${cropRect.y}%`,
                      width: `${cropRect.width}%`,
                      height: `${cropRect.height}%`,
                      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)",
                      border: "1.5px solid rgba(255, 255, 255, 0.95)",
                      cursor: "move",
                      pointerEvents: "auto",
                      touchAction: "none",
                      boxSizing: "border-box",
                    }}
                    title="Drag inside to move crop frame"
                  >
                    {/* 3x3 Rule-of-Thirds Grid Lines */}
                    <div style={{ position: "absolute", top: "33.33%", left: 0, right: 0, height: 1, borderTop: "1px dashed rgba(255,255,255,0.45)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: "66.66%", left: 0, right: 0, height: 1, borderTop: "1px dashed rgba(255,255,255,0.45)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", left: "33.33%", top: 0, bottom: 0, width: 1, borderLeft: "1px dashed rgba(255,255,255,0.45)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", left: "66.66%", top: 0, bottom: 0, width: 1, borderLeft: "1px dashed rgba(255,255,255,0.45)", pointerEvents: "none" }} />

                    {/* 4 Corner L-Bracket Handles */}
                    <div
                      onPointerDown={(e) => handleCropPointerDown("tl", e)}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      style={{
                        position: "absolute",
                        top: -3,
                        left: -3,
                        width: 16,
                        height: 16,
                        borderTop: "3px solid var(--accent)",
                        borderLeft: "3px solid var(--accent)",
                        cursor: "nwse-resize",
                        zIndex: 10,
                      }}
                      title="Resize Top-Left"
                    />
                    <div
                      onPointerDown={(e) => handleCropPointerDown("tr", e)}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      style={{
                        position: "absolute",
                        top: -3,
                        right: -3,
                        width: 16,
                        height: 16,
                        borderTop: "3px solid var(--accent)",
                        borderRight: "3px solid var(--accent)",
                        cursor: "nesw-resize",
                        zIndex: 10,
                      }}
                      title="Resize Top-Right"
                    />
                    <div
                      onPointerDown={(e) => handleCropPointerDown("bl", e)}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      style={{
                        position: "absolute",
                        bottom: -3,
                        left: -3,
                        width: 16,
                        height: 16,
                        borderBottom: "3px solid var(--accent)",
                        borderLeft: "3px solid var(--accent)",
                        cursor: "nesw-resize",
                        zIndex: 10,
                      }}
                      title="Resize Bottom-Left"
                    />
                    <div
                      onPointerDown={(e) => handleCropPointerDown("br", e)}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      style={{
                        position: "absolute",
                        bottom: -3,
                        right: -3,
                        width: 16,
                        height: 16,
                        borderBottom: "3px solid var(--accent)",
                        borderRight: "3px solid var(--accent)",
                        cursor: "nwse-resize",
                        zIndex: 10,
                      }}
                      title="Resize Bottom-Right"
                    />

                    {/* 4 Edge Handles */}
                    <div
                      onPointerDown={(e) => handleCropPointerDown("t", e)}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      style={{
                        position: "absolute",
                        top: -4,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 32,
                        height: 8,
                        background: "var(--accent)",
                        borderRadius: 3,
                        cursor: "ns-resize",
                        zIndex: 10,
                      }}
                      title="Resize Top Edge"
                    />
                    <div
                      onPointerDown={(e) => handleCropPointerDown("b", e)}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      style={{
                        position: "absolute",
                        bottom: -4,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 32,
                        height: 8,
                        background: "var(--accent)",
                        borderRadius: 3,
                        cursor: "ns-resize",
                        zIndex: 10,
                      }}
                      title="Resize Bottom Edge"
                    />
                    <div
                      onPointerDown={(e) => handleCropPointerDown("l", e)}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      style={{
                        position: "absolute",
                        left: -4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 8,
                        height: 32,
                        background: "var(--accent)",
                        borderRadius: 3,
                        cursor: "ew-resize",
                        zIndex: 10,
                      }}
                      title="Resize Left Edge"
                    />
                    <div
                      onPointerDown={(e) => handleCropPointerDown("r", e)}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      style={{
                        position: "absolute",
                        right: -4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 8,
                        height: 32,
                        background: "var(--accent)",
                        borderRadius: 3,
                        cursor: "ew-resize",
                        zIndex: 10,
                      }}
                      title="Resize Right Edge"
                    />

                    {/* Aspect & Dimension Badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 6,
                        left: 8,
                        padding: "2px 7px",
                        background: "rgba(0,0,0,0.8)",
                        borderRadius: 3,
                        fontSize: 10,
                        fontWeight: 750,
                        color: "#fff",
                        letterSpacing: "0.5px",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      {cropAspect.toUpperCase()} • {Math.round(cropRect.width)}% × {Math.round(cropRect.height)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Presets Quick Drawer Bar: Optimized & Wrapped (No Horizontal Scrollbar!) */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 6,
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--accent)",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 8px",
                borderRadius: 6,
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              <Sparkles size={12} />
              <span>Presets</span>
            </div>

            {/* Quick 1-Click Clean/Original Reset Preset */}
            <button
              onClick={() => {
                setAdjustments(defaultAdjustments);
                commitToHistory();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 9px",
                borderRadius: 6,
                background: "var(--surface-2)",
                border: "1px solid var(--line)",
                color: "var(--text)",
                fontSize: 11.5,
                fontWeight: 650,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--muted)";
                e.currentTarget.style.background = "var(--surface-3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--line)";
                e.currentTarget.style.background = "var(--surface-2)";
              }}
              title="Reset all adjustments to clean original"
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a3a5b2" }} />
              <span>Original</span>
            </button>

            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.adjustments)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 9px",
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  color: "var(--text)",
                  fontSize: 11.5,
                  fontWeight: 650,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = p.iconBg;
                  e.currentTarget.style.boxShadow = `0 0 10px ${p.iconBg}33`;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "none";
                }}
                title={`Apply ${p.name} (${p.tag})`}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.iconBg, boxShadow: `0 0 6px ${p.iconBg}` }} />
                <span>{p.name}</span>
                <span style={{ fontSize: 9.5, color: "var(--muted)", opacity: 0.85, fontWeight: 500 }}>
                  • {p.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Lightroom Adjustment Inspector */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Histogram Box */}
          <div
            style={{
              padding: "12px 16px 10px",
              borderBottom: "1px solid var(--line)",
              background: "var(--surface-2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.5px", color: "var(--text)" }}>
                HISTOGRAM
              </span>
              <span style={{ fontSize: 10.5, color: "var(--muted)" }}>RGB & Luminance</span>
            </div>
            <canvas
              ref={histogramCanvasRef}
              width={300}
              height={64}
              style={{
                width: "100%",
                height: 64,
                borderRadius: 6,
                display: "block",
                border: "1px solid var(--line-soft)",
              }}
            />
          </div>

          {/* Inspector Category Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              borderBottom: "1px solid var(--line)",
              background: "var(--surface-2)",
            }}
          >
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "color", label: "Color", icon: Palette },
              { id: "effects", label: "Effects", icon: Sparkles },
              { id: "grading", label: "Grade", icon: Layers },
              { id: "crop", label: "Crop", icon: Crop },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    padding: "9px 2px",
                    border: 0,
                    background: active ? "var(--surface)" : "transparent",
                    color: active ? "var(--accent)" : "var(--muted)",
                    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                    fontSize: 10.5,
                    fontWeight: active ? 750 : 600,
                    cursor: "pointer",
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Adjustment Sliders Scrollable Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
            {/* Section Header with Section Reset */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {activeTab} Adjustments
              </span>
              <button
                className="subtle-btn"
                onClick={() => resetSection(activeTab)}
                style={{ padding: "2px 6px", fontSize: 10.5 }}
              >
                Reset {activeTab}
              </button>
            </div>

            {/* TAB 1: LIGHT */}
            {activeTab === "light" && (
              <>
                <SliderControl
                  label="Exposure"
                  val={adjustments.exposure}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("exposure", v)}
                />
                <SliderControl
                  label="Brightness"
                  val={adjustments.brightness}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("brightness", v)}
                />
                <SliderControl
                  label="Contrast"
                  val={adjustments.contrast}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("contrast", v)}
                />
                <SliderControl
                  label="Highlights"
                  val={adjustments.highlights}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("highlights", v)}
                />
                <SliderControl
                  label="Shadows"
                  val={adjustments.shadows}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("shadows", v)}
                />
                <SliderControl
                  label="Whites"
                  val={adjustments.whites}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("whites", v)}
                />
                <SliderControl
                  label="Blacks"
                  val={adjustments.blacks}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("blacks", v)}
                />
              </>
            )}

            {/* TAB 2: COLOR */}
            {activeTab === "color" && (
              <>
                <SliderControl
                  label="Temp (Cool / Warm)"
                  val={adjustments.temperature}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("temperature", v)}
                />
                <SliderControl
                  label="Tint (Green / Magenta)"
                  val={adjustments.tint}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("tint", v)}
                />
                <SliderControl
                  label="Vibrance"
                  val={adjustments.vibrance}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("vibrance", v)}
                />
                <SliderControl
                  label="Saturation"
                  val={adjustments.saturation}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("saturation", v)}
                />
              </>
            )}

            {/* TAB 3: EFFECTS & DETAIL */}
            {activeTab === "effects" && (
              <>
                <SliderControl
                  label="Clarity / Texture"
                  val={adjustments.clarity}
                  min={-100}
                  max={100}
                  onChange={(v) => updateAdjustment("clarity", v)}
                />
                <SliderControl
                  label="Sharpness"
                  val={adjustments.sharpness}
                  min={0}
                  max={100}
                  onChange={(v) => updateAdjustment("sharpness", v)}
                />
                <SliderControl
                  label="Blur"
                  val={adjustments.blur}
                  min={0}
                  max={20}
                  unit="px"
                  onChange={(v) => updateAdjustment("blur", v)}
                />
                <SliderControl
                  label="Sepia Tone"
                  val={adjustments.sepia}
                  min={0}
                  max={100}
                  onChange={(v) => updateAdjustment("sepia", v)}
                />
                <SliderControl
                  label="Invert Colors"
                  val={adjustments.invert}
                  min={0}
                  max={100}
                  onChange={(v) => updateAdjustment("invert", v)}
                />

                <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Vignette Effect
                </span>
                <div style={{ marginTop: 8 }}>
                  <SliderControl
                    label="Amount (Dark / Light)"
                    val={adjustments.vignetteAmount}
                    min={-100}
                    max={100}
                    onChange={(v) => updateAdjustment("vignetteAmount", v)}
                  />
                  <SliderControl
                    label="Midpoint"
                    val={adjustments.vignetteMidpoint}
                    min={10}
                    max={90}
                    onChange={(v) => updateAdjustment("vignetteMidpoint", v)}
                  />
                </div>
              </>
            )}

            {/* TAB 4: COLOR GRADING / SPLIT TONING */}
            {activeTab === "grading" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Shadows Color Tint</span>
                    <input
                      type="color"
                      value={adjustments.shadowTint}
                      onChange={(e) => updateAdjustment("shadowTint", e.target.value)}
                      style={{ width: 26, height: 24, padding: 0, border: 0, borderRadius: 4, cursor: "pointer" }}
                    />
                  </div>
                  <SliderControl
                    label="Shadow Tint Amount"
                    val={adjustments.shadowTintAmount}
                    min={0}
                    max={100}
                    onChange={(v) => updateAdjustment("shadowTintAmount", v)}
                  />
                </div>

                <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Highlights Color Tint</span>
                    <input
                      type="color"
                      value={adjustments.highlightTint}
                      onChange={(e) => updateAdjustment("highlightTint", e.target.value)}
                      style={{ width: 26, height: 24, padding: 0, border: 0, borderRadius: 4, cursor: "pointer" }}
                    />
                  </div>
                  <SliderControl
                    label="Highlight Tint Amount"
                    val={adjustments.highlightTintAmount}
                    min={0}
                    max={100}
                    onChange={(v) => updateAdjustment("highlightTintAmount", v)}
                  />
                </div>
              </>
            )}

            {/* TAB 5: CROP & GEOMETRY */}
            {activeTab === "crop" && (
              <>
                {/* Apply and Reset Crop Action Buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button
                    className="primary-button"
                    onClick={applyCrop}
                    style={{ flex: 1, justifyContent: "center", padding: "8px 12px", gap: 6 }}
                    title="Apply current crop to photo"
                  >
                    <Check size={14} />
                    <span>Apply Crop</span>
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={resetCrop}
                    style={{ padding: "8px 12px", gap: 6 }}
                    title="Reset to full uncropped photo"
                  >
                    <ResetIcon size={13} />
                    <span>Reset</span>
                  </button>
                </div>

                {cropAppliedNotice && (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.35)",
                      borderRadius: 6,
                      padding: "6px 10px",
                      marginBottom: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Check size={13} />
                    <span>Crop applied! Ready for export.</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  <button
                    className="secondary-btn"
                    onClick={() => updateAdjustment("rotation", (adjustments.rotation + 90) % 360)}
                    style={{ flex: 1, justifyContent: "center", padding: "6px" }}
                  >
                    <RotateCw size={14} /> 90° Rotate
                  </button>
                  <button
                    className={`subtle-btn ${adjustments.flipH ? "active" : ""}`}
                    onClick={() => updateAdjustment("flipH", !adjustments.flipH)}
                    title="Flip Horizontal"
                    style={{ padding: "6px 10px" }}
                  >
                    <FlipHorizontal size={14} />
                  </button>
                  <button
                    className={`subtle-btn ${adjustments.flipV ? "active" : ""}`}
                    onClick={() => updateAdjustment("flipV", !adjustments.flipV)}
                    title="Flip Vertical"
                    style={{ padding: "6px 10px" }}
                  >
                    <FlipVertical size={14} />
                  </button>
                </div>

                <SliderControl
                  label="Fine Straighten Angle"
                  val={adjustments.fineRotation}
                  min={-45}
                  max={45}
                  unit="°"
                  onChange={(v) => updateAdjustment("fineRotation", v)}
                />

                <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />

                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Aspect Ratio Presets
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
                  {[
                    { id: "free", label: "Free (Original)" },
                    { id: "1:1", label: "1:1 Square" },
                    { id: "4:5", label: "4:5 Instagram" },
                    { id: "16:9", label: "16:9 Landscape" },
                    { id: "9:16", label: "9:16 Reels / Story" },
                    { id: "3:2", label: "3:2 Classic Photo" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => applyAspectPreset(r.id)}
                      className={`subtle-btn ${cropAspect === r.id ? "active" : ""}`}
                      style={{
                        padding: "6px 8px",
                        fontSize: 11,
                        justifyContent: "center",
                        borderColor: cropAspect === r.id ? "var(--accent)" : "var(--line)",
                        background: cropAspect === r.id ? "rgba(16, 185, 129, 0.12)" : "transparent",
                        color: cropAspect === r.id ? "var(--accent)" : "var(--text)",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Settings Footer */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--line)",
              background: "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Format:</span>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  padding: "3px 6px",
                  fontSize: 11.5,
                  outline: "none",
                }}
              >
                <option value="jpeg">JPEG (High-Res)</option>
                <option value="png">PNG (Lossless)</option>
                <option value="webp">WebP (Modern)</option>
              </select>
            </div>

            {exportFormat !== "png" && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Q:</span>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={exportQuality}
                  onChange={(e) => setExportQuality(Number(e.target.value))}
                  style={{
                    width: 44,
                    background: "var(--surface)",
                    color: "var(--text)",
                    border: "1px solid var(--line)",
                    borderRadius: 4,
                    padding: "2px 4px",
                    fontSize: 11,
                    textAlign: "center",
                  }}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>%</span>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
