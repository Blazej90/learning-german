"use client";

import { useEffect } from "react";

/**
 * Registers `/sw.js` once the page is up.
 *
 * Development is deliberately excluded: a worker caching Turbopack's output
 * would serve yesterday's bundle and make every change look like it did not
 * happen. Renders nothing.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    // Registration competes with the first render for bandwidth, so it waits
    // for the load event — the app should be usable before it starts caching.
    const register = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // An unavailable worker costs offline support, nothing else; there is
        // nothing useful to tell the user here.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
