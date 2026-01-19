"use client";

import { BottomNavigation } from "@/components/bottom-navigation";
import { usePageView } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { getAllPlayers } from "@/lib/firebase/players";
import type { Player } from "@/types/player";
import { useEffect, useMemo, useState } from "react";

export default function RankingPage() {
  const { user, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageView("Ranking");

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const playersData = await getAllPlayers();
      setPlayers(playersData || []);
    } catch (error) {
      console.error("Error loading players:", error);
      setError("Không thể tải danh sách xếp hạng. Vui lòng kiểm tra kết nối.");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort players: totalWins desc, then totalLosses asc
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const winsA = a.totalWins || 0;
      const winsB = b.totalWins || 0;
      const lossesA = a.totalLosses || 0;
      const lossesB = b.totalLosses || 0;

      // First sort by wins (descending)
      if (winsA !== winsB) {
        return winsB - winsA;
      }

      // If wins are equal, sort by losses (ascending - fewer losses is better)
      return lossesA - lossesB;
    });
  }, [players]);

  const getPlayerAvatar = (player: Player): string | null => {
    const avatarMap: Record<string, string> = {
      "01": "https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA",
      "02": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKmsweucrV0uMWKfi2cB4Tn1Ey9QXKodc-qHLIj1_SKJfI1Tf1C3jqFoLT72ID2jsOZ4plPavWM17tKpCWFXue2id1OyW_O8kfoSQxIfKNyB8hgLpwhhDH9q39MReivghsaQJpambf9xsc4worMrE5iNWyxYNQHsJJDwB0fUjX3AWAXff0T3XriG6e_3aFW-qBP0PMEkesDzI2shdhMExU9BIezuSvpIvBYer2sXFhmzmBqXlxQKXf_hyV76XeFsk0A99RlQ321w",
      "03": "https://lh3.googleusercontent.com/aida-public/AB6AXuClmF4CX3ENVbKcoK8j1snk80Xq9iGRRXzv016p70VLtzJEMYFEmyw10ZRQg3drNoGqhOCrCRHveEAts_3hCdRRBAZLuml7TLbqmKtP9jI63UNUtIyko8bg90PL9-MU83LUdcwR8iv1DofoWHjBhJa13wxpD7-DYY0N6brde6jWQFvhP1bjnaVk3umjC0IypdfFx-X1byohLMvdbA3b0IUuHa4HvthBoPutsMRpijY7wsEH55xaJAH1NARJpoMbW0ciCecmLsWhog",
    };

    if (player.id && avatarMap[player.id]) {
      return avatarMap[player.id];
    }

    const nameMap: Record<string, string> = {
      Hieu: avatarMap["01"] || "",
      Thang: avatarMap["02"] || "",
      Anh: avatarMap["03"] || "",
    };

    return nameMap[player.name] || null;
  };

  const getPlayerInitial = (player: Player): string => {
    return (player.nickname || player.name || "?").charAt(0).toUpperCase();
  };

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Ranking w-full flex flex-col bg-background-light max-w-[600px] mx-auto border-x border-gray-100 relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-light/80 backdrop-blur-xl px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            🏆 Bảng Xếp Hạng
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 flex flex-col gap-4 pb-[120px]">
        {loading ? (
          <div className="text-center py-8 h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-text-secondary text-sm mt-2">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-red-300 mb-4">
              error
            </span>
            <p className="text-text-secondary text-base font-medium mb-2">
              {error}
            </p>
            <button
              onClick={loadPlayers}
              className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        ) : sortedPlayers.length > 0 ? (
          sortedPlayers.map((player, index) => {
            const rank = index + 1;
            const avatar = getPlayerAvatar(player);
            const hasAvatar = avatar !== null;
            const wins = player.totalWins || 0;
            const losses = player.totalLosses || 0;
            const totalMatches = wins + losses;
            const winRate =
              totalMatches > 0
                ? ((wins / totalMatches) * 100).toFixed(1)
                : "0.0";

            return (
              <div
                key={player.id}
                className={`ranking-card bg-white p-4 rounded-3xl shadow-sm flex items-center gap-4 border border-gray-50 transition-all ${
                  rank <= 3 ? "border-primary/20 bg-primary/5" : ""
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  <div
                    className={`text-2xl font-black ${
                      rank === 1
                        ? "text-yellow-500"
                        : rank === 2
                        ? "text-gray-400"
                        : rank === 3
                        ? "text-amber-600"
                        : "text-text-secondary"
                    }`}
                  >
                    {getRankIcon(rank)}
                  </div>
                </div>

                {/* Avatar */}
                <div
                  className={`size-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm ${
                    hasAvatar
                      ? "bg-gray-100"
                      : "bg-primary/10 flex items-center justify-center"
                  }`}
                >
                  {hasAvatar ? (
                    <img
                      alt={player.nickname || player.name}
                      className="w-full h-full object-cover"
                      src={avatar}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-primary">
                      person
                    </span>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-sm">
                    {player.nickname || player.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-green-600">
                        check_circle
                      </span>
                      {wins} thắng
                    </p>
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-red-600">
                        cancel
                      </span>
                      {losses} thua
                    </p>
                    {totalMatches > 0 && (
                      <p className="text-xs text-text-secondary">
                        {winRate}% thắng
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
              emoji_events
            </span>
            <p className="text-text-secondary text-base font-medium mb-2">
              Chưa có dữ liệu xếp hạng
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
