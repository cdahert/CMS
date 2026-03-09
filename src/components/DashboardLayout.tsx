"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  LayoutDashboard,
  Package,
  DollarSign,
  Tag,
  PackageOpen,
  Users,
  Plug,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  {
    href: "/comercios/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/comercios/productos", label: "Productos", icon: Package },
  { href: "/comercios/precios", label: "Precios", icon: DollarSign },
  { href: "/comercios/ofertas", label: "Ofertas", icon: Tag },
  { href: "/comercios/bundles", label: "Bundles", icon: PackageOpen },
  { href: "/comercios/usuarios", label: "Usuarios", icon: Users },
  {
    href: "/comercios/integraciones",
    label: "Integraciones ERP",
    icon: Plug,
  },
  { href: "/comercios/configuracion", label: "Configuración", icon: Settings },
  { href: "/comercios/ayuda", label: "Ayuda", icon: HelpCircle },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/comercios");
  };

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
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:relative md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="gradient-primary text-lg font-bold">
                GenioX
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-2">
            {navItems.map((item) => (
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
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-sidebar-border p-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
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
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {user?.user_metadata?.avatar_url && (
              <Image
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
                unoptimized
              />
            )}
            <span className="text-sm text-muted-foreground">
              {user?.user_metadata?.full_name ?? user?.email}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
