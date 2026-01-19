"use client";

import { CreateMatchModal } from "@/components/create-match-modal";
import { LoginRequiredModal } from "@/components/login-required-modal";
import { SafeLink } from "@/components/safe-link";
import { Button } from "@/components/ui/button";
import { usePageView } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { deleteMatchById, getAllMatchesHistory } from "@/lib/firebase/matches";
import { updateMultiplePlayerStats } from "@/lib/firebase/players";
import { formatDateWithWeek } from "@/lib/utils/date";
import { getIsMatchActive, setIsMatchActive } from "@/lib/utils/local-storage";
import type { Match } from "@/types/match";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMatchActive, setIsMatchActiveState] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [displayDate, setDisplayDate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Check match active state on mount
  useEffect(() => {
    const active = getIsMatchActive();
    setIsMatchActiveState(active);
  }, []);

  usePageView("Match");

  // Helper function to check auth and show modal if needed
  const requireAuth = (): boolean => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // Load matches from Firestore
  const loadMatches = async () => {
    try {
      setLoading(true);

      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      // Load all matches from Firestore
      const allHistory = await getAllMatchesHistory();

      // Filter matches where createdAt is today
      const todayHistory = allHistory.filter((item) => {
        const createdAt = item.createdAt || item.completedAt;
        if (!createdAt) return false;
        
        // Extract date part (YYYY-MM-DD) from createdAt ISO string
        const matchDateStr = new Date(createdAt).toISOString().split("T")[0];
        return matchDateStr === todayStr;
      });

      // Convert history to Match format
      const matches: Match[] = todayHistory.map((item) => {
        // Parse score "11-8" to team scores
        const [score1, score2] = item.score.split("-").map(Number);

        // Extract date and time from createdAt
        const createdAtDate = item.createdAt 
          ? new Date(item.createdAt) 
          : (item.completedAt ? new Date(item.completedAt) : new Date());
        
        // Format date as YYYY-MM-DD
        const dateStr = createdAtDate.toISOString().split("T")[0];
        
        // Format time as HH:mm
        const hours = createdAtDate.getHours().toString().padStart(2, "0");
        const minutes = createdAtDate.getMinutes().toString().padStart(2, "0");
        const timeStr = `${hours}:${minutes}`;

        return {
          id: item.id,
          date: dateStr, // Use date from createdAt
          time: timeStr, // Use time from createdAt
          court: "Sân số 1", // Default court
          status: "completed" as const,
          team1: {
            player1Id: item.team1[0] || "",
            player2Id: item.team1[1],
            score: score1 || 0,
            name: item.team1.join(" & "),
          },
          team2: {
            player1Id: item.team2[0] || "",
            player2Id: item.team2[1],
            score: score2 || 0,
            name: item.team2.join(" & "),
          },
          createdAt: item.createdAt || item.completedAt,
        };
      });

      setMatches(matches);

      // Set display date to today
      setDisplayDate(today);
    } catch (error) {
      console.error("Error loading matches:", error);
      setMatches([]);
      setDisplayDate(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  // Handle AI calculation - navigate to AI cafe page
  const handleAICalculation = () => {
    if (!requireAuth()) return;

    // Check if there are any matches
    if (matches.length === 0) {
      toast({
        title: "Không có dữ liệu",
        description: "Chưa có trận đấu nào để tính toán",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to AI cafe calculation page
    router.push("/ai-cafe");
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!requireAuth()) return;

    if (
      !confirm(
        "Bạn có chắc muốn xóa trận đấu này? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      // Delete match and get match data for stats rollback
      const matchData = await deleteMatchById(matchId);

      // Rollback player stats (decrease wins/losses)
      if (matchData) {
        try {
          const statUpdates = [
            ...(matchData.player_win || []).map((name) => ({
              playerName: name,
              incrementWins: -1,
              incrementLosses: 0,
            })),
            ...(matchData.player_lose || []).map((name) => ({
              playerName: name,
              incrementWins: 0,
              incrementLosses: -1,
            })),
          ];

          await updateMultiplePlayerStats(statUpdates);
        } catch (error) {
          console.error("Error rolling back player stats:", error);
          // Don't throw - match is already deleted
        }
      }

      await loadMatches();
      toast({
        title: "Đã xóa",
        description: "Đã xóa trận đấu",
      });
    } catch (error) {
      console.error("Error deleting match:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa trận đấu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };


  const getStatusBadge = (status: Match["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Đã kết thúc
          </span>
        );
      case "live":
        return (
          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Trực tiếp
          </span>
        );
      case "upcoming":
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Sắp tới
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: Match["status"]) => {
    switch (status) {
      case "completed":
        return "sports_tennis";
      case "live":
        return "groups";
      case "upcoming":
        return "schedule";
      default:
        return "sports_tennis";
    }
  };

  const displayMatches = matches;

  // Calculate match statistics
  const singlesMatches = matches.filter(
    (m) => !m.team1.player2Id && !m.team2.player2Id
  ).length;
  const doublesMatches = matches.filter(
    (m) => m.team1.player2Id && m.team2.player2Id
  ).length;

  return (
    <div className="Match flex flex-col w-full border-x border-gray-100 relative bg-background text-text-main">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 sticky top-0 bg-background/80 backdrop-blur-lg z-30 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <SafeLink
            href="/home"
            className="size-10 rounded-full bg-white shadow-soft flex items-center justify-center border border-gray-100 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-text-muted">
              arrow_back
            </span>
          </SafeLink>
          {/* <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg border-2 border-primary/20">
            <span className="material-symbols-outlined text-white text-2xl font-bold filled-icon">
              sports_tennis
            </span>
          </div> */}
          <div>
            <h2 className="font-bold text-base text-text-main">
              {formatDateWithWeek(displayDate)}
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 space-y-6 pb-32 bg-background-light pt-6">
        {/* Match Statistics */}
        {!loading && matches.length > 0 && (
          <div className="text-sm text-text-muted">
            Tổng số trận đấu: <span className="font-bold text-text-main">Đơn {singlesMatches}</span> | <span className="font-bold text-primary">Đôi {doublesMatches}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-text-muted text-sm">Đang tải...</p>
          </div>
        ) : displayMatches.length > 0 ? (
          displayMatches.map((match) => (
            <div
              key={match.id}
              className={`rounded-3xl p-5 border shadow-sm relative overflow-hidden ${
                match.status === "live"
                  ? "bg-white border-2 border-primary/30 shadow-md"
                  : match.status === "upcoming"
                  ? "match-card-gradient border border-gray-100 opacity-80"
                  : "match-card-gradient border border-gray-100"
              }`}
            >
              {/* Live indicator */}
              {match.status === "live" && (
                <div className="absolute top-0 right-0 p-3">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                {getStatusBadge(match.status)}
                <button
                  onClick={() => handleDeleteMatch(match.id || "")}
                  className="size-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Xóa trận đấu"
                >
                  <span className="material-symbols-outlined text-sm">
                    delete_outline
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Team 1 */}
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="flex -space-x-2">
                    {match.team1.player1Id ? (
                      <>
                        <div className="size-12 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">
                            {match.team1.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        {match.team1.player2Id && (
                          <div className="size-12 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">
                              {match.team1.name
                                ?.split("&")[1]
                                ?.trim()
                                .charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="size-12 rounded-full border-2 border-white bg-gray-50 shadow-sm flex items-center justify-center text-gray-300">
                        <span className="material-symbols-outlined text-xl">
                          help_outline
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-text-main truncate w-24">
                      {match.team1.name || "Chưa rõ"}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-3xl font-black ${
                        match.status === "completed" &&
                        match.team1.score > match.team2.score
                          ? "text-text-main"
                          : match.status === "live"
                          ? "text-text-main"
                          : "text-gray-300"
                      }`}
                    >
                      {match.team1.score}
                    </span>
                    <span className="text-gray-300 font-light text-xl">
                      {match.status === "live" ? "-" : ":"}
                    </span>
                    <span
                      className={`text-3xl font-black ${
                        match.status === "completed" &&
                        match.team2.score > match.team1.score
                          ? "text-primary"
                          : match.status === "live"
                          ? "text-text-main"
                          : "text-gray-300"
                      }`}
                    >
                      {match.team2.score}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary mt-1 font-medium">
                    {match.court} •{" "}
                    {match.status === "live"
                      ? "Đang đấu"
                      : match.status === "upcoming"
                      ? match.time
                      : `${match.time}`}
                  </p>
                </div>

                {/* Team 2 */}
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="flex -space-x-2">
                    {match.team2.player1Id ? (
                      <>
                        <div className="size-12 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">
                            {match.team2.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        {match.team2.player2Id && (
                          <div className="size-12 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">
                              {match.team2.name
                                ?.split("&")[1]
                                ?.trim()
                                .charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="size-12 rounded-full border-2 border-white bg-gray-50 shadow-sm flex items-center justify-center text-gray-300">
                        <span className="material-symbols-outlined text-xl">
                          help_outline
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-[11px] font-bold truncate w-24 ${
                        match.status === "completed" &&
                        match.team2.score > match.team1.score
                          ? "text-primary"
                          : "text-text-main"
                      }`}
                    >
                      {match.team2.name || "Chưa rõ"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center h-screen py-8">
            <p className="text-text-muted text-sm">
              Chưa có trận đấu nào hôm nay
            </p>
          </div>
        )}
      </main>

      {/* Action Buttons Footer */}
      <footer className="fixed bottom-0 left-0 right-0 w-full max-w-[600px] mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-100 px-5 py-4 z-40">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1 bg-white border-2 border-primary text-primary hover:bg-white hover:text-primary py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-sm h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={() => {
              if (requireAuth()) {
                setShowCreateModal(true);
              }
            }}
          >
            <span className="material-symbols-outlined text-lg">
              add_circle
            </span>
            <span className="text-[10px]">Tạo trận mới</span>
          </Button>
          <Button
            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-primary/30 active:scale-95 transition-all h-auto"
            onClick={handleAICalculation}
          >
            <span className="material-symbols-outlined text-lg">
              auto_awesome
            </span>
            <span className="text-[10px]">AI Tính toán Cafe</span>
          </Button>
        </div>
      </footer>

      {/* Create Match Modal */}
      <CreateMatchModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setIsMatchActive(false);
          setIsMatchActiveState(false);
          // Reload matches after closing modal (in case a match was created)
          loadMatches();
        }}
      />

      {/* Login Required Modal */}
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
