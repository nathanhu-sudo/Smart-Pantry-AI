import { motion } from "framer-motion";
import { Leaf, LogOut, Package, TrendingUp, Sparkles } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { InventoryList } from "@/components/InventoryList";
import { ScannerButton } from "@/components/ScannerButton";
import { AddItemForm } from "@/components/AddItemForm";
import { usePantry } from "@/hooks/usePantry";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.jpg";

const Index = () => {
  const { activeItems, impact, loading, getDaysRemaining, addItem, scanItem, consumeItem, tossItem } = usePantry();
  const { user, signOut } = useAuth();

  const expiringCount = activeItems.filter((i) => getDaysRemaining(i) <= 3).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero / Header */}
      <header className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/60" />

        <div className="relative container max-w-2xl py-10 px-4 flex flex-col items-center text-center gap-3">
          {/* Top bar */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {user?.email && (
              <span className="hidden sm:block text-xs text-muted-foreground bg-background/80 border rounded-full px-3 py-1">
                {user.email}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="rounded-full bg-primary p-2.5 shadow-lg">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground font-serif">SmartPantry AI</h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground max-w-sm"
          >
            Your kitchen's digital twin. Track what you eat, reduce waste, and watch your green impact grow.
          </motion.p>

          {/* Alert banner for expiring items */}
          {expiringCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-1 inline-flex items-center gap-2 bg-warning/15 border border-warning/30 text-warning-foreground rounded-full px-4 py-1.5 text-xs font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 text-warning" />
              {expiringCount} item{expiringCount !== 1 ? "s" : ""} expiring soon — use them first!
            </motion.div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-2xl px-4 py-8 flex flex-col gap-8 mx-auto">

        {/* Green Impact Dashboard */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground font-serif">Green Impact</h2>
          </div>
          <Dashboard impact={impact} />
        </section>

        {/* Add Items */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground font-serif">Add to Pantry</h2>
          </div>
          <AddItemForm onAdd={addItem} />
          <ScannerButton onScan={scanItem} />
        </section>

        {/* Pantry Inventory */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground font-serif">Pantry Inventory</h2>
            </div>
            <span className="text-sm text-muted-foreground bg-secondary rounded-full px-3 py-0.5">
              {activeItems.length} item{activeItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-xl bg-card border p-4 h-[72px] animate-pulse" />
              ))}
            </div>
          ) : (
            <InventoryList
              items={activeItems}
              getDaysRemaining={getDaysRemaining}
              onConsume={consumeItem}
              onToss={tossItem}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
