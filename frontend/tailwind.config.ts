import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Core palette - Elegant Black & White
        background: "#050505",
        foreground: "#FAFAFA",
        
        // Primary - Pure White on Black
        primary: {
          DEFAULT: "#FAFAFA",
          foreground: "#050505",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        
        // Accent - Subtle silver/gray
        accent: {
          DEFAULT: "#A3A3A3",
          foreground: "#050505",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        
        // Card and surface colors
        card: {
          DEFAULT: "#0A0A0A",
          foreground: "#FAFAFA",
        },
        
        // Charcoal variations - refined grays
        charcoal: {
          DEFAULT: "#0F0F0F",
          50: "#2A2A2A",
          100: "#252525",
          200: "#202020",
          300: "#1A1A1A",
          400: "#151515",
          500: "#0F0F0F",
          600: "#0C0C0C",
          700: "#090909",
          800: "#050505",
          900: "#020202",
        },
        
        // Slate gray for borders
        slate: {
          DEFAULT: "#1A1A1A",
          border: "rgba(255, 255, 255, 0.06)",
        },
        
        // Semantic colors - muted elegant tones
        success: {
          DEFAULT: "#E5E5E5",
          foreground: "#050505",
        },
        warning: {
          DEFAULT: "#D4D4D4",
          foreground: "#050505",
        },
        error: {
          DEFAULT: "#DC2626",
          foreground: "#FAFAFA",
        },
        info: {
          DEFAULT: "#A3A3A3",
          foreground: "#050505",
        },
        
        // Podium colors - elegant metallic tones
        gold: "#E5E5E5",
        silver: "#A3A3A3",
        bronze: "#737373",
        
        // Border and input
        border: "rgba(255, 255, 255, 0.06)",
        input: "#151515",
        ring: "#FAFAFA",
        
        // Muted elements
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "rgba(255, 255, 255, 0.5)",
        },
        
        // Popover
        popover: {
          DEFAULT: "#0A0A0A",
          foreground: "#FAFAFA",
        },
        
        // Destructive
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FAFAFA",
        },
      },
      fontFamily: {
        sans: ["var(--font-satoshi)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-clash)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Fira Code", "monospace"],
      },
      fontSize: {
        "display-1": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-2": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display-3": ["2rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        xs: "4px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 255, 255, 0.1)",
        "glow-lg": "0 0 40px rgba(255, 255, 255, 0.15)",
        "glow-xl": "0 20px 60px rgba(255, 255, 255, 0.08)",
        card: "0 4px 24px rgba(0, 0, 0, 0.6)",
        "card-hover": "0 8px 40px rgba(255, 255, 255, 0.08)",
        "elegant": "0 1px 2px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #FAFAFA 0%, #737373 100%)",
        "gradient-hero": "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "gradient-card": "linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%)",
        "noise": "url('/images/noise.svg')",
        "grid-pattern": "url('/images/grid.svg')",
        "topography": "url('/images/topography.svg')",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 255, 255, 0.2)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "confetti": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(1000px) rotate(720deg)", opacity: "0" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-down": "fade-down 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "count-up": "count-up 0.3s ease-out",
        "confetti": "confetti 5s ease-in-out forwards",
        "gradient-shift": "gradient-shift 15s ease infinite",
      },
      transitionDuration: {
        "400": "400ms",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "128": "32rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
