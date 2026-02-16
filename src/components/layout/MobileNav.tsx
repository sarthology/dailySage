"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SignOutButton } from "./SignOutButton";

interface MobileNavProps {
  isAuthenticated: boolean;
}

const authenticatedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/journal", label: "Journal" },
  { href: "/explore", label: "Widgets" },
  { href: "/profile", label: "Profile" },
];

const publicLinks = [
  { href: "/auth/login", label: "Sign In" },
  { href: "/auth/signup", label: "Get Started" },
];

export function MobileNav({ isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden p-1 text-ink"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-paper-light border-r border-muted-light"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-lg font-extrabold tracking-wide text-ink">
            Daily Sage
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b border-muted-light py-3 text-sm font-medium transition-colors duration-150 ${
                pathname === link.href
                  ? "text-accent"
                  : "text-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <div className="border-b border-muted-light py-3">
              <SignOutButton />
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
