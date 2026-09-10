import { useState } from "react";
import { AdminUser, TAG_PRESETS } from "@/hooks/useAdmin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { X, Plus, UserX, Crown, Sparkles, Leaf, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";

const PLAN_OPTIONS = ["free", "lite", "pro", "lifetime"] as const;

const CO2_FACTOR = 2.5;

function tagStyle(tag: string) {
  switch (tag) {
    case "VIP":
      return "bg-warning/15 text-warning border-warning/30";
    case "Founder":
      return "bg-primary/15 text-primary border-primary/30";
    case "Food Saver":
      return "bg-success/15 text-success border-success/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function TagIconFor({ tag }: { tag: string }) {
  if (tag === "VIP") return <Crown className="h-3 w-3" />;
  if (tag === "Founder") return <Sparkles className="h-3 w-3" />;
  if (tag === "Food Saver") return <Leaf className="h-3 w-3" />;
  return <TagIcon className="h-3 w-3" />;
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString() : "—";
}

function memberFor(joined: string | null) {
  if (!joined) return "—";
  const days = Math.max(0, Math.floor((Date.now() - new Date(joined).getTime()) / 86400000));
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
  const d = days % 30;
  return [y ? `${y}y` : "", m ? `${m}mo` : "", `${d}d`].filter(Boolean).join(" ");
}

interface Props {
  user: AdminUser | null;
  isSelf: boolean;
  onOpenChange: (open: boolean) => void;
  onSetPlan: (userId: string, plan: string, billing?: "monthly" | "yearly") => Promise<{ error?: string }>;
  onAddTag: (userId: string, tag: string) => Promise<{ error?: string }>;
  onRemoveTag: (userId: string, tag: string) => Promise<{ error?: string }>;
  onKick: (u: AdminUser) => void;
}

export function UserDetailDialog({
  user,
  isSelf,
  onOpenChange,
  onSetPlan,
  onAddTag,
  onRemoveTag,
  onKick,
}: Props) {
  const [customTag, setCustomTag] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const total = user.total_saved_kg + user.total_wasted_kg;
  const saveRate = total > 0 ? (user.total_saved_kg / total) * 100 : 0;

  const changePlan = async (plan: string) => {
    setBusy(true);
    const { error } = await onSetPlan(user.user_id, plan);
    setBusy(false);
    error ? toast.error(error) : toast.success(`Plan set to ${plan}`);
  };

  const add = async (tag: string) => {
    setBusy(true);
    const { error } = await onAddTag(user.user_id, tag);
    setBusy(false);
    if (error) toast.error(error);
    else {
      toast.success(`Added “${tag}”`);
      setCustomTag("");
    }
  };

  const remove = async (tag: string) => {
    setBusy(true);
    const { error } = await onRemoveTag(user.user_id, tag);
    setBusy(false);
    if (error) toast.error(error);
  };

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback>
                {(user.display_name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <DialogTitle className="text-base">{user.display_name ?? "Unnamed member"}</DialogTitle>
              <DialogDescription className="text-xs">{user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tags */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Name tags</p>
          <div className="flex flex-wrap gap-1.5 min-h-[28px]">
            {user.tags.length === 0 && (
              <span className="text-xs text-muted-foreground">No tags yet</span>
            )}
            {user.tags.map((t) => (
              <Badge key={t} variant="outline" className={`gap-1 ${tagStyle(t)}`}>
                <TagIconFor tag={t} />
                {t}
                <button
                  className="ml-0.5 opacity-60 hover:opacity-100"
                  disabled={busy}
                  onClick={() => remove(t)}
                  aria-label={`Remove ${t}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TAG_PRESETS.filter((t) => !user.tags.includes(t)).map((t) => (
              <Button
                key={t}
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                disabled={busy}
                onClick={() => add(t)}
              >
                <Plus className="h-3 w-3" /> {t}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Custom tag"
              maxLength={24}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              className="h-8"
              disabled={busy || !customTag.trim()}
              onClick={() => add(customTag)}
            >
              Add
            </Button>
          </div>
        </div>

        <Separator />

        {/* Plan control */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Plan</p>
          <div className="grid grid-cols-4 gap-2">
            {PLAN_OPTIONS.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={user.plan === p ? "default" : "outline"}
                className="h-8 text-xs capitalize"
                disabled={busy}
                onClick={() => changePlan(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <div className="pt-1">
            <Line label="Status" value={user.plan_status} />
            <Line label="Lifetime" value={user.is_lifetime ? "Yes" : "No"} />
            <Line label="Plan started" value={fmt(user.plan_started_at)} />
            <Line label="Renews / expires" value={fmt(user.plan_expires_at)} />
          </div>
        </div>

        <Separator />

        {/* Account */}
        <div>
          <p className="text-xs font-semibold text-foreground mb-1">Account</p>
          <Line label="Joined" value={fmt(user.joined_at)} />
          <Line label="Member for" value={memberFor(user.joined_at)} />
          <Line label="Last sign-in" value={fmt(user.last_sign_in_at)} />
          <Line label="Last pantry activity" value={fmt(user.last_activity)} />
          <Line label="User ID" value={<span className="font-mono text-[10px]">{user.user_id}</span>} />
        </div>

        <Separator />

        {/* Activity */}
        <div>
          <p className="text-xs font-semibold text-foreground mb-1">Activity</p>
          <Line label="Total items" value={user.total_items} />
          <Line label="Active items" value={user.active_items} />
          <Line label="Consumed" value={user.consumed_items} />
          <Line label="Tossed" value={user.tossed_items} />
          <Line label="Saved" value={`${user.total_saved_kg.toFixed(1)} kg`} />
          <Line label="Wasted" value={`${user.total_wasted_kg.toFixed(1)} kg`} />
          <Line label="Save rate" value={`${saveRate.toFixed(0)}%`} />
          <Line label="CO₂ avoided" value={`${(user.total_saved_kg * CO2_FACTOR).toFixed(1)} kg`} />
          <Line label="CO₂ wasted" value={`${(user.total_wasted_kg * CO2_FACTOR).toFixed(1)} kg`} />
        </div>

        <Separator />

        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive gap-2 justify-start"
          disabled={isSelf}
          onClick={() => onKick(user)}
        >
          <UserX className="h-4 w-4" />
          {isSelf ? "You can't remove yourself" : "Remove this member"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
