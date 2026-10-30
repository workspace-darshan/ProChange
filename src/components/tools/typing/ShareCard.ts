import { TestResult } from "@/lib/typing/types";

/**
 * Generate a high-definition 1080x1350 Share Card on HTML5 Canvas
 * and prompt native Web Share (mobile) or instant PNG download.
 */
export async function generateShareCard(result: TestResult): Promise<Blob | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Rich dark gradient background matching ProChange aesthetic
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
  bgGrad.addColorStop(0, "#080c14");
  bgGrad.addColorStop(0.5, "#0d1322");
  bgGrad.addColorStop(1, "#05070c");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1350);

  // Decorative ambient glow
  const glow = ctx.createRadialGradient(540, 480, 50, 540, 480, 500);
  glow.addColorStop(0, "rgba(59, 130, 246, 0.18)");
  glow.addColorStop(0.6, "rgba(139, 92, 246, 0.08)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1350);

  // Decorative border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1000, 1270);

  // 2. Top Header - Brand
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("proChange", 90, 130);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("TYPING SPEED CERTIFICATE", 90, 175);

  // Mode badge
  const modeBadge = `${result.mode.toUpperCase()} MODE • ${result.lang.toUpperCase()}`;
  ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
  ctx.fillRect(720, 95, 270, 50);
  ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(720, 95, 270, 50);

  ctx.fillStyle = "#60a5fa";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(modeBadge, 855, 127);

  // Divider line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(90, 230);
  ctx.lineTo(990, 230);
  ctx.stroke();

  // 3. Huge WPM Hero Section
  ctx.textAlign = "center";
  ctx.fillStyle = "#64748b";
  ctx.font = "600 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("NET TYPING SPEED", 540, 330);

  // WPM Number
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 170px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`${Math.round(result.wpm)}`, 540, 490);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("WORDS PER MINUTE", 540, 550);

  // 4. Key Metrics Grid (Accuracy, Raw WPM, Consistency, Time)
  const drawMetricBox = (x: number, y: number, w: number, h: number, title: string, value: string, color: string) => {
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, x + w / 2, y + 50);

    ctx.fillStyle = color;
    ctx.font = "bold 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(value, x + w / 2, y + 120);
  };

  const gridY = 640;
  const boxW = 425;
  const boxH = 160;
  const col1 = 100;
  const col2 = 555;

  drawMetricBox(col1, gridY, boxW, boxH, "ACCURACY", `${Math.round(result.accuracy)}%`, "#22c55e");
  drawMetricBox(col2, gridY, boxW, boxH, "RAW SPEED", `${Math.round(result.rawWpm)} WPM`, "#f59e0b");
  drawMetricBox(col1, gridY + 190, boxW, boxH, "CONSISTENCY", `${Math.round(result.consistency)}%`, "#a855f7");
  drawMetricBox(col2, gridY + 190, boxW, boxH, "TEST TIME", `${result.duration}s`, "#38bdf8");

  // 5. Characters Breakdown Row
  const charY = 1050;
  ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
  ctx.fillRect(100, charY, 880, 90);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.strokeRect(100, charY, 880, 90);

  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";

  ctx.fillStyle = "#22c55e";
  ctx.fillText(`✓ ${result.chars.correct} Correct`, 210, charY + 54);

  ctx.fillStyle = "#ef4444";
  ctx.fillText(`✕ ${result.chars.incorrect} Incorrect`, 430, charY + 54);

  ctx.fillStyle = "#f59e0b";
  ctx.fillText(`+ ${result.chars.extra} Extra`, 650, charY + 54);

  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`⊘ ${result.chars.missed} Missed`, 870, charY + 54);

  // 6. Footer - Date & Verification
  const dateFormatted = new Date(result.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  ctx.fillStyle = "#64748b";
  ctx.font = "500 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Tested on ${dateFormatted}`, 100, 1220);

  ctx.textAlign = "right";
  ctx.fillStyle = "#60a5fa";
  ctx.fillText("prochange.dev/typing-test", 980, 1220);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

/**
 * Trigger native share or automatic download
 */
export async function shareOrDownloadCard(result: TestResult) {
  const blob = await generateShareCard(result);
  if (!blob) return;

  const file = new File([blob], `prochange-typing-${Math.round(result.wpm)}wpm.png`, {
    type: "image/png",
  });

  if (
    typeof navigator !== "undefined" &&
    "canShare" in navigator &&
    navigator.canShare({ files: [file] }) &&
    "share" in navigator
  ) {
    try {
      await navigator.share({
        title: "My Typing Speed on ProChange",
        text: `I typed ${Math.round(result.wpm)} WPM with ${Math.round(result.accuracy)}% accuracy on ProChange! Can you beat my score?`,
        files: [file],
      });
      return;
    } catch {
      // Fallback to download below
    }
  }

  // Fallback download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prochange-typing-${Math.round(result.wpm)}wpm.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy shareable text to clipboard
 */
export async function copyShareText(result: TestResult, url: string = window.location.href): Promise<boolean> {
  const text = `I typed ${Math.round(result.wpm)} WPM with ${Math.round(result.accuracy)}% accuracy on ProChange (${result.mode} mode, ${result.lang.toUpperCase()}). Try it: ${url}`;
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
