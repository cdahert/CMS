"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import {
  Bell,
  Send,
  Trash2,
  Loader2,
  CheckCheck,
  Search,
  Plus,
  X,
  Save,
  Mail,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

const supabase = createClient();

const typeIcons: Record<string, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  alert: Bell,
};

const typeColors: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  success: "bg-green-500/10 text-green-700 dark:text-green-400",
  alert: "bg-red-500/10 text-red-700 dark:text-red-400",
};

// Mock notifications
const mockNotifications = [
  { id: "1", type: "info", title: "Nuevo comercio registrado", message: "TechStore Bolivia se ha registrado en la plataforma", target: "admin", read: false, created_at: "2026-03-09T10:00:00Z" },
  { id: "2", type: "warning", title: "Liquidación pendiente", message: "Hay 5 liquidaciones pendientes de aprobación", target: "admin", read: false, created_at: "2026-03-09T08:30:00Z" },
  { id: "3", type: "success", title: "Pago procesado", message: "Liquidación #LQ-2026-0042 pagada correctamente", target: "admin", read: true, created_at: "2026-03-08T16:00:00Z" },
  { id: "4", type: "alert", title: "Acceso sospechoso", message: "Se detectaron múltiples intentos de acceso fallidos desde IP 192.168.1.100", target: "admin", read: true, created_at: "2026-03-08T14:20:00Z" },
  { id: "5", type: "info", title: "Actualización del sistema", message: "Se ha actualizado la plataforma a la versión 2.4.1", target: "all", read: true, created_at: "2026-03-07T09:00:00Z" },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [newNotification, setNewNotification] = useState({
    type: "info",
    title: "",
    message: "",
    target: "all",
  });

  const filtered = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Todas las notificaciones marcadas como leídas");
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setDeleteTarget(null);
    toast.success("Notificación eliminada");
  };

  const sendNotification = () => {
    const newId = String(Date.now());
    setNotifications((prev) => [
      {
        id: newId,
        ...newNotification,
        read: true,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    toast.success("Notificación enviada");
    setComposeOpen(false);
    setNewNotification({ type: "info", title: "", message: "", target: "all" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notificación${unreadCount !== 1 ? "es" : ""} sin leer`
              : "Todas las notificaciones leídas"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" />
              Marcar todas leídas
            </Button>
          )}
          <Button onClick={() => setComposeOpen(true)}>
            <Plus className="h-4 w-4" />
            Nueva notificación
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar notificaciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Bell className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((notification) => {
              const Icon = typeIcons[notification.type] ?? Bell;
              const colorClass = typeColors[notification.type] ?? "bg-muted text-muted-foreground";
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-4 p-4 transition-colors",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => markRead(notification.id)}
                >
                  <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full", colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium text-foreground", !notification.read && "font-semibold")}>
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{notification.target}</span>
                      <span>·</span>
                      <span>
                        {formatDate(notification.created_at, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(notification.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compose Dialog */}
      <Dialog.Root open={composeOpen} onOpenChange={setComposeOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                Nueva Notificación
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-foreground">Tipo</Label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="info">Información</option>
                  <option value="warning">Advertencia</option>
                  <option value="success">Éxito</option>
                  <option value="alert">Alerta</option>
                </select>
              </div>

              <div>
                <Label className="text-foreground">Destinatario</Label>
                <select
                  value={newNotification.target}
                  onChange={(e) => setNewNotification({ ...newNotification, target: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">Todos</option>
                  <option value="admin">Solo administradores</option>
                  <option value="commerces">Solo comercios</option>
                </select>
              </div>

              <div>
                <Label className="text-foreground">Título</Label>
                <Input
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Título de la notificación"
                />
              </div>

              <div>
                <Label className="text-foreground">Mensaje</Label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Contenido del mensaje"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setComposeOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={sendNotification}
                  disabled={!newNotification.title || !newNotification.message}
                >
                  <Send className="h-4 w-4" />
                  Enviar
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirm */}
      <AlertDialog.Root open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <AlertDialog.Title className="text-lg font-semibold text-foreground">
              Eliminar notificación
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              ¿Estás seguro de que deseas eliminar esta notificación?
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="destructive"
                  onClick={() => deleteTarget && deleteNotification(deleteTarget)}
                >
                  Eliminar
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </motion.div>
  );
}
