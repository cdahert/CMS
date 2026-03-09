"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  BarChart3,
  Truck,
  Package,
  Users,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const benefits = [
  {
    icon: Package,
    title: "Gestión de Productos",
    description:
      "Administra tu catálogo, precios, stock e inventario desde un solo lugar.",
  },
  {
    icon: BarChart3,
    title: "Analítica en Tiempo Real",
    description:
      "Dashboard con KPIs, ventas mensuales y rendimiento de productos.",
  },
  {
    icon: ShieldCheck,
    title: "Liquidaciones Transparentes",
    description:
      "Comisiones claras con descuentos por crecimiento y gestión.",
  },
  {
    icon: Truck,
    title: "Logística Integrada",
    description:
      "Conexión con servicios de envío y seguimiento de pedidos.",
  },
  {
    icon: Users,
    title: "Equipo Multiusuario",
    description:
      "Invita a tu equipo con roles de administrador, editor o visor.",
  },
  {
    icon: Zap,
    title: "Integración ERP",
    description:
      "Conecta SAP, Odoo u otros sistemas para sincronización automática.",
  },
];

const plans = [
  {
    name: "Inicial",
    commission: "25%",
    features: [
      "Hasta 50 productos",
      "1 usuario",
      "Dashboard básico",
      "Soporte por email",
    ],
    highlighted: false,
  },
  {
    name: "Silver",
    commission: "22%",
    features: [
      "Hasta 200 productos",
      "3 usuarios",
      "Analítica avanzada",
      "Ofertas y bundles",
      "Soporte prioritario",
    ],
    highlighted: false,
  },
  {
    name: "Gold",
    commission: "18%",
    features: [
      "Hasta 1,000 productos",
      "10 usuarios",
      "Integración ERP",
      "Descuentos por crecimiento",
      "Soporte dedicado",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    commission: "15%",
    features: [
      "Productos ilimitados",
      "Usuarios ilimitados",
      "Todas las integraciones",
      "Máximos descuentos",
      "Gerente de cuenta",
    ],
    highlighted: false,
  },
];

export default function ComerciosLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Store className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">GenioX Commerce</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/comercios/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/comercios/registro"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Vende más con{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                GenioX Commerce
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
            >
              La plataforma todo-en-uno para gestionar tu comercio electrónico
              en Bolivia. Productos, precios, ofertas, inventario y
              liquidaciones en un solo lugar.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/comercios/registro"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Comenzar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#planes"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Ver planes
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold">
              Todo lo que necesitas para crecer
            </h2>
            <p className="mt-4 text-muted-foreground">
              Herramientas profesionales diseñadas para comercios en Bolivia
            </p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold">
              Planes con comisiones transparentes
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sin costos fijos mensuales. Solo pagas una comisión sobre tus
              ventas.
            </p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-xl border p-6 shadow-sm ${
                  plan.highlighted
                    ? "border-primary bg-card ring-2 ring-primary"
                    : "border-border bg-card"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Recomendado
                  </div>
                )}
                <h3 className="text-lg font-bold text-card-foreground">
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-foreground">
                    {plan.commission}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    comisión
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/comercios/registro"
                  className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  Empezar ahora
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 py-20">
        <motion.div
          className="mx-auto max-w-3xl px-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold">
            Comienza a vender hoy mismo
          </h2>
          <p className="mt-4 text-muted-foreground">
            Únete a los comercios que ya confían en GenioX para impulsar sus
            ventas en Bolivia.
          </p>
          <Link
            href="/comercios/registro"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Registrar mi comercio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GenioX Commerce. Todos los
          derechos reservados.
        </div>
      </footer>
    </div>
  );
}
