import { AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
import { PantryItem } from "@/types/pantry";
import { InventoryItem } from "./InventoryItem";

interface InventoryListProps {
  items: PantryItem[];
  getDaysRemaining: (item: PantryItem) => number;
  onConsume: (id: string) => void;
  onToss: (id: string, tossedKg?: number) => void;
}

export function InventoryList({ items, getDaysRemaining, onConsume, onToss }: InventoryListProps) {
  const sorted = [...items].sort((a, b) => getDaysRemaining(a) - getDaysRemaining(b));

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 flex flex-col items-center gap-3 text-muted-foreground">
        <Package className="h-10 w-10" />
        <p className="font-medium">Your pantry is empty</p>
        <p className="text-sm">Use the scanner to add items</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {sorted.map((item) => (
          <InventoryItem
            key={item.id}
            item={item}
            daysRemaining={getDaysRemaining(item)}
            onConsume={onConsume}
            onToss={onToss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
