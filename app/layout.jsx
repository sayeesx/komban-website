import "./globals.css";
import { Metal_Mania, Red_Rose } from "next/font/google";
import { framePath, PRELOAD_FIRST_FRAMES } from "@/lib/framesConfig";

// Metal Mania — headings & section titles
const metalMania = Metal_Mania({
  weight: "400",       // only weight available
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Red Rose — subtitles, descriptions, all body copy
const redRose = Red_Rose({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Komban - one team one fight",
  description:
    "One team. One fight. Bold buses, custom design, and premium interiors — Kerala's fleet built for the road.",
  // ── Favicons — all files live in /public ──────────────────────────
  icons: {
    // Browser tab (fallback)
    shortcut: "/favicon.ico",
    // Standard web favicons
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    // iOS home screen icon
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    // Android / PWA (referenced by site.webmanifest)
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${metalMania.variable} ${redRose.variable}`}>
      <head>
        {/* Preload first N animation frames so the scroll canvas is ready instantly */}
        {Array.from({ length: PRELOAD_FIRST_FRAMES }, (_, i) => (
          <link
            key={i}
            rel="preload"
            as="image"
            href={framePath(i + 1)}
            type="image/webp"
          />
        ))}
      </head>
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
