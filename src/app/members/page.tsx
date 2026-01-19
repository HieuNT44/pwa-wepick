"use client";

import { BottomNavigation } from "@/components/bottom-navigation";
import { LoginRequiredModal } from "@/components/login-required-modal";
import { Input } from "@/components/ui/input";
import { usePageView } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { getAllPlayers } from "@/lib/firebase/players";
import { getUserByEmail } from "@/lib/firebase/users";
import type { Player } from "@/types/player";
import type { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MembersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  usePageView("Members");

  // Helper function to check auth and show modal if needed
  const requireAuth = (): boolean => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

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

  useEffect(() => {
    console.log("🔍 MembersPage mounted, loading players...");
    loadPlayers();
  }, []);

  // Filter players based on search query
  const filteredPlayers = players.filter((player) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = (player.nickname || player.name || "").toLowerCase();
    return name.includes(query);
  });

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Loading players from Firestore...");
      // Only load from Firestore
      const playersData = await getAllPlayers();
      console.log("✅ Players loaded:", playersData.length, "players");
      setPlayers(playersData || []);
    } catch (error) {
      console.error("❌ Error loading players from Firestore:", error);
      setError(
        "Không thể tải danh sách thành viên từ Firestore. Vui lòng kiểm tra kết nối."
      );
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerAvatar = (player: Player): string | null => {
    // Map player IDs to avatar URLs (from users-example.json IDs)
    const avatarMap: Record<string, string> = {
      "01": "https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA",
      "02": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKmsweucrV0uMWKfi2cB4Tn1Ey9QXKodc-qHLIj1_SKJfI1Tf1C3jqFoLT72ID2jsOZ4plPavWM17tKpCWFXue2id1OyW_O8kfoSQxIfKNyB8hgLpwhhDH9q39MReivghsaQJpambf9xsc4worMrE5iNWyxYNQHsJJDwB0fUjX3AWAXff0T3XriG6e_3aFW-qBP0PMEkesDzI2shdhMExU9BIezuSvpIvBYer2sXFhmzmBqXlxQKXf_hyV76XeFsk0A99RlQ321w",
      "03": "https://lh3.googleusercontent.com/aida-public/AB6AXuClmF4CX3ENVbKcoK8j1snk80Xq9iGRRXzv016p70VLtzJEMYFEmyw10ZRQg3drNoGqhOCrCRHveEAts_3hCdRRBAZLuml7TLbqmKtP9jI63UNUtIyko8bg90PL9-MU83LUdcwR8iv1DofoWHjBhJa13wxpD7-DYY0N6brde6jWQFvhP1bjnaVk3umjC0IypdfFx-X1byohLMvdbA3b0IUuHa4HvthBoPutsMRpijY7wsEH55xaJAH1NARJpoMbW0ciCecmLsWhog",
    };

    // Try to find by ID first, then by name
    if (player.id && avatarMap[player.id]) {
      return avatarMap[player.id];
    }

    // Map by name as fallback
    const nameMap: Record<string, string> = {
      Hieu: avatarMap["01"] || "",
      Thang: avatarMap["02"] || "",
      Anh: avatarMap["03"] || "",
    };

    return nameMap[player.name] || null;
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Members w-full flex flex-col bg-background-light max-w-[600px] mx-auto border-x border-gray-100 relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-light/80 backdrop-blur-xl px-4 py-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-text-main mb-1">
              Thành Viên
            </h1>
            <p className="text-sm text-text-muted">
              Câu lạc bộ wepick ({players.length} thành viên)
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (requireAuth()) {
                // TODO: Implement add member functionality
                console.log("Add member clicked");
              }
            }}
            className="size-10 rounded-full bg-white shadow-soft flex items-center justify-center border border-gray-100 active:scale-95 transition-transform hover:bg-gray-50 cursor-pointer z-10 relative"
          >
            <span className="material-symbols-outlined text-primary">
              person_add
            </span>
          </button>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
            search
          </span>
          <Input
            type="text"
            placeholder="Tìm kiếm thành viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border-gray-200 rounded-xl text-sm"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 space-y-6 pt-4 pb-[120px]">
        {loading ? (
          <div className="text-center py-8 h-screen">
            <div className="animate-spin rounded-full  h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-text-muted text-sm mt-2">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-red-300 mb-4">
              error
            </span>
            <p className="text-text-muted text-base font-medium mb-2">
              {error}
            </p>
            <button
              onClick={loadPlayers}
              className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        ) : filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => {
            const avatar = getPlayerAvatar(player);
            const hasAvatar = avatar !== null;

            return (
              <div
                key={player.id}
                className="member-card bg-white p-4 rounded-3xl shadow-soft flex items-center gap-4 border border-gray-50 transition-all active:scale-[0.98]"
              >
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
                <div className="flex-1">
                  <h3 className="font-bold text-sm">
                    {player.nickname || player.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-green-600">
                        check_circle
                      </span>
                      {player.totalWins || 0} thắng
                    </p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-red-600">
                        cancel
                      </span>
                      {player.totalLosses || 0} thua
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 h-screen">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
              group
            </span>
            <p className="text-text-muted text-base font-medium mb-2">
              Chưa có thành viên
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Login Required Modal */}
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}



