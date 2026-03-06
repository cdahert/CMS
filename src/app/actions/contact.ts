"use server";

import { z } from "zod";

// ─── Supabase DDL (run once in your Supabase SQL editor) ────────────────────
// CREATE TABLE public.contact_leads (
//   id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
//   nombre      TEXT        NOT NULL,
//   empresa     TEXT        NOT NULL,
//   cargo       TEXT        NOT NULL,
//   email       TEXT        NOT NULL,
//   telefono    TEXT,
//   solucion    TEXT,
//   mensaje     TEXT        NOT NULL,
//   status      TEXT        DEFAULT 'new',
//   ip_address  TEXT,
//   created_at  TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "anon_insert" ON public.contact_leads FOR INSERT TO anon WITH CHECK (true);

// ─── Validation schema ───────────────────────────────────────────────────────
const contactSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100),
  empresa: z
    .string()
    .min(2, "El nombre de empresa debe tener al menos 2 caracteres")
    .max(150),
  cargo: z.string().min(1, "Selecciona tu cargo"),
  email: z.string().email("Ingresa un email corporativo válido"),
  telefono: z.string().optional(),
  solucion: z.string().optional(),
  mensaje: z
    .string()
    .min(20, "Por favor describe tu desafío (mínimo 20 caracteres)")
    .max(1000),
});

export type ContactFormInput = z.infer<typeof contactSchema>;

export type ContactActionResult =
  | { success: true; message: string }
  | { success: false; errors: Record<string, string[]>; message?: string };

export async function submitContactForm(
  formData: ContactFormInput
): Promise<ContactActionResult> {
  // 1. Validate input
  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  // 2. Save to Supabase (graceful degradation if not configured)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error } = await supabase.from("contact_leads").insert({
        nombre: data.nombre,
        empresa: data.empresa,
        cargo: data.cargo,
        email: data.email,
        telefono: data.telefono ?? null,
        solucion: data.solucion ?? null,
        mensaje: data.mensaje,
        status: "new",
      });

      if (error) {
        console.error("[contact_leads] Supabase insert error:", error.message);
        return {
          success: false,
          errors: {},
          message:
            "Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.",
        };
      }
    } catch (err) {
      console.error("[contact_leads] Unexpected error:", err);
      return {
        success: false,
        errors: {},
        message: "Error interno del servidor. Por favor intenta más tarde.",
      };
    }
  } else {
    // DEV: log to console when Supabase is not configured
    console.warn("[DEV] Contact form submission (Supabase not configured):", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    success: true,
    message: `¡Gracias ${data.nombre}! Hemos recibido tu solicitud. Un experto de Datec se pondrá en contacto contigo en las próximas 24 horas.`,
  };
}
