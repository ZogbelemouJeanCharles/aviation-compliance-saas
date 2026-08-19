import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 700px 450px at 50% 0%, oklch(0.3 0 0 / 0.55), transparent 70%)",
        }}
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
