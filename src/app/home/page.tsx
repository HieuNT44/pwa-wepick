"use client";

import { SafeLink } from "@/components/safe-link";
import { usePageView } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { getTopPlayers, getUserByEmail } from "@/lib/firebase/users";
import type { User } from "@/types/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomeDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [topPlayers, setTopPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  usePageView("Home Dashboard");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Try to load data, but don't fail if Firestore is not set up yet
        try {
          const [userData, topPlayersData] = await Promise.all([
            getUserByEmail(user.email).catch(() => null),
            getTopPlayers(3).catch(() => []),
          ]);

          if (userData) {
            setCurrentUser(userData);
          }
          if (topPlayersData && topPlayersData.length > 0) {
            setTopPlayers(topPlayersData);
          }
        } catch (firestoreError) {
          console.warn(
            "Firestore not available or not set up:",
            firestoreError
          );
          // Continue with empty data
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show content even if loading user data from Firestore
  // This prevents infinite loading if Firestore is not set up

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const userDisplayName =
    currentUser?.name ||
    currentUser?.nickname ||
    user.displayName ||
    "Người dùng";
  const cafeBalance = "+120.000đ"; // TODO: Lấy từ user data
  const weeklyMatches = "12 trận"; // TODO: Tính từ matchHistory

  // Mock data cho recent matches - sẽ thay bằng data thực sau
  const recentMatches = [
    {
      id: "1",
      date: "Hôm nay, 08:30",
      status: "completed",
      team1: {
        players: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDKmsweucrV0uMWKfi2cB4Tn1Ey9QXKodc-qHLIj1_SKJfI1Tf1C3jqFoLT72ID2jsOZ4plPavWM17tKpCWFXue2id1OyW_O8kfoSQxIfKNyB8hgLpwhhDH9q39MReivghsaQJpambf9xsc4worMrE5iNWyxYNQHsJJDwB0fUjX3AWAXff0T3XriG6e_3aFW-qBP0PMEkesDzI2shdhMExU9BIezuSvpIvBYer2sXFhmzmBqXlxQKXf_hyV76XeFsk0A99RlQ321w",
        ],
        name: "Hoàng & Thắng",
        score: 11,
      },
      team2: {
        players: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuClmF4CX3ENVbKcoK8j1snk80Xq9iGRRXzv016p70VLtzJEMYFEmyw10ZRQg3drNoGqhOCrCRHveEAts_3hCdRRBAZLuml7TLbqmKtP9jI63UNUtIyko8bg90PL9-MU83LUdcwR8iv1DofoWHjBhJa13wxpD7-DYY0N6brde6jWQFvhP1bjnaVk3umjC0IypdfFx-X1byohLMvdbA3b0IUuHa4HvthBoPutsMRpijY7wsEH55xaJAH1NARJpoMbW0ciCecmLsWhog",
        ],
        name: "Anh & Cường",
        score: 8,
      },
    },
    {
      id: "2",
      date: "Hôm qua, 17:00",
      status: "completed",
      team1: {
        players: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuClmF4CX3ENVbKcoK8j1snk80Xq9iGRRXzv016p70VLtzJEMYFEmyw10ZRQg3drNoGqhOCrCRHveEAts_3hCdRRBAZLuml7TLbqmKtP9jI63UNUtIyko8bg90PL9-MU83LUdcwR8iv1DofoWHjBhJa13wxpD7-DYY0N6brde6jWQFvhP1bjnaVk3umjC0IypdfFx-X1byohLMvdbA3b0IUuHa4HvthBoPutsMRpijY7wsEH55xaJAH1NARJpoMbW0ciCecmLsWhog",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA",
        ],
        name: "Anh & Hoàng",
        score: 9,
      },
      team2: {
        players: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDKmsweucrV0uMWKfi2cB4Tn1Ey9QXKodc-qHLIj1_SKJfI1Tf1C3jqFoLT72ID2jsOZ4plPavWM17tKpCWFXue2id1OyW_O8kfoSQxIfKNyB8hgLpwhhDH9q39MReivghsaQJpambf9xsc4worMrE5iNWyxYNQHsJJDwB0fUjX3AWAXff0T3XriG6e_3aFW-qBP0PMEkesDzI2shdhMExU9BIezuSvpIvBYer2sXFhmzmBqXlxQKXf_hyV76XeFsk0A99RlQ321w",
        ],
        name: "Thắng & Cường",
        score: 11,
      },
    },
  ];

  return (
    <div className="Home min-h-screen flex flex-col w-full border-x border-gray-100 relative bg-background text-text-main">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 sticky top-0 bg-background/80 backdrop-blur-lg z-30">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full border-2 border-primary p-0.5">
            <img
              alt="User"
              className="w-full h-full object-cover rounded-full"
              src={
                user.photoURL ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA"
              }
            />
          </div>
          <div>
            <p className="text-xs text-text-muted">{getGreeting()},</p>
            <h2 className="font-bold text-base">{userDisplayName} 👋</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 space-y-6 pb-24">
        {/* Summary Card */}
        <section>
          <div className="bg-primary rounded-[32px] p-6 text-white shadow-float relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]">
                sports_tennis
              </span>
            </div>
            <h3 className="text-sm font-medium opacity-80 mb-4">
              Tóm tắt của bạn
            </h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
                  Số dư Cafe
                </p>
                <p className="text-3xl font-bold">{cafeBalance}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
                  Trận tuần này
                </p>
                <p className="text-xl font-bold">{weeklyMatches}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="font-bold text-base mb-4">Lối tắt nhanh</h3>
          <div className="grid grid-cols-3 gap-3">
            <button className="bg-white p-4 rounded-3xl shadow-soft flex flex-col items-center gap-2 border border-gray-50 active:scale-95 transition-transform">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">
                  add_circle
                </span>
              </div>
              <span className="text-xs font-bold">Tạo trận</span>
            </button>
            <button className="bg-white p-4 rounded-3xl shadow-soft flex flex-col items-center gap-2 border border-gray-50 active:scale-95 transition-transform">
              <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-500 text-2xl">
                  payments
                </span>
              </div>
              <span className="text-xs font-bold">Thanh toán</span>
            </button>
            <button className="bg-white p-4 rounded-3xl shadow-soft flex flex-col items-center gap-2 border border-gray-50 active:scale-95 transition-transform">
              <div className="size-12 rounded-2xl bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 text-2xl">
                  qr_code_scanner
                </span>
              </div>
              <span className="text-xs font-bold">Check-in</span>
            </button>
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Bảng xếp hạng tuần</h3>
            <Link
              href="/leaderboard"
              className="text-primary text-xs font-bold"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="bg-white rounded-[32px] p-4 shadow-soft border border-gray-50 space-y-4">
            {topPlayers.length > 0 ? (
              topPlayers.map((player, index) => (
                <div
                  key={player.id || index}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {player.nickname?.charAt(0) ||
                          player.name?.charAt(0) ||
                          "?"}
                      </span>
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -left-1 bg-accent-gold size-5 rounded-full flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[12px] text-white filled-icon">
                          trophy
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">
                      {player.nickname || player.name}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {player.totalWins * 10} điểm • {player.totalWins} thắng
                    </p>
                  </div>
                  <div
                    className={
                      index === 0
                        ? "text-accent-gold"
                        : index === 1
                        ? "text-gray-400"
                        : "text-orange-400"
                    }
                  >
                    <span className="material-symbols-outlined filled-icon">
                      military_tech
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-text-muted text-sm">
                Chưa có dữ liệu xếp hạng
              </div>
            )}
          </div>
        </section>

        {/* Recent Matches */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Trận đấu gần đây</h3>
            <Link href="/matches" className="text-primary text-xs font-bold">
              Chi tiết
            </Link>
          </div>
          <div className="space-y-3">
            {recentMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white p-4 rounded-3xl shadow-soft border border-gray-50"
              >
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-text-muted bg-gray-100 px-2 py-1 rounded-md uppercase">
                    {match.date}
                  </span>
                  <span className="text-[10px] font-bold text-success flex items-center gap-1">
                    <span className="size-1.5 bg-success rounded-full"></span>{" "}
                    Đã kết thúc
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex -space-x-2">
                      {match.team1.players.map((avatar, idx) => (
                        <img
                          key={idx}
                          className="size-8 rounded-full border-2 border-white object-cover"
                          src={avatar}
                          alt={`Player ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {match.team1.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-xl font-black ${
                        match.team1.score > match.team2.score
                          ? "text-primary"
                          : "text-gray-400"
                      }`}
                    >
                      {match.team1.score} - {match.team2.score}
                    </span>
                    <span className="text-[8px] text-text-muted uppercase font-bold tracking-widest">
                      Final
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1 text-right">
                    <div className="flex -space-x-2 justify-end">
                      {match.team2.players.map((avatar, idx) =>
                        avatar ? (
                          <img
                            key={idx}
                            className="size-8 rounded-full border-2 border-white object-cover"
                            src={avatar}
                            alt={`Player ${idx + 1}`}
                          />
                        ) : (
                          <div
                            key={idx}
                            className="size-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white"
                          >
                            <span className="material-symbols-outlined text-[14px] text-gray-400">
                              person
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {match.team2.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 w-full max-w-[600px] mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-100 px-8 pb-6 pt-3 flex justify-between items-center z-40">
        <SafeLink href="/home" className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-primary filled-icon">
            home
          </span>
          <span className="text-[10px] font-bold text-primary">Trang chủ</span>
        </SafeLink>
        <SafeLink href="/members" className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-text-muted">
            group
          </span>
          <span className="text-[10px] font-medium text-text-muted">
            Thành viên
          </span>
        </SafeLink>
        <SafeLink href="/history" className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-text-muted">
            history
          </span>
          <span className="text-[10px] font-medium text-text-muted">
            Lịch sử
          </span>
        </SafeLink>
        <SafeLink href="/match" className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-text-muted">
            sports_tennis
          </span>
          <span className="text-[10px] font-medium text-text-muted">
            Thi đấu
          </span>
        </SafeLink>
      </nav>
    </div>
  );
}
