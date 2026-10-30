"use client";

import React, { useState } from "react";
import { PerSecondStat } from "@/lib/typing/types";

interface SpeedChartProps {
  data: PerSecondStat[];
}

export default function SpeedChart({ data }: SpeedChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="empty-chart-box">
        <span>No speed history recorded for this brief test</span>
      </div>
    );
  }

  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxSec = Math.max(data.length, 1);
  const maxWpm = Math.max(...data.map((d) => Math.max(d.wpm, d.raw)), 40) + 10;

  const getX = (sec: number) => padding.left + ((sec - 1) / (maxSec > 1 ? maxSec - 1 : 1)) * plotW;
  const getY = (val: number) => padding.top + plotH - (val / maxWpm) * plotH;

  // Build SVG path strings
  let netPath = "";
  let rawPath = "";

  data.forEach((d, i) => {
    const x = getX(d.sec);
    const yNet = getY(d.wpm);
    const yRaw = getY(d.raw);

    if (i === 0) {
      netPath = `M ${x} ${yNet}`;
      rawPath = `M ${x} ${yRaw}`;
    } else {
      netPath += ` L ${x} ${yNet}`;
      rawPath += ` L ${x} ${yRaw}`;
    }
  });

  // Area under Net WPM curve
  const areaPath = `${netPath} L ${getX(data[data.length - 1].sec)} ${padding.top + plotH} L ${getX(data[0].sec)} ${padding.top + plotH} Z`;

  // Y-axis ticks (0, 25%, 50%, 75%, 100% of maxWpm)
  const yTicks = [0, Math.round(maxWpm * 0.25), Math.round(maxWpm * 0.5), Math.round(maxWpm * 0.75), Math.round(maxWpm)];

  return (
    <div className="speed-chart-container">
      <div className="chart-legend">
        <span className="legend-item net">
          <span className="legend-dot net" /> Net WPM
        </span>
        <span className="legend-item raw">
          <span className="legend-dot raw" /> Raw WPM
        </span>
        <span className="legend-item error">
          <span className="legend-dot error" /> Errors
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="speed-chart-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="netAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {yTicks.map((val) => {
          const y = getY(val);
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                fill="#64748b"
                fontSize="11"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Net WPM Area Fill */}
        <path d={areaPath} fill="url(#netAreaGrad)" />

        {/* Raw WPM Line (Amber) */}
        <path
          d={rawPath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* Net WPM Line (Cyan) */}
        <path
          d={netPath}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & Error markers */}
        {data.map((d, i) => {
          const x = getX(d.sec);
          const yNet = getY(d.wpm);
          const hasError = d.errors > 0;

          return (
            <g key={d.sec}>
              {/* Error indicator dot */}
              {hasError && (
                <circle
                  cx={x}
                  cy={padding.top + plotH}
                  r="3.5"
                  fill="#ef4444"
                />
              )}

              {/* Net point on hover */}
              <circle
                cx={x}
                cy={yNet}
                r={hoveredIdx === i ? 5 : 2.5}
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: "pointer" }}
              />
            </g>
          );
        })}

        {/* Hover vertical crosshair */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <line
            x1={getX(data[hoveredIdx].sec)}
            y1={padding.top}
            x2={getX(data[hoveredIdx].sec)}
            y2={padding.top + plotH}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="2 2"
          />
        )}
      </svg>

      {/* Hover Info Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div className="chart-tooltip">
          <span>Sec: {data[hoveredIdx].sec}s</span>
          <span style={{ color: "#38bdf8" }}>
            WPM: {Math.round(data[hoveredIdx].wpm)}
          </span>
          <span style={{ color: "#f59e0b" }}>
            Raw: {Math.round(data[hoveredIdx].raw)}
          </span>
          {data[hoveredIdx].errors > 0 && (
            <span style={{ color: "#ef4444" }}>
              Errors: {data[hoveredIdx].errors}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
