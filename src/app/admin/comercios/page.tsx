"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import {
  Search,
  Store,
  Eye,
  X,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import type { Database } from "@/integrations/supabase/types";

type Commerce = Database["public"]["Tables"]["commerces"]["Row"];

const supabase = createClient();

const planColors: Record<string, string> = {
  inicial: "bg-muted text-muted-foreground",
  silver: "bg-muted text-foreground",
  gold: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  premium: "bg-primary/10 text-primary",
};

export default function AdminCommerces() {
  const [search, setSearch] = useState("");
  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Commerce | null>(null);
  const queryClient = useQueryClient();

  const { data: commerces = [], isLoading } = useQuery({
    queryKey: ["admin-commerces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commerces")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("commerces")
        .update({ active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { active }) => {
      toast.success(active ? "Comercio activado" : "Comercio suspendido");
      queryClient.invalidateQueries({ queryKey: ["admin-commerces"] });
      setToggleTarget(null);
    },
    onError: () => {
      toast.error("Error al actualizar comercio");
    },
  });

  const filtered = commerces.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.ruc?.includes(search)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Comercios</h1>
        <p className="text-muted-foreground">Gestiona todos los comercios de la plataforma</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o RUC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} comercio{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Store className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No se encontraron comercios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Creado</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((commerce) => (
                  <tr key={commerce.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{commerce.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{commerce.email ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                          planColors[commerce.plan] ?? "bg-muted text-muted-foreground"
                        )}
                      >
                        {commerce.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          commerce.active
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", commerce.active ? "bg-green-500" : "bg-destructive")} />
                        {commerce.active ? "Activo" : "Suspendido"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(commerce.created_at, { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCommerce(commerce)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={commerce.active ? "destructive" : "default"}
                          size="sm"
                          onClick={() => setToggleTarget(commerce)}
                        >
                          {commerce.active ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                          {commerce.active ? "Suspender" : "Activar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alert Dialog for toggle */}
      <AlertDialog.Root open={!!toggleTarget} onOpenChange={() => setToggleTarget(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <AlertDialog.Title className="text-lg font-semibold text-foreground">
              {toggleTarget?.active ? "Suspender comercio" : "Activar comercio"}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              {toggleTarget?.active
                ? `¿Estás seguro de que deseas suspender "${toggleTarget?.name}"? El comercio no podrá operar mientras esté suspendido.`
                : `¿Deseas activar "${toggleTarget?.name}"? El comercio podrá operar nuevamente.`}
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant={toggleTarget?.active ? "destructive" : "default"}
                  disabled={toggleMutation.isPending}
                  onClick={() => {
                    if (toggleTarget) {
                      toggleMutation.mutate({ id: toggleTarget.id, active: !toggleTarget.active });
                    }
                  }}
                >
                  {toggleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {toggleTarget?.active ? "Suspender" : "Activar"}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Detail modal */}
      <Dialog.Root open={!!selectedCommerce} onOpenChange={() => setSelectedCommerce(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                Detalle del Comercio
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            {selectedCommerce && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedCommerce.name}</h3>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        planColors[selectedCommerce.plan]
                      )}
                    >
                      {selectedCommerce.plan}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                  {selectedCommerce.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedCommerce.email}</span>
                    </div>
                  )}
                  {selectedCommerce.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedCommerce.phone}</span>
                    </div>
                  )}
                  {selectedCommerce.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedCommerce.address}</span>
                    </div>
                  )}
                  {selectedCommerce.ruc && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">RUC:</span>
                      <span className="text-foreground">{selectedCommerce.ruc}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      Creado: {formatDate(selectedCommerce.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className={cn("font-medium", selectedCommerce.active ? "text-green-600" : "text-destructive")}>
                      {selectedCommerce.active ? "Activo" : "Suspendido"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </motion.div>
  );
}
