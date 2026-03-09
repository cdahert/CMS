"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Store } from "lucide-react";
import { createClient } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormData {
  name: string;
  ruc: string;
  email: string;
  phone: string;
  address: string;
}

export default function ComerciosRegistro() {
  const [form, setForm] = useState<FormData>({
    name: "",
    ruc: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoogleRegister = async () => {
    if (!form.name.trim()) {
      toast.error("Ingresa el nombre de tu comercio antes de continuar.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Store form data in localStorage to use after OAuth callback
      localStorage.setItem(
        "genioxCommerceRegistration",
        JSON.stringify(form)
      );

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/comercios/registro?callback=true`,
        },
      });

      if (error) {
        toast.error("Error al registrar: " + error.message);
        setLoading(false);
      }
    } catch {
      toast.error("Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  // Handle OAuth callback: create commerce + member
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("callback") !== "true") return;

    const stored = localStorage.getItem("genioxCommerceRegistration");
    if (!stored) return;

    const data: FormData = JSON.parse(stored);

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Create commerce
      const { data: commerce, error: commerceError } = await supabase
        .from("commerces")
        .insert({
          name: data.name,
          ruc: data.ruc || null,
          email: data.email || user.email || null,
          phone: data.phone || null,
          address: data.address || null,
          owner_id: user.id,
        })
        .select("id")
        .single();

      if (commerceError) {
        toast.error("Error al crear el comercio: " + commerceError.message);
        return;
      }

      // Create commerce member
      await supabase.from("commerce_members").insert({
        commerce_id: commerce.id,
        user_id: user.id,
        role: "admin",
      });

      // Assign commerce role
      await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "commerce",
      });

      localStorage.removeItem("genioxCommerceRegistration");
      toast.success("Comercio registrado exitosamente.");
      window.location.href = "/comercios/dashboard";
    })();
  });

  const inputClasses =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">
              Registra tu comercio
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Completa los datos de tu comercio y regístrate con Google
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nombre del comercio *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Mi Tienda S.R.L."
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                NIT / RUC
              </label>
              <input
                type="text"
                name="ruc"
                value={form.ruc}
                onChange={handleChange}
                placeholder="1234567890"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email de contacto
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contacto@mitienda.com"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+591 70000000"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Dirección
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
                placeholder="Av. Principal #123, La Paz"
                rows={2}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleRegister}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {loading ? "Redirigiendo..." : "Registrarse con Google"}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/comercios/login"
              className="font-medium text-primary hover:underline"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
