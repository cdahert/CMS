"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Store,
  Users,
  Plug,
  Tag,
  Receipt,
  Activity,
  FileText,
  Bell,
  Lock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/integrations/supabase/client";

const mainNavItems = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/comercios", label: "Comercios", icon: Store },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/integraciones", label: "Integraciones", icon: Plug },
  { href: "/admin/ofertas", label: "Ofertas", icon: Tag },
  { href: "/admin/liquidaciones", label: "Liquidaciones", icon: Receipt },
  { href: "/admin/actividad", label: "Actividad", icon: Activity },
  { href: "/admin/blog", label: "Blog", icon: FileText },
];

const systemNavItems = [
  { href: "/admin/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/admin/seguridad", label: "Seguridad", icon: Lock },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-sidebar-border p-4">
        <Shield className="h-6 w-6 text-primary" />
        {!collapsed && (
          <span className="gradient-primary text-lg font-bold">
            Admin GenioX
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        <div className="mb-2 px-2 py-1">
          {!collapsed && (
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Principal
            </span>
          )}
        </div>
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive(item.href, item.exact)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        <div className="mb-2 mt-4 px-2 py-1">
          {!collapsed && (
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Sistema
            </span>
          )}
        </div>
        {systemNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive(item.href)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Salir</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:relative md:z-auto",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 hidden rounded-full border border-sidebar-border bg-sidebar p-1 md:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          {pathname !== "/admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Panel general
            </Link>
          )}
          <h1 className="text-lg font-semibold">Panel de Operador</h1>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
