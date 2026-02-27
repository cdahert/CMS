import { z } from "zod";

/**
 * Server-side environment variable validation.
 * This file should ONLY be imported in server-side code.
 *
 * Run at startup to catch missing or malformed env vars early.
 */

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  // DATABASE_URL: z.string().url(),
  // AUTH_SECRET: z.string().min(32),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
});

function createEnv() {
  const isServer = typeof window === "undefined";

  if (isServer) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error(
        "❌ Invalid server environment variables:",
        parsed.error.flatten().fieldErrors
      );
      // In production, throw to prevent startup with invalid config
      if (process.env.NODE_ENV === "production") {
        throw new Error("Invalid server environment variables");
      }
    }
  }

  const clientParsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });

  if (!clientParsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      clientParsed.error.flatten().fieldErrors
    );
  }

  return {
    // Server-only
    NODE_ENV: process.env.NODE_ENV as "development" | "test" | "production",
    // DATABASE_URL: process.env.DATABASE_URL!,
    // AUTH_SECRET: process.env.AUTH_SECRET!,

    // Client-safe
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "CMS App",
  };
}

export const env = createEnv();
