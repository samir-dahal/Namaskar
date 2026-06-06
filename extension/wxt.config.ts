import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Namaskar — Nepali New Tab",
    description:
      "Beautiful Nepali new tab with Bikram Sambat date, festivals, and Nepal photography.",
    icons: {
      "16": "/icon-16.png",
      "32": "/icon-32.png",
      "48": "/icon-48.png",
      "128": "/icon-128.png",
    },
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
