import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { usePantry } from "@/hooks/usePantry";
import { CO2_MULTIPLIERS } from "@/types/pantry";

const COLORS = ["hsl(152,45%,32%)", "hsl(4,60%,52%)", "hsl(38,65%,55%)"];

export default function ChartsPage() {
  const { items } = usePantry();

  const consumed = items.filter((i) => i.status === "consumed");
  const tossed = items.filter((i) => i.status === "tossed");
  const active = items.filter((i) => i.status === "active");

  const statusData = [
    { name: "Consumed", value: consumed.length },
    { name: "Wasted", value: tossed.length },
    { name: "Active", value: active.length },
  ].filter((d) => d.value > 0);

  // CO2 bar chart by category
  const co2Data = (["low", "medium", "high"] as const).map((level) => {
    const saved = consumed.filter((i) => i.co2Impact === level).reduce((s, i) => s + i.weightKg * CO2_MULTIPLIERS[level], 0);
    const wasted = tossed.filter((i) => i.co2Impact === level).reduce((s, i) => s + i.weightKg * CO2_MULTIPLIERS[level], 0);
    return { name: level.charAt(0).toUpperCase() + level.slice(1), Saved: parseFloat(saved.toFixed(2)), Wasted: parseFloat(wasted.toFixed(2)) };
  });

  // Weight saved per week (last 4 weeks)
  const now = Date.now();
  const weekData = [3, 2, 1, 0].map((weeksAgo) => {
    const start = now - (weeksAgo + 1) * 7 * 86400000;
    const end = now - weeksAgo * 7 * 86400000;
    const label = weeksAgo === 0 ? "This week" : `${weeksAgo}w ago`;
    const weekConsumed = consumed
      .filter((i) => { const t = new Date(i.addedAt).getTime(); return t >= start && t < end; })
      .reduce((s, i) => s + i.weightKg, 0);
    const weekTossed = tossed
      .filter((i) => { const t = new Date(i.addedAt).getTime(); return t >= start && t < end; })
      .reduce((s, i) => s + i.weightKg, 0);
    return { name: label, Consumed: parseFloat(weekConsumed.toFixed(2)), Wasted: parseFloat(weekTossed.toFixed(2)) };
  });

  const isEmpty = items.length === 0;

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h2 className="text-xl font-serif font-bold text-foreground mb-1">Impact Charts</h2>
        <p className="text-sm text-muted-foreground">Visual breakdown of your pantry activity</p>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed p-16 flex flex-col items-center gap-3 text-muted-foreground"
        >
          <p className="font-medium">No data yet</p>
          <p className="text-sm text-center">Add and consume or toss items to see your impact charts</p>
        </motion.div>
      ) : (
        <>
          {/* Item status pie */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl bg-card border p-5">
            <h3 className="font-semibold text-foreground mb-4">Item Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Weekly weight bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card border p-5">
            <h3 className="font-semibold text-foreground mb-4">Weekly Food Tracking (kg)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Consumed" fill="hsl(152,45%,32%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Wasted" fill="hsl(4,60%,52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* CO2 impact bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl bg-card border p-5">
            <h3 className="font-semibold text-foreground mb-4">CO₂ Impact by Category (kg)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={co2Data} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Saved" fill="hsl(152,45%,32%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Wasted" fill="hsl(4,60%,52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}
