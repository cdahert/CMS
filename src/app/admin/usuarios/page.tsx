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
  Users,
  ShieldCheck,
  ShieldOff,
  Loader2,
  UserCog,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { AppRole } from "@/integrations/supabase/types";

const supabase = createClient();

interface ProfileWithRoles {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: AppRole[];
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleAction, setRoleAction] = useState<{
    userId: string;
    userName: string;
    role: AppRole;
    action: "assign" | "revoke";
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (profileError) throw profileError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
      if (rolesError) throw rolesError;

      const userList: ProfileWithRoles[] = (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
      }));

      return userList;
    },
  });

  const rolesMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
      action,
    }: {
      userId: string;
      role: AppRole;
      action: "assign" | "revoke";
    }) => {
      if (action === "assign") {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);
        if (error) throw error;
      }
    },
    onSuccess: (_, { role, action }) => {
      toast.success(
        action === "assign"
          ? `Rol "${role}" asignado correctamente`
          : `Rol "${role}" revocado correctamente`
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setRoleAction(null);
    },
    onError: () => {
      toast.error("Error al modificar rol");
    },
  });

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role: AppRole) => {
    const styles: Record<AppRole, string> = {
      admin: "bg-primary/10 text-primary",
      commerce: "bg-green-500/10 text-green-700 dark:text-green-400",
    };
    const icons: Record<AppRole, React.ReactNode> = {
      admin: <ShieldCheck className="h-3 w-3" />,
      commerce: <Store className="h-3 w-3" />,
    };
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          styles[role]
        )}
      >
        {icons[role]}
        {role}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
        <p className="text-muted-foreground">Gestiona usuarios y sus roles en la plataforma</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Roles</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registrado</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">
                          {user.full_name ?? "Sin nombre"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Sin roles</span>
                        ) : (
                          user.roles.map((role) => (
                            <span key={role}>{roleBadge(role)}</span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.created_at, { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!user.roles.includes("admin") ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setRoleAction({
                                userId: user.id,
                                userName: user.full_name ?? user.email ?? "este usuario",
                                role: "admin",
                                action: "assign",
                              })
                            }
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Admin
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setRoleAction({
                                userId: user.id,
                                userName: user.full_name ?? user.email ?? "este usuario",
                                role: "admin",
                                action: "revoke",
                              })
                            }
                          >
                            <ShieldOff className="h-4 w-4" />
                            Quitar Admin
                          </Button>
                        )}
                        {!user.roles.includes("commerce") ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setRoleAction({
                                userId: user.id,
                                userName: user.full_name ?? user.email ?? "este usuario",
                                role: "commerce",
                                action: "assign",
                              })
                            }
                          >
                            <Store className="h-4 w-4" />
                            Commerce
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setRoleAction({
                                userId: user.id,
                                userName: user.full_name ?? user.email ?? "este usuario",
                                role: "commerce",
                                action: "revoke",
                              })
                            }
                          >
                            <ShieldOff className="h-4 w-4" />
                            Quitar Commerce
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm role change dialog */}
      <AlertDialog.Root open={!!roleAction} onOpenChange={() => setRoleAction(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <AlertDialog.Title className="text-lg font-semibold text-foreground">
              {roleAction?.action === "assign" ? "Asignar rol" : "Revocar rol"}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              {roleAction?.action === "assign"
                ? `¿Deseas asignar el rol "${roleAction?.role}" a ${roleAction?.userName}?`
                : `¿Deseas revocar el rol "${roleAction?.role}" de ${roleAction?.userName}?`}
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant={roleAction?.action === "revoke" ? "destructive" : "default"}
                  disabled={rolesMutation.isPending}
                  onClick={() => {
                    if (roleAction) {
                      rolesMutation.mutate({
                        userId: roleAction.userId,
                        role: roleAction.role,
                        action: roleAction.action,
                      });
                    }
                  }}
                >
                  {rolesMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirmar
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </motion.div>
  );
}
