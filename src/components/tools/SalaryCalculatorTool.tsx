"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Zap, DollarSign } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function SalaryCalculatorTool() {
  const [currency, setCurrency] = useState<string>("INR");
  const [period, setPeriod] = useState<"monthly" | "annual" | "hourly" | "weekly">("monthly");
  const [amount, setAmount] = useState<string>("25000");
  const [extraData, setExtraData] = useState<Record<string, any>>({});
  const [rawOutput, setRawOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let inputStr = "";
    if (period === "monthly") {
      inputStr = `${currency} ${amount} per month`;
    } else if (period === "annual") {
      inputStr = currency === "INR" ? `${amount} LPA` : `${amount} ${currency} per year`;
    } else if (period === "hourly") {
      inputStr = `${currency} ${amount} / hour`;
    } else if (period === "weekly") {
      inputStr = `${currency} ${amount} / week`;
    }

    void executeTool("salary-calculator", inputStr, "", {}).then((res) => {
      setRawOutput(res.output);
      if (res.extra) {
        setExtraData(res.extra);
      }
    });
  }, [currency, period, amount]);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(rawOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // fallback
    }
  };

  return (
    <div className="workspace">
      {/* Title */}
      <div className="tool-header">
        <div className="tool-title-row">
          <span className="tool-icon-large">₹</span>
          <div>
            <div className="tool-category-badge">DAILY & FINANCE</div>
            <h1 className="tool-title">Salary & LPA In-Hand Calculator</h1>
            <p className="tool-desc">
              Convert CTC / LPA into monthly take-home in-hand salary with breakdown for Basic, HRA, EPF, and Income Tax deductions.
            </p>
          </div>
        </div>
      </div>

      <div className="salary-full-card">
        <div className="salary-mode-selectors">
          {/* Currency row */}
          <div className="salary-currency-row">
            <span className="salary-selector-title">CURRENCY:</span>
            {[
              { code: "INR", label: "₹ INR (India)" },
              { code: "USD", label: "$ USD (United States)" },
              { code: "EUR", label: "€ EUR (Europe)" },
              { code: "GBP", label: "£ GBP (United Kingdom)" },
              { code: "CAD", label: "C$ CAD (Canada)" },
              { code: "AUD", label: "A$ AUD (Australia)" },
              { code: "AED", label: "AED (UAE)" },
            ].map((c) => (
              <button
                key={c.code}
                className={`pill-choice ${currency === c.code ? "active" : ""}`}
                onClick={() => setCurrency(c.code)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Period row */}
          <div className="salary-period-row">
            <span className="salary-selector-title">FREQUENCY:</span>
            {[
              { id: "monthly", label: "📅 Per Month (e.g. 25k/mo)" },
              { id: "annual", label: currency === "INR" ? "💼 Annual CTC (LPA)" : "💼 Annual Package / CTC" },
              { id: "hourly", label: "⏱️ Hourly Rate" },
              { id: "weekly", label: "🗓️ Weekly Rate" },
            ].map((p) => (
              <button
                key={p.id}
                className={`pill-choice ${period === p.id ? "active" : ""}`}
                onClick={() => setPeriod(p.id as any)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Numeric Input & Presets */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", marginTop: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--surface-2)", border: "1px solid var(--line)", padding: "8px 14px", borderRadius: "8px" }}>
              <span style={{ fontWeight: "800", color: "var(--accent)" }}>{extraData.symbol || "₹"}</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: "16px", fontWeight: "750", width: "130px" }}
                placeholder="25000"
              />
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>{period === "hourly" ? "/hr" : period === "monthly" ? "/month" : period === "weekly" ? "/wk" : "annual"}</span>
            </div>

            <div className="custom-tool-row" style={{ flex: 1 }}>
              <span className="config-label">Quick Presets:</span>
              {(period === "monthly"
                ? currency === "INR"
                  ? ["15000", "25000", "50000", "100000", "200000"]
                  : ["2500", "4000", "6000", "10000", "15000"]
                : period === "hourly"
                  ? ["20", "35", "50", "75", "100"]
                  : currency === "INR"
                    ? ["6", "10", "12", "18", "25", "40"]
                    : ["50000", "80000", "120000", "160000", "220000"]
              ).map((val) => (
                <button
                  key={val}
                  className={`pill-choice ${amount === val ? "active" : ""}`}
                  onClick={() => setAmount(val)}
                >
                  {period === "annual" && currency === "INR"
                    ? `${val} LPA`
                    : `${currency === "INR" ? "₹" : "$"}${Number(val).toLocaleString()}${period === "hourly" ? "/hr" : period === "monthly" ? "/mo" : "/yr"}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {extraData.netMonthly && (
          <div className="salary-cards-summary-grid">
            <div className="salary-stat-box highlight">
              <span className="box-title">ESTIMATED NET TAKE-HOME MONTHLY</span>
              <div className="box-value">{extraData.symbol || "₹"}{extraData.netMonthly.toLocaleString()}</div>
              <span className="box-note">In-hand take-home after income tax TDS and provident fund/social security.</span>
            </div>
            <div className="salary-stat-box">
              <span className="box-title">NET ANNUAL IN-HAND</span>
              <div className="box-value">{extraData.symbol || "₹"}{extraData.netAnnual?.toLocaleString()}</div>
              <span className="box-note">Total take-home salary across 12 full calendar months.</span>
            </div>
            <div className="salary-stat-box">
              <span className="box-title">ANNUAL GROSS CTC</span>
              <div className="box-value">{extraData.symbol || "₹"}{extraData.annualCTC?.toLocaleString()}</div>
              <span className="box-note">{extraData.lpaEquivalent ? `Equivalent to ${extraData.lpaEquivalent}` : "Total compensation package"}</span>
            </div>
            <div className="salary-stat-box">
              <span className="box-title">HOURLY & DAILY RATE</span>
              <div className="box-value">{extraData.symbol || "₹"}{extraData.hourlyNet}/hr</div>
              <span className="box-note">{extraData.symbol || "₹"}{extraData.dailyNet?.toLocaleString()} per day (22 working days/mo)</span>
            </div>
          </div>
        )}

        {extraData.grossMonthly && (
          <div className="salary-breakdown-table-card">
            <div className="salary-ratio-bar-wrap">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700" }}>
                <span>Compensation Breakdown vs Deductions</span>
                <span style={{ color: "#34d399" }}>
                  {Math.round((extraData.netMonthly / (extraData.grossMonthly || 1)) * 100)}% Take-Home
                </span>
              </div>
              <div className="ratio-bar">
                <div
                  className="ratio-fill-takehome"
                  style={{
                    width: `${Math.round((extraData.netMonthly / (extraData.grossMonthly || 1)) * 100)}%`,
                  }}
                  title={`Take-Home: ${extraData.symbol}${extraData.netMonthly?.toLocaleString()}`}
                />
                <div
                  className="ratio-fill-tax"
                  style={{
                    width: `${Math.round(((extraData.taxMonthly || 0) / (extraData.grossMonthly || 1)) * 100)}%`,
                  }}
                  title={`Taxes: ${extraData.symbol}${extraData.taxMonthly?.toLocaleString()}`}
                />
                <div
                  className="ratio-fill-epf"
                  style={{
                    width: `${Math.round(((extraData.epfMonthly || 0) / (extraData.grossMonthly || 1)) * 100)}%`,
                  }}
                  title={`PF/Insurance: ${extraData.symbol}${extraData.epfMonthly?.toLocaleString()}`}
                />
              </div>
              <div className="ratio-legend">
                <span>
                  <span className="legend-dot" style={{ background: "#10b981" }} />
                  Net Take-Home ({extraData.symbol}{extraData.netMonthly?.toLocaleString()}/mo)
                </span>
                <span>
                  <span className="legend-dot" style={{ background: "#f43f5e" }} />
                  Income Tax TDS ({extraData.symbol}{extraData.taxMonthly?.toLocaleString()}/mo)
                </span>
                <span>
                  <span className="legend-dot" style={{ background: "#3b82f6" }} />
                  PF / Social Security ({extraData.symbol}{extraData.epfMonthly?.toLocaleString()}/mo)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Raw Calculation Breakdown */}
        <div className="editor-card" style={{ marginTop: 12 }}>
          <div className="output-toolbar">
            <div className="toolbar-left">
              <span className="pane-label">
                <span className="pane-dot output-dot" /> DETAILED PAYSLIP BREAKDOWN (JSON)
              </span>
            </div>
            <div className="toolbar-right">
              <button className="copy-button" onClick={copyOutput}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Breakdown"}</span>
              </button>
            </div>
          </div>
          <div className="output-pane">
            <pre className="output-code">{rawOutput}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
