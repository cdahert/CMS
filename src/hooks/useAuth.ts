"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { AppRole } from "@/integrations/supabase/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (userRoles) {
          setRoles(userRoles.map((r) => r.role));
        }
      }

      setLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setRoles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    roles,
    isAdmin: roles.includes("admin"),
  };
}
