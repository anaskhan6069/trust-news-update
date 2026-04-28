"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/constants";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
}

export function Navbar({ onNavigate, orientation = "horizontal" }: NavbarProps): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className={cn("flex", orientation === "horizontal" ? "items-center gap-6" : "flex-col gap-2")}>
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "rounded-md px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
              isActive && "text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
