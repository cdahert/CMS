import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { TiptapRenderer } from "@/components/TiptapRenderer";
import { formatDate } from "@/lib/utils/format";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, title, slug, content, excerpt, cover_image_url, category, tags, author_id, published, published_at, created_at"
      )
      .eq("slug", slug)
      .eq("published", true)
      .eq("category", "blog")
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

async function getAuthorName(authorId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", authorId)
      .single();
    return data?.full_name ?? "GenioX Team";
  } catch {
    return "GenioX Team";
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Artículo no encontrado" };
  }

  return {
    title: post.title,
    description: post.excerpt ?? `Lee "${post.title}" en el blog de GenioX Commerce`,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const authorName = await getAuthorName(post.author_id);

  return (
    <div className="min-h-screen bg-background">
      {/* Back link */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            &larr; Volver al blog
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-12">
        {/* Cover image */}
        {post.cover_image_url && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{authorName}</span>
          <span className="text-border">|</span>
          {post.published_at && (
            <time>{formatDate(post.published_at)}</time>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="text-foreground">
          <TiptapRenderer content={post.content} />
        </div>
      </article>
    </div>
  );
}
