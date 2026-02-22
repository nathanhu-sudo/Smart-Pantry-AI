import { motion } from "framer-motion";
import { Clock, Check, Trash2 } from "lucide-react";
import { PantryItem } from "@/types/pantry";
import { Button } from "@/components/ui/button";

interface InventoryItemProps {
  item: PantryItem;
  daysRemaining: number;
  onConsume: (id: string) => void;
  onToss: (id: string) => void;
}

function getUrgencyColor(days: number) {
  if (days <= 1) return "text-destructive";
  if (days <= 3) return "text-warning";
  return "text-success";
}

function getUrgencyBg(days: number) {
  if (days <= 1) return "bg-destructive/10";
  if (days <= 3) return "bg-warning/10";
  return "bg-success/10";
}

const co2Labels = { high: "🔴 High", medium: "🟡 Med", low: "🟢 Low" };

export function InventoryItem({ item, daysRemaining, onConsume, onToss }: InventoryItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="rounded-xl bg-card border p-4 flex items-center gap-4"
    >
      <div className={`rounded-lg p-2.5 ${getUrgencyBg(daysRemaining)}`}>
        <Clock className={`h-5 w-5 ${getUrgencyColor(daysRemaining)}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{item.name}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span>{item.weightKg} kg</span>
          <span>CO₂: {co2Labels[item.co2Impact]}</span>
        </div>
      </div>

      <div className="text-right mr-2">
        <p className={`text-lg font-serif font-bold ${getUrgencyColor(daysRemaining)}`}>
          {daysRemaining <= 0 ? "Expired" : `${daysRemaining}d`}
        </p>
        <p className="text-[10px] text-muted-foreground">remaining</p>
      </div>

      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 border-success/30 text-success hover:bg-success hover:text-success-foreground"
          onClick={() => onConsume(item.id)}
          title="Mark as consumed"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => onToss(item.id)}
          title="Mark as tossed"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
