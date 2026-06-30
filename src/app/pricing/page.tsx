"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";

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
};

const Check = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill={BRAND.teal} opacity="0.12" />
    <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke={BRAND.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Anchor = () => (
  <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="22" r="10" stroke={BRAND.teal} strokeWidth="6" fill="none" />
    <line x1="50" y1="32" x2="50" y2="88" stroke={BRAND.teal} strokeWidth="6" strokeLinecap="round" />
    <path d="M20 65 C20 65, 20 88, 50 88 C80 88, 80 65, 80 65" stroke={BRAND.teal} strokeWidth="6" fill="none" strokeLinecap="round" />
    <line x1="38" y1="52" x2="62" y2="52" stroke={BRAND.teal} strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const tiers = [
  {
    name: "Starter",
    badge: null,
    price: 99,
    commission: 12,
    slips: "10",
    featured: false,
    features: [
      "Up to 10 slip listings",
      "Basic dashboard & reporting",
      "Standard search placement",
      "Email support",
      "Stripe payouts within 7 days",
    ],
    cta: "Start free trial",
  },
  {
    name: "Standard",
    badge: "Most popular",
    price: 199,
    commission: 10,
    slips: "20",
    featured: false,
    features: [
      "Up to 20 slip listings",
      "Enhanced reporting & insights",
      "Boosted search placement",
      "Email + chat support",
      "Stripe payouts within 5 days",
    ],
    cta: "Start free trial",
  },
  {
    name: "Premium",
    badge: "Best value",
    price: 249,
    commission: 6,
    slips: "Unlimited",
    featured: true,
    features: [
      "Unlimited slip listings",
      "Advanced analytics dashboard",
      "Featured search placement",
      "Verified marina badge",
      "Priority support",
      "Stripe payouts within 3 days",
      "Spotlight in emails & social",
    ],
    cta: "Start free trial",
  },
];

const faqData = [
  {
    q: "How does the 90-day free trial work?",
    a: "Sign up on any plan and get full access for 90 days with zero fees — no flat fee, no commission. You'll only start paying after the trial ends, and you can switch or cancel at any time before then.",
  },
  {
    q: "What does the boat owner service fee cover?",
    a: "Boat owners pay a 5% service fee at checkout. This covers payment processing, booking protection, and platform support. Browsing and searching is always free for boat owners.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Absolutely. You can switch plans at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle. Your listings and booking history carry over.",
  },
  {
    q: "How do Stripe payouts work?",
    a: "When a boat owner books and pays, the funds are held by Stripe and transferred to your connected bank account according to your plan's payout schedule — 7 days for Starter, 5 for Standard, and 3 for Premium.",
  },
  {
    q: "What counts as a 'slip listing'?",
    a: "Each individual dock slip you list on EasyDock counts as one listing. If you have a 30-slip marina but only want to rent out 8, you only need capacity for 8 listings.",
  },
  {
    q: "Is there a contract or commitment?",
    a: "No long-term contracts. All plans are month-to-month after the free trial. Cancel anytime — we're confident you'll stay because the platform delivers value.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  function handleCta(plan: string) {
    track("pricing_cta_clicked", { plan });
    router.push("/signup?role=marina_owner");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: BRAND.bg,
      fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
      color: BRAND.gray800,
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .tier-card {
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
        }
        .tier-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(27, 58, 107, 0.12), 0 8px 24px rgba(27, 58, 107, 0.06);
        }
        .cta-btn {
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
        }
        .cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(43, 168, 157, 0.35);
        }
        .cta-btn:active {
          transform: translateY(0);
        }
        .cta-btn-outline {
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cta-btn-outline:hover {
          background: ${BRAND.navy};
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(27, 58, 107, 0.25);
        }
        .faq-toggle {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .faq-toggle:hover {
          background: ${BRAND.gray100};
        }
        .wave-divider {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
        }
      `}</style>

      {/* Hero */}
      <div style={{
        position: "relative",
        background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyDark} 50%, ${BRAND.navy} 100%)`,
        padding: "80px 24px 120px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }} />

        <div style={{
          position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <Anchor />
            <span style={{ fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}>EasyDock</span>
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, color: "white",
            lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-1px",
          }}>
            Simple pricing.<br />
            <span style={{ color: BRAND.tealLight }}>Serious revenue.</span>
          </h1>
          <p style={{
            fontSize: "clamp(16px, 2.5vw, 20px)", color: "rgba(255,255,255,0.7)",
            lineHeight: 1.6, margin: "0 auto 32px", maxWidth: 520,
          }}>
            Start with a 90-day free trial on any plan. No credit card required. Only pay when you see the value.
          </p>

          {/* Trust pills */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12,
          }}>
            {["90-day free trial", "No contracts", "Cancel anytime"].map((t, i) => (
              <span key={i} style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 100, padding: "8px 20px",
                fontSize: 14, color: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <svg className="wave-divider" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ height: 60 }}>
          <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0Z" fill={BRAND.bg} />
        </svg>
      </div>

      {/* Pricing Cards */}
      <div style={{
        maxWidth: 1100, margin: "-40px auto 0", padding: "0 24px",
        position: "relative", zIndex: 2,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20, alignItems: "stretch",
        }}>
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className="tier-card"
              style={{
                background: BRAND.white,
                borderRadius: 16,
                border: tier.featured ? `2px solid ${BRAND.teal}` : `1px solid ${BRAND.gray200}`,
                position: "relative",
                overflow: "hidden",
                animation: visible ? `scaleIn 0.6s ${0.15 * i}s cubic-bezier(0.22, 1, 0.36, 1) both` : "none",
              }}
            >
              {/* Featured top accent */}
              {tier.featured && (
                <div style={{
                  background: `linear-gradient(135deg, ${BRAND.teal}, ${BRAND.tealDark})`,
                  padding: "10px 0",
                  textAlign: "center",
                  fontSize: 13, fontWeight: 600, color: "white",
                  letterSpacing: "0.5px",
                }}>
                  BEST VALUE
                </div>
              )}

              <div style={{ padding: "32px 28px 28px" }}>
                {/* Badge */}
                {tier.badge && !tier.featured && (
                  <span style={{
                    display: "inline-block",
                    background: tier.name === "Standard" ? "#E6F1FB" : BRAND.tealPale,
                    color: tier.name === "Standard" ? BRAND.navy : BRAND.tealDark,
                    fontSize: 12, fontWeight: 600,
                    padding: "4px 12px", borderRadius: 100,
                    marginBottom: 12,
                  }}>{tier.badge}</span>
                )}

                <h3 style={{
                  fontSize: 22, fontWeight: 700, color: BRAND.navy,
                  margin: "0 0 6px",
                }}>{tier.name}</h3>

                {/* Price */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 44, fontWeight: 700, color: BRAND.navy, letterSpacing: "-2px", lineHeight: 1 }}>
                    ${tier.price}
                  </span>
                  <span style={{ fontSize: 16, color: BRAND.gray500 }}>/month</span>
                </div>

                {/* Commission */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: BRAND.gray50, borderRadius: 8,
                  padding: "6px 12px", marginBottom: 20,
                }}>
                  <span style={{ fontSize: 14, color: BRAND.gray500 }}>+</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: BRAND.navy }}>{tier.commission}%</span>
                  <span style={{ fontSize: 13, color: BRAND.gray500 }}>commission per booking</span>
                </div>

                {/* Slip count highlight */}
                <div style={{
                  background: BRAND.gray50, borderRadius: 10,
                  padding: "12px 16px", marginBottom: 20,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 14, color: BRAND.gray500 }}>Slip listings:</span>
                  <span style={{
                    fontSize: 16, fontWeight: 700,
                    color: tier.featured ? BRAND.teal : BRAND.navy,
                  }}>{tier.slips === "Unlimited" ? "Unlimited" : `Up to ${tier.slips}`}</span>
                </div>

                {/* Features */}
                <div style={{ marginBottom: 24 }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "7px 0",
                    }}>
                      <Check />
                      <span style={{ fontSize: 14, color: BRAND.gray600, lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className={tier.featured ? "cta-btn" : "cta-btn-outline"}
                  onClick={() => handleCta(tier.name)}
                  style={{
                    width: "100%", padding: "14px 0",
                    borderRadius: 10, fontSize: 15, fontWeight: 600,
                    cursor: "pointer", border: "none",
                    ...(tier.featured ? {
                      background: `linear-gradient(135deg, ${BRAND.teal}, ${BRAND.tealDark})`,
                      color: "white",
                    } : {
                      background: "transparent",
                      color: BRAND.navy,
                      border: `1.5px solid ${BRAND.navy}`,
                    }),
                  }}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* After trial note */}
        <p style={{
          textAlign: "center", fontSize: 14, color: BRAND.gray400,
          margin: "20px 0 0", lineHeight: 1.6,
        }}>
          All plans include a 90-day free trial. Pricing applies after your trial period ends.
        </p>
      </div>

      {/* Boat Owner Section */}
      <div style={{
        maxWidth: 1100, margin: "64px auto 0", padding: "0 24px",
      }}>
        <div style={{
          background: BRAND.white,
          borderRadius: 16,
          border: `1px solid ${BRAND.gray200}`,
          overflow: "hidden",
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.navyDark}, ${BRAND.navy})`,
            padding: "32px 36px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", margin: "0 0 6px" }}>
                For boat owners
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: 0 }}>
                Browse for free. Pay only when you book.
              </p>
            </div>
            <div style={{
              background: "rgba(43,168,157,0.15)", border: "1px solid rgba(43,168,157,0.3)",
              borderRadius: 10, padding: "10px 20px",
              fontSize: 22, fontWeight: 700, color: BRAND.tealLight,
            }}>
              5% service fee
            </div>
          </div>
          <div style={{ padding: "8px 36px 28px" }}>
            {[
              { label: "Search & compare marina slips", value: "Free", free: true },
              { label: "Save favorites & set alerts", value: "Free", free: true },
              { label: "Booking service fee", value: "5% at checkout", free: false },
              { label: "Payment processing", value: "Included", free: true },
              { label: "Booking protection", value: "Included", free: true },
            ].map((row, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 0",
                borderBottom: i < 4 ? `1px solid ${BRAND.gray100}` : "none",
              }}>
                <span style={{ fontSize: 15, color: BRAND.gray600 }}>{row.label}</span>
                <span style={{
                  fontSize: 15, fontWeight: 600,
                  color: row.free ? BRAND.teal : BRAND.navy,
                }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Comparison */}
      <div style={{ maxWidth: 1100, margin: "64px auto 0", padding: "0 24px" }}>
        <h2 style={{
          fontSize: 28, fontWeight: 700, color: BRAND.navy,
          textAlign: "center", margin: "0 0 8px",
        }}>The upgrade math</h2>
        <p style={{
          fontSize: 16, color: BRAND.gray500, textAlign: "center",
          margin: "0 auto 32px", maxWidth: 480,
        }}>
          Higher plans have lower commissions. The more you book through EasyDock, the more you save by upgrading.
        </p>

        <div style={{
          background: BRAND.white, borderRadius: 16,
          border: `1px solid ${BRAND.gray200}`,
          overflow: "hidden",
        }}>
          <table style={{
            width: "100%", borderCollapse: "collapse", fontSize: 15,
          }}>
            <thead>
              <tr style={{ background: BRAND.gray50 }}>
                <th style={{ textAlign: "left", padding: "14px 20px", fontWeight: 600, color: BRAND.gray500, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px" }}>Monthly booking volume</th>
                <th style={{ textAlign: "center", padding: "14px 20px", fontWeight: 600, color: BRAND.gray500, fontSize: 13 }}>Starter cost</th>
                <th style={{ textAlign: "center", padding: "14px 20px", fontWeight: 600, color: BRAND.gray500, fontSize: 13 }}>Standard cost</th>
                <th style={{ textAlign: "center", padding: "14px 20px", fontWeight: 600, color: BRAND.tealDark, fontSize: 13 }}>Premium cost</th>
              </tr>
            </thead>
            <tbody>
              {[
                { vol: 5000 }, { vol: 10000 }, { vol: 20000 }, { vol: 40000 },
              ].map((row, i) => {
                const s = 99 + row.vol * 0.12;
                const st = 199 + row.vol * 0.10;
                const p = 249 + row.vol * 0.06;
                const minCost = Math.min(s, st, p);
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${BRAND.gray100}` }}>
                    <td style={{ padding: "14px 20px", fontWeight: 600, color: BRAND.navy }}>
                      ${row.vol.toLocaleString()}/mo
                    </td>
                    <td style={{ textAlign: "center", padding: "14px 20px", color: s === minCost ? BRAND.teal : BRAND.gray600, fontWeight: s === minCost ? 700 : 400 }}>
                      ${s.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "center", padding: "14px 20px", color: st === minCost ? BRAND.teal : BRAND.gray600, fontWeight: st === minCost ? 700 : 400 }}>
                      ${st.toLocaleString()}
                    </td>
                    <td style={{
                      textAlign: "center", padding: "14px 20px",
                      color: p === minCost ? BRAND.teal : BRAND.gray600,
                      fontWeight: p === minCost ? 700 : 400,
                      background: p === minCost ? "rgba(43,168,157,0.06)" : "transparent",
                    }}>
                      ${p.toLocaleString()}
                      {p === minCost && (
                        <span style={{ display: "block", fontSize: 11, color: BRAND.teal, marginTop: 2 }}>
                          saves ${Math.round(Math.min(s, st) - p).toLocaleString()}/mo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 720, margin: "64px auto 0", padding: "0 24px" }}>
        <h2 style={{
          fontSize: 28, fontWeight: 700, color: BRAND.navy,
          textAlign: "center", margin: "0 0 32px",
        }}>Frequently asked questions</h2>

        <div style={{
          background: BRAND.white, borderRadius: 16,
          border: `1px solid ${BRAND.gray200}`,
          overflow: "hidden",
        }}>
          {faqData.map((faq, i) => (
            <div
              key={i}
              style={{ borderTop: i > 0 ? `1px solid ${BRAND.gray100}` : "none" }}
            >
              <div
                className="faq-toggle"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "18px 24px", gap: 16,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: BRAND.gray700 }}>{faq.q}</span>
                <svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none"
                  style={{
                    flexShrink: 0,
                    transition: "transform 0.3s ease",
                    transform: openFaq === i ? "rotate(180deg)" : "rotate(0)",
                  }}
                >
                  <path d="M5 8L10 13L15 8" stroke={BRAND.gray400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{
                maxHeight: openFaq === i ? 200 : 0,
                overflow: "hidden",
                transition: "max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              }}>
                <p style={{
                  padding: "0 24px 18px",
                  fontSize: 14, lineHeight: 1.7, color: BRAND.gray500,
                  margin: 0,
                }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        maxWidth: 700, margin: "64px auto 0", padding: "0 24px 80px",
        textAlign: "center",
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.navyDark})`,
          borderRadius: 20, padding: "48px 36px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.05,
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{
              fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, color: "white",
              margin: "0 0 12px", lineHeight: 1.2,
            }}>
              Ready to fill your empty slips?
            </h2>
            <p style={{
              fontSize: 16, color: "rgba(255,255,255,0.65)",
              margin: "0 auto 28px", maxWidth: 420, lineHeight: 1.6,
            }}>
              Join EasyDock today. 90 days free, no credit card, no risk. See why marina operators across South Florida are making the switch.
            </p>
            <button
              className="cta-btn"
              onClick={() => handleCta("hero_bottom")}
              style={{
                background: `linear-gradient(135deg, ${BRAND.teal}, ${BRAND.tealDark})`,
                color: "white", border: "none", borderRadius: 10,
                padding: "16px 40px", fontSize: 16, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start your free trial
            </button>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.4)",
              margin: "14px 0 0",
            }}>No credit card required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
