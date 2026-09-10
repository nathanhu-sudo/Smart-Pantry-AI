import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AdminUser {
  user_id: string;
  email: string;
  display_name: string | null;
  plan: string;
  plan_status: string;
  is_lifetime: boolean;
  joined_at: string | null;
  last_sign_in_at: string | null;
  total_items: number;
  active_items: number;
  consumed_items: number;
  tossed_items: number;
  total_saved_kg: number;
  total_wasted_kg: number;
  last_activity: string | null;
}

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      if (!authLoading) {
        setIsAdmin(false);
        setAdminLoading(false);
      }
      return;
    }
    setAdminLoading(true);
    supabase.rpc("is_admin").then(({ data, error }) => {
      setIsAdmin(!error && data === true);
      setAdminLoading(false);
    });
  }, [user, authLoading]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    const { data, error } = await supabase.rpc("get_admin_users_overview");
    if (!error && data) {
      setUsers(
        data.map((r: any) => ({
          user_id: r.user_id,
          email: r.email,
          display_name: r.display_name,
          plan: r.plan ?? "free",
          plan_status: r.plan_status ?? "active",
          is_lifetime: r.is_lifetime === true,
          joined_at: r.joined_at,
          last_sign_in_at: r.last_sign_in_at,
          total_items: Number(r.total_items),
          active_items: Number(r.active_items),
          consumed_items: Number(r.consumed_items),
          tossed_items: Number(r.tossed_items),
          total_saved_kg: Number(r.total_saved_kg),
          total_wasted_kg: Number(r.total_wasted_kg),
          last_activity: r.last_activity,
        }))
      );
    }
    setUsersLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const kickUser = async (userId: string): Promise<{ error?: string }> => {
    const { data, error } = await supabase.functions.invoke("admin-kick-user", {
      body: { userId },
    });
    if (error) {
      return { error: (data as any)?.error ?? error.message };
    }
    if ((data as any)?.error) return { error: (data as any).error };
    setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    return {};
  };

  return { isAdmin, adminLoading, users, usersLoading, refetchUsers: fetchUsers, kickUser };
}
