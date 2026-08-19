import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 900px 550px at 50% -5%, oklch(0.32 0 0 / 0.6), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ShieldCheck className="size-7" />
        </div>

        <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Aviation Compliance Platform
        </span>

        <h1 className="max-w-2xl text-5xl font-medium tracking-tight text-balance">
          Aviation certification &amp; clearance compliance, verified.
        </h1>

        <div className="h-px w-16 bg-border" />

        <p className="max-w-xl text-lg text-muted-foreground text-balance">
          A verification and compliance-tracking layer for defense &amp; aerospace
          recruiting teams — built on top of your existing ATS.
        </p>

        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          size="lg"
          className="mt-2 rounded-full px-6"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
