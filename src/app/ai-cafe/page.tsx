"use client";

import { SafeLink } from "@/components/safe-link";
import { Button } from "@/components/ui/button";
import usersData from "@/data/users-example.json";
import { usePageView } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { saveCafeCalculationToFirebase } from "@/lib/firebase/cafe-calculations";
import { getAllMatchesHistory } from "@/lib/firebase/matches";
import type { CafeCalculationResult } from "@/lib/utils/cafe-calculation";
import { callMitralAI } from "@/lib/utils/mitral-ai";
import type { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AICafePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [cafeResult, setCafeResult] = useState<CafeCalculationResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  usePageView("AI Cafe Calculation");

  useEffect(() => {
    const users = Array.isArray(usersData) ? usersData : [];
    setUsers(users as User[]);
  }, []);

  // Load and calculate on mount - only run once when user is available
  useEffect(() => {
    // Prevent multiple calls
    if (hasCalculated || loading || !user) {
      return;
    }

    let isMounted = true;

    const calculateCafe = async () => {
      setHasCalculated(true);

      try {
        setLoading(true);
        setCafeResult(null);

        // Get all matches from Firestore
        const allMatches = await getAllMatchesHistory();

        if (allMatches.length === 0) {
          if (isMounted) {
            toast({
              title: "Không có dữ liệu",
              description: "Chưa có trận đấu nào để tính toán",
              variant: "destructive",
            });
          }
          return;
        }

        // Call AI via server-side API route (keeps API key secure)
        // API key is never exposed to client - it's only used server-side
        const result = await callMitralAI(allMatches);
        
        if (isMounted) {
          setCafeResult(result);
        }
      } catch (error) {
        console.error("Error calculating cafe:", error);
        if (isMounted) {
          setHasCalculated(false); // Allow retry on error
          toast({
            title: "Lỗi tính toán",
            description:
              error instanceof Error
                ? error.message
                : "Không thể tính toán. Vui lòng thử lại.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    calculateCafe();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]); // Only depend on user.uid, not the whole user object or toast

  const handleRecalculate = async () => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để sử dụng tính năng này",
        variant: "destructive",
      });
      return;
    }

    if (loading) {
      return; // Prevent multiple simultaneous calls
    }

    try {
      setLoading(true);
      setCafeResult(null);
      setHasCalculated(false); // Reset flag to allow recalculation

      // Get all matches from Firestore
      const allMatches = await getAllMatchesHistory();

      if (allMatches.length === 0) {
        toast({
          title: "Không có dữ liệu",
          description: "Chưa có trận đấu nào để tính toán",
          variant: "destructive",
        });
        return;
      }

      // Call AI via server-side API route (keeps API key secure)
      const result = await callMitralAI(allMatches);
      setCafeResult(result);
      setHasCalculated(true);
    } catch (error) {
      console.error("Error calculating cafe:", error);
      setHasCalculated(false); // Allow retry on error
      toast({
        title: "Lỗi tính toán",
        description:
          error instanceof Error
            ? error.message
            : "Không thể tính toán. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!cafeResult || !user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để lưu kết quả",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Save to Firebase
      await saveCafeCalculationToFirebase(cafeResult);

      toast({
        title: "Lưu thành công",
        description: "Kết quả tính toán đã được lưu vào Firebase",
      });

      // Navigate back to home page after successful save
      router.push("/home");
    } catch (error) {
      console.error("Error saving cafe calculation:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu kết quả. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlayerNickname = (name: string) => {
    return users.find((u) => u.name === name)?.nickname || name;
  };

  // Calculate total cafe cups to be exchanged
  const totalCafeCups = cafeResult
    ? cafeResult.cafeResults.reduce((sum, item) => sum + item.amount, 0)
    : 0;

  return (
    <div className="AICafe flex flex-col w-full border-x border-gray-100 relative bg-background   text-text-main">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 sticky top-0 bg-background-light/80 backdrop-blur-lg z-30 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <SafeLink
            href="/match"
            className="size-10 rounded-full bg-white shadow-soft flex items-center justify-center border border-gray-100 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-text-muted">
              arrow_back
            </span>
          </SafeLink>
          <div>
            <p className="text-xs text-text-muted">AI Tính toán Cafe</p>
            <h2 className="font-bold text-base text-text-main">
              🤖 Phân Chia Cà Phê
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 space-y-6 pb-32 bg-background  pt-6 overflow-y-auto h-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-text-secondary">Đang tính toán...</p>
          </div>
        ) : cafeResult ? (
          <>
            {/* Total Cafe Summary Card */}
            <div className="p-4 -mx-5 px-5">
              <div className="flex flex-col gap-2 rounded-2xl p-6 bg-background border border-primary/20">
                <p className="text-[#121717] dark:text-white/80 text-sm font-medium uppercase tracking-wider">
                  Tổng kết phiên hôm nay
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-[#121717] dark:text-white tracking-light text-4xl font-bold leading-tight">
                    {totalCafeCups} ☕
                  </p>
                  <div className="bg-primary text-white p-2 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">
                      analytics
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Header */}
            <div className="px-0 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-[#121717] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Chi tiết phân chia
              </h3>
              <span className="text-xs font-medium text-primary bg-background  px-2 py-1 rounded-full uppercase">
                AI Optimized
              </span>
            </div>

            {/* Transaction List */}
            <div className="flex flex-col gap-3">
              {cafeResult.cafeResults.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[#668385] dark:text-gray-400">
                    Không có kết quả cafe nào
                  </p>
                </div>
              ) : (
                cafeResult.cafeResults.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex flex-col flex-1">
                          <p className="text-[#121717] dark:text-white text-sm font-bold leading-tight line-clamp-1">
                            {getPlayerNickname(item.playerLose)}
                          </p>
                          <p className="text-[#668385] dark:text-gray-400 text-[10px] font-medium leading-normal">
                            Người trả
                          </p>
                        </div>
                        <div className="flex items-center justify-center text-primary">
                          <span
                            className="material-symbols-outlined text-2xl"
                            style={{ color: "#36cbd3" }}
                          >
                            trending_flat
                          </span>
                        </div>
                        <div className="flex flex-col flex-1 items-end">
                          <p className="text-[#121717] dark:text-white text-sm font-bold leading-tight line-clamp-1">
                            {getPlayerNickname(item.playerWin)}
                          </p>
                          <p className="text-[#668385] dark:text-gray-400 text-[10px] font-medium leading-normal text-right">
                            Người nhận
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 bg-background-light dark:bg-gray-700 px-3 py-2 rounded-xl">
                        <p className="text-[#121717] dark:text-white text-sm font-bold leading-tight">
                          {item.amount} ☕
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-text-secondary">Không có kết quả</p>
          </div>
        )}
      </main>

      {/* Action Buttons Footer */}
      <footer className="fixed bottom-0 left-0 right-0 w-full max-w-[600px] mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-100 px-5 py-4 z-40">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1 bg-white border-2 border-primary text-primary hover:bg-white hover:text-primary py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-sm h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={handleRecalculate}
            disabled={loading}
          >
            <span className="material-symbols-outlined text-lg">
              refresh
            </span>
            <span className="text-[10px]">Tính lại</span>
          </Button>
          <Button
            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-primary/30 active:scale-95 transition-all h-auto"
            onClick={handleSave}
            disabled={!cafeResult || loading}
          >
            <span className="material-symbols-outlined text-lg">
              check_circle
            </span>
            <span className="text-[10px]">Xác nhận & Lưu</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}

