import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const BRAND_NAVY = "#13265C";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden">
        <Image
          src="/cesna-plane.jpg"
          alt="Cessna aircraft on the tarmac"
          fill
          priority
          className="object-cover object-center grayscale-[55%] contrast-125 brightness-75"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: BRAND_NAVY, mixBlendMode: "multiply", opacity: 0.6 }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        />
      </div>

      <div className="relative -mt-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
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
