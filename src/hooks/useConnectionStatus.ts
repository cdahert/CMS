"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/integrations/supabase/client";
import { validateEnv } from "@/lib/env";

export type ServiceStatus = "checking" | "connected" | "error";

export interface ConnectionDiagnostics {
  env: { status: ServiceStatus; missing: string[] };
  supabase: { status: ServiceStatus; error?: string };
  auth: { status: ServiceStatus; authenticated: boolean; error?: string };
  database: { status: ServiceStatus; error?: string };
  overall: ServiceStatus;
}

const initial: ConnectionDiagnostics = {
  env: { status: "checking", missing: [] },
  supabase: { status: "checking" },
  auth: { status: "checking", authenticated: false },
  database: { status: "checking" },
  overall: "checking",
};

export function useConnectionStatus(): ConnectionDiagnostics {
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostics>(initial);

  useEffect(() => {
    async function check() {
      const result = { ...initial };

      // 1. Validate environment variables
      const envResult = validateEnv();
      if (!envResult.valid) {
        result.env = { status: "error", missing: envResult.missing };
        result.supabase = { status: "error", error: "Variables de entorno faltantes" };
        result.auth = { status: "error", authenticated: false, error: "Sin conexión" };
        result.database = { status: "error", error: "Sin conexión" };
        result.overall = "error";
        setDiagnostics({ ...result });
        return;
      }
      result.env = { status: "connected", missing: [] };

      // 2. Test Supabase client creation
      let supabase;
      try {
        supabase = createClient();
        result.supabase = { status: "connected" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al crear cliente Supabase";
        result.supabase = { status: "error", error: message };
        result.auth = { status: "error", authenticated: false, error: "Cliente no disponible" };
        result.database = { status: "error", error: "Cliente no disponible" };
        result.overall = "error";
        setDiagnostics({ ...result });
        return;
      }

      // 3. Test auth connection
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error && error.message !== "Auth session missing!") {
          result.auth = { status: "error", authenticated: false, error: error.message };
        } else {
          result.auth = {
            status: "connected",
            authenticated: !!data.user,
          };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error de autenticación";
        result.auth = { status: "error", authenticated: false, error: message };
      }

      // 4. Test database connection with a simple query
      try {
        const { error } = await supabase
          .from("commerces")
          .select("id", { count: "exact", head: true });

        if (error) {
          result.database = { status: "error", error: error.message };
        } else {
          result.database = { status: "connected" };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error de base de datos";
        result.database = { status: "error", error: message };
      }

      // Calculate overall status
      const statuses = [result.env.status, result.supabase.status, result.auth.status, result.database.status];
      result.overall = statuses.some((s) => s === "error")
        ? "error"
        : statuses.some((s) => s === "checking")
          ? "checking"
          : "connected";

      setDiagnostics({ ...result });
    }

    check();
  }, []);

  return diagnostics;
}
