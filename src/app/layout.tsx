import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "GenioX Commerce",
    template: "%s | GenioX Commerce",
  },
  description:
    "Plataforma de marketplace B2B para comercios - elgeniox.com",
  keywords: [
    "marketplace",
    "B2B",
    "comercio",
    "GenioX",
    "Bolivia",
    "ecommerce",
  ],
  authors: [{ name: "GenioX Team" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "es_BO",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "GenioX Commerce",
    title: "GenioX Commerce",
    description:
      "Plataforma de marketplace B2B para comercios - elgeniox.com",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster
            theme="dark"
            position="top-right"
            richColors
            closeButton
          />
        </Providers>
      </body>
    </html>
  );
}
