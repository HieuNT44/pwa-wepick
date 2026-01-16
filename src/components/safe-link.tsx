"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getIsMatchActive } from "@/lib/utils/local-storage";
import { useMatchGuard } from "@/hooks/use-match-guard";
import type { LinkProps } from "next/link";
import { MouseEvent } from "react";

interface SafeLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function SafeLink({ href, children, className, onClick, ...props }: SafeLinkProps) {
  const router = useRouter();
  const { showWarning, confirmNavigation, cancelNavigation } = useMatchGuard();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const isMatchActive = getIsMatchActive();
    const targetPath = typeof href === "string" ? href : href.pathname || "";

    // Allow navigation within match pages
    if (targetPath.startsWith("/match")) {
      if (onClick) onClick(e);
      return;
    }

    // Block navigation if match is active
    if (isMatchActive) {
      e.preventDefault();
      e.stopPropagation();
      
      // Dispatch custom event for MatchGuard to handle
      const event = new CustomEvent("match-navigation-attempt", {
        detail: { path: targetPath },
      });
      window.dispatchEvent(event);
      return;
    }

    if (onClick) onClick(e);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

