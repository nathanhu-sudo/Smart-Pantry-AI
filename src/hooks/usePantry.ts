import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PantryItem, GreenImpact, CO2_MULTIPLIERS } from "@/types/pantry";
import { toast } from "@/components/ui/sonner";

function dbRowToItem(row: any): PantryItem {
  return {
    id: row.id,
    name: row.name,
    weightKg: Number(row.weight_kg),
    shelfLifeDays: row.shelf_life_days,
    co2Impact: row.co2_impact as "high" | "medium" | "low",
    addedAt: row.added_at,
    status: row.status as "active" | "consumed" | "tossed",
  };
}

export function usePantry() {
  const { user } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items from DB
  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { toast.error("Failed to load pantry"); }
        else setItems((data ?? []).map(dbRowToItem));
        setLoading(false);
      });
  }, [user]);

  const activeItems = items.filter((i) => i.status === "active");

  const impact: GreenImpact = items.reduce(
    (acc, item) => {
      if (item.status === "consumed") {
        acc.savedKg += item.weightKg;
        acc.co2SavedKg += item.weightKg * CO2_MULTIPLIERS[item.co2Impact];
      } else if (item.status === "tossed") {
        acc.wastedKg += item.weightKg;
        acc.co2WastedKg += item.weightKg * CO2_MULTIPLIERS[item.co2Impact];
      }
      return acc;
    },
    { savedKg: 0, wastedKg: 0, co2SavedKg: 0, co2WastedKg: 0 }
  );

  const getDaysRemaining = useCallback((item: PantryItem) => {
    const added = new Date(item.addedAt);
    const expiry = new Date(added);
    expiry.setDate(expiry.getDate() + item.shelfLifeDays);
    const now = new Date();
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  const addItem = useCallback(
    async (data: { name: string; weightKg: number; shelfLifeDays: number; co2Impact: "high" | "medium" | "low" }) => {
      if (!user) return;
      const { data: row, error } = await supabase
        .from("pantry_items")
        .insert({
          user_id: user.id,
          name: data.name,
          weight_kg: data.weightKg,
          shelf_life_days: data.shelfLifeDays,
          co2_impact: data.co2Impact,
          status: "active",
          added_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) { toast.error("Failed to add item"); return; }
      setItems((prev) => [dbRowToItem(row), ...prev]);
      return dbRowToItem(row);
    },
    [user]
  );

  const scanItem = useCallback(async () => {
    const SCANNABLE_ITEMS = [
      { name: "Milk", weightKg: 1.0, shelfLifeDays: 7, co2Impact: "medium" as const },
      { name: "Spinach", weightKg: 0.2, shelfLifeDays: 5, co2Impact: "low" as const },
      { name: "Bread", weightKg: 0.6, shelfLifeDays: 4, co2Impact: "medium" as const },
      { name: "Beef Mince", weightKg: 0.5, shelfLifeDays: 3, co2Impact: "high" as const },
    ];
    const template = SCANNABLE_ITEMS[Math.floor(Math.random() * SCANNABLE_ITEMS.length)];
    return addItem(template);
  }, [addItem]);

  const consumeItem = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("pantry_items").update({ status: "consumed" }).eq("id", id);
      if (error) { toast.error("Failed to update item"); return; }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "consumed" as const } : i)));
    },
    []
  );

  const tossItem = useCallback(
    async (id: string, tossedKg?: number) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const amountTossed = tossedKg ?? item.weightKg;
      const remaining = Math.round((item.weightKg - amountTossed) * 1000) / 1000;

      if (remaining > 0) {
        // Partial toss: update original item weight, insert a tossed record
        const { error: updateErr } = await supabase
          .from("pantry_items")
          .update({ weight_kg: remaining })
          .eq("id", id);
        if (updateErr) { toast.error("Failed to update item"); return; }

        const user_id = item.id ? (await supabase.from("pantry_items").select("user_id").eq("id", id).single()).data?.user_id : undefined;
        if (user_id) {
          await supabase.from("pantry_items").insert({
            user_id,
            name: item.name,
            weight_kg: amountTossed,
            shelf_life_days: item.shelfLifeDays,
            co2_impact: item.co2Impact,
            status: "tossed",
            added_at: item.addedAt,
          });
        }

        // Refresh items
        const { data } = await supabase
          .from("pantry_items")
          .select("*")
          .eq("user_id", user_id!)
          .order("added_at", { ascending: false });
        if (data) setItems(data.map(dbRowToItem));
      } else {
        // Full toss
        const { error } = await supabase.from("pantry_items").update({ status: "tossed" }).eq("id", id);
        if (error) { toast.error("Failed to update item"); return; }
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "tossed" as const } : i)));
      }
    },
    [items]
  );

  return { items, activeItems, impact, loading, getDaysRemaining, addItem, scanItem, consumeItem, tossItem };
}
