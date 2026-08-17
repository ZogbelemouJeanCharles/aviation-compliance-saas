import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm border-none shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">AeroVet Compliance</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
