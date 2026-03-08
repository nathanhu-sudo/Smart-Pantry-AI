import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PantryItem } from "@/types/pantry";

interface ScannerButtonProps {
  onScan: () => Promise<PantryItem | undefined>;
}

export function ScannerButton({ onScan }: ScannerButtonProps) {
  const handleScan = () => {
    const item = onScan();
    toast.success(`Scanned: ${item.name}`, {
      description: `${item.weightKg} kg · ${item.shelfLifeDays} day shelf life`,
    });
  };

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        onClick={handleScan}
        size="lg"
        className="w-full gap-2 h-12 text-base font-semibold animate-pulse-green"
      >
        <ScanLine className="h-5 w-5" />
        AI Scan Item
      </Button>
    </motion.div>
  );
}
