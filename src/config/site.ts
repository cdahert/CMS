import { type NavItem } from "@/types";

export const siteConfig = {
  name: "CMS App",
  description: "A robust, scalable and secure CMS built with Next.js",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.jpg",
  links: {
    github: "https://github.com",
  },
} as const;

export const mainNav: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
  },
];
