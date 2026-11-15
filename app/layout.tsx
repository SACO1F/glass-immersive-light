import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Schibsted_Grotesk,
} from "next/font/google";
import Script from "next/script";
import { PointerSpotlight } from "@/components/site/pointer-spotlight";
import { SiteBackdrop } from "@/components/site/site-backdrop";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteDescription, siteName, siteOgAlt, siteUrl } from "@/lib/site";
import { OpticalProvider } from "@/lib/tier/provider";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const themeInitScript = `
(function () {
  try {
    var key = "il-theme";
    var query = new URLSearchParams(window.location.search).get("theme");
    var stored = window.localStorage.getItem(key);
    var theme = query === "light" || query === "dark"
      ? query
      : stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    document.documentElement.dataset.theme = theme;
  } catch (error) {}
})();
`;

const defaultTitle = "ImmersiveLight — 物理光学灵感动效组件库";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: defaultTitle,
    template: "%s · ImmersiveLight",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: ["React", "组件库", "光感", "动效", "物理光学", "CSS", "WebGL"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName,
    title: defaultTitle,
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteOgAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteDescription,
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: "#05070b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <a className="skip-link" href="#main-content">
          跳到主要内容
        </a>
        <SiteBackdrop />
        <PointerSpotlight />
        <OpticalProvider>
          <SiteHeader />
          <main id="main-content" className="site-main">
            {children}
          </main>
          <SiteFooter />
        </OpticalProvider>
      </body>
    </html>
  );
}
