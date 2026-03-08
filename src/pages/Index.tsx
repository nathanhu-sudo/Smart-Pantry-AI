import { motion } from "framer-motion";
import { Leaf, LogOut } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { InventoryList } from "@/components/InventoryList";
import { ScannerButton } from "@/components/ScannerButton";
import { usePantry } from "@/hooks/usePantry";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.jpg";

const Index = () => {
  const { activeItems, impact, getDaysRemaining, scanItem, consumeItem, tossItem } = usePantry();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container max-w-2xl py-10 px-4 flex flex-col items-center text-center gap-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="rounded-full bg-primary p-2">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SmartPantry AI</h1>
          </motion.div>
          <p className="text-sm text-muted-foreground max-w-md">
            Your kitchen's digital twin. Track what you eat, reduce what you waste, and see your green impact grow.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-2xl px-4 py-8 flex flex-col gap-8">
        {/* Green Impact */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 font-serif">Green Impact</h2>
          <Dashboard impact={impact} />
        </section>

        {/* Scanner */}
        <section>
          <ScannerButton onScan={scanItem} />
        </section>

        {/* Inventory */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground font-serif">Pantry Inventory</h2>
            <span className="text-sm text-muted-foreground">
              {activeItems.length} item{activeItems.length !== 1 ? "s" : ""}
            </span>
          </div>
          <InventoryList
            items={activeItems}
            getDaysRemaining={getDaysRemaining}
            onConsume={consumeItem}
            onToss={tossItem}
          />
        </section>
      </main>
    </div>
  );
};

export default Index;
