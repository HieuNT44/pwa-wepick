"use client";

import { BottomNavigation } from "@/components/bottom-navigation";
import { usePageView } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import type { CafeCalculationDocument } from "@/lib/firebase/cafe-calculations";
import { getAllCafeCalculations } from "@/lib/firebase/cafe-calculations";
import { getAllPlayers } from "@/lib/firebase/players";
import { getUserByEmail } from "@/lib/firebase/users";
import type { Player } from "@/types/player";
import type { User } from "@/types/user";
import { useEffect, useMemo, useState } from "react";

export default function HomeDashboard() {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cafeCalculation, setCafeCalculation] = useState<CafeCalculationDocument | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingCafe, setLoadingCafe] = useState(true);

  usePageView("Home Dashboard");

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

  // Load cafe calculation and players
  useEffect(() => {
    const loadCafeData = async () => {
      try {
        setLoadingCafe(true);
        const [calculations, playersData] = await Promise.all([
          getAllCafeCalculations().catch(() => []),
          getAllPlayers().catch(() => []),
        ]);

        // Get the most recent cafe calculation (first one after sorting)
        if (calculations.length > 0) {
          setCafeCalculation(calculations[0]);
        }

        setPlayers(playersData);
      } catch (error) {
        console.error("Error loading cafe calculation:", error);
      } finally {
        setLoadingCafe(false);
      }
    };

    loadCafeData();
  }, []);

  // Mock data for announcements
  const announcements = [
    {
      id: 1,
      icon: "campaign",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      title: "Giải đấu Nội bộ Tháng 11",
      description: "Đăng ký ngay để nhận ưu đãi áo thi đấu cực chất...",
    },
    {
      id: 2,
      icon: "celebration",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      title: "Tiệc mừng sinh nhật Club",
      description: "Cùng nâng ly chúc mừng WEPICK tròn 2 tuổi...",
    },
  ];

  // Mock data for match moments
  const matchMoments = [
    {
      id: 1,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDKmsweucrV0uMWKfi2cB4Tn1Ey9QXKodc-qHLIj1_SKJfI1Tf1C3jqFoLT72ID2jsOZ4plPavWM17tKpCWFXue2id1OyW_O8kfoSQxIfKNyB8hgLpwhhDH9q39MReivghsaQJpambf9xsc4worMrE5iNWyxYNQHsJJDwB0fUjX3AWAXff0T3XriG6e_3aFW-qBP0PMEkesDzI2shdhMExU9BIezuSvpIvBYer2sXFhmzmBqXlxQKXf_hyV76XeFsk0A99RlQ321w",
      tag: "#smash",
    },
    {
      id: 2,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuClmF4CX3ENVbKcoK8j1snk80Xq9iGRRXzv016p70VLtzJEMYFEmyw10ZRQg3drNoGqhOCrCRHveEAts_3hCdRRBAZLuml7TLbqmKtP9jI63UNUtIyko8bg90PL9-MU83LUdcwR8iv1DofoWHjBhJa13wxpD7-DYY0N6brde6jWQFvhP1bjnaVk3umjC0IypdfFx-X1byohLMvdbA3b0IUuHa4HvthBoPutsMRpijY7wsEH55xaJAH1NARJpoMbW0ciCecmLsWhog",
      tag: "#teamwork",
    },
    {
      id: 3,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA",
      tag: "#final",
    },
    {
      id: 4,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDKmsweucrV0uMWKfi2cB4Tn1Ey9QXKodc-qHLIj1_SKJfI1Tf1C3jqFoLT72ID2jsOZ4plPavWM17tKpCWFXue2id1OyW_O8kfoSQxIfKNyB8hgLpwhhDH9q39MReivghsaQJpambf9xsc4worMrE5iNWyxYNQHsJJDwB0fUjX3AWAXff0T3XriG6e_3aFW-qBP0PMEkesDzI2shdhMExU9BIezuSvpIvBYer2sXFhmzmBqXlxQKXf_hyV76XeFsk0A99RlQ321w",
      tag: "#pickleball",
    },
  ];


  // Avatar URLs for top winners (special avatars)
  const RANK_1_AVATAR_URL = "https://cafefcdn.com/203337114487263232/2024/2/28/trung-nguyen-2-6856-17091127224511649784676-1709120255902-1709120256250444824839.jpg";
  const RANK_2_AVATAR_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh7mO_xVocYUq5b0bvJHybiqMcj_JONZpBig&s";

  // Random avatar URLs for debtors
  const DEBTOR_AVATAR_URLS = [
    "data:image/jpeg;base64,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",
    "data:image/jpeg;base64,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"
    ,"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThW5o6UIW9tBYvE3F_QZvT6-JVjM8tZC5jDQ&s",
  ];

  // Helper function to get random debtor avatar
  const getRandomDebtorAvatar = (playerName: string): string | null => {
    // Use playerName as seed for consistent random selection
    const hash = playerName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % DEBTOR_AVATAR_URLS.length;
    return DEBTOR_AVATAR_URLS[index] || null;
  };

  // Helper function to get player info
  const getPlayerInfo = (playerName: string) => {
    const player = players.find((p) => p.name === playerName);
    return {
      name: player?.nickname || player?.name || playerName,
      avatar: player?.avatar || null,
    };
  };

  // Calculate total amount and categorize players
  const cafeData = useMemo(() => {
    if (!cafeCalculation?.result) {
      return {
        totalAmount: 0,
        winners: [],
        debtors: [],
        dueDate: null,
      };
    }

    const { cafeResults, date } = cafeCalculation.result;
    
    // Calculate total amount
    const totalAmount = cafeResults.reduce((sum, item) => sum + item.amount, 0);

    // Group by player (winners receive, debtors pay)
    const playerBalances: Record<string, number> = {};
    
    cafeResults.forEach((item) => {
      // Winner receives money (positive)
      playerBalances[item.playerWin] = (playerBalances[item.playerWin] || 0) + item.amount;
      // Loser pays money (negative)
      playerBalances[item.playerLose] = (playerBalances[item.playerLose] || 0) - item.amount;
    });

    // Helper function to get player info (defined inside useMemo to avoid dependency)
    const getPlayerInfoLocal = (playerName: string) => {
      const player = players.find((p) => p.name === playerName);
      return {
        name: player?.nickname || player?.name || playerName,
        avatar: player?.avatar || null,
      };
    };

    // Separate winners and debtors
    const winners = Object.entries(playerBalances)
      .filter(([_, balance]) => balance > 0)
      .map(([playerName, balance]) => {
        const playerInfo = getPlayerInfoLocal(playerName);
        return {
          playerName,
          displayName: playerInfo.name,
          avatar: playerInfo.avatar,
          amount: balance,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const debtors = Object.entries(playerBalances)
      .filter(([_, balance]) => balance < 0)
      .map(([playerName, balance]) => {
        const playerInfo = getPlayerInfoLocal(playerName);
        return {
          playerName,
          displayName: playerInfo.name,
          avatar: playerInfo.avatar,
          amount: Math.abs(balance),
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Calculate due date (7 days from createdAt)
    const createdAt = cafeCalculation.createdAt 
      ? new Date(cafeCalculation.createdAt)
      : new Date();
    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + 7);

    return {
      totalAmount,
      winners,
      debtors,
      dueDate,
      createdAt,
    };
  }, [cafeCalculation, players]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="Home flex flex-col w-full h-full border-x border-gray-100 relative bg-background-light text-text-main overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-40">
        {/* Hero Section */}
        <div className="relative h-64 w-full overflow-hidden">
          <img
            alt="Club Background"
            className="absolute inset-0 w-full h-full object-cover brightness-50"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg border-2 border-white/20">
                <span className="material-symbols-outlined text-white text-4xl font-bold">
                  sports_tennis
                </span>
              </div>
              <div>
                <h1 className="text-white text-2xl font-black leading-tight uppercase">
                  TOMOSIA PICKLEBALL CLUB
                </h1>
                <p className="text-primary font-medium text-sm">
                  Nhà cái Cafe đến từ Lê Đức Thọ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Court & Schedule Section */}
        <section className="mt-6 px-4">
          <h2 className="text-lg font-bold text-text-main mb-3">
            Lịch thi đấu kế tiếp
          </h2>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex gap-4">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">
                  location_on
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-text-main">
                  Sân Tennis C26
                </p>
                <p className="text-xs text-text-muted">
                  257 Nguyễn Văn Giáp, Cầu Giấy, Hà Nội
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">
                  schedule
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-text-main">
                  Thứ 6
                </p>
                <p className="text-xs text-text-muted">
                  Từ 18:00 đến 20:00 
                </p>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/place/S%C3%A2n+Tennis+C26/@21.025749,105.755583,12z/data=!4m10!1m2!2m1!1zc8OibiBwaWNrbGViYWxsIDI1NyBuZ3V54buFbiB2xINuIGdpw6Fw!3m6!1s0x3134559af0418603:0xe11e767a1d7a5f4a!8m2!3d21.025749!4d105.755583!15sCidzw6JuIHBpY2tsZWJhbGwgMjU3IG5ndXnhu4VuIHbEg24gZ2nDoXBaKSInc8OibiBwaWNrbGViYWxsIDI1NyBuZ3V54buFbiB2xINuIGdpw6FwkgEMdGVubmlzX2NvdXJ0mgFEQ2k5RFFVbFJRVU52WkVOb2RIbGpSamx2VDJ0U2NGVkljRTVUYkVwWldWVkpOV0pIUmxsYWJFSkVXbXc0TTA1RlJSQULgAQD6AQQIABAk!16s%2Fg%2F11p_45r2l4?entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-gray-50 border border-gray-100 rounded-2xl text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              Mở bản đồ
            </a>
          </div>
        </section>

        {/* Cafe Fund Section */}
        <section className="mt-8 px-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-br from-primary to-[#5ec8ce] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                    Cafe tuần vừa rồi
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <h3 className="text-3xl font-black">
                      {loadingCafe ? "..." : formatCurrency(cafeData.totalAmount)}
                    </h3>
                    <span className="text-sm font-bold opacity-80 uppercase">Cốc</span>
                  </div>
                  {cafeData.dueDate && (
                    <p className="text-[12px] opacity-80 mt-1 font-medium">
                      Hết hạn: {formatDate(cafeData.dueDate)}
                    </p>
                  )}
                </div>
                <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="material-symbols-outlined text-2xl text-white">
                    coffee
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-6">
              {/* Winners Section */}
              {cafeData.winners.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">☕</span>
                        <h4 className="text-sm font-bold text-text-main uppercase tracking-tight">
                          Vua Café
                        </h4>
                      </div>
                    <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                      + Cafe / Bánh Mì
                    </span>
                  </div>
                  <div className="space-y-4">
                    {cafeData.winners.map((winner, index) => {
                      // Use special avatar for rank 1 or 2 if available, otherwise use player avatar or fallback
                      let avatarUrl: string | null = null;
                      if (index === 0 && RANK_1_AVATAR_URL) {
                        avatarUrl = RANK_1_AVATAR_URL;
                      } else if (index === 1 && RANK_2_AVATAR_URL) {
                        avatarUrl = RANK_2_AVATAR_URL;
                      } else {
                        avatarUrl = winner.avatar || null;
                      }
                      
                      return (
                      <div key={winner.playerName} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {avatarUrl ? (
                              <img
                                className={`size-10 rounded-full border-2 ${
                                  index === 0
                                    ? "border-yellow-400"
                                    : "border-gray-200"
                                } object-cover`}
                                src={avatarUrl}
                                alt={winner.displayName}
                              />
                            ) : (
                              <div
                                className={`size-10 rounded-full border-2 ${
                                  index === 0
                                    ? "border-yellow-400 bg-primary/10"
                                    : "border-gray-200 bg-gray-100"
                                } flex items-center justify-center`}
                              >
                                
                                <span className="text-primary font-bold text-sm">
                                  {winner.displayName.charAt(0)}
                                </span>
                              </div>
                            )}
                            {index < 3 && (
                              <div
                                className={`absolute -bottom-1 -right-1 size-5 ${
                                  index === 0
                                    ? "bg-yellow-400"
                                    : index === 1
                                    ? "bg-gray-300"
                                    : "bg-orange-300"
                                } rounded-full flex items-center justify-center border-2 border-white text-[10px] font-bold`}
                              >
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-main">
                              {winner.displayName}
                            </p>
                            <p className="text-[10px] text-text-secondary">
                              {index === 0
                                ? 'Đặng Lê Nguyên ' + winner.displayName.split(' ')[0] || winner.displayName
                                : "Chưa Tày Đâu"}
                            </p>
                          </div>
                        </div>
                        <span className="text-base font-black text-green-600">
                          +{formatCurrency(winner.amount)}
                        </span>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Divider */}
              {cafeData.winners.length > 0 && cafeData.debtors.length > 0 && (
                <div className="relative py-2">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center"
                  >
                    <div className="w-full border-t border-dashed border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                      Tổng Bill
                    </span>
                  </div>
                </div>
              )}

              {/* Debtors Section */}
              {cafeData.debtors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-text-main">
                        payments
                      </span>
                      <h4 className="text-sm font-bold text-text-main uppercase tracking-tight">
                        Như Muối Bỏ Biển
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      -  Cafe / Bánh Mì
                    </span>
                  </div>
                  <div className="space-y-4">
                    {cafeData.debtors.map((debtor) => {
                      // Use random avatar from list if player doesn't have avatar
                      const avatarUrl = debtor.avatar || getRandomDebtorAvatar(debtor.playerName);
                      
                      return (
                        <div
                          key={debtor.playerName}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img
                                className="size-10 rounded-full border-2 border-red-100 object-cover"
                                src={avatarUrl}
                                alt={debtor.displayName}
                              />
                            ) : (
                              <div className="size-10 rounded-full border-2 border-red-100 bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 font-bold text-sm">
                                  {debtor.displayName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-text-main">
                                {debtor.displayName}
                              </p>
                              <p className="text-[10px] text-red-400">
                                {cafeData.dueDate &&
                                new Date() > cafeData.dueDate
                                  ? "Đã quá hạn"
                                  : "Cần thanh toán"}
                              </p>
                            </div>
                          </div>
                          <span className="text-base font-black text-red-500">
                            -{formatCurrency(debtor.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loadingCafe &&
                cafeData.winners.length === 0 &&
                cafeData.debtors.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-text-muted text-sm">
                      Chưa có dữ liệu cafe tuần vừa rồi
                    </p>
                  </div>
                )}

              {/* Transaction List - Who pays who */}
              {cafeCalculation?.result?.cafeResults && cafeCalculation.result.cafeResults.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="text-xs font-bold text-text-main uppercase tracking-wider mb-3">
                    Chi tiết thanh toán
                  </h5>
                  <div className="space-y-3">
                    {cafeCalculation.result.cafeResults.map((transaction, index) => {
                      const payerInfo = getPlayerInfo(transaction.playerLose);
                      const receiverInfo = getPlayerInfo(transaction.playerWin);
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Payer Avatar */}
                            <div className="relative shrink-0">
                              {payerInfo.avatar ? (
                                <img
                                  className="size-8 rounded-full border-2 border-red-100 object-cover"
                                  src={payerInfo.avatar}
                                  alt={payerInfo.name}
                                />
                              ) : (
                                <div className="size-8 rounded-full border-2 border-red-100 bg-gray-100 flex items-center justify-center">
                                  <span className="text-gray-400 font-bold text-xs">
                                    {payerInfo.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Transaction Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-text-main truncate">
                                  {payerInfo.name}
                                </span>
                                <span className="material-symbols-outlined text-sm text-gray-400">
                                  arrow_forward
                                </span>
                                <span className="text-xs font-bold text-primary truncate">
                                  {receiverInfo.name}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Amount */}
                          <div className="shrink-0 ml-3">
                            <span className="text-sm font-black text-red-500">
                              {formatCurrency(transaction.amount)}
                            </span>
                            <span className="text-[10px] text-text-muted ml-1">Cốc</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {(!cafeCalculation?.result?.cafeResults || cafeCalculation.result.cafeResults.length === 0) && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-text-muted">
                    Chưa có giao dịch thanh toán
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* <section className="mt-8 px-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-primary to-[#5ec8ce] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    Quỹ Cà Phê Nhóm
                  </p>
                  <h3 className="text-2xl font-black mt-1">2.450.000đ</h3>
                </div>
                <span className="material-symbols-outlined text-3xl opacity-50">
                  payments
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-text-main">
                  Chờ tiếp tế (Top Nợ 🍖)
                </span>
                <span className="text-[10px] text-text-muted font-medium italic">
                  Mau nộp quỹ đi các đại gia!
                </span>
              </div>
              <div className="space-y-3">
                {debtList.map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {debt.avatar ? (
                        <img
                          className="size-8 rounded-full object-cover"
                          src={debt.avatar}
                          alt={debt.name}
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined text-sm">
                            person
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium">{debt.name}</span>
                    </div>
                    <span className="text-sm font-black text-red-500">
                      {debt.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section> */}

        {/* Announcements Section */}
        {/* <section className="mt-8 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-text-main">Thông báo mới</h2>
            <span className="text-xs font-semibold text-primary cursor-pointer">
              Xem tất cả
            </span>
          </div>
          <div className="flex overflow-x-auto gap-4 -mx-4 px-4 scrollbar-hide">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="min-w-[280px] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4"
              >
                <div
                  className={`size-12 rounded-xl ${announcement.iconBg} flex items-center justify-center shrink-0`}
                >
                  <span
                    className={`material-symbols-outlined ${announcement.iconColor}`}
                  >
                    {announcement.icon}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm text-text-main line-clamp-1">
                    {announcement.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">
                    {announcement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section> */}

        {/* Club Activities Section */}
        {/* <section className="mt-8 px-4">
          <h2 className="text-lg font-bold text-text-main mb-3">
            Hoạt động Club
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-5 rounded-3xl border border-primary/20">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                Tổng trận đấu
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-text-main">1,248</span>
                <span className="text-[10px] text-text-muted font-medium">
                  trận
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-green-600 font-bold">
                <span className="material-symbols-outlined text-xs">
                  trending_up
                </span>
                <span>+12% tuần này</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                Đang online
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-text-main">12</span>
                <span className="text-[10px] text-text-muted font-medium">
                  thành viên
                </span>
              </div>
              <div className="mt-3 flex -space-x-2">
                {onlineMembers.map((avatar, idx) => (
                  <img
                    key={idx}
                    className="size-6 rounded-full border-2 border-white object-cover"
                    src={avatar}
                    alt={`Online member ${idx + 1}`}
                  />
                ))}
                <div className="size-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-text-muted">
                  +9
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* Match Moments Section */}
        <section className="mt-8 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-text-main">
              Khoảnh khắc sân đấu
            </h2>
            <span className="text-xs font-semibold text-primary cursor-pointer">
              Thư viện
            </span>
          </div>
          <div className="flex overflow-x-auto gap-3 -mx-4 px-4 scrollbar-hide">
            {matchMoments.map((moment) => (
              <div
                key={moment.id}
                className="min-w-[160px] h-48 rounded-2xl overflow-hidden relative shadow-sm border border-gray-100 shrink-0"
              >
                <img
                  alt={`Match Moment ${moment.id}`}
                  className="w-full h-full object-cover"
                  src={moment.image}
                />
                <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-white">
                  {moment.tag}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
