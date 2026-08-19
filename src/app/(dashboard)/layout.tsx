import Image from "next/image";
import { ClipboardList, Home, LogOut, ShieldCheck, UsersRound, Users } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/auth/dal";
import { logout } from "@/lib/auth/actions";
import { NavLink } from "@/components/nav-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const BRAND_NAVY = "#13265C";

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserProfile();

  return (
    <div className="flex flex-1 flex-col">
      {/* Full width of the boxed app shell (see root layout's max-w-6xl
          wrapper) — the narrower box means less of the (portrait) photo
          gets cropped away than a full-viewport-wide banner would. */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden border-b">
        <Image
          src="/cesna-plane.jpg"
          alt=""
          fill
          priority
          className="object-cover grayscale-[55%] contrast-125 brightness-75"
          style={{ objectPosition: "center 38%" }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: BRAND_NAVY, mixBlendMode: "multiply", opacity: 0.65 }}
        />
      </div>

      {/*
        `collapsible="none"` renders the sidebar as a plain flow element
        instead of shadcn's default `fixed inset-y-0` desktop container —
        fixed positioning is relative to the viewport, which would break out
        of the centered box above and misalign with it. Trades away the
        collapse-to-icons affordance, which this app doesn't otherwise use.
      */}
      <SidebarProvider className="min-h-0 flex-1">
        <Sidebar collapsible="none">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ShieldCheck className="size-4" />
              </div>
              <span className="truncate font-semibold tracking-tight">AeroVet Compliance</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Workspace
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <NavLink href="/home" icon={<Home />}>
                      Home
                    </NavLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <NavLink href="/candidates" icon={<Users />}>
                      Candidates
                    </NavLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <NavLink href="/audit" icon={<ClipboardList />}>
                      Audit trail
                    </NavLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <NavLink href="/team" icon={<UsersRound />}>
                      Team
                    </NavLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center gap-2 rounded-full px-2 py-1.5">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs font-medium">
                  {initialsFor(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.company.name}</span>
              </div>
            </div>
            <form action={logout}>
              <SidebarMenuButton type="submit">
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </form>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center border-b px-4">
            <span className="text-sm font-medium text-muted-foreground">{user.company.name}</span>
          </header>
          <main className="flex flex-1 flex-col gap-6 p-6 md:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
