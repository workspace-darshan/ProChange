"use client";

import React from "react";

interface AnalogClockProps {
  date: Date;
  size?: number;
  label?: string;
  sublabel?: string;
  isDaytime?: boolean;
}

export default function AnalogClock({
  date,
  size = 180,
  label,
  sublabel,
  isDaytime = true,
}: AnalogClockProps) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;

  // Hand angles in degrees
  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;

  const center = size / 2;
  const radius = size / 2 - 8;

  // Generate 12 hour ticks
  const hourTicks = Array.from({ length: 12 }, (_, i) => {
    const angle = ((i + 1) * 30 * Math.PI) / 180;
    const innerR = radius - 14;
    const outerR = radius - 4;
    const x1 = center + innerR * Math.sin(angle);
    const y1 = center - innerR * Math.cos(angle);
    const x2 = center + outerR * Math.sin(angle);
    const y2 = center - outerR * Math.cos(angle);
    const numX = center + (radius - 22) * Math.sin(angle);
    const numY = center - (radius - 22) * Math.cos(angle) + 4;
    return { i: i + 1, x1, y1, x2, y2, numX, numY };
  });

  // Generate 60 minute ticks
  const minuteTicks = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null; // skip hour ticks
    const angle = (i * 6 * Math.PI) / 180;
    const innerR = radius - 8;
    const outerR = radius - 4;
    const x1 = center + innerR * Math.sin(angle);
    const y1 = center - innerR * Math.cos(angle);
    const x2 = center + outerR * Math.sin(angle);
    const y2 = center - outerR * Math.cos(angle);
    return { i, x1, y1, x2, y2 };
  }).filter(Boolean);

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-lg"
        >
          <defs>
            <radialGradient id={`clock-dial-${size}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e222d" />
              <stop offset="85%" stopColor="#12141a" />
              <stop offset="100%" stopColor="#0b0d12" />
            </radialGradient>
            <linearGradient id="bezel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow-second">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Bezel */}
          <circle
            cx={center}
            cy={center}
            r={radius + 6}
            fill="none"
            stroke="url(#bezel-grad)"
            strokeWidth="2.5"
            opacity="0.75"
          />

          {/* Clock Face */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={`url(#clock-dial-${size})`}
            stroke="#272b37"
            strokeWidth="1.5"
          />

          {/* Minute Ticks */}
          {minuteTicks.map((tick) =>
            tick ? (
              <line
                key={`m-${tick.i}`}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="#475569"
                strokeWidth="1"
                strokeLinecap="round"
              />
            ) : null
          )}

          {/* Hour Ticks & Numbers */}
          {hourTicks.map((tick) => (
            <React.Fragment key={`h-${tick.i}`}>
              <line
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {size >= 150 && (
                <text
                  x={tick.numX}
                  y={tick.numY}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={size < 180 ? "9" : "11"}
                  fontWeight="600"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {tick.i}
                </text>
              )}
            </React.Fragment>
          ))}

          {/* Day / Night Indicator Icon */}
          <g transform={`translate(${center - 8}, ${center + radius * 0.38})`}>
            {isDaytime ? (
              <path
                d="M8 2a6 6 0 100 12A6 6 0 008 2z"
                fill="#fbbf24"
                opacity="0.85"
              />
            ) : (
              <path
                d="M12 8a5 5 0 11-7-4.5 6 6 0 007 4.5z"
                fill="#818cf8"
                opacity="0.85"
              />
            )}
          </g>

          {/* Hour Hand */}
          <g transform={`rotate(${hourAngle}, ${center}, ${center})`}>
            <line
              x1={center}
              y1={center + 8}
              x2={center}
              y2={center - radius * 0.52}
              stroke="#f1f5f9"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1={center}
              y1={center - radius * 0.15}
              x2={center}
              y2={center - radius * 0.5}
              stroke="#0ea5e9"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>

          {/* Minute Hand */}
          <g transform={`rotate(${minuteAngle}, ${center}, ${center})`}>
            <line
              x1={center}
              y1={center + 10}
              x2={center}
              y2={center - radius * 0.72}
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Second Hand */}
          <g transform={`rotate(${secondAngle}, ${center}, ${center})`}>
            <line
              x1={center}
              y1={center + 14}
              x2={center}
              y2={center - radius * 0.82}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeLinecap="round"
              filter="url(#glow-second)"
            />
            <circle
              cx={center}
              cy={center - radius * 0.6}
              r="2.5"
              fill="#ef4444"
            />
          </g>

          {/* Center Pin */}
          <circle cx={center} cy={center} r="4" fill="#ef4444" />
          <circle cx={center} cy={center} r="2" fill="#ffffff" />
        </svg>
      </div>

      {label && (
        <span className="mt-2 text-xs font-semibold text-slate-200 tracking-wide">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-[10px] text-slate-400 font-mono">
          {sublabel}
        </span>
      )}
    </div>
  );
}
