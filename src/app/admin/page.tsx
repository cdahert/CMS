"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import {
  Store,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  Settings,
  Save,
  History,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

const supabase = createClient();

// MOCK DATA
const mockChartData = [
  { month: "Oct", ventas: 45200, comisiones: 6780 },
  { month: "Nov", ventas: 52100, comisiones: 7815 },
  { month: "Dic", ventas: 61800, comisiones: 9270 },
  { month: "Ene", ventas: 48300, comisiones: 7245 },
  { month: "Feb", ventas: 55900, comisiones: 8385 },
  { month: "Mar", ventas: 63400, comisiones: 9510 },
];

const statusCards = [
  { label: "Comercios", href: "/admin/comercios", icon: Store, color: "text-blue-500" },
  { label: "Liquidaciones", href: "/admin/liquidaciones", icon: CreditCard, color: "text-green-500" },
  { label: "Actividad", href: "/admin/actividad", icon: TrendingUp, color: "text-orange-500" },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings, color: "text-purple-500" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("resumen");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // KPI queries
  const { data: commerceCount = 0, isLoading: loadingCommerces } = useQuery({
    queryKey: ["admin-kpi-commerces"],
    queryFn: async () => {
      const { count } = await supabase
        .from("commerces")
        .select("*", { count: "exact", head: true })
        .eq("active", true);
      return count ?? 0;
    },
  });

  const { data: userCount = 0, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-kpi-users"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: productCount = 0, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-kpi-products"],
    queryFn: async () => {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: settlementCount = 0, isLoading: loadingSettlements } = useQuery({
    queryKey: ["admin-kpi-settlements"],
    queryFn: async () => {
      const { count } = await supabase
        .from("settlements")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  // Commission matrix
  const { data: commissions = [], isLoading: loadingCommissions } = useQuery({
    queryKey: ["admin-commissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_matrix")
        .select("*")
        .order("plan");
      if (error) throw error;
      return data;
    },
  });

  const { data: commissionHistory = [] } = useQuery({
    queryKey: ["admin-commission-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_matrix_history")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const [editedCommissions, setEditedCommissions] = useState<Record<string, Record<string, number>>>({});

  const saveCommissionsMutation = useMutation({
    mutationFn: async () => {
      for (const [id, changes] of Object.entries(editedCommissions)) {
        const original = commissions.find((c) => c.id === id);
        if (!original) continue;

        // Save history for each changed field
        for (const [field, newVal] of Object.entries(changes)) {
          const oldVal = original[field as keyof typeof original];
          if (oldVal !== newVal) {
            await supabase.from("commission_matrix_history").insert({
              matrix_id: id,
              plan: original.plan,
              field_changed: field,
              old_value: String(oldVal),
              new_value: String(newVal),
              changed_by: user?.id ?? null,
            });
          }
        }

        const { error } = await supabase
          .from("commission_matrix")
          .update({ ...changes, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Comisiones actualizadas correctamente");
      setEditedCommissions({});
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commission-history"] });
    },
    onError: () => {
      toast.error("Error al guardar comisiones");
    },
  });

  // Quick config state
  const [quickConfig, setQuickConfig] = useState({
    maintenance: false,
    autoApproval: true,
    notifications: true,
  });

  const handleCommissionChange = (id: string, field: string, value: number) => {
    setEditedCommissions((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), [field]: value },
    }));
  };

  const kpis = [
    { label: "Comercios activos", value: commerceCount, icon: Store, loading: loadingCommerces },
    { label: "Total usuarios", value: userCount, icon: Users, loading: loadingUsers },
    { label: "Total productos", value: productCount, icon: Package, loading: loadingProducts },
    { label: "Transacciones", value: settlementCount, icon: CreditCard, loading: loadingSettlements },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestión centralizada de la plataforma GenioX Commerce</p>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-border">
          {[
            { value: "resumen", label: "Resumen", icon: BarChart3 },
            { value: "comisiones", label: "Comisiones", icon: CreditCard },
            { value: "config", label: "Config rápida", icon: Settings },
          ].map((tab) => (
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

        {/* Tab: Resumen */}
        <Tabs.Content value="resumen" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                  <kpi.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-2 text-3xl font-bold text-foreground">
                  {kpi.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    kpi.value.toLocaleString()
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Ventas y Comisiones - Últimos 6 meses
            </h3>
            {/* MOCK DATA */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ventas" />
                  <Bar dataKey="comisiones" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Comisiones" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statusCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <card.icon className={cn("h-8 w-8", card.color)} />
                <span className="font-medium text-foreground">{card.label}</span>
              </Link>
            ))}
          </div>
        </Tabs.Content>

        {/* Tab: Comisiones */}
        <Tabs.Content value="comisiones" className="mt-6 space-y-6">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold text-foreground">Matriz de Comisiones</h3>
              <Button
                onClick={() => saveCommissionsMutation.mutate()}
                disabled={Object.keys(editedCommissions).length === 0 || saveCommissionsMutation.isPending}
              >
                {saveCommissionsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </div>

            {loadingCommissions ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : commissions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No se encontraron planes de comisión
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Comisión Inicial %</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Desc. Crecimiento</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Desc. Gestión</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Desc. Comunicación</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Desc. Envío</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Envío Fijo (BOB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((row) => (
                      <tr key={row.id} className="border-b border-border">
                        <td className="px-4 py-3">
                          <span className="font-medium capitalize text-foreground">
                            {row.label ?? row.plan}
                          </span>
                        </td>
                        {(
                          [
                            "commission_initial",
                            "growth_discount",
                            "management_discount",
                            "communication_discount",
                            "shipping_discount",
                            "shipping_fixed",
                          ] as const
                        ).map((field) => (
                          <td key={field} className="px-4 py-3">
                            <Input
                              type="number"
                              step="0.01"
                              className="h-8 w-24"
                              defaultValue={row[field]}
                              onChange={(e) =>
                                handleCommissionChange(row.id, field, parseFloat(e.target.value) || 0)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Commission history */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <History className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Historial de Cambios</h3>
            </div>
            {commissionHistory.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Sin cambios registrados</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campo</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Anterior</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nuevo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionHistory.map((entry) => (
                      <tr key={entry.id} className="border-b border-border">
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(entry.changed_at, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3 capitalize text-foreground">{entry.plan}</td>
                        <td className="px-4 py-3 text-foreground">{entry.field_changed}</td>
                        <td className="px-4 py-3 text-destructive">{entry.old_value}</td>
                        <td className="px-4 py-3 text-green-600">{entry.new_value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Tabs.Content>

        {/* Tab: Config rápida */}
        <Tabs.Content value="config" className="mt-6 space-y-6">
          <div className="max-w-lg rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Configuración Rápida</h3>

            <div className="space-y-6">
              {[
                {
                  key: "maintenance" as const,
                  label: "Modo Mantenimiento",
                  desc: "Muestra una página de mantenimiento a los visitantes",
                },
                {
                  key: "autoApproval" as const,
                  label: "Auto-aprobación de comercios",
                  desc: "Aprueba automáticamente nuevos comercios registrados",
                },
                {
                  key: "notifications" as const,
                  label: "Notificaciones por email",
                  desc: "Envía notificaciones de eventos importantes por email",
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch.Root
                    checked={quickConfig[item.key]}
                    onCheckedChange={(checked) =>
                      setQuickConfig((prev) => ({ ...prev, [item.key]: checked }))
                    }
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      quickConfig[item.key] ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <Switch.Thumb
                      className={cn(
                        "block h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                        quickConfig[item.key] ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </Switch.Root>
                </div>
              ))}
            </div>

            <Button
              className="mt-8"
              onClick={() => {
                toast.success("Configuración guardada correctamente");
              }}
            >
              <Save className="h-4 w-4" />
              Guardar configuración
            </Button>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </motion.div>
  );
}
