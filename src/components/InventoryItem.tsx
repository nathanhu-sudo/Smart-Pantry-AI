import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, Trash2 } from "lucide-react";
import { PantryItem } from "@/types/pantry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InventoryItemProps {
  item: PantryItem;
  daysRemaining: number;
  onConsume: (id: string) => void;
  onToss: (id: string, tossedKg?: number) => void;
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
  const [showTossPrompt, setShowTossPrompt] = useState(false);
  const [tossAmount, setTossAmount] = useState(String(item.weightKg));
  const [tossing, setTossing] = useState(false);

  const handleTossConfirm = async () => {
    const amount = parseFloat(tossAmount);
    if (!amount || amount <= 0 || amount > item.weightKg) return;
    setTossing(true);
    try {
      await onToss(item.id, amount);
      setShowTossPrompt(false);
    } finally {
      setTossing(false);
    }
  };

  return (
    <>
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
            onClick={() => {
              setTossAmount(String(item.weightKg));
              setShowTossPrompt(true);
            }}
            title="Mark as tossed"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Toss amount prompt */}
      <AnimatePresence>
        {showTossPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
              onClick={() => setShowTossPrompt(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm"
            >
              <div className="bg-card rounded-2xl border shadow-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="rounded-full bg-destructive/10 p-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </div>
                  <h3 className="font-serif font-bold text-foreground text-lg">Toss "{item.name}"</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  How much are you tossing? (Total: {item.weightKg} kg)
                </p>

                <div className="space-y-2 mb-5">
                  <Label htmlFor="toss-amount">Amount to toss (kg)</Label>
                  <Input
                    id="toss-amount"
                    type="number"
                    min="0.01"
                    max={item.weightKg}
                    step="any"
                    value={tossAmount}
                    onChange={(e) => setTossAmount(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowTossPrompt(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={tossing || !parseFloat(tossAmount) || parseFloat(tossAmount) <= 0 || parseFloat(tossAmount) > item.weightKg}
                    onClick={handleTossConfirm}
                  >
                    {tossing ? "Tossing…" : "Confirm toss"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
