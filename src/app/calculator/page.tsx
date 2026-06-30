"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const BRAND = {
  navy: "#1B3A6B",
  navyDark: "#0F2445",
  navyLight: "#2A4F8A",
  teal: "#2BA89D",
  tealDark: "#1E8A7F",
  tealLight: "#3CC4B8",
  tealPale: "#E8F8F6",
  bg: "#F7F9FC",
  white: "#FFFFFF",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray300: "#CBD5E1",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1E293B",
  loss: "#DC2626",
  recovery: "#16A34A",
  lightBg: "#F0F4F8",
};

const REGION_OPTIONS = [
  "Miami-Dade",
  "Broward",
  "Palm Beach",
  "The Keys",
  "Central FL",
  "North FL",
  "Other",
];

const REGION_COUNTS: Record<string, number> = {
  "Miami-Dade": 87,
  "Broward": 94,
  "Palm Beach": 72,
  "The Keys": 43,
  "Central FL": 61,
  "North FL": 38,
  "Other": 52,
};

const ROLE_OPTIONS = ["Owner", "Manager", "Dockmaster", "Other"];

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface Results {
  annualLoss: number;
  dailyLoss: number;
  lossPerSlip: number;
  occupancyRate: number;
  recoveryConservative: number;
  recoveryOptimistic: number;
}

interface FormErrors {
  vacantSlips?: string;
  totalSlips?: string;
  avgMonthlyRate?: string;
}

