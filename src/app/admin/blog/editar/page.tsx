"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const supabase = createClient();

export default function AdminBlogEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_url: "",
    tags: "",
    status: "draft",
  });

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-blog-post", postId],
    queryFn: async () => {
      if (!postId) return null;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        cover_url: post.cover_url ?? "",
        tags: post.tags?.join(", ") ?? "",
        status: post.status,
      });
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!postId) return;
      const { error } = await supabase
        .from("blog_posts")
        .update({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt || null,
          content: form.content,
          cover_url: form.cover_url || null,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
          status: form.status,
          published_at:
            form.status === "published" && post?.status !== "published"
              ? new Date().toISOString()
              : post?.published_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Artículo actualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      router.push("/admin/blog");
    },
    onError: () => {
      toast.error("Error al actualizar artículo");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-muted-foreground">Artículo no encontrado</p>
        <Link href="/admin/blog" className="mt-4">
          <Button variant="outline">Volver al blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Artículo</h1>
          <p className="text-muted-foreground">Modifica el contenido del artículo</p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <Label className="text-foreground">Título</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título del artículo"
          />
        </div>

        <div>
          <Label className="text-foreground">Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="url-del-articulo"
          />
        </div>

        <div>
          <Label className="text-foreground">Extracto</Label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Breve descripción del artículo"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <Label className="text-foreground">Contenido</Label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Contenido del artículo (HTML soportado)"
            className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <Label className="text-foreground">URL de portada</Label>
          <Input
            value={form.cover_url}
            onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label className="text-foreground">Tags (separados por coma)</Label>
          <Input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="ecommerce, marketing, tips"
          />
        </div>

        <div>
          <Label className="text-foreground">Estado</Label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link href="/admin/blog">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={!form.title || !form.content || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar cambios
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
