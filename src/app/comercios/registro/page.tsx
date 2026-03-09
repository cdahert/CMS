"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Store } from "lucide-react";
import { createClient } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  ruc: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export default function ComerciosRegistro() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: "",
    ruc: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async () => {
    if (!form.name.trim()) {
      toast.error("Ingresa el nombre de tu comercio.");
      return;
    }
    if (!form.email || !form.password) {
      toast.error("Ingresa email y contraseña.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      toast.error("Error al registrar: " + authError.message);
      setLoading(false);
      return;
    }

    const user = authData.user;
    if (!user) {
      toast.error("No se pudo crear el usuario.");
      setLoading(false);
      return;
    }

    const { data: commerce, error: commerceError } = await supabase
      .from("commerces")
      .insert({
        name: form.name,
        ruc: form.ruc || null,
        email: form.email,
        phone: form.phone || null,
        address: form.address || null,
        owner_id: user.id,
      })
      .select("id")
      .single();

    if (commerceError) {
      toast.error("Error al crear el comercio: " + commerceError.message);
      setLoading(false);
      return;
    }

    await supabase.from("commerce_members").insert({
      commerce_id: commerce.id,
      user_id: user.id,
      role: "admin",
    });

    await supabase.from("user_roles").insert({
      user_id: user.id,
      role: "commerce",
    });

    toast.success("Comercio registrado exitosamente.");
    router.push("/comercios/dashboard");
  };

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
              Completa los datos de tu comercio
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
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contacto@mitienda.com"
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
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
                onChange={
                  handleChange as React.ChangeEventHandler<HTMLTextAreaElement>
                }
                placeholder="Av. Principal #123, La Paz"
                rows={2}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar comercio"}
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
