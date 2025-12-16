import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://rainbowvis.space",
  integrations: [mdx(), sitemap()],
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
});
