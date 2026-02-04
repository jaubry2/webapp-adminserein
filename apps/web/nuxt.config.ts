import "@webapp-adminserein/env/web";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "latest",
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  devServer: {
    port: 3001,
  },
  runtimeConfig: {
    public: {
      serverUrl: process.env.NUXT_PUBLIC_SERVER_URL,
    },
  },
  app: {
    head: {
      title: "Admin Serein",
      meta: [
        { name: "description", content: "Admin Serein" },
      ],
      link: [
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Poppins:wght@300;400;500;600;700&display=swap" }
      ],
    },
  },
});
