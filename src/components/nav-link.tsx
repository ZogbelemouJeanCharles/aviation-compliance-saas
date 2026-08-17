"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function NavLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarMenuButton isActive={isActive} render={<Link href={href} />}>
      {icon}
      <span>{children}</span>
    </SidebarMenuButton>
  );
}
