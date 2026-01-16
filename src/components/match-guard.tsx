"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getIsMatchActive } from "@/lib/utils/local-storage";
import { useMatchGuard, MatchGuardDialog } from "@/hooks/use-match-guard";

export function MatchGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMatchActive, setIsMatchActive] = useState(false);
  const { showWarning, confirmNavigation, cancelNavigation } = useMatchGuard();

  useEffect(() => {
    const checkMatchActive = () => {
      const active = getIsMatchActive();
      setIsMatchActive(active);

      // Auto redirect if match is active and not on match page or sub-pages
      if (active && !pathname.startsWith("/match")) {
        router.push("/match");
      }
    };

    checkMatchActive();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wepick_is_match_active") {
        checkMatchActive();
      }
    };

    // Check periodically (for same-tab changes)
    const interval = setInterval(checkMatchActive, 500);

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [pathname, router]);

  // Prevent browser back/forward when match is active
  useEffect(() => {
    if (!isMatchActive) return;

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", "/match");
      router.push("/match");
    };

    // Push current state to prevent back navigation
    window.history.pushState(null, "", pathname);

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMatchActive, pathname, router]);

  // Intercept Link clicks when match is active
  useEffect(() => {
    if (!isMatchActive) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href) {
        const url = new URL(link.href);
        const path = url.pathname;
        
        // Allow navigation within match pages
        if (path.startsWith("/match")) {
          return;
        }
        
        // Block other navigation
        e.preventDefault();
        e.stopPropagation();
        
        // Show warning dialog
        const event = new CustomEvent("match-navigation-attempt", {
          detail: { path },
        });
        window.dispatchEvent(event);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isMatchActive]);

  return (
    <MatchGuardDialog
      open={showWarning}
      onConfirm={confirmNavigation}
      onCancel={cancelNavigation}
    />
  );
}

