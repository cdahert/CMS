"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface CommerceIdState {
  commerceId: string | null;
  loading: boolean;
  error: string | null;
}

export function useCommerceId(): CommerceIdState {
  const { user, isAdmin, loading: authLoading, error: authError } = useAuth();
  const [commerceId, setCommerceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchCommerceId() {
      try {
        if (isAdmin) {
          const { data, error: queryError } = await supabase
            .from("commerces")
            .select("id")
            .limit(1)
            .single();

          if (queryError) {
            if (queryError.code === "PGRST116") {
              setError("No hay comercios registrados en la plataforma.");
            } else {
              setError(`Error al obtener comercio: ${queryError.message}`);
            }
          } else {
            setCommerceId(data?.id ?? null);
          }
        } else {
          const { data, error: queryError } = await supabase
            .from("commerce_members")
            .select("commerce_id")
            .eq("user_id", user!.id)
            .limit(1)
            .single();

          if (queryError) {
            if (queryError.code === "PGRST116") {
              setError("Tu usuario no está asociado a ningún comercio. Contacta al administrador.");
            } else {
              setError(`Error al obtener membresía: ${queryError.message}`);
            }
          } else {
            setCommerceId(data?.commerce_id ?? null);
          }
        }
      } catch (err) {
        setError(`Error de conexión: ${err instanceof Error ? err.message : "Error desconocido"}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCommerceId();
  }, [user, isAdmin, authLoading, authError]);

  return { commerceId, loading, error };
}
