"use client";

import { SafeLink } from "@/components/safe-link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getUserByEmail } from "@/lib/firebase/users";
import type { User } from "@/types/user";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load current user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) {
        return;
      }

      try {
        const userData = await getUserByEmail(user.email).catch(() => null);
        if (userData) {
          setCurrentUser(userData);
        }
      } catch (error) {
        console.warn("Error loading user data:", error);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const userDisplayName =
    currentUser?.name ||
    currentUser?.nickname ||
    user?.displayName ||
    "Người dùng";

  return (
    <div className="Offline flex flex-col w-full border-x border-gray-100 relative bg-background text-text-main min-h-screen">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-lg z-30">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full border-2 border-primary p-0.5 opacity-50">
            <img
              alt="User"
              className="w-full h-full object-cover rounded-full grayscale"
              src={
                user?.photoURL ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA"
              }
            />
          </div>
          <div>
            <p className="text-xs text-text-muted">{getGreeting()},</p>
            <h2 className="font-bold text-base">{userDisplayName} 👋</h2>
          </div>
        </div>
        <button className="size-10 rounded-full bg-white shadow-soft flex items-center justify-center relative opacity-50">
          <span className="material-symbols-outlined text-text-muted">
            notifications
          </span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-24 text-center">
        <div className="relative mb-8">
          <div className="size-48 bg-primary/5 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-spin-slow"></div>
            <div className="relative">
              <span className="material-symbols-outlined text-[80px] text-primary/40">
                sports_tennis
              </span>
              <div className="absolute -top-2 -right-2 bg-white p-1 rounded-full">
                <div className="bg-danger/10 p-2 rounded-full">
                  <span className="material-symbols-outlined text-danger text-3xl font-bold">
                    wifi_off
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-text-main mb-3">
          Mất kết nối mạng rồi!
        </h1>
        <p className="text-text-muted text-sm leading-relaxed mb-10 max-w-[280px]">
          Vui lòng kiểm tra kết nối internet để tiếp tục theo dõi các trận đấu
          và thống kê cà phê.
        </p>

              <Button
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-float active:scale-95 transition-transform flex items-center justify-center gap-2"
                onClick={() => window.location.reload()}
              >
          <span className="material-symbols-outlined text-xl">refresh</span>
                Thử lại
              </Button>

        <p className="mt-6 text-xs text-text-muted font-medium flex items-center gap-1.5">
          <span className="size-1.5 bg-gray-300 rounded-full"></span>
          Chế độ ngoại tuyến
        </p>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 w-full max-w-[600px] mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-100 px-8 pb-6 pt-3 flex justify-between items-center z-40">
        <div className="flex flex-col items-center gap-1 opacity-40">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium">Trang chủ</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <span className="material-symbols-outlined text-text-muted">group</span>
          <span className="text-[10px] font-medium text-text-muted">
            Thành viên
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <span className="material-symbols-outlined text-text-muted">history</span>
          <span className="text-[10px] font-medium text-text-muted">
            Lịch sử
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <span className="material-symbols-outlined text-text-muted">settings</span>
          <span className="text-[10px] font-medium text-text-muted">
            Cài đặt
          </span>
        </div>
      </nav>
    </div>
  );
}
