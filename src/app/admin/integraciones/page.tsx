"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Settings,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Switch from "@radix-ui/react-switch";
import * as Dialog from "@radix-ui/react-dialog";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  connected: boolean;
  icon: string;
  configFields: { key: string; label: string; type: string; placeholder: string }[];
}

const defaultIntegrations: Integration[] = [
  {
    id: "supabase",
    name: "Supabase",
    description: "Base de datos y autenticación del backend",
    category: "Backend",
    enabled: true,
    connected: true,
    icon: "S",
    configFields: [
      { key: "url", label: "URL del proyecto", type: "text", placeholder: "https://xxx.supabase.co" },
      { key: "anonKey", label: "Anon Key", type: "password", placeholder: "eyJ..." },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Procesamiento de pagos con tarjeta",
    category: "Pagos",
    enabled: false,
    connected: false,
    icon: "$",
    configFields: [
      { key: "publishableKey", label: "Publishable Key", type: "password", placeholder: "pk_..." },
      { key: "secretKey", label: "Secret Key", type: "password", placeholder: "sk_..." },
      { key: "webhookSecret", label: "Webhook Secret", type: "password", placeholder: "whsec_..." },
    ],
  },
  {
    id: "resend",
    name: "Resend",
    description: "Servicio de envío de emails transaccionales",
    category: "Comunicación",
    enabled: false,
    connected: false,
    icon: "R",
    configFields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "re_..." },
      { key: "fromEmail", label: "Email remitente", type: "email", placeholder: "noreply@geniox.com" },
    ],
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    description: "Gestión y optimización de imágenes",
    category: "Media",
    enabled: false,
    connected: false,
    icon: "C",
    configFields: [
      { key: "cloudName", label: "Cloud Name", type: "text", placeholder: "mi-cloud" },
      { key: "apiKey", label: "API Key", type: "password", placeholder: "" },
      { key: "apiSecret", label: "API Secret", type: "password", placeholder: "" },
    ],
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Análisis de tráfico y comportamiento de usuarios",
    category: "Analítica",
    enabled: false,
    connected: false,
    icon: "G",
    configFields: [
      { key: "measurementId", label: "Measurement ID", type: "text", placeholder: "G-XXXXXXXXXX" },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Notificaciones y soporte por WhatsApp",
    category: "Comunicación",
    enabled: false,
    connected: false,
    icon: "W",
    configFields: [
      { key: "phoneNumber", label: "Número de teléfono", type: "text", placeholder: "+591..." },
      { key: "apiToken", label: "API Token", type: "password", placeholder: "" },
    ],
  },
];

const categoryColors: Record<string, string> = {
  Backend: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Pagos: "bg-green-500/10 text-green-700 dark:text-green-400",
  Comunicación: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Media: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  Analítica: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
};

export default function AdminIntegrations() {
  const [integrations, setIntegrations] = useState(defaultIntegrations);
  const [configTarget, setConfigTarget] = useState<Integration | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i))
    );
    const integration = integrations.find((i) => i.id === id);
    if (integration) {
      toast.success(
        integration.enabled
          ? `${integration.name} deshabilitado`
          : `${integration.name} habilitado`
      );
    }
  };

  const openConfig = (integration: Integration) => {
    setConfigTarget(integration);
    setConfigValues({});
  };

  const handleSaveConfig = () => {
    if (!configTarget) return;
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === configTarget.id ? { ...i, connected: true, enabled: true } : i
      )
    );
    toast.success(`${configTarget.name} configurado correctamente`);
    setConfigTarget(null);
    setConfigValues({});
  };

  const categories = Array.from(new Set(integrations.map((i) => i.category)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integraciones</h1>
        <p className="text-muted-foreground">Conecta servicios externos a la plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total integraciones</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{integrations.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Conectadas</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {integrations.filter((i) => i.connected).length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Habilitadas</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {integrations.filter((i) => i.enabled).length}
          </p>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h2 className="mb-3 text-lg font-semibold text-foreground">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.category === category)
              .map((integration) => (
                <div
                  key={integration.id}
                  className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{integration.name}</h3>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            categoryColors[integration.category] ?? "bg-muted text-muted-foreground"
                          )}
                        >
                          {integration.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {integration.connected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{integration.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <Switch.Root
                      checked={integration.enabled}
                      onCheckedChange={() => toggleIntegration(integration.id)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        integration.enabled ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <Switch.Thumb
                        className={cn(
                          "block h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                          integration.enabled ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                    </Switch.Root>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfig(integration)}
                    >
                      <Settings className="h-4 w-4" />
                      Configurar
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Config Dialog */}
      <Dialog.Root open={!!configTarget} onOpenChange={() => setConfigTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Configurar {configTarget?.name}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              {configTarget?.description}
            </Dialog.Description>

            <div className="mt-4 space-y-4">
              {configTarget?.configFields.map((field) => (
                <div key={field.key}>
                  <Label className="text-foreground">{field.label}</Label>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={configValues[field.key] ?? ""}
                    onChange={(e) =>
                      setConfigValues({ ...configValues, [field.key]: e.target.value })
                    }
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setConfigTarget(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveConfig}>
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </motion.div>
  );
}
