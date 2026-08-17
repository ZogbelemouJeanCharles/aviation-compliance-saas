import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/auth/dal";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserProfile();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/candidates" className="font-semibold">
            AeroVet Compliance
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/candidates" className="hover:text-foreground">
              Candidates
            </Link>
            <Link href="/audit" className="hover:text-foreground">
              Audit trail
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {user.name} · {user.company.name}
          </span>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col px-6 py-6">{children}</main>
    </div>
  );
}
