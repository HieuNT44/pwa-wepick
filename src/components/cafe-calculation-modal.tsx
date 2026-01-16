"use client";

import usersData from "@/data/users-example.json";
import { useToast } from "@/hooks/use-toast";
import type { CafeCalculationResult } from "@/lib/utils/cafe-calculation";
import { formatDateWithWeek } from "@/lib/utils/date";
import { saveCafeCalculation } from "@/lib/utils/local-storage";
import type { User } from "@/types/user";
import { useEffect, useState } from "react";

interface CafeCalculationModalProps {
  open: boolean;
  onClose: () => void;
  result: CafeCalculationResult | null;
  loading: boolean;
  onRecalculate: () => void;
}

export function CafeCalculationModal({
  open,
  onClose,
  result,
  loading,
  onRecalculate,
}: CafeCalculationModalProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (open) {
      const users = Array.isArray(usersData) ? usersData : [];
      setUsers(users as User[]);
    }
  }, [open]);

  const handleSave = () => {
    if (!result) return;

    try {
      // Save to localStorage
      saveCafeCalculation(result);

      toast({
        title: "Lưu thành công",
        description: "Kết quả tính toán đã được lưu vào localStorage",
      });

      // Close modal and stay on current page
      onClose();
    } catch (error) {
      console.error("Error saving cafe calculation:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu kết quả. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const getPlayerNickname = (name: string) => {
    return users.find((u) => u.name === name)?.nickname || name;
  };

  const getPlayerAvatar = (name: string) => {
    const user = users.find((u) => u.name === name);
    if (user?.id === "01")
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA";
    if (user?.id === "02")
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuDKmsweucrV0uMWKfi2cB4Tn1Ey9QXKodc-qHLIj1_SKJfI1Tf1C3jqFoLT72ID2jsOZ4plPavWM17tKpCWFXue2id1OyW_O8kfoSQxIfKNyB8hgLpwhhDH9q39MReivghsaQJpambf9xsc4worMrE5iNWyxYNQHsJJDwB0fUjX3AWAXff0T3XriG6e_3aFW-qBP0PMEkesDzI2shdhMExU9BIezuSvpIvBYer2sXFhmzmBqXlxQKXf_hyV76XeFsk0A99RlQ321w";
    if (user?.id === "03")
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuClmF4CX3ENVbKcoK8j1snk80Xq9iGRRXzv016p70VLtzJEMYFEmyw10ZRQg3drNoGqhOCrCRHveEAts_3hCdRRBAZLuml7TLbqmKtP9jI63UNUtIyko8bg90PL9-MU83LUdcwR8iv1DofoWHjBhJa13wxpD7-DYY0N6brde6jWQFvhP1bjnaVk3umjC0IypdfFx-X1byohLMvdbA3b0IUuHa4HvthBoPutsMRpijY7wsEH55xaJAH1NARJpoMbW0ciCecmLsWhog";
    return "";
  };

  // Get today's matches for stats
  const totalMatches = result
    ? result.totalSingleMatches + result.totalDoubleMatches
    : 0;
  const uniquePlayers = result
    ? new Set([
        ...result.cafeResults.map((r) => r.playerLose),
        ...result.cafeResults.map((r) => r.playerWin),
      ]).size
    : 0;

  // Find player with most losses (Kẻ 'bao' sân)
  const playerLosses = result
    ? result.cafeResults.reduce((acc, r) => {
        acc[r.playerLose] = (acc[r.playerLose] || 0) + r.amount;
        return acc;
      }, {} as Record<string, number>)
    : {};
  const topLoser = Object.entries(playerLosses).sort(
    ([, a], [, b]) => b - a
  )[0];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark overflow-y-auto">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden max-w-[430px] mx-auto shadow-2xl border-x border-primary/10 bg-background-light dark:bg-background-dark">
        {/* TopAppBar */}
        <div className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between">
          <button
            onClick={onClose}
            className="text-primary flex size-12 shrink-0 items-center justify-start"
          >
            <span className="material-symbols-outlined cursor-pointer">
              arrow_back_ios
            </span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            🤖 AI Tính Toán Cà Phê
          </h2>
          <div className="flex w-12 items-center justify-end">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-primary gap-2 text-base font-bold leading-normal p-0">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-text-secondary">Đang tính toán...</p>
          </div>
        ) : result ? (
          <>
            {/* Session Summary Card */}
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl bg-primary/10 p-4 border border-primary/20 shadow-lg">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                    Pickleball Club Sài Gòn
                  </p>
                  <p className="text-slate-500 dark:text-[#a2b2b3] text-sm font-normal leading-normal">
                    {formatDateWithWeek(new Date(result.date))} • {totalMatches}{" "}
                    Trận • {uniquePlayers} Thành viên
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Section */}
            {topLoser && (
              <div className="px-4 py-2">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <div className="min-w-[160px] flex flex-col gap-2 p-3 rounded-xl bg-white dark:bg-[#1e2424] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-sm">
                        sentiment_dissatisfied
                      </span>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
                        Kẻ &apos;bao&apos; sân
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-8 rounded-full bg-cover bg-center border border-primary/50"
                        style={{
                          backgroundImage: `url('${getPlayerAvatar(
                            topLoser[0]
                          )}')`,
                        }}
                      ></div>
                      <p className="text-sm font-bold truncate">
                        {getPlayerNickname(topLoser[0])}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section Header */}
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                Chi tiết chuyển ly ☕
              </h3>
              <span className="text-primary text-xs font-medium px-2 py-1 bg-primary/10 rounded-full">
                AI Đã tính toán
              </span>
            </div>

            {/* AI Transaction List */}
            <div className="flex flex-col gap-1 px-4 relative overflow-hidden">
              {result.cafeResults.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-[#1e2424] rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-text-secondary">
                    Không có kết quả cafe nào
                  </p>
                </div>
              ) : (
                result.cafeResults.map((item, index) => {
                  const loseAvatar = getPlayerAvatar(item.playerLose);
                  const winAvatar = getPlayerAvatar(item.playerWin);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-white dark:bg-[#1e2424] px-4 min-h-[80px] py-3 justify-between rounded-xl border border-slate-100 dark:border-slate-800 relative group overflow-hidden"
                    >
                      <div className="flex items-center gap-3 z-10">
                        <div className="flex -space-x-3 items-center">
                          {loseAvatar ? (
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border-2 border-background-dark"
                              style={{
                                backgroundImage: `url('${loseAvatar}')`,
                              }}
                            ></div>
                          ) : (
                            <div className="bg-primary/10 rounded-full h-12 w-12 border-2 border-background-dark flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {getPlayerNickname(item.playerLose).charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex size-6 items-center justify-center bg-primary rounded-full z-20 border-2 border-background-dark">
                            <span className="material-symbols-outlined text-white text-[14px]">
                              trending_flat
                            </span>
                          </div>
                          {winAvatar ? (
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border-2 border-background-dark"
                              style={{ backgroundImage: `url('${winAvatar}')` }}
                            ></div>
                          ) : (
                            <div className="bg-primary/10 rounded-full h-12 w-12 border-2 border-background-dark flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {getPlayerNickname(item.playerWin).charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-slate-900 dark:text-white text-sm font-bold leading-normal line-clamp-1">
                            {getPlayerNickname(item.playerLose)} →{" "}
                            {getPlayerNickname(item.playerWin)}
                          </p>
                          <p className="text-primary text-sm font-bold leading-normal">
                            {item.amount} ly cà phê ☕
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 z-10">
                        <span className="material-symbols-outlined text-success text-sm">
                          check_circle
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="h-[15px]" />

            {/* Action Buttons Container */}
            <div className="w-full left-0 right-0 max-w-[600px] mx-auto p-4 bg-[#ffffff] dark:bg-background-dark pt-10 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  className="w-full h-14 bg-primary text-slate-900 rounded-full font-bold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">verified</span>
                  Xác nhận & Lưu
                </button>
                <button
                  onClick={onRecalculate}
                  className="w-full h-14 bg-white/5 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 rounded-full font-bold text-base flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Tính lại
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-text-secondary">Không có kết quả</p>
          </div>
        )}
      </div>
    </div>
  );
}
