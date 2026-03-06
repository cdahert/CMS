"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
}

const STATS: Stat[] = [
  {
    value: 26,
    suffix: "+",
    label: "Años de Liderazgo",
    sublabel: "Fundada en 1999. Alliance Partner IBM desde el inicio.",
  },
  {
    value: 500,
    prefix: "+",
    suffix: "",
    label: "Organizaciones",
    sublabel: "Empresas líderes de Latinoamérica que confían en Datec.",
  },
  {
    value: 1000,
    prefix: "+",
    suffix: "",
    label: "Proyectos Ejecutados",
    sublabel: "Implementaciones exitosas con PMO reconocida en Latam.",
  },
  {
    value: 6,
    suffix: "",
    label: "Países",
    sublabel: "Bolivia, Perú, Costa Rica, Honduras, El Salvador y EE.UU.",
  },
];

export function StatsSection() {
  return (
    <section
      className="section-padding-sm bg-datec-navy"
      aria-labelledby="stats-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <p
          id="stats-heading"
          className="mb-12 text-center text-sm font-semibold uppercase tracking-[0.25em] text-datec-sky/60"
        >
          Datec en números
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat, idx) => (
            <StatBlock key={stat.label} stat={stat} delay={idx * 150} />
          ))}
        </div>

        {/* Bottom message */}
        <div className="mt-16 border-t border-datec-blue/20 pt-10 text-center">
          <p className="text-base text-white/60 sm:text-lg">
            Desde 1999 transformando empresas en{" "}
            <span className="font-semibold text-white">
              líderes tecnológicos de Latinoamérica.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function StatBlock({ stat, delay }: { stat: Stat; delay: number }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 1800;
    const start = Date.now();
    const end = stat.value;

    const timer = setInterval(() => {
      const elapsed = Date.now() - start - delay;
      if (elapsed < 0) return;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [visible, stat.value, delay]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {/* Number */}
      <div className="mb-3 flex items-baseline gap-0.5">
        {stat.prefix && (
          <span className="text-3xl font-bold text-datec-blue sm:text-4xl">
            {stat.prefix}
          </span>
        )}
        <span className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          {count.toLocaleString()}
        </span>
        {stat.suffix && (
          <span className="text-3xl font-bold text-datec-red sm:text-4xl">
            {stat.suffix}
          </span>
        )}
      </div>

      {/* Label */}
      <p className="mb-2 text-base font-semibold text-white sm:text-lg">
        {stat.label}
      </p>

      {/* Separator */}
      <div className="mb-3 h-0.5 w-10 rounded-full bg-datec-red" />

      {/* Sublabel */}
      <p className="max-w-[180px] text-xs leading-relaxed text-white/50">
        {stat.sublabel}
      </p>
    </div>
  );
}
