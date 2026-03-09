"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCommerceId } from "@/hooks/useCommerceId";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export function CommerceRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading: authLoading, error: authError } = useAuth();
  const { commerceId, loading: commerceLoading, error: commerceError } = useCommerceId();
  const router = useRouter();

  const loading = authLoading || commerceLoading;
  const error = authError || commerceError;

  useEffect(() => {
    if (!loading && !user && !error) {
      router.replace("/comercios");
    }
    if (!loading && user && !isAdmin && !commerceId && !error) {
      router.replace("/comercios");
    }
  }, [user, isAdmin, commerceId, loading, router, error]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Error de Conexión
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-medium">Posibles soluciones:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Verifica que las variables de entorno de Supabase estén configuradas</li>
              <li>Confirma que tu proyecto de Supabase esté activo</li>
              <li>Revisa tu conexión a internet</li>
              <li>Verifica que tu usuario tenga los permisos correctos</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
