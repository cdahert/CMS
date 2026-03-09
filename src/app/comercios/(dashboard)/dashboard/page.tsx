"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { createClient } from "@/integrations/supabase/client";
import { useCommerceId } from "@/hooks/useCommerceId";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export default function CommerceDashboard() {
  const { commerceId } = useCommerceId();
  const supabase = createClient();

  const { data: commerce } = useQuery({
    queryKey: ["commerce", commerceId],
    enabled: !!commerceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commerces")
        .select("*")
        .eq("id", commerceId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["commerce-products-summary", commerceId],
    enabled: !!commerceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock, low_stock_threshold, active")
        .eq("commerce_id", commerceId!);
      if (error) throw error;
      return data;
    },
  });

  const { data: latestSettlement } = useQuery({
    queryKey: ["commerce-latest-settlement", commerceId],
    enabled: !!commerceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settlements")
        .select("*")
        .eq("commerce_id", commerceId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const activeProducts = products?.filter((p) => p.active).length ?? 0;
  const lowStockProducts =
    products?.filter((p) => p.stock <= p.low_stock_threshold).length ?? 0;

  // MOCK DATA - Monthly sales for chart
  const monthlySales = [
    { month: "Oct", ventas: 12500 },
    { month: "Nov", ventas: 18200 },
    { month: "Dic", ventas: 24800 },
    { month: "Ene", ventas: 15600 },
    { month: "Feb", ventas: 21300 },
    { month: "Mar", ventas: 19700 },
  ];

  // MOCK DATA - Top products
  const topProducts = [
    { name: "Producto A", ventas: 8500 },
    { name: "Producto B", ventas: 6200 },
    { name: "Producto C", ventas: 4800 },
    { name: "Producto D", ventas: 3100 },
    { name: "Producto E", ventas: 2400 },
  ];

  // MOCK DATA - Monthly total
  const ventasMes = 19700;

  const kpis = [
    {
      label: "Productos Activos",
      value: activeProducts,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Stock Bajo",
      value: lowStockProducts,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      alert: lowStockProducts > 0,
    },
    {
      label: "Ventas del Mes",
      value: formatCurrency(ventasMes), // MOCK DATA
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+8.2%", // MOCK DATA
      positive: true,
    },
    {
      label: "Última Liquidación",
      value: latestSettlement
        ? formatCurrency(latestSettlement.net_payable)
        : "Sin liquidaciones",
      icon: Receipt,
      color: "text-primary",
      bgColor: "bg-primary/10",
      subtitle: latestSettlement
        ? formatDate(latestSettlement.period_end)
        : undefined,
    },
  ];

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeIn} custom={0}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {commerce?.name ?? "tu comercio"}
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            variants={fadeIn}
            custom={i + 1}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    kpi.alert ? "text-destructive" : "text-card-foreground"
                  }`}
                >
                  {kpi.value}
                </p>
                {kpi.subtitle && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {kpi.subtitle}
                  </p>
                )}
                {kpi.change && (
                  <div
                    className={`mt-1 flex items-center gap-1 text-xs ${
                      kpi.positive ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {kpi.positive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {kpi.change}
                  </div>
                )}
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bgColor}`}
              >
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Sales Chart */}
        <motion.div
          variants={fadeIn}
          custom={5}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Ventas Últimos 6 Meses
          </h2>
          {/* MOCK DATA */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Ventas",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Bar dataKey="ventas" radius={[6, 6, 0, 0]}>
                  {monthlySales.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        idx === monthlySales.length - 1
                          ? "hsl(var(--primary))"
                          : "hsl(var(--primary) / 0.4)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products Chart */}
        <motion.div
          variants={fadeIn}
          custom={6}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Top Productos
          </h2>
          {/* MOCK DATA */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  width={90}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Ventas",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Bar
                  dataKey="ventas"
                  fill="hsl(var(--primary))"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Commerce Summary */}
      {commerce && (
        <motion.div
          variants={fadeIn}
          custom={7}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Resumen del Comercio
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium text-card-foreground">
                {commerce.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-medium capitalize text-card-foreground">
                {commerce.plan}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NIT / RUC</p>
              <p className="font-medium text-card-foreground">
                {commerce.ruc ?? "No registrado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Miembro desde</p>
              <p className="font-medium text-card-foreground">
                {formatDate(commerce.created_at)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
