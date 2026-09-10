import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityImpact } from "@/hooks/useCommunityImpact";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, Package, Leaf, Trash2, RefreshCw, Shield, UserX, Activity, Percent, Cloud, Flame, TrendingUp, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function Stat({ icon, value, label, sub }: { icon: React.ReactNode; value: React.ReactNode; label: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-4 flex flex-col items-center text-center">
        <div className="mb-1">{icon}</div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-foreground text-xs text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}

const AdminPage = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, adminLoading, users, usersLoading, refetchUsers, kickUser } = useAdmin();
  const { data: community, loading: communityLoading, refreshing: communityRefreshing, refresh: refreshCommunity } = useCommunityImpact();
  const navigate = useNavigate();
  const [target, setTarget] = useState<{ id: string; email: string } | null>(null);
  const [kicking, setKicking] = useState(false);

  const handleKick = async () => {
    if (!target) return;
    setKicking(true);
    const { error } = await kickUser(target.id);
    setKicking(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(`${target.email} has been removed`);
      refreshCommunity();
    }
    setTarget(null);
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking access…</div>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/app" replace />;

  const co2Factor = 2.5;

  // ---- Derived analytics from the user roster ----
  const now = Date.now();
  const day = 86400000;
  const daysSince = (d: string | null) => (d ? (now - new Date(d).getTime()) / day : Infinity);

  const totalUsers = users.length;
  const active7 = users.filter((u) => daysSince(u.last_activity) <= 7).length;
  const active30 = users.filter((u) => daysSince(u.last_activity) <= 30).length;
  const dormant = users.filter((u) => daysSince(u.last_activity) > 30).length;
  const emptyUsers = users.filter((u) => u.total_items === 0).length;
  const engagedUsers = totalUsers - emptyUsers;

  const sumItems = users.reduce((s, u) => s + u.total_items, 0);
  const sumActive = users.reduce((s, u) => s + u.active_items, 0);
  const sumConsumed = users.reduce((s, u) => s + u.consumed_items, 0);
  const sumTossed = users.reduce((s, u) => s + u.tossed_items, 0);
  const sumSaved = users.reduce((s, u) => s + u.total_saved_kg, 0);
  const sumWasted = users.reduce((s, u) => s + u.total_wasted_kg, 0);
  const totalKg = sumSaved + sumWasted;
  const saveRate = totalKg > 0 ? (sumSaved / totalKg) * 100 : 0;

  const avgItems = totalUsers ? sumItems / totalUsers : 0;
  const avgSaved = totalUsers ? sumSaved / totalUsers : 0;
  const avgWasted = totalUsers ? sumWasted / totalUsers : 0;

  const rates = users
    .filter((u) => u.total_saved_kg + u.total_wasted_kg > 0)
    .map((u) => (u.total_saved_kg / (u.total_saved_kg + u.total_wasted_kg)) * 100)
    .sort((a, b) => a - b);
  const medianRate = rates.length
    ? rates.length % 2
      ? rates[(rates.length - 1) / 2]
      : (rates[rates.length / 2 - 1] + rates[rates.length / 2]) / 2
    : 0;

  const topSaver = [...users].sort((a, b) => b.total_saved_kg - a.total_saved_kg)[0];
  const topWaster = [...users].sort((a, b) => b.total_wasted_kg - a.total_wasted_kg)[0];

  // ---- Plan distribution & membership ----
  const planCounts = users.reduce<Record<string, number>>((acc, u) => {
    const key = u.is_lifetime ? "lifetime" : u.plan;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const paidUsers = users.filter((u) => u.is_lifetime || u.plan !== "free").length;

  const memberFor = (joined: string | null) => {
    if (!joined) return "—";
    const days = Math.max(0, Math.floor(daysSince(joined)));
    if (days < 1) return "today";
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ${days % 30}d`;
    return `${Math.floor(months / 12)}y ${months % 12}mo`;
  };

  const planBadge = (u: (typeof users)[number]) => {
    const label = u.is_lifetime ? "Lifetime" : u.plan.charAt(0).toUpperCase() + u.plan.slice(1);
    const cls =
      u.is_lifetime || u.plan === "pro"
        ? "bg-primary/15 text-primary"
        : u.plan === "lite"
          ? "bg-success/15 text-success"
          : "bg-muted text-muted-foreground";
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
        {label}
      </span>
    );
  };

  const co2Saved = sumSaved * co2Factor;
  const co2Wasted = sumWasted * co2Factor;
  // rough equivalences
  const meals = sumSaved / 0.4; // ~400g per meal
  const carKm = co2Saved / 0.17; // ~170g CO2 per km
  const showers = co2Saved / 0.5;

  const statusSplit = [
    { label: "Active", value: sumActive, color: "bg-primary" },
    { label: "Consumed", value: sumConsumed, color: "bg-success" },
    { label: "Tossed", value: sumTossed, color: "bg-destructive" },
  ];

  const trendData =
    community?.weeklyTrend.map((w) => ({
      name: new Date(w.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      Saved: Number(w.savedKg.toFixed(2)),
      Wasted: Number(w.wastedKg.toFixed(2)),
    })) ?? [];


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground font-serif">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Aggregate Stats */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground font-serif">Community Overview</h2>
            <Button variant="outline" size="sm" onClick={refreshCommunity} disabled={communityRefreshing || communityLoading} className="gap-1">
              <RefreshCw className={`h-4 w-4 ${communityRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {communityLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(n => <div key={n} className="h-24 rounded-xl bg-card border animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Headline KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat icon={<Users className="h-5 w-5 text-primary" />} value={totalUsers} label="Total Users" />
                <Stat icon={<Activity className="h-5 w-5 text-primary" />} value={active7} label="Active (7 days)" sub={`${totalUsers ? Math.round((active7 / totalUsers) * 100) : 0}% of users`} />
                <Stat icon={<Package className="h-5 w-5 text-primary" />} value={sumItems} label="Items Tracked" sub={`${sumActive} still in pantry`} />
                <Stat icon={<Percent className="h-5 w-5 text-success" />} value={`${saveRate.toFixed(1)}%`} label="Save Rate" sub={`median ${medianRate.toFixed(0)}%`} />
                <Stat icon={<Leaf className="h-5 w-5 text-success" />} value={`${sumSaved.toFixed(1)} kg`} label="Food Saved" sub={`${sumConsumed} items consumed`} />
                <Stat icon={<Trash2 className="h-5 w-5 text-destructive" />} value={`${sumWasted.toFixed(1)} kg`} label="Food Wasted" sub={`${sumTossed} items tossed`} />
                <Stat icon={<Cloud className="h-5 w-5 text-success" />} value={`${co2Saved.toFixed(1)} kg`} label="CO₂ Avoided" />
                <Stat icon={<Flame className="h-5 w-5 text-destructive" />} value={`${co2Wasted.toFixed(1)} kg`} label="CO₂ Wasted" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Plan distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Plan Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Row label="Free" value={planCounts.free ?? 0} />
                    <Row label="Lite" value={planCounts.lite ?? 0} />
                    <Row label="Pro" value={planCounts.pro ?? 0} />
                    <Row label="Lifetime" value={planCounts.lifetime ?? 0} />
                    <div className="pt-2 border-t">
                      <Row label="Paid members" value={`${paidUsers} / ${totalUsers} (${totalUsers ? Math.round((paidUsers / totalUsers) * 100) : 0}%)`} />
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Engagement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Row label="Active last 7 days" value={active7} />
                    <Row label="Active last 30 days" value={active30} />
                    <Row label="Dormant (30+ days)" value={dormant} />
                    <Row label="Users with items" value={`${engagedUsers} / ${totalUsers}`} />
                    <Row label="Never added an item" value={emptyUsers} />
                    <Row label="Avg items per user" value={avgItems.toFixed(1)} />
                    <Row label="Avg kg saved per user" value={`${avgSaved.toFixed(2)} kg`} />
                    <Row label="Avg kg wasted per user" value={`${avgWasted.toFixed(2)} kg`} />
                  </CardContent>
                </Card>

                {/* Item status split */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Item Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {statusSplit.map((s) => {
                      const pct = sumItems > 0 ? (s.value / sumItems) * 100 : 0;
                      return (
                        <div key={s.label} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{s.label}</span>
                            <span className="font-medium text-foreground">{s.value} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full ${s.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t space-y-2 text-sm">
                      <Row label="Avg weight per item" value={`${sumItems > 0 ? (totalKg / sumItems).toFixed(2) : "0.00"} kg`} />
                      <Row label="Total weight logged" value={`${totalKg.toFixed(1)} kg`} />
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly trend */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Weekly Trend (saved vs wasted)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-56">
                    {trendData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="Saved" fill="hsl(152,45%,32%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Wasted" fill="hsl(4,60%,52%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">No trend data yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Top contributors */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Top Contributors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {community?.topContributors.length ? (
                      community.topContributors.slice(0, 5).map((c) => (
                        <Row key={c.userId} label={`#${c.rank} ${c.displayName ?? "Member"}`} value={`${c.kgSaved.toFixed(1)} kg`} />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No contributors yet</p>
                    )}
                    <div className="pt-2 border-t space-y-2">
                      <Row label="Best saver" value={topSaver ? `${topSaver.email} · ${topSaver.total_saved_kg.toFixed(1)} kg` : "—"} />
                      <Row label="Most waste" value={topWaster ? `${topWaster.email} · ${topWaster.total_wasted_kg.toFixed(1)} kg` : "—"} />
                    </div>
                  </CardContent>
                </Card>

                {/* Common items */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Most Common Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {community?.commonItems.length ? (
                      community.commonItems.slice(0, 6).map((i) => (
                        <Row key={i.name} label={i.name} value={`${i.count}× · ${i.totalKg.toFixed(1)} kg`} />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No items yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Equivalences */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Leaf className="h-4 w-4 text-success" /> Real-world Equivalent</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-foreground">{Math.round(meals).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">meals rescued</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{Math.round(carKm).toLocaleString()} km</p>
                      <p className="text-xs text-muted-foreground">of car travel avoided</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{Math.round(showers).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">hot showers of emissions</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </section>


        {/* Users Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground font-serif">All Users</h2>
            <Button variant="outline" size="sm" onClick={refetchUsers} disabled={usersLoading} className="gap-1">
              <RefreshCw className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-center">Active</TableHead>
                      <TableHead className="text-center">Consumed</TableHead>
                      <TableHead className="text-center">Tossed</TableHead>
                      <TableHead className="text-right">Saved (kg)</TableHead>
                      <TableHead className="text-right">Wasted (kg)</TableHead>
                      <TableHead className="text-right">CO₂ Saved</TableHead>
                      <TableHead>Last Sign-in</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">Loading…</TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">No users yet</TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell>
                            <div className="font-medium text-sm">{u.display_name ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </TableCell>
                          <TableCell>{planBadge(u)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.joined_at ? (
                              <>
                                <div>{new Date(u.joined_at).toLocaleDateString()}</div>
                                <div className="text-[10px]">member for {memberFor(u.joined_at)}</div>
                              </>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-center">{u.active_items}</TableCell>
                          <TableCell className="text-center text-success">{u.consumed_items}</TableCell>
                          <TableCell className="text-center text-destructive">{u.tossed_items}</TableCell>
                          <TableCell className="text-right">{u.total_saved_kg.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{u.total_wasted_kg.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{(u.total_saved_kg * co2Factor).toFixed(1)} kg</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.last_activity ? new Date(u.last_activity).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive gap-1"
                              disabled={u.user_id === user?.id}
                              onClick={() => setTarget({ id: u.user_id, email: u.email })}
                            >
                              <UserX className="h-4 w-4" />
                              Kick
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {target?.email} will be permanently removed along with their pantry data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={kicking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleKick(); }}
              disabled={kicking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {kicking ? "Removing…" : "Kick user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
