import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Namaskar — Nepali New Tab",
    description:
      "Beautiful Nepali new tab with Bikram Sambat date, festivals, and Nepal photography.",
    version: "0.1.0",
    permissions: ["storage", "alarms"],
    host_permissions: ["https://api.open-meteo.com/*"],
    browser_specific_settings: {
      gecko: {
        id: "namaskar@namaskar.app",
        strict_min_version: "109.0",
      },
    },
  },
});
