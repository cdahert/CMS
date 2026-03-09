"use client";

import { Shield, Store } from "lucide-react";
import { createClient } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MainLogin() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const role = sessionStorage.getItem("gx-login-role");
      if (role === "admin") {
        router.replace("/admin");
      } else if (role === "commerce") {
        router.replace("/comercios/dashboard");
      }
    }

    checkSession();
  }, [router]);

  const handleLogin = async (role: "admin" | "commerce") => {
    sessionStorage.setItem("gx-login-role", role);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { prompt: "select_account" },
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="gradient-primary mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
          GenioX Commerce
        </h1>
        <p className="text-lg text-muted-foreground">
          Plataforma de marketplace B2B
        </p>
      </motion.div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => handleLogin("admin")}
          className="group flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-card-foreground">
              Administrador
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestión del marketplace
            </p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => handleLogin("commerce")}
          className="group flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-card-foreground">
              Comercio
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Autoatención para tiendas
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
