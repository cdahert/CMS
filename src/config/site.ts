export const siteConfig = {
  name: "GenioX Commerce",
  description:
    "Plataforma de marketplace B2B para comercios - elgeniox.com",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.jpg",
  domain: "elgeniox.com",
} as const;
