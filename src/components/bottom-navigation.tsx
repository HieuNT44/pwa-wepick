"use client";

import { SafeLink } from "@/components/safe-link";
import { usePathname } from "next/navigation";

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="BottomNavigation fixed bottom-0 left-0 right-0 w-full max-w-[600px] mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 pb-6 pt-3 flex justify-between items-end z-40">
      {/* Home */}
      <SafeLink
        href="/home"
        className="flex flex-col items-center gap-1 flex-1"
      >
        <span
          className={`material-symbols-outlined ${
            isActive("/home")
              ? "text-primary filled-icon"
              : "text-text-muted"
          }`}
        >
          home
        </span>
        <span
          className={`text-[10px] ${
            isActive("/home")
              ? "font-bold text-primary"
              : "font-medium text-text-muted"
          }`}
        >
          Trang chủ
        </span>
      </SafeLink>

      {/* Members */}
      <SafeLink
        href="/members"
        className="flex flex-col items-center gap-1 flex-1"
      >
        <span
          className={`material-symbols-outlined ${
            isActive("/members")
              ? "text-primary filled-icon"
              : "text-text-muted"
          }`}
        >
          group
        </span>
        <span
          className={`text-[10px] ${
            isActive("/members")
              ? "font-bold text-primary"
              : "font-medium text-text-muted"
          }`}
        >
          Thành viên
        </span>
      </SafeLink>

      {/* Match - Center button, larger */}
      <SafeLink
        href="/match"
        className="flex flex-col items-center gap-1 relative -mt-8"
      >
        <div
          className={`size-16 rounded-full flex items-center justify-center shadow-float transition-all ${
            isActive("/match")
              ? "bg-primary text-white scale-105"
              : "bg-primary text-white scale-100"
          }`}
        >
          <span className="material-symbols-outlined text-4xl filled-icon">
            sports_tennis
          </span>
        </div>
        <span
          className={`text-[10px] mt-1 ${
            isActive("/match")
              ? "font-bold text-primary"
              : "font-medium text-primary"
          }`}
        >
          Thi đấu
        </span>
      </SafeLink>

      {/* Ranking */}
      <SafeLink
        href="/ranking"
        className="flex flex-col items-center gap-1 flex-1"
      >
        <span
          className={`material-symbols-outlined ${
            isActive("/ranking")
              ? "text-primary filled-icon"
              : "text-text-muted"
          }`}
        >
          emoji_events
        </span>
        <span
          className={`text-[10px] ${
            isActive("/ranking")
              ? "font-bold text-primary"
              : "font-medium text-text-muted"
          }`}
        >
          Xếp hạng
        </span>
      </SafeLink>

      {/* History */}
      <SafeLink
        href="/rules"
        className="flex flex-col items-center gap-1 flex-1"
      >
        <span
          className={`material-symbols-outlined ${
            isActive("/rules")
              ? "text-primary filled-icon"
              : "text-text-muted"
          }`}
        >
          history
        </span>
        <span
          className={`text-[10px] ${
            isActive("/rules")
              ? "font-bold text-primary"
              : "font-medium text-text-muted"
          }`}
        >
          Lịch sử
        </span>
      </SafeLink>
    </nav>
  );
}

