import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";
import PreloaderWrapper from "@/components/preloader-wrapper";
import { NavbarDock } from "@/components/navbar-dock";
import { MobileBottomNavbar } from "@/components/mobile-bottom-navbar";
import { SessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { WebVitalsReporter } from "@/components/providers/web-vitals-reporter";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: env.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${env.NEXT_PUBLIC_APP_NAME}`,
  },
  description: "Event management platform for seamless event experiences",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "48x48", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "64x64", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "96x96", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: env.NEXT_PUBLIC_APP_NAME,
    description: "Event management platform for seamless event experiences",
    url: env.NEXT_PUBLIC_APP_URL,
    siteName: env.NEXT_PUBLIC_APP_NAME,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: env.NEXT_PUBLIC_APP_NAME,
    description: "Event management platform for seamless event experiences",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ToastProvider>
            <div className="hidden md:block">
              <NavbarDock />
            </div>
            <MobileBottomNavbar />
            <div className="pb-24 md:pb-0">
              <PreloaderWrapper>{children}</PreloaderWrapper>
            </div>
          </ToastProvider>
        </SessionProvider>
        <WebVitalsReporter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
