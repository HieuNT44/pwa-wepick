"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
  const router = useRouter();

  const handleGoToLogin = () => {
    onClose();
    router.push("/login");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yêu cầu đăng nhập</DialogTitle>
          <DialogDescription>
            Bạn cần có tài khoản để thực hiện chức năng này. Vui lòng đăng
            nhập để tiếp tục.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>
          <Button
            onClick={handleGoToLogin}
            className="w-full sm:w-auto"
          >
            Đăng nhập
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

