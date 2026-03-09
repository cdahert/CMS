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
  Search,
  Receipt,
  Plus,
  CheckCircle,
  DollarSign,
  Clock,
  Loader2,
  X,
  Save,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
const supabase = createClient();

// MOCK DATA for chart
const mockMonthlyData = [
  { month: "Oct", total: 32500 },
  { month: "Nov", total: 41200 },
  { month: "Dic", total: 55800 },
  { month: "Ene", total: 38700 },
  { month: "Feb", total: 47300 },
  { month: "Mar", total: 52100 },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  approved: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  paid: "bg-green-500/10 text-green-700 dark:text-green-400",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  paid: "Pagado",
};

export default function AdminSettlements() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [newSettlement, setNewSettlement] = useState({
    commerce_id: "",
    period_start: "",
    period_end: "",
    gross_sales: 0,
    commission_rate: 15,
    growth_discount: 0,
    management_discount: 0,
    communication_discount: 0,
    notes: "",
  });

  const { data: settlements = [], isLoading } = useQuery({
    queryKey: ["admin-settlements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settlements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: commerces = [] } = useQuery({
    queryKey: ["admin-commerces-settle"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commerces")
        .select("id, name, plan")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: commissionMatrix = [] } = useQuery({
    queryKey: ["admin-commission-matrix"],
    queryFn: async () => {
      const { data, error } = await supabase.from("commission_matrix").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const finalRate = Math.max(
        0,
        newSettlement.commission_rate -
          newSettlement.growth_discount -
          newSettlement.management_discount -
          newSettlement.communication_discount
      );
      const commissionAmount = (newSettlement.gross_sales * finalRate) / 100;
      const netPayable = newSettlement.gross_sales - commissionAmount;

      const { error } = await supabase.from("settlements").insert({
        commerce_id: newSettlement.commerce_id,
        period_start: newSettlement.period_start,
        period_end: newSettlement.period_end,
        gross_sales: newSettlement.gross_sales,
        commission_rate: newSettlement.commission_rate,
        growth_discount: newSettlement.growth_discount,
        management_discount: newSettlement.management_discount,
        communication_discount: newSettlement.communication_discount,
        final_commission_rate: finalRate,
        commission_amount: commissionAmount,
        shipping_cost: 0,
        net_payable: netPayable,
        status: "pending",
        notes: newSettlement.notes || null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Liquidación creada");
      queryClient.invalidateQueries({ queryKey: ["admin-settlements"] });
      setCreateOpen(false);
      setNewSettlement({
        commerce_id: "",
        period_start: "",
        period_end: "",
        gross_sales: 0,
        commission_rate: 15,
        growth_discount: 0,
        management_discount: 0,
        communication_discount: 0,
        notes: "",
      });
    },
    onError: () => {
      toast.error("Error al crear liquidación");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const update: Record<string, string> = { status };
      if (status === "approved") update.approved_at = new Date().toISOString();
      if (status === "paid") update.paid_at = new Date().toISOString();

      for (const id of ids) {
        const { error } = await supabase.from("settlements").update(update).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_, { status }) => {
      toast.success(`${selectedIds.length} liquidación(es) actualizada(s) a "${statusLabels[status] ?? status}"`);
      queryClient.invalidateQueries({ queryKey: ["admin-settlements"] });
      setSelectedIds([]);
    },
    onError: () => {
      toast.error("Error al actualizar liquidaciones");
    },
  });

  const filtered = settlements.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    const commerce = commerces.find((c) => c.id === s.commerce_id);
    if (search && !commerce?.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalAmount = settlements.reduce((acc, s) => acc + s.net_payable, 0);
  const pendingAmount = settlements
    .filter((s) => s.status === "pending")
    .reduce((acc, s) => acc + s.net_payable, 0);
  const paidAmount = settlements
    .filter((s) => s.status === "paid")
    .reduce((acc, s) => acc + s.net_payable, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  const handleCommerceSelect = (commerceId: string) => {
    setNewSettlement((prev) => ({ ...prev, commerce_id: commerceId }));
    const commerce = commerces.find((c) => c.id === commerceId);
    if (commerce) {
      const matrix = commissionMatrix.find((m) => m.plan === commerce.plan);
      if (matrix) {
        setNewSettlement((prev) => ({
          ...prev,
          commerce_id: commerceId,
          commission_rate: matrix.commission_initial,
          growth_discount: matrix.growth_discount,
          management_discount: matrix.management_discount,
          communication_discount: matrix.communication_discount,
        }));
      }
    }
  };

  const calcFinalRate = () =>
    Math.max(
      0,
      newSettlement.commission_rate -
        newSettlement.growth_discount -
        newSettlement.management_discount -
        newSettlement.communication_discount
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Liquidaciones</h1>
          <p className="text-muted-foreground">Gestión de liquidaciones y pagos a comercios</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva liquidación
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total liquidado", value: totalAmount, icon: CreditCard, color: "text-foreground" },
          { label: "Pendiente", value: pendingAmount, icon: Clock, color: "text-yellow-600" },
          { label: "Pagado", value: paidAmount, icon: CheckCircle, color: "text-green-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={cn("h-5 w-5", kpi.color)} />
            </div>
            <div className={cn("mt-2 text-2xl font-bold", kpi.color)}>
              {formatCurrency(kpi.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Liquidaciones por Mes</h3>
        {/* MOCK DATA */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockMonthlyData}>
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
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por comercio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="paid">Pagado</option>
        </select>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedIds.length} seleccionados</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => statusMutation.mutate({ ids: selectedIds, status: "approved" })}
              disabled={statusMutation.isPending}
            >
              <CheckCircle className="h-4 w-4" />
              Aprobar
            </Button>
            <Button
              size="sm"
              onClick={() => statusMutation.mutate({ ids: selectedIds, status: "paid" })}
              disabled={statusMutation.isPending}
            >
              <DollarSign className="h-4 w-4" />
              Marcar pagado
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Receipt className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No se encontraron liquidaciones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Comercio</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Período</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ventas Bruto</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Comisión</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Neto</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const commerce = commerces.find((c) => c.id === s.commerce_id);
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {commerce?.name ?? s.commerce_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(s.period_start, { day: "numeric", month: "short" })} -{" "}
                        {formatDate(s.period_end, { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3 text-foreground">{formatCurrency(s.gross_sales)}</td>
                      <td className="px-4 py-3 text-foreground">
                        {formatCurrency(s.commission_amount)}{" "}
                        <span className="text-xs text-muted-foreground">({s.final_commission_rate}%)</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(s.net_payable)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            statusColors[s.status] ?? "bg-muted text-muted-foreground"
                          )}
                        >
                          {statusLabels[s.status] ?? s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {s.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => statusMutation.mutate({ ids: [s.id], status: "approved" })}
                              disabled={statusMutation.isPending}
                            >
                              Aprobar
                            </Button>
                          )}
                          {s.status === "approved" && (
                            <Button
                              size="sm"
                              onClick={() => statusMutation.mutate({ ids: [s.id], status: "paid" })}
                              disabled={statusMutation.isPending}
                            >
                              Pagar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create settlement modal */}
      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                Nueva Liquidación
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-foreground">Comercio</Label>
                <select
                  value={newSettlement.commerce_id}
                  onChange={(e) => handleCommerceSelect(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Seleccionar comercio</option>
                  {commerces.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.plan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Inicio período</Label>
                  <Input
                    type="date"
                    value={newSettlement.period_start}
                    onChange={(e) =>
                      setNewSettlement({ ...newSettlement, period_start: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-foreground">Fin período</Label>
                  <Input
                    type="date"
                    value={newSettlement.period_end}
                    onChange={(e) =>
                      setNewSettlement({ ...newSettlement, period_end: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-foreground">Ventas brutas (BOB)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSettlement.gross_sales}
                  onChange={(e) =>
                    setNewSettlement({ ...newSettlement, gross_sales: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Comisión base %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSettlement.commission_rate}
                    onChange={(e) =>
                      setNewSettlement({
                        ...newSettlement,
                        commission_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-foreground">Desc. crecimiento %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSettlement.growth_discount}
                    onChange={(e) =>
                      setNewSettlement({
                        ...newSettlement,
                        growth_discount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Desc. gestión %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSettlement.management_discount}
                    onChange={(e) =>
                      setNewSettlement({
                        ...newSettlement,
                        management_discount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-foreground">Desc. comunicación %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSettlement.communication_discount}
                    onChange={(e) =>
                      setNewSettlement({
                        ...newSettlement,
                        communication_discount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Calculation preview */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <h4 className="font-medium text-foreground">Resumen de cálculo</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasa final:</span>
                  <span className="text-foreground">{calcFinalRate().toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Comisión:</span>
                  <span className="text-foreground">
                    {formatCurrency((newSettlement.gross_sales * calcFinalRate()) / 100)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-foreground">Neto a pagar:</span>
                  <span className="text-foreground">
                    {formatCurrency(
                      newSettlement.gross_sales -
                        (newSettlement.gross_sales * calcFinalRate()) / 100
                    )}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-foreground">Notas</Label>
                <textarea
                  value={newSettlement.notes}
                  onChange={(e) => setNewSettlement({ ...newSettlement, notes: e.target.value })}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Notas opcionales"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={
                    !newSettlement.commerce_id ||
                    !newSettlement.period_start ||
                    !newSettlement.period_end ||
                    createMutation.isPending
                  }
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Crear liquidación
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </motion.div>
  );
}
