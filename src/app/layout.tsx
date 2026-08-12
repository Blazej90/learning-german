import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/features/auth/auth-provider";
import { RegisterServiceWorker } from "@/features/pwa/register-service-worker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Niemiecki",
    template: "%s · Niemiecki",
  },
  description: "Fiszki z powtórkami i tracker 4-tygodniowego planu nauki niemieckiego.",
  // iOS ignores the manifest's display mode; this is what makes an installed
  // app open without Safari's chrome.
  appleWebApp: {
    capable: true,
    title: "Niemiecki",
    statusBarStyle: "default",
  },
  other: {
    // Next emits only the modern `mobile-web-app-capable`. iOS before 16.4 has
    // no manifest support at all and reads this legacy name instead — one line
    // to keep older iPhones opening the app full-screen.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  // The tinted browser bar has to follow the theme, or it fights the page.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
