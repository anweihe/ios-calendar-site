import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://anweihe.github.io",
  base: "/ios-calendar-site",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
});
