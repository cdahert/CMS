"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { AppRole } from "@/integrations/supabase/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  error: string | null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate env vars before trying to create client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Variables de entorno de Supabase no configuradas. Verifica NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      setError(`Error al crear cliente Supabase: ${err instanceof Error ? err.message : "Error desconocido"}`);
      setLoading(false);
      return;
    }

    async function getUser() {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase!.auth.getUser();

        if (authError) {
          // "Auth session missing!" is expected for unauthenticated users
          if (authError.message !== "Auth session missing!") {
            setError(`Error de autenticación: ${authError.message}`);
          }
          setLoading(false);
          return;
        }

        setUser(authUser);

        if (authUser) {
          const { data: userRoles, error: rolesError } = await supabase!
            .from("user_roles")
            .select("role")
            .eq("user_id", authUser.id);

          if (rolesError) {
            setError(`Error al obtener roles: ${rolesError.message}`);
          } else if (userRoles) {
            setRoles(userRoles.map((r: { role: AppRole }) => r.role));
          }
        }
      } catch (err) {
        setError(`Error de conexión: ${err instanceof Error ? err.message : "No se pudo conectar con Supabase"}`);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setRoles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    roles,
    isAdmin: roles.includes("admin"),
    error,
  };
}
