export interface PantryItem {
  id: string;
  name: string;
  weightKg: number;
  shelfLifeDays: number;
  co2Impact: "high" | "medium" | "low";
  addedAt: string; // ISO date
  status: "active" | "consumed" | "tossed";
}

export interface GreenImpact {
  savedKg: number;
  wastedKg: number;
  co2SavedKg: number;
  co2WastedKg: number;
}

export const CO2_MULTIPLIERS: Record<string, number> = {
  high: 27.0,    // kg CO2 per kg food (e.g. beef)
  medium: 3.2,   // kg CO2 per kg food (e.g. dairy, bread)
  low: 0.9,      // kg CO2 per kg food (e.g. vegetables)
};

export const SCANNABLE_ITEMS: Omit<PantryItem, "id" | "addedAt" | "status">[] = [
  { name: "Milk", weightKg: 1.0, shelfLifeDays: 7, co2Impact: "medium" },
  { name: "Spinach", weightKg: 0.2, shelfLifeDays: 5, co2Impact: "low" },
  { name: "Bread", weightKg: 0.6, shelfLifeDays: 4, co2Impact: "medium" },
  { name: "Beef Mince", weightKg: 0.5, shelfLifeDays: 3, co2Impact: "high" },
];
