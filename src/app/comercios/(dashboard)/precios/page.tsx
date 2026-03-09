"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  Plus,
  X,
  History,
  Package,
} from "lucide-react";
import { createClient } from "@/integrations/supabase/client";
import { useCommerceId } from "@/hooks/useCommerceId";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

interface PriceForm {
  product_id: string;
  amount: number;
  valid_from: string;
  valid_until: string;
}

const emptyForm: PriceForm = {
  product_id: "",
  amount: 0,
  valid_from: new Date().toISOString().split("T")[0],
  valid_until: "",
};

export default function CommercePrices() {
  const { commerceId } = useCommerceId();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PriceForm>(emptyForm);
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["commerce-products", commerceId],
    enabled: !!commerceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("commerce_id", commerceId!)
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: prices } = useQuery({
    queryKey: ["commerce-prices", commerceId],
    enabled: !!commerceId,
    queryFn: async () => {
      const productIds = products?.map((p) => p.id) ?? [];
      if (productIds.length === 0) return [];

      const { data, error } = await supabase
        .from("prices")
        .select("*")
        .in("product_id", productIds)
        .order("valid_from", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: priceHistory } = useQuery({
    queryKey: ["price-history", historyProductId],
    enabled: !!historyProductId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prices")
        .select("*")
        .eq("product_id", historyProductId!)
        .order("valid_from", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PriceForm) => {
      const { error } = await supabase.from("prices").insert({
        product_id: data.product_id,
        amount: data.amount,
        currency: "BOB",
        valid_from: data.valid_from,
        valid_until: data.valid_until || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commerce-prices"] });
      toast.success("Precio creado exitosamente");
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Get current price for each product
  const getCurrentPrice = (productId: string) => {
    const now = new Date().toISOString();
    return prices?.find(
      (p) =>
        p.product_id === productId &&
        p.valid_from <= now &&
        (!p.valid_until || p.valid_until >= now)
    );
  };

  const inputClasses =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Precios</h1>
          <p className="text-muted-foreground">
            Gestiona los precios de tus productos en BOB
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Precio
        </button>
      </div>

      {/* New Price Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Nuevo Precio
                </h2>
                <button onClick={() => setShowForm(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Producto *
                  </label>
                  <select
                    value={form.product_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, product_id: e.target.value }))
                    }
                    className={inputClasses}
                  >
                    <option value="">Seleccionar producto</option>
                    {products?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.sku ? `(${p.sku})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Monto (BOB) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={inputClasses}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Válido desde *
                    </label>
                    <input
                      type="date"
                      value={form.valid_from}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, valid_from: e.target.value }))
                      }
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Válido hasta
                    </label>
                    <input
                      type="date"
                      value={form.valid_until}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, valid_until: e.target.value }))
                      }
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => createMutation.mutate(form)}
                  disabled={
                    !form.product_id ||
                    !form.amount ||
                    createMutation.isPending
                  }
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Guardando..." : "Crear Precio"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price History Modal */}
      <AnimatePresence>
        {historyProductId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) =>
              e.target === e.currentTarget && setHistoryProductId(null)
            }
          >
            <motion.div
              className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Historial de Precios
                </h2>
                <button onClick={() => setHistoryProductId(null)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto">
                {priceHistory && priceHistory.length > 0 ? (
                  priceHistory.map((price) => (
                    <div
                      key={price.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                    >
                      <span className="font-semibold text-card-foreground">
                        {formatCurrency(price.amount)}
                      </span>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>Desde: {formatDate(price.valid_from)}</div>
                        {price.valid_until && (
                          <div>Hasta: {formatDate(price.valid_until)}</div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Sin historial de precios.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products with Prices Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : products && products.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Producto
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  SKU
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Precio Actual
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const currentPrice = getCurrentPrice(product.id);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-card-foreground">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {product.sku ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {currentPrice ? (
                        <span className="font-semibold text-card-foreground">
                          {formatCurrency(currentPrice.amount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Sin precio
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setHistoryProductId(product.id)}
                        className="inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                        title="Historial"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setForm({
                            ...emptyForm,
                            product_id: product.id,
                          });
                          setShowForm(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                        title="Nuevo precio"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 shadow-sm">
          <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-card-foreground">
            Sin productos
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea productos primero para asignarles precios.
          </p>
        </div>
      )}
    </motion.div>
  );
}
