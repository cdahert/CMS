"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import {
  Search,
  Activity,
  User,
  Store,
  CreditCard,
  Shield,
  FileText,
  Tag,
  Bell,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const eventTypeIcons: Record<string, React.ElementType> = {
  user: User,
  commerce: Store,
  settlement: CreditCard,
  security: Shield,
  blog: FileText,
  offer: Tag,
  notification: Bell,
};

const eventTypeColors: Record<string, string> = {
  user: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  commerce: "bg-green-500/10 text-green-700 dark:text-green-400",
  settlement: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  security: "bg-red-500/10 text-red-700 dark:text-red-400",
  blog: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  offer: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  notification: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
};

// Mock activity data since there's no activity_log table yet
const mockActivities = [
  { id: "1", type: "commerce", action: "Nuevo comercio registrado", actor: "Sistema", detail: "Comercio 'TechStore Bolivia' creado", created_at: "2026-03-09T10:30:00Z" },
  { id: "2", type: "user", action: "Rol asignado", actor: "admin@geniox.com", detail: "Rol 'admin' asignado a usuario juan@mail.com", created_at: "2026-03-09T09:15:00Z" },
  { id: "3", type: "settlement", action: "Liquidación aprobada", actor: "admin@geniox.com", detail: "Liquidación #LQ-2026-0042 aprobada por Bs 12,500", created_at: "2026-03-08T16:45:00Z" },
  { id: "4", type: "security", action: "Intento de acceso fallido", actor: "unknown@mail.com", detail: "3 intentos fallidos desde IP 192.168.1.100", created_at: "2026-03-08T14:20:00Z" },
  { id: "5", type: "blog", action: "Artículo publicado", actor: "editor@geniox.com", detail: "Artículo 'Guía de comercio electrónico' publicado", created_at: "2026-03-08T11:00:00Z" },
  { id: "6", type: "offer", action: "Oferta creada", actor: "admin@geniox.com", detail: "Oferta '20% Descuento Marzo' creada", created_at: "2026-03-07T15:30:00Z" },
  { id: "7", type: "commerce", action: "Comercio suspendido", actor: "admin@geniox.com", detail: "Comercio 'QuickShop' suspendido por incumplimiento", created_at: "2026-03-07T10:00:00Z" },
  { id: "8", type: "settlement", action: "Liquidación pagada", actor: "Sistema", detail: "Liquidación #LQ-2026-0038 marcada como pagada", created_at: "2026-03-06T17:00:00Z" },
  { id: "9", type: "user", action: "Nuevo usuario registrado", actor: "Sistema", detail: "Usuario maria@gmail.com registrado", created_at: "2026-03-06T09:30:00Z" },
  { id: "10", type: "notification", action: "Notificación masiva enviada", actor: "admin@geniox.com", detail: "Notificación enviada a 45 comercios", created_at: "2026-03-05T14:00:00Z" },
];

export default function AdminActivity() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = mockActivities.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.action.toLowerCase().includes(q) ||
        a.actor.toLowerCase().includes(q) ||
        a.detail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registro de Actividad</h1>
        <p className="text-muted-foreground">Historial de acciones y eventos en la plataforma</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar actividad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Todos los tipos</option>
          <option value="user">Usuarios</option>
          <option value="commerce">Comercios</option>
          <option value="settlement">Liquidaciones</option>
          <option value="security">Seguridad</option>
          <option value="blog">Blog</option>
          <option value="offer">Ofertas</option>
          <option value="notification">Notificaciones</option>
        </select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} evento{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Activity className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No se encontraron eventos</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((activity) => {
              const Icon = eventTypeIcons[activity.type] ?? Activity;
              const colorClass = eventTypeColors[activity.type] ?? "bg-muted text-muted-foreground";
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4">
                  <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full", colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{activity.action}</span>
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", colorClass)}>
                        {activity.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{activity.detail}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.actor}</span>
                      <span>·</span>
                      <span>
                        {formatDate(activity.created_at, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
