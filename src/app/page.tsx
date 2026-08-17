import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
        Aviation certification & clearance compliance, verified.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        A verification and compliance-tracking layer for defense & aerospace
        recruiting teams — built on top of your existing ATS.
      </p>
      <Button render={<Link href="/login" />} size="lg">
        Sign in
      </Button>
    </div>
  );
}
