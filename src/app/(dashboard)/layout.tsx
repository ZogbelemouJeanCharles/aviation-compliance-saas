import { ClipboardList, LogOut, ShieldCheck, UsersRound, Users } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/auth/dal";
import { logout } from "@/lib/auth/actions";
import { NavLink } from "@/components/nav-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" />
            </div>
            <span className="truncate font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
              AeroVet Compliance
            </span>
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
          <div className="flex items-center gap-2 rounded-full px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="text-xs font-medium">
                {initialsFor(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
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
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium text-muted-foreground">{user.company.name}</span>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
