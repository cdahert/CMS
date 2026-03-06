import { type Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { LogoBarSection } from "@/components/home/logo-bar-section";
import { SolutionsSection } from "@/components/home/solutions-section";
import { StatsSection } from "@/components/home/stats-section";
import { SuccessCasesSection } from "@/components/home/success-cases-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { ContactSection } from "@/components/home/contact-section";
import { FooterSection } from "@/components/home/footer-section";

export const metadata: Metadata = {
  title: "Datec Corp — Integrador Tecnológico End-to-End en Latinoamérica",
  description:
    "26 años transformando empresas líderes en Latinoamérica. Infraestructura, IA, ciberseguridad, cloud y redes corporativas. Más de 500 organizaciones confían en Datec.",
  keywords: [
    "integrador tecnológico",
    "transformación digital",
    "ciberseguridad",
    "infraestructura TI",
    "Google Cloud",
    "IBM partner Bolivia",
    "soluciones empresariales Latinoamérica",
    "Datec",
  ],
  openGraph: {
    title: "Datec Corp — Tecnología que impulsa líderes de Latinoamérica",
    description:
      "+500 empresas. +1,000 proyectos. 26 años. 6 países. Habla con un experto hoy.",
    type: "website",
    locale: "es_BO",
  },
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/*
       * ── SECTION ORDER (Conversion-optimized) ──────────────────────────
       *
       * 1. HERO          → Atención (AIDA) — captura inmediata, CTA principal
       * 2. LOGO BAR       → Prueba social — partners/certificaciones
       * 3. SOLUCIONES     → Propuesta de valor — 6 áreas de expertise
       * 4. STATS          → Autoridad + credibilidad — números clave
       * 5. CASOS DE ÉXITO → Deseo (AIDA) — resultados reales por industria
       * 6. TESTIMONIOS    → Confianza — voz de C-levels que ya decidieron
       * 7. CONTACTO       → Acción (AIDA) — formulario lead + info
       * 8. FOOTER         → Navegación + links + datos legales
       *
       * ── KPIs de éxito ────────────────────────────────────────────────
       * • Tasa de conversión (form submissions / visitas únicas)
       * • CTR del CTA principal "Agenda tu Consultoría"
       * • Tiempo en página (goal: >2 min indica interés)
       * • Scroll depth (goal: >60% llegan a Casos de Éxito)
       * • Leads calificados por cargo (CEO/GM = mayor prioridad)
       * • Tasa de rebote < 50%
       * ─────────────────────────────────────────────────────────────────
       */}

      {/* 1. HERO — Video background / Animated gradient */}
      <HeroSection
      /*
       * videoSrc: Descomenta y reemplaza con la URL del video hosteado.
       * Google Drive NO funciona como fuente directa.
       * Opciones: Vercel Blob, Cloudflare R2, AWS S3, CDN propio.
       *
       * videoSrc="https://cdn.datec.com.bo/assets/hero-background.mp4"
       */
      />

      {/* 2. LOGO BAR — Partners & certifications */}
      <LogoBarSection />

      {/* 3. SOLUCIONES — 6 technology pillars */}
      <SolutionsSection />

      {/* 4. STATS — Social proof through numbers */}
      <StatsSection />

      {/* 5. CASOS DE ÉXITO — Interactive carousel */}
      <SuccessCasesSection />

      {/* 6. TESTIMONIOS — C-level voice auto-slider */}
      <TestimonialsSection />

      {/* 7. CONTACTO — Lead capture form + Supabase */}
      <ContactSection />

      {/* 8. FOOTER — Full corporate footer */}
      <FooterSection />
    </main>
  );
}
