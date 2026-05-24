import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      /* ── Typographic scale ──────────────────────────────────────────────── */
      fontFamily: {
        sans: [
          '"Inter var"',
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif"
        ]
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        xs:   ["0.75rem",  { lineHeight: "1.25rem" }],
        sm:   ["0.8125rem", { lineHeight: "1.375rem" }],
        base: ["0.9375rem", { lineHeight: "1.6rem" }]
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter:  "-0.025em",
        tight:    "-0.015em",
        normal:   "-0.01em",
        wide:     "0.02em",
        wider:    "0.06em",
        widest:   "0.12em"
      },

      /* ── Brand colours ──────────────────────────────────────────────────── */
      colors: {
        ink:      "#14213d",
        registry: "#0f766e",
        parchment:"#f8faf7",
        surface: {
          950: "#02060f",
          900: "#050b18",
          800: "#0b1628",
          700: "#0f1e36",
          600: "#142244",
          500: "#1a2a52"
        },
        brand: {
          blue:       "#3b82f6",
          "blue-light": "#60a5fa",
          "blue-dark":  "#1d4ed8",
          teal:         "#10b981",
          "teal-light": "#34d399",
          "teal-dark":  "#059669"
        }
      },

      /* ── Shadows ────────────────────────────────────────────────────────── */
      boxShadow: {
        panel:
          "0 12px 30px rgba(20, 33, 61, 0.08)",
        glass:
          "0 8px 32px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255,255,255,0.06)",
        "card-rest":
          "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover":
          "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.07)",
        glow:
          "0 0 20px rgba(59, 130, 246, 0.18)",
        "glow-lg":
          "0 0 40px rgba(59, 130, 246, 0.25)",
        "glow-teal":
          "0 0 20px rgba(16, 185, 129, 0.22)",
        "glow-teal-lg":
          "0 0 40px rgba(16, 185, 129, 0.3)",
        "inner-highlight":
          "inset 0 1px 0 rgba(255,255,255,0.08)"
      },

      /* ── Timing functions ───────────────────────────────────────────────── */
      transitionTimingFunction: {
        spring:   "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth:   "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out": "cubic-bezier(0.65, 0, 0.35, 1)"
      },
      transitionDuration: {
        "0":   "0ms",
        fast:  "120ms",
        base:  "200ms",
        slow:  "350ms",
        slower:"500ms"
      },

      /* ── Background images ──────────────────────────────────────────────── */
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
        "gradient-brand-hover":
          "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
        "gradient-dark":
          "linear-gradient(180deg, #050b18 0%, #0b1628 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(16,185,129,0.03) 100%)",
        "gradient-glow":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 70%)",
        "gradient-glow-teal":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.15) 0%, transparent 70%)",
        "gradient-card-top":
          "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)"
      },

      /* ── Blur ───────────────────────────────────────────────────────────── */
      backdropBlur: {
        xs:  "2px",
        sm:  "8px",
        md:  "16px",
        lg:  "24px"
      },

      /* ── Animations ─────────────────────────────────────────────────────── */
      animation: {
        "fade-in":      "fadeIn 200ms ease-out both",
        "slide-up":     "slideUpFade 350ms cubic-bezier(0.16,1,0.3,1) both",
        "slide-right":  "slideRightFade 300ms cubic-bezier(0.16,1,0.3,1) both",
        "pulse-glow":   "pulseGlow 2.5s ease-in-out infinite",
        "spin-slow":    "spin 3s linear infinite",
        shimmer:        "shimmer 1.6s ease-in-out infinite",
        "bounce-gentle":"bounceGentle 1s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUpFade: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideRightFade: {
          "0%":   { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(59,130,246,0.2)" },
          "50%":      { boxShadow: "0 0 24px rgba(59,130,246,0.5)" }
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to:   { backgroundPosition: "200% 0" }
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-3px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
