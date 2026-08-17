import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <Card className="border-none bg-muted/40 shadow-none">
      <CardContent className="flex items-center gap-4 px-5 py-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            tone === "warning" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
            tone === "success" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
            tone === "default" && "bg-primary/10 text-primary"
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
