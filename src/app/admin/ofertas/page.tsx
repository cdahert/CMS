"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/integrations/supabase/client";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import {
  Search,
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Save,
  Percent,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type Offer = Database["public"]["Tables"]["offers"]["Row"];

const supabase = createClient();

const emptyForm = {
  name: "",
  description: "",
  discount_type: "percentage",
  discount_value: 0,
  starts_at: new Date().toISOString().slice(0, 16),
  ends_at: "",
  promo_code: "",
  max_uses: "",
  active: true,
  is_multi_commerce: false,
  single_use_per_customer: false,
  categories: "",
  commerce_id: null as string | null,
};

export default function AdminOffers() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedCommerces, setSelectedCommerces] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: commerces = [] } = useQuery({
    queryKey: ["admin-commerces-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commerces")
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const _products = useQuery({
    queryKey: ["admin-products-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, commerce_id")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        starts_at: form.starts_at,
        ends_at: form.ends_at || null,
        promo_code: form.promo_code || null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        active: form.active,
        is_multi_commerce: form.is_multi_commerce,
        single_use_per_customer: form.single_use_per_customer,
        categories: form.categories ? form.categories.split(",").map((c) => c.trim()) : [],
        commerce_id: form.is_multi_commerce ? null : form.commerce_id,
      };

      if (editingOffer) {
        const { error } = await supabase
          .from("offers")
          .update(payload)
          .eq("id", editingOffer.id);
        if (error) throw error;

        // Update multi-commerce associations
        if (form.is_multi_commerce && selectedCommerces.length > 0) {
          await supabase.from("offer_commerces").delete().eq("offer_id", editingOffer.id);
          const inserts = selectedCommerces.map((cid) => ({
            offer_id: editingOffer.id,
            commerce_id: cid,
          }));
          await supabase.from("offer_commerces").insert(inserts);
        }
      } else {
        const { data, error } = await supabase
          .from("offers")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;

        if (form.is_multi_commerce && selectedCommerces.length > 0 && data) {
          const inserts = selectedCommerces.map((cid) => ({
            offer_id: data.id,
            commerce_id: cid,
          }));
          await supabase.from("offer_commerces").insert(inserts);
        }
      }
    },
    onSuccess: () => {
      toast.success(editingOffer ? "Oferta actualizada" : "Oferta creada");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      closeForm();
    },
    onError: () => {
      toast.error("Error al guardar oferta");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Oferta eliminada");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Error al eliminar oferta");
    },
  });

  const openCreate = () => {
    setEditingOffer(null);
    setForm(emptyForm);
    setSelectedCommerces([]);
    setFormOpen(true);
  };

  const openEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setForm({
      name: offer.name,
      description: offer.description ?? "",
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      starts_at: offer.starts_at.slice(0, 16),
      ends_at: offer.ends_at?.slice(0, 16) ?? "",
      promo_code: offer.promo_code ?? "",
      max_uses: offer.max_uses?.toString() ?? "",
      active: offer.active,
      is_multi_commerce: offer.is_multi_commerce,
      single_use_per_customer: offer.single_use_per_customer,
      categories: offer.categories.join(", "),
      commerce_id: offer.commerce_id,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingOffer(null);
    setForm(emptyForm);
    setSelectedCommerces([]);
  };

  const filtered = offers.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.promo_code?.toLowerCase().includes(search.toLowerCase())
  );

  const globalOffers = filtered.filter((o) => !o.commerce_id);
  const commerceOffers = filtered.filter((o) => o.commerce_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ofertas</h1>
          <p className="text-muted-foreground">Gestiona ofertas globales y multi-comercio</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva oferta
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Global Offers */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Ofertas Globales</h2>
        <div className="rounded-lg border border-border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : globalOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Tag className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Sin ofertas globales</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descuento</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Código</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fechas</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {globalOffers.map((offer) => (
                    <OfferRow
                      key={offer.id}
                      offer={offer}
                      onEdit={() => openEdit(offer)}
                      onDelete={() => setDeleteTarget(offer)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Commerce Offers */}
      {commerceOffers.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Ofertas de Comercios</h2>
          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descuento</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Código</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fechas</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {commerceOffers.map((offer) => (
                    <OfferRow
                      key={offer.id}
                      offer={offer}
                      onEdit={() => openEdit(offer)}
                      onDelete={() => setDeleteTarget(offer)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog.Root open={formOpen} onOpenChange={() => closeForm()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {editingOffer ? "Editar oferta" : "Nueva oferta"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-foreground">Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre de la oferta"
                />
              </div>

              <div>
                <Label className="text-foreground">Descripción</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción opcional"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Tipo de descuento</Label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed">Monto fijo</option>
                  </select>
                </div>
                <div>
                  <Label className="text-foreground">
                    Valor {form.discount_type === "percentage" ? "(%)" : "(BOB)"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.discount_value}
                    onChange={(e) =>
                      setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Inicio</Label>
                  <Input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-foreground">Fin (opcional)</Label>
                  <Input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Código promocional</Label>
                  <Input
                    value={form.promo_code}
                    onChange={(e) => setForm({ ...form, promo_code: e.target.value })}
                    placeholder="PROMO2024"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Usos máximos</Label>
                  <Input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div>
                <Label className="text-foreground">Categorías (separadas por coma)</Label>
                <Input
                  value={form.categories}
                  onChange={(e) => setForm({ ...form, categories: e.target.value })}
                  placeholder="ropa, electrónica, hogar"
                />
              </div>

              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Activa</p>
                  </div>
                  <Switch.Root
                    checked={form.active}
                    onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      form.active ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <Switch.Thumb
                      className={cn(
                        "block h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                        form.active ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </Switch.Root>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Multi-comercio</p>
                    <p className="text-sm text-muted-foreground">Aplica a múltiples comercios</p>
                  </div>
                  <Switch.Root
                    checked={form.is_multi_commerce}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, is_multi_commerce: checked, commerce_id: checked ? null : form.commerce_id })
                    }
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      form.is_multi_commerce ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <Switch.Thumb
                      className={cn(
                        "block h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                        form.is_multi_commerce ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </Switch.Root>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Un uso por cliente</p>
                  </div>
                  <Switch.Root
                    checked={form.single_use_per_customer}
                    onCheckedChange={(checked) => setForm({ ...form, single_use_per_customer: checked })}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      form.single_use_per_customer ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <Switch.Thumb
                      className={cn(
                        "block h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                        form.single_use_per_customer ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </Switch.Root>
                </div>
              </div>

              {form.is_multi_commerce && (
                <div>
                  <Label className="text-foreground">Seleccionar comercios</Label>
                  <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-md border border-input p-2">
                    {commerces.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 rounded p-1.5 text-sm hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={selectedCommerces.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCommerces([...selectedCommerces, c.id]);
                            } else {
                              setSelectedCommerces(selectedCommerces.filter((id) => id !== c.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-foreground">{c.name}</span>
                      </label>
                    ))}
                    {commerces.length === 0 && (
                      <p className="text-sm text-muted-foreground">Sin comercios disponibles</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!form.name || saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingOffer ? "Actualizar" : "Crear oferta"}
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
              Eliminar oferta
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              ¿Estás seguro de que deseas eliminar &quot;{deleteTarget?.name}&quot;? Esta acción no se puede deshacer.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                >
                  {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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

function OfferRow({
  offer,
  onEdit,
  onDelete,
}: {
  offer: Offer;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <div>
          <span className="font-medium text-foreground">{offer.name}</span>
          {offer.is_multi_commerce && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              Multi
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-foreground">
        {offer.discount_type === "percentage" ? (
          <span className="flex items-center gap-1">
            <Percent className="h-3 w-3" />
            {offer.discount_value}%
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {formatCurrency(offer.discount_value)}
          </span>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {offer.promo_code ?? "-"}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            offer.active
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {offer.active ? "Activa" : "Inactiva"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {formatDate(offer.starts_at, { day: "numeric", month: "short" })}
        {offer.ends_at && ` - ${formatDate(offer.ends_at, { day: "numeric", month: "short" })}`}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
