"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, TrendingUp, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SuccessCase {
  id: string;
  industry: string;
  company: string;
  companyInitials: string;
  challenge: string;
  solution: string;
  solutionCategory: string;
  result: string;
  resultMetric: string;
  resultLabel: string;
  quote?: string;
  quoteAuthor?: string;
  quoteTitle?: string;
}

const SUCCESS_CASES: SuccessCase[] = [
  {
    id: "banca",
    industry: "Banca & Finanzas",
    company: "Banco Regional Líder",
    companyInitials: "BR",
    challenge:
      "Infraestructura TI obsoleta que generaba tiempos de procesamiento críticos, afectando la experiencia del cliente y la competitividad operativa.",
    solution:
      "Modernización completa con IBM Storage FlashSystem + migración a arquitectura híbrida cloud, implementada en 4 meses con cero downtime.",
    solutionCategory: "Infraestructura + Cloud",
    result: "40%",
    resultMetric: "reducción en tiempos de procesamiento",
    resultLabel: "Más rápido",
    quote:
      "Datec no es un proveedor más; es el socio estratégico que entiende nuestros desafíos y entrega resultados reales.",
    quoteAuthor: "Gerente de Sistemas",
    quoteTitle: "Sector Bancario",
  },
  {
    id: "retail",
    industry: "Retail & Consumo",
    company: "Cadena Retail Nacional",
    companyInitials: "CR",
    challenge:
      "Operaciones manuales y ERP legacy que impedían escalar. Visibilidad nula del inventario en tiempo real en 45 puntos de venta.",
    solution:
      "Implementación SAP S/4HANA en Google Cloud con integración de analítica en tiempo real y dashboards para gerencia y áreas comerciales.",
    solutionCategory: "SAP + Google Cloud",
    result: "6",
    resultMetric: "meses para go-live completo",
    resultLabel: "Implementación récord",
    quote:
      "En 6 meses transformamos 20 años de procesos manuales. El ROI fue evidente desde el primer trimestre.",
    quoteAuthor: "Gerente General",
    quoteTitle: "Sector Retail",
  },
  {
    id: "mineria",
    industry: "Minería & Energía",
    company: "Empresa Minera Multinacional",
    companyInitials: "MM",
    challenge:
      "Exposición crítica a ciberataques en operaciones industriales con 200 TB de datos sensibles y ausencia de protocolo de respuesta a incidentes.",
    solution:
      "Implementación de ciberseguridad end-to-end: SOC 24/7, Zero Trust Architecture, y sistema de detección/respuesta automatizada de amenazas.",
    solutionCategory: "Ciberseguridad",
    result: "0",
    resultMetric: "incidentes críticos en 24 meses",
    resultLabel: "Operaciones blindadas",
    quote:
      "Con Datec dormimos tranquilos. Pasamos de una postura reactiva a ser completamente proactivos en ciberseguridad.",
    quoteAuthor: "Chief Information Security Officer",
    quoteTitle: "Sector Minero",
  },
  {
    id: "corporativo",
    industry: "Holding Corporativo",
    company: "Grupo Empresarial Regional",
    companyInitials: "GE",
    challenge:
      "Costos de TI disparados en 8 subsidiarias con infraestructura duplicada, sin visibilidad centralizada ni gobierno de datos unificado.",
    solution:
      "Consolidación de infraestructura en dCloud (nube boliviana) + implementación de gobierno de datos centralizado con BI para C-Level.",
    solutionCategory: "Cloud + Analytics",
    result: "35%",
    resultMetric: "reducción en costos totales de TI",
    resultLabel: "Ahorro garantizado",
    quote:
      "En 18 meses pasamos de 8 silos tecnológicos a una sola plataforma unificada. El ahorro fue inmediato.",
    quoteAuthor: "CFO",
    quoteTitle: "Holding Corporativo",
  },
  {
    id: "seguros",
    industry: "Seguros & Servicios",
    company: "Aseguradora Líder",
    companyInitials: "AL",
    challenge:
      "Alta tasa de cancelaciones sin capacidad de anticiparlas. Decisiones comerciales tomadas con datos históricos desactualizados.",
    solution:
      "Plataforma de analítica avanzada con IA predictiva: modelos de churn, segmentación de clientes y alertas tempranas para el equipo comercial.",
    solutionCategory: "IA + Analytics",
    result: "90%",
    resultMetric: "de precisión en predicción de cancelaciones",
    resultLabel: "IA predictiva",
    quote:
      "La analítica de Datec nos dio una ventaja competitiva que no imaginábamos posible. Ahora anticipamos, no reaccionamos.",
    quoteAuthor: "Gerente Comercial",
    quoteTitle: "Sector Asegurador",
  },
];

