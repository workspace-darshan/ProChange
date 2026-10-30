"use client";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, TrendingUp, RefreshCw, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

export default function CurrencyConverterTool() {
  const [fromCurr, setFromCurr] = useState<string>("USD");
  const [toCurr, setToCurr] = useState<string>("INR");
  const [amount, setAmount] = useState<number>(100);
  const [days, setDays] = useState<number>(30);
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoverPoint, setHoverPoint] = useState<{ date: string; rate: number } | null>(null);

  const fetchData = useCallback(async (f: string, t: string, d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/currency?from=${f}&to=${t}&days=${d}`);
      const data = await res.json();
      if (data.success) {
        setGraphData(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(fromCurr, toCurr, days);
  }, [fromCurr, toCurr, days, fetchData]);

  const handleSwap = () => {
    const prevFrom = fromCurr;
    const prevTo = toCurr;
    setFromCurr(prevTo);
    setToCurr(prevFrom);
  };

  return (
    <div className="workspace">
      {/* Title */}
      <div className="tool-header">
        <div className="tool-title-row">
          <span className="tool-icon-large">⇄</span>
          <div>
            <div className="tool-category-badge">DAILY & FINANCE</div>
            <h1 className="tool-title">Currency & Crypto Trends</h1>
            <p className="tool-desc">
              Real-time exchange rate conversions and interactive historical rate graph powered by the European Central Bank and CoinGecko.
            </p>
          </div>
        </div>
      </div>

      <div className="currency-panel-full">
        <div className="currency-convert-box">
          <div className="currency-controls-grid">
            {/* From */}
            <div className="currency-select-card">
              <label>FROM CURRENCY & AMOUNT</label>
              <div className="currency-input-row">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  min="0"
                  placeholder="100"
                />
                <select
                  className="currency-select-dropdown"
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                >
                  {["USD", "EUR", "INR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "AED", "BTC", "ETH", "SOL"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap */}
            <button className="currency-swap-center-btn" title="Swap currencies" onClick={handleSwap}>
              <ArrowLeftRight size={18} />
            </button>

            {/* To */}
            <div className="currency-select-card">
              <label>TO TARGET CURRENCY</label>
              <div className="currency-input-row">
                <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--text)", flex: 1, fontFamily: "ui-monospace, monospace" }}>
                  {graphData?.liveRate
                    ? (["BTC", "ETH", "SOL"].includes(toCurr)
                        ? (amount * graphData.liveRate).toFixed(6)
                        : (amount * graphData.liveRate).toLocaleString("en-US", { maximumFractionDigits: 2 }))
                    : "..."}
                </div>
                <select
                  className="currency-select-dropdown"
                  value={toCurr}
                  onChange={(e) => setToCurr(e.target.value)}
                >
                  {["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "AED", "BTC", "ETH", "SOL"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Result Banner */}
          <div className="currency-result-highlight">
            <div className="result-main-value">
              <div className="amount-banner">
                {amount} {fromCurr} = {graphData?.liveRate
                  ? (["BTC", "ETH", "SOL"].includes(toCurr)
                      ? (amount * graphData.liveRate).toFixed(6)
                      : (amount * graphData.liveRate).toLocaleString("en-US", { maximumFractionDigits: 2 }))
                  : "..."} {toCurr}
              </div>
              <div className="rate-subtext">
                1 {fromCurr} = {graphData?.liveRate?.toFixed(4)} {toCurr} · 1 {toCurr} = {(1 / (graphData?.liveRate || 1)).toFixed(4)} {fromCurr}
              </div>
            </div>

            <div className="result-meta-pill">
              {graphData?.change24h && (
                <span className={`change-pill-box ${graphData.change24h.startsWith("+") ? "positive" : "negative"}`}>
                  {graphData.change24h.startsWith("+") ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {graphData.change24h} (24h)
                </span>
              )}
              <button
                className="stat-copy-btn"
                onClick={() => void fetchData(fromCurr, toCurr, days)}
                title="Refresh live exchange rates"
              >
                <RefreshCw size={14} className={loading ? "spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Real Historical Detail Graph */}
        <div className="currency-graph-card">
          <div className="graph-header-row">
            <div className="graph-title">
              <TrendingUp size={16} />
              <span>Real Exchange Rate Trend ({fromCurr} / {toCurr})</span>
              {hoverPoint && (
                <span style={{ fontSize: "12px", color: "var(--accent)", marginLeft: "8px", fontWeight: "700" }}>
                  {hoverPoint.date}: {hoverPoint.rate}
                </span>
              )}
            </div>
            <div className="graph-days-switcher">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  className={`pill-choice ${days === d ? "active" : ""}`}
                  onClick={() => setDays(d)}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>

          <div className="chart-svg-wrap">
            {loading ? (
              <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--muted)", gap: "8px" }}>
                <Loader2 size={24} className="spin" />
                <span>Fetching official market rates...</span>
              </div>
            ) : graphData?.historicalPoints?.length > 1 ? (
              (() => {
                const pts: { date: string; rate: number }[] = graphData.historicalPoints;
                const rates = pts.map((p) => p.rate);
                const min = Math.min(...rates);
                const max = Math.max(...rates);
                const range = max - min || 0.001;
                const width = 580;
                const height = 180;

                const coords = pts.map((p, idx) => {
                  const x = (idx / (pts.length - 1)) * width + 10;
                  const y = height - ((p.rate - min) / range) * (height - 30) - 15;
                  return { x, y, p };
                });

                const pathStr = coords.reduce((acc, c, i) => `${acc} ${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`, "");
                const areaStr = `${pathStr} L ${coords[coords.length - 1].x.toFixed(1)} ${height} L ${coords[0].x.toFixed(1)} ${height} Z`;

                return (
                  <svg
                    viewBox={`0 0 ${width + 20} ${height + 20}`}
                    style={{ width: "100%", height: "100%", overflow: "visible" }}
                  >
                    <defs>
                      <linearGradient id="chartFillGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="10" y1={height / 2} x2={width + 10} y2={height / 2} stroke="var(--line)" strokeDasharray="3 3" />
                    <line x1="10" y1={height} x2={width + 10} y2={height} stroke="var(--line)" />
                    <path d={areaStr} fill="url(#chartFillGrad2)" />
                    <path d={pathStr} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    {coords.map((c, i) => (
                      <circle
                        key={i}
                        cx={c.x}
                        cy={c.y}
                        r={hoverPoint?.date === c.p.date ? 5 : 2.5}
                        fill={hoverPoint?.date === c.p.date ? "#fbbf24" : "#10b981"}
                        stroke="#fff"
                        strokeWidth="1"
                        style={{ cursor: "pointer", transition: "all 0.1s ease" }}
                        onMouseEnter={() => setHoverPoint(c.p)}
                        onMouseLeave={() => setHoverPoint(null)}
                      />
                    ))}
                  </svg>
                );
              })()
            ) : (
              <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--muted)" }}>
                No historical chart points available for this pair.
              </div>
            )}
          </div>

          <div className="graph-stats-summary">
            <div className="graph-stat-card">
              <span className="stat-t">PERIOD HIGH</span>
              <span className="stat-v">{graphData?.maxRate?.toFixed(4) || "—"}</span>
            </div>
            <div className="graph-stat-card">
              <span className="stat-t">PERIOD LOW</span>
              <span className="stat-v">{graphData?.minRate?.toFixed(4) || "—"}</span>
            </div>
            <div className="graph-stat-card">
              <span className="stat-t">PERIOD AVERAGE</span>
              <span className="stat-v">{graphData?.avgRate?.toFixed(4) || "—"}</span>
            </div>
            <div className="graph-stat-card">
              <span className="stat-t">DATA SOURCE</span>
              <span className="stat-v" style={{ fontSize: "11.5px", color: "#34d399" }}>European Central Bank</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
