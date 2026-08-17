import type { MetadataRoute } from "next";

/**
 * Served as `/manifest.webmanifest` — what the phone reads when the app is
 * added to the home screen.
 *
 * `display: "standalone"` drops the browser chrome, which is the point of
 * installing: a review session should look like an app, not like a tab.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Niemiecki — fiszki i plan nauki",
    short_name: "Niemiecki",
    description:
      "Fiszki z powtórkami i tracker 4-tygodniowego planu nauki niemieckiego.",
    lang: "pl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // sRGB of `--background` in its light theme. The manifest takes a single
    // value — there is no per-scheme form the phone reads — so the splash is
    // the light one, and the dark bar is handled by `themeColor` in the root
    // layout, which does accept a media query.
    background_color: "#fdfcf9",
    theme_color: "#fdfcf9",
    // The artwork keeps its margins inside the middle 80%, so one file serves
    // both purposes — listed twice because Next's type takes a single purpose
    // per entry, not the space-separated form the spec allows.
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
