import Link from "next/link";
import {
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Soluciones",
    links: [
      { label: "Procesamiento de Datos", href: "/soluciones/infraestructura" },
      { label: "Analítica e IA", href: "/soluciones/analitica-ia" },
      { label: "Trabajo Híbrido", href: "/soluciones/trabajo-hibrido" },
      { label: "Ciberseguridad", href: "/soluciones/ciberseguridad" },
      { label: "Redes Corporativas", href: "/soluciones/redes" },
      { label: "Google Cloud", href: "/soluciones/google-cloud" },
    ],
  },
  {
    title: "Industrias",
    links: [
      { label: "Banca y Finanzas", href: "/industrias/banca" },
      { label: "Retail y Consumo", href: "/industrias/retail" },
      { label: "Minería y Energía", href: "/industrias/mineria" },
      { label: "Seguros", href: "/industrias/seguros" },
      { label: "Salud", href: "/industrias/salud" },
      { label: "Gobierno", href: "/industrias/gobierno" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre Datec", href: "/nosotros" },
      { label: "Casos de Éxito", href: "/casos-de-exito" },
      { label: "Partners & Alianzas", href: "/partners" },
      { label: "Blog Tecnológico", href: "/blog" },
      { label: "Trabaja con nosotros", href: "/careers" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://bo.linkedin.com/company/dateclatam",
  },
  { name: "Twitter / X", icon: Twitter, href: "https://twitter.com/datecbo" },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com/datecbolivia",
  },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@datec" },
] as const;

const OFFICES = [
  {
    country: "Bolivia",
    address: "Av. La Salle N° 1033, Santa Cruz de la Sierra",
    phone: "+591 3 336-8800",
    email: "info@datec.com.bo",
    flag: "🇧🇴",
  },
  {
    country: "Perú",
    address: "Lima, Perú",
    phone: "+51 1 123-4567",
    email: "peru@datec.com.bo",
    flag: "🇵🇪",
  },
  {
    country: "Centroamérica",
    address: "San José, Costa Rica",
    phone: "+506 2000-1234",
    email: "ca@datec.com.bo",
    flag: "🌎",
  },
] as const;

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-datec-navyDark" aria-label="Pie de página de Datec">
      {/* ── Main footer content ──────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            {/* Logo placeholder — replace with <Image> */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-datec-red text-sm font-bold text-white">
                D
              </div>
              <div>
                <p className="text-lg font-bold leading-none text-white">
                  Datec
                </p>
                <p className="text-xs text-datec-sky/60">Corp</p>
              </div>
            </div>

            <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/55">
              Integrador tecnológico end-to-end con más de 26 años de liderazgo
              en Latinoamérica. Transformamos empresas en líderes digitales.
            </p>

            {/* Social links */}
            <div className="mb-8 flex gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-all duration-200 hover:border-datec-blue/50 hover:bg-datec-blue/10 hover:text-datec-sky"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Offices quick info */}
            <div className="space-y-3">
              {OFFICES.map((o) => (
                <div key={o.country} className="flex items-start gap-2">
                  <span className="mt-0.5 text-sm" aria-hidden="true">
                    {o.flag}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white/70">
                      {o.country}
                    </p>
                    <p className="text-xs text-white/40">{o.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
                        >
                          {link.label}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-white/50 transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact column */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
              Contacto Principal
            </h3>
            <div className="space-y-3">
              <a
                href="tel:+59133368800"
                className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-datec-blue" />
                +591 3 336-8800
              </a>
              <a
                href="mailto:info@datec.com.bo"
                className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-datec-blue" />
                info@datec.com.bo
              </a>
              <div className="flex items-start gap-2 text-sm text-white/50">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-datec-blue" />
                <span>Santa Cruz, Bolivia</span>
              </div>
            </div>

            {/* Partners badge */}
            <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                Alliance Partner
              </p>
              <p className="text-lg font-bold text-white">IBM</p>
              <p className="text-xs text-white/40">
                + Microsoft · Google · SAP · Lenovo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-white/30 sm:flex-row sm:px-6 lg:px-8">
          <p>© {currentYear} Datec Corp S.A. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link
              href="/privacidad"
              className="transition-colors hover:text-white/60"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/terminos"
              className="transition-colors hover:text-white/60"
            >
              Términos de Uso
            </Link>
            <Link
              href="/cookies"
              className="transition-colors hover:text-white/60"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
