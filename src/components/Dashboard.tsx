import { motion } from "framer-motion";
import { Leaf, TrendingDown, TrendingUp } from "lucide-react";
import { GreenImpact } from "@/types/pantry";

interface DashboardProps {
  impact: GreenImpact;
}

export function Dashboard({ impact }: DashboardProps) {
  const totalKg = impact.savedKg + impact.wastedKg;
  const saveRate = totalKg > 0 ? Math.round((impact.savedKg / totalKg) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-card border p-5 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-success">
          <Leaf className="h-5 w-5" />
          <span className="text-sm font-medium">Food Saved</span>
        </div>
        <p className="text-3xl font-serif font-bold text-foreground">
          {impact.savedKg.toFixed(1)} <span className="text-lg font-sans font-normal text-muted-foreground">kg</span>
        </p>
        <p className="text-xs text-muted-foreground">
          ≈ {impact.co2SavedKg.toFixed(1)} kg CO₂ prevented
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-card border p-5 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-destructive">
          <TrendingDown className="h-5 w-5" />
          <span className="text-sm font-medium">Food Wasted</span>
        </div>
        <p className="text-3xl font-serif font-bold text-foreground">
          {impact.wastedKg.toFixed(1)} <span className="text-lg font-sans font-normal text-muted-foreground">kg</span>
        </p>
        <p className="text-xs text-muted-foreground">
          ≈ {impact.co2WastedKg.toFixed(1)} kg CO₂ emitted
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-card border p-5 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-medium">Save Rate</span>
        </div>
        <p className="text-3xl font-serif font-bold text-foreground">
          {saveRate}<span className="text-lg font-sans font-normal text-muted-foreground">%</span>
        </p>
        <div className="w-full bg-secondary rounded-full h-2 mt-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${saveRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-primary h-2 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
