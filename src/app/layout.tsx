import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "CMS App",
    template: "%s | CMS App",
  },
  description: "A robust CMS application built with Next.js",
  keywords: ["CMS", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "CMS Team" }],
  creator: "CMS Team",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "CMS App",
    title: "CMS App",
    description: "A robust CMS application built with Next.js",
  },
  twitter: {
    card: "summary_large_image",
    title: "CMS App",
    description: "A robust CMS application built with Next.js",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
