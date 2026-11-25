import type { Config } from "tailwindcss";
import preset from "@sutra-ui/tokens/tailwind-preset";

const config: Config = {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        page: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
