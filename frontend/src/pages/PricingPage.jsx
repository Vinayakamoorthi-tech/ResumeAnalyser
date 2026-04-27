import { useState } from "react";
import { getUser } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";

const RAZORPAY_KEY = "rzp_test_ShFoCQ5dY3Aj6c"; // replace with your key

const PLANS = [
  {
    name: "Free",
    price: 0,
    color: "#64748b",
    icon: "🎓",
    features: [
      "20 aptitude questions/day",
      "1 AI mock interview/month",
      "Basic resume analyzer",
      "Resume vs JD match",
      "Dashboard tracking",
    ],
    missing: [
      "Company preparation tracker",
      "GD simulator",
      "Unlimited interviews",
      "Priority AI responses",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro",
    price: 499,
    color: "#3b82f6",
    icon: "⚡",
    popular: true,
    features: [
      "Unlimited aptitude practice",
      "Unlimited AI mock interviews",
      "All interview types + company modes",
      "Resume vs JD match",
      "Company preparation tracker",
      "Advanced dashboard analytics",
      "Priority AI responses",
      "GD simulator (coming soon)",
    ],
    missing: [],
    cta: "Upgrade to Pro",
    disabled: false,
  },
  {
    name: "Team",
    price: 2999,
    color: "#818cf8",
    icon: "🏢",
    features: [
      "Everything in Pro",
      "Up to 50 student accounts",
      "Batch performance dashboard",
      "College placement coordinator access",
      "Custom interview question bank",
      "Priority support",
      "Monthly progress reports",
    ],
    missing: [],
    cta: "Contact Us",
    disabled: false,
    isTeam: true,
  },
];

function loadRazorpay(callback) {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = callback;
  document.body.appendChild(script);
}

export default function PricingPage() {
  const { theme } = useTheme();
  const user = getUser();
  const [paying, setPaying] = useState(null);
  const [success, setSuccess] = useState(null);

  function handlePayment(plan) {
    if (plan.isTeam) {
      window.location.href = "mailto:placementai@email.com?subject=Team Plan Inquiry";
      return;
    }

    setPaying(plan.name);
    loadRazorpay(() => {
      const options = {
        key: RAZORPAY_KEY,
        amount: plan.price * 100, // in paise
        currency: "INR",
        name: "PlacementAI",
        description: `${plan.name} Plan - Monthly Subscription`,
        image: "https://via.placeholder.com/80x80?text=AI",
        prefill: {
          name:  user?.name  || "Student",
          email: user?.email || "student@email.com",
        },
        theme: { color: "#3b82f6" },
        handler: function (response) {
          setPaying(null);
          setSuccess({
            plan: plan.name,
            paymentId: response.razorpay_payment_id,
          });
        },
        modal: {
          ondismiss: () => setPaying(null),
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px 80px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Success modal */}
      {success && (
        <div style={{ position: "fixed", inset: 0, background: "#00000099", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: theme.surface, border: "1px solid #166534", borderRadius: "20px", padding: "40px 36px", maxWidth: "420px", width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>🎉</div>
            <h2 style={{ color: "#4ade80", fontWeight: 800, marginBottom: "8px" }}>Payment Successful!</h2>
            <p style={{ color: theme.textMuted, fontSize: "13px", marginBottom: "16px" }}>
              You are now on the <strong style={{ color: theme.textPrimary }}>{success.plan} Plan</strong>
            </p>
            <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "12px", marginBottom: "24px" }}>
              <div style={{ color: theme.textMuted, fontSize: "11px", marginBottom: "4px" }}>PAYMENT ID</div>
              <div style={{ color: "#93c5fd", fontSize: "12px", fontFamily: "monospace" }}>{success.paymentId}</div>
            </div>
            <button onClick={() => setSuccess(null)} style={{
              width: "100%", padding: "12px",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "14px", fontWeight: 700, cursor: "pointer",
            }}>Continue →</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ display: "inline-block", background: theme.surface, color: theme.primary, border: `1px solid ${theme.border}`, padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "12px" }}>PRICING</div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: theme.textPrimary, marginBottom: "12px" }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: "15px", maxWidth: "480px", margin: "0 auto" }}>
          Start free. Upgrade when you need more. No hidden fees.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "48px" }}>
        {PLANS.map(plan => (
          <div key={plan.name} style={{
            background: plan.popular ? `linear-gradient(135deg, ${theme.surface}, ${theme.bg})` : theme.surface,
            border: `1px solid ${plan.popular ? plan.color : theme.border}`,
            borderRadius: "20px", padding: "28px 24px",
            position: "relative", transition: "transform 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {plan.popular && (
              <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", padding: "3px 16px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}>
                ⭐ MOST POPULAR
              </div>
            )}

            <div style={{ fontSize: "32px", marginBottom: "10px" }}>{plan.icon}</div>
            <div style={{ color: plan.color, fontWeight: 700, fontSize: "13px", letterSpacing: "1px", marginBottom: "6px" }}>{plan.name.toUpperCase()}</div>
            <div style={{ marginBottom: "20px" }}>
              <span style={{ color: theme.textPrimary, fontSize: "40px", fontWeight: 900, fontFamily: "monospace" }}>
                {plan.price === 0 ? "₹0" : `₹${plan.price}`}
              </span>
              <span style={{ color: theme.textMuted, fontSize: "13px" }}>/month</span>
            </div>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "#22c55e", fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <span style={{ color: theme.textSecondary, fontSize: "13px", lineHeight: "1.5" }}>{f}</span>
                </div>
              ))}
              {plan.missing.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", opacity: 0.4 }}>
                  <span style={{ color: theme.textMuted, fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✗</span>
                  <span style={{ color: theme.textMuted, fontSize: "13px", lineHeight: "1.5", textDecoration: "line-through" }}>{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => !plan.disabled && handlePayment(plan)}
              disabled={plan.disabled || paying === plan.name}
              style={{
                width: "100%", padding: "12px",
                background: plan.disabled ? theme.border : paying === plan.name ? theme.surface : `linear-gradient(135deg, ${plan.color}, #6366f1)`,
                color: plan.disabled ? theme.textMuted : "#fff",
                border: plan.disabled ? `1px solid ${theme.border}` : "none",
                borderRadius: "10px", fontSize: "13px", fontWeight: 700,
                cursor: plan.disabled ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {paying === plan.name ? "Opening checkout…" : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Test card info */}
      <div style={{ background: theme.surface, border:  `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px" }}>
        <div style={{ color: "#93c5fd", fontWeight: 700, fontSize: "13px", marginBottom: "12px" }}>🧪 Test Mode — Use these test card details</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          {[
            ["Card Number", "4111 1111 1111 1111"],
            ["Expiry", "Any future date"],
            ["CVV", "Any 3 digits"],
            ["OTP", "Enter any value"],
          ].map(([label, value]) => (
            <div key={label} style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: 700, letterSpacing: "1px", marginBottom: "4px" }}>{label}</div>
              <div style={{ color: theme.textPrimary, fontSize: "13px", fontFamily: "monospace" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}