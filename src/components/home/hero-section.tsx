import { ArrowRight, CheckCircle2, ChevronDown, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── A/B Headline Variants ──────────────────────────────────────────────────
// Variant A (selected — efficiency/risk/growth — speaks to all C-levels):
//   H1: "Más eficiencia. Menos riesgo. Crecimiento sin límites."
//
// Variant B (authority/social proof — ideal for cold traffic):
//   H1: "La tecnología que impulsa a las 500 empresas líderes de Latam"
//
// Variant C (pain-driven / PAS):
//   H1: "Cada día sin tecnología adecuada, tu competencia se aleja más"
//
// Variant D (direct ROI / CEO-focused):
//   H1: "Toma decisiones más inteligentes. Con la tecnología correcta."
//
// Variant E (transformation promise):
//   H1: "De la ineficiencia operativa al liderazgo digital. En 90 días."
// ────────────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  /**
   * URL del video de fondo (MP4). Si no se provee, se muestra
   * el fondo animado con gradiente Datec.
   *
   * NOTA: Google Drive no sirve como fuente directa de <video>.
   * Sube el video a Vercel Blob, S3, o Cloudflare R2 y pasa la URL aquí.
   * Ejemplo: videoSrc="https://cdn.datec.com.bo/hero-background.mp4"
   */
  videoSrc?: string;
}

const TRUST_BADGES = [
  "+500 Organizaciones",
  "+1,000 Proyectos",
  "26 Años de Liderazgo",
  "6 Países",
] as const;

export function HeroSection({ videoSrc }: HeroSectionProps) {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden bg-datec-navy"
      aria-label="Sección principal de Datec"
    >
      {/* ── Background: Video or Animated Gradient ────────────────── */}
      {videoSrc ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          aria-hidden="true"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-datec-navyDark via-datec-navy to-datec-navyLight"
          aria-hidden="true"
        >
          {/* Animated grid */}
          <div className="bg-grid-datec absolute inset-0 opacity-60" />
          {/* Glow orbs */}
          <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse-slow rounded-full bg-datec-blue/20 blur-[140px]" />
          <div className="absolute bottom-1/3 right-1/4 h-[350px] w-[350px] translate-x-1/2 translate-y-1/2 animate-pulse-slow rounded-full bg-datec-red/10 blur-[120px] [animation-delay:1.5s]" />
          <div className="absolute right-1/3 top-1/4 h-[200px] w-[200px] animate-float rounded-full bg-datec-blueLight/15 blur-[80px]" />
        </div>
      )}

      {/* ── Directional overlay (content legibility) ──────────────── */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-datec-navyDark/95 via-datec-navy/85 to-datec-navy/40"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-datec-navyDark/60 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Pre-heading pill */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-datec-blue/30 bg-datec-blue/10 px-4 py-1.5 text-sm font-medium text-datec-sky backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-datec-blue" />
            Datec Corp · Integrador Tecnológico End-to-End en Latinoamérica
          </div>

          {/* H1 — Primary headline (Variant A) */}
          <h1 className="mb-6 text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Más <span className="text-datec-red">eficiencia.</span>
            <br />
            Menos riesgo.
            <br />
            <span className="bg-gradient-to-r from-datec-sky via-datec-blue to-datec-blueLight bg-clip-text text-transparent">
              Crecimiento sin límites.
            </span>
          </h1>

          {/* H2 — Complementary subtitle */}
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            Las empresas líderes de Latinoamérica confían en Datec para integrar
            tecnología world class que transforma desafíos operativos en{" "}
            <strong className="font-semibold text-white">
              ventajas competitivas reales y medibles.
            </strong>
          </p>

          {/* CTAs */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-14 rounded-lg bg-datec-red px-8 text-base font-semibold text-white shadow-datec-red transition-all duration-300 hover:-translate-y-0.5 hover:bg-datec-redDark hover:shadow-datec-red"
            >
              <Link href="#contacto">
                Agenda tu Consultoría Gratis
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="group h-14 rounded-lg border-white/30 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10"
            >
              <Link href="#casos-de-exito" className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                Ver Casos de Éxito
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {TRUST_BADGES.map((label) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-white/65"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-datec-blue" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-1.5 text-white/40">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
          Explorar
        </span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
}
