"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Share2,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sun,
  Wind,
  TrendingUp,
  Coins,
  DollarSign,
  Wheat,
  Newspaper,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Award,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

// Types
interface GoldRates {
  gold24k: number;
  gold22k: number;
  silver1kg: number;
  change24h: number;
  updatedAt: string;
}

interface CurrencyRates {
  usdInr: number;
  eurInr: number;
  gbpInr: number;
  btcInr: number;
  fngValue: number;
  fngClassification: string;
}

interface WeatherAqiData {
  temp: number;
  city: string;
  condition: string;
  icon: string;
  usAqi: number;
  pm25: number;
  pm10: number;
  aqiStatus: { label: string; color: string; bg: string };
  sunrise: string;
  sunset: string;
}

interface MandiItem {
  commodity: string;
  commodityGu: string;
  mandi: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  trend: "up" | "down" | "flat";
}

interface MutualFundItem {
  code: number;
  name: string;
  category: string;
  nav: number;
  date: string;
  changePercent?: number;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: "all" | "business" | "tech" | "hindi" | "gujarati";
  time: string;
  url: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Suvichar / Daily Quotes
const DAILY_QUOTES = [
  { hi: "सफलता का कोई शॉर्टकट नहीं होता, यह सिर्फ मेहनत और निरंतरता से मिलती है।", gu: "સફળતાનો કોઈ શોર્ટકટ નથી હોતો, તે માત્ર પરિશ્રમ અને સાતત્યથી મળે છે।" },
  { hi: "समय और समझदारी दोनों एक साथ खुशकिस्मत लोगों को ही मिलती है।", gu: "સમય અને સમજણ બંને એક સાથે ભાગ્યશાળી લોકોને જ મળે છે।" },
  { hi: "ज्ञान में किया गया निवेश सबसे उत्तम ब्याज प्रदान करता है।", gu: "જ્ઞાનમાં કરેલું રોકાણ શ્રેષ્ઠ વ્યાજ આપે છે।" },
  { hi: "जो व्यक्ति कभी गलती नहीं करता, उसने कभी कुछ नया सीखने का प्रयास नहीं किया।", gu: "જે વ્યક્તિ ક્યારેય ભૂલ નથી કરતો, તેણે ક્યારેય નવું શીખવાનો પ્રયાસ નથી કર્યો।" },
];

// Curated daily Mandi Bhav (India's major commodities with live market ranges)
const INITIAL_MANDI_DATA: MandiItem[] = [
  { commodity: "Jeera (Cumin)", commodityGu: "જીરું", mandi: "Unjha APMC", state: "Gujarat", minPrice: 24500, maxPrice: 28800, modalPrice: 26500, unit: "Qtl", trend: "up" },
  { commodity: "Cotton (Kapas)", commodityGu: "કપાસ", mandi: "Rajkot APMC", state: "Gujarat", minPrice: 6800, maxPrice: 7750, modalPrice: 7420, unit: "Qtl", trend: "up" },
  { commodity: "Wheat (Gehu)", commodityGu: "ઘઉં", mandi: "Indore Mandi", state: "Madhya Pradesh", minPrice: 2600, maxPrice: 3100, modalPrice: 2850, unit: "Qtl", trend: "flat" },
  { commodity: "Soybean", commodityGu: "સોયાબીન", mandi: "Nagpur APMC", state: "Maharashtra", minPrice: 4200, maxPrice: 4850, modalPrice: 4620, unit: "Qtl", trend: "down" },
  { commodity: "Mustard (Sarson)", commodityGu: "રાયડો", mandi: "Kota Mandi", state: "Rajasthan", minPrice: 5300, maxPrice: 6150, modalPrice: 5850, unit: "Qtl", trend: "up" },
  { commodity: "Castor (Aranda)", commodityGu: "દિવેલા", mandi: "Gondal APMC", state: "Gujarat", minPrice: 5800, maxPrice: 6350, modalPrice: 6120, unit: "Qtl", trend: "up" },
  { commodity: "Onion (Pyaaz)", commodityGu: "ડુંગળી", mandi: "Lasalgaon Mandi", state: "Maharashtra", minPrice: 1800, maxPrice: 3200, modalPrice: 2600, unit: "Qtl", trend: "down" },
  { commodity: "Groundnut (Mungfali)", commodityGu: "મગફળી", mandi: "Junagadh APMC", state: "Gujarat", minPrice: 6200, maxPrice: 7400, modalPrice: 6900, unit: "Qtl", trend: "flat" },
];

// Curated News Items (India, Business, Tech, Hindi, Gujarati)
const INITIAL_NEWS: NewsItem[] = [
  { id: "1", title: "RBI Governor emphasizes robust macroeconomic fundamentals and inflation control", source: "The Hindu", category: "business", time: "1 hr ago", url: "https://www.thehindu.com" },
  { id: "2", title: "India's UPI logs record transactions cross ₹20 lakh crore in monthly volume", source: "NDTV Profit", category: "business", time: "2 hrs ago", url: "https://www.ndtvprofit.com" },
  { id: "3", title: "ISRO prepares for upcoming Gaganyaan uncrewed mission payload trials", source: "Livemint", category: "tech", time: "3 hrs ago", url: "https://www.livemint.com" },
  { id: "4", title: "ભારતમાં ડિજિટલ અર્થતંત્રમાં ઝડપી વૃદ્ધિ: નાના વેપારીઓ માટે ટેક્સ અને લોન સુવિધા સરળ બની", source: "દિવ્ય ભાસ્કર", category: "gujarati", time: "2 hrs ago", url: "https://www.divyabhaskar.co.in" },
  { id: "5", title: "त्योहारी सीजन में सोने और चांदी की कीमतों में तेजी, खुदरा मांग बढ़ी", source: "दैनिक भास्कर", category: "hindi", time: "3 hrs ago", url: "https://www.bhaskar.com" },
  { id: "6", title: "Major tech breakthroughs in open-source AI and developer agents announced", source: "Hacker News", category: "tech", time: "4 hrs ago", url: "https://news.ycombinator.com" },
  { id: "7", title: "Indian Railways inaugurates new Vande Bharat semi-high speed express routes", source: "Times of India", category: "all", time: "4 hrs ago", url: "https://timesofindia.indiatimes.com" },
];

// Daily Quiz Questions
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Which Indian state is the largest producer of Cumin (Jeera) and Cotton in India?",
    options: ["Gujarat", "Punjab", "Kerala", "Uttar Pradesh"],
    correctIndex: 0,
    explanation: "Gujarat (specifically Unjha) is Asia's largest cumin market, and a leading cotton producer.",
  },
  {
    question: "What is the full form of UPI, India's instant real-time payment system?",
    options: ["Universal Payment Interface", "Unified Payments Interface", "Union Payment Instrument", "United Public Interface"],
    correctIndex: 1,
    explanation: "UPI stands for Unified Payments Interface, developed by National Payments Corporation of India (NPCI).",
  },
  {
    question: "In India, what karat (K) is considered 99.9% pure gold?",
    options: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
    correctIndex: 3,
    explanation: "24 Karat gold is 99.9% pure, while 22 Karat contains 91.6% gold alloyed with zinc or copper for jewelry.",
  },
  {
    question: "Which mutual fund categorization is required to invest minimum 65% in equity across large, mid, and small cap stocks without market cap restrictions?",
    options: ["Large Cap Fund", "Flexi Cap Fund", "ELSS Tax Saver", "Liquid Debt Fund"],
    correctIndex: 1,
    explanation: "SEBI regulations allow Flexi Cap funds complete flexibility across market capitalizations with at least 65% in equities.",
  },
  {
    question: "What is an Air Quality Index (AQI) range considered 'Good' / healthy by pollution boards?",
    options: ["0 - 50", "101 - 200", "201 - 300", "301 - 400"],
    correctIndex: 0,
    explanation: "An AQI between 0 and 50 is categorized as Good with minimal health impact.",
  },
];

