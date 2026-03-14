import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddItemFormProps {
  onAdd: (data: { name: string; weightKg: number; shelfLifeDays: number; co2Impact: "high" | "medium" | "low" }) => Promise<any>;
}

const CO2_OPTIONS = [
  { value: "low", label: "🟢 Low — Vegetables, fruits, grains" },
  { value: "medium", label: "🟡 Medium — Dairy, eggs, bread" },
  { value: "high", label: "🔴 High — Beef, lamb, processed meat" },
];

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [weightKg, setWeightKg] = useState("0.5");
  const [shelfLifeDays, setShelfLifeDays] = useState("7");
  const [co2Impact, setCo2Impact] = useState<"high" | "medium" | "low">("low");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setWeightKg("0.5");
    setShelfLifeDays("7");
    setCo2Impact("low");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        name: name.trim(),
        weightKg: Math.max(0.01, parseFloat(weightKg) || 0.5),
        shelfLifeDays: Math.max(1, parseInt(shelfLifeDays) || 7),
        co2Impact,
      });
      reset();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        className="w-full gap-2"
        variant="outline"
      >
        <Plus className="h-4 w-4" />
        Add grocery item
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />

            {/* Modal — draggable, centred, max-height safe for small phones */}
            <motion.div
              drag
              dragMomentum={false}
              dragElastic={0.08}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md cursor-grab active:cursor-grabbing"
              style={{ maxHeight: "calc(100dvh - 32px)", overflowY: "auto" }}
            >
              <div className="bg-card rounded-2xl border shadow-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <ShoppingBasket className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-serif font-bold text-foreground text-lg">Add to pantry</h3>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Item name</Label>
                    <Input
                      id="item-name"
                      placeholder="e.g. Chicken breast, Tomatoes, Yoghurt…"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        min="0.01"
                        step="0.05"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shelf-life">Shelf life (days)</Label>
                      <Input
                        id="shelf-life"
                        type="number"
                        min="1"
                        step="1"
                        value={shelfLifeDays}
                        onChange={(e) => setShelfLifeDays(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>CO₂ impact</Label>
                    <Select value={co2Impact} onValueChange={(v) => setCo2Impact(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CO2_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 gap-2" disabled={saving || !name.trim()}>
                      {saving ? "Adding…" : "Add item"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
