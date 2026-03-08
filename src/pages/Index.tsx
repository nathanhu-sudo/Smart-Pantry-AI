import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, LogOut, Package, TrendingUp, Sparkles, BarChart2, ScanLine, Home } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { InventoryList } from "@/components/InventoryList";
import { AddItemForm } from "@/components/AddItemForm";
import { usePantry } from "@/hooks/usePantry";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.jpg";
import ChartsPage from "./ChartsPage";
import ScannerPage from "./ScannerPage";

type Tab = "home" | "charts" | "scanner";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "charts", label: "Charts", icon: BarChart2 },
  { id: "scanner", label: "Scanner", icon: ScanLine },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const { activeItems, impact, loading, getDaysRemaining, addItem } = usePantry();
  const { user, signOut } = useAuth();

  const expiringCount = activeItems.filter((i) => getDaysRemaining(i) <= 3).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero / Header */}
      <header className="relative overflow-hidden border-b shrink-0">
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/60" />

        <div className="relative container max-w-2xl py-8 px-4 flex flex-col items-center text-center gap-2">
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
            Your kitchen's digital twin. Track what you eat, reduce waste, grow your green impact.
          </motion.p>

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

        {/* Tab bar */}
        <div className="relative border-t bg-card/80 backdrop-blur-sm">
          <div className="container max-w-2xl mx-auto flex">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors relative ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                  {active && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 inset-x-4 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 container max-w-2xl px-4 py-8 mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-8"
            >
              {/* Green Impact */}
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
              </section>

              {/* Inventory */}
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
                    onConsume={() => {}}
                    onToss={() => {}}
                  />
                )}
              </section>
            </motion.div>
          )}

          {activeTab === "charts" && (
            <motion.div
              key="charts"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <ChartsPage />
            </motion.div>
          )}

          {activeTab === "scanner" && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <ScannerPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t z-30 safe-area-bottom">
        <div className="flex">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="sm:hidden h-20" />
    </div>
  );
};

export default Index;
