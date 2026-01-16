"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  return (
    <nav className="Navbar border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          WePick PWA
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/offline" className="text-sm hover:underline">
            Offline
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

