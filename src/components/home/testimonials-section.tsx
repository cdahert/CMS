"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  company: string;
  initials: string;
  avatarColor: string;
  rating: number;
  sector: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote:
      "Datec no es un proveedor tecnológico, es el socio estratégico que todo CEO necesita. Entienden nuestros desafíos de negocio y traducen la tecnología en resultados concretos. La inversión en infraestructura con ellos fue la decisión más rentable que tomamos.",
    name: "Carlos Méndez",
    title: "CEO",
    company: "Grupo Industrial Boliviano",
    initials: "CM",
    avatarColor: "bg-datec-navy",
    rating: 5,
    sector: "Industrial",
  },
  {
    id: "2",
    quote:
      "Como Gerente General, lo que más valoro es la certeza. Con Datec tenemos certeza: de plazos, de presupuesto y de resultados. En 18 meses redujimos costos operativos un 35% y nuestra infraestructura nunca estuvo tan sólida. Son el estándar que todo integrador TI debería seguir.",
    name: "Sofía Castillo",
    title: "Gerente General",
    company: "Aseguradora Andina",
    initials: "SC",
    avatarColor: "bg-datec-blue",
    rating: 5,
    sector: "Seguros",
  },
  {
    id: "3",
    quote:
      "Nuestra transformación digital parecía un sueño lejano. Datec la convirtió en realidad en 6 meses. Su equipo no solo implementa tecnología, nos forma, nos acompaña y nos ayuda a extraer el máximo valor. El equipo de Marketing ahora toma decisiones con datos en tiempo real.",
    name: "Luis Fernando Ríos",
    title: "Gerente de Marketing",
    company: "Cadena Retail Nacional",
    initials: "LR",
    avatarColor: "bg-purple-600",
    rating: 5,
    sector: "Retail",
  },
  {
    id: "4",
    quote:
      "La ciberseguridad era nuestra mayor preocupación. Datec nos implementó una solución end-to-end que superó nuestras expectativas. En 24 meses: cero incidentes críticos. Para un CISO, eso lo es todo. Los recomiendo sin dudarlo.",
    name: "Roberto Vargas",
    title: "CISO",
    company: "Empresa Minera LATAM",
    initials: "RV",
    avatarColor: "bg-emerald-700",
    rating: 5,
    sector: "Minería",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const resetTimer = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goTo(index);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
  };

  const active = TESTIMONIALS[activeIndex]!;

  return (
    <section
      className="section-padding bg-datec-sky/30"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section header ─────────────────────────────────────── */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="datec-sky" className="mb-4">
            Testimonios
          </Badge>
          <h2
            id="testimonials-heading"
            className="mb-4 text-3xl font-bold tracking-tight text-datec-navy sm:text-4xl"
          >
            Lo que dicen los líderes que{" "}
            <span className="text-gradient-datec">ya decidieron</span>
          </h2>
          <p className="text-datec-gray-500">
            C-Levels y decisores de distintas industrias que transformaron sus
            empresas con Datec.
          </p>
        </div>

        {/* ── Active testimonial ─────────────────────────────────── */}
        <div className="mx-auto max-w-4xl">
          <div
            key={active.id}
            className="relative rounded-2xl border border-datec-gray-200 bg-white p-8 shadow-datec-lg lg:p-12"
            style={{ animation: "fade-in 0.4s ease-out" }}
          >
            {/* Large quote icon */}
            <Quote
              className="absolute right-8 top-8 h-14 w-14 text-datec-sky"
              aria-hidden="true"
            />

            {/* Stars */}
            <div
              className="mb-6 flex gap-1"
              aria-label={`${active.rating} de 5 estrellas`}
            >
              {Array.from({ length: active.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mb-8">
              <p className="text-lg font-medium leading-relaxed text-datec-gray-700 sm:text-xl">
                &ldquo;{active.quote}&rdquo;
              </p>
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${active.avatarColor} text-sm font-bold text-white`}
                  aria-hidden="true"
                >
                  {active.initials}
                </div>
                <div>
                  <p className="font-semibold text-datec-navy">{active.name}</p>
                  <p className="text-sm text-datec-gray-500">
                    {active.title} · {active.company}
                  </p>
                </div>
              </div>
              <Badge variant="datec-sky" className="hidden sm:inline-flex">
                {active.sector}
              </Badge>
            </div>
          </div>

          {/* ── Navigation ─────────────────────────────────────────── */}
          <div className="mt-8 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-2" role="tablist" aria-label="Testimonios">
              {TESTIMONIALS.map((t, idx) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Testimonio de ${t.name}`}
                  onClick={() => resetTimer(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-8 bg-datec-red"
                      : "w-2 bg-datec-gray-300 hover:bg-datec-gray-400"
                  }`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={() => resetTimer(activeIndex - 1)}
                aria-label="Testimonio anterior"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-datec-gray-200 text-datec-gray-500 transition-all hover:border-datec-blue hover:text-datec-blue"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => resetTimer(activeIndex + 1)}
                aria-label="Siguiente testimonio"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-datec-gray-200 text-datec-gray-500 transition-all hover:border-datec-blue hover:text-datec-blue"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
