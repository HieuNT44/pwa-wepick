"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIsMatchActive } from "@/lib/utils/local-storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function useMatchGuard() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    const handleNavigationAttempt = (e: CustomEvent<{ path: string }>) => {
      const active = getIsMatchActive();
      const targetPath = e.detail.path;
      
      // Allow navigation within match pages
      if (targetPath.startsWith("/match")) {
        return;
      }
      
      if (active) {
        setPendingPath(targetPath);
        setShowWarning(true);
      }
    };

    window.addEventListener("match-navigation-attempt", handleNavigationAttempt as EventListener);
    return () => {
      window.removeEventListener("match-navigation-attempt", handleNavigationAttempt as EventListener);
    };
  }, [router]);

  const confirmNavigation = () => {
    if (pendingPath) {
      router.push(pendingPath);
    }
    setShowWarning(false);
    setPendingPath(null);
  };

  const cancelNavigation = () => {
    setShowWarning(false);
    setPendingPath(null);
  };

  return {
    showWarning,
    confirmNavigation,
    cancelNavigation,
  };
}

export function MatchGuardDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đang thi đấu</DialogTitle>
          <DialogDescription>
            Bạn đang trong một trận đấu. Nếu rời khỏi trang này, bạn có thể mất
            tiến trình thi đấu. Bạn có chắc chắn muốn rời khỏi?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Ở lại
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Rời khỏi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