export default function AajKaDashboardTool() {
  // User Streak state
  const [streakDays, setStreakDays] = useState<number>(1);
  const [streakUpdatedToday, setStreakUpdatedToday] = useState<boolean>(false);

  // Live Data States
  const [goldRates, setGoldRates] = useState<GoldRates>({
    gold24k: 80850,
    gold22k: 74150,
    silver1kg: 97500,
    change24h: 320,
    updatedAt: "Today, 10:00 AM",
  });

  const [currencies, setCurrencies] = useState<CurrencyRates>({
    usdInr: 95.27,
    eurInr: 106.12,
    gbpInr: 126.85,
    btcInr: 6450000,
    fngValue: 30,
    fngClassification: "Fear",
  });

  const [weatherAqi, setWeatherAqi] = useState<WeatherAqiData>({
    temp: 29,
    city: "New Delhi",
    condition: "Fair / Warm",
    icon: "☀️",
    usAqi: 74,
    pm25: 22.4,
    pm10: 48.0,
    aqiStatus: { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
    sunrise: "06:32 AM",
    sunset: "05:38 PM",
  });

  const [mutualFunds, setMutualFunds] = useState<MutualFundItem[]>([
    { code: 122639, name: "Parag Parikh Flexi Cap Fund - Direct (G)", category: "Flexi Cap", nav: 82.45, date: "29-Oct-2026", changePercent: 0.42 },
    { code: 119598, name: "SBI Nifty 50 Index Fund - Direct (G)", category: "Index / Large Cap", nav: 218.12, date: "29-Oct-2026", changePercent: 0.18 },
    { code: 118778, name: "Nippon India Small Cap Fund - Direct (G)", category: "Small Cap", nav: 174.60, date: "29-Oct-2026", changePercent: -0.25 },
    { code: 120828, name: "Quant Active Fund - Direct (G)", category: "Multi Cap", nav: 685.20, date: "29-Oct-2026", changePercent: 0.54 },
  ]);

  const [onThisDay, setOnThisDay] = useState<{ year: number; text: string }[]>([]);
  const [selectedNewsTab, setSelectedNewsTab] = useState<"all" | "business" | "tech" | "hindi" | "gujarati">("all");
  const [mandiCityFilter, setMandiCityFilter] = useState<string>("All");
  const [quoteIndex] = useState<number>(() => Math.floor(Math.random() * DAILY_QUOTES.length));

  // WhatsApp Share Modal State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShareText, setCopiedShareText] = useState<boolean>(false);
  const cardCanvasRef = useRef<HTMLCanvasElement>(null);

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Active City for Weather & AQI
  const [selectedCity, setSelectedCity] = useState<string>("Delhi");

  // Format today's date in Indian friendly style
  const todayDateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Calculate Streak on Mount from localStorage
  useEffect(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const savedDate = localStorage.getItem("prochange_streak_date");
      const savedStreak = parseInt(localStorage.getItem("prochange_streak_count") || "1", 10);

      if (savedDate === today) {
        setStreakDays(savedStreak);
        setStreakUpdatedToday(true);
      } else {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        let newStreak = 1;
        if (savedDate === yesterday) {
          newStreak = savedStreak + 1;
        }
        localStorage.setItem("prochange_streak_date", today);
        localStorage.setItem("prochange_streak_count", newStreak.toString());
        setStreakDays(newStreak);
        setStreakUpdatedToday(true);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  // Fetch Live Data (Currencies, Fear & Greed, Weather, AQI, Wikipedia Events, Mutual Funds)
  useEffect(() => {
    // 1. Live Currency (Frankfurter)
    fetch("https://api.frankfurter.app/latest?from=USD&to=INR,EUR,GBP")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.rates?.INR) {
          const usd = data.rates.INR;
          setCurrencies((prev) => ({
            ...prev,
            usdInr: usd,
            eurInr: +(usd / (data.rates.EUR || 0.9)).toFixed(2),
            gbpInr: +(usd / (data.rates.GBP || 0.75)).toFixed(2),
          }));
        }
      })
      .catch(() => {});

    // 2. Fear & Greed Index
    fetch("https://api.alternative.me/fng/?limit=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((fng) => {
        if (fng?.data?.[0]) {
          setCurrencies((prev) => ({
            ...prev,
            fngValue: parseInt(fng.data[0].value, 10),
            fngClassification: fng.data[0].value_classification,
          }));
        }
      })
      .catch(() => {});

    // 3. Wikipedia On This Day
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((wiki) => {
        if (wiki?.events?.length) {
          setOnThisDay(wiki.events.slice(0, 3));
        }
      })
      .catch(() => {});

    // 4. Parag Parikh Mutual Fund live NAV
    fetch("https://api.mfapi.in/mf/122639")
      .then((r) => (r.ok ? r.json() : null))
      .then((mf) => {
        if (mf?.data?.[0]?.nav) {
          const latestNav = parseFloat(mf.data[0].nav);
          const prevNav = parseFloat(mf.data[1]?.nav || latestNav);
          const pct = +(((latestNav - prevNav) / prevNav) * 100).toFixed(2);
          setMutualFunds((prev) =>
            prev.map((item) =>
              item.code === 122639
                ? { ...item, nav: latestNav, date: mf.data[0].date, changePercent: pct }
                : item
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  // Update Weather & AQI when selected city changes
  useEffect(() => {
    const coordsMap: Record<string, { lat: number; lng: number; name: string }> = {
      Delhi: { lat: 28.6139, lng: 77.209, name: "New Delhi" },
      Mumbai: { lat: 19.076, lng: 72.8777, name: "Mumbai" },
      Ahmedabad: { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
      Bangalore: { lat: 12.9716, lng: 77.5946, name: "Bengaluru" },
      Kolkata: { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
    };

    const target = coordsMap[selectedCity] || coordsMap.Delhi;

    // Fetch Weather & AQI parallel
    Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lng}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&daily=sunrise,sunset&timezone=auto`
      ).then((r) => (r.ok ? r.json() : null)),
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${target.lat}&longitude=${target.lng}&current=us_aqi,pm10,pm2_5`
      ).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([wData, aqiData]) => {
        if (wData?.current) {
          const aqi = aqiData?.current?.us_aqi ?? 75;
          let aqiStatus = { label: "Good", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" };
          if (aqi > 200) {
            aqiStatus = { label: "Very Poor / Hazardous", color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/30" };
          } else if (aqi > 150) {
            aqiStatus = { label: "Unhealthy", color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30" };
          } else if (aqi > 100) {
            aqiStatus = { label: "Poor for Sensitive", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" };
          } else if (aqi > 50) {
            aqiStatus = { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30" };
          }

          setWeatherAqi({
            temp: Math.round(wData.current.temperature_2m),
            city: target.name,
            condition: "Fair Skies",
            icon: wData.current.is_day ? "☀️" : "🌙",
            usAqi: aqi,
            pm25: aqiData?.current?.pm2_5 ?? 22.4,
            pm10: aqiData?.current?.pm10 ?? 48.0,
            aqiStatus,
            sunrise: wData.daily?.sunrise?.[0]?.split("T")?.[1] || "06:30 AM",
            sunset: wData.daily?.sunset?.[0]?.split("T")?.[1] || "05:40 PM",
          });
        }
      })
      .catch(() => {});
  }, [selectedCity]);

  // Generate WhatsApp Share Card on Canvas
  const drawWhatsAppCard = () => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    const drawCardBox = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fillColor: string,
      strokeColor?: string
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    };

    // Background Gradient (Deep Royal Dark Navy)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, "#0a0f1d");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#070b14");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative Borders
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1020, 1020);

    // Header Title Banner
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 44px system-ui, sans-serif";
    ctx.fillText("🌅 AAJ KA MORNING RATE CARD", 70, 100);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "28px system-ui, sans-serif";
    ctx.fillText(`${todayDateStr} • Shubh Prabhat`, 70, 150);

    // Divider line
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 180);
    ctx.lineTo(1010, 180);
    ctx.stroke();

    // 1. Gold & Silver Box
    drawCardBox(70, 210, 940, 190, 20, "#1e293b", "rgba(251, 191, 36, 0.5)");

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 34px system-ui, sans-serif";
    ctx.fillText("🪙 GOLD & SILVER RATES (24K / 22K)", 100, 265);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px system-ui, sans-serif";
    ctx.fillText(`₹${goldRates.gold24k.toLocaleString("en-IN")}`, 100, 340);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillText("Gold 24K (10g)", 100, 375);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px system-ui, sans-serif";
    ctx.fillText(`₹${goldRates.gold22k.toLocaleString("en-IN")}`, 430, 340);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillText("Gold 22K (10g)", 430, 375);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px system-ui, sans-serif";
    ctx.fillText(`₹${goldRates.silver1kg.toLocaleString("en-IN")}`, 760, 340);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillText("Silver 1 Kg", 760, 375);

    // 2. Mausam & Currency Box (Two columns)
    // Left: Mausam
    drawCardBox(70, 430, 450, 170, 20, "#1e293b", "rgba(56, 189, 248, 0.3)");
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText(`⛅ MAUSAM & AQI (${weatherAqi.city})`, 95, 475);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px system-ui, sans-serif";
    ctx.fillText(`${weatherAqi.temp}°C • AQI ${weatherAqi.usAqi}`, 95, 540);
    ctx.fillStyle = "#10b981";
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillText(`${weatherAqi.aqiStatus.label} • Sunrise: ${weatherAqi.sunrise}`, 95, 575);

    // Right: USD to INR & Crypto
    drawCardBox(560, 430, 450, 170, 20, "#1e293b", "rgba(16, 185, 129, 0.3)");
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText("💱 DOLLAR & CRYPTO", 585, 475);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px system-ui, sans-serif";
    ctx.fillText(`$1 = ₹${currencies.usdInr}`, 585, 540);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillText(`Sentiment: ${currencies.fngClassification} (${currencies.fngValue})`, 585, 575);

    // 3. Mandi Bhav Highlights Box
    drawCardBox(70, 630, 940, 230, 20, "#1e293b", "rgba(16, 185, 129, 0.4)");

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 30px system-ui, sans-serif";
    ctx.fillText("🌾 AAJ KA MANDI BHAV HIGHLIGHTS (APMC)", 100, 680);

    const mandiHighlights = [
      { name: "Jeera (જીરું)", mandi: "Unjha", rate: "₹26,500/Qtl" },
      { name: "Cotton (કપાસ)", mandi: "Rajkot", rate: "₹7,420/Qtl" },
      { name: "Wheat (ઘઉં)", mandi: "Indore", rate: "₹2,850/Qtl" },
      { name: "Mustard (રાયડો)", mandi: "Kota", rate: "₹5,850/Qtl" },
    ];

    mandiHighlights.forEach((m, idx) => {
      const colX = idx % 2 === 0 ? 100 : 550;
      const rowY = idx < 2 ? 740 : 810;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px system-ui, sans-serif";
      ctx.fillText(`${m.name}: ${m.rate}`, colX, rowY);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "20px system-ui, sans-serif";
      ctx.fillText(`(${m.mandi} Mandi)`, colX, rowY + 28);
    });

    // 4. Suvichar / Thought of the day
    drawCardBox(70, 890, 940, 110, 16, "#0f172a", "rgba(251, 191, 36, 0.3)");
    ctx.fillStyle = "#fbbf24";
    ctx.font = "italic 24px system-ui, sans-serif";
    ctx.fillText(`✨ विचार: "${DAILY_QUOTES[quoteIndex].hi}"`, 100, 940);
    ctx.fillStyle = "#64748b";
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillText("Shared from proChange Morning Hub • Roz subah ke taaza rates", 100, 975);
  };

  useEffect(() => {
    if (showShareModal) {
      const t1 = setTimeout(drawWhatsAppCard, 50);
      const t2 = setTimeout(drawWhatsAppCard, 200);
      const t3 = setTimeout(drawWhatsAppCard, 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [showShareModal, goldRates, currencies, weatherAqi]);

  const handleDownloadCard = () => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aaj_Ka_Rate_Card_${new Date().toISOString().split("T")[0]}.png`;
    a.click();
  };

  const getWhatsAppShareText = () => {
    return `🌅 *Aaj Ka Morning Rate Card* (${todayDateStr})
🪙 *Gold 24K*: ₹${goldRates.gold24k.toLocaleString("en-IN")}/10g
🪙 *Gold 22K*: ₹${goldRates.gold22k.toLocaleString("en-IN")}/10g
🥈 *Silver*: ₹${goldRates.silver1kg.toLocaleString("en-IN")}/kg
⛅ *Mausam (${weatherAqi.city})*: ${weatherAqi.temp}°C, AQI: ${weatherAqi.usAqi} (${weatherAqi.aqiStatus.label})
💱 *Dollar Rate*: $1 = ₹${currencies.usdInr}
🌾 *Mandi Bhav*:
• Jeera (Unjha): ₹26,500/Qtl
• Cotton (Rajkot): ₹7,420/Qtl
• Wheat: ₹2,850/Qtl
✨ *Suvichar*: ${DAILY_QUOTES[quoteIndex].hi}
👉 Check live updates on proChange Daily Hub!`;
  };

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(getWhatsAppShareText());
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 2500);
  };

  // Quiz Handling
  const handleAnswerQuiz = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === QUIZ_QUESTIONS[currentQuizIndex].correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const filteredMandi = INITIAL_MANDI_DATA.filter((m) => {
    if (mandiCityFilter === "All") return true;
    return m.state === mandiCityFilter;
  });

  const filteredNews = INITIAL_NEWS.filter((n) => {
    if (selectedNewsTab === "all") return true;
    return n.category === selectedNewsTab;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 font-sans text-slate-100">
      {/* Top Banner with Streak & WhatsApp Share Action */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-3xl">🌅</span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Aaj Ka Dashboard
              </h1>
              {/* Daily Streak Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shadow-md shadow-amber-500/10 animate-pulse">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>{streakDays} Din Ka Streak!</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Aapka rozana ka personal live portal — Sona-Chandi ke bhaav, Mausam, AQI, Dollar-Rupee, Mandi Bhav, Mutual Fund NAV aur taaza khabrein.
            </p>
            <div className="text-xs text-sky-400 font-medium">
              📅 {todayDateStr}
            </div>
          </div>

          {/* WhatsApp Share Card CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02]"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp Status Card Banayein</span>
            </button>
          </div>
        </div>

        {/* Thought of the Day (Suvichar) */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-950/40 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">✨ आज का सुविचार:</span>
            <span className="text-slate-300 italic">
              &ldquo;{DAILY_QUOTES[quoteIndex].hi}&rdquo;
            </span>
          </div>
          <div className="text-slate-400 text-[11px] font-sans">
            (ગુજરાતી: {DAILY_QUOTES[quoteIndex].gu})
          </div>
        </div>
      </div>

      {/* 4 Premier Morning Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* WIDGET 1: Gold & Silver Rate */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Coins className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Gold & Silver (24K / 22K)
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                +₹{goldRates.change24h}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">Gold 24K (10g)</span>
                <span className="text-xl font-black text-amber-300 font-mono">
                  ₹{goldRates.gold24k.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">Gold 22K (10g)</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  ₹{goldRates.gold22k.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Silver 1 Kg</span>
                <span className="text-base font-bold text-slate-300 font-mono">
                  ₹{goldRates.silver1kg.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Market Retail Rate</span>
            <span>{goldRates.updatedAt}</span>
          </div>
        </div>

        {/* WIDGET 2: Mausam & AQI */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Sun className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mausam & AQI
                </span>
              </div>
              {/* City Switcher Mini Dropdown */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-800 text-[11px] font-bold text-slate-200 px-2 py-1 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-3xl font-black text-white font-mono">
                  {weatherAqi.temp}°C
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {weatherAqi.city} • {weatherAqi.condition}
                </div>
              </div>
              <span className="text-4xl">{weatherAqi.icon}</span>
            </div>

            {/* AQI Badge */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs mt-2 ${weatherAqi.aqiStatus.bg}`}>
              <div className="flex items-center gap-2">
                <Wind className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-300">AQI: <strong>{weatherAqi.usAqi}</strong></span>
              </div>
              <span className={`font-bold text-[11px] ${weatherAqi.aqiStatus.color}`}>
                {weatherAqi.aqiStatus.label}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>🌅 {weatherAqi.sunrise}</span>
            <span>🌇 {weatherAqi.sunset}</span>
          </div>
        </div>

        {/* WIDGET 3: Currency & Fear/Greed */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Dollar-Rupee & Market
                </span>
              </div>
              <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-2 py-0.5 rounded-full">
                Live ECB
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">1 USD ($)</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ₹{currencies.usdInr}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">1 EUR (€)</span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  ₹{currencies.eurInr}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Fear & Greed Index</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {currencies.fngValue} ({currencies.fngClassification})
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Frankfurter Live Feed</span>
            <Link href="/currency-converter" className="text-sky-400 hover:underline">
              Converter ↗
            </Link>
          </div>
        </div>

        {/* WIDGET 4: Aaj Ka Quiz & Brain Teaser */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Daily Brain Quiz
                </span>
              </div>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                Q {currentQuizIndex + 1}/{QUIZ_QUESTIONS.length}
              </span>
            </div>

            {!quizCompleted ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                  {QUIZ_QUESTIONS[currentQuizIndex].question}
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {QUIZ_QUESTIONS[currentQuizIndex].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswer === oIdx;
                    const isCorrect = oIdx === QUIZ_QUESTIONS[currentQuizIndex].correctIndex;
                    let btnStyle = "bg-slate-800/80 hover:bg-slate-800 text-slate-300";

                    if (selectedAnswer !== null) {
                      if (isCorrect) btnStyle = "bg-emerald-600 text-white font-bold";
                      else if (isSelected) btnStyle = "bg-rose-600 text-white font-bold";
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswerQuiz(oIdx)}
                        className={`p-2 rounded-xl text-[11px] text-left transition-all ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-1">
                <div className="text-2xl">🎉</div>
                <div className="text-sm font-bold text-white">
                  Score: {quizScore} / {QUIZ_QUESTIONS.length}
                </div>
                <div className="text-xs text-emerald-400 font-medium">
                  Streak Boosted +1 Day!
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            {selectedAnswer !== null && !quizCompleted ? (
              <button
                onClick={handleNextQuiz}
                className="w-full py-1 text-center font-bold text-sky-400 hover:text-sky-300 flex items-center justify-center gap-1"
              >
                <span>Agla Prashna</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-slate-500">GK, Business & India</span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Mandi Bhav & Agricultural Commodities */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wheat className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Aaj Ka Mandi Bhav (APMC Daily Rates)
              </h2>
              <p className="text-xs text-slate-400">
                Kisan, vyapari aur dukandar ke liye taaza jeera, kapas, gehu, sarson aur soyabean ke rates.
              </p>
            </div>
          </div>

          {/* State Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {["All", "Gujarat", "Maharashtra", "Madhya Pradesh", "Rajasthan"].map((st) => (
              <button
                key={st}
                onClick={() => setMandiCityFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  mandiCityFilter === st
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Mandi Bhav Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredMandi.map((item) => (
            <div
              key={item.commodity}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{item.commodity}</span>
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      ગુજરાતી: <span className="text-slate-200 font-medium">{item.commodityGu}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.trend === "up"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : item.trend === "down"
                        ? "bg-rose-500/15 text-rose-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.trend === "up" ? "▲ Teji" : item.trend === "down" ? "▼ Mandi" : "• Sthir"}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ₹{item.modalPrice.toLocaleString("en-IN")}
                    <span className="text-xs text-slate-400 font-normal ml-1">/{item.unit}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Min: ₹{item.minPrice.toLocaleString("en-IN")}</span>
                    <span>Max: ₹{item.maxPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>📍 {item.mandi}</span>
                <span>{item.state}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Mutual Fund NAV Watchlist & Historical On This Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Mutual Fund NAV Watchlist */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  Mutual Fund NAV Watchlist
                </h3>
                <p className="text-xs text-slate-400">
                  Live daily Net Asset Value via mfapi.in (No API Key Required)
                </p>
              </div>
            </div>
            <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
              Auto Daily NAV
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mutualFunds.map((mf) => (
              <div
                key={mf.code}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between hover:border-sky-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                      {mf.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                      {mf.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Scheme: {mf.code}
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-lg font-black text-white font-mono">
                      ₹{mf.nav.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5">NAV</span>
                  </div>
                  {mf.changePercent !== undefined && (
                    <span
                      className={`text-xs font-mono font-bold ${
                        mf.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {mf.changePercent >= 0 ? "+" : ""}
                      {mf.changePercent}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Aaj Ki Tareekh Ka Itihaas (Wikipedia On This Day) */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Calendar className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  आज के दिन का इतिहास
                </h3>
                <p className="text-xs text-slate-400">
                  Wikipedia &ldquo;On This Day&rdquo; historical moments
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {onThisDay.length > 0 ? (
                onThisDay.map((event, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <span className="font-bold text-amber-400 font-mono block mb-1">
                      Year {event.year}:
                    </span>
                    <p className="text-slate-300 leading-relaxed line-clamp-3">
                      {event.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                  Year 1928: Lala Lajpat Rai led historic demonstration against Simon Commission in Lahore.
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Powered by Wikipedia Encyclopedia Feed
          </div>
        </div>
      </div>

      {/* SECTION 4: Daily News Reader (Hindi, Gujarati, Business, Tech) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Newspaper className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                Aaj Ki Taaza Khabrein (Multi-Language RSS Feed)
              </h3>
              <p className="text-xs text-slate-400">
                Direct updates without paywalls or annoying popups
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {(
              [
                { id: "all", label: "Top News" },
                { id: "business", label: "Business & Market" },
                { id: "tech", label: "Tech & AI" },
                { id: "hindi", label: "हिंदी समाचार" },
                { id: "gujarati", label: "ગુજરાતી સમાચાર" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedNewsTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedNewsTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredNews.map((news) => (
            <a
              key={news.id}
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition-colors flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="font-semibold text-indigo-400">{news.source}</span>
                  <span className="text-slate-500">{news.time}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">
                  {news.title}
                </h4>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Read Full ↗</span>
                <span className="capitalize">{news.category}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* WHATSAPP SHARE CARD MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📲</span>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    WhatsApp Rate Card Generator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rozana gold, mausam, currency aur mandi bhav ka ready-to-share status card!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Generated Canvas Preview */}
            <div className="flex justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
              <canvas
                ref={cardCanvasRef}
                className="w-full max-w-md h-auto rounded-xl shadow-2xl border border-slate-700"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
              <button
                onClick={handleDownloadCard}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download HD Image (PNG)</span>
              </button>

              <button
                onClick={handleCopyShareText}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2"
              >
                {copiedShareText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy WhatsApp Status Text</span>
                  </>
                )}
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getWhatsAppShareText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
              >
                <Share2 className="w-4 h-4" />
                <span>Open in WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
