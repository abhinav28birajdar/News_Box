// tailwind.config.js
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}" // Adjust if your components are elsewhere
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B21A8', 
        secondary: '#4A044E',
        accent: '#C026D3',
        lightBg: '#F3E8FF', 
        sosRed: '#DC2626',
      }
    },
  },
  plugins: [],
}