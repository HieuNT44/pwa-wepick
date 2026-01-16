"use client";

import { CafeCalculationModal } from "@/components/cafe-calculation-modal";
import { CreateMatchModal } from "@/components/create-match-modal";
import { Button } from "@/components/ui/button";
import { usePageView } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { CafeCalculationResult } from "@/lib/utils/cafe-calculation";
import { formatDateWithWeek } from "@/lib/utils/date";
import {
  getIsMatchActive,
  getTodayMatchHistory,
  setIsMatchActive,
  clearTodayMatchHistory,
} from "@/lib/utils/local-storage";
import { callMitralAI } from "@/lib/utils/mitral-ai";
import type { Match } from "@/types/match";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MatchPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMatchActive, setIsMatchActiveState] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCafeModal, setShowCafeModal] = useState(false);
  const [cafeResult, setCafeResult] = useState<CafeCalculationResult | null>(
    null
  );
  const [cafeLoading, setCafeLoading] = useState(false);
  const { toast } = useToast();
  const today = new Date();
  const todayFormatted = formatDateWithWeek(today);

  // Check match active state on mount
  useEffect(() => {
    const active = getIsMatchActive();
    setIsMatchActiveState(active);
  }, []);

  usePageView("Match");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load matches from localStorage
  const loadMatches = () => {
    try {
      setLoading(true);

      // Load from localStorage only
      const localHistory = getTodayMatchHistory();

      // Convert localStorage history to Match format
      const localMatches: Match[] = localHistory.map((item) => {
        // Parse score "11-8" to team scores
        const [score1, score2] = item.score.split("-").map(Number);

        return {
          id: item.id,
          date: item.date,
          time: item.startTime,
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
          createdAt: item.completedAt,
        };
      });

      // Sort by time (newest first)
      localMatches.sort((a, b) => {
        const timeA = a.time || "";
        const timeB = b.time || "";
        return timeB.localeCompare(timeA);
      });

      setMatches(localMatches);
    } catch (error) {
      console.error("Error loading matches:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMatches();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Listen for storage changes to reload matches when new match is added
  useEffect(() => {
    if (typeof window === "undefined" || !user) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wepick_today_match_history") {
        loadMatches();
      }
    };

    // Also check periodically for same-tab changes (storage event only fires for other tabs)
    const interval = setInterval(() => {
      loadMatches();
    }, 1000); // Check every second

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  // Handle AI calculation
  const handleAICalculation = async () => {
    try {
      // Get today's matches
      const todayMatches = getTodayMatchHistory();

      if (todayMatches.length === 0) {
        toast({
          title: "Không có dữ liệu",
          description: "Chưa có trận đấu nào hôm nay để tính toán",
          variant: "destructive",
        });
        return;
      }

      // Show modal and start loading
      setShowCafeModal(true);
      setCafeLoading(true);
      setCafeResult(null);

      // Call AI
      const result = await callMitralAI(todayMatches);
      setCafeResult(result);
    } catch (error) {
      console.error("Error calculating cafe:", error);
      toast({
        title: "Lỗi tính toán",
        description:
          error instanceof Error
            ? error.message
            : "Không thể tính toán. Vui lòng thử lại.",
        variant: "destructive",
      });
      setShowCafeModal(false);
    } finally {
      setCafeLoading(false);
    }
  };

  const handleRecalculate = () => {
    handleAICalculation();
  };

  const handleClearAllMatches = () => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa toàn bộ dữ liệu các trận đấu hôm nay? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      clearTodayMatchHistory();
      loadMatches();
      toast({
        title: "Đã xóa",
        description: "Đã xóa toàn bộ dữ liệu các trận đấu hôm nay",
      });
    } catch (error) {
      console.error("Error clearing matches:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
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

  if (!user) {
    return null;
  }

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

  return (
    <div className="Match overflow-hidden min-h-screen w-full flex flex-col bg-background-light">
      {/* Header */}
      <header className="h-[96px] w-full max-w-[600px] mx-auto fixed top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-text-main text-2xl font-extrabold tracking-tight">
              Trận Đấu Hôm Nay
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAllMatches}
                className="size-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Xóa toàn bộ dữ liệu"
              >
                <span className="material-symbols-outlined text-lg">
                  delete_outline
                </span>
              </button>
              <button className="size-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600">
                <span className="material-symbols-outlined">calendar_today</span>
              </button>
            </div>
          </div>
          <p className="text-primary font-semibold text-sm">{todayFormatted}</p>
        </div>
      </header>
      <div className="h-[96px]" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-5 px-4 mt-[96px] mb-[100px]">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-text-secondary text-sm">Đang tải...</p>
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
                <span className="material-symbols-outlined text-primary">
                  {getStatusIcon(match.status)}
                </span>
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
          <div className="text-center py-8">
            <p className="text-text-secondary text-sm">
              Chưa có trận đấu nào hôm nay
            </p>
          </div>
        )}
      </div>
      <div className="h-[100px]" />

      {/* Footer */}
      <footer className="fixed w-full  max-w-[600px] bottom-0 h-[100px] left-0 right-0 mx-auto p-3 bg-white/90 backdrop-blur-xl border-t border-gray-100">
        <div className="flex gap-2 w-full">
          <Button
            className="flex-1 bg-white border-2 border-primary text-primary py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-sm h-auto"
            onClick={() => {
              setShowCreateModal(true);
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
            <span className="text-[10px]">AI Tính toán</span>
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

      {/* Cafe Calculation Modal */}
      <CafeCalculationModal
        open={showCafeModal}
        onClose={() => {
          setShowCafeModal(false);
          setCafeResult(null);
        }}
        result={cafeResult}
        loading={cafeLoading}
        onRecalculate={handleRecalculate}
      />
    </div>
  );
}
