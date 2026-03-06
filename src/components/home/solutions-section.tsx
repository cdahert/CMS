import {
  Server,
  Brain,
  MonitorSmartphone,
  ShieldCheck,
  Network,
  Cloud,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Solution {
  icon: React.ElementType;
  category: string;
  title: string;
  description: string;
  benefits: string[];
  href: string;
  accent: string; // Tailwind bg color class for icon wrapper
}

const SOLUTIONS: Solution[] = [
  {
    icon: Server,
    category: "Infraestructura",
    title: "Procesamiento y Gestión de Datos",
    description:
      "Optimiza tu infraestructura TI con soluciones cloud, on-premise o híbridas. Reduce costos operativos y acelera la transformación digital con tecnologías IBM, HP y Lenovo.",
    benefits: [
      "Reducción de costos TI",
      "Alta disponibilidad",
      "Escalabilidad garantizada",
    ],
    href: "/soluciones/infraestructura",
    accent: "bg-datec-blue/10 text-datec-blue",
  },
  {
    icon: Brain,
    category: "Analítica & IA",
    title: "Analítica e Inteligencia Artificial",
    description:
      "Convierte datos en decisiones estratégicas. Business Analytics, Big Data e IA que maximizan eficiencia, minimizan riesgos y aseguran crecimiento sostenible.",
    benefits: [
      "Insights en tiempo real",
      "IA predictiva",
      "Decisiones basadas en datos",
    ],
    href: "/soluciones/analitica-ia",
    accent: "bg-purple-100 text-purple-700",
  },
  {
    icon: MonitorSmartphone,
    category: "Productividad",
    title: "Espacios de Trabajo Híbridos",
    description:
      "Optimiza costos y brinda acceso seguro a aplicaciones y datos desde cualquier dispositivo y lugar. Soluciones flexibles As a Service u On-Premise.",
    benefits: [
      "Trabajo remoto seguro",
      "Modelo As a Service",
      "Integración Office 365",
    ],
    href: "/soluciones/trabajo-hibrido",
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: ShieldCheck,
    category: "Seguridad",
    title: "Ciberseguridad",
    description:
      "Protege información, infraestructura y continuidad operativa. Anticipa ciberataques con soluciones avanzadas y garantiza el control total de tu entorno digital.",
    benefits: [
      "Protección 24/7",
      "Cumplimiento regulatorio",
      "Respuesta a incidentes",
    ],
    href: "/soluciones/ciberseguridad",
    accent: "bg-datec-red/10 text-datec-red",
  },
  {
    icon: Network,
    category: "Conectividad",
    title: "Redes Corporativas",
    description:
      "Redes seguras, ágiles y escalables: SDN, WiFi 6, SD-WAN y Data Center Networking. Conectividad de clase mundial para empresas de cualquier tamaño.",
    benefits: ["SDN & SD-WAN", "WiFi 6 empresarial", "Conectividad multi-sede"],
    href: "/soluciones/redes",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    icon: Cloud,
    category: "Cloud",
    title: "Google Cloud",
    description:
      "Combinamos 26 años de experiencia en infraestructura con la nube más innovadora del mundo. Migraciones, desarrollo cloud-native y optimización de costos.",
    benefits: ["Migración guiada", "Cloud nativo", "Optimización de costos"],
    href: "/soluciones/google-cloud",
    accent: "bg-sky-100 text-sky-700",
  },
];

export function SolutionsSection() {
  return (
    <section
      id="soluciones"
      className="section-padding bg-datec-gray-50"
      aria-labelledby="solutions-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section header ─────────────────────────────────────── */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="datec-sky" className="mb-4">
            Portafolio de Soluciones
          </Badge>
          <h2
            id="solutions-heading"
            className="mb-4 text-3xl font-bold tracking-tight text-datec-navy sm:text-4xl lg:text-5xl"
          >
            Tecnología diseñada para{" "}
            <span className="text-gradient-datec">decisiones que importan</span>
          </h2>
          <p className="text-lg leading-relaxed text-datec-gray-500">
            No vendemos productos, construimos ecosistemas tecnológicos
            integrados que resuelven los desafíos reales de tu negocio y generan
            ROI medible.
          </p>
        </div>

        {/* ── Solutions grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((solution) => (
            <SolutionCard key={solution.title} solution={solution} />
          ))}
        </div>

        {/* ── Bottom CTA ─────────────────────────────────────────── */}
        <div className="mt-14 text-center">
          <p className="mb-4 text-datec-gray-500">
            ¿No encuentras lo que buscas? Nuestras soluciones son 100%
            personalizables.
          </p>
          <Link
            href="#contacto"
            className="inline-flex items-center gap-2 font-semibold text-datec-blue transition-colors hover:text-datec-navy"
          >
            Habla con un experto
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SolutionCard({ solution }: { solution: Solution }) {
  const Icon = solution.icon;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-datec-gray-200 bg-white p-7 shadow-datec transition-all duration-300 hover:-translate-y-1 hover:border-datec-blue/30 hover:shadow-card-hover">
      {/* Icon */}
      <div
        className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${solution.accent} transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>

      {/* Category badge */}
      <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-datec-gray-400">
        {solution.category}
      </span>

      {/* Title */}
      <h3 className="mb-3 text-lg font-semibold leading-snug text-datec-navy">
        {solution.title}
      </h3>

      {/* Description */}
      <p className="mb-5 flex-1 text-sm leading-relaxed text-datec-gray-500">
        {solution.description}
      </p>

      {/* Benefits list */}
      <ul className="mb-6 space-y-1.5">
        {solution.benefits.map((b) => (
          <li
            key={b}
            className="flex items-center gap-2 text-xs text-datec-gray-500"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-datec-blue" />
            {b}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={solution.href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-datec-blue transition-all duration-200 hover:gap-2.5 hover:text-datec-navy"
      >
        Conocer más
        <ArrowRight className="h-4 w-4" />
      </Link>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 rounded-b-2xl bg-gradient-to-r from-datec-blue to-datec-blueLight transition-all duration-300 group-hover:w-full" />
    </article>
  );
}
