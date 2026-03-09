"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  History,
  Upload,
} from "lucide-react";
import { createClient } from "@/integrations/supabase/client";
import { useCommerceId } from "@/hooks/useCommerceId";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  description: string;
  image_url: string;
  stock: number;
  low_stock_threshold: number;
}

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  category: "",
  description: "",
  image_url: "",
  stock: 0,
  low_stock_threshold: 5,
};

const categories = [
  "Electrónica",
  "Ropa",
  "Alimentos",
  "Hogar",
  "Deportes",
  "Salud",
  "Juguetes",
  "Otros",
];

export default function CommerceProducts() {
  const { commerceId } = useCommerceId();
  const { user } = useAuth();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [showMovements, setShowMovements] = useState<string | null>(null);
  const [movementQty, setMovementQty] = useState(0);
  const [movementReason, setMovementReason] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["commerce-products", commerceId],
    enabled: !!commerceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("commerce_id", commerceId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: movements } = useQuery({
    queryKey: ["inventory-movements", showMovements],
    enabled: !!showMovements,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_movements")
        .select("*")
        .eq("product_id", showMovements!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update({
            name: data.name,
            sku: data.sku || null,
            category: data.category || null,
            description: data.description || null,
            image_url: data.image_url || null,
            stock: data.stock,
            low_stock_threshold: data.low_stock_threshold,
          })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert({
          commerce_id: commerceId!,
          name: data.name,
          sku: data.sku || null,
          category: data.category || null,
          description: data.description || null,
          image_url: data.image_url || null,
          stock: data.stock,
          low_stock_threshold: data.low_stock_threshold,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commerce-products"] });
      toast.success(editingId ? "Producto actualizado" : "Producto creado");
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commerce-products"] });
      toast.success("Producto eliminado");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const movementMutation = useMutation({
    mutationFn: async ({
      productId,
      qty,
      reason,
    }: {
      productId: string;
      qty: number;
      reason: string;
    }) => {
      const product = products?.find((p) => p.id === productId);
      if (!product) throw new Error("Producto no encontrado");

      const newStock = product.stock + qty;
      if (newStock < 0) throw new Error("Stock no puede ser negativo");

      const { error: movError } = await supabase
        .from("inventory_movements")
        .insert({
          product_id: productId,
          commerce_id: commerceId!,
          quantity_change: qty,
          stock_after: newStock,
          reason: reason || null,
          created_by: user?.id ?? null,
        });
      if (movError) throw movError;

      const { error: updError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", productId);
      if (updError) throw updError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commerce-products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
      setMovementQty(0);
      setMovementReason("");
      toast.success("Movimiento registrado");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (product: NonNullable<typeof products>[0]) => {
    setForm({
      name: product.name,
      sku: product.sku ?? "",
      category: product.category ?? "",
      description: product.description ?? "",
      image_url: product.image_url ?? "",
      stock: product.stock,
      low_stock_threshold: product.low_stock_threshold,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const filteredProducts = products?.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

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
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClasses, "pl-9")}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={cn(inputClasses, "sm:w-48")}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              className="mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">
                  {editingId ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <button onClick={resetForm}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className={inputClasses}
                    placeholder="Nombre del producto"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sku: e.target.value }))
                      }
                      className={inputClasses}
                      placeholder="SKU-001"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Categoría
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className={inputClasses}
                    >
                      <option value="">Seleccionar</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Descripción
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className={inputClasses}
                    rows={3}
                    placeholder="Descripción del producto"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    URL de Imagen
                  </label>
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, image_url: e.target.value }))
                      }
                      className={inputClasses}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Stock Inicial
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          stock: parseInt(e.target.value) || 0,
                        }))
                      }
                      className={inputClasses}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Umbral Stock Bajo
                    </label>
                    <input
                      type="number"
                      value={form.low_stock_threshold}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          low_stock_threshold: parseInt(e.target.value) || 0,
                        }))
                      }
                      className={inputClasses}
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => saveMutation.mutate(form)}
                  disabled={!form.name || saveMutation.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saveMutation.isPending
                    ? "Guardando..."
                    : editingId
                      ? "Actualizar"
                      : "Crear"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory Movements Modal */}
      <AnimatePresence>
        {showMovements && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) =>
              e.target === e.currentTarget && setShowMovements(null)
            }
          >
            <motion.div
              className="mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Movimientos de Inventario
                </h2>
                <button onClick={() => setShowMovements(null)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Add movement */}
              <div className="mb-4 flex gap-2">
                <input
                  type="number"
                  placeholder="Cantidad (+/-)"
                  value={movementQty || ""}
                  onChange={(e) =>
                    setMovementQty(parseInt(e.target.value) || 0)
                  }
                  className={cn(inputClasses, "w-32")}
                />
                <input
                  type="text"
                  placeholder="Razón"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className={cn(inputClasses, "flex-1")}
                />
                <button
                  onClick={() =>
                    movementMutation.mutate({
                      productId: showMovements!,
                      qty: movementQty,
                      reason: movementReason,
                    })
                  }
                  disabled={!movementQty || movementMutation.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Registrar
                </button>
              </div>

              {/* Movements list */}
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {movements && movements.length > 0 ? (
                  movements.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                    >
                      <div>
                        <span
                          className={cn(
                            "font-semibold",
                            m.quantity_change > 0
                              ? "text-primary"
                              : "text-destructive"
                          )}
                        >
                          {m.quantity_change > 0 ? "+" : ""}
                          {m.quantity_change}
                        </span>
                        {m.reason && (
                          <span className="ml-2 text-muted-foreground">
                            {m.reason}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Stock: {m.stock_after} |{" "}
                        {formatDate(m.created_at, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Sin movimientos registrados.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
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
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Categoría
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isLowStock =
                  product.stock <= product.low_stock_threshold;
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-card-foreground">
                            {product.name}
                          </p>
                          {!product.active && (
                            <span className="text-xs text-muted-foreground">
                              Inactivo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {product.sku ?? "-"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {product.category ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          isLowStock
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {isLowStock && (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setShowMovements(product.id)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                          title="Movimientos"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "¿Estás seguro de eliminar este producto?"
                              )
                            )
                              deleteMutation.mutate(product.id);
                          }}
                          className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 shadow-sm">
          <Package className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-card-foreground">
            Sin productos
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || categoryFilter
              ? "No se encontraron productos con los filtros aplicados."
              : "Agrega tu primer producto para comenzar."}
          </p>
        </div>
      )}
    </motion.div>
  );
}
