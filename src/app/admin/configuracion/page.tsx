"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import {
  Settings,
  Save,
  Globe,
  Palette,
  Mail,
  CreditCard,
  Truck,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Switch from "@radix-ui/react-switch";
import * as Tabs from "@radix-ui/react-tabs";

export default function AdminConfig() {
  const [activeTab, setActiveTab] = useState("general");

  const [general, setGeneral] = useState({
    siteName: "GenioX Commerce",
    siteUrl: "https://geniox.com",
    supportEmail: "soporte@geniox.com",
    contactPhone: "+591 70000000",
    currency: "BOB",
    timezone: "America/La_Paz",
    maintenanceMode: false,
  });

  const [appearance, setAppearance] = useState({
    primaryColor: "#6366f1",
    logoUrl: "",
    faviconUrl: "",
    darkMode: true,
    showBlog: true,
    showSolutions: true,
  });

  const [email, setEmail] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromName: "GenioX Commerce",
    fromEmail: "noreply@geniox.com",
    welcomeEmail: true,
    settlementEmail: true,
    securityAlerts: true,
  });

  const [payments, setPayments] = useState({
    stripeEnabled: false,
    stripeKey: "",
    qrEnabled: true,
    bankTransferEnabled: true,
    bankName: "",
    bankAccount: "",
    autoApprovePayments: false,
  });

  const [shipping, setShipping] = useState({
    defaultShippingCost: 15,
    freeShippingThreshold: 200,
    shippingZones: "La Paz, Cochabamba, Santa Cruz",
    enableTracking: false,
  });

  const handleSave = (section: string) => {
    toast.success(`Configuración de ${section} guardada correctamente`);
  };

  const SwitchToggle = ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <Switch.Thumb
        className={cn(
          "block h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </Switch.Root>
  );

  const tabs = [
    { value: "general", label: "General", icon: Globe },
    { value: "appearance", label: "Apariencia", icon: Palette },
    { value: "email", label: "Email", icon: Mail },
    { value: "payments", label: "Pagos", icon: CreditCard },
    { value: "shipping", label: "Envíos", icon: Truck },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Ajustes generales de la plataforma</p>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-border">
          {tabs.map((tab) => (
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

        {/* General */}
        <Tabs.Content value="general" className="mt-6">
          <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Nombre del sitio</Label>
                <Input
                  value={general.siteName}
                  onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-foreground">URL del sitio</Label>
                <Input
                  value={general.siteUrl}
                  onChange={(e) => setGeneral({ ...general, siteUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Email de soporte</Label>
                <Input
                  type="email"
                  value={general.supportEmail}
                  onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-foreground">Teléfono de contacto</Label>
                <Input
                  value={general.contactPhone}
                  onChange={(e) => setGeneral({ ...general, contactPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Moneda</Label>
                <Input
                  value={general.currency}
                  onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-foreground">Zona horaria</Label>
                <Input
                  value={general.timezone}
                  onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-foreground">Modo Mantenimiento</p>
                <p className="text-sm text-muted-foreground">Muestra una página de mantenimiento a visitantes</p>
              </div>
              <SwitchToggle
                checked={general.maintenanceMode}
                onCheckedChange={(checked) => setGeneral({ ...general, maintenanceMode: checked })}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => handleSave("general")}>
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>
        </Tabs.Content>

        {/* Appearance */}
        <Tabs.Content value="appearance" className="mt-6">
          <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-6">
            <div>
              <Label className="text-foreground">Color primario</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={appearance.primaryColor}
                  onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                  className="h-10 w-10 cursor-pointer rounded border border-input"
                />
                <Input
                  value={appearance.primaryColor}
                  onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground">URL del logo</Label>
              <Input
                value={appearance.logoUrl}
                onChange={(e) => setAppearance({ ...appearance, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label className="text-foreground">URL del favicon</Label>
              <Input
                value={appearance.faviconUrl}
                onChange={(e) => setAppearance({ ...appearance, faviconUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              {[
                { key: "darkMode" as const, label: "Modo oscuro", desc: "Habilitar tema oscuro por defecto" },
                { key: "showBlog" as const, label: "Mostrar blog", desc: "Mostrar sección de blog en el sitio" },
                { key: "showSolutions" as const, label: "Mostrar soluciones", desc: "Mostrar página de soluciones" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <SwitchToggle
                    checked={appearance[item.key]}
                    onCheckedChange={(checked) => setAppearance({ ...appearance, [item.key]: checked })}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => handleSave("apariencia")}>
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>
        </Tabs.Content>

        {/* Email */}
        <Tabs.Content value="email" className="mt-6">
          <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Servidor SMTP</Label>
                <Input
                  value={email.smtpHost}
                  onChange={(e) => setEmail({ ...email, smtpHost: e.target.value })}
                  placeholder="smtp.ejemplo.com"
                />
              </div>
              <div>
                <Label className="text-foreground">Puerto SMTP</Label>
                <Input
                  value={email.smtpPort}
                  onChange={(e) => setEmail({ ...email, smtpPort: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Usuario SMTP</Label>
                <Input
                  value={email.smtpUser}
                  onChange={(e) => setEmail({ ...email, smtpUser: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-foreground">Contraseña SMTP</Label>
                <Input
                  type="password"
                  value={email.smtpPassword}
                  onChange={(e) => setEmail({ ...email, smtpPassword: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Nombre remitente</Label>
                <Input
                  value={email.fromName}
                  onChange={(e) => setEmail({ ...email, fromName: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-foreground">Email remitente</Label>
                <Input
                  type="email"
                  value={email.fromEmail}
                  onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              {[
                { key: "welcomeEmail" as const, label: "Email de bienvenida", desc: "Enviar email al registrar nuevo comercio" },
                { key: "settlementEmail" as const, label: "Notificación de liquidación", desc: "Notificar al procesar liquidaciones" },
                { key: "securityAlerts" as const, label: "Alertas de seguridad", desc: "Enviar alertas de accesos sospechosos" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <SwitchToggle
                    checked={email[item.key]}
                    onCheckedChange={(checked) => setEmail({ ...email, [item.key]: checked })}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => handleSave("email")}>
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>
        </Tabs.Content>

        {/* Payments */}
        <Tabs.Content value="payments" className="mt-6">
          <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Stripe</p>
                  <p className="text-sm text-muted-foreground">Habilitar pagos con tarjeta vía Stripe</p>
                </div>
                <SwitchToggle
                  checked={payments.stripeEnabled}
                  onCheckedChange={(checked) => setPayments({ ...payments, stripeEnabled: checked })}
                />
              </div>
              {payments.stripeEnabled && (
                <div>
                  <Label className="text-foreground">Stripe Secret Key</Label>
                  <Input
                    type="password"
                    value={payments.stripeKey}
                    onChange={(e) => setPayments({ ...payments, stripeKey: e.target.value })}
                    placeholder="sk_..."
                  />
                </div>
              )}
            </div>
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              {[
                { key: "qrEnabled" as const, label: "Pago por QR", desc: "Habilitar pagos mediante código QR" },
                { key: "bankTransferEnabled" as const, label: "Transferencia bancaria", desc: "Habilitar pagos por transferencia" },
                { key: "autoApprovePayments" as const, label: "Auto-aprobar pagos", desc: "Aprobar pagos automáticamente al verificarse" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <SwitchToggle
                    checked={payments[item.key]}
                    onCheckedChange={(checked) => setPayments({ ...payments, [item.key]: checked })}
                  />
                </div>
              ))}
            </div>
            {payments.bankTransferEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Nombre del banco</Label>
                  <Input
                    value={payments.bankName}
                    onChange={(e) => setPayments({ ...payments, bankName: e.target.value })}
                    placeholder="Banco Nacional de Bolivia"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Número de cuenta</Label>
                  <Input
                    value={payments.bankAccount}
                    onChange={(e) => setPayments({ ...payments, bankAccount: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={() => handleSave("pagos")}>
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>
        </Tabs.Content>

        {/* Shipping */}
        <Tabs.Content value="shipping" className="mt-6">
          <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Costo de envío por defecto (BOB)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={shipping.defaultShippingCost}
                  onChange={(e) =>
                    setShipping({ ...shipping, defaultShippingCost: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label className="text-foreground">Envío gratis a partir de (BOB)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={shipping.freeShippingThreshold}
                  onChange={(e) =>
                    setShipping({ ...shipping, freeShippingThreshold: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground">Zonas de envío (separadas por coma)</Label>
              <Input
                value={shipping.shippingZones}
                onChange={(e) => setShipping({ ...shipping, shippingZones: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-foreground">Tracking de envíos</p>
                <p className="text-sm text-muted-foreground">Habilitar seguimiento de envíos en tiempo real</p>
              </div>
              <SwitchToggle
                checked={shipping.enableTracking}
                onCheckedChange={(checked) => setShipping({ ...shipping, enableTracking: checked })}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => handleSave("envíos")}>
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </motion.div>
  );
}