export function SuccessCasesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    const bounded = Math.max(0, Math.min(index, SUCCESS_CASES.length - 1));
    setActiveIndex(bounded);
    trackRef.current?.children[bounded]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const active = SUCCESS_CASES[activeIndex]!;

  return (
    <section
      id="casos-de-exito"
      className="section-padding bg-white"
      aria-labelledby="cases-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section header ─────────────────────────────────────── */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="datec-sky" className="mb-4">
            Casos de Éxito
          </Badge>
          <h2
            id="cases-heading"
            className="mb-4 text-3xl font-bold tracking-tight text-datec-navy sm:text-4xl lg:text-5xl"
          >
            Empresas que ya{" "}
            <span className="text-gradient-datec">transformaron</span> su futuro
          </h2>
          <p className="text-lg text-datec-gray-500">
            Resultados reales, medibles y verificables. Así se ve el impacto de
            una tecnología bien implementada.
          </p>
        </div>

        {/* ── Main case card ─────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-datec-gray-200 bg-datec-gray-50 shadow-datec-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Case details */}
            <div className="p-8 lg:p-12">
              {/* Industry + company */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-datec-navy text-lg font-bold text-white">
                  {active.companyInitials}
                </div>
                <div>
                  <Badge variant="datec-sky" className="mb-1">
                    {active.industry}
                  </Badge>
                  <p className="text-sm font-semibold text-datec-gray-700">
                    {active.company}
                  </p>
                </div>
              </div>

              {/* Challenge */}
              <div className="mb-5">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-datec-gray-400">
                  Desafío
                </p>
                <p className="text-sm leading-relaxed text-datec-gray-600">
                  {active.challenge}
                </p>
              </div>

              {/* Solution */}
              <div className="mb-6">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-datec-gray-400">
                  Solución implementada
                </p>
                <p className="text-sm leading-relaxed text-datec-gray-600">
                  {active.solution}
                </p>
                <span className="mt-2 inline-block rounded-full bg-datec-blue/10 px-3 py-1 text-xs font-semibold text-datec-blue">
                  {active.solutionCategory}
                </span>
              </div>

              {/* Quote */}
              {active.quote && (
                <blockquote className="relative rounded-xl border-l-4 border-datec-red bg-white p-4">
                  <Quote className="mb-2 h-4 w-4 text-datec-red/40" />
                  <p className="text-sm italic leading-relaxed text-datec-gray-700">
                    &ldquo;{active.quote}&rdquo;
                  </p>
                  <footer className="mt-2 text-xs font-semibold text-datec-gray-500">
                    — {active.quoteAuthor},{" "}
                    <span className="font-normal">{active.quoteTitle}</span>
                  </footer>
                </blockquote>
              )}
            </div>

            {/* Right: Result highlight */}
            <div className="flex flex-col items-center justify-center bg-datec-navy p-8 text-center lg:p-12">
              <TrendingUp
                className="mb-4 h-10 w-10 text-datec-blue/60"
                aria-hidden="true"
              />
              <div className="mb-2 text-7xl font-bold tracking-tight text-white lg:text-8xl">
                {active.result}
              </div>
              <p className="mb-1 text-base font-medium text-white/70">
                {active.resultMetric}
              </p>
              <span className="inline-block rounded-full bg-datec-red px-4 py-1.5 text-sm font-bold text-white">
                {active.resultLabel}
              </span>

              {/* Industry info */}
              <div className="mt-10 border-t border-datec-blue/20 pt-8 text-sm text-white/50">
                <p className="font-semibold text-white/80">{active.company}</p>
                <p>{active.industry}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Carousel navigation ────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between">
          {/* Dot navigation */}
          <div
            ref={trackRef}
            className="flex gap-2"
            role="tablist"
            aria-label="Casos de éxito"
          >
            {SUCCESS_CASES.map((c, idx) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={idx === activeIndex}
                aria-label={c.industry}
                onClick={() => goTo(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-8 bg-datec-red"
                    : "w-2 bg-datec-gray-300 hover:bg-datec-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Arrow controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Caso anterior"
              className="h-10 w-10 rounded-full border-datec-gray-300 disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-datec-gray-400">
              {activeIndex + 1} / {SUCCESS_CASES.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === SUCCESS_CASES.length - 1}
              aria-label="Siguiente caso"
              className="h-10 w-10 rounded-full border-datec-gray-300 disabled:opacity-30"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/casos-de-exito"
            className="inline-flex items-center gap-2 font-semibold text-datec-blue transition-colors hover:text-datec-navy"
          >
            Ver todos los casos de éxito
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