export default function CalculatorPage() {
  // Calculator inputs
  const [marinaName, setMarinaName] = useState("");
  const [totalSlips, setTotalSlips] = useState("");
  const [vacantSlips, setVacantSlips] = useState("");
  const [avgMonthlyRate, setAvgMonthlyRate] = useState("");
  const [avgVacancyMonths, setAvgVacancyMonths] = useState(4);
  const [region, setRegion] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Results
  const [results, setResults] = useState<Results | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Count-up animation
  const [displayedLoss, setDisplayedLoss] = useState(0);
  const [displayedDaily, setDisplayedDaily] = useState(0);
  const [displayedPerSlip, setDisplayedPerSlip] = useState(0);

  // Email capture
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [captureRole, setCaptureRole] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showFinalCTA, setShowFinalCTA] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);

  // Entry animation
  const [visible, setVisible] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Count-up animation when results appear
  useEffect(() => {
    if (!showResults || !results) return;
    const steps = 60;
    let step = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const timer = setInterval(() => {
      step++;
      const p = easeOut(step / steps);
      setDisplayedLoss(Math.round(results.annualLoss * p));
      setDisplayedDaily(Math.round(results.dailyLoss * p));
      setDisplayedPerSlip(Math.round(results.lossPerSlip * p));
      if (step >= steps) {
        clearInterval(timer);
        setDisplayedLoss(Math.round(results.annualLoss));
        setDisplayedDaily(Math.round(results.dailyLoss));
        setDisplayedPerSlip(Math.round(results.lossPerSlip));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [showResults, results]);

  // Scroll to results after they appear
  useEffect(() => {
    if (showResults && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [showResults]);

  // Show modal 5 seconds after results appear
  useEffect(() => {
    if (!showResults || emailSubmitted) return;
    const t = setTimeout(() => setShowModal(true), 5000);
    return () => clearTimeout(t);
  }, [showResults, emailSubmitted]);

  function validate(): boolean {
    const errs: FormErrors = {};
    const total = parseInt(totalSlips);
    const vacant = parseInt(vacantSlips);
    const rate = parseFloat(avgMonthlyRate);

    if (!totalSlips || isNaN(total) || total < 1) {
      errs.totalSlips = "Enter a valid total slip count.";
    }
    if (!vacantSlips || isNaN(vacant) || vacant < 1) {
      errs.vacantSlips = "Enter a valid vacant slip count.";
    } else if (!isNaN(total) && vacant > total) {
      errs.vacantSlips = "Vacant slips cannot exceed total slips.";
    }
    if (!avgMonthlyRate || isNaN(rate) || rate < 1) {
      errs.avgMonthlyRate = "Enter a valid monthly rate.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const total = parseInt(totalSlips);
    const vacant = parseInt(vacantSlips);
    const rate = parseFloat(avgMonthlyRate);

    const annualLoss = vacant * rate * avgVacancyMonths;
    const dailyLoss = annualLoss / 365;
    const lossPerSlip = annualLoss / vacant;
    const occupancyRate = ((total - vacant) / total) * 100;
    const recoveryConservative = annualLoss * 0.5;
    const recoveryOptimistic = annualLoss * 0.8;

    setDisplayedLoss(0);
    setDisplayedDaily(0);
    setDisplayedPerSlip(0);

    setResults({
      annualLoss,
      dailyLoss,
      lossPerSlip,
      occupancyRate,
      recoveryConservative,
      recoveryOptimistic,
    });
    setShowResults(true);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!results) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/calculator-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marina_name: marinaName || null,
          email,
          phone: phone || null,
          role: captureRole || null,
          region: region || null,
          total_slips: parseInt(totalSlips),
          vacant_slips: parseInt(vacantSlips),
          avg_monthly_rate: parseFloat(avgMonthlyRate),
          avg_vacancy_months: avgVacancyMonths,
          annual_loss: results.annualLoss,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setEmailSubmitted(true);
      setShowFinalCTA(true);
      setShowModal(false);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: `1.5px solid ${BRAND.gray200}`,
    borderRadius: 10,
    fontSize: 15,
    color: BRAND.gray800,
    background: BRAND.white,
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: BRAND.gray600,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const errorStyle: React.CSSProperties = {
    color: BRAND.loss,
    fontSize: 13,
    marginTop: 4,
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BRAND.lightBg,
        color: BRAND.gray800,
      }}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to   { width: var(--target-width); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .calc-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .calc-input:focus {
          outline: none;
          border-color: #2BA89D !important;
          box-shadow: 0 0 0 3px rgba(43,168,157,0.15);
        }
        .calc-btn {
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease, opacity 0.2s;
        }
        .calc-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(27,58,107,0.3);
        }
        .calc-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .teal-btn {
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease, opacity 0.2s;
        }
        .teal-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(43,168,157,0.35);
        }
        .teal-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .slider-track::-webkit-slider-runnable-track {
          background: #E2E8F0;
          border-radius: 999px;
          height: 6px;
        }
        .slider-track::-moz-range-track {
          background: #E2E8F0;
          border-radius: 999px;
          height: 6px;
        }
        .slider-track::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2BA89D;
          margin-top: -7px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(43,168,157,0.4);
        }
        .slider-track::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2BA89D;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(43,168,157,0.4);
        }
        .slider-track {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: #E2E8F0;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
      `}</style>

      {/* ── HERO ── */}
      <div
        style={{
          position: "relative",
          background: `linear-gradient(135deg, ${BRAND.navyDark} 0%, ${BRAND.navy} 60%, ${BRAND.navyLight} 100%)`,
          padding: "72px 24px 110px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Dot pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 680,
            margin: "0 auto",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(43,168,157,0.15)",
              border: "1px solid rgba(43,168,157,0.35)",
              borderRadius: 999,
              padding: "6px 16px",
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 13, color: BRAND.tealLight, fontWeight: 600 }}>
              Free Revenue Calculator
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              color: BRAND.white,
              lineHeight: 1.15,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            How Much Are Your{" "}
            <span style={{ color: BRAND.tealLight }}>Empty Slips</span> Costing
            You?
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: 520,
              margin: "0 auto 32px",
            }}
          >
            Most marina operators underestimate vacancy losses by 40% or more.
            See your real number in 30 seconds.
          </p>

          {/* Trust pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {["Free calculator", "No signup required", "Results in 30 seconds"].map(
              (pill) => (
                <div
                  key={pill}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 999,
                    padding: "5px 14px",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="6" fill={BRAND.teal} opacity="0.3" />
                    <path
                      d="M3.5 6.5L5 8L8.5 4.5"
                      stroke={BRAND.teal}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                    {pill}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Wave divider */}
        <div
          style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}
        >
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "100%" }}
          >
            <path
              d="M0 60V30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0Z"
              fill={BRAND.lightBg}
            />
          </svg>
        </div>
      </div>

      {/* ── CALCULATOR FORM ── */}
      <div style={{ padding: "0 24px 40px" }}>
        <div
          style={{
            maxWidth: 680,
            margin: "-40px auto 0",
            position: "relative",
            zIndex: 2,
            background: BRAND.white,
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            padding: "32px 32px 36px",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: BRAND.navy,
              marginBottom: 4,
            }}
          >
            Enter Your Marina&apos;s Numbers
          </h2>
          <p style={{ fontSize: 14, color: BRAND.gray500, marginBottom: 28 }}>
            All fields marked * are required. Your data stays private.
          </p>

          <form onSubmit={handleCalculate} noValidate>
            {/* Marina Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Marina Name</label>
              <input
                className="calc-input"
                type="text"
                value={marinaName}
                onChange={(e) => setMarinaName(e.target.value)}
                placeholder="e.g. Sunrise Harbor Marina"
                style={inputStyle}
              />
            </div>

            {/* Region */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Your Region</label>
              <select
                className="calc-input"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Select a region…</option>
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Total / Vacant Slips — two columns on wider screens */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={labelStyle}>Total Slips *</label>
                <input
                  className="calc-input"
                  type="number"
                  min={1}
                  value={totalSlips}
                  onChange={(e) => {
                    setTotalSlips(e.target.value);
                    if (errors.totalSlips)
                      setErrors((prev) => ({ ...prev, totalSlips: undefined }));
                  }}
                  placeholder="e.g. 50"
                  style={{
                    ...inputStyle,
                    borderColor: errors.totalSlips ? BRAND.loss : BRAND.gray200,
                  }}
                />
                {errors.totalSlips && (
                  <p style={errorStyle}>{errors.totalSlips}</p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Currently Vacant Slips *</label>
                <input
                  className="calc-input"
                  type="number"
                  min={1}
                  value={vacantSlips}
                  onChange={(e) => {
                    setVacantSlips(e.target.value);
                    if (errors.vacantSlips)
                      setErrors((prev) => ({ ...prev, vacantSlips: undefined }));
                  }}
                  placeholder="e.g. 8"
                  style={{
                    ...inputStyle,
                    borderColor: errors.vacantSlips ? BRAND.loss : BRAND.gray200,
                  }}
                />
                {errors.vacantSlips && (
                  <p style={errorStyle}>{errors.vacantSlips}</p>
                )}
              </div>
            </div>

            {/* Average Monthly Rate */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Average Monthly Slip Rate *</label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 15,
                    color: BRAND.gray500,
                    fontWeight: 600,
                    pointerEvents: "none",
                  }}
                >
                  $
                </span>
                <input
                  className="calc-input"
                  type="number"
                  min={1}
                  value={avgMonthlyRate}
                  onChange={(e) => {
                    setAvgMonthlyRate(e.target.value);
                    if (errors.avgMonthlyRate)
                      setErrors((prev) => ({ ...prev, avgMonthlyRate: undefined }));
                  }}
                  placeholder="e.g. 1800"
                  style={{
                    ...inputStyle,
                    paddingLeft: 28,
                    borderColor: errors.avgMonthlyRate ? BRAND.loss : BRAND.gray200,
                  }}
                />
              </div>
              {errors.avgMonthlyRate && (
                <p style={errorStyle}>{errors.avgMonthlyRate}</p>
              )}
            </div>

            {/* Vacancy Months Slider */}
            <div style={fieldStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  Avg. Months Vacant Per Year
                </label>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: BRAND.teal,
                    background: BRAND.tealPale,
                    padding: "3px 10px",
                    borderRadius: 999,
                  }}
                >
                  {avgVacancyMonths} {avgVacancyMonths === 1 ? "month" : "months"}
                </span>
              </div>
              <input
                type="range"
                className="slider-track"
                min={1}
                max={12}
                value={avgVacancyMonths}
                onChange={(e) => setAvgVacancyMonths(parseInt(e.target.value))}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                  fontSize: 12,
                  color: BRAND.gray400,
                }}
              >
                <span>1 month</span>
                <span>12 months</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="calc-btn"
              style={{
                width: "100%",
                padding: "15px 24px",
                background: BRAND.navy,
                color: BRAND.white,
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                marginTop: 4,
                letterSpacing: "0.01em",
              }}
            >
              Calculate My Lost Revenue →
            </button>
          </form>
        </div>

        {/* ── RESULTS PANEL ── */}
        {showResults && results && (
          <div
            ref={resultsRef}
            style={{
              maxWidth: 680,
              margin: "28px auto 0",
              animation: "fadeSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {/* Main loss card */}
            <div
              style={{
                background: BRAND.white,
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                padding: "28px 28px 24px",
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: BRAND.gray400,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Your Annual Vacancy Loss
              </p>

              {/* Big loss number */}
              <div
                style={{
                  fontSize: "clamp(40px, 8vw, 64px)",
                  fontWeight: 800,
                  color: BRAND.loss,
                  lineHeight: 1,
                  marginBottom: 6,
                  letterSpacing: "-0.03em",
                }}
              >
                {fmt.format(displayedLoss)}
              </div>
              <p style={{ fontSize: 14, color: BRAND.gray500, marginBottom: 24 }}>
                leaving your marina every year
              </p>

              {/* Supporting stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    background: BRAND.gray50,
                    borderRadius: 10,
                    padding: "14px 16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: BRAND.loss,
                      marginBottom: 4,
                    }}
                  >
                    {fmt.format(displayedDaily)}
                  </div>
                  <div style={{ fontSize: 12, color: BRAND.gray500 }}>per day</div>
                </div>
                <div
                  style={{
                    background: BRAND.gray50,
                    borderRadius: 10,
                    padding: "14px 16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: BRAND.loss,
                      marginBottom: 4,
                    }}
                  >
                    {fmt.format(displayedPerSlip)}
                  </div>
                  <div style={{ fontSize: 12, color: BRAND.gray500 }}>
                    per vacant slip/year
                  </div>
                </div>
              </div>

              {/* Occupancy bar */}
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.gray600 }}>
                    Current Occupancy
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.tealDark }}>
                    {results.occupancyRate.toFixed(1)}%
                  </span>
                </div>
                <div
                  style={{
                    background: BRAND.gray200,
                    borderRadius: 999,
                    height: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={
                      {
                        height: "100%",
                        borderRadius: 999,
                        background: `linear-gradient(90deg, ${BRAND.teal}, ${BRAND.tealDark})`,
                        "--target-width": `${results.occupancyRate.toFixed(1)}%`,
                        animation:
                          "fillBar 1.2s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                  }}
                >
                  <span style={{ fontSize: 12, color: BRAND.tealDark }}>
                    {results.occupancyRate.toFixed(1)}% occupied
                  </span>
                  <span style={{ fontSize: 12, color: BRAND.loss }}>
                    {(100 - results.occupancyRate).toFixed(1)}% vacant
                  </span>
                </div>
              </div>
            </div>

            {/* Recovery potential */}
            <div
              style={{
                background: BRAND.white,
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                padding: "24px 28px",
                marginBottom: 16,
                borderTop: `3px solid ${BRAND.recovery}`,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: BRAND.gray400,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                }}
              >
                What EasyDock Could Recover For You
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "rgba(22,163,74,0.05)",
                    border: "1px solid rgba(22,163,74,0.15)",
                    borderRadius: 12,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: BRAND.recovery,
                      marginBottom: 4,
                    }}
                  >
                    {fmt.format(results.recoveryConservative)}
                  </div>
                  <div style={{ fontSize: 12, color: BRAND.gray500 }}>
                    conservative (50% recovery)
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(22,163,74,0.08)",
                    border: "1px solid rgba(22,163,74,0.2)",
                    borderRadius: 12,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: BRAND.recovery,
                      marginBottom: 4,
                    }}
                  >
                    {fmt.format(results.recoveryOptimistic)}
                  </div>
                  <div style={{ fontSize: 12, color: BRAND.gray500 }}>
                    optimistic (80% recovery)
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: BRAND.gray400,
                  marginTop: 12,
                  fontStyle: "italic",
                }}
              >
                Based on marina operators who listed on EasyDock in{" "}
                {region || "your region"}.
              </p>
            </div>

            {/* Region insight */}
            {region && (
              <div
                style={{
                  background: "rgba(43,168,157,0.06)",
                  border: "1px solid rgba(43,168,157,0.18)",
                  borderRadius: 12,
                  padding: "14px 18px",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill={BRAND.teal} opacity="0.15" />
                  <path
                    d="M10 6V10.5L12.5 13"
                    stroke={BRAND.teal}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ fontSize: 14, color: BRAND.tealDark }}>
                  <strong>{REGION_COUNTS[region]} active boat owners</strong> are
                  searching for slips in {region} on EasyDock right now.
                </span>
              </div>
            )}

            {/* ── SUCCESS MESSAGE (shown after modal submit) ── */}
            {emailSubmitted && (
              <div
                style={{
                  background: BRAND.tealPale,
                  border: `1.5px solid rgba(43,168,157,0.3)`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  animation: "fadeIn 0.4s ease both",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="11" fill={BRAND.teal} />
                  <path
                    d="M6.5 11.5L9 14L15.5 7.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ fontSize: 15, color: BRAND.tealDark, fontWeight: 600 }}>
                  Report on its way! Check your inbox in the next few minutes.
                </span>
              </div>
            )}

            {/* ── FINAL CTA ── */}
            {showFinalCTA && (
              <div
                style={{
                  background: `linear-gradient(135deg, ${BRAND.navyDark} 0%, ${BRAND.navy} 70%)`,
                  borderRadius: 20,
                  padding: "44px 36px 48px",
                  textAlign: "center",
                  marginBottom: 60,
                  animation: "fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Dot pattern */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: BRAND.tealLight,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 12,
                    }}
                  >
                    Next Step
                  </p>
                  <h3
                    style={{
                      fontSize: "clamp(22px, 4vw, 32px)",
                      fontWeight: 800,
                      color: BRAND.white,
                      lineHeight: 1.2,
                      marginBottom: 12,
                    }}
                  >
                    Ready to Fill Those Slips?
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.65)",
                      marginBottom: 28,
                      maxWidth: 420,
                      margin: "0 auto 28px",
                    }}
                  >
                    Join EasyDock free for 90 days. No setup fees. We bring the
                    boaters — you keep the revenue.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 12,
                    }}
                  >
                    <Link
                      href="/signup"
                      className="teal-btn"
                      style={{
                        display: "inline-block",
                        padding: "14px 28px",
                        background: BRAND.teal,
                        color: BRAND.white,
                        borderRadius: 10,
                        fontSize: 16,
                        fontWeight: 700,
                        textDecoration: "none",
                        letterSpacing: "0.01em",
                      }}
                    >
                      Get Started Free
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── LEAD CAPTURE MODAL ── */}
      {showModal && !emailSubmitted && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11,36,69,0.72)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            animation: "backdropIn 0.3s ease both",
          }}
        >
          <div
            style={{
              background: BRAND.white,
              borderRadius: 20,
              boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
              padding: "36px 32px 32px",
              width: "100%",
              maxWidth: 460,
              position: "relative",
              animation: "modalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {/* Teal accent bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${BRAND.teal}, ${BRAND.tealLight})`,
                borderRadius: "20px 20px 0 0",
              }}
            />

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  background: "rgba(220,38,38,0.08)",
                  borderRadius: 999,
                  marginBottom: 14,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke={BRAND.loss} strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5" stroke={BRAND.loss} strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5" stroke={BRAND.loss} strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: BRAND.navy,
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                Your full report is ready
              </h3>
              {results && (
                <p style={{ fontSize: 14, color: BRAND.gray500, lineHeight: 1.5 }}>
                  You&apos;re losing{" "}
                  <strong style={{ color: BRAND.loss }}>
                    {fmt.format(results.annualLoss)}
                  </strong>{" "}
                  per year in vacant slips. Enter your info and we&apos;ll send
                  your free branded PDF summary.
                </p>
              )}
            </div>

            <form onSubmit={handleEmailSubmit} noValidate>
              <div style={fieldStyle}>
                <label style={labelStyle}>Email *</label>
                <input
                  className="calc-input"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourmarina.com"
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    className="calc-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(305) 555-0100"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Your Role</label>
                  <select
                    className="calc-input"
                    value={captureRole}
                    onChange={(e) => setCaptureRole(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">Select…</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {submitError && (
                <p style={{ color: BRAND.loss, fontSize: 13, marginBottom: 12 }}>
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !email}
                className="teal-btn"
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  background: submitting || !email ? BRAND.gray300 : BRAND.teal,
                  color: BRAND.white,
                  border: "none",
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: submitting || !email ? "not-allowed" : "pointer",
                  letterSpacing: "0.01em",
                  marginBottom: 12,
                }}
              >
                {submitting ? "Sending…" : "Send My Free Report →"}
              </button>

              <p style={{ textAlign: "center", margin: 0 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 13,
                    color: BRAND.gray400,
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  No thanks, I&apos;ll skip the report
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
