"use client";

import { useState } from "react";
import {
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useConnectionStatus,
  type ServiceStatus,
} from "@/hooks/useConnectionStatus";

function StatusIcon({ status }: { status: ServiceStatus }) {
  switch (status) {
    case "checking":
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    case "connected":
      return <CheckCircle className="h-4 w-4 text-primary" />;
    case "error":
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
}

function StatusLabel({ status }: { status: ServiceStatus }) {
  switch (status) {
    case "checking":
      return <span className="text-muted-foreground">Verificando...</span>;
    case "connected":
      return <span className="text-primary">Conectado</span>;
    case "error":
      return <span className="text-destructive">Error</span>;
  }
}

export function ConnectionStatus() {
  const diagnostics = useConnectionStatus();
  const [expanded, setExpanded] = useState(false);

  const services = [
    {
      name: "Variables de Entorno",
      status: diagnostics.env.status,
      detail: diagnostics.env.missing.length > 0
        ? `Faltantes: ${diagnostics.env.missing.join(", ")}`
        : undefined,
    },
    {
      name: "Cliente Supabase",
      status: diagnostics.supabase.status,
      detail: diagnostics.supabase.error,
    },
    {
      name: "Autenticación",
      status: diagnostics.auth.status,
      detail: diagnostics.auth.error
        ?? (diagnostics.auth.authenticated ? "Sesión activa" : "Sin sesión"),
    },
    {
      name: "Base de Datos",
      status: diagnostics.database.status,
      detail: diagnostics.database.error,
    },
  ];

  const overallIcon = diagnostics.overall === "error"
    ? <WifiOff className="h-4 w-4 text-destructive" />
    : diagnostics.overall === "connected"
      ? <Wifi className="h-4 w-4 text-primary" />
      : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm"
      >
        <div className="flex items-center gap-2">
          {overallIcon}
          <span className="font-medium text-card-foreground">
            Estado de Conexión
          </span>
          {diagnostics.overall === "error" && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              Problemas detectados
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <StatusIcon status={service.status} />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {service.name}
                  </p>
                  {service.detail && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {service.detail}
                    </p>
                  )}
                </div>
              </div>
              <StatusLabel status={service.status} />
            </div>
          ))}

          <div className="pt-2 border-t border-border">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              Recargar página
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
