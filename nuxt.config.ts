import { gitDescribeSync } from "git-describe";

export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxthub/core", "nuxt-auth-utils", "@vueuse/nuxt"],
  compatibilityDate: "2025-02-05",
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  imports: {
    dirs: ["types"],
  },
  nitro: {
    imports: {
      dirs: ["types"],
    },
  },
  runtimeConfig: {
    public: {
      commitHash: gitDescribeSync().hash,
    },
  },
  hub: {
    database: true,
    blob: true,
  },
});
