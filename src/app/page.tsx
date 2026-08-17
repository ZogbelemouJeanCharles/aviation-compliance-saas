import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-muted/30 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <ShieldCheck className="size-7" />
      </div>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance">
        Aviation certification & clearance compliance, verified.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground text-balance">
        A verification and compliance-tracking layer for defense & aerospace
        recruiting teams — built on top of your existing ATS.
      </p>
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        size="lg"
        className="rounded-full px-6"
      >
        Sign in
      </Button>
    </div>
  );
}
