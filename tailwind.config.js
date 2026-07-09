/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0d0d",
        surface: "#141414",
        elevated: "#1c1c1c",
        border: "rgba(255, 255, 255, 0.08)",
        divider: "rgba(255, 255, 255, 0.04)",
        primary: "rgba(255, 255, 255, 0.96)",
        body: "rgba(255, 255, 255, 0.82)",
        secondary: "rgba(255, 255, 255, 0.60)",
        muted: "rgba(255, 255, 255, 0.45)",
        disabled: "rgba(255, 255, 255, 0.28)",
        accent: {
          DEFAULT: "#C96A2B",
          hover: "#E07A35"
        }
      },
      fontFamily: {
        display: ['"General Sans"', "sans-serif"],
        ui: ['Inter', "sans-serif"],
        technical: ['"Space Mono"', "monospace"],
      },
      fontSize: {
        // [fontSize, { lineHeight, letterSpacing, fontWeight }]
        'display-xl': ['5rem', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '600' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '500' }],
        'section-heading': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '500' }],
        'heading': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '500' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '400' }],
        'tech-label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '700' }],
        'metadata': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '400' }],
      },
      boxShadow: {
        'subtle': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '180': '180ms',
        '220': '220ms',
        '320': '320ms',
        '450': '450ms',
      }
    },
  },
  plugins: [],
}
