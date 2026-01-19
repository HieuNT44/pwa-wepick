"use client";

import usersData from "@/data/users-example.json";
import { useToast } from "@/hooks/use-toast";
import type { CafeCalculationResult } from "@/lib/utils/cafe-calculation";
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

  // Calculate total cafe cups to be exchanged
  const totalCafeCups = result
    ? result.cafeResults.reduce((sum, item) => sum + item.amount, 0)
    : 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark overflow-y-auto">
      <div className="relative flex h-auto w-full flex-col overflow-x-hidden max-w-[430px] mx-auto shadow-2xl border-x border-primary/10 bg-background-light dark:bg-background-dark">
        {/* TopAppBar */}
        <div className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="text-[#121717] dark:text-white flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-[#121717] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
            🤖 AI Phân Chia Cà Phê
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center  h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-text-secondary">Đang tính toán...</p>
          </div>
        ) : result ? (
          <>
            {/* Total Cafe Summary Card */}
            <div className="p-4">
              <div className="flex flex-col gap-2 rounded-2xl p-6 bg-primary/10 border border-primary/20">
                <p className="text-[#121717] dark:text-white/80 text-sm font-medium uppercase tracking-wider">
                  Tổng kết phiên hôm nay
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-[#121717] dark:text-white tracking-light text-4xl font-bold leading-tight">
                    {totalCafeCups} ☕
                  </p>
                  <div className="bg-primary text-white p-2 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">analytics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Header */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-[#121717] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Chi tiết phân chia
              </h3>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full uppercase">
                AI Optimized
              </span>
            </div>

            {/* Transaction List */}
            <div className="flex flex-col gap-3 px-4">
              {result.cafeResults.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[#668385] dark:text-gray-400">
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
                      className="flex items-center gap-3 bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* <div className="relative">
                          {loseAvatar ? (
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border-2 border-white dark:border-gray-700 shadow-sm"
                              style={{
                                backgroundImage: `url('${loseAvatar}')`,
                              }}
                            ></div>
                          ) : (
                            <div className="bg-primary/10 rounded-full h-12 w-12 border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {getPlayerNickname(item.playerLose).charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="absolute -bottom-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"></span>
                        </div> */}
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
                        {/* <div className="relative">
                          {winAvatar ? (
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border-2 border-white dark:border-gray-700 shadow-sm"
                              style={{ backgroundImage: `url('${winAvatar}')` }}
                            ></div>
                          ) : (
                            <div className="bg-primary/10 rounded-full h-12 w-12 border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {getPlayerNickname(item.playerWin).charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"></span>
                        </div> */}
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
            {/* Sticky Bottom Actions */}
            <div className="w-full px-4 py-4 ">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Xác nhận & Lưu
                </button>
                <button
                  onClick={onRecalculate}
                  className="w-full bg-white dark:bg-transparent border-2 border-primary text-primary font-bold py-4 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Tính sai rồi, tính lại đi!
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
