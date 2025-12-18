export const SITE_TITLE = "Rainbow's Creations";
export const SITE_DESCRIPTION =
  "Products, Artwork, VRChat assets, Terraria mods, and Commissions — all in one place!";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/products", label: "Products" },
  { href: "/commissions", label: "Commissions" },
  { href: "/wips", label: "W.I.P's" },
  { href: "/updates", label: "Updates" },
  { href: "/tos", label: "T.O.S / Avatars I Own" },
  { href: "/contact", label: "Contacts" },
];

/**
 * Simple versioning idea:
 * - v0.x while you're building the site
 * - bump minor when you add a new page/feature
 */
export const SITE_UPDATES = [
  {
    version: "v0.4.0",
    date: "2025-12-17",
    title: "Site stabilized + commissions flow",
    notes: [
      "Cloudflare build issues resolved",
      "Commission form + success page styling",
      "Layout polish + navigation cleanup",
    ],
  },
  {
    version: "v0.3.0",
    date: "2025-12-16",
    title: "Neon layout refresh",
    notes: ["New neon cards", "Gallery/WIPs layout pass", "General styling tweaks"],
  },
];
