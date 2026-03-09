"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import {
  Shield,
  Lock,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Users,
  Activity,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Switch from "@radix-ui/react-switch";
import * as Tabs from "@radix-ui/react-tabs";
import { formatDate } from "@/lib/utils/format";

// Mock data
const mockSessions = [
  { id: "1", user: "admin@geniox.com", ip: "192.168.1.50", device: "Chrome / Windows", started_at: "2026-03-09T08:00:00Z", active: true },
  { id: "2", user: "editor@geniox.com", ip: "10.0.0.25", device: "Safari / macOS", started_at: "2026-03-09T07:30:00Z", active: true },
  { id: "3", user: "admin@geniox.com", ip: "192.168.1.50", device: "Chrome / Windows", started_at: "2026-03-08T14:00:00Z", active: false },
  { id: "4", user: "unknown@mail.com", ip: "203.0.113.42", device: "Firefox / Linux", started_at: "2026-03-08T11:20:00Z", active: false },
];

const mockSecurityLog = [
  { id: "1", event: "Login exitoso", user: "admin@geniox.com", ip: "192.168.1.50", severity: "low", created_at: "2026-03-09T08:00:00Z" },
  { id: "2", event: "Contraseña cambiada", user: "editor@geniox.com", ip: "10.0.0.25", severity: "medium", created_at: "2026-03-09T07:45:00Z" },
  { id: "3", event: "3 intentos de login fallidos", user: "unknown@mail.com", ip: "203.0.113.42", severity: "high", created_at: "2026-03-08T14:20:00Z" },
  { id: "4", event: "Rol admin asignado", user: "admin@geniox.com", ip: "192.168.1.50", severity: "high", created_at: "2026-03-08T10:00:00Z" },
  { id: "5", event: "API key regenerada", user: "admin@geniox.com", ip: "192.168.1.50", severity: "medium", created_at: "2026-03-07T16:30:00Z" },
  { id: "6", event: "Login exitoso", user: "commerce1@mail.com", ip: "172.16.0.10", severity: "low", created_at: "2026-03-07T09:00:00Z" },
];

const severityColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-700 dark:text-green-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const severityLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export default function AdminSecurity() {
  const [activeTab, setActiveTab] = useState("policies");

  const [policies, setPolicies] = useState({
    twoFactorRequired: false,
    minPasswordLength: 8,
    passwordExpireDays: 90,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    sessionTimeoutMinutes: 60,
    ipWhitelist: "",
    forceHttps: true,
    csrfProtection: true,
    rateLimiting: true,
    auditLogging: true,
  });

  const handleSavePolicies = () => {
    toast.success("Políticas de seguridad actualizadas");
  };

  const SwitchToggle = ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <Switch.Thumb
        className={cn(
          "block h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </Switch.Root>
  );

  const tabs = [
    { value: "policies", label: "Políticas", icon: Shield },
    { value: "sessions", label: "Sesiones", icon: Users },
    { value: "audit", label: "Auditoría", icon: Activity },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Seguridad</h1>
        <p className="text-muted-foreground">Políticas de seguridad, sesiones activas y auditoría</p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sesiones activas</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {mockSessions.filter((s) => s.active).length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Alertas altas</span>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <p className="mt-1 text-2xl font-bold text-destructive">
            {mockSecurityLog.filter((l) => l.severity === "high").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">2FA habilitado</span>
            <Key className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {policies.twoFactorRequired ? "Sí" : "No"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">HTTPS forzado</span>
            <Lock className="h-4 w-4 text-green-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {policies.forceHttps ? "Sí" : "No"}
          </p>
        </div>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-border">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Policies */}
        <Tabs.Content value="policies" className="mt-6">
          <div className="max-w-2xl space-y-6">
            <div className="space-y-4 rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Autenticación</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Requerir 2FA</p>
                  <p className="text-sm text-muted-foreground">Todos los administradores deben usar autenticación de dos factores</p>
                </div>
                <SwitchToggle
                  checked={policies.twoFactorRequired}
                  onCheckedChange={(checked) => setPolicies({ ...policies, twoFactorRequired: checked })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Longitud mínima de contraseña</Label>
                  <Input
                    type="number"
                    value={policies.minPasswordLength}
                    onChange={(e) => setPolicies({ ...policies, minPasswordLength: parseInt(e.target.value) || 8 })}
                  />
                </div>
                <div>
                  <Label className="text-foreground">Expiración de contraseña (días)</Label>
                  <Input
                    type="number"
                    value={policies.passwordExpireDays}
                    onChange={(e) => setPolicies({ ...policies, passwordExpireDays: parseInt(e.target.value) || 90 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Intentos de login máximos</Label>
                  <Input
                    type="number"
                    value={policies.maxLoginAttempts}
                    onChange={(e) => setPolicies({ ...policies, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                  />
                </div>
                <div>
                  <Label className="text-foreground">Bloqueo por intentos (minutos)</Label>
                  <Input
                    type="number"
                    value={policies.lockoutDurationMinutes}
                    onChange={(e) => setPolicies({ ...policies, lockoutDurationMinutes: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-foreground">Timeout de sesión (minutos)</Label>
                <Input
                  type="number"
                  value={policies.sessionTimeoutMinutes}
                  onChange={(e) => setPolicies({ ...policies, sessionTimeoutMinutes: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Protección</h3>
              {[
                { key: "forceHttps" as const, label: "Forzar HTTPS", desc: "Redirigir todo el tráfico a HTTPS" },
                { key: "csrfProtection" as const, label: "Protección CSRF", desc: "Proteger contra ataques Cross-Site Request Forgery" },
                { key: "rateLimiting" as const, label: "Rate Limiting", desc: "Limitar solicitudes por IP para prevenir abuso" },
                { key: "auditLogging" as const, label: "Registro de auditoría", desc: "Registrar todas las acciones administrativas" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <SwitchToggle
                    checked={policies[item.key]}
                    onCheckedChange={(checked) => setPolicies({ ...policies, [item.key]: checked })}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">IP Whitelist</h3>
              <p className="text-sm text-muted-foreground">
                Solo permitir acceso admin desde estas IPs (separadas por coma). Dejar vacío para permitir todas.
              </p>
              <Input
                value={policies.ipWhitelist}
                onChange={(e) => setPolicies({ ...policies, ipWhitelist: e.target.value })}
                placeholder="192.168.1.0/24, 10.0.0.0/8"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSavePolicies}>
                <Save className="h-4 w-4" />
                Guardar políticas
              </Button>
            </div>
          </div>
        </Tabs.Content>

        {/* Sessions */}
        <Tabs.Content value="sessions" className="mt-6">
          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dispositivo</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Inicio</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSessions.map((session) => (
                    <tr key={session.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{session.user}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{session.ip}</td>
                      <td className="px-4 py-3 text-muted-foreground">{session.device}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(session.started_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                            session.active
                              ? "bg-green-500/10 text-green-700 dark:text-green-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", session.active ? "bg-green-500" : "bg-muted-foreground")} />
                          {session.active ? "Activa" : "Expirada"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {session.active && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => toast.success("Sesión terminada")}
                          >
                            Terminar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tabs.Content>

        {/* Audit Log */}
        <Tabs.Content value="audit" className="mt-6">
          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Evento</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Severidad</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSecurityLog.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{log.event}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.user}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            severityColors[log.severity] ?? "bg-muted text-muted-foreground"
                          )}
                        >
                          {severityLabels[log.severity] ?? log.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(log.created_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </motion.div>
  );
}
