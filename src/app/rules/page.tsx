"use client";

import { BottomNavigation } from "@/components/bottom-navigation";
import { SafeLink } from "@/components/safe-link";
import { usePageView } from "@/hooks/use-analytics";
import {
  getAllMatchesHistory,
  getMatchesByCreatedDate
} from "@/lib/firebase/matches";
import { formatDateWithWeek } from "@/lib/utils/date";
import type { MatchHistoryItem } from "@/lib/utils/local-storage";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  usePageView("History");

  // Load available dates and set default to latest date
  useEffect(() => {
    const loadAvailableDates = async () => {
      try {
        const allMatches = await getAllMatchesHistory();
        
        // Extract unique dates from createdAt
        const dates = new Set<string>();
        allMatches.forEach((match) => {
          if (match.createdAt) {
            const date = new Date(match.createdAt);
            dates.add(date.toISOString().split("T")[0]);
          }
        });
        
        const sortedDates = Array.from(dates).sort((a, b) => 
          new Date(b).getTime() - new Date(a).getTime()
        );
        
        setAvailableDates(sortedDates);
        
        // Set default to latest date
        if (sortedDates.length > 0) {
          setSelectedDate(sortedDates[0]);
        }
      } catch (error) {
        console.error("Error loading available dates:", error);
      }
    };

    loadAvailableDates();
  }, []);

  // Load matches when selectedDate changes
  useEffect(() => {
    const loadMatches = async () => {
      if (!selectedDate) return;

      try {
        setLoading(true);
        console.log(`📅 Loading matches for date: ${selectedDate}`);
        const matchesData = await getMatchesByCreatedDate(selectedDate);
        console.log(`✅ Loaded ${matchesData.length} matches for ${selectedDate}`);
        setMatches(matchesData);
      } catch (error) {
        console.error("Error loading matches:", error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [selectedDate]);

  // Calculate match statistics
  const singlesMatches = matches.filter((m) => m.matchType === "Đơn").length;
  const doublesMatches = matches.filter((m) => m.matchType === "Đôi").length;

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatDateWithWeek(date);
  };

  const formatDateForInput = (dateStr: string) => {
    return dateStr; // Already in YYYY-MM-DD format
  };

  return (
    <div className="History flex flex-col w-full h-full border-x border-gray-100 relative bg-background-light text-text-main overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-40">
        {/* Header */}
        <header className="px-5 pt-6 pb-4 sticky top-0 bg-background-light/80 backdrop-blur-lg z-30 shadow-sm border-b border-gray-100">
          <div className="flex items-center gap-3">
            <SafeLink
              href="/home"
              className="size-10 rounded-full bg-white shadow-soft flex items-center justify-center border border-gray-100 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-text-muted">
                arrow_back
              </span>
            </SafeLink>
            <div>
              <p className="text-xs text-text-muted">Lịch sử thi đấu</p>
              <h2 className="font-bold text-base text-text-main">
                {selectedDate ? formatDateForDisplay(selectedDate) : "Chọn ngày"}
              </h2>
            </div>
          </div>
        </header>

        {/* Date Filter */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-text-muted text-lg">
              calendar_today
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="flex-1 px-4 py-2 rounded-xl bg-white border border-gray-100 text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Quick date selector */}
          {availableDates.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {availableDates.slice(0, 7).map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "bg-white text-text-muted border border-gray-100"
                  }`}
                >
                  {formatDateForDisplay(date)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="px-5 space-y-6 pt-4">
          {/* Match Statistics */}
          {!loading && matches.length > 0 && (
            <div className="text-sm text-text-muted">
              Tổng số trận đấu:{" "}
              <span className="font-bold text-text-main">
                Đơn {singlesMatches}
              </span>{" "}
              |{" "}
              <span className="font-bold text-primary">Đôi {doublesMatches}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-text-muted text-sm mt-2">Đang tải...</p>
            </div>
          ) : matches.length > 0 ? (
            matches.map((match) => {
              const [score1, score2] = match.score.split("-").map(Number);
              return (
                <div
                  key={match.id}
                  className="rounded-3xl p-5 border shadow-sm bg-white border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Đã kết thúc
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Team 1 */}
                    <div className="flex flex-col items-center flex-1 gap-2">
                      <div className="flex -space-x-2">
                        {match.team1[0] ? (
                          <>
                            <div className="size-12 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {match.team1[0].charAt(0)}
                              </span>
                            </div>
                            {match.team1[1] && (
                              <div className="size-12 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-bold text-sm">
                                  {match.team1[1].charAt(0)}
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
                          {match.team1.join(" & ") || "Chưa rõ"}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-3xl font-black ${
                            score1 > score2 ? "text-text-main" : "text-gray-300"
                          }`}
                        >
                          {score1}
                        </span>
                        <span className="text-gray-300 font-light text-xl">:</span>
                        <span
                          className={`text-3xl font-black ${
                            score2 > score1 ? "text-primary" : "text-gray-300"
                          }`}
                        >
                          {score2}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1 font-medium">
                        {match.matchType}
                      </p>
                    </div>

                    {/* Team 2 */}
                    <div className="flex flex-col items-center flex-1 gap-2">
                      <div className="flex -space-x-2">
                        {match.team2[0] ? (
                          <>
                            <div className="size-12 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {match.team2[0].charAt(0)}
                              </span>
                            </div>
                            {match.team2[1] && (
                              <div className="size-12 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-bold text-sm">
                                  {match.team2[1].charAt(0)}
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
                            score2 > score1 ? "text-primary" : "text-text-main"
                          }`}
                        >
                          {match.team2.join(" & ") || "Chưa rõ"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm">
                Không có trận đấu nào trong ngày này
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
