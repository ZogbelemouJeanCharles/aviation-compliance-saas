import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

const BRAND_NAVY = "#13265C";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
      <Image
        src="/cesna-plane.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center opacity-35 blur-sm grayscale-[55%] contrast-125 brightness-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: BRAND_NAVY, mixBlendMode: "multiply", opacity: 0.55 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60"
      />

      <Card className="relative w-full max-w-sm border-none shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <CardTitle className="text-xl font-medium tracking-tight">Sign in</CardTitle>
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            AeroVet Compliance
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
