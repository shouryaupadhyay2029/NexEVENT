/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#111111",
        surface: "#171717",
        elevated: "#202020",
        border: "rgba(255, 255, 255, 0.05)",
        divider: "rgba(255, 255, 255, 0.04)",
        primary: "#F2F2F2",
        secondary: "#B0B0B0",
        muted: "#777777",
        accent: {
          DEFAULT: "#C96A2B",
          hover: "#E07A35"
        }
      },
      fontFamily: {
        display: ['"General Sans"', "sans-serif"],
        ui: ['Inter', "sans-serif"],
        technical: ['"JetBrains Mono"', "monospace"],
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
        'tech-label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'metadata': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.04em', fontWeight: '400' }],
      },
      boxShadow: {
        'subtle': '0 4px 20px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
