/**
 * LogoBarSection — Partners & Certifications strip
 * Infinite marquee animation. Pure CSS, no JS required.
 */

interface Partner {
  name: string;
  abbr: string; // Used as fallback text logo
  category: string;
}

const PARTNERS: Partner[] = [
  { name: "IBM", abbr: "IBM", category: "Alliance Partner" },
  { name: "Google Cloud", abbr: "Google\nCloud", category: "Partner" },
  {
    name: "Microsoft Azure",
    abbr: "Microsoft\nAzure",
    category: "Solutions Partner",
  },
  { name: "Lenovo", abbr: "Lenovo", category: "Premium Partner" },
  { name: "SAP", abbr: "SAP", category: "Partner" },
  { name: "Cisco", abbr: "Cisco", category: "Partner" },
  { name: "HP Enterprise", abbr: "HPE", category: "Partner" },
  { name: "Panda Security", abbr: "Panda\nSecurity", category: "Partner" },
];

export function LogoBarSection() {
  // Duplicate for seamless loop
  const allPartners = [...PARTNERS, ...PARTNERS];

  return (
    <section
      className="border-y border-datec-gray-200 bg-white py-8"
      aria-label="Partners tecnológicos certificados"
    >
      <div className="mb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-datec-gray-400">
          Certificados y respaldados por líderes tecnológicos globales
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-white to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-white to-transparent"
          aria-hidden="true"
        />

        <div
          className="flex animate-marquee items-center gap-16 whitespace-nowrap"
          aria-hidden="true"
        >
          {allPartners.map((partner, idx) => (
            <PartnerLogo key={`${partner.name}-${idx}`} partner={partner} />
          ))}
        </div>
      </div>

      {/* Accessible fallback list (hidden visually) */}
      <ul className="sr-only">
        {PARTNERS.map((p) => (
          <li key={p.name}>
            {p.name} — {p.category}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <div className="flex flex-col items-center gap-0.5 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
      {/* Text-based logo placeholder — replace with <Image> when SVG assets available */}
      <span
        className="whitespace-pre-line text-center text-lg font-bold leading-tight tracking-tight text-datec-navy"
        style={{ minWidth: "80px" }}
      >
        {partner.abbr}
      </span>
      <span className="text-[9px] font-medium uppercase tracking-wider text-datec-gray-400">
        {partner.category}
      </span>
    </div>
  );
}
