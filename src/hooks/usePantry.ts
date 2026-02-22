import { useState, useEffect, useCallback } from "react";
import { PantryItem, GreenImpact, CO2_MULTIPLIERS, SCANNABLE_ITEMS } from "@/types/pantry";

const STORAGE_KEY = "smartpantry-items";

function loadItems(): PantryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveItems(items: PantryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>(loadItems);

  useEffect(() => {
    saveItems(items);
  }, [items]);

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

  const scanItem = useCallback(() => {
    const template = SCANNABLE_ITEMS[Math.floor(Math.random() * SCANNABLE_ITEMS.length)];
    const newItem: PantryItem = {
      ...template,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
      status: "active",
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const consumeItem = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "consumed" as const } : i)));
  }, []);

  const tossItem = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "tossed" as const } : i)));
  }, []);

  return { items, activeItems, impact, getDaysRemaining, scanItem, consumeItem, tossItem };
}
