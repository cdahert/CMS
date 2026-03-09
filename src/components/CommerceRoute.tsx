"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCommerceId } from "@/hooks/useCommerceId";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function CommerceRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { commerceId, loading: commerceLoading } = useCommerceId();
  const router = useRouter();

  const loading = authLoading || commerceLoading;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/comercios");
    }
    if (!loading && user && !isAdmin && !commerceId) {
      router.replace("/comercios");
    }
  }, [user, isAdmin, commerceId, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
