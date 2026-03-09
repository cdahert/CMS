import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos, novedades y tendencias del marketplace B2B en Bolivia - GenioX Commerce",
  openGraph: {
    title: "Blog | GenioX Commerce",
    description:
      "Artículos, novedades y tendencias del marketplace B2B en Bolivia",
  },
};

// MOCK DATA - placeholder cards when no posts exist
const mockPosts = [
  {
    id: "mock-1",
    slug: "estrategias-ecommerce-2026",
    title: "Estrategias de eCommerce para 2026",
    excerpt:
      "Descubre las tendencias clave que están transformando el comercio electrónico B2B en Bolivia y cómo tu negocio puede aprovecharlas.",
    cover_image_url: null,
    published_at: "2026-01-15T00:00:00Z",
    tags: ["ecommerce", "tendencias", "B2B"],
  },
  {
    id: "mock-2",
    slug: "optimizar-logistica-marketplace",
    title: "Cómo optimizar la logística en tu marketplace",
    excerpt:
      "Una guía práctica para mejorar los tiempos de entrega y reducir costos de envío en tu operación de marketplace.",
    cover_image_url: null,
    published_at: "2026-02-01T00:00:00Z",
    tags: ["logística", "operaciones"],
  },
  {
    id: "mock-3",
    slug: "integracion-erp-comercio",
    title: "Integración ERP: conecta tu comercio",
    excerpt:
      "Aprende cómo la integración con sistemas ERP puede automatizar tu inventario, facturación y reportes de ventas.",
    cover_image_url: null,
    published_at: "2026-02-20T00:00:00Z",
    tags: ["ERP", "integración", "automatización"],
  },
];

async function getPosts() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image_url, published_at, tags")
      .eq("published", true)
      .eq("category", "blog")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error);
      return null;
    }

    return data && data.length > 0 ? data : null;
  } catch (err) {
    console.error("Unexpected error fetching blog posts:", err);
    return null;
  }
}

export default async function BlogIndex() {
  const posts = await getPosts();
  const displayPosts = posts ?? mockPosts;
  const isMock = !posts;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card/50 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Blog
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Artículos, novedades y tendencias del marketplace B2B
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        {isMock && (
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {/* MOCK DATA - these are placeholder cards */}
            Contenido de ejemplo. Las publicaciones reales aparecerán aquí
            próximamente.
          </p>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post) => (
            <Link
              key={post.id}
              href={isMock ? "#" : `/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Cover image */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-3xl font-bold text-muted-foreground/30">
                      GX
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="mb-2 text-lg font-bold text-card-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-auto flex flex-col gap-3">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
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

                  {/* Date */}
                  {post.published_at && (
                    <time className="text-xs text-muted-foreground">
                      {formatDate(post.published_at)}
                    </time>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
