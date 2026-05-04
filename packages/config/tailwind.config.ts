import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "../../apps/*/src/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted:   "#f8fafc",
          border:  "#e2e8f0",
        },
        text: {
          DEFAULT: "#0f172a",
          muted:   "#64748b",
          inverse: "#ffffff",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        error:   "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      boxShadow: {
        card: "0 2px 8px 0 rgba(0,0,0,0.08)",
        dropdown: "0 8px 24px 0 rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [typography, forms],
};

export default config;