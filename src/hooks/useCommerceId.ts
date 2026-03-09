"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface CommerceIdState {
  commerceId: string | null;
  loading: boolean;
}

export function useCommerceId(): CommerceIdState {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [commerceId, setCommerceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchCommerceId() {
      if (isAdmin) {
        const { data } = await supabase
          .from("commerces")
          .select("id")
          .limit(1)
          .single();
        setCommerceId(data?.id ?? null);
      } else {
        const { data } = await supabase
          .from("commerce_members")
          .select("commerce_id")
          .eq("user_id", user!.id)
          .limit(1)
          .single();
        setCommerceId(data?.commerce_id ?? null);
      }
      setLoading(false);
    }

    fetchCommerceId();
  }, [user, isAdmin, authLoading]);

  return { commerceId, loading };
}
