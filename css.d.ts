declare module "*.css";

declare module "@sutra-ui/tokens/tailwind-preset" {
  import type { Config } from "tailwindcss";
  const preset: Partial<Config>;
  export default preset;
}
