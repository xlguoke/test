import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    spacing: {
      "1": "8px",
      "2": "16px",
      "3": "24px",
      "4": "32px",
      "5": "40px",
      "6": "48px",
      "7": "56px",
      "8": "64px"
    },
    extend: {
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
        "4xl": "36px",
        "5xl": "48px",
        "6xl": "60px",
        "7xl": "72px",
        "8xl": "96px",
        "9xl": "128px"
      }
    }
  },
  plugins: []
}
export default config
