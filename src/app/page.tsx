"use client";

import { useState } from "react";
import { Shield, Store } from "lucide-react";
import { createClient } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MainLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "commerce" | null>(
    null
  );

  const handleLogin = async () => {
    if (!selectedRole) {
      toast.error("Selecciona un rol para continuar.");
      return;
    }
    if (!email || !password) {
      toast.error("Ingresa email y contraseña.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Error al iniciar sesión: " + error.message);
      setLoading(false);
      return;
    }

    sessionStorage.setItem("gx-login-role", selectedRole);
    if (selectedRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/comercios/dashboard");
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="gradient-primary mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
          GenioX Commerce
        </h1>
        <p className="text-lg text-muted-foreground">
          Plataforma de marketplace B2B
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
              selectedRole === "admin"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Shield
              className={`h-6 w-6 ${selectedRole === "admin" ? "text-primary" : "text-muted-foreground"}`}
            />
            <span
              className={`text-sm font-medium ${selectedRole === "admin" ? "text-primary" : "text-muted-foreground"}`}
            >
              Administrador
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("commerce")}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
              selectedRole === "commerce"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Store
              className={`h-6 w-6 ${selectedRole === "commerce" ? "text-primary" : "text-muted-foreground"}`}
            />
            <span
              className={`text-sm font-medium ${selectedRole === "commerce" ? "text-primary" : "text-muted-foreground"}`}
            >
              Comercio
            </span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClasses}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </motion.div>
    </div>
  );
}
