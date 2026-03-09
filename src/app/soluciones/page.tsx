import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Soluciones",
  description:
    "Soluciones empresariales para potenciar tu comercio en el marketplace B2B de GenioX",
  openGraph: {
    title: "Soluciones | GenioX Commerce",
    description:
      "Soluciones empresariales para potenciar tu comercio en el marketplace B2B",
  },
};

// MOCK DATA - placeholder cards when no posts exist
const mockSoluciones = [
  {
    id: "mock-sol-1",
    slug: "gestion-inventario-inteligente",
    title: "Gestión de Inventario Inteligente",
    excerpt:
      "Controla tu stock en tiempo real con alertas automáticas, reportes detallados y sincronización multi-canal para optimizar tu operación.",
    cover_image_url: null,
    published_at: "2026-01-10T00:00:00Z",
    tags: ["inventario", "automatización"],
  },
  {
    id: "mock-sol-2",
    slug: "marketplace-b2b-integrado",
    title: "Marketplace B2B Integrado",
    excerpt:
      "Conecta tu catálogo con compradores mayoristas, gestiona pedidos y facturación desde una sola plataforma centralizada.",
    cover_image_url: null,
    published_at: "2026-01-25T00:00:00Z",
    tags: ["marketplace", "B2B"],
  },
  {
    id: "mock-sol-3",
    slug: "analytics-comercial",
    title: "Analytics Comercial Avanzado",
    excerpt:
      "Dashboards en tiempo real, análisis de comisiones, liquidaciones automáticas y métricas clave para tomar mejores decisiones de negocio.",
    cover_image_url: null,
    published_at: "2026-02-10T00:00:00Z",
    tags: ["analytics", "reportes"],
  },
];

async function getSoluciones() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image_url, published_at, tags")
      .eq("published", true)
      .eq("category", "soluciones")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching soluciones:", error);
      return null;
    }

    return data && data.length > 0 ? data : null;
  } catch (err) {
    console.error("Unexpected error fetching soluciones:", err);
    return null;
  }
}

export default async function SolucionesIndex() {
  const posts = await getSoluciones();
  const displayPosts = posts ?? mockSoluciones;
  const isMock = !posts;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card/50 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Soluciones
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Herramientas y servicios diseñados para impulsar el crecimiento de
            tu comercio
          </p>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {isMock && (
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {/* MOCK DATA - these are placeholder cards */}
            Contenido de ejemplo. Las soluciones reales aparecerán aquí
            próximamente.
          </p>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post) => (
            <Link
              key={post.id}
              href={isMock ? "#" : `/soluciones/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Cover image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary/5">
                    <span className="text-4xl font-bold text-primary/20">
                      GX
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="mb-3 text-xl font-bold text-card-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
