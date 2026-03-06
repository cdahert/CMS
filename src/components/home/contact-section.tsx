"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  submitContactForm,
  type ContactFormInput,
} from "@/app/actions/contact";

// ─── Validation schema (mirrors server-side schema) ──────────────────────────
const formSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
  empresa: z.string().min(2, "Ingresa el nombre de tu empresa"),
  cargo: z.string().min(1, "Selecciona tu cargo"),
  email: z.string().email("Ingresa un email corporativo válido"),
  telefono: z.string().optional(),
  solucion: z.string().optional(),
  mensaje: z
    .string()
    .min(20, "Describe tu desafío (mínimo 20 caracteres)")
    .max(1000),
});

type FormValues = z.infer<typeof formSchema>;

const CARGOS = [
  "CEO / Director Ejecutivo",
  "Gerente General",
  "Gerente Comercial / Ventas",
  "Gerente de Marketing",
  "Gerente de RRHH",
  "Gerente / Director de TI",
  "CFO / Director Financiero",
  "COO / Director de Operaciones",
  "Otro cargo",
] as const;

const SOLUCIONES = [
  "Procesamiento y Gestión de Datos",
  "Analítica e Inteligencia Artificial",
  "Espacios de Trabajo Híbridos",
  "Ciberseguridad",
  "Redes Corporativas",
  "Google Cloud",
  "Consultoría Integral",
  "Aún no lo sé — necesito asesoría",
] as const;

const BENEFITS = [
  "Consultoría inicial sin costo",
  "Propuesta personalizada en 48 hs",
  "ROI medible desde el primer trimestre",
  "Implementación con soporte 24/7",
  "Sin letra chica ni compromisos forzados",
] as const;

export function ContactSection() {
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitResult(null);
    const result = await submitContactForm(data as ContactFormInput);

    if (result.success) {
      setSubmitResult({ type: "success", message: result.message });
      reset();
    } else {
      setSubmitResult({
        type: "error",
        message:
          result.message ?? "Por favor revisa los campos e intenta nuevamente.",
      });
    }
  };

  return (
    <section
      id="contacto"
      className="section-padding bg-datec-navy"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ── Left: Persuasive copy ─────────────────────────────── */}
          <div className="flex flex-col justify-center">
            <Badge className="mb-6 w-fit border-datec-blue/30 bg-datec-blue/10 text-datec-sky">
              Hablemos
            </Badge>

            <h2
              id="contact-heading"
              className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              ¿Listo para transformar{" "}
              <span className="text-datec-red">tu empresa</span>?
            </h2>

            <p className="mb-8 text-lg leading-relaxed text-white/70">
              Un experto de Datec analizará tus desafíos y te presentará una
              propuesta tecnológica personalizada, sin compromiso y sin costo.
            </p>

            {/* Benefits checklist */}
            <ul
              className="mb-10 space-y-3"
              aria-label="Beneficios de contactarnos"
            >
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-datec-blue" />
                  <span className="text-white/80">{b}</span>
                </li>
              ))}
            </ul>

            {/* Contact info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-white/60">
                <Phone className="h-4 w-4 shrink-0 text-datec-blue" />
                <a
                  href="tel:+59133368800"
                  className="transition-colors hover:text-white"
                >
                  +591 3 336-8800
                </a>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Mail className="h-4 w-4 shrink-0 text-datec-blue" />
                <a
                  href="mailto:info@datec.com.bo"
                  className="transition-colors hover:text-white"
                >
                  info@datec.com.bo
                </a>
              </div>
              <div className="flex items-start gap-3 text-white/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-datec-blue" />
                <span>
                  Av. La Salle N° 1033, Santa Cruz de la Sierra, Bolivia
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Contact form ───────────────────────────────── */}
          <div className="rounded-2xl border border-datec-blue/20 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            {submitResult?.type === "success" ? (
              /* ── Success state ──────────────────────────────────── */
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  ¡Solicitud recibida!
                </h3>
                <p className="mb-6 text-white/70">{submitResult.message}</p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitResult(null)}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Enviar otra consulta
                </Button>
              </div>
            ) : (
              /* ── Form ───────────────────────────────────────────── */
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-5"
              >
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    Solicitar Consultoría
                  </h3>
                  <p className="text-xs text-white/50">
                    Respuesta garantizada en menos de 24 horas hábiles.
                  </p>
                </div>

                {/* Error message */}
                {submitResult?.type === "error" && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {submitResult.message}
                  </div>
                )}

                {/* Nombre + Empresa */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Nombre completo *"
                    error={errors.nombre?.message}
                  >
                    <Input
                      {...register("nombre")}
                      placeholder="Ej: Carlos Méndez"
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus-visible:ring-datec-blue"
                    />
                  </FormField>
                  <FormField label="Empresa *" error={errors.empresa?.message}>
                    <Input
                      {...register("empresa")}
                      placeholder="Ej: Grupo Industrial"
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus-visible:ring-datec-blue"
                    />
                  </FormField>
                </div>

                {/* Cargo + Email */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Cargo *" error={errors.cargo?.message}>
                    <Select
                      onValueChange={(v) =>
                        setValue("cargo", v, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="border-white/20 bg-white/10 text-white/80 focus:ring-datec-blue [&>span]:text-white/80">
                        <SelectValue placeholder="Selecciona tu cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARGOS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField
                    label="Email corporativo *"
                    error={errors.email?.message}
                  >
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="nombre@empresa.com"
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus-visible:ring-datec-blue"
                    />
                  </FormField>
                </div>

                {/* Teléfono + Solución */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Teléfono" error={errors.telefono?.message}>
                    <Input
                      {...register("telefono")}
                      type="tel"
                      placeholder="+591 ..."
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus-visible:ring-datec-blue"
                    />
                  </FormField>
                  <FormField
                    label="Solución de interés"
                    error={errors.solucion?.message}
                  >
                    <Select
                      onValueChange={(v) =>
                        setValue("solucion", v, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="border-white/20 bg-white/10 text-white/80 focus:ring-datec-blue [&>span]:text-white/80">
                        <SelectValue placeholder="¿Qué área te interesa?" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOLUCIONES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {/* Mensaje */}
                <FormField
                  label="¿Cuál es tu mayor desafío tecnológico? *"
                  error={errors.mensaje?.message}
                >
                  <Textarea
                    {...register("mensaje")}
                    rows={4}
                    placeholder="Describe brevemente el problema o desafío que enfrentas en tu empresa..."
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus-visible:ring-datec-blue"
                  />
                </FormField>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="group h-12 w-full rounded-lg bg-datec-red font-semibold text-white shadow-datec-red transition-all duration-300 hover:bg-datec-redDark hover:shadow-datec-red disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando consulta...
                    </>
                  ) : (
                    <>
                      Solicitar Consultoría Gratuita
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-white/40">
                  Al enviar, aceptas nuestra{" "}
                  <a
                    href="/privacidad"
                    className="underline hover:text-white/70"
                  >
                    política de privacidad
                  </a>
                  . Sin spam. Sin compromiso.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Helper component ────────────────────────────────────────────────────────
function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-white/70">{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
